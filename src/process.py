"""Turn each tilawa deck into: slide images, per-slide audio, download parts, and a manifest."""
import zipfile, re, json, os, subprocess, glob, shutil
OUT = '/home/claude/asli/tl'
AR = '٠١٢٣٤٥٦٧٨٩'
def ar2int(s):
    return int(''.join(str(AR.index(c)) if c in AR else c for c in s))
GRADES = {'السادس': 6, 'السابع': 7, 'الثامن': 8, 'التاسع': 9}
PART = 14 * 1024 * 1024
man = []
for i in range(1, 9):
    src = f'/home/claude/ppt/f{i}.pptx'
    z = zipfile.ZipFile(src)
    n = len([x for x in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$', x)])
    t1 = ' '.join(re.sub('<[^>]+>', ' ', z.read('ppt/slides/slide1.xml').decode()).split())
    g = next(v for k, v in GRADES.items() if 'الصف ' + k in t1)
    sura = re.search(r'سورة (\S+)', t1).group(1)
    rng = re.search(r'الدروس (\S+) – (\S+)', t1)
    a, b = ar2int(rng.group(1)), ar2int(rng.group(2))
    did = f'g{g}-{a}'
    d = os.path.join(OUT, did); os.makedirs(d, exist_ok=True)
    # lessons: title slides "N الدرس ... سورة/..." with few words
    lessons = []; audio = {}
    for k in range(1, n + 1):
        x = z.read(f'ppt/slides/slide{k}.xml').decode()
        t = ' '.join(re.sub('<[^>]+>', ' ', x).split())
        m = re.match(r'^(\S+) الدرس (\S+) (.*)$', t)
        if m and len(t.split()) <= 9 and m.group(1)[0] in AR:
            lessons.append({'n': ar2int(m.group(1)), 'title': m.group(3), 'from': k})
        rels = dict(re.findall(r'Id="(\w+)"[^>]*Target="([^"]+)"', z.read(f'ppt/slides/_rels/slide{k}.xml.rels').decode()))
        clips = []
        for pm in re.finditer(r'<p:pic>.*?</p:pic>', x, re.S):
            s = pm.group(0)
            ids = re.findall(r'r:(?:link|embed)="(\w+)"', s)
            mp3 = [rels[r] for r in ids if rels.get(r, '').endswith('.mp3')]
            if not mp3: continue
            name = re.search(r'name="([^"]*)"', s).group(1)
            fn = os.path.basename(mp3[0])
            data = z.read('ppt/media/' + fn)
            out = f'a{k:02d}-{len(clips)+1}.mp3'
            open(os.path.join(d, out), 'wb').write(data)
            clips.append([name, out])
        if clips: audio[k] = clips
    for j, L in enumerate(lessons):
        L['to'] = (lessons[j + 1]['from'] - 1) if j + 1 < len(lessons) else n
    # slide images
    pdf = f'/home/claude/ppt/pdf/f{i}.pdf'
    for f in glob.glob(os.path.join(d, 's-*.jpg')): os.remove(f)
    subprocess.run(['pdftoppm', '-scale-to-x', '1100', '-scale-to-y', '-1', '-jpeg', '-jpegopt', 'quality=72', pdf, os.path.join(d, 's')], check=True)
    for f in glob.glob(os.path.join(d, 's-*.jpg')):
        num = int(re.search(r's-(\d+)\.jpg', f).group(1)); os.rename(f, os.path.join(d, f's{num:02d}.jpg'))
    # download parts
    data = open(src, 'rb').read(); parts = []
    for p in range(0, len(data), PART):
        pn = f'p{len(parts)+1}.bin'; open(os.path.join(d, pn), 'wb').write(data[p:p + PART]); parts.append(pn)
    man.append({'id': did, 'g': g, 'sura': sura, 'from': a, 'to': b, 'n': n, 'lessons': lessons,
                'audio': audio, 'parts': parts, 'size': len(data),
                'file': f'تلاوة سورة {sura} - الدروس {a}-{b}.pptx'})
    print(did, n, 'slides', [(L['n'], L['from'], L['to']) for L in lessons], 'audio slides', len(audio), 'parts', len(parts))
json.dump(man, open('/home/claude/ppt/decks.json', 'w', encoding='utf-8'), ensure_ascii=False)
