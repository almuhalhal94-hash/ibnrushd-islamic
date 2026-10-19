"""Inbox for the teachers' achievement file: lets any session add a documentation PDF without knowing the password.
- `python3 src/inbox.py pub`      (Action, has TEACHERS_PW): writes data/inbox.pub, the X25519 public key derived from the password.
- `python3 src/send_tawthiq.py META.json file.pdf` (any session): seals the PDF to that public key -> mualim/inbox/<id>.box + <id>.json.
- `python3 src/inbox.py process`  (Action): opens each box, encrypts it into mualim/t/ with add_tawthiq, upserts its metadata
  into src/tawthiq.json (same id = replaced), and deletes the inbox files. Plain PDFs never touch the public repo.
"""
import base64, glob, hashlib, json, os, subprocess, sys, tempfile
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey, X25519PublicKey
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import serialization as S

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = dict(encoding=S.Encoding.Raw, format=S.PublicFormat.Raw)


def secret_key(pw):
    return X25519PrivateKey.from_private_bytes(hashlib.pbkdf2_hmac('sha256', pw.encode(), b'ibnrushd-inbox-v1', 250000, 32))


def box_key(shared, epk, pub):
    return hashlib.sha256(shared + epk + pub).digest()


def open_box(sk, data):
    epk, iv, ct = data[:32], data[32:44], data[44:]
    pub = sk.public_key().public_bytes(**RAW)
    k = box_key(sk.exchange(X25519PublicKey.from_public_bytes(epk)), epk, pub)
    return AESGCM(k).decrypt(iv, ct, None)


if __name__ == '__main__':
    pw = os.environ['TEACHERS_PW']
    sk = secret_key(pw)
    if sys.argv[1] == 'pub':
        open(os.path.join(ROOT, 'data/inbox.pub'), 'w').write(base64.b64encode(sk.public_key().public_bytes(**RAW)).decode() + '\n')
    elif sys.argv[1] == 'process':
        meta_p = os.path.join(ROOT, 'src/tawthiq.json')
        for jf in sorted(glob.glob(os.path.join(ROOT, 'mualim/inbox/*.json'))):
            m = json.load(open(jf, encoding='utf-8'))
            bf = jf[:-5] + '.box'
            pdf = open_box(sk, open(bf, 'rb').read())
            meta = json.load(open(meta_p, encoding='utf-8'))
            meta = [x for x in meta if x['id'] != m['id']]
            meta.append(m)
            meta.sort(key=lambda x: x.get('date', ''))
            json.dump(meta, open(meta_p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            with tempfile.NamedTemporaryFile(suffix='.pdf') as t:
                t.write(pdf); t.flush()
                subprocess.check_call([sys.executable, os.path.join(ROOT, 'src/add_tawthiq.py'), pw, m['id'], t.name])
            os.remove(jf); os.remove(bf)
            print('added', m['id'])
