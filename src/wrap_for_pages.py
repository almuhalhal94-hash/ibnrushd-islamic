# يلف index.html (المكتوب لـ artifact) بمستند كامل لـ GitHub Pages.
# الاستخدام: python3 wrap_for_pages.py index.html
import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
if not s.lstrip().lower().startswith('<!doctype'):
    s=('<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '</head>\n<body>\n'+s+'\n</body>\n</html>\n')
    open(p,'w',encoding='utf-8').write(s)
