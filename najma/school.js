/* ياسمينة — «كتب مدرستي»: تلاوتي، ديني، وطني البحرين، English ABC، مرسم الحروف.
   كل المحتوى مأخوذ من كتب الصف الأول (الجزء الأول)؛ نص القرآن من tilawa.js (مصدر موثّق). بلا موسيقى ولا وجوه. */
(function(){
var A;window.NJ_SCHOOL=function(api){A=api;reg()};
function S(){return A.S()}
function esc(x){return A.esc(x)}
function has(k){return !!S().sch[k]}
function cnt(p){var n=0,o=S().sch;for(var k in o)if(k.indexOf(p)===0)n++;return n}
function win(k){var fresh=!has(k);S().sch[k]=1;A.save();A.sfx('star');A.confetti(fresh?120:60);return fresh}
function hdr(t,sub,back,arg){return '<div class="top"><button class="ib" data-back="'+(back||'home')+'"'+(arg!=null?' data-arg="'+arg+'"':'')+' aria-label="رجوع">→</button><div class="ttl">'+t+(sub?'<small>'+sub+'</small>':'')+'</div><button class="ib" data-act="mute" aria-label="المؤثرات">'+(S().mute?'🔇':'🔈')+'</button></div>'}
function ban(cls,t,sub,ems){return '<section class="sban '+cls+'"><div class="fl" aria-hidden="true">'+ems.map(function(e,i){return '<i style="--d:'+i+'">'+e+'</i>'}).join('')+'</div><b>'+t+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</section>'}
function bar(n,of){var p=of?Math.round(n/of*100):0;return '<div class="pbar" aria-label="'+n+' من '+of+'"><i style="width:'+p+'%"></i></div>'}
function $(id){return document.getElementById(id)}
function setApp(h){A.app.innerHTML=h}
function shake(el){el.classList.remove('shk');void el.offsetWidth;el.classList.add('shk');A.sfx('no')}
function cele(box,msg,btns){box.innerHTML='<div class="card cele pop"><div class="bigstar">🌟</div><b>'+(msg||A.rnd(A.PRAISE))+'</b></div>'+(btns||'')}
var SUBJ=[
 {k:'sTL',t:'تلاوتي',s:'كتاب تلاوة القرآن',ic:'📖',c:'g1',p:'tl:',of:18},
 {k:'sDIN',t:'ديني',s:'التربية الإسلامية',ic:'🕌',c:'g2',p:'din:',of:0},
 {k:'sWTN',t:'وطني',s:'وطني البحرين',ic:'🇧🇭',c:'g3',p:'wtn:',of:22},
 {k:'sABC',t:'English',s:'ABC وأرقام وخطوط',ic:'🔤',c:'g4',p:'abc:',of:0},
 {k:'sART',t:'مرسم الحروف',s:'لوّني حروفك',ic:'🎨',c:'g5',p:'art:',of:0}];
window.SCHOOL_HOME=function(){return '<h2 class="sh2">🎒 كتب مدرستي</h2><div class="subj">'+SUBJ.map(function(x){var n=cnt(x.p);return '<button class="sj '+x.c+'" data-go="'+x.k+'"><i>'+x.ic+'</i><b>'+x.t+'</b><small>'+x.s+'</small>'+(n?'<em>⭐ '+n+'</em>':'')+'</button>'}).join('')+'</div>'};

/* ================= محرّك الألعاب ================= */
/* اختاري/لوّني الصحيح: items=[[em,label,ok]] ؛ colour=true تبدأ رمادية وتتلوّن */
function gPick(box,o,done){var left=o.items.filter(function(x){return x[2]}).length;
 box.innerHTML='<div class="gq">'+o.q+'</div><div class="pk'+(o.colour?' gray':'')+'">'+A.shuf(o.items).map(function(x){return '<button data-ok="'+(x[2]?1:0)+'" data-w="'+String(x[1]||'').replace(/<[^>]+>/g,'')+'"><span class="e">'+x[0]+'</span>'+(x[1]?'<small>'+x[1]+'</small>':'')+'</button>'}).join('')+'</div>';
 box.querySelectorAll('.pk button').forEach(function(b){b.onclick=function(){if(b.classList.contains('ok'))return;if(b.dataset.ok==='1'){b.classList.add('ok');A.sfx('ok');if(o.say)A.say(b.dataset.w);left--;if(!left)setTimeout(done,700)}else shake(b)}})}
/* رتّبي: steps=[[em,label]] بالترتيب الصحيح؛ تضغط الخطوة التالية */
function gOrder(box,o,done){var k=0,st=o.steps,b0=o.base||1;
 function d(){box.innerHTML='<div class="gq">'+o.q+'</div><ol class="ordl">'+st.slice(0,k).map(function(x,i){return '<li class="pop"><b>'+(i+b0)+'</b><span>'+x[0]+'</span>'+x[1]+'</li>'}).join('')+(k<st.length?'<li class="nx"><b>'+(k+b0)+'</b>؟</li>':'')+'</ol><div class="ordp">'+pool.map(function(x){return '<button data-i="'+x.i+'"><span>'+x.s[0]+'</span>'+x.s[1]+'</button>'}).join('')+'</div>';
  box.querySelectorAll('.ordp button').forEach(function(b){b.onclick=function(){if(+b.dataset.i===k){A.sfx('ok');pool=pool.filter(function(x){return x.i!==k});k++;if(k>=st.length){d();setTimeout(done,700)}else d()}else shake(b)}})}
 var pool=A.shuf(st.map(function(s,i){return {s:s,i:i}}));d()}
/* وصّلي: pairs=[[a,b]] على جولات من 4 */
function gMatch(box,o,done){var rounds=[],P=A.shuf(o.pairs),r=0;for(var i=0;i<P.length;i+=4)rounds.push(P.slice(i,i+4));
 function d(){var R=rounds[r],sel=null,left=R.length,cols=['#ffd1e8','#d6f3fd','#cbf3ec','#ffe8b8'];
  box.innerHTML='<div class="gq">'+o.q+'</div>'+(rounds.length>1?'<div class="c muted">جولة '+(r+1)+' من '+rounds.length+'</div>':'')+'<div class="mtc"><div>'+R.map(function(p,i){return '<button data-a="'+i+'"'+(o.qa?' class="q"':'')+'>'+p[0]+'</button>'}).join('')+'</div><div>'+A.shuf(R.map(function(p,i){return {p:p,i:i}})).map(function(x){return '<button data-b="'+x.i+'">'+x.p[1]+'</button>'}).join('')+'</div></div>';
  box.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){if(b.disabled)return;box.querySelectorAll('[data-a]').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');sel=b;A.sfx('tap')}});
  box.querySelectorAll('[data-b]').forEach(function(b){b.onclick=function(){if(b.disabled)return;if(!sel){shake(b);return}if(sel.dataset.a===b.dataset.b){var c=cols[left%4];sel.style.background=c;b.style.background=c;sel.disabled=b.disabled=true;sel.classList.remove('sel');sel.classList.add('done');b.classList.add('done');sel=null;A.sfx('ok');left--;if(!left){r++;setTimeout(r<rounds.length?d:done,700)}}else{shake(b);shake(sel)}}})}
 d()}
/* صح/خطأ: items=[[em,text,bool]] */
function gTF(box,o,done){var L=A.shuf(o.items),i=0,sc=0;
 function d(){var x=L[i];box.innerHTML='<div class="gq">'+o.q+'</div><div class="c muted">'+(i+1)+' من '+L.length+'</div><div class="card tfc pop"><div class="e">'+x[0]+'</div><p>'+x[1]+'</p></div><div class="tfb"><button class="big" data-v="1">👍 صح</button><button class="big rose" data-v="0">👎 خطأ</button></div>';
  box.querySelectorAll('[data-v]').forEach(function(b){b.onclick=function(){var ok=(b.dataset.v==='1')===x[2];var card=box.querySelector('.tfc');if(ok){sc++;A.sfx('ok');card.classList.add('good')}else{A.sfx('no');card.classList.add('bad')}card.insertAdjacentHTML('beforeend','<p class="fb">'+(ok?'أحسنتِ! ':'انتبهي: ')+(x[2]?'هذا تصرّف صحيح ✅':'هذا تصرّف خاطئ ❌')+'</p>');box.querySelectorAll('[data-v]').forEach(function(z){z.disabled=true});setTimeout(function(){i++;if(i<L.length)d();else done(sc,L.length)},1300)}})}
 d()}
/* أسئلة اختيار: items=[{q,o:[..],a:index,em}] */
function gQuiz(box,o,done){var L=o.items,i=0;
 function d(){var x=L[i],opts=A.shuf(x.o.map(function(t,k){return {t:t,k:k}}));box.innerHTML='<div class="c muted">سؤال '+(i+1)+' من '+L.length+'</div><div class="card qz pop">'+(x.em?'<div class="e">'+x.em+'</div>':'')+'<p>'+x.q+'</p></div><div class="qopts">'+opts.map(function(p){return '<button data-k="'+p.k+'">'+p.t+'</button>'}).join('')+'</div>';
  box.querySelectorAll('[data-k]').forEach(function(b){b.onclick=function(){if(+b.dataset.k===x.a){b.classList.add('ok');A.sfx('ok');box.querySelectorAll('[data-k]').forEach(function(z){z.disabled=true});setTimeout(function(){i++;if(i<L.length)d();else done()},800)}else shake(b)}})}
 d()}
/* بطاقات قصة: cards=[[em,text]] */
function gStory(box,o,done){var i=0,C=o.cards;
 function d(){var x=C[i];box.innerHTML=(o.q?'<div class="gq">'+o.q+'</div>':'')+'<div class="card story pop"><div class="e">'+x[0]+'</div><p>'+x[1]+'</p>'+(x[2]?'<div class="aya">﴿'+x[2][0]+'﴾<small>'+x[2][1]+'</small></div>':'')+'</div><div class="dots">'+C.map(function(_,k){return '<i class="'+(k===i?'on':k<i?'done':'')+'"></i>'}).join('')+'</div><div class="row">'+(i?'<button class="big ghost grow" id="sp">→ السابقة</button>':'')+'<button class="big grow" id="sn">'+(i<C.length-1?'التالية ←':'فهمت ✅')+'</button></div>';
  $('sn').onclick=function(){A.sfx('tap');if(i<C.length-1){i++;d()}else done()};if($('sp'))$('sp').onclick=function(){i--;d()}}
 d()}
var G={pick:gPick,order:gOrder,match:gMatch,tf:gTF,quiz:gQuiz,story:gStory};
var GNAME={story:'📚 أقرأ وأفهم',pick:'🎯 اختاري',order:'🔢 رتّبي',match:'🔗 وصّلي',tf:'👍👎 صح أم خطأ',quiz:'❓ أسئلة'};
/* مشغّل درس متعدد الخطوات */
function runSteps(title,sub,back,arg,steps,key,after){var i=0;
 function d(){A.stopAudio();var s=steps[i];setApp(hdr(title,sub,back,arg)+'<div class="steps">'+steps.map(function(_,k){return '<i class="'+(k<i?'done':k===i?'on':'')+'"></i>'}).join('')+'</div><div class="stp">'+(s.label||GNAME[s.type]||'')+'</div><div id="gb" class="gbox"></div>');
  var box=$('gb');var fn=s.run||G[s.type];fn(box,s,function(){i++;window.scrollTo(0,0);if(i<steps.length)d();else fin()})}
 function fin(){A.stopAudio();var fresh=win(key);setApp(hdr(title,sub,back,arg)+'<div id="gb"></div>');cele($('gb'),fresh?'ربحتي نجمة جديدة! ⭐':A.rnd(A.PRAISE),(after||'')+'<button class="big sun" id="again">🔁 مرة ثانية</button><button class="big ghost" data-back="'+back+'"'+(arg!=null?' data-arg="'+arg+'"':'')+'>رجوع</button>');$('again').onclick=function(){i=0;d()}}
 d()}

/* ================= 📖 تلاوتي ================= */
function tlKey(i){return 'tl:'+i}
function vTL(){var n=cnt('tl:');setApp(hdr('تلاوتي 📖','كتاب تلاوة القرآن الكريم — الصف الأول')+ban('b-tl','١٨ درسًا من كتابك','استمعي، حاكي، واقرئي الكلمات',['🌙','⭐','📖','✨','🕋'])+bar(n,TL.length)+
 '<div class="lessons">'+TL.map(function(L,i){return '<button class="les'+(has(tlKey(i))?' done':'')+'" data-go="sTLl" data-arg="'+i+'"><span class="no">'+(i+1)+'</span><b>سورة '+L.t+'</b><small>الآيات '+L.f+'–'+L.to+'</small><em>'+(has(tlKey(i))?'⭐':'')+'</em></button>'}).join('')+'</div><p class="note">🎧 التلاوة بصوت الشيخ الحصري (المعلّم) من everyayah.com، وأول مرة تحتاج نت.</p>')}
function ayList(L){return L.a.map(function(t,k){return [L.f+k,t]})}
function listenStep(L){return {label:'🎧 أستمع إلى معلّمي وأحاكيه',run:function(box,s,done){var reps=1,playing=false;
 var bas=(L.f===1&&L.n!==1&&L.n!==9);
 box.innerHTML='<div class="card"><div class="ayat" id="tla">'+(bas?'<span class="basm">'+TL_BAS+'</span>':'')+ayList(L).map(function(x,k){return '<span class="ay" data-k="'+k+'" role="button" tabindex="0">'+x[1]+' <span class="num">'+x[0]+'</span></span> '}).join('')+'</div><p class="c muted mt">اضغطي على أي آية تسمعينها لحالها</p></div><div class="row"><button class="big sky grow" id="pa">🔊 استمعي للدرس</button><button class="ib" id="rp" aria-label="التكرار" style="width:72px;font-size:1.05rem;font-weight:800">×1</button></div><button class="big" id="ok">سمعت وحاكيت ✅</button>';
 function hl(k){box.querySelectorAll('.ay').forEach(function(e){e.classList.toggle('now',+e.dataset.k===k)});var n=box.querySelector('.ay.now');if(n&&n.scrollIntoView)n.scrollIntoView({block:'nearest',behavior:'smooth'})}
 function playFrom(list,rep){A.stopAudio();var tok=A.ptok(),r=0;$('pa').textContent='⏹️ إيقاف';playing=true;
  function step(k){if(A.ptok()!==tok)return;if(k>=list.length){r++;if(r<rep){setTimeout(function(){step(0)},700);return}hl(-1);playing=false;if($('pa'))$('pa').textContent='🔊 استمعي للدرس';return}
   var pre=(k===0&&bas&&list[0]===0)?A.playAyah(1,1):Promise.resolve(true);pre.then(function(){if(A.ptok()!==tok)return false;hl(list[k]);return A.playAyah(L.n,L.f+list[k])}).then(function(ok){if(A.ptok()!==tok)return;setTimeout(function(){step(k+1)},450)})}
  step(0)}
 $('pa').onclick=function(){if(playing){A.stopAudio();playing=false;hl(-1);this.textContent='🔊 استمعي للدرس';return}playFrom(L.a.map(function(_,k){return k}),reps)};
 $('rp').onclick=function(){reps=reps===1?3:1;this.textContent='×'+reps;A.sfx('tap')};
 box.querySelectorAll('.ay').forEach(function(e){e.onclick=function(){playFrom([+e.dataset.k],1)}});
 $('ok').onclick=function(){A.stopAudio();done()}}}}
function wordsStep(L){return {label:'📝 أتدرّب على قراءة الكلمات',run:function(box,s,done){var seen={},cols=['#c8f0d0','#ffd1e8','#ffe0a8','#d6f3fd','#e4d6ff'];
 box.innerHTML='<p class="c">اضغطي كل بطاقة واسمعي الآية اللي فيها الكلمة 👂</p><div class="wrd">'+L.w.map(function(w,i){return '<button data-i="'+i+'" style="background:'+cols[i%5]+';--r:'+((i%2?1:-1)*(2+i%3))+'deg">'+w[1]+'</button>'}).join('')+'</div><div class="card" id="wa" style="display:none"></div><button class="big" id="ok" disabled>قرأتها كلها ✅</button>';
 box.querySelectorAll('.wrd button').forEach(function(b){b.onclick=function(){var w=L.w[+b.dataset.i];seen[b.dataset.i]=1;b.classList.add('seen');var t=L.a[w[0]-L.f];var wa=$('wa');wa.style.display='';wa.innerHTML='<div class="ayat sm">'+t.replace(w[1],'<mark>'+w[1]+'</mark>')+' <span class="num">'+w[0]+'</span></div>';A.stopAudio();A.playAyah(L.n,w[0]);if(Object.keys(seen).length>=L.w.length)$('ok').disabled=false}});
 $('ok').onclick=function(){A.stopAudio();done()}}}}
function orderStep(L){var n=L.a.length,len=Math.min(4,n),st=n>len?Math.floor(Math.random()*(n-len+1)):0;
 return {label:'🧩 رتّبي الآيات',run:function(box,s,done){var steps=L.a.slice(st,st+len).map(function(t){return ['','<span class="qt">'+t+'</span>']});gOrder(box,{q:'اضغطي الآيات بالترتيب الصحيح 🧩 (الرقم = رقم الآية)',steps:steps,base:L.f+st},done)}}}
function vTLl(i){i=+i;var L=TL[i],steps=[];
 if(L.f===1)steps.push({type:'quiz',label:'🕋 أتعرّف سورتي',items:[{em:'🕋 🕌',q:'سورة '+L.t+': مكّيّة أم مدنيّة؟',o:['مكّيّة 🕋','مدنيّة 🕌'],a:L.mk?0:1},{em:'🔢',q:'كم عدد آيات سورة '+L.t+'؟',o:A.shuf([L.tot,L.tot+2,Math.max(2,L.tot-1)]).map(String),a:-1}]});
 if(steps[0])steps[0].items[1].a=steps[0].items[1].o.indexOf(String(L.tot));
 steps.push(listenStep(L));steps.push(wordsStep(L));
 steps.push({type:'match',label:'💡 أتعرّف معاني المفردات',q:'وصّلي الكلمة بمعناها',pairs:L.v,qa:true});
 steps.push(orderStep(L));
 runSteps('سورة '+L.t,'الدرس '+(i+1)+' · الآيات '+L.f+'–'+L.to,'sTL',null,steps,tlKey(i),i+1<TL.length?'<button class="big sky" data-rep data-go="sTLl" data-arg="'+(i+1)+'">الدرس التالي ←</button>':'')}

/* ================= 🕌 ديني ================= */
var AY=window.TL_AY||{};
function tlLink(name){for(var i=0;i<TL.length;i++)if(TL[i].t===name)return '<button class="big sky" data-go="sTLl" data-arg="'+i+'">📖 درس سورة '+name+' في «تلاوتي»</button>';return ''}
var DIN=[
 {u:'العقيدة',ic:'☀️',c:'u1',L:[
  {id:'mun',t:'الله المُنعِم',ic:'🎁',steps:[
   {type:'story',cards:[['🍎🍞🍇','الطعام نعمة من الله تعالى.'],['💧🏞️','الماء نعمة من الله تعالى.'],['🩺💪','الصحة نعمة من الله تعالى.'],['✋🦶👂','أعضاء الجسم نعمة من الله تعالى.'],['🛏️🌙','النوم نعمة من الله تعالى.'],['💰','المال نعمة من الله تعالى.'],['🤲','أقرأ وأتدبّر: قال الله تعالى:',AY.nium],['🌟','أتعلّم: المسلم يحمد الله ويشكره على نِعَمه الكثيرة.']]},
   {type:'pick',label:'🤲 قولي: الحمد لله',q:'المسي كل نعمة وقولي «الحمد لله» 🤲',items:[['🍎','الطعام',1],['💧','الماء',1],['🩺','الصحة',1],['🛏️','النوم',1],['👀','النظر',1],['🏠','البيت',1]],colour:true}]},
  {id:'wahid',t:'الله الواحد',ic:'☝️',steps:[
   {type:'story',cards:[['🌳🏞️','الله وحده الخالق.'],['🍽️','الله وحده الرزّاق.'],['💊','الله وحده الشافي من المرض.'],['🕌','الله وحده المستحق للعبادة.'],['🤲','أنا طفل مسلم أعبد الله وحده: أصلّي له، وأدعوه سبحانه.']]},
   {type:'quiz',items:[{em:'🌳',q:'من خلق الأشجار والبحار؟',o:['الله وحده','الشمس'],a:0},{em:'🍽️',q:'من يرزقنا الطعام؟',o:['الله الرزّاق','القمر'],a:0},{em:'🕌',q:'لمن نصلّي؟',o:['لله وحده','للنجوم'],a:0}]}],after:'الإخلاص'},
  {id:'fat',t:'سورة الفاتحة',ic:'📖',link:'الفاتحة'},{id:'ikh',t:'سورة الإخلاص',ic:'📖',link:'الإخلاص'}]},
 {u:'العبادات',ic:'💧',c:'u2',L:[
  {id:'nath',t:'المسلم نظيف',ic:'🧼',steps:[
   {type:'story',cards:[['🧼🛁','المسلم يستحمّ بالماء والصابون.'],['🚰','ويتوضّأ للصلاة.'],['👕','ويرتدي الملابس النظيفة.'],['🪥','وينظّف أسنانه بالسواك والفرشاة.'],['🪮','ويمشّط شعره.'],['🏫','ويحافظ على نظافة صفّه.'],['✨','أقرأ وأتدبّر: قال الله تعالى:',AY.tahr],['🌟','أتعلّم: أحافظ على نظافة جسمي وثوبي ومدرستي.']]},
   {type:'tf',q:'تصرّف نظيف؟',items:[['🧼','أغسل يديّ بالماء والصابون',true],['🪥','أنظّف أسناني بالفرشاة',true],['🗑️','أرمي الورق في سلة المهملات',true],['👕','ألبس ملابس متّسخة للمدرسة',false],['🍫','أرمي الأكل على أرض الصف',false],['🪮','أمشّط شعري',true]]}]},
  {id:'miyah',t:'أنواع المياه الطاهرة',ic:'💧',steps:[
   {type:'story',cards:[['💧','المياه التي يجوز التطهّر بها سبعة:'],['🌧️','١ – ماء المطر'],['🌊','٢ – ماء البحر'],['🏞️','٣ – ماء النهر'],['🪣','٤ – ماء البئر'],['⛲','٥ – ماء العين'],['❄️','٦ – ماء الثلج'],['🧊','٧ – ماء البَرَد'],['🚿','المسلم يستعمل الماء الطاهر في: الوضوء، والاغتسال.'],['🌱','أقرأ وأتدبّر: قال الله تعالى:',AY.maa]]},
   {type:'pick',label:'🎨 لوّني المياه الطاهرة',q:'لوّني المياه اللي نتطهّر فيها فقط 💧',colour:true,items:[['🌧️','المطر',1],['🌊','البحر',1],['🏞️','النهر',1],['🪣','البئر',1],['⛲','العين',1],['❄️','الثلج',1],['🧊','البَرَد',1],['🥛','الحليب',0],['🧃','العصير',0]]},
   {type:'match',q:'وصّلي الجملة بتكملتها',pairs:[['تطهر الملابس بغسلها','بالماء'],['أستعمل الماء الطاهر في الوضوء و','الاغتسال']]}]},
  {id:'wudu',t:'الوضوء',ic:'🚿',steps:[
   {type:'story',cards:[['🌳💧','مرّ الحسن والحسين رضي الله عنهما وهما صبيّان صغيران على رجل لا يحسن الوضوء.'],['🤝','فأرادا أن يعلّماه الوضوء الصحيح بطريقة مهذّبة، فتقدّم إليه الحسن وقال: إن أخي يظنّ أنه يتوضّأ أحسن مني، تعالَ فاحكم بيننا.'],['🚰','توضّأ الحسن والحسين أمام الرجل، فرأى أنهما يتوضّآن أحسن منه.'],['💚','فشكرهما على حُسن صنيعهما، واعترف بأنه تعلّم الوضوء منهما.']]},
   {type:'order',label:'🔢 رتّبي خطوات الوضوء',q:'اضغطي خطوات الوضوء بالترتيب 💧',steps:[['🤲','أنوي الوضوء، وأقول: بسم الله، وأغسل كفّيّ ثلاث مرات.'],['💦','أتمضمض بالماء ثلاث مرات.'],['🌬️','أستنشق الماء وأستنثره ثلاث مرات.'],['💧','أغسل وجهي كله ثلاثًا.'],['👉','أغسل يدي اليمنى من الأصابع إلى المرفق ثلاثًا.'],['👈','أغسل يدي اليسرى من الأصابع إلى المرفق ثلاثًا.'],['🫧','أمسح رأسي أو بعضه بالماء.'],['👂','أمسح أذنيّ: ظاهرهما وباطنهما بالماء.'],['🦶','أغسل رجلي اليمنى إلى الكعبين ثلاثًا.'],['🦶🏻','أغسل رجلي اليسرى إلى الكعبين ثلاثًا.']]},
   {type:'story',label:'🤲 دعاء بعد الوضوء',cards:[['🤲','أقول الدعاء الآتي بعد الوضوء: «أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمدًا عبده ورسوله، اللهم اجعلني من التوابين، واجعلني من المتطهرين».']]},
   {type:'quiz',items:[{em:'🕌',q:'متى يتوضأ المسلم؟',o:['قبل الصلاة','قبل النوم في الحديقة'],a:0},{em:'📖',q:'ومتى أيضًا؟',o:['قبل تلاوة القرآن الكريم','قبل اللعب'],a:0}]}]},
  {id:'kaw',t:'سورة الكوثر',ic:'📖',link:'الكوثر'}]},
 {u:'السيرة',ic:'🐪',c:'u3',L:[
  {id:'fil',t:'قصة الفيل',ic:'🐘',steps:[
   {type:'story',cards:[['🐘🕋','أراد أبرهة الحبشي أن يهدم الكعبة المشرّفة، فجهّز جيشًا عظيمًا يرافقه فيل كبير، وسار بهم إلى مكة المكرمة.'],['⛰️','ولما سمع أهل مكة بقدوم أبرهة وجيشه خرجوا منها خائفين.'],['🐦🪨','فأرسل الله على جيش أبرهة طيرًا أبابيل، ألقت عليهم حجارة من سجّيل، وقضت عليهم.'],['🕋✨','وحفظ الله الكعبة المشرّفة.']]},
   {type:'order',q:'رتّبي أحداث القصة 🐘',steps:[['🐘','جهّز أبرهة جيشًا معه فيل كبير.'],['⛰️','خرج أهل مكة منها خائفين.'],['🐦','أرسل الله طيرًا أبابيل.'],['🪨','ألقت عليهم حجارة من سجّيل.']]}],after:'الفيل'},
  {id:'mwld',t:'مولد الرسول ﷺ',ic:'🌙',steps:[
   {type:'story',cards:[['🕋','وُلد سيدنا محمد ﷺ بمكة المكرمة يوم الإثنين ١٢ ربيع الأول من عام الفيل.'],['🐪','ينتسب سيدنا محمد ﷺ إلى قبيلة قريش.'],['💚','أبوه عبد الله بن عبد المطلب، وأمه آمنة بنت وهب.'],['🌙','عاش يتيمًا؛ لأن أباه مات وهو في بطن أمه.'],['🏡','ماتت أمه عندما أصبح عمره ست سنوات، فرعاه جده عبد المطلب.'],['🤝','وبعد موت جده قام برعايته عمه أبو طالب.'],['🌟','أتعلّم: اسم الرسول ﷺ: محمد بن عبد الله بن عبد المطلب بن هاشم بن عبد مناف القرشي.']]},
   {type:'match',label:'🔗 أنظّم مفاهيمي',q:'وصّلي كل كلمة بالمعلومة الصحيحة',pairs:[['مكان ولادته','مكة المكرمة'],['زمان ولادته','الإثنين ١٢ ربيع الأول من عام الفيل'],['قبيلته','قريش'],['والده','عبد الله بن عبد المطلب'],['أمه','آمنة بنت وهب'],['جده','عبد المطلب'],['عمه','أبو طالب']]}]},
  {id:'qur',t:'سورة قريش',ic:'📖',link:'قريش'},
  {id:'rad',t:'رضاعة الرسول ﷺ',ic:'🐑',steps:[
   {type:'story',cards:[['⛺🐪','كان العرب قديمًا يختارون المراضع لأولادهم من البادية؛ لتقوى أجسامهم، ويتقنوا اللسان العربي في مهدهم.'],['🐑','اختار عبد المطلب لحفيده اليتيم «محمد» مرضعًا من بني سعد بن بكر، تُدعى «حليمة السعدية».'],['🏜️','أرضعت حليمة السعدية الرسول ﷺ مدة سنتين وأشهر، في ديار بني سعد بن بكر.'],['✨','بارك الله لحليمة في رزقها طوال مدة رضاع الرسول ﷺ.'],['🌟','أتعلّم: أول من أرضع النبي ﷺ «ثُويبة» جارية أبي لهب.']]},
   {type:'quiz',items:[{em:'🐑',q:'من أرضعت الرسول ﷺ في البادية؟',o:['حليمة السعدية','آمنة بنت وهب'],a:0},{em:'🌟',q:'من أول من أرضع النبي ﷺ؟',o:['ثُويبة','حليمة السعدية'],a:0},{em:'✨',q:'ماذا حدث لرزق حليمة؟',o:['بارك الله فيه','قلّ ونقص'],a:0}]}]}]},
 {u:'الأخلاق',ic:'💖',c:'u4',L:[
  {id:'adab',t:'آداب تلاوة القرآن',ic:'📖',steps:[
   {type:'story',cards:[['📖💚','أحبّ تلاوة القرآن الكريم لأنها تقرّبني من الله تعالى.'],['🏫🕌🏠','أتعلّم تلاوة القرآن الكريم في المدرسة والمسجد والبيت.'],['🎙️','أرتّل القرآن الكريم كما أمرنا الله تعالى في قوله:',AY.tartil],['🛡️','الاستعاذة تعني قول: أعوذ بالله من الشيطان الرجيم.'],['🌸','البسملة تعني قول: بسم الله الرحمن الرحيم.']]},
   {type:'tf',q:'من آداب التلاوة؟',items:[['🚰','الوضوء قبل التلاوة',true],['🧎','الجلوس على هيئة حسنة، مستقبلًا القبلة',true],['🛡️','الاستعاذة فالبسملة قبل افتتاح التلاوة',true],['🎙️','تحسين الصوت في التلاوة',true],['🍪','الأكل أو الشرب في أثناء التلاوة',false],['💬','الكلام أو الضحك في أثناء التلاوة',false],['🧸','اللعب والعبث بشيء في أثناء التلاوة',false]]}]},
  {id:'sidq',t:'الصدق',ic:'⭐',steps:[
   {type:'story',cards:[['🐪','سافر صبي صغير، فاعترض بعض اللصوص طريقه وسألوه: ما معك؟ فقال: معي أربعمائة دينار.'],['💰','فاستغرب اللصوص وفتّشوه، فوجدوا معه أربعمائة دينار كما قال، فأخذوه إلى زعيمهم.'],['❓','فسأله الزعيم: ما الذي جعلك تخبرهم بما معك من النقود؟ فقال له: أمي أوصتني بالصدق دائمًا.'],['💚','خجل اللصوص وندموا على فعلهم، وأعادوا المال إلى الصغير وتركوه.'],['🌟','قال الرسول ﷺ: «إنّ الصدق يهدي إلى البرّ، وإنّ البرّ يهدي إلى الجنّة».'],['✅','الصدق: أن تقول الحقيقة ولا تكذب. والصدق يُنجّي صاحبه من المهالك، وعُرف الرسول ﷺ بالصادق الأمين، والله ورسوله يحبّان المسلم الصادق.']]},
   {type:'tf',q:'هل هذا صدق؟',items:[['🥛','انكسر الكأس فقلت لماما الحقيقة',true],['🧸','أخذت لعبة أختي وقلت: ما أخذتها',false],['📝','نسيت واجبي فقلت لمعلمتي الصدق',true],['🍬','أكلت الحلاوة وقلت: أخوي أكلها',false],['🏆','خسرت في اللعب وقلت: أنا فزت',false]]}]},
  {id:'amana',t:'الأمانة',ic:'🤝',steps:[
   {type:'story',cards:[['🕋','عُرف الرسول ﷺ بين أهل مكة بأمانته، فأحبّوه واحترموه، فكان أحدهم إذا أراد سفرًا وضع أمواله عنده.'],['🎁','وكان الرسول ﷺ يحافظ على أمانات الناس ويردّها إليهم حين يطلبونها، فلُقّب بـ«الأمين».'],['🐪🐪','ولأمانة الرسول ﷺ طلبت منه السيدة خديجة رضي الله عنها أن يُتاجر بأموالها.'],['🌙','وعندما أراد الرسول ﷺ أن يهاجر من مكة المكرمة أوصى ابن عمه علي بن أبي طالب رضي الله عنه أن يردّ الأمانات إلى أصحابها.']]},
   {type:'quiz',items:[{em:'🌟',q:'بماذا لُقّب الرسول ﷺ؟',o:['الأمين','القوي'],a:0},{em:'🤝',q:'من أوصاه الرسول ﷺ أن يردّ الأمانات؟',o:['علي بن أبي طالب','أبو لهب'],a:0}]},
   {type:'tf',q:'هل هذه أمانة؟',items:[['✏️','لقيت قلم صديقتي فرجعته لها',true],['🎒','أخذت شيء مو لي من شنطة زميلتي',false],['📦','أعطتني ماما غرض أوصله لجدتي فأوصلته',true],['🪙','لقيت فلوس في الصف وسلّمتها للمعلمة',true]]}]}]}
];
function dinL(id){for(var u=0;u<DIN.length;u++)for(var k=0;k<DIN[u].L.length;k++)if(DIN[u].L[k].id===id)return DIN[u].L[k]}
function vDIN(){var tot=0,dn=0;DIN.forEach(function(U){U.L.forEach(function(l){if(!l.link){tot++;if(has('din:'+l.id))dn++}})});
 setApp(hdr('ديني 🕌','التربية الإسلامية — الصف الأول')+ban('b-din','دروس كتابي بالألعاب','العقيدة · العبادات · السيرة · الأخلاق',['🕌','🌙','⭐','💧','🤲'])+bar(dn,tot)+DIN.map(function(U){return '<section class="unit '+U.c+'"><h3>'+U.ic+' '+U.u+'</h3><div class="ul">'+U.L.map(function(l){var lk=l.link,d=lk?has('tl:'+TL.findIndex(function(x){return x.t===lk})):has('din:'+l.id);return lk?'<button class="les sm'+(d?' done':'')+'" data-go="sTLl" data-arg="'+TL.findIndex(function(x){return x.t===lk})+'"><span class="no">'+l.ic+'</span><b>'+l.t+'</b><small>في «تلاوتي»</small><em>'+(d?'⭐':'')+'</em></button>':'<button class="les'+(d?' done':'')+'" data-go="sDINl" data-arg="'+l.id+'"><span class="no">'+l.ic+'</span><b>'+l.t+'</b><em>'+(d?'⭐':'')+'</em></button>'}).join('')+'</div></section>'}).join('')+'<p class="note">🎵 الأناشيد في كتابك (نشيد النظافة، أحب الطهارة) ردّديها مع أهلك.</p>')}
function vDINl(id){var l=dinL(id);if(!l){A.go('sDIN');return}runSteps(l.ic+' '+l.t,'ديني','sDIN',null,l.steps,'din:'+id,l.after?tlLink(l.after):'')}

/* ================= 🇧🇭 وطني البحرين ================= */
var WT=[['حبّ الوطن','عادل علي البنكي',10],['وطني','مهدي صلاح الجويدي',14],['حروف العرب','عادل علي البنكي',17],['معلّمتي','ناصر الفايز',20],['أنشودة (ضاد العرب)','عادل علي البنكي',23],['المدرسة','أحمد شوقي',26],['أنا الشجرة','أسعد الديري',29],['بلدي البحرين','عادل علي البنكي',31],['الحنين إلى الوطن','يعقوب عبدالعزيز الرشيد',34],['أوال مهد العُلا','أحمد محمد آل خليفة',38],['الوحدة الوطنية','معروف الرصافي',42],['راعي الميثاق','عادل علي البنكي',45],['هذي هي البحرين','أحمد محمد آل خليفة',48],['البحرين نفسي','عادل علي البنكي',51],['رجال الغد','حافظ إبراهيم',54],['وسام على صدر الوطن','محمد حسن كمال الدين',57],['رمز الحضارة','محمد عبدالعال العتيبي',60],['أنشودة الأخوّة','عزيز عبدالله الوسلاتي',63],['إلى العمل','أحمد الحباشة',66],['العيد الوطني المجيد','عادل علي البنكي',69]];
function vWTN(){var n=0;WT.forEach(function(_,i){if(has('wtn:p'+i))n++});
 var pearls=WT.map(function(w,i){return '<button class="prl'+(has('wtn:p'+i)?' on':'')+'" data-i="'+i+'" aria-label="'+w[0]+'">'+(i+1)+'</button>'}).join('');
 setApp(hdr('وطني البحرين 🇧🇭','نصوص وأناشيد وطنية')+ban('b-wtn','أحبّ وطني البحرين','لؤلؤة الخليج 🦪',['🇧🇭','🦪','🌴','⛵','💚'])+
 '<div class="tiles"><button class="tile r" data-go="sFLAG"><i>🏳️‍🎨</i>لوّني العلم'+(has('wtn:flag')?'<small>⭐ لوّنتيه</small>':'')+'</button><button class="tile m" data-go="sWTNv"><i>💚</i>أحبّ وطني'+(has('wtn:val')?'<small>⭐</small>':'')+'</button></div>'+
 '<section class="card"><h3 class="c" style="margin:0">🦪 عقد اللؤلؤ</h3><p class="c muted" style="margin:4px 0 0">كل نص تقرينه مع أهلك من كتاب «وطني البحرين» = لؤلؤة تلمع ('+n+' من '+WT.length+')</p><div class="pearls" role="group" aria-label="عقد اللؤلؤ">'+pearls+'</div><div id="pc"></div></section>');
 A.app.querySelectorAll('.prl').forEach(function(g){g.onclick=function(){var i=+g.dataset.i,w=WT[i],on=has('wtn:p'+i);A.sfx('tap');$('pc').innerHTML='<div class="card pcard pop"><b>'+(i+1)+'. '+w[0]+'</b><p>شعر: '+w[1]+'</p><p class="muted">📕 كتاب «وطني البحرين» صفحة '+w[2]+'</p><button class="big '+(on?'ghost':'sun')+'" id="rd">'+(on?'✅ قرأته — لؤلؤة لامعة':'قرأته مع أهلي 🦪')+'</button></div>';$('rd').onclick=function(){if(!on){win('wtn:p'+i);vWTN();A.toast('لؤلؤة جديدة! 🦪✨')}}}})}
function vWTNv(){runSteps('أحبّ وطني 💚','وطني البحرين','sWTN',null,[{type:'tf',q:'هل هذا يدلّ على حبّ الوطن؟',items:[['🌴','أحافظ على نظافة شوارع وطني وحدائقه',true],['🇧🇭','أحترم علم بلادي',true],['🖍️','أكتب وأرسم على جدران المدرسة',false],['🤝','أحبّ أهل بلدي وأتعاون معهم',true],['🌳','أكسر أغصان الأشجار في الحديقة',false],['🏫','أحترم معلّمتي وأتعلّم بجدّ',true],['💡','أطفئ النور إذا طلعت من الغرفة',true],['🚱','أترك الماء مفتوحًا وأنا ألعب',false]]}],'wtn:val')}
function vFLAG(){var cur='#ce1126',fill={w:'#ffffff00',r:'#ffffff00'};var PAL=['#ce1126','#ffffff','#2ec4b6','#4cc9f0','#ffd166','#9b72cf'];
 var zig='125,0 200,30 125,60 200,90 125,120 200,150 125,180 200,210 125,240 200,270 125,300';
 function d(){setApp(hdr('لوّني علم البحرين 🇧🇭','اختاري اللون ثم المسي الجزء','sWTN')+'<div class="card c"><svg class="flag" viewBox="0 0 500 300" role="img" aria-label="علم البحرين للتلوين"><rect width="500" height="300" fill="#efe4ea"/><polygon id="fw" points="0,0 '+zig+' 0,300" fill="'+fill.w+'" /><polygon id="fr" points="'+zig+' 500,300 500,0" fill="'+fill.r+'"/><polygon points="0,0 '+zig+' 0,300" fill="none" stroke="#7a3d5c" stroke-width="5" stroke-linejoin="round"/><rect x="0" y="0" width="500" height="300" fill="none" stroke="#7a3d5c" stroke-width="6"/></svg><p class="muted" style="margin:8px 0 0">تلميح: علم بلادي أحمر وأبيض، فيه ٥ مثلثات بيضاء 🇧🇭</p></div><div class="pal">'+PAL.map(function(c){return '<button style="background:'+c+'" data-c="'+c+'" class="'+(c===cur?'on':'')+'" aria-label="لون"></button>'}).join('')+'</div>');
  A.app.querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){cur=b.dataset.c;A.sfx('tap');d()}});
  ['fw','fr'].forEach(function(id){$(id).onclick=function(){fill[id==='fw'?'w':'r']=cur;A.sfx('tap');d();if(fill.w==='#ffffff'&&fill.r==='#ce1126'){win('wtn:flag');A.app.insertAdjacentHTML('beforeend','<div class="card cele pop"><div class="bigstar">🇧🇭</div><b>هذا علم البحرين! أحسنتِ 💚</b></div>')}}})}
 d()}

/* ================= 🔤 English ABC ================= */
/* من كتاب الحروف: كلمة الحرف الصغير + كلمة الحرف الكبير */
var LET=[['a','apple','🍎',"Abu Saiba'"],['b','bike','🚲','Bahrain'],['c','car','🚗','Cairo'],['d','doll','🪆','Duraz'],['e','egg','🥚','East Riffa'],['f','fish','🐟','Friday'],['g','guitar','🎸','Grayya'],['h','hat','👒','Hawar'],['i','ice cream','🍦','Ismail'],['j','jumper','🧶','Jassrah'],['k','kite','🪁','Kuwait'],['l','lion','🦁','Laila'],['m','mouse','🐭','Manama'],['n','nose','👃','Nuwaidrat'],['o','orange','🍊','Oman'],['p','pencil','✏️','Palestine'],['q','quilt','🧩','Qatar'],['r','rabbit','🐰','Ras Elbar'],['s','snake','🐍','Saudi Arabia'],['t','train','🚆','Tubli'],['u','umbrella','☂️','United Arab Emirates'],['v','van','🚐','Vietnam'],['w','window','🪟','Wasmiya'],['x','fox','🦊','EXIT'],['y','yoyo','🪀','Yousuf'],['z','zebra','🦓','Zallaq']];
var PIX={a:[['🍎','apple'],['🐜','ant']],b:[['🚲','bike'],['🎈','balloon'],['⚽','ball']],c:[['🚗','car'],['🎂','cake'],['🐱','cat']],d:[['🐶','dog'],['🥁','drum'],['🦆','duck']],e:[['🥚','egg'],['🐘','elephant']],f:[['🐟','fish'],['🐸','frog']],g:[['🎸','guitar'],['🐐','goat']],h:[['👒','hat'],['🏠','house'],['✋','hand']],i:[['🍦','ice cream'],['🧊','ice']],j:[['🧶','jumper'],['👖','jeans'],['🫙','jar']],k:[['🪁','kite'],['🦘','kangaroo'],['🔑','key']],l:[['🦁','lion'],['🍋','lemon'],['🍭','lollipop']],m:[['🐭','mouse'],['🌙','moon'],['🥛','milk']],n:[['👃','nose'],['🪺','nest'],['9️⃣','nine']],o:[['🍊','orange'],['🐙','octopus']],p:[['✏️','pencil'],['🖊️','pen'],['🍕','pizza']],q:[['❓','question']],r:[['🐰','rabbit'],['🌈','rainbow'],['🚀','rocket']],s:[['🐍','snake'],['☀️','sun'],['🧦','socks']],t:[['🚆','train'],['🌳','tree'],['🐢','turtle']],u:[['☂️','umbrella'],['⬆️','up']],v:[['🚐','van'],['🎻','violin'],['🌋','volcano']],w:[['🪟','window'],['🐋','whale'],['⌚','watch']],x:[['🦊','fox'],['📦','box'],['6️⃣','six']],y:[['🪀','yoyo'],['💛','yellow']],z:[['🦓','zebra'],['0️⃣','zero']]};
var NUMW=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
var RB=['#ff8fc7','#ffb36b','#ffd166','#7ee0a1','#7fdcf7','#a99bff','#d78bff'];
function letDone(L){var n=0;for(var k=1;k<=4;k++)if(has('abc:'+L+':'+k))n++;return n}
function vABC(){var full=0;LET.forEach(function(x){if(letDone(x[0])>=4)full++});
 setApp(hdr('English ABC 🔤','كتاب الحروف + الأرقام + أنماط الكتابة')+ban('b-abc','<span class="en">Now I know my ABC!</span>',''+full+' / 26 حرف مكتمل',['🎈','🍎','🚲','⭐','🦓'])+
 '<div class="abc">'+LET.map(function(x,i){var n=letDone(x[0]);return '<button class="lb'+(n>=4?' done':'')+'" data-go="sABCl" data-arg="'+x[0]+'" style="--c:'+RB[i%7]+'"><span class="en">'+x[0].toUpperCase()+x[0]+'</span><i>'+x[2]+'</i><s>'+'●'.repeat(n)+'</s></button>'}).join('')+'</div>'+
 '<div class="tiles"><button class="tile s" data-go="sNUM"><i>🔢</i><span class="en">Numbers 1–20</span><small>الأرقام</small></button><button class="tile l" data-go="sPAT"><i>〰️</i><span class="en">Patterns</span><small>أنماط الكتابة</small></button><button class="tile m" data-go="sMATCHL"><i>🔗</i><span class="en">Match</span><small>وصّلي الحرف بالصورة</small></button><button class="tile r" data-go="sRAIN"><i>🌧️</i><span class="en">ABC rain</span><small>لوّني القطرات</small></button></div>')}
function vABCl(l){var i=LET.findIndex(function(x){return x[0]===l});if(i<0){A.go('sABC');return}var x=LET[i],U=l.toUpperCase();
 setApp(hdr('<span class="en">'+U+' '+l+'</span>','حرف '+(i+1)+' من 26','sABC')+'<section class="lhero" style="--c:'+RB[i%7]+'"><div class="en big2">'+U+l+'</div><div class="lw"><span class="e">'+x[2]+'</span><b class="en">'+x[1]+'</b></div><button class="ib" id="sp" aria-label="اسمعي">🔊</button></section><div class="place en">'+U+' — '+x[3]+'</div>'+
 '<div class="acts">'+[['1','✍️','<span class="en">'+l+'</span> اكتبي الصغير'],['2','✍️','<span class="en">'+U+'</span> اكتبي الكبير'],['3','🎨','لوّني الصور'],['4','🔎','دوري الحرف']].map(function(a){return '<button class="act'+(has('abc:'+l+':'+a[0])?' done':'')+'" data-a="'+a[0]+'"><i>'+a[1]+'</i>'+a[2]+'<em>'+(has('abc:'+l+':'+a[0])?'⭐':'')+'</em></button>'}).join('')+'</div>'+
 '<div class="row" style="direction:ltr">'+(i?'<button class="big ghost grow en" data-rep data-go="sABCl" data-arg="'+LET[i-1][0]+'">← '+LET[i-1][0]+'</button>':'')+(i<25?'<button class="big ghost grow en" data-rep data-go="sABCl" data-arg="'+LET[i+1][0]+'">'+LET[i+1][0]+' →</button>':'')+'</div>');
 $('sp').onclick=function(){A.say(l+'. '+l+' is for '+x[1])};
 A.app.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){A.sfx('tap');ABCACT[b.dataset.a](x)}})}
function letShell(x,t){A.sub();setApp(hdr(t,'<span class="en">'+x[0].toUpperCase()+' '+x[0]+'</span>','sABCl',x[0])+'<div id="gb" class="gbox"></div>');return $('gb')}
function letWin(x,k){var b=$('gb');var fresh=win('abc:'+x[0]+':'+k);var i=LET.findIndex(function(z){return z===x});cele(b,fresh?'ربحتي نجمة! ⭐':A.rnd(A.PRAISE),'<button class="big" data-back="sABCl" data-arg="'+x[0]+'">رجوع للحرف</button>'+(letDone(x[0])>=4&&i<25?'<button class="big sky" data-rep data-go="sABCl" data-arg="'+LET[i+1][0]+'">الحرف التالي <span class="en">'+LET[i+1][0]+'</span> ←</button>':''))}
function traceIn(box,ch,lbl,done){box.innerHTML='<p class="c">'+lbl+'</p><canvas class="trace" id="tc"></canvas><button class="big ghost" id="cl">🧽 من جديد</button>';var cv=$('tc');requestAnimationFrame(function(){A.trace(cv,ch,done)});$('cl').onclick=function(){traceIn(box,ch,lbl,done)}}
var ABCACT={
 '1':function(x){var b=letShell(x,'اكتبي الحرف الصغير');traceIn(b,x[0],'مرّري إصبعك على الحرف <span class="en">'+x[0]+'</span> ✍️',function(){A.say(x[0]);letWin(x,1)})},
 '2':function(x){var U=x[0].toUpperCase();var b=letShell(x,'اكتبي الحرف الكبير');traceIn(b,U,'مرّري إصبعك على الحرف <span class="en">'+U+'</span> ✍️',function(){A.say(U);letWin(x,2)})},
 '3':function(x){var b=letShell(x,'لوّني الصور');var good=PIX[x[0]].slice(0,3);var bad=A.shuf(Object.keys(PIX).filter(function(k){return k!==x[0]&&k!=='x'})).slice(0,6-good.length).map(function(k){return PIX[k][0]});var items=good.map(function(p){return [p[0],'<span class="en">'+p[1]+'</span>',1]}).concat(bad.map(function(p){return [p[0],'<span class="en">'+p[1]+'</span>',0]}));
  gPick(b,{q:x[0]==='x'?'<span class="en">Colour the pictures that have the letter x</span> 🎨':'<span class="en">Colour only the pictures that start with '+x[0]+'</span> 🎨',items:items,colour:true,say:true},function(){letWin(x,3)})},
 '4':function(x){var b=letShell(x,'دوري الحرف');var l=x[0],sim={a:'odce',b:'dpqh',c:'oea',d:'bpq',e:'cao',f:'tlj',g:'qpj',h:'nbk',i:'jlt',j:'ig',k:'hx',l:'it',m:'nw',n:'mhu',o:'ac',p:'qbd',q:'pgd',r:'nv',s:'zc',t:'fl',u:'nv',v:'uwy',w:'mv',x:'kz',y:'vg',z:'sx'}[l]||'abc';var row=[];for(var k=0;k<10;k++)row.push(sim[k%sim.length]);var pos=A.shuf([0,1,2,3,4,5,6,7,8,9]).slice(0,4);pos.forEach(function(p){row[p]=l});row=A.shuf(row);if(row.indexOf(l)<0)row[0]=l;var left=row.filter(function(c){return c===l}).length;
  b.innerHTML='<p class="c">لقّي كل حرف <b class="en" style="font-size:1.6rem">'+l+'</b> ودوّري عليه ⭕</p><div class="circ en">'+row.map(function(c){return '<button data-c="'+c+'">'+c+'</button>'}).join('')+'</div>';
  b.querySelectorAll('.circ button').forEach(function(t){t.onclick=function(){if(t.classList.contains('ok'))return;if(t.dataset.c===l){t.classList.add('ok');A.sfx('ok');left--;if(!left){A.say(l);setTimeout(function(){letWin(x,4)},600)}}else shake(t)}})}};
function vMATCHL(){var L=A.shuf(LET.filter(function(x){return x[0]!=='x'})).slice(0,8);runSteps('Match 🔗','وصّلي الحرف بالصورة','sABC',null,[{type:'match',q:'<span class="en">Match the letters to the pictures</span>',pairs:L.map(function(x){return ['<span class="en" style="font-size:2rem">'+x[0]+'</span>','<span style="font-size:2rem">'+x[2]+'</span>']})}],'abc:match')}
function vRAIN(){var L=LET.map(function(x){return x[0]}),i=0;
 setApp(hdr('ABC rain 🌧️','لوّني القطرات بالترتيب','sABC')+'<p class="c">«<span class="en">It\'s raining ABCs</span>» — اضغطي القطرات من <span class="en">a</span> إلى <span class="en">z</span> 💧</p><div class="rain en" id="rn">'+A.shuf(L).map(function(c){return '<button data-c="'+c+'">'+c.toUpperCase()+c+'</button>'}).join('')+'</div><div class="c" id="nx"></div>');
 function hint(){$('nx').innerHTML=i<26?'التالي: <b class="en" style="font-size:1.6rem">'+L[i]+'</b>':''}hint();
 A.app.querySelectorAll('.rain button').forEach(function(b){b.onclick=function(){if(b.classList.contains('ok'))return;if(b.dataset.c===L[i]){b.classList.add('ok');b.style.background=RB[i%7];A.sfx('ok');A.say(L[i]);i++;hint();if(i>=26){win('abc:rain');A.app.insertAdjacentHTML('beforeend','<div class="card cele pop"><div class="bigstar">☂️</div><b class="en">Now I know my ABC!</b></div>')}}else shake(b)}})}
/* الأرقام 1–20 */
function vNUM(){setApp(hdr('<span class="en">Numbers</span> 🔢','من 1 إلى 20','sABC')+'<div class="nums">'+NUMW.slice(1).map(function(w,k){var n=k+1;return '<button class="nb'+(has('abc:n'+n)?' done':'')+'" data-go="sNUMn" data-arg="'+n+'" style="--c:'+RB[k%7]+'"><b>'+n+'</b><small class="en">'+w+'</small></button>'}).join('')+'</div><div class="tiles"><button class="tile s" id="g1"><i>❓</i>الرقم الناقص<small class="en">missing numbers</small></button><button class="tile l" id="g2"><i>🍓</i>كم عددها؟<small class="en">How many?</small></button></div>');
 $('g1').onclick=function(){A.sub();var it=[];for(var k=0;k<5;k++){var s=1+Math.floor(Math.random()*15),miss=Math.floor(Math.random()*5),seq=[s,s+1,s+2,s+3,s+4];var ans=seq[miss];seq[miss]='▢';it.push({em:'🔢',q:'<span class="en" style="font-size:1.8rem;letter-spacing:.2em">'+seq.join(' ')+'</span>',o:[String(ans),String(ans+1),String(ans-1)],a:0})}runSteps('الرقم الناقص ❓','','sNUM',null,[{type:'quiz',items:it}],'abc:miss')};
 $('g2').onclick=function(){A.sub();var it=[],E=['🍓','⭐','🎈','🐟','🌸','🍪'];for(var k=0;k<5;k++){var n=2+Math.floor(Math.random()*9),e=A.rnd(E);it.push({em:'<span style="font-size:1.8rem;line-height:1.5">'+e.repeat(n)+'</span>',q:'كم عددها؟ <span class="en">How many?</span>',o:[String(n),String(n+1),String(n-1)],a:0})}runSteps('كم عددها؟ 🍓','','sNUM',null,[{type:'quiz',items:it}],'abc:count')}}
function vNUMn(n){n=+n;var E=['⭐','🍓','🎈','🌸','🐟','🍪','🦋'],e=E[n%7],tapped=0;
 setApp(hdr('<span class="en">'+n+' — '+NUMW[n]+'</span>','','sNUM')+'<div class="card c"><p style="margin:0">عدّي معي: المسي كل '+e+'</p><div class="cnt">'+Array.from({length:n},function(_,k){return '<button data-k="'+k+'">'+e+'</button>'}).join('')+'</div><div class="bign" id="bn">0</div></div><div id="tw" style="display:none"></div>');
 A.app.querySelectorAll('.cnt button').forEach(function(b){b.onclick=function(){if(b.classList.contains('ok'))return;b.classList.add('ok');tapped++;$('bn').textContent=tapped;A.say(NUMW[tapped]);if(tapped===n){A.sfx('ok');var tw=$('tw');tw.style.display='';traceIn(tw,String(n),'اكتبي الرقم <b class="en">'+n+'</b> ✍️',function(){var fresh=win('abc:n'+n);A.say(n+'. '+NUMW[n]);tw.insertAdjacentHTML('beforeend','<div class="card cele pop"><div class="bigstar">'+n+'</div><b>'+(fresh?'نجمة جديدة! ⭐':A.rnd(A.PRAISE))+'</b></div>'+(n<20?'<button class="big sky" data-rep data-go="sNUMn" data-arg="'+(n+1)+'">الرقم <span class="en">'+(n+1)+'</span> ←</button>':''))})}}})}
/* أنماط الكتابة (كتاب Handwriting) */
function rows(f){var r=[];[.22,.52,.82].forEach(function(y){r.push(f(y))});return r}
function line(x0,y0,x1,y1){var p=[];for(var t=0;t<=1.0001;t+=.04)p.push([x0+(x1-x0)*t,y0+(y1-y0)*t]);return p}
function circ(cx,cy,r,cw){var p=[];for(var t=0;t<=1.0001;t+=.03){var a=-Math.PI/2+(cw?1:-1)*t*Math.PI*2;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}return p}
var PAT=[
 ['Horizontal lines','خطوط أفقية','🐝','🌸',function(){return rows(function(y){return line(.1,y,.9,y)})}],
 ['Vertical lines','خطوط عمودية','💧','🌱',function(){var r=[];for(var x=.15;x<.9;x+=.14)r.push(line(x,.15,x,.85));return r}],
 ['Wavy lines','خطوط متموّجة','🐟','🪸',function(){return rows(function(y){var p=[];for(var t=0;t<=1.0001;t+=.02)p.push([.08+.84*t,y+.06*Math.sin(t*Math.PI*4)]);return p})}],
 ['Ascending diagonals','مائلة صاعدة','🚀','⭐',function(){var r=[];for(var x=.12;x<.85;x+=.15)r.push(line(x,.8,x+.12,.2));return r}],
 ['Descending diagonals','مائلة نازلة','🍂','🧺',function(){var r=[];for(var x=.12;x<.85;x+=.15)r.push(line(x,.2,x+.12,.8));return r}],
 ['Zigzags','متعرّجة','🐜','🍬',function(){return rows(function(y){var p=[];for(var k=0;k<=8;k++)p.push([.1+k*.1,y+(k%2?-.07:.07)]);var q=[];for(var k2=0;k2<p.length-1;k2++)q=q.concat(line(p[k2][0],p[k2][1],p[k2+1][0],p[k2+1][1]));return q})}],
 ['Loops','حلقات','🎀','🎁',function(){return rows(function(y){var p=[];for(var t=0;t<=1.0001;t+=.01){var a=t*Math.PI*2*4;p.push([.1+.8*t-.035*Math.sin(a),y-.05+.05*Math.cos(a)])}return p})}],
 ['Ascending curves','منحنيات (أكواب)','🦋','🌼',function(){return rows(function(y){var p=[];for(var t=0;t<=1.0001;t+=.01){var a=t*Math.PI*5;p.push([.1+.8*t,y-.07+.09*Math.abs(Math.sin(a))])}return p})}],
 ['Descending curves','منحنيات (أقواس)','🐰','🥕',function(){return rows(function(y){var p=[];for(var t=0;t<=1.0001;t+=.01){var a=t*Math.PI*5;p.push([.1+.8*t,y+.04-.09*Math.abs(Math.sin(a))])}return p})}],
 ['Anti-clockwise circles','دوائر عكس عقارب الساعة','🫧','🫧',function(){var r=[];[.2,.5,.8].forEach(function(x){[.3,.7].forEach(function(y){r.push(circ(x,y,.11,false))})});return r}],
 ['Anti-clockwise curves','أقواس (c)','🌙','⭐',function(){var r=[];[.2,.5,.8].forEach(function(x){[.3,.7].forEach(function(y){var p=[];for(var t=0;t<=1.0001;t+=.04){var a=-Math.PI/4-t*Math.PI*1.5;p.push([x+.11*Math.cos(a),y+.11*Math.sin(a)])}r.push(p)})});return r}],
 ['Clockwise circles','دوائر مع عقارب الساعة','🍭','🍭',function(){var r=[];[.2,.5,.8].forEach(function(x){[.3,.7].forEach(function(y){r.push(circ(x,y,.11,true))})});return r}]];
function vPAT(){setApp(hdr('<span class="en">Patterns</span> 〰️','تمارين قبل الكتابة — من كتاب Handwriting','sABC')+'<div class="lessons">'+PAT.map(function(p,i){return '<button class="les'+(has('abc:pt'+i)?' done':'')+'" data-go="sPATp" data-arg="'+i+'"><span class="no">'+p[2]+'</span><b class="en" style="direction:ltr">'+p[0]+'</b><small>'+p[1]+'</small><em>'+(has('abc:pt'+i)?'⭐':'')+'</em></button>'}).join('')+'</div>')}
function vPATp(i){i=+i;var P=PAT[i];setApp(hdr('<span class="en">'+P[0]+'</span>',P[1],'sPAT')+'<p class="c">ودّي '+P[2]+' لـ '+P[3]+' — مرّري إصبعك على الخطوط من النقطة الخضراء ✍️</p><canvas class="trace pat" id="pc"></canvas><div class="pbar"><i id="pb" style="width:0"></i></div><button class="big ghost" id="cl">🧽 من جديد</button><div id="pw"></div>');
 var cv=$('pc'),c=cv.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1),W,H,str=P[4](),pts=[],cov=0,done=false,down=false,last=null,hue=0;
 function fit(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);pts=[];str.forEach(function(s){s.forEach(function(p,k){if(k%2===0)pts.push({x:p[0]*W,y:p[1]*H,h:0})})});guide()}
 function guide(){c.clearRect(0,0,W,H);c.lineCap='round';c.lineJoin='round';str.forEach(function(s){c.beginPath();s.forEach(function(p,k){var x=p[0]*W,y=p[1]*H;k?c.lineTo(x,y):c.moveTo(x,y)});c.lineWidth=22;c.strokeStyle='rgba(255,143,199,.18)';c.stroke();c.setLineDash([8,10]);c.lineWidth=3;c.strokeStyle='#ff8fc7';c.stroke();c.setLineDash([]);var a=s[0],b=s[s.length-1];c.fillStyle='#22a06b';c.beginPath();c.arc(a[0]*W,a[1]*H,8,0,7);c.fill()});
  c.font=(W*.08)+'px sans-serif';c.textAlign='center';c.textBaseline='middle';var s0=str[0][0],sl=str[str.length-1],e=sl[sl.length-1];c.fillText(P[2],s0[0]*W,s0[1]*H-W*.07);c.fillText(P[3],e[0]*W,e[1]*H+W*.07)}
 function pt(ev){var r=cv.getBoundingClientRect();return [ev.clientX-r.left,ev.clientY-r.top]}
 function draw(p){c.lineCap='round';c.lineWidth=14;hue=(hue+4)%360;c.strokeStyle='hsl('+hue+',85%,62%)';c.beginPath();c.moveTo(last[0],last[1]);c.lineTo(p[0],p[1]);c.stroke();last=p;pts.forEach(function(q){if(!q.h&&Math.hypot(q.x-p[0],q.y-p[1])<20){q.h=1;cov++}});var f=cov/pts.length;$('pb').style.width=Math.min(100,f/.85*100)+'%';if(!done&&f>.85){done=true;var fresh=win('abc:pt'+i);$('pw').innerHTML='<div class="card cele pop"><div class="bigstar">'+P[3]+'</div><b>'+(fresh?'نجمة جديدة! ⭐':A.rnd(A.PRAISE))+'</b></div>'+(i<PAT.length-1?'<button class="big sky" data-rep data-go="sPATp" data-arg="'+(i+1)+'">النمط التالي ←</button>':'');$('pw').scrollIntoView({behavior:'smooth'})}}
 cv.addEventListener('pointerdown',function(e){down=true;last=pt(e);cv.setPointerCapture(e.pointerId)});cv.addEventListener('pointermove',function(e){if(down)draw(pt(e))});['pointerup','pointercancel'].forEach(function(t){cv.addEventListener(t,function(){down=false})});
 $('cl').onclick=function(){cov=0;done=false;$('pb').style.width='0';$('pw').innerHTML='';fit()};
 requestAnimationFrame(fit)}

/* ================= 🎨 مرسم الحروف ================= */
var AR='ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');
var ARTSETS=[['ar','الحروف العربية',AR],['up','English A–Z','ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')],['lo','English a–z','abcdefghijklmnopqrstuvwxyz'.split('')],['nm','الأرقام','0123456789'.split('').concat(['١','٢','٣','٤','٥','٦','٧','٨','٩'])]];
function vART(set){set=set||'ar';var S0=ARTSETS.find(function(s){return s[0]===set})||ARTSETS[0];var nm=(S().name||'').trim();
 setApp(hdr('مرسم الحروف 🎨','اختاري حرف ولوّنيه')+ban('b-art','لوّني بإصبعك','الألوان ما تطلع برّا الحرف ✨',['🖍️','🌈','✨','🎨','💖'])+(nm?'<button class="big lav" data-go="sARTd" data-arg="name">🌟 لوّني اسمك: '+esc(nm)+'</button>':'')+
 '<div class="ptabs">'+ARTSETS.map(function(s){return '<button class="'+(s[0]===set?'on':'')+'" data-rep data-go="sART" data-arg="'+s[0]+'">'+s[1]+'</button>'}).join('')+'</div><div class="artg'+(set==='ar'?'':' en')+'">'+S0[2].map(function(ch,i){return '<button data-go="sARTd" data-arg="'+set+':'+i+'" style="--c:'+RB[i%7]+'" class="'+(has('art:'+set+':'+i)?'done':'')+'">'+ch+'</button>'}).join('')+'</div>')}
function vARTd(arg){var ch,key,back='sART',barg=null,font;
 if(arg==='name'){ch=(S().name||'ياسمينة').trim();key='art:name';font='900 {s}px Kid, sans-serif'}else{var p=String(arg).split(':'),S0=ARTSETS.find(function(s){return s[0]===p[0]})||ARTSETS[0];ch=S0[2][+p[1]];key='art:'+S0[0]+':'+p[1];barg=S0[0];font=(S0[0]==='ar'||S0[0]==='nm'&&/[١-٩]/.test(ch)?'900 {s}px Kid, sans-serif':'700 {s}px En, sans-serif')}
 var PAL=['#ff4fa3','#ff8fc7','#ff6b6b','#ffa94d','#ffd43b','#69db7c','#38d9a9','#4dabf7','#9775fa','#c084fc','#a0522d','#343a40'];var col=PAL[0],mode='pen',size=26;
 setApp(hdr('لوّني: '+esc(ch),'المسي وحرّكي إصبعك داخل الحرف',back,barg)+'<canvas class="trace art" id="ac"></canvas><div class="pal">'+PAL.map(function(c,i){return '<button style="background:'+c+'" data-c="'+c+'" class="'+(i===0?'on':'')+'" aria-label="لون"></button>'}).join('')+'<button data-m="rainbow" class="rbw" aria-label="قوس قزح">🌈</button><button data-m="stamp" aria-label="نجوم">✨</button></div><div class="row"><button class="big ghost grow" id="sz">🖌️ فرشاة كبيرة</button><button class="big ghost grow" id="cl">🧽 امسحي</button></div><div class="row"><button class="big sun grow" id="ok">✅ خلّصت</button><button class="big sky grow" id="sv">📥 احفظي</button></div><div id="aw"></div>');
 var cv=$('ac'),c=cv.getContext('2d'),dpr=Math.min(2,devicePixelRatio||1),W,H,mask,paint,pc,down=false,last=null,hue=0;
 function fit(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;
  mask=document.createElement('canvas');mask.width=W*dpr;mask.height=H*dpr;var m=mask.getContext('2d');m.setTransform(dpr,0,0,dpr,0,0);var s=H*.78;m.font=font.replace('{s}',s);var w=m.measureText(ch).width;if(w>W*.9){s=s*W*.9/w;m.font=font.replace('{s}',s)}m.textAlign='center';m.textBaseline='middle';m.direction=/[a-z0-9]/i.test(ch)?'ltr':'rtl';m.fillStyle='#000';m.fillText(ch,W/2,H*.54);m.lineJoin='round';m.lineWidth=6;m.strokeStyle='#000';m.strokeText(ch,W/2,H*.54);mask.fs=s;
  paint=document.createElement('canvas');paint.width=W*dpr;paint.height=H*dpr;pc=paint.getContext('2d');pc.setTransform(dpr,0,0,dpr,0,0);render()}
 function render(){c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.globalAlpha=.16;c.drawImage(mask,0,0);c.globalAlpha=1;
  var t=document.createElement('canvas');t.width=cv.width;t.height=cv.height;var tc=t.getContext('2d');tc.drawImage(paint,0,0);tc.globalCompositeOperation='destination-in';tc.drawImage(mask,0,0);c.drawImage(t,0,0);
  c.setTransform(dpr,0,0,dpr,0,0);var s=mask.fs;c.font=font.replace('{s}',s);c.textAlign='center';c.textBaseline='middle';c.direction=/[a-z0-9]/i.test(ch)?'ltr':'rtl';c.lineJoin='round';c.lineWidth=4;c.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue('--ink')||'#3a2340';c.strokeText(ch,W/2,H*.54)}
 function pt(e){var r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]}
 function stroke(p){if(mode==='stamp'){var e=['⭐','✨','💖','🌸'][Math.floor(Math.random()*4)];pc.font=(size*1.2)+'px sans-serif';pc.textAlign='center';pc.textBaseline='middle';pc.fillText(e,p[0],p[1]);render();return}
  pc.lineCap='round';pc.lineJoin='round';pc.lineWidth=size;if(mode==='rainbow'){hue=(hue+6)%360;pc.strokeStyle='hsl('+hue+',90%,62%)'}else pc.strokeStyle=col;pc.beginPath();pc.moveTo(last[0],last[1]);pc.lineTo(p[0],p[1]);pc.stroke();last=p;render()}
 var lastStamp=0;
 cv.addEventListener('pointerdown',function(e){down=true;last=pt(e);cv.setPointerCapture(e.pointerId);stroke([last[0]+.1,last[1]])});
 cv.addEventListener('pointermove',function(e){if(!down)return;if(mode==='stamp'){var n=performance.now();if(n-lastStamp<120)return;lastStamp=n}stroke(pt(e))});
 ['pointerup','pointercancel'].forEach(function(t){cv.addEventListener(t,function(){down=false})});
 A.app.querySelectorAll('.pal button').forEach(function(b){b.onclick=function(){A.sfx('tap');A.app.querySelectorAll('.pal button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');if(b.dataset.c){col=b.dataset.c;mode='pen'}else mode=b.dataset.m}});
 $('sz').onclick=function(){size=size===26?12:26;this.textContent=size===26?'🖌️ فرشاة كبيرة':'✏️ فرشاة صغيرة';A.sfx('tap')};
 $('cl').onclick=function(){pc.setTransform(1,0,0,1,0,0);pc.clearRect(0,0,paint.width,paint.height);pc.setTransform(dpr,0,0,dpr,0,0);render()};
 $('ok').onclick=function(){var fresh=win(key);$('aw').innerHTML='<div class="card cele pop"><div class="bigstar">🎨</div><b>'+(fresh?'لوحة حلوة! نجمة جديدة ⭐':A.rnd(A.PRAISE))+'</b></div>';$('aw').scrollIntoView({behavior:'smooth'})};
 $('sv').onclick=function(){var o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;var x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.drawImage(cv,0,0);o.toBlob(function(b){if(!b)return;var f=new File([b],'ياسمينة-'+ch+'.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f]}).catch(function(){});else{var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;document.body.appendChild(a);a.click();a.remove()}})};
 (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){requestAnimationFrame(fit)})}

function reg(){var V=A.VIEWS;V.sTL=vTL;V.sTLl=vTLl;V.sDIN=vDIN;V.sDINl=vDINl;V.sWTN=vWTN;V.sWTNv=vWTNv;V.sFLAG=vFLAG;V.sABC=vABC;V.sABCl=vABCl;V.sMATCHL=vMATCHL;V.sRAIN=vRAIN;V.sNUM=vNUM;V.sNUMn=vNUMn;V.sPAT=vPAT;V.sPATp=vPATp;V.sART=vART;V.sARTd=vARTd}
})();
