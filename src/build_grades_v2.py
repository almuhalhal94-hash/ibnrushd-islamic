"""Build the public, encrypted grades file (src/gr.json) from the teachers' ministry workbooks.
Usage:  python3 src/build_grades_v2.py out.json full:<talal.xlsx> exam:<t1.xlsx> exam:<t2.xlsx> ... [codes:<codes.json>]
  full:  أ. طلال's classes -> exam 1 + hifz 1 + tilawa 1 + behaviour (stop 1) + portfolio, with feedback in the page.
  exam:  other teachers -> exam 1 only.
  codes: the official class lists (wins over any CPR typed in a workbook) {"6-1": {"student name": "9-digit CPR", ...}} for workbooks whose CPR column is empty.
Each sheet is matched to its class by student names (src/st.json). Every record is encrypted with the student's
CPR (PBKDF2-SHA256 600k -> AES-GCM); the CPRs themselves are never written. Never commit the xlsx files."""
import sys, os, re, json, base64, hashlib, difflib, unicodedata
import openpyxl
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ITER = 600000
HERE = os.path.dirname(os.path.abspath(__file__))
ST = json.load(open(os.path.join(HERE, 'st.json'), encoding='utf-8'))


def norm(s):
    s = unicodedata.normalize('NFKC', str(s or '')).replace('ـ', '')  # sheets often hold presentation forms (ﺑﺎﺳﻢ)
    s = re.sub('[أإآ]', 'ا', s).replace('ى', 'ي').replace('ة', 'ه')
    s = re.sub('[ً-ْ]', '', s)
    return re.sub(r'\s+', ' ', s).strip()


STN = {k: [norm(n) for n in v] for k, v in ST.items()}


def num(v):
    if v is None or v == '':
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def cpr(v):
    d = re.sub(r'\D', '', str(v or ''))
    return d if len(d) == 9 else None


def match(name, key):
    """index of a sheet name inside the class roster (exact after normalising, else closest >= .85)"""
    n = norm(name)
    if n in STN[key]:
        return STN[key].index(n)
    best = difflib.get_close_matches(n, STN[key], 1, 0.85)
    if best:
        return STN[key].index(best[0])
    same3 = [j for j, full in enumerate(STN[key]) if full.split()[:3] == n.split()[:3] and len(n.split()) >= 3]
    if len(same3) == 1:   # first three names agree, the rest differs (مانع عتيق / مانع محمد)
        return same3[0]
    for j, full in enumerate(STN[key]):   # same words, different order
        if sorted(full.split()) == sorted(n.split()):
            return j
    # shortened names in the teacher's sheet: every word is the start of a roster word, in order
    w = n.split()
    for j, full in enumerate(STN[key]):
        fw, k = full.split(), 0
        for x in fw:
            if k < len(w) and x.startswith(w[k]):
                k += 1
        if k == len(w) and len(w) >= 2:
            return j
    return None


def sheets(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    for ws in wb:
        rows = list(ws.iter_rows(values_only=True))
        hdr = ' '.join(str(x) for r in rows[:3] for x in r if x)
        kind = 'isl' if 'الاختبارات' in hdr else ('til' if 'الحفظ' in hdr else None)
        if not kind:
            continue
        start = 4 if kind == 'isl' else 3
        studs = [r for r in rows[start:] if r and len(r) > 2 and r[2] and str(r[2]).strip()]
        names = [norm(r[2]) for r in studs]
        key = max(STN, key=lambda k: len(set(names) & set(STN[k])))
        if len(set(names) & set(STN[key])) < len(names) * 0.5:
            print('!! no class for sheet', path, ws.title)
            continue
        yield ws.title, kind, key, studs, rows[:3]


def til_cols(head):
    """column indexes of hifz-1 parts and tilawa رصد 1 (أ، ب) from the two header rows"""
    r0, r1 = head[0], head[1]
    hz = [i for i, v in enumerate(r0) if v and 'الحفظ' in str(v)][0]
    tl = [i for i, v in enumerate(r0) if v and 'التلاوة' in str(v)][0]
    hifz1 = [i for i in range(hz, tl) if str(r1[i]).strip() in ('1', '1.0')]
    r1i = [i for i in range(tl, len(r1)) if r1[i] and 'رصد 1' in str(r1[i])][0]
    return hifz1, [r1i, r1i + 1]


def enc(code, rec):
    salt, iv = os.urandom(16), os.urandom(12)
    k = hashlib.pbkdf2_hmac('sha256', code.encode(), salt, ITER, 32)
    ct = AESGCM(k).encrypt(iv, json.dumps(rec, ensure_ascii=False, separators=(',', ':')).encode(), None)
    return [base64.b64encode(x).decode() for x in (salt, iv, ct)]


out_path = sys.argv[1]
codes = {}
recs = {}   # key -> idx -> (code, rec)
for arg in sys.argv[2:]:
    mode, path = arg.split(':', 1)
    if mode == 'codes':
        codes = json.load(open(path, encoding='utf-8'))
        continue
    found = list(sheets(path))
    for title, kind, key, studs, head in found:
        if kind == 'til' and mode != 'full':
            continue
        cls = recs.setdefault(key, {})
        if kind == 'til':
            hcols, tcols = til_cols(head)
        for r in studs:
            i = match(r[2], key)
            if i is None:
                print('!! unmatched', key, r[2])
                continue
            code, rec = cls.get(i, (None, {'n': ST[key][i], 'm': mode}))
            code = code or cpr(r[1])
            if kind == 'isl':
                # a class whose marks sit only in «اختبار 2» is read as exam 1 (handoff, 28 Oct)
                rec['exam1'] = num(r[16]) if num(r[16]) is not None else num(r[17])
                if mode == 'full':
                    rec['beh'] = [num(r[3]), num(r[4])]
                    rec['port'] = [num(r[8]), num(r[9]), num(r[10])]
            else:
                # a 0 in hifz/tilawa means the student has not recited yet -> shown as «لم يقم بالتسميع» with the make-up note
                hz = [num(r[c]) for c in hcols]
                rec['hifz'] = [None] * len(hz) if not any(hz) else hz
                rec['til'] = [num(r[c]) or None for c in tcols]
            cls[i] = (code, rec)

# codes from the official rosters for workbooks without CPRs
for key, cmap in codes.items():
    nm = {norm(k): v for k, v in cmap.items()}
    for i, (code, rec) in recs.get(key, {}).items():
        if True:   # the official list wins: a teacher's CPR column can be out of order (الثالث 1، 29 أكتوبر)
            c = nm.get(norm(rec['n'])) or (nm.get(difflib.get_close_matches(norm(rec['n']), list(nm), 1, 0.85)[0]) if difflib.get_close_matches(norm(rec['n']), list(nm), 1, 0.85) else None)
            if c:
                recs[key][i] = (cpr(c), rec)

out, pend = {}, []
for key in ST:
    cls = recs.get(key, {})
    row = []
    for i in range(len(ST[key])):
        code, rec = cls.get(i, (None, None))
        row.append(enc(code, rec) if code and rec else None)
    ok = sum(1 for x in row if x)
    if not ok:
        pend.append(key)
    out[key] = row
    print(key, f'{ok}/{len(row)}', 'full' if any(r and r[1]['m'] == 'full' for r in cls.values()) else ('exam' if cls else '-'))
json.dump({'iter': ITER, 'd': out, 'pend': pend}, open(out_path, 'w', encoding='utf-8'), separators=(',', ':'))
print('pending classes:', pend)
