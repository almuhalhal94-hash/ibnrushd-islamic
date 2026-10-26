"""إضافة رد في صفحة «ردود القسم» (rudud.html).
الرد يتشفّر بالرقم الشخصي للطالب (PBKDF2-SHA256 600000 ← AES-GCM) ويُحفظ في data/rudud.json.
الرقم الشخصي يُستخدم مفتاحًا فقط، ولا يُكتب في أي ملف.

الاستخدام (من جذر المستودع):
  CPR=123456789 python3 src/add_reply.py reply.json
reply.json:
  {"name": "اسم الطالب", "cls": "الثالث الإعدادي / 4", "teacher": "أ. ...",
   "topic": "السلوك", "q": "نص استفسار ولي الأمر", "a": "رد المعلم", "d": "2026-10-26"}
"""
import sys, os, json, base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, 'data', 'rudud.json')
ITER = 600000

cpr = ''.join(c for c in os.environ.get('CPR', '') if c.isdigit())
if len(cpr) != 9:
    raise SystemExit('ضع الرقم الشخصي (9 أرقام) في المتغير CPR')
rec = json.load(open(sys.argv[1], encoding='utf-8'))
for k in ('name', 'a'):
    if not rec.get(k):
        raise SystemExit(f'الحقل {k} ناقص')

db = json.load(open(DB, encoding='utf-8')) if os.path.exists(DB) else {
    'v': 1, 'iter': ITER, 'salt': base64.b64encode(os.urandom(16)).decode(), 'r': []}
key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=base64.b64decode(db['salt']),
                 iterations=db['iter']).derive(cpr.encode())
iv = os.urandom(12)
ct = AESGCM(key).encrypt(iv, json.dumps(rec, ensure_ascii=False).encode(), None)
db['r'].append({'i': base64.b64encode(iv).decode(), 'c': base64.b64encode(ct).decode()})
json.dump(db, open(DB, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('تمت إضافة الرد. عدد الردود:', len(db['r']))
