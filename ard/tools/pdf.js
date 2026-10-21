const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:1200}});
await p.emulateMedia({colorScheme:'light'});
await p.goto('file://'+process.argv[2]+'/index.html',{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
await p.addStyleTag({content:`
.toc,.cp{display:none!important}
.hero .wrap{padding-block:40px 34px}
.reel{flex-wrap:wrap;overflow:visible;justify-content:center;gap:14px;padding:16px 0 4px}
.reel{break-inside:avoid}.reel figure{width:122px;break-inside:avoid}.reel figcaption{font-size:.72rem}
.reel img{border-width:5px;border-radius:20px;box-shadow:none}
.wide{max-width:420px;margin-inline:auto;break-inside:avoid}
.wide img{box-shadow:none}
.feat,.idea,.lk,.stat{break-inside:avoid}
section.ax{padding-block:30px 4px}
#mushaf,#insta{break-before:page}.idea{padding:12px;gap:6px}.cap{font-size:.82rem;padding:8px 10px}.idea .shot{font-size:.84rem}footer{display:none!important}#links::after{content:"قسم التربية الإسلامية · مدرسة ابن رشد الإعدادية للبنين · إعداد: أ. طلال سعود المهلهل";display:block;margin-top:22px;padding:12px;text-align:center;border-radius:12px;background:#0a3f31;color:#f3d993;font-weight:700;font-size:.9rem}#life,#links,#play{break-inside:avoid}.ax-head{break-after:avoid}.feats{gap:8px;margin-top:12px}.feat{padding:10px 12px}.feat p{font-size:.84rem}
footer{margin-top:30px}
`});
await p.waitForTimeout(2500);
await p.pdf({path:process.argv[3],format:'A4',printBackground:true,margin:{top:'10mm',bottom:'10mm',left:'0',right:'0'}});
await b.close()})();
