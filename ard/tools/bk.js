const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.argv[2]+'/index.html',{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
await p.pdf({path:process.argv[3],preferCSSPageSize:true,printBackground:true});
const of=await p.evaluate(()=>[...document.querySelectorAll('.in')].map((e,i)=>e.scrollHeight>e.clientHeight+2?i:null).filter(x=>x!==null));
console.log('overflow pages(in idx):',of);await b.close()})();
