/* ===== الطبقة السينمائية (CIN): كل أيقونة تفتح كإعلان موشن ===== */
var CIN=(function(){
 if(RM)return {};
 /* لون لكل صفحة: [الأساس، الفاتح، الغامق، لون التذهيب] */
 var PC={home:['#0b7350','#1d9a6c','#03241a','#e9b44c'],grades:['#1e4fd8','#4f7dff','#0a1f5c','#9cc0ff'],journey:['#d8641e','#ff9a4a','#5a2108','#ffd08a'],
  tilawa:['#0b7350','#22a678','#03241a','#e9b44c'],arcade:['#6f35d6','#9d6bff','#25105a','#d6bcff'],news:['#8c1d3a','#c23a5c','#360714','#f3c06b'],
  study:['#0f8f89','#2cc4bc','#053b39','#a6fff6'],res:['#3b3fb6','#6a6ef0','#14164a','#c7c9ff'],contact:['#d9483a','#ff7b67','#5c140d','#ffd2a6'],tawthiq:['#a87a1c','#e0b048','#3d2a06','#fff2c8']};
 Object.keys(PC).forEach(function(id){var v=document.getElementById(id);if(v&&id!=='home'){v.dataset.pc=1;v.style.setProperty('--pc',PC[id][0]);v.style.setProperty('--pcg',PC[id][3])}});

 /* ---- الصوت (الانتقال رقم ٣ اللي اختاره أ. طلال) يتبع زر الصوت في الموقع ---- */
 var AC=window.AudioContext||window.webkitAudioContext,ctx=null,buf={};
 if(AC){try{ctx=new AC()}catch(e){}}
 if(ctx)['cin-trail','cin-tick','cin-back','cin-nav'].forEach(function(n){fetch('sfx/'+n+'.mp3').then(function(r){return r.arrayBuffer()}).then(function(a){return new Promise(function(ok,no){ctx.decodeAudioData(a,ok,no)})}).then(function(b){buf[n]=b}).catch(function(){})});
 ['pointerdown','touchend','click','keydown'].forEach(function(ev){document.addEventListener(ev,function(){if(ctx&&ctx.state!=='running')try{ctx.resume()}catch(e){}},true)});
 var lastT={};
 function play(n,v,off,rate){if(window.__cinLog)__cinLog.push(['cin',n,performance.now(),v==null?1:v,off||0,rate||1]);if(!ctx||ctx.state!=='running'||!buf[n]||(SND.on&&!SND.on()))return;var now=performance.now();if(now-(lastT[n]||0)<60)return;lastT[n]=now;
  var s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=buf[n];if(rate)s.playbackRate.value=rate;g.gain.value=v==null?1:v;s.connect(g);g.connect(ctx.destination);s.start(0,off||0)}

 var STAR=function(c){return '<svg viewBox="-100 -100 200 200"><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c8"/><stop offset=".5" stop-color="'+c+'"/><stop offset="1" stop-color="#8a6a2e"/></linearGradient></defs><g fill="none" stroke="url(#cg)">'
  +'<rect x="-58" y="-58" width="116" height="116" stroke-width="1.3"/><rect x="-58" y="-58" width="116" height="116" transform="rotate(45)" stroke-width="1.3"/>'
  +'<rect x="-40" y="-40" width="80" height="80" stroke-width=".6" opacity=".7"/><rect x="-40" y="-40" width="80" height="80" transform="rotate(45)" stroke-width=".6" opacity=".7"/>'
  +'<circle r="27" stroke-width=".5" stroke-dasharray="2 5"/><circle r="88" stroke-width=".4" opacity=".4"/></g></svg>'};
 function title(id){var v=document.getElementById(id),h=v&&v.querySelector('.sub h2');return h?h.textContent.trim():''}
 var cur=null;

 /* المشهد: انكشاف دائري من مكان الأيقونة، نجمة تلف، عنوان كلمة كلمة، ثم الكاميرا تبعد والبطاقات تطير */
 function scene(id,cx,cy,full,onMid){
  var c=PC[id]||PC.home,t=title(id),W=scr.offsetWidth,H=scr.offsetHeight,D=full?1:.72;
  var o=document.createElement('div');o.className='cin';o.style.setProperty('--pc',c[0]);o.style.setProperty('--pc2',c[1]);o.style.setProperty('--pc3',c[2]);
  var words=t.split(/\s+/).filter(Boolean);
  o.innerHTML='<div class="ir" style="left:'+cx+'px;top:'+cy+'px"></div><div class="gl"></div><div class="cam"><div class="st">'+STAR(c[3])+'</div>'
   +'<div class="tt"><div class="kk">قسم التربية الإسلامية</div><div class="bg">'+words.map(function(w){return '<span class="w"><i>'+w+'</i><b>'+w+'</b></span>'}).join('')+'</div></div></div>'
   +'<div class="sw"></div><div class="vg"></div><div class="sk">المس للتخطي</div>';
  scr.appendChild(o);if(cur)cur.finish();
  var A=[],q=function(el,k,opt){if(!el)return;var a=el.animate(k,Object.assign({fill:'forwards',easing:'cubic-bezier(.2,.7,.2,1)'},opt));A.push(a);return a},$o=function(s){return o.querySelector(s)};
  var T=function(ms){return ms*D};
  // 5) mask reveal + خط ذهبي
  q($o('.ir'),[{transform:'scale(0)'},{transform:'scale(1)'}],{duration:T(620),easing:'cubic-bezier(.7,0,.25,1)'});
  q($o('.sw'),[{transform:'scaleX(0)',opacity:0},{transform:'scaleX(1)',opacity:1,offset:.5},{transform:'scaleX(1)',opacity:0}],{duration:T(700),delay:T(120)});
  q($o('.gl'),[{opacity:0},{opacity:1}],{duration:T(500),delay:T(380)});
  // 3) الكاميرا: تقريب بطيء ثم تبعيد وعبور
  q($o('.cam'),[{transform:'scale(.94)',opacity:1},{transform:'scale(1.05)',opacity:1,offset:.8},{transform:'scale(1.32)',opacity:0}],{duration:T(1900),easing:'cubic-bezier(.45,0,.3,1)'});
  // 4) النجمة الثمانية
  q($o('.st'),[{transform:'rotate(-200deg) scale(.15)',opacity:0},{transform:'rotate(-20deg) scale(1)',opacity:.75,offset:.45},{transform:'rotate(25deg) scale(1.05)',opacity:.75,offset:.78},{transform:'rotate(70deg) scale(1.8)',opacity:0}],{duration:T(1900),delay:T(80),easing:'cubic-bezier(.4,0,.2,1)'});
  // 1) العنوان: كلمة كلمة من تحت لفوق مع blur يتلاشى، ثم يطلع لفوق ويختفي
  q($o('.kk'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none',offset:.25},{opacity:1,offset:.75},{opacity:0,transform:'translateY(-10px)'}],{duration:T(1500),delay:T(300)});
  [].forEach.call(o.querySelectorAll('.w'),function(w,i){var d=T(380+i*130);
   q(w,[{transform:'translateY(70%) scale(.94)',opacity:0},{transform:'none',opacity:1,offset:.35},{transform:'none',opacity:1,offset:.72},{transform:'translateY(-90%) scale(1.03)',opacity:0}],{duration:T(1450),delay:d});
   q(w.querySelector('i'),[{opacity:1},{opacity:0,offset:.35},{opacity:0,offset:.72},{opacity:1}],{duration:T(1450),delay:d});
   q(w.querySelector('b'),[{opacity:0},{opacity:1,offset:.35},{opacity:1,offset:.72},{opacity:0}],{duration:T(1450),delay:d});
   setTimeout(function(){play('cin-tick',.9,0,.92+Math.random()*.16)},d+T(160));
  });
  q($o('.sk'),[{opacity:0},{opacity:1}],{duration:400,delay:T(700)});
  // الخروج: الستارة كلها تبهت بعد عبور الكاميرا
  var out=q(o,[{opacity:1},{opacity:1,offset:.8},{opacity:0}],{duration:T(2050),easing:'linear'});
  var midT=setTimeout(function(){onMid&&onMid();onMid=null},T(700));
  var flyT=setTimeout(function(){fly(id)},T(1450));
  var self={finish:function(){clearTimeout(midT);clearTimeout(flyT);if(onMid){onMid();onMid=null}fly(id);A.forEach(function(a){try{a.finish()}catch(e){}});o.remove();if(cur===self)cur=null}};
  out.onfinish=function(){o.remove();if(cur===self)cur=null};
  o.addEventListener('pointerdown',function(e){e.stopPropagation();self.finish()});
  cur=self;return self;
 }
 /* 2) بطاقات الصفحة تطير مائلة بزاوية perspective وتستقر مع ظل ناعم */
 function fly(id){var v=document.getElementById(id);if(!v||v.dataset.flown==='1')return;v.dataset.flown='1';setTimeout(function(){v.dataset.flown=''},900);
  var els=[].slice.call(v.children).filter(function(e){return !e.classList.contains('sub')&&e.offsetHeight>20}).slice(0,4);
  var head=v.querySelector('.sub');
  if(head)head.animate([{transform:'translateY(-14px)',opacity:0},{transform:'none',opacity:1}],{duration:600,easing:'cubic-bezier(.2,.7,.2,1)'});
  els.forEach(function(e,i){var s=i%2?1:-1;
   e.animate([{transform:'perspective(900px) translate3d('+(-s*18)+'%,60px,-160px) rotateY('+(s*34)+'deg) rotateX(14deg)',opacity:0,boxShadow:'0 0 0 rgba(0,0,0,0)'},
    {transform:'perspective(900px) translate3d(0,0,0) rotateY(0) rotateX(0)',opacity:1,boxShadow:'0 26px 50px -24px rgba(0,0,0,.55)',offset:.8},
    {transform:'none',opacity:1,boxShadow:'0 0 0 rgba(0,0,0,0)'}],{duration:900,delay:i*110,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'})});
 }

 /* فتح أي أيقونة (باب) */
 var _expand=expand;
 expand=function(el,id){if(!id||!document.getElementById(id))return _expand(el,id);
  var r=rel(el),k=0;SND.init&&SND.init();
  play('cin-trail',.95,.9);
  scene(id,r.l+r.w/2,r.t+r.h/2,true,function(){go(id,r)});
 };
 /* التنقل من الشريط السفلي: نسخة أقصر من نفس المشهد */
 var nextId=null,navEl=null;
 document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#nav [data-go]');navEl=b||null},true);
 var _show=show;
 show=function(id,mode){nextId=id;return _show(id,mode)};
 PTX=function(){var id=nextId;if(!id||!PC[id])return;var x=scr.offsetWidth/2,y=scr.offsetHeight*.9;
  if(navEl){var r=rel(navEl);x=r.l+r.w/2;y=r.t+r.h/2}navEl=null;
  play('cin-nav',.85);scene(id,x,y,false,null);
 };
 /* المشهد السينمائي يحل محل حركة «التجمّع» عند الفتح حتى ما تتكرر مقدمتين */
 GX.section=function(id,v,done){done()};
 /* أصوات الموقع القديمة للفتح والرجوع والانتقال تُستبدل بأصوات المشهد */
 var _sp=SND.play;SND.play=function(n,v,off){if(n==='back'||n==='door'||n==='flick')return;if(window.__cinLog)__cinLog.push(['snd',n,performance.now(),v==null?1:v,off||0,1]);return _sp.apply(this,arguments)};
 /* الرجوع: صوت هوا معكوس */
 var _back=back;back=function(){if(cur)cur.finish();play('cin-back',.7);return _back()};

 /* داخل الصفحة: العنوان يطلع لفوق مع السحب وparallax خفيف */
 [].forEach.call(document.querySelectorAll('.view'),function(v){var h=v.querySelector('.sub');if(!h)return;var raf=0;
  v.addEventListener('scroll',function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;var y=Math.min(1,v.scrollTop/160);
   h.style.transform='translate3d(0,'+(v.scrollTop*.35)+'px,0) scale('+(1-y*.06)+')';h.style.opacity=1-y*.85})},{passive:true})});
 return {scene:scene,play:play,PC:PC};
})();
window.CIN=CIN;
