"""Assemble the site: template + rosters + encrypted grades + teachers.
Usage: python3 build_site.py <grades.js(json)> <updated-label or ''>"""
import json, sys
tpl = open('/home/claude/site2/template.html', encoding='utf-8').read()
st = open('/home/claude/work/st.json', encoding='utf-8').read()
gr = json.load(open(sys.argv[1], encoding='utf-8'))
gr['updated'] = sys.argv[2] if len(sys.argv) > 2 else ''
teachers = json.load(open('/home/claude/site2/teachers.json', encoding='utf-8'))
plan = open('/home/claude/work/plan_old.js', encoding='utf-8').read()
wahat = open('/home/claude/work/wahat_old.js', encoding='utf-8').read()
wahat = wahat.replace('data-act="view" data-arg="magazine"', 'data-go="magazine"')
wahat = wahat.replace("<p><span class=\"tag\">أسماء أصحاب الإنجازات تضاف بعد إذن النشر</span></p>", '')
wahat = wahat.replace('style="color:var(--accent)"', 'style="color:var(--gold)"')
wahat = wahat.replace('function wahat(){', 'function wahat(){var sec_=sec;').replace("'<section class=\"sec-h\"><h2>", "'<section class=\"sec\"><h2>")
out = (tpl.replace('__ST__', st)
          .replace('__GR__', json.dumps(gr, ensure_ascii=False, separators=(',', ':')))
          .replace('__TEACHERS__', json.dumps(teachers, ensure_ascii=False))
          .replace('__PLAN__', plan)
          .replace('__DDECKS__', open('/home/claude/dppt/ddecks.json', encoding='utf-8').read())
          .replace('__DECKS__', open('/home/claude/ppt/decks.json', encoding='utf-8').read())
          .replace('__DARS__', open('/home/claude/site2/dars.js', encoding='utf-8').read())
          .replace('__WAHAT__', wahat))
for tok in ('__DDECKS__', '__DECKS__', '__DARS__', '__ST__', '__GR__', '__TEACHERS__', '__PLAN__', '__WAHAT__'):
    assert tok not in out, tok
open('/home/claude/asli/index.html', 'w', encoding='utf-8').write(out)
print('built', len(out))
