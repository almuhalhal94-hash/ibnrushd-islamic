"""Seal a documentation PDF for the teachers' achievement file (no password needed).
Usage: python3 src/send_tawthiq.py META.json file.pdf
META.json = {"id","t","sub","date":"YYYY-MM-DD","sec":"quran|mag|digital","who":[...],"kv":[[k,v],...]}
Then commit mualim/inbox/ and push: the "تحديث مساحة المعلمين" Action adds it encrypted and rebuilds the page.
"""
import base64, json, os, sys
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey, X25519PublicKey
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import serialization as S
import hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = dict(encoding=S.Encoding.Raw, format=S.PublicFormat.Raw)
meta = json.load(open(sys.argv[1], encoding='utf-8'))
pub = base64.b64decode(open(os.path.join(ROOT, 'data/inbox.pub')).read().strip())
esk = X25519PrivateKey.generate(); epk = esk.public_key().public_bytes(**RAW)
k = hashlib.sha256(esk.exchange(X25519PublicKey.from_public_bytes(pub)) + epk + pub).digest()
iv = os.urandom(12)
os.makedirs(os.path.join(ROOT, 'mualim/inbox'), exist_ok=True)
open(os.path.join(ROOT, f"mualim/inbox/{meta['id']}.box"), 'wb').write(epk + iv + AESGCM(k).encrypt(iv, open(sys.argv[2], 'rb').read(), None))
json.dump(meta, open(os.path.join(ROOT, f"mualim/inbox/{meta['id']}.json"), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('sealed', meta['id'])
