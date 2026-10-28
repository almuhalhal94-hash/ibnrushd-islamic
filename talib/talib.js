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
  if(t){s.hifz=n(t[3]);s.tilawa=n(t[7]);s.tilTotal=n(t[13])}
  return s;
}
function level(x){return x==null?'abs':x>=16?'master':x>=10?'pass':'weak'}
var LV={master:['متقن','ok'],pass:['ناجح ويحتاج دفعة للإتقان','warn'],weak:['يحتاج دعم وخطة علاجية','bad'],abs:['غاب عن الاختبار','bad']};
function analyse(s,avg){
  var good=[],need=[],L=level(s.t1);
  if(s.t1==null&&s.beh1==null&&s.org==null&&!s.hifz&&!s.tilawa)return {good:[],need:['ما له أي درجة مرصودة في الملف (يمكن منقول أو منقطع، تأكد من الإدارة)'],L:'abs'};
  if(L==='master')good.push('متقن في الاختبار الأول ('+f(s.t1)+' من 20)');
  else if(L==='pass')need.push('درجته في الاختبار الأول '+f(s.t1)+' من 20، ناجح، والإتقان من 16 فيحتاج يرفعها '+f(16-s.t1)+'');
  else if(L==='weak')need.push('درجته في الاختبار الأول '+f(s.t1)+' من 20، أقل من النجاح ويحتاج خطة علاجية');
  else need.push('غاب عن الاختبار الأول');
  if(s.beh1===4&&s.aca1===4)good.push('سلوكه وأداؤه في الحصة ممتاز (4 من 4)');
  else{if(s.beh1!=null&&s.beh1<4)need.push('سلوكه في الحصة '+f(s.beh1)+' من 4');if(s.aca1!=null&&s.aca1<4)need.push('أداؤه الأكاديمي في الحصة '+f(s.aca1)+' من 4')}
  var pf=[['الإجراءات التنظيمية (الكتاب والدفتر والحضور)',s.org],['تحسين التعلم',s.imp],['المبادرات',s.ini]];
  if(pf.every(function(p){return p[1]===4}))good.push('ملف أعماله مكتمل (12 من 12)');
  else pf.forEach(function(p){if(p[1]!=null&&p[1]<4)need.push(p[0]+': '+f(p[1])+' من 4')});
  if(s.hifz!==undefined||s.tilawa!==undefined){ /* no recitation tab in this teacher's file: say nothing about it */
  if(s.hifz>=8)good.push('حافظ المقرر ('+f(s.hifz)+' من 10)');
  else if(s.hifz>0)need.push('الحفظ '+f(s.hifz)+' من 10، يحتاج مراجعة في البيت');
  else need.push('ما سمّع الحفظ المطلوب');
  if(s.tilawa>=9)good.push('تلاوته متقنة ('+f(s.tilawa)+' من 10)');
  else if(s.tilawa>0)need.push('التلاوة '+f(s.tilawa)+' من 10، يحتاج تدريب على القراءة');
  else need.push('ما قرأ التلاوة المطلوبة');
  }
  return {good:good,need:need,L:L};
}
function sayIt(s,a){
  var first=s.name.split(' ')[0],out=[];
  out.push('ابنك '+first+' '+(a.L==='master'?'مستواه ممتاز ولله الحمد':a.L==='pass'?'مستواه جيد وناجح':a.L==='weak'?'يحتاج منا ومنكم وقفة':'غاب عن الاختبار الأول')+'.');
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
   '<div class="sl-n"><div><h3>'+esc(s.name)+'</h3><p>'+esc(clsLabel(s.cls))+(s.id?' · الرقم الشخصي '+esc(s.id):'')+'</p></div><span class="sl-pill">'+lv[0]+'</span></div>'+
   '<table class="sl-t"><tr><th>الاختبار الأول</th><th>الملاحظة المنظمة</th><th>ملف الأعمال</th><th>الحفظ</th><th>التلاوة</th></tr>'+
   '<tr><td><b>'+f(s.t1)+'</b> / 20<small>متوسط الشعبة '+f(avg)+'</small></td><td><b>'+((s.beh1==null&&s.aca1==null)?'—':f((s.beh1||0)+(s.aca1||0)))+'</b> / 8</td><td><b>'+((s.org==null&&s.imp==null&&s.ini==null)?'—':f((s.org||0)+(s.imp||0)+(s.ini||0)))+'</b> / 12</td><td><b>'+f(s.hifz)+'</b> / 10</td><td><b>'+f(s.tilawa)+'</b> / 10</td></tr></table>'+
   '<div class="sl-two"><div><h4>نقاط القوة</h4><ul>'+(a.good.slice(0,4).map(li).join('')||'<li>—</li>')+'</ul></div><div><h4>يحتاج متابعة</h4><ul>'+(a.need.slice(0,4).map(li).join('')||'<li>ما عليه ملاحظات</li>')+'</ul></div></div>'+
   '<p class="sl-say">'+esc(sayIt(s,a))+'</p>'+
   '<div class="sl-f"><span>إعداد الملف والتوثيق والمنصة الرقمية: أ. طلال سعود المهلهل</span><span>توقيع ولي الأمر: ..................</span></div>'+
  '</section>';
}
function tile(t,v,max,sub,cls){return '<div class="tl-tile '+(cls||'')+'"><span>'+t+'</span><b>'+v+(max?'<i> / '+max+'</i>':'')+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>'}
function card(s,avg,esc){
  var a=analyse(s,avg),lv=LV[a.L];
  var obs=(s.beh1==null&&s.aca1==null)?'—':f((s.beh1||0)+(s.aca1||0));
  var pfT=(s.org==null&&s.imp==null&&s.ini==null)?'—':f((s.org||0)+(s.imp||0)+(s.ini||0));
  var got=(s.beh1||0)+(s.aca1||0)+(s.org||0)+(s.imp||0)+(s.ini||0)+(s.t1||0);
  return '<article class="tl-card">'+
   '<header class="tl-head"><div><h3>'+esc(s.name)+'</h3><p>'+esc(clsLabel(s.cls))+(s.id?' · الرقم الشخصي '+esc(s.id):'')+'</p></div>'+
   '<span class="tl-pill '+lv[1]+'">'+lv[0]+'</span></header>'+
   '<div class="tl-tiles">'+
    tile('الاختبار الأول',f(s.t1),20,'متوسط الشعبة '+f(avg),a.L==='master'?'ok':a.L==='pass'?'warn':'bad')+
    tile('الملاحظة المنظمة',obs,8,'سلوك '+f(s.beh1)+' · أداء '+f(s.aca1))+
    tile('ملف الأعمال',pfT,12,'تنظيم '+f(s.org)+' · تحسين '+f(s.imp)+' · مبادرات '+f(s.ini))+
    tile('الحفظ والتلاوة',f(s.tilTotal),20,'حفظ '+f(s.hifz)+'/10 · تلاوة '+f(s.tilawa)+'/10')+
   '</div>'+
   '<p class="tl-sum">المرصود حتى الآن في المادة: <b>'+f(got)+' من 40</b> (الوقفة الأولى + ملف الأعمال + الاختبار الأول). الوقفة الثانية والمهمة والاختبار الثاني لم تُرصد بعد.</p>'+
   '<div class="tl-two"><div class="tl-good"><h4>نقاط القوة</h4><ul>'+(a.good.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')||'<li>—</li>')+'</ul></div>'+
   '<div class="tl-need"><h4>يحتاج متابعة</h4><ul>'+(a.need.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')||'<li>ما عليه ملاحظات</li>')+'</ul></div></div>'+
   '<div class="tl-say"><h4>تقوله لولي الأمر</h4><p>'+esc(sayIt(s,a))+'</p></div>'+
  '</article>';
}
return {student:student,card:card,slip:slip,say:function(s,avg){return sayIt(s,analyse(s,avg))},norm:norm,clsLabel:clsLabel};
})();
