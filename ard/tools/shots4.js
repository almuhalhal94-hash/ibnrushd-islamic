const {chromium}=require('playwright');
const S=process.argv[2];
(async()=>{
 const b=await chromium.launch();
 const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'ar'});
 const p=await c.newPage(); const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const D='http://localhost:8790/ibnrushd-islamic/';
 await p.goto(D+'index.html',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
 await p.click('#door').catch(()=>{}); await p.evaluate(()=>setInterval(()=>{for(const e of document.querySelectorAll('body *')){if(e.children.length<40&&/حمّل تطبيق قسم/.test(e.textContent||'')){let a=e;while(a&&a!==document.body&&getComputedStyle(a).position!=='fixed')a=a.parentElement;if(a&&a!==document.body)a.remove()}}document.querySelectorAll('.pwa-bg,.sheet-bg,.ov,.backdrop').forEach(x=>x.remove())},200)); await p.waitForTimeout(3500);
 await p.screenshot({path:S+'/d_home.png'});
 await p.evaluate(()=>scrollTo(0,800)); await p.waitForTimeout(800); await p.screenshot({path:S+'/d_home2.png'});
 await p.evaluate(()=>scrollTo(0,1700)); await p.waitForTimeout(800); await p.screenshot({path:S+'/d_home3.png'});
 for(const g of ['dars','tilawa','review','acts','magazine','twin','exam','grades']){
   const ok=await p.evaluate(g=>{const e=[...document.querySelectorAll('[data-go="'+g+'"]')][0]; if(e){e.click();return 1}return 0},g);
   await p.waitForTimeout(1800); await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(300);
   if(ok) await p.screenshot({path:S+'/d_'+g+'.png'}); else errs.push('no '+g);
 }
 for(const f of ['tilawa-file.html','game.html','hoop.html','bridge.html']){
   await p.goto(D+f,{waitUntil:'networkidle'}).catch(e=>errs.push(f+e.message)); await p.waitForTimeout(2000);
   await p.click('#door').catch(()=>{}); await p.waitForTimeout(1500);
   await p.screenshot({path:S+'/d_'+f.replace(/\W/g,'_')+'.png'});
 }
 const L=await b.newContext({viewport:{width:1280,height:720},locale:'ar'}); const q=await L.newPage();
 await q.goto(D+'lobby/index.html',{waitUntil:'networkidle'}); await q.waitForTimeout(4000); await q.screenshot({path:S+'/d_lobby.png'});
 console.log(errs.slice(0,10).join('\n')); await b.close();
})();
