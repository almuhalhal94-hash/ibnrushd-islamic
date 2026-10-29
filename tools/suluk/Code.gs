/**
 * السلوك من أجل التعلم — نسخة الطباعة
 * مدرسة ابن رشد الإعدادية للبنين · إعداد: أ. طلال سعود المهلهل
 * الأسماء في ورقة «الطلاب»: الشعبة | الرقم | اسم الطالب
 */
const SH_STUDENTS = 'الطلاب';

function doGet() {
  ensureSetup_();
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('السلوك من أجل التعلم')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** شغّلها مرة وحدة من المحرر لتجهيز ورقة الطلاب ومنح الصلاحيات */
function setup() {
  ensureSetup_();
  SpreadsheetApp.getActive().toast('تم تجهيز ورقة الطلاب ✓', 'السلوك من أجل التعلم');
}

function ensureSetup_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SH_STUDENTS);
  if (sh && sh.getLastRow() > 1) return;
  if (!sh) sh = ss.insertSheet(SH_STUDENTS, 0);
  sh.getRange(1, 1, 1, 3).setValues([['الشعبة', 'الرقم', 'اسم الطالب']])
    .setFontWeight('bold').setBackground('#e1f1e8');
  if (SEED.length) sh.getRange(2, 1, SEED.length, 3).setValues(SEED);
  sh.setFrozenRows(1); sh.setRightToLeft(true); sh.autoResizeColumns(1, 3);
}

/** الشعب وطلابها بالترتيب كما في الورقة */
function getClasses() {
  ensureSetup_();
  const rows = SpreadsheetApp.getActive().getSheetByName(SH_STUDENTS).getDataRange().getValues().slice(1);
  const classes = {}, order = [];
  rows.forEach(r => {
    const c = String(r[0]).trim(), name = String(r[2]).trim();
    if (!c || !name) return;
    if (!classes[c]) { classes[c] = []; order.push(c); }
    classes[c].push({ n: Number(r[1]) || classes[c].length + 1, name: name });
  });
  order.forEach(c => classes[c].sort((a, b) => a.n - b.n));
  return { classes: classes, order: order };
}

const SEED = []; // الأسماء في ورقة «الطلاب» داخل ملف Google Sheets
