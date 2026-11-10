/* student lookup for the parents' meeting: one card per student from the teacher's grade sheet */
var TALIB=(function(){
function n(v){return typeof v==='number'?v:(v===''||v==null||isNaN(+v)?null:+v)}
function f(x){return x==null?'—':String(Math.round(x*100)/100)}
function norm(s){s=String(s||'');try{s=s.normalize('NFKC')}catch(e){} /* sheets often hold presentation-form letters (ﺑﺎﺳﻢ) that look right but never match typed text */
  return s.replace(/\u0640/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[ً-ْ]/g,'').replace(/\s+/g,' ').trim()}
function clsLabel(c){var m=c.match(/^(\S+)\s+(\d+)$/);return m?m[1]+(/سادس/.test(m[1])?' الابتدائي / ':' الإعدادي / ')+m[2]:c}
/* row -> student; columns follow the ministry sheet: D-G وقفتان، I-K ملف الأعمال، M-O المهمة، Q-R الاختبارات */
function student(cls,r,t){
  var s={cls:cls,no:r[0],id:String(r[1]||''),name:String(r[2]||'').trim(),
    beh1:n(r[3]),aca1:n(r[4]),beh2:n(r[5]),aca2:n(r[6]),
    org:n(r[8]),imp:n(r[9]),ini:n(r[10]),task:[n(r[12]),n(r[13]),n(r[14])],
    t1:n(r[16]),t2:n(r[17])};
  if(t){s.hifz=n(t[3]);s.tilawa=n(t[7]);s.tilTotal=n(t[13]);
    /* the deserved shares: الحفظ من 5 والتلاوة من 15، each only when something was typed */
    s.hifzG=(n(t[3])!=null||n(t[4])!=null)?n(t[6]):null;s.tilG=[7,8,9,10].some(function(i){return n(t[i])!=null})?n(t[12]):null}
  return s;
}
function level(x){return x==null?'none':x>=16?'master':x>=10?'pass':'weak'}
var LV={master:['متقن','ok'],pass:['ناجح ويحتاج دفعة للإتقان','warn'],weak:['يحتاج دعم وخطة علاجية','bad'],none:['','']};
function sum(a){var v=a.filter(function(x){return x!=null});return v.length?v.reduce(function(p,q){return p+q},0):null}
/* only what the teacher typed is shown: an empty cell is never mentioned (no «—», no «لم تُرصد») */
function parts(s){
  var o=[],task=s.task||[],w1=sum([s.beh1,s.aca1]),w2=sum([s.beh2,s.aca2]),pf=sum([s.org,s.imp,s.ini]),tk=sum(task);
  if(s.t1!=null)o.push({k:'t1',t:'الاختبار الأول',v:s.t1,max:20});
  if(s.t2!=null)o.push({k:'t2',t:'الاختبار الثاني',v:s.t2,max:20});
  if(w1!=null||w2!=null){var sub=[];if(w1!=null)sub.push('الوقفة الأولى '+f(w1)+'/8');if(w2!=null)sub.push('الوقفة الثانية '+f(w2)+'/8');
    o.push({k:'obs',t:'الملاحظة المنظمة',v:(w1||0)+(w2||0),max:(w1!=null?8:0)+(w2!=null?8:0),sub:sub.join(' · ')})}
  if(pf!=null)o.push({k:'pf',t:'ملف الأعمال',v:pf,max:12,sub:[['تنظيم',s.org],['تحسين',s.imp],['مبادرات',s.ini]].filter(function(x){return x[1]!=null}).map(function(x){return x[0]+' '+f(x[1])}).join(' · ')});
  if(tk!=null)o.push({k:'task',t:'المهمة',v:tk,max:12,sub:task.map(function(x,i){return x==null?null:'مجال '+(i+1)+': '+f(x)}).filter(Boolean).join(' · ')});
  var qr=sum([s.hifz,s.tilawa]),nu=s.hifzG!==undefined;
  if(nu&&s.hifzG==null&&s.tilG==null)qr=null;
  if(qr!=null)o.push({k:'qr',t:'الحفظ والتلاوة',v:nu?(s.hifzG||0)+(s.tilG||0):s.tilTotal!=null?s.tilTotal:qr,max:nu?(s.hifzG!=null?5:0)+(s.tilG!=null?15:0):20,sub:[['حفظ',s.hifz],['تلاوة',s.tilawa]].filter(function(x){return x[1]!=null}).map(function(x){return x[0]+' '+f(x[1])+'/10'}).join(' · ')});
  return o;
}
function analyse(s,avg){
  var good=[],need=[],L=level(s.t1!=null?s.t1:s.t2),P=parts(s);
  if(!P.length)return {good:[],need:[],L:'none',P:P};
  [['الأول',s.t1],['الثاني',s.t2]].forEach(function(x){var v=x[1],l=level(v);if(v==null)return;
    if(l==='master')good.push('متقن في الاختبار '+x[0]+' ('+f(v)+' من 20)');
    else if(l==='pass')need.push('درجته في الاختبار '+x[0]+' '+f(v)+' من 20، ناجح، والإتقان من 16 فيحتاج يرفعها '+f(16-v));
    else need.push('درجته في الاختبار '+x[0]+' '+f(v)+' من 20، أقل من النجاح ويحتاج خطة علاجية')});
  [['الأولى',s.beh1,s.aca1],['الثانية',s.beh2,s.aca2]].forEach(function(w){
    if(w[1]===4&&w[2]===4)good.push('سلوكه وأداؤه في الحصة ممتاز في الوقفة '+w[0]+' (8 من 8)');
    else{if(w[1]!=null&&w[1]<4)need.push('سلوكه في الحصة (الوقفة '+w[0]+') '+f(w[1])+' من 4');if(w[2]!=null&&w[2]<4)need.push('أداؤه الأكاديمي في الحصة (الوقفة '+w[0]+') '+f(w[2])+' من 4')}});
  var pf=[['الإجراءات التنظيمية (الكتاب والدفتر والحضور)',s.org],['تحسين التعلم',s.imp],['المبادرات',s.ini]];
  if(pf.every(function(p){return p[1]===4}))good.push('ملف أعماله مكتمل (12 من 12)');
  else pf.forEach(function(p){if(p[1]!=null&&p[1]<4)need.push(p[0]+': '+f(p[1])+' من 4')});
  var tk=s.task||[];
  if(tk.length&&tk.every(function(x){return x===4}))good.push('أنجز المهمة كاملة (12 من 12)');
  else tk.forEach(function(x,i){if(x!=null&&x<4)need.push('المهمة، المجال '+(i+1)+': '+f(x)+' من 4')});
  if(s.hifz!=null){if(s.hifz>=8)good.push('حافظ المقرر ('+f(s.hifz)+' من 10)');else if(s.hifz>0)need.push('الحفظ '+f(s.hifz)+' من 10، يحتاج مراجعة في البيت');else need.push('ما سمّع الحفظ المطلوب')}
  if(s.tilawa!=null){if(s.tilawa>=9)good.push('تلاوته متقنة ('+f(s.tilawa)+' من 10)');else if(s.tilawa>0)need.push('التلاوة '+f(s.tilawa)+' من 10، يحتاج تدريب على القراءة');else need.push('ما قرأ التلاوة المطلوبة')}
  return {good:good,need:need,L:L,P:P};
}
function sayIt(s,a){
  var first=s.name.split(' ')[0],out=[];
  if(a.L!=='none')out.push('ابنك '+first+' '+(a.L==='master'?'مستواه ممتاز ولله الحمد':a.L==='pass'?'مستواه جيد وناجح':'يحتاج منا ومنكم وقفة')+'.');
  else if(a.good.length||a.need.length)out.push('ابنك '+first+':');
  if(a.good.length)out.push('من الأشياء الطيبة: '+a.good.slice(0,3).join('، ')+'.');
  if(a.need.length)out.push('ونبي نركّز معه على: '+a.need.slice(0,3).join('، ')+'.');
  else out.push('نبيه يحافظ على هالمستوى، وجزاكم الله خير على متابعتكم.');
  if(a.need.length)out.push('لو تتابعونه في البيت عشر دقايق يوميًا في الحفظ والمراجعة بيفرق معه كثير بإذن الله.');
  return out.join(' ');
}
/* half an A4 page per student, for printing a whole class before the meeting (light ink, two per sheet) */
function slip(s,avg,esc,logo){
  var a=analyse(s,avg),lv=LV[a.L];
  function li(x){return '<li>'+esc(x)+'</li>'}
  return '<section class="sl">'+
   '<div class="sl-h"><img src="'+logo+'" alt=""><div><b>تقرير مستوى الطالب · التربية الإسلامية</b><span>قسم التربية الإسلامية · مدرسة ابن رشد الإعدادية للبنين</span></div></div>'+
   '<div class="sl-n"><div><h3>'+esc(s.name)+'</h3><p>'+esc(clsLabel(s.cls))+(s.id?' · الرقم الشخصي '+esc(s.id):'')+'</p></div>'+(lv[0]?'<span class="sl-pill">'+lv[0]+'</span>':'')+'</div>'+
   (a.P.length?'<table class="sl-t"><tr>'+a.P.map(function(p){return '<th>'+p.t+'</th>'}).join('')+'</tr>'+
   '<tr>'+a.P.map(function(p){return '<td><b>'+f(p.v)+'</b> / '+p.max+(p.k==='t1'&&avg!=null?'<small>متوسط الشعبة '+f(avg)+'</small>':p.sub?'<small>'+esc(p.sub)+'</small>':'')+'</td>'}).join('')+'</tr></table>':'')+
   '<div class="sl-two"><div><h4>نقاط القوة</h4><ul>'+(a.good.slice(0,4).map(li).join('')||'<li>—</li>')+'</ul></div><div><h4>يحتاج متابعة</h4><ul>'+(a.need.slice(0,4).map(li).join('')||'<li>ما عليه ملاحظات</li>')+'</ul></div></div>'+
   '<p class="sl-say">'+esc(sayIt(s,a))+'</p>'+
   '<div class="sl-f"><span>إعداد الملف والتوثيق والمنصة الرقمية: أ. طلال سعود المهلهل</span><span>توقيع ولي الأمر: ..................</span></div>'+
  '</section>';
}
function tile(t,v,max,sub,cls){return '<div class="tl-tile '+(cls||'')+'"><span>'+t+'</span><b>'+v+(max?'<i> / '+max+'</i>':'')+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>'}
/* o.parent: the parents' open-day page (the message is addressed to them) */
function card(s,avg,esc,o){
  o=o||{};var a=analyse(s,avg),lv=LV[a.L];
  var got=0,max=0;a.P.forEach(function(p){if(p.k!=='qr'){got+=p.v;max+=p.max}});
  return '<article class="tl-card">'+
   '<header class="tl-head"><div><h3>'+esc(s.name)+'</h3><p>'+esc(clsLabel(s.cls))+(s.id?' · الرقم الشخصي '+esc(s.id):'')+'</p></div>'+
   (lv[0]?'<span class="tl-pill '+lv[1]+'">'+lv[0]+'</span>':'')+'</header>'+
   (a.P.length?'<div class="tl-tiles">'+a.P.map(function(p){var c=(p.k==='t1'||p.k==='t2')?({master:'ok',pass:'warn',weak:'bad'})[level(p.v)]:'';
     return tile(p.t,f(p.v),p.max,p.k==='t1'&&avg!=null?'متوسط الشعبة '+f(avg):p.sub?esc(p.sub):'',c)}).join('')+'</div>'+
   (max?'<p class="tl-sum">المرصود حتى الآن في المادة: <b>'+f(got)+' من '+max+'</b>'+(a.P.some(function(p){return p.k==='qr'})?' · والحفظ والتلاوة لها درجتها المستقلة.':'.')+'</p>':''):
   '<p class="tl-sum">ما انرصدت له درجات في الملف بعد.</p>')+
   (a.good.length||a.need.length?'<div class="tl-two"><div class="tl-good"><h4>نقاط القوة</h4><ul>'+(a.good.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')||'<li>—</li>')+'</ul></div>'+
   '<div class="tl-need"><h4>يحتاج متابعة</h4><ul>'+(a.need.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')||'<li>ما عليه ملاحظات</li>')+'</ul></div></div>'+
   '<div class="tl-say"><h4>'+(o.parent?'رسالة القسم لكم':'تقوله لولي الأمر')+'</h4><p>'+esc(sayIt(s,a))+'</p></div>':'')+
  '</article>';
}
return {student:student,card:card,slip:slip,say:function(s,avg){return sayIt(s,analyse(s,avg))},norm:norm,clsLabel:clsLabel};
})();
