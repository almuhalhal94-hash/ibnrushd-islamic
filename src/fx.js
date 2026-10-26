
/* ===== fx: announcement reel, bell, question of the day, name greeting, counters, door ===== */
var RMx=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/* announcements: one list feeds the reel and the bell. Add new ones at the top. */
function ANNS(){var n=nextRound(),A=[
 {id:'miz-win4',tag:'ألف مبروك 🏆',title:'فرسان مزمار داود · الجولة الأخيرة',sub:'الثالث الإعدادي · يوسف مثنى وحسان علي ويوسف أحمد وعبدالغني حرسي',go:'tilawa-file.html#mz-win4',cta:'شوف الفائزين',s:2},
 {id:'mushaf-vid',tag:'فيديو جديد 🎬',title:'شاهد فيديو مصحف ابن رشد',sub:'دقيقة تعرّفك على المصحف: سمّع بصوتك، وأرسل تلاوتك، والمعاني والتجويد · بصوت أ. طلال المهلهل',go:'#mushafvid',cta:'شاهد الفيديو',s:2},
 {id:'mushaf1',tag:'جديد 📖',title:'مصحف ابن رشد',sub:'آيات التلاوة والحفظ ملوّنة بأحكام التجويد، ومعاني الكلمات، ووضع التسميع · لكل الصفوف',go:'mushaf.html',cta:'افتح المصحف',s:1},
 {id:'miz-win3',tag:'ألف مبروك 🏆',title:'فرسان مزمار داود · الجولة الثالثة',sub:'الثاني الإعدادي · سورة يس · سلمان أمان وعلي الديري ومحمد الرويعي',go:'tilawa-file.html#mz-win3',cta:'شوف الفائزين',s:2},
 {id:'miz-r3',tag:'مزمار داود 📸',title:'الجولة الثالثة · سورة يس',sub:'الثاني الإعدادي · في الصف الإلكتروني · صور التوثيق',go:'tilawa-file.html#mz-r3',cta:'شوف الصور',s:3},
 {id:'miz-k1',tag:'تكريم 🏅',title:'تكريم فائزي مزمار داود',sub:'الجولة الأولى · السادس الابتدائي · بحضور مدير المدرسة',go:'mizmar',cta:'شوف الصور',s:2},
 {id:'miz-r1doc',tag:'جديد',title:'صور الجولة الأولى · مزمار داود',sub:'السادس الابتدائي · من أجواء المسابقة',go:'mizmar',cta:'شوف الصور',s:3},
 {id:'mizwin2',tag:'ألف مبروك 🏆',title:'فرسان مزمار داود',sub:'فائزو الجولة الثانية · الأول الإعدادي · موعد التكريم يُعلَن لاحقًا',go:'mizmar',cta:'شوف الفائزين',s:2},
 {id:'exam1',tag:'نشرة الاختبار',title:'مواضيع الاختبار الأول',sub:'لكل المراحل · الدرجة 20 · حصة واحدة',go:'exam',cta:'اعرض المواضيع',s:0},
 {id:'review1',tag:'جديد',title:'مذكرات مراجعة الاختبار الأول',sub:'سؤال وجواب لكل صف · عرض وتنزيل',go:'review',cta:'افتح المذكرات',s:1},
 {id:'answers1',tag:'جديد',title:'إجابات كراسات الطلبة',sub:'الإجابات النموذجية لدروس الاختبار · عرض وتنزيل',go:'answers',cta:'شوف الإجابات',s:3},
 {id:'pride1',tag:'فخرنا',title:'حملة كتاب الله',sub:'و3 طلاب أتمّوا حفظ القرآن الكريم كاملًا',num:25,unit:'حافظًا لكتاب الله',go:'pride',cta:'قصص النجاح',s:2}];
 if(n)A.splice(1,0,{id:'miz-'+n.g+'-'+n.d.join(''),tag:'مسابقة مزمار داوود',title:G[n.g]+' · '+n.sura,sub:dstr(n)+' · وقت الفسحة'+(left(n)>2?' · باقي '+left(n)+' أيام':' · '+when(n)),go:'mizmar',cta:'التفاصيل',s:1});
 A.push({id:'qod',tag:'كل يوم',title:'سؤال اليوم بانتظارك',sub:'جاوب صح وكمّل سلسلتك 🔥',go:'#qod',cta:'جاوب الحين',s:3,quiet:1});
 return A}
var ORN='<svg class="orn" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="1.5"><path d="M50 4l12 34 34 12-34 12-12 34-12-34L4 50l34-12z"/><rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="18"/></g></svg>';
function MVID(id){return '<div class="mvid" id="'+id+'"><video controls playsinline preload="none" poster="vid/mushaf.jpg" src="vid/mushaf.mp4"></video><p>🎬 فيديو مصحف ابن رشد · دقيقة تعرّفك على المصحف بصوت أ. طلال المهلهل</p></div>'}
function reelHTML(){var A=ANNS();return '<section class="reel s'+A[0].s+'" id="reel" role="region" aria-roledescription="شريط إعلانات" aria-label="إعلانات القسم"><div class="bgx"></div><div class="pat"></div><div class="shine"></div>'+ORN+'<div class="bars">'+A.map(function(){return '<i><b></b></i>'}).join('')+'</div><div class="sc" aria-live="polite"></div><div class="ctl"><button data-rl="-1" aria-label="السابق">→</button><button data-rl="p" aria-label="إيقاف مؤقت">❚❚</button><button data-rl="1" aria-label="التالي">←</button></div></section>'}
var REELS={i:0,t:null,paused:false};
function reelShow(i){var r=document.getElementById('reel');if(!r)return;var A=ANNS();REELS.i=(i+A.length)%A.length;var a=A[REELS.i];
 r.className='reel s'+a.s+(REELS.paused?' paused':'');
 [].forEach.call(r.querySelectorAll('.bars i'),function(b,k){b.className=k<REELS.i?'done':k===REELS.i?'on':'';var x=b.firstChild;x.style.animation='none';x.offsetWidth;x.style.animation=''});
 var w=a.title.split(' ').map(function(t,k){return '<span style="animation-delay:'+(.25+k*.12)+'s">'+esc(t)+'</span>'}).join(' ');
 r.querySelector('.sc').innerHTML='<span class="tg">'+esc(a.tag)+'</span>'+(a.num?'<div class="big"><b class="cnt" data-n="'+a.num+'">'+a.num+'</b><span>'+esc(a.unit)+'</span></div>':'')+'<h3>'+w+'</h3><p style="animation-delay:'+(.5+a.title.split(' ').length*.12)+'s">'+esc(a.sub)+'</p><span class="cta" style="animation-delay:1.1s">'+esc(a.cta)+' ←</span>';
 if(a.num)cntRun(r.querySelector('.big .cnt'));
 clearTimeout(REELS.t);if(!REELS.paused&&!RMx)REELS.t=setTimeout(function(){reelShow(REELS.i+1)},5500)}
function reelGo(a){if(a.go.charAt(0)==='#'){var el=document.querySelector(a.go);if(el)el.scrollIntoView({behavior:'smooth',block:'center'})}else go(a.go)}
document.addEventListener('click',function(e){var r=e.target.closest('#reel');if(!r)return;var b=e.target.closest('[data-rl]');
 if(b){e.stopPropagation();var v=b.dataset.rl;if(v==='p'){REELS.paused=!REELS.paused;b.textContent=REELS.paused?'▶':'❚❚';b.setAttribute('aria-label',REELS.paused?'تشغيل':'إيقاف مؤقت');reelShow(REELS.i)}else reelShow(REELS.i+(+v));return}
 annMark([ANNS()[REELS.i].id]);reelGo(ANNS()[REELS.i])});
(function(){var sx=null;document.addEventListener('touchstart',function(e){if(e.target.closest('#reel'))sx=e.touches[0].clientX},{passive:true});document.addEventListener('touchend',function(e){if(sx==null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>40){reelShow(REELS.i+(dx>0?1:-1))}},{passive:true})})();
/* bell */
function annSeen(){try{return JSON.parse(lsGet('annSeen')||'[]')}catch(e){return []}}
function annMark(ids){var s=annSeen();ids.forEach(function(i){if(s.indexOf(i)<0)s.push(i)});lsSet('annSeen',JSON.stringify(s));annBell();annSync()}
/* system notifications + app badge: page shows/clears the badge; sw.js checks ann.json in the background (periodic sync, installed app) */
function annBadge(n){try{if(navigator.setAppBadge){if(n)navigator.setAppBadge(n);else navigator.clearAppBadge()}}catch(e){}}
function annCanAsk(){return 'Notification' in window&&'serviceWorker' in navigator&&Notification.permission==='default'}
function annSync(){try{if(window.caches)caches.open('isl-meta').then(function(c){c.put('seen',new Response(JSON.stringify(annSeen())))})}catch(e){}
 try{if('Notification' in window&&Notification.permission==='granted'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(function(r){if(r.periodicSync)r.periodicSync.register('ann-check',{minInterval:6*3600*1000}).catch(function(){})})}catch(e){}}
function annAsk(){Notification.requestPermission().then(function(p){if(p==='granted'){annSync();navigator.serviceWorker.ready.then(function(r){r.showNotification('تم تفعيل التنبيهات ✅',{body:'بيوصلك تنبيه مع كل إضافة جديدة في موقع قسم التربية الإسلامية',icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:'notif-on',lang:'ar',dir:'rtl'})})}annOpen()})}

function annList(){return ANNS().filter(function(a){return !a.quiet})}
function annUnseen(){var s=annSeen();return annList().filter(function(a){return s.indexOf(a.id)<0})}
function annBell(){var b=document.getElementById('bell');if(!b){b=document.createElement('button');b.id='bell';b.className='bell';document.body.appendChild(b)}
 var u=annUnseen().length;b.setAttribute('aria-label','الإعلانات'+(u?' ('+u+' جديد)':''));b.innerHTML='📢'+(u?'<span class="bn">'+u+'</span>':'');b.classList.toggle('new',!!u);annBadge(u)}
function annOpen(){var U=annUnseen().map(function(a){return a.id}),s=document.getElementById('asheet');if(!s){s=document.createElement('div');s.id='asheet';s.setAttribute('role','dialog');s.setAttribute('aria-modal','true');s.setAttribute('aria-label','إعلانات القسم');document.body.appendChild(s)}
 s.innerHTML='<div class="ap"><div class="ah"><b>📢 إعلانات القسم</b><button data-ax="1" aria-label="إغلاق">✕</button></div>'+(annCanAsk()?'<button class="ai anb" data-anb="1"><span><small>جديد</small><b>🔔 فعّل التنبيهات على جوالك</b></span><span class="arr">‹</span></button>':'')+annList().map(function(a){return '<button class="ai" data-ai="'+a.id+'"><span><small>'+esc(a.tag)+(U.indexOf(a.id)>=0?'<span class="nw">جديد</span>':'')+'</small><b>'+esc(a.title)+'</b></span><span class="arr">‹</span></button>'}).join('')+'</div>';
 s.hidden=false;document.body.style.overflow='hidden';annMark(annList().map(function(a){return a.id}));var t=document.querySelector('.atoast');if(t)t.remove()}
function annClose(){var s=document.getElementById('asheet');if(s)s.hidden=true;document.body.style.overflow=''}
document.addEventListener('click',function(e){if(e.target.closest('#bell')||e.target.closest('.atoast')){annOpen();return}
 if(e.target.closest('[data-anb]')){annAsk();return}
 if(e.target.closest('[data-ax]')||e.target.id==='asheet'){annClose();return}
 var b=e.target.closest('[data-ai]');if(b){var a=ANNS().filter(function(x){return x.id===b.dataset.ai})[0];annClose();if(a)reelGo(a)}});
document.addEventListener('keydown',function(e){if(e.key==='Escape')annClose()});
/* question of the day (from the curriculum) */
var QOD=[
 ['كم عدد سور القرآن الكريم؟',['114','110','120','99'],0,'القرآن الكريم 114 سورة، أولها الفاتحة وآخرها الناس.'],
 ['كم عدد أركان الإيمان؟',['أربعة','خمسة','ستة','سبعة'],2,'أركان الإيمان ستة: الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره.'],
 ['في أي شهر نزل القرآن الكريم؟',['شعبان','رمضان','محرم','ذو الحجة'],1,'قال تعالى: ﴿شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ﴾ [البقرة: 185].'],
 ['ما مقدار المدّ اللازم؟',['حركتان','أربع حركات','ست حركات','حركة واحدة'],2,'المدّ اللازم يُمدّ ست حركات لزومًا.'],
 ['حروف القلقلة مجموعة في:',['قطب جد','يرملون','ينمو','أحد'],0,'حروف القلقلة خمسة يجمعها قولك: «قطب جد».'],
 ['كم عدد أركان الإسلام؟',['أربعة','خمسة','ستة','ثلاثة'],1,'أركان الإسلام خمسة: الشهادتان، والصلاة، والزكاة، والصوم، والحج.'],
 ['في أي سنة هجرية كانت غزوة بدر الكبرى؟',['الأولى','الثانية','الثالثة','الخامسة'],1,'كانت غزوة بدر في رمضان من السنة الثانية للهجرة.'],
 ['في أي سنة هجرية كان صلح الحديبية؟',['الرابعة','الخامسة','السادسة','الثامنة'],2,'كان صلح الحديبية في السنة السادسة للهجرة.'],
 ['متى تُخرج زكاة الفطر؟',['بعد صلاة العيد بأسبوع','قبل صلاة عيد الفطر','في أول رمضان','مع زكاة المال'],1,'تُخرج زكاة الفطر قبل صلاة عيد الفطر.'],
 ['ما اسم الباب الذي يدخل منه الصائمون الجنة؟',['باب السلام','باب الريّان','باب الرحمة','باب التوبة'],1,'قال ﷺ: «إن في الجنة بابًا يقال له الريّان، يدخل منه الصائمون» (متفق عليه).'],
 ['بأي حرف تبدأ سورة القلم؟',['ق','ص','ن','طه'],2,'تبدأ سورة القلم بقوله تعالى: ﴿ن ۚ وَالْقَلَمِ وَمَا يَسْطُرُونَ﴾.'],
 ['كم عدد ركعات الصلوات المفروضة في اليوم والليلة؟',['15','17','19','12'],1,'الفجر 2، والظهر 4، والعصر 4، والمغرب 3، والعشاء 4: المجموع 17 ركعة.'],
 ['ما أطول سورة في القرآن الكريم؟',['آل عمران','النساء','البقرة','الكهف'],2,'سورة البقرة أطول سور القرآن الكريم.'],
 ['ما المقصود بالحِلم؟',['سرعة الغضب','ضبط النفس عند الغضب','كثرة الكلام','الخوف'],1,'الحِلم: ضبط النفس وكظم الغيظ عند الغضب.'],
 ['في أي سنة هجرية كانت غزوة أحد؟',['الثانية','الثالثة','الرابعة','السادسة'],1,'كانت غزوة أحد في شوال من السنة الثالثة للهجرة.'],
 ['من النبي الذي لُقّب بـ«كليم الله»؟',['إبراهيم عليه السلام','موسى عليه السلام','عيسى عليه السلام','نوح عليه السلام'],1,'قال تعالى: ﴿وَكَلَّمَ اللَّهُ مُوسَىٰ تَكْلِيمًا﴾ [النساء: 164].'],
 ['ما أول قبلة صلّى إليها المسلمون؟',['المسجد الحرام','المسجد النبوي','المسجد الأقصى','مسجد قباء'],2,'صلّى المسلمون إلى المسجد الأقصى قبل تحويل القبلة إلى الكعبة المشرّفة.'],
 ['كم ركعة صلاة الفجر؟',['ركعتان','ثلاث','أربع','ركعة'],0,'صلاة الفجر ركعتان.'],
 ['ما آخر سورة في المصحف الشريف؟',['الفلق','الإخلاص','الناس','الكوثر'],2,'آخر سورة في المصحف سورة الناس.'],
 ['تجب زكاة المال إذا بلغ النصاب و:',['حال عليه الحول','زاد عن الحاجة بيوم','كان ذهبًا فقط','كان صاحبه كبيرًا'],0,'تجب الزكاة إذا بلغ المال النصاب وحال عليه الحول (سنة هجرية).'],
 ['ما معنى «الصيام جُنّة»؟',['الصيام طعام','الصيام وقاية وستر','الصيام تعب','الصيام سفر'],1,'جُنّة: وقاية وستر من المعاصي ومن النار.']
];
function qodDay(){var n=new Date();return Math.round(new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime()/864e5)}
function myName(){return (lsGet('myName')||'').trim()}
function qodHTML(){var day=qodDay(),q=QOD[day%QOD.length],st=+lsGet('qStreak')||0,last=+lsGet('qLast')||0,done=last===day,pick=done?+lsGet('qPick'):-1;if(!done&&last<day-1)st=0;
 return '<section class="qod" id="qod"><div class="qh"><small>❓ سؤال اليوم</small><span class="streak">'+(st?'🔥 '+st+' '+(st===1?'يوم':st<=10?'أيام':'يومًا')+' ورا بعض':'سؤال جديد كل يوم')+'</span></div><h3>'+q[0]+'</h3><div class="opts">'+q[1].map(function(o,i){var c=done?(i===q[2]?' class="ok"':i===pick?' class="no"':''):'';return '<button data-q="'+i+'"'+c+(done?' disabled':'')+'>'+o+'</button>'}).join('')+'</div>'+(done?'<p class="qx">'+(pick===q[2]?'<b>أحسنت'+(myName()?' يا '+esc(myName()):'')+'! ✓</b> ':'<b>الإجابة الصحيحة: '+q[1][q[2]]+'</b> · ')+q[3]+'<br>ارجع بكرة لسؤال جديد.</p>':'')+'</section>'}
document.addEventListener('click',function(e){var b=e.target.closest('#qod [data-q]');if(!b||b.disabled)return;var day=qodDay(),last=+lsGet('qLast')||0,st=+lsGet('qStreak')||0,q=QOD[day%QOD.length],ok=+b.dataset.q===q[2];
 lsSet('qStreak',String(last===day-1?st+1:1));lsSet('qLast',String(day));lsSet('qPick',b.dataset.q);document.getElementById('qod').outerHTML=qodHTML();if(ok){var n=document.getElementById('qod');n.classList.add('win');burst(n)}});
function burst(el){if(RMx)return;var r=el.getBoundingClientRect(),cv=document.createElement('canvas'),W=cv.width=innerWidth,H=cv.height=innerHeight;cv.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:70';document.body.appendChild(cv);var c=cv.getContext('2d'),P=[],cols=['#0a6e4b','#e9b44c','#ffffff','#253260'];for(var i=0;i<90;i++)P.push({x:r.left+r.width/2,y:r.top+30,vx:(Math.random()-.5)*9,vy:-Math.random()*9-2,c:cols[i%4],l:70});
 (function f(){c.clearRect(0,0,W,H);var a=0;P.forEach(function(p){if(p.l<=0)return;a=1;p.l--;p.x+=p.vx;p.y+=p.vy;p.vy+=.25;c.globalAlpha=p.l/70;c.fillStyle=p.c;c.fillRect(p.x,p.y,5,5)});if(a)requestAnimationFrame(f);else cv.remove()})()}
/* name greeting (saved on this device only) */
function helloHTML(){var n=myName();return '<div class="hello">'+(n?'<b>أهلًا يا '+esc(n)+' 🌙</b>':'')+'<button class="nmbtn" data-nm="1">'+(n?'✎ غيّر اسمك':'✎ اكتب اسمك عشان نرحّب فيك')+'</button></div>'}
document.addEventListener('click',function(e){var b=e.target.closest('[data-nm]');if(!b)return;var f=document.createElement('form');f.className='nmf';f.innerHTML='<input maxlength="20" placeholder="اسمك الأول" aria-label="اسمك الأول" value="'+esc(myName())+'"><button>حفظ</button>';b.parentNode.replaceWith(f);var i=f.querySelector('input');i.focus();
 f.addEventListener('submit',function(ev){ev.preventDefault();lsSet('myName',i.value.replace(/[<>"]/g,'').trim());var d=document.createElement('div');d.innerHTML=helloHTML();f.replaceWith(d.firstChild)})});
/* counters */
function cntRun(el){if(!el)return;var n=+el.dataset.n,t0=performance.now();if(RMx){el.textContent=n;return}el.classList.add('go');(function f(t){var k=Math.min(1,(t-t0)/1400);el.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f);else setTimeout(function(){el.classList.remove('go')},900)})(t0)}
function cntWatch(){var L=[].slice.call(document.querySelectorAll('#app .cnt'));if(!('IntersectionObserver' in window)||RMx)return;var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){io.unobserve(en.target);cntRun(en.target)}})},{threshold:.6});L.forEach(function(el){if(el.closest('#reel'))return;el.textContent='0';io.observe(el)})}
/* after every render */
function fx(){clearTimeout(REELS.t);if(document.getElementById('reel'))reelShow(0);cntWatch()}
/* door — stays until tapped, shown again after 30 minutes */
(function(){var last=+lsGet('doorT')||0;if(Date.now()-last<30*60e3)return;
 var d=document.createElement('div');d.id='door';d.setAttribute('role','button');d.setAttribute('tabindex','0');d.setAttribute('aria-label','المس الباب للدخول');if(RMx)d.classList.add('rm');
 d.innerHTML='<div class="fr"><div class="in"></div><div class="lv"><div class="lf r"></div><div class="lf l"></div></div><div class="cap">السلام عليكم'+(myName()?' يا '+esc(myName()):'')+'<small>قسم التربية الإسلامية · مدرسة ابن رشد</small><span class="tap">👆 المس الباب للدخول</span></div></div>';document.body.appendChild(d);document.body.style.overflow='hidden';
 var gone=false;function open(){if(gone)return;gone=true;lsSet('doorT',String(Date.now()));d.classList.add('open');setTimeout(function(){d.classList.add('gone');document.body.style.overflow='';annToast()},1500);setTimeout(function(){d.remove()},2300)}
 d.addEventListener('click',open);d.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});window.__door=1})();
function annToast(){var U=annUnseen();if(!U.length)return;var t=document.createElement('button');t.className='atoast hide';t.innerHTML='<small>'+(U.length>1?U.length+' إعلانات جديدة':'إعلان جديد')+'</small>'+esc(U[0].title);document.body.appendChild(t);requestAnimationFrame(function(){t.classList.remove('hide')});setTimeout(function(){t.classList.add('hide');setTimeout(function(){t.remove()},500)},7000)}
annBell();annSync();if(!window.__door)setTimeout(annToast,1200);
