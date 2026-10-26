/* مساعد القسم: نافذة دردشة بإجابات جاهزة لأسئلة أولياء الأمور، تعمل بدون ذكاء اصطناعي ولا خادم.
   تقرأ المعلمين من src/teachers.json (وإن تعذّر فمن القائمة الاحتياطية تحت)، وأزرارها data-go تفتح أقسام الموقع عبر الموجّه الموجود في index.html. */
(function(){
if(window.__asst)return;window.__asst=1;
var FORM='https://tally.so/r/LZQLkj';
var T=[{name:"أ. يعقوب بوجيري",role:"المعلم الأول للتربية الإسلامية",cls:[[9,1],[9,2]]},
       {name:"أ. طلال سعود المهلهل",role:"معلم التربية الإسلامية",cls:[[7,1],[7,2],[7,3],[7,4],[8,4]]},
       {name:"أ. فلاح طايل شاجرة",role:"معلم التربية الإسلامية",cls:[[8,1],[8,2],[8,3],[9,3],[9,4]]},
       {name:"أ. عمر محمد إرشاد",role:"معلم التربية الإسلامية",cls:[[6,1],[6,2],[6,3],[6,4]]}];
try{fetch('src/teachers.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.length&&j[0].cls)T=j}).catch(function(){})}catch(e){}
var GN={6:'السادس',7:'الأول',8:'الثاني',9:'الثالث'};

/* ---------- styles (site tokens) ---------- */
var css='.as-fab{position:fixed;z-index:39;inset-inline-end:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 164px);display:flex;align-items:center;gap:8px;border:0;cursor:pointer;border-radius:999px;padding:11px 16px 11px 14px;background:var(--navy,#253260);color:#fff;font:600 .88rem var(--body,Tahoma,sans-serif);box-shadow:0 8px 22px rgba(0,0,0,.22);transition:transform .2s}'+
'.as-fab:hover{transform:translateY(-2px)}.as-fab svg{flex:none}'+
'.as-fab .as-dot{position:absolute;top:6px;inset-inline-end:8px;width:9px;height:9px;border-radius:50%;background:var(--gold-fill,#e9b44c);box-shadow:0 0 0 2px var(--navy,#253260)}'+
'@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .as-fab{color:#0d1512}}:root[data-theme="dark"] .as-fab{color:#0d1512}'+
'.as-scrim{position:fixed;inset:0;z-index:49;background:rgba(10,20,16,.35);opacity:0;pointer-events:none;transition:opacity .25s}.as-scrim.on{opacity:1;pointer-events:auto}'+
'.as-panel{position:fixed;z-index:50;inset-inline-end:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 20px);width:min(400px,calc(100vw - 28px));height:min(620px,calc(100dvh - 40px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px)));background:var(--paper,#fffdf8);color:var(--ink,#1f2a26);border:1px solid var(--line,#e3dac9);border-radius:22px;box-shadow:0 18px 50px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;transform:translateY(16px) scale(.98);opacity:0;pointer-events:none;transition:transform .25s cubic-bezier(.2,.8,.2,1),opacity .2s;font-family:var(--body,Tahoma,sans-serif);direction:rtl}'+
'.as-panel.on{transform:none;opacity:1;pointer-events:auto}'+
'@media (max-width:560px){.as-panel{inset-inline:0;bottom:0;width:100%;height:88dvh;border-radius:22px 22px 0 0;border-bottom:0;padding-bottom:env(safe-area-inset-bottom,0px)}}'+
'.as-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line,#e3dac9);background:var(--paper,#fffdf8)}'+
'.as-av{width:38px;height:38px;border-radius:50%;background:var(--green,#0a6e4b);color:var(--on,#fff);display:grid;place-items:center;flex:none}'+
'.as-head b{display:block;font-size:.98rem;line-height:1.3}.as-head small{display:block;font-size:.74rem;color:var(--muted,#5f6b66);line-height:1.4}'+
'.as-x{margin-inline-start:auto;border:0;background:var(--sunk,#efe8da);color:inherit;width:34px;height:34px;border-radius:50%;cursor:pointer;display:grid;place-items:center;flex:none}'+
'.as-chat{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;min-height:0;background:var(--bg,#f7f3ea)}'+
'.as-m{max-width:88%;padding:9px 12px;border-radius:16px;font-size:.9rem;line-height:1.75;white-space:pre-line;overflow-wrap:anywhere}'+
'.as-m.bot{align-self:flex-start;background:var(--paper,#fffdf8);border:1px solid var(--line,#e3dac9);border-start-start-radius:4px}'+
'.as-m.me{align-self:flex-end;background:var(--green,#0a6e4b);color:var(--on,#fff);border-start-end-radius:4px}'+
'.as-act{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}'+
'.as-act a,.as-act button{font:600 .78rem var(--body,Tahoma,sans-serif);border-radius:999px;padding:5px 11px;text-decoration:none;border:1px solid var(--green,#0a6e4b);background:var(--green-soft,#e2f1e9);color:var(--green,#0a6e4b);cursor:pointer}'+
'.as-sug{display:flex;gap:6px;overflow-x:auto;padding:8px 12px;border-top:1px solid var(--line,#e3dac9);scrollbar-width:none;background:var(--paper,#fffdf8)}.as-sug::-webkit-scrollbar{display:none}'+
'.as-sug button{flex:none;white-space:nowrap;border:1px solid var(--line,#e3dac9);background:var(--bg,#f7f3ea);color:var(--ink,#1f2a26);border-radius:999px;padding:6px 12px;font:500 .8rem var(--body,Tahoma,sans-serif);cursor:pointer}'+
'.as-form{display:flex;gap:8px;padding:8px 12px 12px;background:var(--paper,#fffdf8)}'+
'.as-form input{flex:1;min-width:0;border:1px solid var(--line,#e3dac9);background:var(--bg,#f7f3ea);color:var(--ink,#1f2a26);border-radius:999px;padding:10px 14px;font:400 .95rem var(--body,Tahoma,sans-serif)}'+
'.as-send{border:0;width:44px;height:44px;border-radius:50%;background:var(--green,#0a6e4b);color:var(--on,#fff);cursor:pointer;display:grid;place-items:center;flex:none}'+
'.as-note{font-size:.7rem;color:var(--muted,#5f6b66);text-align:center;padding:0 12px 8px;background:var(--paper,#fffdf8)}'+
'@media (prefers-reduced-motion:reduce){.as-fab,.as-panel,.as-scrim{transition:none}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var IC_CHAT='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01"/></svg>';
var fab=document.createElement('button');fab.className='as-fab';fab.type='button';fab.setAttribute('aria-haspopup','dialog');
fab.innerHTML=IC_CHAT+'<span>اسأل القسم</span>';
var seen=false;try{seen=localStorage.getItem('as-seen')==='1'}catch(e){}
if(!seen){var dot=document.createElement('span');dot.className='as-dot';fab.appendChild(dot)}
var scrim=document.createElement('div');scrim.className='as-scrim';
var p=document.createElement('div');p.className='as-panel';p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');p.setAttribute('aria-label','مساعد القسم');
p.innerHTML='<div class="as-head"><span class="as-av">'+IC_CHAT+'</span><div><b>مساعد القسم</b><small>إجابات سريعة لأولياء الأمور والطلاب</small></div><button class="as-x" type="button" aria-label="إغلاق"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'+
 '<div class="as-chat" aria-live="polite"></div>'+
 '<div class="as-sug"></div>'+
 '<form class="as-form"><input id="as-in" placeholder="اكتب سؤالك هنا…" autocomplete="off" aria-label="سؤالك"><button class="as-send" type="submit" aria-label="إرسال"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="transform:scaleX(-1)"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg></button></form>'+
 '<div class="as-note">إجابات جاهزة من معلومات القسم. للأمور الخاصة بابنك راسل المعلم.</div>';
document.body.appendChild(fab);document.body.appendChild(scrim);document.body.appendChild(p);
var chat=p.querySelector('.as-chat'),inp=p.querySelector('#as-in'),sug=p.querySelector('.as-sug');

var SUG=['وين أشوف رد المعلم؟','من معلم ابني؟','كيف أشوف درجات ولدي؟','مواضيع الاختبار','الحفظ والتلاوة','الواجبات والكراسات','أبي موعد مع المعلم','زيارة المدرسة','راسل المعلم'];
SUG.forEach(function(s){var b=document.createElement('button');b.type='button';b.textContent=s;sug.appendChild(b)});

/* ---------- answers ---------- */
function A(t,acts){return{t:t,a:acts||[]}}
function view(label,go){return{label:label,go:go}}
var MSG=view('راسل المعلم',FORM);
var RUD=view('ردود القسم','rudud.html');
function norm(s){return String(s).replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[٠-٩]/g,function(c){return '٠١٢٣٤٥٦٧٨٩'.indexOf(c)}).toLowerCase()}
function teacherOf(g,s){for(var i=0;i<T.length;i++)for(var j=0;j<T[i].cls.length;j++)if(T[i].cls[j][0]==g&&T[i].cls[j][1]==s)return T[i];return null}
var WORDS=[['سادس',6],['سابع',7],['اول',7],['ثامن',8],['ثاني',8],['تاسع',9],['ثالث',9]];
function cls(n){
  var m=n.match(/([6-9])\s*[\/\\\-–]\s*([1-9])/);if(m)return[+m[1],+m[2]];
  var g=null;for(var i=0;i<WORDS.length;i++)if(n.indexOf(WORDS[i][0])>-1){g=WORDS[i][1];break}
  var d=n.match(/(?:^|[^\d])([1-9])(?!\d)/g);
  if(!g&&d&&d.length>=2){var a=+d[0].replace(/\D/g,''),b=+d[1].replace(/\D/g,'');if(a>=6&&a<=9)return[a,b]}
  if(g&&d){var x=d.map(function(v){return +v.replace(/\D/g,'')}).filter(function(v){return v!==g||d.length===1});if(x.length)return[g,x[x.length-1]]}
  if(g)return[g,0];
  return null}
function list(){return T.map(function(t){return '• '+t.name+': '+t.cls.map(function(c){return GN[c[0]]+' / '+c[1]}).join('، ')}).join('\n')}

function answer(q){
  var n=norm(q),c=cls(n);
  if(/(^|\s)(رد|ردود|الرد|ردكم|جواب)(\s|$|\u061f|\?)|ردو علي|ما ردو|ما رد|ارسلت استفسار|استفساري|استفسار/.test(n))
    return A('ردود المعلمين على استفساراتكم تلقونها في صفحة «ردود القسم»: اكتب الرقم الشخصي لابنك (9 أرقام) ويطلع لك الرد. الرد محمي، وما يشوفه إلا من معه الرقم.\nإذا ما لقيت رد، فالمعلم للحين ما رد، وبيرد بإذن الله.',[RUD,MSG]);
  if(c&&/معلم|مدرس(?!ه)|استاذ|صف|فصل|شعب|[6-9]\s*[\/\\\-]/.test(n)){
    if(c[1]){var t=teacherOf(c[0],c[1]);
      if(t)return A('معلم التربية الإسلامية للصف '+GN[c[0]]+' / '+c[1]+' هو '+t.name+'.\nتقدر تراسله من نموذج التواصل، واختر اسمه في النموذج.',[MSG,view('معلمو القسم','contact')]);
      return A('ما لقيت الشعبة '+GN[c[0]]+' / '+c[1]+' عندي. هذي صفوف القسم ومعلموها:\n'+list(),[MSG])}
    var ts=T.filter(function(t){return t.cls.some(function(x){return x[0]==c[0]})});
    return A('معلمو الصف '+GN[c[0]]+':\n'+ts.map(function(t){return '• '+t.name+': الشعب '+t.cls.filter(function(x){return x[0]==c[0]}).map(function(x){return x[1]}).join('، ')}).join('\n')+'\nقل لي الشعبة وأحدد لك المعلم.')}
  if(/معلم|مدرس(?!ه)|استاذ/.test(n)&&!/موعد|مقابل|راسل|تواصل|كلم|زياره|ازور/.test(n))
    return A('معلمو القسم وصفوفهم:\n'+list()+'\n\nاكتب صف ابنك وشعبته (مثل 8/3) وأحدد لك معلمه.',[view('معلمو القسم','contact')]);
  if(/(ما|مو|مب|لا)\s*(يقدر|قادر|يفتح|يدخل|يشتغل|ظاهر|يطلع)|مشكل|نسي|خطا|غلط/.test(n)&&/دخول|يدخل|درج|رقم|يفتح|الصفحه/.test(n))
    return A('صفحة الدرجات تنفتح بالرقم الشخصي للطالب فقط. تأكد إنه:\n• اختار صفه واسمه الصحيح.\n• كتب الرقم الشخصي كامل بدون مسافات.\nإذا استمرت المشكلة راسل المعلم ويساعده.',[view('صفحة الدرجات','grades'),MSG]);
  if(/درج|علام|نتيج|مستوي|تقييم|شهاد/.test(n))
    return A('من قسم «درجاتي»: يختار الطالب صفه واسمه ويدخل برقمه الشخصي. الدرجات محمية ولا تنفتح بدون الرقم.\nالعلامة «—» تعني إن الدرجة لم ترصد بعد. لأي استفسار عن مستوى ابنك راسل معلمه.',[view('افتح درجاتي','grades'),MSG]);
  if(/موعد|مقابل|اقابل|لقاء|اجتماع|اكلم|اتصل/.test(n))
    return A('حياك الله. اطلب الموعد من نموذج التواصل: اختر الصف والمعلم، واكتب اسم الطالب والوقت المناسب لك، واترك رقمك إذا تحب يتصل عليك المعلم. ويرد عليك بإذن الله.',[MSG]);
  if(/زياره|ازور|زور|الحضور للمدرسه|اجي المدرسه|اروح المدرسه/.test(n))
    return A('زيارتك تسعدنا. عشان تلقى المعلم موجود وفاضي، رتّب الزيارة مسبقاً من نموذج التواصل: اكتب اسم الطالب وصفه واليوم المناسب لك، ويرد عليك المعلم بالموعد بإذن الله.',[MSG]);
  if(/اختبار|امتحان|اختبارات|مراجع|مذكر|تحضير/.test(n))
    return A('في قسم «الدروس» تلقى مواضيع الاختبار ومذكرات المراجعة.\nموعد الاختبار وتفاصيله يحددها معلم الصف، فاسأله إذا ما كان واضح.',[view('مواضيع الاختبار','exam'),view('مذكرات المراجعة','review'),MSG]);
  if(/حفظ|تلاوه|تسميع|قران|تجويد|سوره|ايات|مزمار|مسابق|مصحف/.test(n))
    return A('آيات التلاوة والحفظ ودرس التلاوة في قسم «التلاوة»، وفيه ملف التلاوة ومصحف ابن رشد للاستماع والتسميع.\nومسابقة مزمار داود من أنشطة القسم في التلاوة. للمشاركة أو متابعة حفظ ابنك كلّم معلمه.',[view('افتح التلاوة','tilawa'),view('الأنشطة','acts'),MSG]);
  if(/واجب|كراس|حل|اجابات|تمارين|نشاط بيتي/.test(n))
    return A('إجابات كراسات الطلبة موجودة في الموقع، والدروس ووين وصلنا في قسم «الدروس».\nإذا عندك سؤال عن واجب محدد راسل المعلم.',[view('إجابات الكراسات','answers'),view('الدروس','dars'),MSG]);
  if(/درس|دروس|وصلتو|وصلنا|منهج|شرح|فيديو/.test(n))
    return A('قسم «الدروس» فيه دروس التربية الإسلامية ووين وصلنا، مع الشرح والعروض.',[view('افتح الدروس','dars')]);
  if(/نشاط|انشطه|فعاليه|مجله|مسابقه|جائزه|فخر/.test(n))
    return A('أنشطة القسم ومسابقاته ومجلته في قسم «الأنشطة».',[view('افتح الأنشطة','acts')]);
  if(/غياب|غايب|مريض|عذر|تاخر|سفر/.test(n))
    return A('سلامته. بلّغ معلمه من نموذج التواصل، واكتب اسم الطالب وصفه وأيام الغياب.',[MSG]);
  if(/راسل|تواصل|رساله|رقم|واتس|ايميل|اكلم المعلم|شكوي|اقتراح/.test(n))
    return A('أسهل طريقة نموذج التواصل: تختار الصف والمعلم، وتكتب اسم الطالب والموضوع، وتترك رقمك إذا تحب نتصل عليك. يستغرق أقل من دقيقة، ورسالتك ما يطلع عليها إلا معلمو القسم.\nوتلقى رد المعلم في صفحة «ردود القسم» بالرقم الشخصي لابنك.',[MSG,RUD,view('صفحة التواصل','contact')]);
  if(/السلام|سلام|مرحب|هلا|صباح|مساء|هاي/.test(n))
    return A('وعليكم السلام ورحمة الله، حياك الله. اسألني عن معلم ابنك، الدرجات، الاختبارات، الحفظ، الواجبات، أو موعد مع المعلم.');
  if(/شكر|يعطيك|مشكور|جزاك|تسلم/.test(n))
    return A('وإياك، في خدمتك أي وقت.');
  return null;
}

/* ---------- chat ---------- */
function add(role,text,acts){
  var d=document.createElement('div');d.className='as-m '+role;
  var t=document.createElement('div');t.textContent=text;d.appendChild(t);
  if(acts&&acts.length){var a=document.createElement('div');a.className='as-act';
    acts.forEach(function(x){var el;
      if(/^https?:/.test(x.go)){el=document.createElement('a');el.href=x.go;el.target='_blank';el.rel='noopener'}
      else if(/\.html/.test(x.go)){el=document.createElement('a');el.href=x.go}
      else{el=document.createElement('button');el.type='button';el.setAttribute('data-go',x.go);el.addEventListener('click',function(){setTimeout(close,0)})}
      el.textContent=x.label;a.appendChild(el)});d.appendChild(a)}
  chat.appendChild(d);chat.scrollTop=chat.scrollHeight}
function ask(q){q=String(q||'').trim();if(!q)return;inp.value='';add('me',q);
  var r=answer(q);
  setTimeout(function(){
    if(r)add('bot',r.t,r.a);
    else add('bot','هذا السؤال ما عندي له إجابة جاهزة. أفضل شي توصله لمعلم ابنك مباشرة من نموذج التواصل.',[MSG]);
  },300)}
p.querySelector('.as-form').addEventListener('submit',function(e){e.preventDefault();ask(inp.value)});
sug.addEventListener('click',function(e){var b=e.target.closest('button');if(b)ask(b.textContent)});

var greeted=false;
function open(){p.classList.add('on');scrim.classList.add('on');fab.hidden=true;
  try{localStorage.setItem('as-seen','1')}catch(e){}var dt=fab.querySelector('.as-dot');if(dt)dt.remove();
  if(!greeted){greeted=true;add('bot','السلام عليكم ورحمة الله، أنا مساعد قسم التربية الإسلامية.\nاسألني عن معلم ابنك، الدرجات، الاختبارات، الحفظ، الواجبات، أو موعد مع المعلم. أو اختر سؤال من الأزرار تحت.')}
  if(matchMedia('(min-width:561px)').matches)setTimeout(function(){inp.focus()},250)}
function close(){p.classList.remove('on');scrim.classList.remove('on');fab.hidden=false}
fab.addEventListener('click',open);scrim.addEventListener('click',close);p.querySelector('.as-x').addEventListener('click',function(){close();fab.focus()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&p.classList.contains('on'))close()});
window.openAssistant=open;
try{if('serviceWorker' in navigator)navigator.serviceWorker.ready.then(function(r){if(r.active)r.active.postMessage('rud-check')})}catch(e){}
})();
