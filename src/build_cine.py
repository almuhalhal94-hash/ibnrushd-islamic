# نسخة تجربة للموقع العام بالطبقة السينمائية: cine/index.html (noindex، غير مربوطة)
# الاستخدام: python3 src/build_cine.py
import os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = os.path.join(ROOT, 'src/tasmim')
src = open(os.path.join(T, 'real.html'), encoding='utf-8').read()
css = open(os.path.join(T, 'cine.css'), encoding='utf-8').read()
js = open(os.path.join(T, 'cine.js'), encoding='utf-8').read()
for d in ('i', 'sfx'):
    shutil.copytree(os.path.join(T, d), os.path.join(ROOT, 'jadid', d), dirs_exist_ok=True)
i = src.index('</style>'); src = src[:i] + css + src[i:]
i = src.rindex('})();', 0, src.rindex('</script>')); src = src[:i] + '\n' + js + '\n' + src[i:]
src = src.replace('/\\/jadid\\//.test(location.pathname)', '/\\/(jadid|cine)\\//.test(location.pathname)', 1)
assert '(jadid|cine)' in src
assert "OLD=RT?'../index.html':'site.html'" in src
src = src.replace("OLD=RT?'../index.html':'site.html'", "OLD=RT?'../site.html':'site.html'", 1)
s = src.replace('{{RT}}', '../').replace('{{OLD}}', '../site.html')
s = re.sub(r'''(["'(])(i|sfx)/''', lambda m: m.group(1) + '../jadid/' + m.group(2) + '/', s)
head = ('<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="robots" content="noindex, nofollow">\n<meta name="theme-color" content="#064a33">\n'
        '<style>[hidden]{display:none!important}img{max-width:100%}body{margin:0}</style>\n</head>\n<body>\n')
s = s.replace('<title>نموذج موقع قسم التربية الإسلامية – التصميم الجديد</title>', '<title>تجربة: الموقع السينمائي</title>')
os.makedirs(os.path.join(ROOT, 'cine'), exist_ok=True)
open(os.path.join(ROOT, 'cine/index.html'), 'w', encoding='utf-8').write(head + s + '\n</body>\n</html>\n')
print('built cine/index.html')
