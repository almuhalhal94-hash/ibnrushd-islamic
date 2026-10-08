# موقع قسم التربية الإسلامية – ملف التسليم (Handoff)

مدرسة ابن رشد الإعدادية للبنين – المنطقة التعليمية (3) – مملكة البحرين
إعداد: أ. طلال سعود المهلهل · آخر تحديث: 8 أكتوبر 2026

---

## 1) للمعلم: شلون تنقل الشغل لحساب ثاني

1. **الموقع ما يطيح إذا خلص الاستهلاك.** الرابط والباركود يظلون شغالين. الاستهلاك يرجع يتجدد بعد فترة.
2. **الرابط الحالي ملك الحساب الأول.** الحساب الثاني ما يقدر يعدل على نفس الرابط، فالتعديل على رابط الباركود لازم يكون من الحساب الأول.
3. **إذا تبي تكمل الشغل في الحساب الثاني:**
   - افتح محادثة جديدة.
   - ارفع هذا الملف (اقرأني) + ملف «مصدر_الموقع.zip» + أجزاء «ملفات_الموقع».
   - الصق الرسالة الجاهزة في القسم 2 تحت.
4. **إذا قررت تنقل الموقع لرابط دائم مستقل** (مثل Netlify): ارفع أجزاء «ملفات_الموقع» بعد فكها في مجلد واحد. وبعدها نخلي الرابط القديم يحوّل الزوار للجديد عشان الباركود المطبوع ما يضيع.

---

## 2) رسالة جاهزة تلصقها في الحساب الجديد

> أنا أ. طلال سعود المهلهل، معلم تربية إسلامية وتلاوة في مدرسة ابن رشد الإعدادية للبنين (البحرين، المنطقة 3). كلمني باللهجة الخليجية، واضح وصريح ومختصر، وأغلب استخدامي من الجوال.
> عندي موقع لقسم التربية الإسلامية بنيته مع Claude في حساب ثاني. رفعت لك ملف «اقرأني» فيه كل التفاصيل التقنية، وملف المصدر وملفات الموقع. اقرأ «اقرأني» كامل قبل أي شي، وجهّز نفسك تكمل الشغل بنفس الأسلوب ونفس التصميم. لا تغير شي قبل لا أطلب.

---

## 3) For the next Claude: technical brief

### What exists
- **Live site (QR target):** https://claude.ai/artifact/TfqNKY1HsbUERvgR3Ec1hP, owned by the first account. Public ("anyone with the link"). Capability `{"downloads": true}`. The URL must never change because printed QR codes point to it.
- **Poster canvas (Design type):** https://claude.ai/artifact/DHB59wHF8oT6uzSacYjone
  - `Main.dc.html` is the first poster.
  - `Blast.dc.html` is the bold 1080×1920 WhatsApp-status poster.
  - Copies of both are in `src/`.
- **Tally forms** (Tally workspace of the first account):
  - Contact form: https://tally.so/r/LZQLkj (phone field optional).
  - Satisfaction rating: https://tally.so/r/vGQkMv (form id `vGQkMv`). The site's slider opens it with hidden fields `role`, `score` (0–100) and `label`, plus an optional comment.

### Build pipeline (`src/`)
- **`template.html`** is the whole single-page app (vanilla JS, RTL, light/dark tokens).
  - Placeholders: `__ST__`, `__GR__`, `__TEACHERS__`, `__PLAN__`, `__DARS__`, `__DECKS__`, `__DDECKS__`, `__WAHAT__`.
  - Views (`VIEWS`): home, grades, dars, tilawa, acts, pride, mizmar, magazine, wahat, contact, exam, answers, review.
  - Navigation uses `data-go="view"`. Actions use `data-act` + `data-arg`.
- **`build_site.py <gr.json> ""`** fills the template and writes `index.html`.
  - It uses absolute paths under `/home/claude/...`; adjust them to the new workspace.
  - After every build, check syntax: extract the last `<script>` block and run `node --check` on it.
- **Data files:**
  - `st.json`: rosters by class, names only (classes 7-1…9-4). There is no 6th-grade list yet.
  - `teachers.json`: teacher → classes, from the official timetable.
    - أ. يعقوب بوجيري (senior teacher): 9/1–9/2
    - أ. طلال المهلهل: 7/1–7/4 and 8/4
    - أ. فلاح طايل شاجرة: 8/1–8/3 and 9/3–9/4
    - أ. عمر محمد إرشاد: 6/1–6/4
  - `dars.js`: official Islamic-education plan; rows are `[unit, title, week, pages]`. Lesson counts: 6th 14, 7th 15, 8th 16, 9th 16.
  - `plan_old.js`: tilawa plan.
  - Week calculation: START = 2026-09-06.
- **Lesson decks** (`decks.json` for tilawa, `ddecks.json` for lessons):
  - Each lesson is a vertical sprite strip, 960 px wide, at `tl/<id>/L.jpg` or `L<n>.jpg`, plus a PDF.
  - The viewer crops the strip with `translateY`.
  - `add_grade.py <grade> <map.json>` converts pptx → PDF (LibreOffice) → JPG strip + PDF.
  - `make_strips_example.py` shows the same strip method for plain PDFs (answers/review).
- **Exam material:**
  - `EXAM` object in the template holds the topics for grades 6/7/8/9 (20 marks, one class period).
  - Answers: `tl/ans/a<g>.jpg|pdf`. Each page maps to exam topic i.
  - Review notes: `tl/rev/r<g>.jpg|pdf`.

### Grades (privacy-critical)
- `درجات_قسم_التربية_الإسلامية.xlsx` is the ministry template, 2 sheets per class. Column B «الرقم الشخصي» holds the student CPR (9 digits), which is the login code. It is currently empty.
- `build_grades.py <xlsx> <out.json>` encrypts each student's grades with PBKDF2-SHA256 (600k iterations) → AES-GCM. The page decrypts with WebCrypto.
- The CPR is never shown on the site. The field label is «الرقم الشخصي». Never publish raw CPRs or grades in plain text.

### Platform limits learned
- At most 255 files per publish and 512 per version. Only standard web types are served: no pptx, no .bin. PDF, JPG and MP3 are OK.
- No iframes. Page-initiated downloads go through `claude.use('downloads')` with an `<a target=_blank>` fallback.
- The workspace network blocks GitHub raw, npm fonts and most sites. Arabic fonts are missing in LibreOffice, so pptx renders can overflow; PowerPoint-exported PDFs give better fidelity.

### Content rules from the teacher
- Footer, right-to-left order: إعداد (أ. طلال سعود المهلهل) ← المعلم الأول (أ. يعقوب بوجيري) ← المديران المساعدان (أ. أنور الجابري • أ. أحمد بوجيري) ← مدير المدرسة (أ. خالد السيد). Line above them: «بجهود قسم التربية الإسلامية».
- School vision: «علمًا نتميّز، قيمًا نسمو، وطنًا نبني».
- Every lesson carries the source note «المصدر: المحتوى التعليمي الرقمي – وزارة التربية والتعليم».
- No personal phone numbers, teacher emails, behavior or attendance data on the public site.

### Pending items
- Grades workbook with CPRs → run `build_grades.py`, then `build_site.py`, then publish.
- 6th-grade student names.
- Optional: Google Drive links for the original pptx (`decks.json` `link`); PowerPoint-exported PDFs for sharper slides.
- Possible future: a portal for all school departments, plus moving to permanent hosting (Netlify) with the old link pointing to the new one.
