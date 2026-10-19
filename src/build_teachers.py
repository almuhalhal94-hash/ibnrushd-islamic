"""Build the teachers-only page mualim/index.html (password-protected, PBKDF2-SHA256 -> AES-GCM).
Reads the plans (PLAN, DARS) and the department's own works, and places every work under its week in the plan.
The ministry digital-content decks (tl/d*) are deliberately left out: department works only.
Usage: python3 src/build_teachers.py PASSWORD   (or env TEACHERS_PW)
Runs automatically on every push via .github/workflows/teachers.yml.
"""
import base64, hashlib, json, os, subprocess, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ITER = 250000
DRIVE = 'https://drive.google.com/drive/folders/14tNTXswGKVuE-0Qs2pG58jRIYqdItl9e'

js = r'''
const s=require("fs").readFileSync(process.argv[1],"utf8");
function grab(v){const i=s.indexOf("var "+v+"=");let j=i+v.length+5,d=0,k=j;for(;k<s.length;k++){const c=s[k];if(c=="{"||c=="[")d++;else if(c=="}"||c=="]"){d--;if(d==0)break}}return eval("("+s.slice(j,k+1)+")")}
console.log(JSON.stringify({D:grab("DARS"),P:grab("PLAN"),DK:grab("DECKS")}));
'''
src = json.loads(subprocess.check_output(['node', '-e', js, os.path.join(ROOT, 'index.html')]))
teachers = json.load(open(os.path.join(ROOT, 'src/teachers.json'), encoding='utf-8'))


def ex(p):
    return os.path.exists(os.path.join(ROOT, p))


def pages(jpg, h):
    """number of slides/pages in a vertical strip image"""
    if not ex(jpg):
        return 0
    w, H = Image.open(os.path.join(ROOT, jpg)).size
    return max(1, round(H / (h * w / 960)))


def ls(d, ext):
    p = os.path.join(ROOT, d)
    return sorted(f for f in os.listdir(p) if f.endswith(ext)) if os.path.isdir(p) else []


# a work: {t: title, k: kind (deck|doc|video|img|link|claude), u: url, s: strip jpg, n: pages, h: page height, c: cover}
def deck(t, pdf, jpg, h=540, cover=None):
    return {'t': t, 'k': 'deck', 'u': '../' + pdf, 's': '../' + jpg if ex(jpg) else None,
            'n': pages(jpg, h), 'h': h, 'c': cover}


def doc(t, pdf, jpg, h=1358):
    return {'t': t, 'k': 'doc', 'u': '../' + pdf, 's': '../' + jpg if ex(jpg) else None, 'n': pages(jpg, h), 'h': h}


def claude(t, u):
    return {'t': t, 'k': 'claude', 'u': u}


# extra works placed by grade + DARS lesson number (1-based)
EXTRA_LESSON = {
    (8, 6): [claude('خطة نموذجية (حصتان)', 'https://claude.ai/artifact/RYbrKJn9eKZzS4wESmJSuG')],
    (8, 7): [claude('درس نموذجي', 'https://claude.ai/artifact/1fxHaihscPryfUASQe8tWE')],
}
EXTRA_GRADE = {
    9: [claude('شرح مذكرة الفقه الشافعي', 'https://claude.ai/artifact/9bS8q7mXZhmRwzNvbM2P5G')],
}
# مساهمات المعلمين في ملف الإنجاز (تُراجع مع كل معلم). {n} تُستبدل بالعدد الحي داخل الصفحة.
CONTRIB = {
    'أ. طلال سعود المهلهل': [
        ['التحول الرقمي', 'إعداد موقع قسم التربية الإسلامية كتطبيق على الجوال لجميع الصفوف، مع شاشة البهو ومساحة المعلمين.'],
        ['الموارد التعليمية', 'إعداد عروض التلاوة التفاعلية لجميع الصفوف ({decks} عرضًا) بأصوات خمسة قرّاء، مع خطط دروسها.'],
        ['التقويم والمراجعة', 'إعداد المذكرة التوأم المحلولة ومذكرات مراجعة الاختبار الأول وإجاباته لجميع الصفوف ({docs} ملفًا).'],
        ['الإعلام التربوي', 'إعداد مجلة التربية الإسلامية الشهرية ({mag} أعداد) وملف التلاوة الحي لتوثيق أنشطة القسم.'],
        ['القرآن الكريم', 'المشاركة في تنظيم مسابقة مزمار داود وتوثيقها وتحكيمها، ومتابعة مركز واحات القرآن الكريم.'],
        ['الشراكة المجتمعية', 'نظام عرض الدرجات لأولياء الأمور بخصوصية تامة، ونموذج التواصل وآراء الزوار.'],
        ['التعلم باللعب', 'ألعاب تعليمية على الموقع: «سُلّم المعرفة» و«تحدّي النور» من أسئلة المذكرة.'],
    ],
}
VID = {'adhan': 'الأذان', 'aaraf': 'سورة الأعراف', 'miz2': 'مزمار داود · الجولة الثانية', 'tilawat': 'من تلاوات طلابنا'}

grades = {}
for g in ('6', '7', '8', '9'):
    gi = int(g)
    items = []
    for i, (unit, title, wk, pg) in enumerate(src['D'][g], 1):
        items.append({'k': 'd', 'u': unit, 't': title, 'w': wk, 'pg': pg, 'n': i, 'x': list(EXTRA_LESSON.get((gi, i), []))})
    decks = [d for d in src['DK'] if d['g'] == gi]
    for i, row in enumerate(src['P'][g], 1):
        title, ayat, wk, pg = row[0], row[1], row[2], row[3]
        x = []
        for d in decks:
            if d['from'] <= i <= d['to'] and ex(f"tl/{d['id']}/L{i}.pdf"):
                x.append(deck('عرض التلاوة', f"tl/{d['id']}/L{i}.pdf", f"tl/{d['id']}/L{i}.jpg",
                              cover=f"../tl/{d['id']}/cover.jpg" if ex(f"tl/{d['id']}/cover.jpg") else None))
        items.append({'k': 't', 'u': 'التلاوة والتجويد', 't': title, 'ay': ayat, 'w': wk, 'pg': pg, 'n': i, 'x': x})
    gen = []
    if ex(f'tl/ans/a{g}.pdf'): gen.append(doc('المذكرة التوأم محلولة', f'tl/ans/a{g}.pdf', f'tl/ans/a{g}.jpg'))
    if ex(f'tl/ans/e{g}.pdf'): gen.append(doc('إجابات الاختبار الأول', f'tl/ans/e{g}.pdf', f'tl/ans/e{g}.jpg'))
    if ex(f'tl/rev/r{g}.pdf'): gen.append(doc('مذكرة مراجعة الاختبار الأول', f'tl/rev/r{g}.pdf', f'tl/rev/r{g}.jpg'))
    gen += EXTRA_GRADE.get(gi, [])
    covers = [f"../tl/{d['id']}/cover.jpg" for d in sorted(decks, key=lambda d: d['from']) if ex(f"tl/{d['id']}/cover.jpg")]
    sura = decks[0]['sura'] if decks else ''
    suras = []
    for d in sorted(decks, key=lambda d: d['from']):
        if d['sura'] not in suras: suras.append(d['sura'])
    grades[g] = {'items': items, 'gen': gen, 'cover': covers[0] if covers else None, 'sura': '، '.join(suras),
                 'tch': [t['name'] for t in teachers if any(c[0] == gi for c in t['cls'])],
                 'poster': f'../img/m{g}.jpg' if ex(f'img/m{g}.jpg') else None}

lib = {
    'vid': [{'t': VID.get(f[:-4], f[:-4]), 'k': 'video', 'u': '../vid/' + f,
             'c': '../vid/' + f[:-4] + '.jpg' if ex('vid/' + f[:-4] + '.jpg') else None} for f in ls('vid', '.mp4')],
    'mag': ['../img/mag/' + f for f in ls('img/mag', '.jpg')],
    'miz': ['../img/miz/' + f for f in ls('img/miz', '.jpg')],
    'posters': [grades[g]['poster'] for g in grades if grades[g]['poster']],
    'pride': ['../img/pride/' + f for f in ls('img/pride', '.jpg')],
    'claude': [claude('مجلة التربية الإسلامية', 'https://claude.ai/artifact/2BfBLNBwEaxDVMTJMAEQut')],
    'links': [{'t': 'ملف التلاوة', 'u': '../tilawa-file.html'}, {'t': 'موقع القسم العام', 'u': '../'},
              {'t': 'شاشة البهو', 'u': '../lobby/'}, {'t': 'مجلد القسم في Google Drive', 'u': DRIVE}],
}

payload = json.dumps({'g': grades, 'lib': lib, 'drive': DRIVE, 'tch': teachers, 'contrib': CONTRIB}, ensure_ascii=False, separators=(',', ':'))
pw = sys.argv[1] if len(sys.argv) > 1 else os.environ['TEACHERS_PW']
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
salt, iv = os.urandom(16), os.urandom(12)
k = hashlib.pbkdf2_hmac('sha256', pw.encode(), salt, ITER, 32)
ct = AESGCM(k).encrypt(iv, payload.encode(), None)
b = lambda x: base64.b64encode(x).decode()
blob = json.dumps({'i': ITER, 's': b(salt), 'v': b(iv), 'c': b(ct)})

tpl = open(os.path.join(ROOT, 'src/teachers_template.html'), encoding='utf-8').read()
os.makedirs(os.path.join(ROOT, 'mualim'), exist_ok=True)
open(os.path.join(ROOT, 'mualim/index.html'), 'w', encoding='utf-8').write(tpl.replace('/*BLOB*/null', blob))
n = sum(len(i['x']) for gg in grades.values() for i in gg['items']) + sum(len(gg['gen']) for gg in grades.values())
print('ok', n, 'works +', len(lib['vid']), 'videos,', len(lib['mag']), 'magazine pages')
