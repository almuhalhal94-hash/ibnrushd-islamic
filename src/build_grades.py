"""Read the department grades workbook and produce gr.js: per-student grades encrypted
with that student's access code (PBKDF2-SHA256 -> AES-GCM). Usage:
  python3 build_grades.py <workbook.xlsx> <out.js>
Entry codes come from a separate private map (argv[3]); they are only used as keys."""
import sys, json, os, base64, hashlib, re
import openpyxl
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ITER = 600000
GN = {'الأول': '7', 'الثاني': '8', 'الثالث': '9'}
# entry codes: {'7-1': ['9-digit', ...]} aligned with rosters; never written into the site
codes = json.load(open(sys.argv[3], encoding='utf-8')) if len(sys.argv) > 3 else {}
ST = json.load(open('/home/claude/work/st.json', encoding='utf-8'))

def num(v):
    if v is None or v == '':
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None

def ssum(vals):
    xs = [v for v in vals if v is not None]
    return round(sum(xs), 2) if xs else None

def b64(b):
    return base64.b64encode(b).decode()

wb = openpyxl.load_workbook(sys.argv[1], data_only=False)
out = {}
for key, names in ST.items():
    g, s = key.split('-')
    lab = [k for k, v in GN.items() if v == g][0] + ' ' + s
    wi, wt = wb[lab + ' تربية'], wb[lab + ' تلاوة']
    recs = []
    for i, n in enumerate(names):
        ri, rt = 5 + i, 4 + i
        if (wi.cell(ri, 3).value or '').strip() != n or (wt.cell(rt, 3).value or '').strip() != n:
            raise SystemExit(f'name mismatch {lab} row {i+1}: {n}')
        v = lambda c: num(wi.cell(ri, c).value)
        mul = [v(4), v(5), v(6), v(7)]           # D..G
        port = [v(9), v(10), v(11)]              # I..K
        task = [v(13), v(14), v(15)]             # M..O
        exam = [v(17), v(18)]                    # Q..R
        til = v(21)                              # U
        isl = {
            'mul': mul, 'mulT': ssum(mul), 'port': port, 'portT': ssum(port),
            'task': task, 'taskT': ssum(task), 'exam': exam, 'examT': ssum(exam),
            'til': til,
        }
        parts = [isl['mulT'], isl['portT'], isl['taskT'], isl['examT']]
        isl['sub'] = ssum(parts)
        isl['total'] = ssum(parts + [til])
        w = lambda c: num(wt.cell(rt, c).value)
        hf = [w(4), w(5)]; tl = [w(8), w(9), w(10), w(11)]
        hfT, tlT = ssum(hf), ssum(tl)
        tw = {'hifz': hf, 'hifzT': hfT, 'hifzD': None if hfT is None else round(hfT / 4, 2),
              'tila': tl, 'tilaT': tlT, 'tilaD': None if tlT is None else round(tlT * 15 / 40, 2)}
        tw['total'] = ssum([tw['hifzD'], tw['tilaD']])
        rec = {'n': n, 'i': isl, 't': tw}
        code = (codes.get(key) or [None] * len(names))[i]
        if not code:
            cb = re.sub(r'\D', '', str(wi.cell(ri, 2).value or ''))
            code = cb if len(cb) == 9 else None
        if not code:
            recs.append(None)
            continue
        salt, iv = os.urandom(16), os.urandom(12)
        k = hashlib.pbkdf2_hmac('sha256', code.encode(), salt, ITER, 32)
        ct = AESGCM(k).encrypt(iv, json.dumps(rec, ensure_ascii=False).encode(), None)
        recs.append([b64(salt), b64(iv), b64(ct)])
    out[key] = recs
open(sys.argv[2], 'w', encoding='utf-8').write(json.dumps({'iter': ITER, 'd': out}, separators=(',', ':')))
print('ok', sum(len(v) for v in out.values()))
