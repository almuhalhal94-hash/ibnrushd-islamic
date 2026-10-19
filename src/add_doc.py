"""Add a documentation PDF to the teachers' achievement file (open access).
Usage: python3 src/add_doc.py META.json file.pdf
META.json = {"id","t","sub","date":"YYYY-MM-DD","sec":"quran|mag|digital","who":[...],"kv":[[k,v],...]}
Writes mualim/d/<id>.pdf + <id>-1.jpg… and upserts the entry in src/tawthiq.json (same id = replaced). Then run build_teachers.py or just push (the Action rebuilds).
"""
import glob, json, os, shutil, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
meta, pdf = json.load(open(sys.argv[1], encoding='utf-8')), sys.argv[2]
did = meta['id']; D = os.path.join(ROOT, 'mualim/d'); os.makedirs(D, exist_ok=True)
for f in glob.glob(os.path.join(D, f'{did}-*.jpg')): os.remove(f)
shutil.copy(pdf, os.path.join(D, f'{did}.pdf'))
with tempfile.TemporaryDirectory() as td:
    subprocess.check_call(['pdftoppm', '-r', '130', '-jpeg', '-jpegopt', 'quality=78', pdf, os.path.join(td, 'p')])
    pages = sorted(glob.glob(os.path.join(td, 'p*.jpg')))
    for i, f in enumerate(pages, 1): shutil.copy(f, os.path.join(D, f'{did}-{i}.jpg'))
meta['n'] = len(pages)
P = os.path.join(ROOT, 'src/tawthiq.json')
L = [m for m in json.load(open(P, encoding='utf-8')) if m['id'] != did] + [meta]
L.sort(key=lambda m: m.get('date', ''))
json.dump(L, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', did, len(pages), 'pages')
