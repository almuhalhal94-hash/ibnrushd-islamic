# ملف عرض القسم للوزارة (21 أكتوبر 2026)

صفحة عرض لمسؤول انستغرام الوزارة عن التعلّم في قسم التربية الإسلامية.

- الصفحة: `ard/index.html` (تنفتح من الرابط: https://almuhalhal94-hash.github.io/ibnrushd-islamic/ard/)
- نسخة PDF مقاس A4: `ard/التعلم_في_قسم_التربية_الإسلامية.pdf`
- الصور: `ard/i/` لقطات حقيقية من الموقع والمصحف، وليس فيها وجوه ولا أسماء طلاب.
- `tools/shots4.js`: يصوّر صفحات الموقع بمقاس الجوال، ويتجاوز الباب ونافذة التثبيت.
- `tools/pdf.js`: يحوّل الصفحة إلى PDF (`node pdf.js <مجلد الصفحة> <ملف.pdf>`).
- نسخة Artifact على claude.ai: https://claude.ai/artifact/917VRCkmiq9AmJoXgpnGB6

## الكتيّب الفاخر (13 صفحة A4)
- PDF: `ard/كتيب_التعلم_في_قسم_التربية_الإسلامية.pdf`
- المصدر: `ard/kutayyib/index.html` + الصور في `ard/kutayyib/i/`
- التحويل: `node tools/bk.js ard/kutayyib ملف.pdf`
