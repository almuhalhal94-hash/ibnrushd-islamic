const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('http://localhost:8796/ad2.html');await p.waitForTimeout(1500);await p.evaluate(()=>document.fonts.ready);
const N=38*30;for(let i=0;i<N;i++){await p.evaluate(t=>R(t),i/30);if(i%72===0)await p.waitForTimeout(30);await p.screenshot({path:'/home/claude/work/ad/frames/f'+String(i).padStart(5,'0')+'.jpg',type:'jpeg',quality:92})}
await b.close();console.log('done')})();
