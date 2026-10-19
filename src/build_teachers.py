"""Build the teachers-only page mualim/index.html (password-protected, PBKDF2-SHA256 -> AES-GCM).
Reads the plans (PLAN, DARS) and decks from index.html and links every work to its week in the plan.
Usage: python3 src/build_teachers.py PASSWORD   (or env TEACHERS_PW)
Runs automatically on every push via .github/workflows/teachers.yml.
"""
import base64, hashlib, json, os, subprocess, sys

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

# extra works placed by grade + lesson number (DARS index, 1-based)
EXTRA_LESSON = {
    (8, 6): [['خطة نموذجية (حصتان) · صفحة Claude', 'https://claude.ai/artifact/RYbrKJn9eKZzS4wESmJSuG', 'c']],
    (8, 7): [['درس نموذجي · صفحة Claude', 'https://claude.ai/artifact/1fxHaihscPryfUASQe8tWE', 'c']],
}
EXTRA_GRADE = {
    9: [['شرح مذكرة الفقه الشافعي · صفحة Claude', 'https://claude.ai/artifact/9bS8q7mXZhmRwzNvbM2P5G', 'c']],
}

VID = {'adhan': 'الأذان', 'aaraf': 'سورة الأعراف', 'miz2': 'مزمار داود · الجولة الثانية', 'tilawat': 'من تلاوات طلابنا'}

grades = {}
for g in ('6', '7', '8', '9'):
    gi = int(g)
    items = []
    for i, (unit, title, wk, pages) in enumerate(src['D'][g], 1):
        # عروض tl/d* من المحتوى الرقمي للوزارة: لا تُضاف، فقط أعمال القسم
        w = list(EXTRA_LESSON.get((gi, i), []))
        items.append({'k': 'd', 'u': unit, 't': title, 'w': wk, 'pg': pages, 'n': i, 'x': w})
    # tilawa lesson n lives in the deck whose range covers it
    for i, row in enumerate(src['P'][g], 1):
        title, ayat, wk, pages = row[0], row[1], row[2], row[3]
        w = []
        for d in src['DK']:
            if d['g'] == gi and d['from'] <= i <= d['to']:
                p = f"tl/{d['id']}/L{i}.pdf"
                if ex(p): w.append(['عرض التلاوة', '../' + p, 'p'])
        items.append({'k': 't', 'u': 'التلاوة والتجويد', 't': title + (f' (الآيات {ayat})' if ayat else ''),
                      'w': wk, 'pg': pages, 'n': i, 'x': w})
    gen = [
        ['نموذج الإجابة', f'../tl/ans/a{g}.pdf', 'p'],
        ['اختبار التسميع', f'../tl/ans/e{g}.pdf', 'p'],
        ['مذكرة المراجعة', f'../tl/rev/r{g}.pdf', 'p'],
    ] + EXTRA_GRADE.get(gi, [])
    tch = [t['name'] for t in teachers if any(c[0] == gi for c in t['cls'])]
    grades[g] = {'items': items, 'gen': [x for x in gen if x[2] != 'p' or ex(x[1][3:])], 'tch': tch}

common = [
    {'h': 'الفيديوهات', 'x': [[VID.get(f[:-4], f[:-4]), '../vid/' + f, 'v']
                              for f in sorted(os.listdir(os.path.join(ROOT, 'vid'))) if f.endswith('.mp4')]},
    {'h': 'المسابقات والإنجازات', 'x': [
        ['ملف التلاوة كامل', '../tilawa-file.html', 'l'], ['مسابقة مزمار داود', '../tilawa-file.html#mizmar', 'l'],
        ['تيجان التلاوة', '../tilawa-file.html#crowns', 'l'], ['فرسان التلاوة', '../tilawa-file.html#fursan', 'l'],
        ['أصوات طلابنا', '../tilawa-file.html#voices', 'l'], ['لوحات فخرنا', '../img/pride/all.jpg', 'i']]},
    {'h': 'التوثيق والفعاليات', 'x': [
        ['مجلة التربية الإسلامية', 'https://claude.ai/artifact/2BfBLNBwEaxDVMTJMAEQut', 'c']] +
        [[f'صفحة المجلة {int(f[:-4]) if f[:-4].isdigit() else f[:-4]}', '../img/mag/' + f, 'i']
         for f in sorted(os.listdir(os.path.join(ROOT, 'img/mag'))) if f.endswith('.jpg')]},
    {'h': 'مواقعنا', 'x': [
        ['موقع القسم (العام)', '../', 'l'], ['شاشة البهو', '../lobby/', 'l'],
        ['مجلد القسم في Google Drive', DRIVE, 'l']]},
]

payload = json.dumps({'g': grades, 'c': common, 'drive': DRIVE}, ensure_ascii=False, separators=(',', ':'))
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
n = sum(len(x['x']) for gg in grades.values() for x in gg['items']) + sum(len(gg['gen']) for gg in grades.values()) + sum(len(c['x']) for c in common)
print('ok', n, 'links')
