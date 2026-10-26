/* service worker: page always fresh from the network when online (offline falls back to the last copy); images and lesson strips cached after first view */
const V='isl-v1-nc',META='isl-meta';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['./','./icons/icon-192.png','./manifest.webmanifest'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('isl-')&&x!==V&&x!==META).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 if(r.mode==='navigate'||u.pathname.endsWith('.html')||u.pathname.endsWith('/')){e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./'))));return}
 if(/\.(jpg|jpeg|png|svg|webp|woff2?)$/i.test(u.pathname)){e.respondWith(caches.match(r).then(m=>{const f=fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>m);return m||f}))}});

/* background check for new announcements (installed app, browsers with Periodic Background Sync): shows a notification for each new item in ann.json not yet seen */
async function annCheck(){try{const r=await fetch('ann.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const A=await r.json();const c=await caches.open(META);
 const rd=async k=>{const m=await c.match(k);return m?m.json():[]};const seen=await rd('seen'),nt=await rd('notified');
 const N=A.filter(a=>seen.indexOf(a.id)<0&&nt.indexOf(a.id)<0);
 for(const a of N.slice(0,3))await self.registration.showNotification(a.title,{body:a.body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:a.id,lang:'ar',dir:'rtl',data:{go:a.go}});
 await c.put('notified',new Response(JSON.stringify(nt.concat(N.map(a=>a.id)))));
 const un=A.filter(a=>seen.indexOf(a.id)<0).length;if(self.navigator.setAppBadge){if(un)self.navigator.setAppBadge(un);else self.navigator.clearAppBadge()}}catch(e){}}
/* «ردود القسم»: the parent's derived key (non-extractable CryptoKey, never the personal number) is kept in IndexedDB on their device; new replies it can open trigger a notification */
function rudDB(){return new Promise((ok,no)=>{const q=indexedDB.open('rudud',1);q.onupgradeneeded=()=>q.result.createObjectStore('subs',{keyPath:'fp'});q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})}
const b64u=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function rudCheck(){try{const db=await rudDB();const subs=await new Promise(ok=>{const q=db.transaction('subs').objectStore('subs').getAll();q.onsuccess=()=>ok(q.result||[])});if(!subs.length)return;
 const r=await fetch('data/rudud.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const d=await r.json();
 for(const s of subs){if(s.salt!==d.salt)continue;const fresh=d.r.filter(x=>s.seen.indexOf(x.i)<0);let n=0;
  for(const x of fresh){try{await crypto.subtle.decrypt({name:'AES-GCM',iv:b64u(x.i)},s.key,b64u(x.c));n++}catch(e){}}
  if(n)await self.registration.showNotification('وصل رد المعلم على استفساركم 📩',{body:'اضغط لعرض الرد في «ردود القسم»',icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:'rud-'+s.fp,lang:'ar',dir:'rtl',data:{go:'rudud.html'}});
  s.seen=d.r.map(x=>x.i);await new Promise(ok=>{const q=db.transaction('subs','readwrite').objectStore('subs').put(s);q.onsuccess=ok;q.onerror=ok})}}catch(e){}}
self.addEventListener('periodicsync',e=>{if(e.tag==='ann-check'||e.tag==='rud-check')e.waitUntil(Promise.all([annCheck(),rudCheck()]))});
self.addEventListener('message',e=>{if(e.data==='ann-check')e.waitUntil(annCheck());if(e.data==='rud-check')e.waitUntil(rudCheck())});
self.addEventListener('notificationclick',e=>{e.notification.close();const go=(e.notification.data||{}).go||'';const url=self.registration.scope+(/\.html/.test(go)?go:(go&&go.charAt(0)!=='#'?'#'+go:''));
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const w of l){if('focus' in w){if(w.navigate)w.navigate(url).catch(()=>{});return w.focus()}}return clients.openWindow(url)}))});
