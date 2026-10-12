/* ياسمينة: يشتغل بدون نت بعد أول فتح. ملفات التطبيق تنحفظ هني، وأصوات التلاوة يحفظها التطبيق نفسه (najma-audio-v1). */
const V='najma-app-v6',FILES=['./','./index.html','./app.js','./quran.js','./en.js','./tilawa.js','./school.js','./manifest.webmanifest','./fonts/kid500.woff2','./fonts/kid700.woff2','./fonts/kidl700.woff2','./fonts/quran.woff2','./fonts/en400.woff2','./fonts/en700.woff2','./icons/icon-192.png','./icons/icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('najma-app-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* الشبكة أولًا (عشان التحديثات توصل فورًا)، وإذا ما في نت نستخدم المحفوظ */
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 e.respondWith(caches.open(V).then(c=>fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>c.match(r,{ignoreSearch:true}).then(m=>m||c.match('./index.html')))))});
