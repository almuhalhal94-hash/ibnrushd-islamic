/* «اليوم المفتوح» — تشفير تقرير كل طالب برقمه الشخصي.
   من الرقم الشخصي (PBKDF2-SHA256، 250000 دورة) يطلع 48 بايت: أول 32 مفتاح AES-GCM، والباقي اسم المستند في Firestore (yawm/{id}).
   فلا أحد يعرف مكان تقرير الطالب ولا يفتحه إلا برقمه الشخصي، والقاعدة تسمح بقراءة مستند واحد بالاسم فقط (بدون قائمة). */
var YAWM=(function(){
var SALT='ibnrushd-islamic/yawm/2026',IT=250000,PROJ='maktab-ibnrushd',KEY='AIzaSyCgFaRSlkmYEn6Lr9VjrXdkzPG8WTYpVGg';
var te=new TextEncoder(),td=new TextDecoder();
function cpr(v){var s=String(v==null?'':v).replace(/[٠-٩]/g,function(c){return c.charCodeAt(0)-1632}).replace(/[۰-۹]/g,function(c){return c.charCodeAt(0)-1776}).replace(/\D/g,'');return /^\d{9}$/.test(s)?s:''}
function b64(u){var s='';u=new Uint8Array(u);for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s)}
function ub(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function hex(u){return Array.prototype.map.call(u,function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
function bits(c){return crypto.subtle.importKey('raw',te.encode(c),'PBKDF2',false,['deriveBits'])
  .then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:te.encode(SALT),iterations:IT},k,384)}).then(function(b){return new Uint8Array(b)})}
function split(u){return crypto.subtle.importKey('raw',u.slice(0,32),'AES-GCM',false,['encrypt','decrypt']).then(function(k){return {id:'y'+hex(u.slice(32,48)),key:k}})}
/* the teacher side: cache = {cpr: base64(48 bytes)} kept in the teachers' private document, so a new upload only works out new students */
function seal(s,extra,cache){var c=cpr(s.id),u=cache&&cache[c]?Promise.resolve(ub(cache[c])):bits(c).then(function(x){if(cache)cache[c]=b64(x);return x});
  return u.then(split).then(function(r){var iv=crypto.getRandomValues(new Uint8Array(12)),body=JSON.stringify({s:s,avg:extra.avg==null?null:extra.avg,up:extra.up||''});
    return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},r.key,te.encode(body)).then(function(ct){return {id:r.id,box:b64(iv)+'.'+b64(ct)}})})}
/* the parent side: one request, for one document */
function open(v){var c=cpr(v);if(!c)return Promise.reject(new Error('cpr'));
  return bits(c).then(split).then(function(r){
    return fetch('https://firestore.googleapis.com/v1/projects/'+PROJ+'/databases/(default)/documents/yawm/'+r.id+'?key='+KEY,{cache:'no-store'}).then(function(res){
      if(res.status===404)throw new Error('none');if(!res.ok)throw new Error('net'+res.status);return res.json()})
    .then(function(j){var box=j&&j.fields&&j.fields.c&&j.fields.c.stringValue;if(!box)throw new Error('none');var p=box.split('.');
      return crypto.subtle.decrypt({name:'AES-GCM',iv:ub(p[0])},r.key,ub(p[1])).then(function(pt){return JSON.parse(td.decode(pt))})})})}
return {cpr:cpr,seal:seal,open:open};
})();
