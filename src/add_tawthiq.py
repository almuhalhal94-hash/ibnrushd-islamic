"""Encrypt a documentation PDF (and its page images) into mualim/t/ for the teachers' area.
Files are encrypted with a stable file key (data/fk.enc, itself sealed with the teachers' password),
so they stay private on the public repo. Metadata goes in src/tawthiq.json.
Usage: python3 src/add_tawthiq.py PASSWORD ID file.pdf
"""
import base64, glob, hashlib, json, os, subprocess, sys, tempfile
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ITER = 250000


def file_key(pw):
    p = os.path.join(ROOT, 'data/fk.enc')
    if os.path.exists(p):
        d = json.load(open(p))
        k = hashlib.pbkdf2_hmac('sha256', pw.encode(), base64.b64decode(d['s']), ITER, 32)
        return AESGCM(k).decrypt(base64.b64decode(d['v']), base64.b64decode(d['c']), None)
    fk, salt, iv = os.urandom(32), os.urandom(16), os.urandom(12)
    k = hashlib.pbkdf2_hmac('sha256', pw.encode(), salt, ITER, 32)
    b = lambda x: base64.b64encode(x).decode()
    json.dump({'s': b(salt), 'v': b(iv), 'c': b(AESGCM(k).encrypt(iv, fk, None))}, open(p, 'w'))
    return fk


def seal(fk, data, out):
    iv = os.urandom(12)
    open(out, 'wb').write(iv + AESGCM(fk).encrypt(iv, data, None))


if __name__ == '__main__':
    pw, did, pdf = sys.argv[1:4]
    fk = file_key(pw)
    os.makedirs(os.path.join(ROOT, 'mualim/t'), exist_ok=True)
    for f in glob.glob(os.path.join(ROOT, f'mualim/t/{did}-*.enc')): os.remove(f)
    seal(fk, open(pdf, 'rb').read(), os.path.join(ROOT, f'mualim/t/{did}.pdf.enc'))
    with tempfile.TemporaryDirectory() as td:
        subprocess.check_call(['pdftoppm', '-r', '130', '-jpeg', '-jpegopt', 'quality=78', pdf, os.path.join(td, 'p')])
        pages = sorted(glob.glob(os.path.join(td, 'p*.jpg')))
        for i, f in enumerate(pages, 1):
            seal(fk, open(f, 'rb').read(), os.path.join(ROOT, f'mualim/t/{did}-{i}.enc'))
    meta = json.load(open(os.path.join(ROOT, 'src/tawthiq.json'), encoding='utf-8'))
    for m in meta:
        if m['id'] == did: m['n'] = len(pages)
    json.dump(meta, open(os.path.join(ROOT, 'src/tawthiq.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ok', did, len(pages), 'pages')
