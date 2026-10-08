"""Add one grade's Islamic-education lesson decks: python3 add_grade.py <grade> <map.json>
map.json = {"1": "/path/deck.pptx", ...} keyed by lesson number in DARS order."""
import sys, json, os, glob, re, shutil, subprocess
sys.path.insert(0, '/mnt/skills/public/pptx/scripts')
from office.soffice import run_soffice
from PIL import Image
g = int(sys.argv[1]); mp = json.load(open(sys.argv[2], encoding='utf-8'))
work = f'/home/claude/dppt/g{g}'; os.makedirs(work + '/pdf', exist_ok=True)
for n, src in mp.items():
    shutil.copy(src, f'{work}/{n}.pptx')
r = run_soffice(['--headless', '--convert-to', 'pdf', '--outdir', work + '/pdf'] + [f'{work}/{n}.pptx' for n in mp], capture_output=True, text=True, timeout=1800)
W = 960
man = [x for x in json.load(open('/home/claude/dppt/ddecks.json')) if x['g'] != g]
for n in sorted(mp, key=int):
    did = f'd{g}-{n}'; d = f'/home/claude/asli/tl/{did}'; os.makedirs(d, exist_ok=True)
    for f in glob.glob(d + '/*'): os.remove(f)
    tmp = f'{work}/img{n}'; os.makedirs(tmp, exist_ok=True)
    for f in glob.glob(tmp + '/*'): os.remove(f)
    subprocess.run(['pdftoppm', '-scale-to-x', '1100', '-scale-to-y', '-1', '-jpeg', '-jpegopt', 'quality=72', f'{work}/pdf/{n}.pdf', tmp + '/s'], check=True)
    fs = sorted(glob.glob(tmp + '/s-*.jpg'), key=lambda f: int(re.search(r's-(\d+)', f).group(1)))
    ims = [Image.open(f).convert('RGB') for f in fs]
    ims[0].save(d + '/L.pdf', save_all=True, append_images=ims[1:], resolution=110)
    h = round(ims[0].height * W / ims[0].width)
    S = Image.new('RGB', (W, h * len(ims)), 'white')
    for i, im in enumerate(ims): S.paste(im.resize((W, h), Image.LANCZOS), (0, i * h))
    S.save(d + '/L.jpg', quality=70, optimize=True, progressive=True)
    man.append({'id': did, 'g': g, 'n': int(n), 'slides': len(ims), 'h': h})
    print(did, len(ims), 'slides', S.height)
json.dump(man, open('/home/claude/dppt/ddecks.json', 'w'), ensure_ascii=False)
print(json.dumps([f'tl/d{g}-{n}/{f}' for n in sorted(mp, key=int) for f in ('L.jpg', 'L.pdf')]))
