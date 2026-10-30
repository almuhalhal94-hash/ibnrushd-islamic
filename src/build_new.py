# يبني واجهة الموقع الجديدة من src/tasmim/real.html
# الاستخدام: python3 src/build_new.py jadid   ← نسخة تجريبية في jadid/index.html (الموقع القديم في index.html)
#            python3 src/build_new.py root    ← الواجهة الرئيسية index.html (الموقع القديم في site.html، والأصول في jadid/)
import sys, os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mode = sys.argv[1] if len(sys.argv) > 1 else 'jadid'
src = open(os.path.join(ROOT, 'src/tasmim/real.html'), encoding='utf-8').read()
os.makedirs(os.path.join(ROOT, 'jadid'), exist_ok=True)
for d in ('i', 'sfx'):
    shutil.copytree(os.path.join(ROOT, 'src/tasmim', d), os.path.join(ROOT, 'jadid', d), dirs_exist_ok=True)
if mode == 'jadid':
    rt, old, out, robots, asset = '../', '../index.html', 'jadid/index.html', '<meta name="robots" content="noindex, nofollow">\n', ''
else:
    rt, old, out, robots, asset = '', 'site.html', 'index.html', '', 'jadid/'
s = src.replace('{{RT}}', rt).replace('{{OLD}}', old)
if asset:
    s = re.sub(r'''(["'(])(i|sfx)/''', lambda m: m.group(1) + asset + m.group(2) + '/', s)
head = ('<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + robots +
        '<meta name="theme-color" content="#064a33">\n'
        '<link rel="manifest" href="' + rt + 'manifest.webmanifest">\n'
        '<link rel="apple-touch-icon" href="' + rt + 'icons/apple-touch-icon.png">\n'
        '<style>[hidden]{display:none!important}img{max-width:100%}body{margin:0}</style>\n'
        '<script>try{if(\'serviceWorker\' in navigator)navigator.serviceWorker.register(\'' + rt + 'sw.js\')}catch(e){}</script>\n'
        '</head>\n<body>\n')
s = s.replace('<title>نموذج موقع قسم التربية الإسلامية – التصميم الجديد</title>', '<title>قسم التربية الإسلامية · مدرسة ابن رشد</title>')
open(os.path.join(ROOT, out), 'w', encoding='utf-8').write(head + s + '\n</body>\n</html>\n')
print('built', out)
