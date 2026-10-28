/* ميدان الرماة · قسم التربية الإسلامية – مدرسة ابن رشد
   لعبة رماية ثلاثية الأبعاد: الطالب يمشي في الواحة من محطة لمحطة، وفي كل محطة سؤال من مذكرة صفّه
   وثلاثة أهداف عليها الإجابات، فيرمي هدف الإجابة الصحيحة. */
import * as THREE from './lib/three.module.min.js';

const $ = id => document.getElementById(id);
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const store = {
  get(k, d) { try { const v = localStorage.getItem('rumat.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('rumat.' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ================= الإعدادات ================= */
const STATIONS = 10, GAP = 70, HEARTS = 3, GRAV = 6.2;
const RIDE_N = 8, RIDE_GAP = 82; // الرماية على ظهر الخيل: ٨ محطات أبعد عن بعض
const SET = { sens: store.get('sens', 1), lefty: store.get('lefty', false) };
const HADITH = {
  0: 'قال رسول الله ﷺ: <b>«ألا إنّ القوةَ الرمي»</b> <span style="opacity:.6;font-size:12px">رواه مسلم</span>',
  1: 'قال رسول الله ﷺ: <b>«الخيلُ معقودٌ في نواصيها الخيرُ إلى يوم القيامة»</b> <span style="opacity:.6;font-size:12px">متفق عليه</span>'
};
const COLORS = ['#1f9d6b', '#2f6fd6', '#9b4dd0'], LETTERS = ['أ', 'ب', 'ج'];
const GRADES = { 6: 'السادس الابتدائي', 7: 'الأول الإعدادي', 8: 'الثاني الإعدادي', 9: 'الثالث الإعدادي' };
const MOBILE = matchMedia('(pointer:coarse)').matches;

/* ================= التضاريس ================= */
function hash(x, z) { const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return h - Math.floor(h); }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z) { let s = 0, a = .5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= .5; } return s; }
const pathX = z => Math.sin(z * 0.018) * 14 + Math.sin(z * 0.047) * 3;
function groundY(x, z) {
  const dp = Math.abs(x - pathX(z));
  const flat = THREE.MathUtils.smoothstep(dp, 16, 46);
  const dunes = (fbm(x * 0.011 + 3, z * 0.011) - .35) * 22 + Math.sin(x * 0.05 + z * 0.02) * 2.2;
  return Math.max(0, dunes) * flat + (fbm(x * 0.25, z * 0.25) - .5) * 0.18;
}
const stationPos = i => { const z = -12 - i * GAP; return new THREE.Vector3(pathX(z), 0, z).setY(groundY(pathX(z), z)); };

/* ================= المشهد ================= */
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
let PR = Math.min(devicePixelRatio || 1, MOBILE ? 1.6 : 2);
renderer.setPixelRatio(PR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const HORIZON = new THREE.Color('#f3b98a'), ZENITH = new THREE.Color('#3b4f8f');
scene.fog = new THREE.Fog(HORIZON.clone().lerp(new THREE.Color('#d9a47c'), .4), 70, 420);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1200);
const SUN = new THREE.Vector3(0.55, 0.2, -0.81).normalize();

// السماء
{
  const g = new THREE.SphereGeometry(900, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: ZENITH }, hor: { value: HORIZON }, sun: { value: SUN } },
    vertexShader: 'varying vec3 vd;void main(){vd=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform vec3 top,hor,sun;varying vec3 vd;
      void main(){float h=max(vd.y,0.);vec3 c=mix(hor,top,pow(h,.55));
      c=mix(c,vec3(.95,.62,.45),smoothstep(.0,-.15,vd.y));
      float s=max(dot(vd,sun),0.);c+=vec3(1.,.75,.45)*(pow(s,700.)*4.+pow(s,24.)*.35+pow(s,4.)*.12);
      gl_FragColor=vec4(c,1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`
  });
  const sky = new THREE.Mesh(g, m); sky.renderOrder = -1; scene.add(sky); scene.userData.sky = sky;
}

scene.add(new THREE.HemisphereLight('#bcd2ff', '#c98d55', 0.95));
const sunLight = new THREE.DirectionalLight('#ffd7a8', 2.6);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
Object.assign(sunLight.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28, near: 1, far: 160 });
sunLight.shadow.bias = -0.0006; sunLight.shadow.normalBias = 0.04;
scene.add(sunLight, sunLight.target);

// أداة دمج أشكال ملوّنة في شكل واحد (رسم أسرع على الجوال)
function merge(parts, smooth) {
  let n = 0; const gs = parts.map(([g, c, mtx]) => { g = g.index ? g.toNonIndexed() : g.clone(); if (mtx) g.applyMatrix4(mtx); if (!smooth) g.computeVertexNormals(); n += g.attributes.position.count; return [g, new THREE.Color(c)]; });
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3); let o = 0;
  for (const [g, c] of gs) {
    P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3);
    for (let i = 0; i < g.attributes.position.count; i++) c.toArray(C, (o + i) * 3);
    o += g.attributes.position.count; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(P, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  out.setAttribute('color', new THREE.BufferAttribute(C, 3));
  return out;
}
const M4 = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(s, s, s));
const vcMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85 });
const vcFlat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, flatShading: true });

// الأرض
{
  const W = 340, L = 880, g = new THREE.PlaneGeometry(W, L, MOBILE ? 90 : 130, MOBILE ? 230 : 330);
  g.rotateX(-Math.PI / 2); g.translate(0, 0, -L / 2 + 70);
  const p = g.attributes.position, col = new Float32Array(p.count * 3);
  const a = new THREE.Color('#c58f58'), b = new THREE.Color('#e7bb80'), c = new THREE.Color('#f4d6a2'), t = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = groundY(x, z); p.setY(i, y);
    const k = clamp(y / 9, 0, 1), n = vnoise(x * .4, z * .4);
    t.copy(a).lerp(b, .55 + n * .45).lerp(c, k * .7);
    if (Math.abs(x - pathX(z)) < 2.2) t.lerp(new THREE.Color('#b9875a'), .25);
    t.toArray(col, i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const ground = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  ground.receiveShadow = true; scene.add(ground);
}

// جبال بعيدة
function rock() { const g = new THREE.DodecahedronGeometry(1, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 + (hash(Math.round(p.getX(i) * 50), Math.round(p.getZ(i) * 50 + p.getY(i) * 30)) - .5) * .35; p.setXYZ(i, p.getX(i) * k, Math.max(p.getY(i), -.3) * k, p.getZ(i) * k); } return g; }
{
  const parts = [];
  for (let i = 0; i < 46; i++) {
    const z = 60 - i * 19, side = i % 2 ? 1 : -1, x = side * rnd(170, 260) + pathX(z);
    const h = rnd(25, 70), r = rnd(40, 80);
    parts.push([rock(), i % 3 ? '#8a5f62' : '#9c6c66', new THREE.Matrix4().compose(new THREE.Vector3(x, -h * .25, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rnd(0, 6), 0)), new THREE.Vector3(r, h, r * rnd(.6, 1)))]);
  }
  for (let i = 0; i < 9; i++) parts.push([rock(), '#86605f', new THREE.Matrix4().compose(new THREE.Vector3(rnd(-220, 220), -10, -830 - rnd(0, 60)), new THREE.Quaternion(), new THREE.Vector3(rnd(60, 90), rnd(40, 70), 50))]);
  scene.add(new THREE.Mesh(merge(parts), vcFlat));
}

// نخيل (مرسوم دفعة وحدة)
const palmSpots = [];
{
  const trunkG = new THREE.CylinderGeometry(0.13, 0.22, 1, 7, 10, true); trunkG.translate(0, .5, 0);
  { const p = trunkG.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + y * y * .16); const s = (Math.floor(y * 10) % 2) ? .82 : 1; col.push(.45 * s, .31 * s, .2 * s); }
    trunkG.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); trunkG.computeVertexNormals(); }
  const frondG = new THREE.PlaneGeometry(3.4, .7, 10, 2); frondG.rotateX(-Math.PI / 2); frondG.translate(1.7, 0, 0);
  { const p = frondG.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setZ(i, z * (1 - x / 3.7) * (x < .3 ? x / .3 : 1)); p.setY(i, -0.12 * x * x + .3 * x - Math.abs(z) * .5); const g = .7 + .3 * (x / 3.4); col.push(.2 * g, .45 * g, .17 * g); }
    frondG.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); frondG.computeVertexNormals(); }
  for (let i = 0; i < 95; i++) {
    const z = 40 - rnd(0, 760), side = Math.random() < .5 ? -1 : 1, d = rnd(9, 40), x = pathX(z) + side * d;
    if (palmSpots.some(p => Math.hypot(p.x - x, p.z - z) < 4)) continue;
    palmSpots.push({ x, z, h: rnd(5, 8.5), r: rnd(0, 6.28) });
  }
  // نخيل حول كل محطة
  for (let i = 0; i < STATIONS; i++) { const s = stationPos(i); for (const k of [-1, 1]) palmSpots.push({ x: s.x + k * rnd(7, 10), z: s.z + rnd(-3, 4), h: rnd(6, 8), r: rnd(0, 6) }); }
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, side: THREE.DoubleSide });
  const trunks = new THREE.InstancedMesh(trunkG, mat, palmSpots.length), fronds = new THREE.InstancedMesh(frondG, mat, palmSpots.length * 9);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); let fi = 0;
  palmSpots.forEach((p, i) => {
    const y = groundY(p.x, p.z) - .1;
    m.compose(new THREE.Vector3(p.x, y, p.z), q.setFromEuler(e.set(0, p.r, 0)), new THREE.Vector3(p.h * .9, p.h, p.h * .9)); trunks.setMatrixAt(i, m);
    const top = new THREE.Vector3(.16 * p.h * .9, p.h, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.r).add(new THREE.Vector3(p.x, y, p.z));
    for (let k = 0; k < 9; k++) { m.compose(top, q.setFromEuler(e.set(rnd(-.15, .15), k * .698 + p.r, rnd(-.35, .1), 'YXZ')), new THREE.Vector3(1, 1, 1).multiplyScalar(p.h / 7)); fronds.setMatrixAt(fi++, m); }
  });
  trunks.castShadow = fronds.castShadow = true; scene.add(trunks, fronds);
}

// نقشة السدو للخيام والزوالي
function saduTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  const bands = ['#2b1a14', '#f1e3c8', '#8c1f1f', '#2b1a14', '#e8d3a8', '#5a2a1a', '#f1e3c8', '#2b1a14'];
  let y = 0; for (let i = 0; i < 16; i++) { x.fillStyle = bands[i % bands.length]; const h = i % 4 == 1 ? 34 : 12; x.fillRect(0, y, 256, h); if (i % 4 == 1) { x.fillStyle = '#d6a440'; for (let k = 0; k < 256; k += 32) { x.beginPath(); x.moveTo(k, y + 17); x.lineTo(k + 16, y + 4); x.lineTo(k + 32, y + 17); x.lineTo(k + 16, y + 30); x.fill(); } } y += h; if (y > 256) break; }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const SADU = saduTexture();
// خيام بدوية
{
  const tentMat = new THREE.MeshStandardMaterial({ map: SADU, roughness: .95, side: THREE.DoubleSide });
  const poleMat = new THREE.MeshStandardMaterial({ color: '#4a3020', roughness: .8 });
  for (let i = 0; i < STATIONS; i += 1) {
    const s = stationPos(i), side = i % 2 ? 1 : -1, x = s.x + side * 13, z = s.z + 8, y = groundY(x, z);
    const g = new THREE.PlaneGeometry(7, 5, 10, 6); const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const u = p.getX(k) / 3.5, v = p.getY(k) / 2.5; p.setZ(k, 2.4 - .5 * Math.abs(Math.sin(u * 3.14)) - .9 * v * v); }
    g.rotateX(-Math.PI / 2); g.computeVertexNormals(); g.attributes.uv.array.forEach((_, k, a) => { a[k] *= 2; });
    const tent = new THREE.Group(); const cloth = new THREE.Mesh(g, tentMat); cloth.position.y = 0; cloth.castShadow = cloth.receiveShadow = true; tent.add(cloth);
    for (const [px, pz, h] of [[-3.3, -2.3, 1.6], [3.3, -2.3, 1.6], [-3.3, 2.3, 1.6], [3.3, 2.3, 1.6], [0, 0, 2.5], [-1.7, 0, 2.2], [1.7, 0, 2.2]]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, h, 6), poleMat); pole.position.set(px, h / 2, pz); tent.add(pole); }
    tent.position.set(x, y, z); tent.rotation.y = side * .3; scene.add(tent);
  }
}
// صخور
{
  const g = new THREE.DodecahedronGeometry(1, 0), n = 130, inst = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: '#9b6f55', roughness: 1, flatShading: true }), n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { const z = 40 - rnd(0, 780), x = pathX(z) + (Math.random() < .5 ? -1 : 1) * rnd(5, 60), s = rnd(.25, 1.6);
    m.compose(new THREE.Vector3(x, groundY(x, z) + s * .2, z), new THREE.Quaternion().random(), new THREE.Vector3(s * rnd(.8, 1.6), s * rnd(.5, 1), s)); inst.setMatrixAt(i, m); }
  inst.castShadow = inst.receiveShadow = true; scene.add(inst);
}

/* ================= الجزيئات ================= */
function dotTexture() { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); }
const DOT = dotTexture();
class Particles {
  constructor(n, size, additive) {
    this.n = n; this.i = 0; this.pos = new Float32Array(n * 3).fill(-9999); this.col = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.life = new Float32Array(n); this.base = new Float32Array(n * 3); this.drag = new Float32Array(n); this.g = new Float32Array(n);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.pts = new THREE.Points(g, new THREE.PointsMaterial({ size, map: DOT, vertexColors: true, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: additive ? 1 : .75 }));
    this.pts.frustumCulled = false; scene.add(this.pts);
  }
  burst(p, count, color, speed, up = 1, life = 1, grav = 4, drag = 1.5) {
    const c = new THREE.Color(color);
    for (let k = 0; k < count; k++) {
      const i = this.i = (this.i + 1) % this.n, a = rnd(0, 6.28), b = rnd(-.2, 1), s = speed * rnd(.3, 1);
      this.pos.set([p.x, p.y, p.z], i * 3);
      this.vel.set([Math.cos(a) * Math.cos(b) * s, (Math.sin(b) * s + rnd(0, 1)) * up, Math.sin(a) * Math.cos(b) * s], i * 3);
      this.life[i] = life * rnd(.6, 1.2); c.toArray(this.base, i * 3); this.g[i] = grav; this.drag[i] = drag;
    }
  }
  update(dt) {
    for (let i = 0; i < this.n; i++) {
      if (this.life[i] <= 0) continue; this.life[i] -= dt;
      if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -9999; continue; }
      const d = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= d; this.vel[i * 3 + 2] *= d; this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * d - this.g[i] * dt;
      for (let k = 0; k < 3; k++) this.pos[i * 3 + k] += this.vel[i * 3 + k] * dt;
      const f = Math.min(1, this.life[i] * 2); for (let k = 0; k < 3; k++) this.col[i * 3 + k] = this.base[i * 3 + k] * f;
    }
    this.pts.geometry.attributes.position.needsUpdate = this.pts.geometry.attributes.color.needsUpdate = true;
  }
}
const sparks = new Particles(500, .22, true), dust = new Particles(400, .55, false);

/* ================= الرامي ================= */
const player = { pos: new THREE.Vector3(), yaw: 0, pitch: 0.06, vel: new THREE.Vector3(), walk: 0, vy: 0, air: false };
const hero = new THREE.Group(); scene.add(hero);
const skin = '#c08a64';
function canvasTex(w, h, draw, rep = 1) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8; return t; }
// قماش الثوب: أبيض بنسيج خفيف
const thobeTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#f5f3ee'; x.fillRect(0, 0, w, h); for (let i = 0; i < 2200; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '190,185,175'},${Math.random() * .08})`; x.fillRect(Math.random() * w, Math.random() * h, 1, Math.random() * 6 + 1); } });
// الشماغ الأحمر
const shemaghTex = canvasTex(256, 256, (x, w, h) => {
  x.fillStyle = '#f7f4ef'; x.fillRect(0, 0, w, h); x.fillStyle = '#b3202a';
  for (let i = 0; i < w; i += 16) for (let j = 0; j < h; j += 16) { x.fillRect(i, j + 6, 16, 4); x.fillRect(i + 6, j, 4, 16); if ((i + j) % 32 == 0) x.fillRect(i + 2, j + 2, 4, 4); }
}, 3);
// البشت: صوف داكن بحاشية زري ذهبية على الفتحة والذيل
const bishtTex = canvasTex(512, 512, (x, w, h) => {
  x.fillStyle = '#2a1d15'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i += 6) { x.fillStyle = `rgba(0,0,0,${.12 + .1 * Math.sin(i * .21)})`; x.fillRect(i, 0, 3, h); }
  const gold = x.createLinearGradient(0, 0, 26, 0); gold.addColorStop(0, '#8a6420'); gold.addColorStop(.5, '#f3cf6e'); gold.addColorStop(1, '#9a7226');
  x.fillStyle = gold; x.fillRect(0, 0, 24, h); x.save(); x.translate(w, 0); x.scale(-1, 1); x.fillRect(0, 0, 24, h); x.restore();
  x.fillStyle = '#c9a04a'; x.fillRect(0, h - 14, w, 10);
  x.strokeStyle = 'rgba(255,230,160,.6)'; for (let y = 0; y < h; y += 10) { x.beginPath(); x.moveTo(4, y); x.lineTo(20, y + 5); x.stroke(); x.beginPath(); x.moveTo(w - 4, y); x.lineTo(w - 20, y + 5); x.stroke(); }
});
const MAT = {
  thobe: new THREE.MeshStandardMaterial({ map: thobeTex, roughness: .78, side: THREE.DoubleSide }),
  bisht: new THREE.MeshStandardMaterial({ map: bishtTex, roughness: .9, side: THREE.DoubleSide }),
  shemagh: new THREE.MeshStandardMaterial({ map: shemaghTex, roughness: .85, side: THREE.DoubleSide }),
  skin: new THREE.MeshStandardMaterial({ color: skin, roughness: .62 }),
  eyes: new THREE.MeshStandardMaterial({ color: '#2b1c16', roughness: .9 }),
  black: new THREE.MeshStandardMaterial({ color: '#141212', roughness: .55 }),
  leather: new THREE.MeshStandardMaterial({ color: '#6b4223', roughness: .7 }),
  dark: new THREE.MeshStandardMaterial({ color: '#3d2616', roughness: .75 }),
  gold: new THREE.MeshStandardMaterial({ color: '#d8b056', roughness: .3, metalness: .85 })
};
const V2 = a => a.map(([x, y]) => new THREE.Vector2(x, y));
// شكل الجسم: مقطع بيضاوي (أكتاف أعرض من العمق) وطيّات خفيفة في الثوب
function bodyLathe(points, seg, phiS, phiL, sx = 1.2, sz = .8, folds = 0) {
  const g = new THREE.LatheGeometry(V2(points), seg, phiS, phiL), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(x, z), f = folds * Math.max(0, 1 - y / 1.05);
    const k = 1 + f * (.05 * Math.sin(a * 9 + y * 3) + .02 * Math.sin(a * 23));
    p.setXYZ(i, x * sx * k, y, z * sz * k);
  }
  g.computeVertexNormals(); return g;
}
const torso = new THREE.Group(); hero.add(torso);
const add = (g, m, parent = torso) => { const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
// الثوب (للكاحل)
const thobeM = add(bodyLathe([[.0, .1], [.2, .1], [.215, .14], [.205, .5], [.19, .85], [.172, 1.0], [.18, 1.12], [.2, 1.26], [.215, 1.36], [.19, 1.42], [.12, 1.47], [.058, 1.5], [.052, 1.58]], 32, 0, Math.PI * 2, 1.2, .78, 1), MAT.thobe);
// البشت المفتوح من الأمام
const bishtM = add(bodyLathe([[.25, .32], [.245, .6], [.225, .95], [.215, 1.12], [.232, 1.3], [.238, 1.39], [.2, 1.45], [.13, 1.49], [.075, 1.52]], 34, Math.PI * 1.16, Math.PI * 1.68, 1.22, .84, .6), MAT.bisht);
// نسخة الجلوس على الخيل: ثوب وبشت يبدآن من الورك (الساقان مرسومتان مع الخيل)
const thobeR = add(bodyLathe([[.0, .86], [.2, .86], [.21, .92], [.185, 1.0], [.18, 1.12], [.2, 1.26], [.215, 1.36], [.19, 1.42], [.12, 1.47], [.058, 1.5], [.052, 1.58]], 32, 0, Math.PI * 2, 1.25, .85, 0), MAT.thobe);
const bishtR = add(bodyLathe([[.25, .8], [.235, .95], [.215, 1.12], [.232, 1.3], [.238, 1.39], [.2, 1.45], [.13, 1.49], [.075, 1.52]], 34, Math.PI * 1.16, Math.PI * 1.68, 1.26, .9, .3), MAT.bisht);
thobeR.visible = bishtR.visible = false;
// الحزام والإبزيم
{ const b = new THREE.TorusGeometry(.176, .022, 6, 32); b.rotateX(Math.PI / 2); b.scale(1.2, 1, .8); add(b, MAT.leather).position.y = 1.0;
  add(new THREE.BoxGeometry(.06, .05, .02), MAT.gold).position.set(0, 1.0, -.15); }
// الرأس: لثام يغطي الوجه وتظهر العينان كظل فقط
const HEAD_Y = 1.665;
{
  const head = add(new THREE.SphereGeometry(.105, 24, 18), MAT.skin); head.scale.set(.9, 1.06, .98); head.position.y = HEAD_Y;
  const eyes = add(new THREE.BoxGeometry(.11, .022, .02), MAT.eyes); eyes.position.set(0, HEAD_Y + .012, -.092);
  // الشماغ: يغطي الرأس وينسدل على الكتفين، مفتوح عند العينين فقط
  const sh = add(new THREE.LatheGeometry(V2([[0, .145], [.06, .14], [.11, .1], [.125, .03], [.125, -.04], [.14, -.12], [.2, -.2], [.26, -.25]]), 32, Math.PI * 1.17, Math.PI * 1.66), MAT.shemagh); sh.position.y = HEAD_Y; sh.scale.set(1, 1, 1.05);
  // اللثام على الأنف والفم
  const lit = add(new THREE.LatheGeometry(V2([[.112, .0], [.116, -.04], [.122, -.09], [.14, -.14]]), 16, Math.PI * .78, Math.PI * .46), MAT.shemagh); lit.position.y = HEAD_Y;
  // جبهة الشماغ فوق العينين
  const brow = add(new THREE.LatheGeometry(V2([[.112, .13], [.122, .08], [.124, .035]]), 16, Math.PI * .8, Math.PI * .42), MAT.shemagh); brow.position.y = HEAD_Y;
  // العقال المزدوج
  for (const [y, r] of [[.088, .118], [.112, .112]]) { const e = new THREE.TorusGeometry(r, .014, 8, 36); e.rotateX(Math.PI / 2); add(e, MAT.black).position.y = HEAD_Y + y; }
}
// الجعبة وحزامها
{
  const q = new THREE.Group(); torso.add(q); q.position.set(.12, 1.18, .19); q.rotation.set(.22, 0, -.38);
  add(new THREE.CylinderGeometry(.07, .058, .62, 16), MAT.leather, q);
  for (const y of [-.25, .2, .29]) add(new THREE.TorusGeometry(.068, .008, 6, 20).rotateX(Math.PI / 2), MAT.gold, q).position.y = y;
  for (let k = 0; k < 6; k++) { const a = k * 1.05, f = add(new THREE.ConeGeometry(.026, .14, 3), k % 2 ? new THREE.MeshStandardMaterial({ color: '#f1ece2' }) : new THREE.MeshStandardMaterial({ color: '#a52a22' }), q); f.position.set(Math.cos(a) * .035, .4, Math.sin(a) * .035); }
  const strap = add(new THREE.BoxGeometry(.045, .62, .012), MAT.leather); strap.position.set(0, 1.18, .175); strap.rotation.z = -.62;
}
// القدمان بالنعال
const feet = [-1, 1].map(s => { const f = new THREE.Group(); hero.add(f);
  add(new THREE.BoxGeometry(.085, .025, .24), MAT.dark, f).position.set(0, .012, -.03);
  add(new THREE.CylinderGeometry(.034, .036, .1, 10), MAT.skin, f).position.set(0, .07, .02);
  add(new THREE.BoxGeometry(.09, .02, .03), MAT.leather, f).position.set(0, .04, -.09);
  f.userData.s = s; return f; });
// ذراعا الرامي والقوس داخل "مِحور التصويب" الذي يدور مع زاوية الرمي
const rig = new THREE.Group(); rig.position.set(0, 1.4, 0); hero.add(rig);
const SHL = new THREE.Vector3(-.21, 0, .01), SHR = new THREE.Vector3(.21, 0, .01), GRIP = new THREE.Vector3(-.04, .0, -.6);
const mkSeg = (r, m) => { const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, 1, 6, 12), m); o.castShadow = true; rig.add(o); return o; };
const arms = [
  { up: mkSeg(.052, MAT.thobe), lo: mkSeg(.046, MAT.thobe), hand: add(new THREE.SphereGeometry(.045, 14, 10), MAT.skin, rig), cuff: add(new THREE.CylinderGeometry(.052, .058, .06, 14, 1, true), MAT.thobe, rig), pole: new THREE.Vector3(-.6, -1, .2) },
  { up: mkSeg(.052, MAT.thobe), lo: mkSeg(.046, MAT.thobe), hand: add(new THREE.SphereGeometry(.047, 14, 10), MAT.leather, rig), cuff: add(new THREE.CylinderGeometry(.052, .058, .06, 14, 1, true), MAT.thobe, rig), pole: new THREE.Vector3(.9, .35, .6) }
];
// كتفا البشت فوق الذراعين
for (const s of [-1, 1]) { const c = add(new THREE.SphereGeometry(.085, 16, 12, 0, Math.PI * 2, 0, Math.PI * .55), MAT.bisht, rig); c.position.set(s * .2, .01, .01); c.scale.set(1.15, .9, 1.1); }
function seg(o, a, b) { const d = b.clone().sub(a), len = d.length(); o.position.copy(a).addScaledVector(d, .5); o.scale.set(1, Math.max(.01, len - .08), 1); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
const L1 = .3, L2 = .29;
function ik(arm, S, H) {
  const d = H.clone().sub(S), dist = Math.min(d.length(), L1 + L2 - .005), dir = d.normalize();
  const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const pole = arm.pole.clone().addScaledVector(dir, -arm.pole.dot(dir)).normalize();
  const E = S.clone().addScaledVector(dir, a).addScaledVector(pole, h), Hc = S.clone().addScaledVector(dir, dist);
  seg(arm.up, S, E); seg(arm.lo, E, Hc); arm.hand.position.copy(Hc); arm.cuff.visible = false;
  arm.cuff.position.copy(E.clone().lerp(Hc, .82)); arm.cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), Hc.clone().sub(E).normalize());
}
// القوس العربي (منحني)
const bowTop = new THREE.Vector3(-.04, .62, -.5), bowBot = new THREE.Vector3(-.04, -.62, -.5);
{
  const curve = new THREE.CatmullRomCurve3([bowTop.clone().add(new THREE.Vector3(0, .02, -.08)), new THREE.Vector3(-.04, .4, -.64), new THREE.Vector3(-.04, 0, -.62), new THREE.Vector3(-.04, -.4, -.64), bowBot.clone().add(new THREE.Vector3(0, -.02, -.08))]);
  const bow = new THREE.Mesh(merge([[new THREE.TubeGeometry(curve, 30, .022, 6), '#5b2f17'], [new THREE.CylinderGeometry(.03, .03, .16, 8), '#c9973a', M4(-.04, 0, -.62)]]), vcMat);
  bow.castShadow = true; rig.add(bow);
}
const strGeo = new THREE.BufferGeometry().setFromPoints([bowTop, new THREE.Vector3(), bowBot]);
const bowString = new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: '#f7ecd2' })); rig.add(bowString);
// شكل السهم (يتجه للأمام -z، والذيل عند الصفر)
const ARROW_LEN = .86;
const arrowGeo = merge([
  [new THREE.CylinderGeometry(.011, .011, ARROW_LEN, 6), '#c9a26a', M4(0, 0, -ARROW_LEN / 2, Math.PI / 2)],
  [new THREE.ConeGeometry(.026, .1, 6), '#cfd3d6', M4(0, 0, -ARROW_LEN - .04, -Math.PI / 2)],
  ...[0, 1, 2].map(k => [new THREE.PlaneGeometry(.035, .14), k ? '#f3efe6' : '#c0392b', M4(Math.cos(k * 2.09) * .02, Math.sin(k * 2.09) * .02, -.1, 0, Math.PI / 2, k * 2.09)])
]);
const arrowMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6, side: THREE.DoubleSide });
const nocked = new THREE.Mesh(arrowGeo, arrowMat); rig.add(nocked);

/* ================= الخيل العربية ================= */
// حصان كميت (بني محمر) بعرف وذيل أسود، مرسوم بالكود ومن غير ملامح وجه؛ يتجه للأمام -z والأرض عند الصفر
const horse = new THREE.Group(); horse.visible = false; scene.add(horse);
const HCOL = { coat: '#8b4a22', dark: '#6a3517', mane: '#1d1411', hoof: '#2a221d', sock: '#efe6d6' };
const horseMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .55, metalness: .05 });
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function capM(r, a, b) { // كبسولة بين نقطتين
  const d = b.clone().sub(a), len = d.length();
  return [new THREE.CapsuleGeometry(r, Math.max(.01, len), 6, 16), new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize()), V(1, 1, 1))];
}
const capC = (r, a, b, c) => { const [g, m] = capM(r, a, b); return [g, c, m]; };
const ell = (x, y, z, sx, sy, sz, rx = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), V(sx, sy, sz));
{
  const S = new THREE.SphereGeometry(1, 28, 18), C = HCOL.coat;
  const neckA = V(0, 1.34, -.68), neckB = V(0, 1.94, -.98), headA = V(0, 2.02, -1.03), headB = V(0, 1.72, -1.36);
  const body = merge([
    [S, C, ell(0, 1.17, 0, .37, .45, .8)],           // البطن
    [S, C, ell(0, 1.2, -.56, .35, .47, .42)],        // الصدر والكتف
    [S, C, ell(0, 1.25, .58, .37, .45, .44)],        // الكفل
    [S, HCOL.dark, ell(0, .96, .02, .3, .22, .62)],  // ظل البطن
    capC(.19, neckA, neckB, C),
    [S, C, ell(0, 1.58, -.78, .22, .36, .3, -.5)],   // قاعدة الرقبة
    capC(.13, headA, headB, C),
    [S, C, ell(0, 1.97, -1.02, .13, .13, .15)],      // أعلى الرأس
    [S, HCOL.dark, ell(0, 1.68, -1.39, .115, .11, .13)], // الخطم
    [new THREE.ConeGeometry(.04, .17, 8), HCOL.dark, M4(-.06, 2.15, -.98, -.2, 0, .15)],
    [new THREE.ConeGeometry(.04, .17, 8), HCOL.dark, M4(.06, 2.15, -.98, -.2, 0, -.15)],
    [new THREE.BoxGeometry(.06, .74, .14), HCOL.mane, M4(0, 1.74, -.72, -.46)],     // العرف
    [new THREE.BoxGeometry(.05, .18, .1), HCOL.mane, M4(0, 2.08, -1.08, .3)]         // الناصية
  ], true);
  const bm = new THREE.Mesh(body, horseMat); bm.castShadow = bm.receiveShadow = true; horse.add(bm);
  // اللجام (بدون ملامح وجه)
  const br = new THREE.Mesh(merge([
    [new THREE.TorusGeometry(.12, .012, 6, 20), '#2a1a10', M4(0, 1.71, -1.3, 0, 0, 0)],
    [new THREE.TorusGeometry(.145, .012, 6, 20), '#2a1a10', M4(0, 1.95, -1.1, -.9, 0, 0)],
    [new THREE.SphereGeometry(.024, 8, 6), '#d8b056', M4(-.125, 1.71, -1.3)], [new THREE.SphereGeometry(.024, 8, 6), '#d8b056', M4(.125, 1.71, -1.3)]
  ]), vcMat); horse.add(br);
  // العنان مرتاح على الرقبة (الرامي يرمي بيديه الاثنتين)
  const rein = new THREE.CatmullRomCurve3([V(-.125, 1.71, -1.3), V(-.2, 1.56, -.98), V(0, 1.6, -.6), V(.2, 1.56, -.98), V(.125, 1.71, -1.3)]);
  horse.add(new THREE.Mesh(new THREE.TubeGeometry(rein, 30, .01, 5), MAT.leather));
  // السرج فوق بطانية سدو ملفوفة على الظهر
  const bl = new THREE.PlaneGeometry(1.05, .8, 16, 1); bl.rotateX(-Math.PI / 2);
  { const p = bl.attributes.position; for (let i = 0; i < p.count; i++) { const a = p.getX(i) / .42; p.setXYZ(i, Math.sin(a) * .395, 1.17 + Math.cos(a) * .465, p.getZ(i) + .05); } bl.computeVertexNormals(); }
  const blanket = new THREE.Mesh(bl, new THREE.MeshStandardMaterial({ map: SADU, roughness: .95, side: THREE.DoubleSide })); blanket.castShadow = true; horse.add(blanket);
  const saddle = new THREE.Mesh(merge([
    [new THREE.BoxGeometry(.34, .06, .46), '#5a3018', M4(0, 1.625, .04)],
    [new THREE.BoxGeometry(.3, .16, .05), '#5a3018', M4(0, 1.69, .27, -.25)],
    [new THREE.BoxGeometry(.16, .13, .05), '#5a3018', M4(0, 1.68, -.2, .3)],
    [new THREE.BoxGeometry(.36, .015, .48), '#d8b056', M4(0, 1.597, .04)],
    [new THREE.BoxGeometry(.03, .7, .04), '#4a2a15', M4(-.36, 1.25, -.1, 0, 0, -.12)],
    [new THREE.BoxGeometry(.03, .7, .04), '#4a2a15', M4(.36, 1.25, -.1, 0, 0, .12)],
    [new THREE.TorusGeometry(.055, .012, 6, 14), '#d8b056', M4(-.39, .86, -.1, 0, Math.PI / 2)],
    [new THREE.TorusGeometry(.055, .012, 6, 14), '#d8b056', M4(.39, .86, -.1, 0, Math.PI / 2)]
  ]), vcMat); saddle.castShadow = true; horse.add(saddle);
}
// الأرجل الأربع بمفصلين (تتحرك مع العدْو)
const hLegs = [[-.17, -.56, 1, 0], [.17, -.56, 1, .5], [-.16, .6, 0, 2.5], [.16, .6, 0, 3.05]].map(([x, z, front, ph]) => {
  const hip = new THREE.Group(); hip.position.set(x, 1.02, z); horse.add(hip);
  const up = new THREE.Mesh(merge([capC(front ? .085 : .1, V(0, .04, 0), V(0, -.42, front ? -.01 : .05), HCOL.coat)], true), horseMat);
  const knee = new THREE.Group(); knee.position.set(0, -.46, front ? -.01 : .05); hip.add(up, knee);
  const sock = front ? HCOL.coat : HCOL.sock;
  const lo = new THREE.Mesh(merge([
    capC(.048, V(0, 0, 0), V(0, -.4, 0), HCOL.dark),
    [new THREE.CylinderGeometry(.056, .06, .1, 12), sock, M4(0, -.38, 0)],
    [new THREE.CylinderGeometry(.06, .07, .09, 12), HCOL.hoof, M4(0, -.48, -.01)]
  ], true), horseMat);
  knee.add(lo); up.castShadow = lo.castShadow = true;
  return { hip, knee, front, ph, last: 0 };
});
// الذيل
const tail = new THREE.Group(); tail.position.set(0, 1.42, .98); horse.add(tail);
{ const g = new THREE.CylinderGeometry(.07, .15, 1.0, 12, 8); g.translate(0, -.5, 0);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = -p.getY(i); const w = 1 - Math.pow(Math.max(0, y - .55) / .45, 2) * .85; p.setX(i, p.getX(i) * w); p.setZ(i, p.getZ(i) * w * .7 + y * y * .22); }
  g.computeVertexNormals(); const t = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: HCOL.mane, roughness: .8 })); t.castShadow = true; tail.add(t); }
// ساقا الفارس على جانبي الخيل (ثوب أبيض ونعال)
const riderLegs = new THREE.Group(); horse.add(riderLegs);
for (const s of [-1, 1]) {
  const hipP = V(s * .14, 1.66, .06), kneeP = V(s * .34, 1.36, -.2), ankP = V(s * .4, .93, -.1);
  for (const [a, b, r] of [[hipP, kneeP, .08], [kneeP, ankP, .062]]) { const [g, m] = capM(r, a, b); const o = new THREE.Mesh(g, MAT.thobe); o.applyMatrix4(m); o.castShadow = true; riderLegs.add(o); }
  const f = new THREE.Group(); f.position.copy(ankP); riderLegs.add(f);
  add(new THREE.CylinderGeometry(.034, .036, .08, 10), MAT.skin, f).position.set(0, -.04, 0);
  add(new THREE.BoxGeometry(.085, .025, .22), MAT.dark, f).position.set(0, -.085, -.04);
}
const ride = { x: 0, z: 0, lane: 0, speed: 0, heading: 0, cyc: 0, hy: 0, vy: 0, air: false, started: false };
function setRideLook(on) { horse.visible = on; thobeR.visible = bishtR.visible = on; thobeM.visible = bishtM.visible = !on; feet.forEach(f => f.visible = !on); }
const ridePos = i => { const z = -40 - i * RIDE_GAP; return new THREE.Vector3(pathX(z), groundY(pathX(z), z), z); };

/* ================= المحطات والأهداف ================= */
function ringTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  const ring = ['#f7f3ea', '#f7f3ea', '#22252b', '#22252b', '#2f7fd6', '#2f7fd6', '#d93a2f', '#d93a2f', '#f5c430', '#f5c430'];
  x.fillStyle = '#d9b27a'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 10; i++) { const r = 250 * (1 - i / 10); x.beginPath(); x.arc(256, 256, r, 0, 7); x.fillStyle = ring[i]; x.fill(); x.lineWidth = 2; x.strokeStyle = i == 2 || i == 3 ? '#777' : '#333'; x.stroke(); }
  x.beginPath(); x.arc(256, 256, 4, 0, 7); x.fillStyle = '#333'; x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const RING = ringTexture();
const discR = .9, discT = .32, DISC_Y = 1.45, PLQ_Y = 3.25, PLQ_W = 4.1, PLQ_H = 1.65; // لوحة الإجابة أكبر
const strawMat = new THREE.MeshStandardMaterial({ color: '#c9a160', roughness: 1 }), faceMat = new THREE.MeshStandardMaterial({ map: RING, roughness: .9 });
const discGeo = new THREE.CylinderGeometry(discR, discR, discT, 40); discGeo.rotateX(Math.PI / 2);
const standGeo = merge([
  [new THREE.BoxGeometry(.1, 2.4, .1), '#6b4424', M4(-.55, 1.1, -.35, .25, 0, .12)],
  [new THREE.BoxGeometry(.1, 2.4, .1), '#6b4424', M4(.55, 1.1, -.35, .25, 0, -.12)],
  [new THREE.BoxGeometry(.1, 1.9, .1), '#5a3a20', M4(0, .9, -.75, -.4)],
  [new THREE.BoxGeometry(.1, 4.1, .1), '#6b4424', M4(-2.1, 2.05, -.05)],
  [new THREE.BoxGeometry(.1, 4.1, .1), '#6b4424', M4(2.1, 2.05, -.05)]
]);
function plaqueTexture(text, i) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 400; const x = c.getContext('2d');
  x.fillStyle = COLORS[i]; x.beginPath(); x.roundRect(0, 0, 1024, 400, 40); x.fill();
  x.fillStyle = '#fbf4e4'; x.beginPath(); x.roundRect(16, 16, 992, 368, 30); x.fill();
  x.fillStyle = COLORS[i]; x.beginPath(); x.arc(912, 200, 84, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.font = '700 110px "Readex Pro"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(LETTERS[i], 915, 206);
  x.fillStyle = '#2a1d16'; x.direction = 'rtl'; x.textAlign = 'right';
  let size = 64, lines;
  for (size = 78; size >= 42; size -= 4) { x.font = `700 ${size}px "Readex Pro"`; lines = wrap(x, text, 790); if (lines.length * size * 1.25 <= 340) break; }
  if (lines.length * size * 1.25 > 340) { lines = lines.slice(0, 4); lines[3] += '…'; }
  const lh = size * 1.25, y0 = 200 - (lines.length - 1) * lh / 2;
  lines.forEach((l, k) => x.fillText(l, 805, y0 + k * lh));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// شارة الحرف فوق كل هدف: حجمها ثابت على الشاشة فتنقرأ من بعيد
const badgeTex = [0, 1, 2].map(i => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.arc(64, 68, 56, 0, 7); x.fill();
  x.fillStyle = COLORS[i]; x.beginPath(); x.arc(64, 62, 54, 0, 7); x.fill(); x.lineWidth = 7; x.strokeStyle = '#fff'; x.stroke();
  x.fillStyle = '#fff'; x.font = '700 70px "Readex Pro"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(LETTERS[i], 64, 68);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; });
function wrap(x, text, w) { const out = []; let cur = ''; for (const word of text.split(/\s+/)) { const t = cur ? cur + ' ' + word : word; if (x.measureText(t).width > w && cur) { out.push(cur); cur = word; } else cur = t; } if (cur) out.push(cur); return out; }

const stations = [];
const glowMat = new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
function beamTexture() { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, 4, 256); return new THREE.CanvasTexture(c); }
const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 60, 24, 1, true), new THREE.MeshBasicMaterial({ map: beamTexture(), color: '#ffcf6a', transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
beam.geometry.translate(0, 30, 0); scene.add(beam);
const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.1, 48), glowMat); ring.rotation.x = -Math.PI / 2; scene.add(ring);
// زولية سدو عند كل محطة
{ const g = new THREE.PlaneGeometry(3.6, 2.4); g.rotateX(-Math.PI / 2); const mat = new THREE.MeshStandardMaterial({ map: SADU, roughness: 1 });
  for (let i = 0; i < STATIONS; i++) { const s = stationPos(i), m = new THREE.Mesh(g, mat); m.position.set(s.x, s.y + .03, s.z + .4); m.receiveShadow = true; scene.add(m); } }

function buildStation(i, q) {
  const s = G.ride ? ridePos(i) : stationPos(i), d = 15 + i * 3.3, z = s.z - d, spread = 4.2 + d * .07;
  const side0 = i % 2 ? 1 : -1;
  const opts = [q[2][0], ...q[2].slice(1).sort(() => Math.random() - .5).slice(0, 2)];
  const order = [0, 1, 2].sort(() => Math.random() - .5);
  const targets = order.map((oi, k) => {
    let x, zz, y; const g = new THREE.Group();
    if (G.ride) { // على ظهر الخيل: الأهداف على جانب المسار متتابعة، والفارس يمر بجانبها
      const side = i < 3 ? side0 : (Math.random() < .5 ? -1 : 1);
      zz = s.z - 8 - k * 9; x = pathX(zz) + side * (6.5 + rnd(0, 1.2) + Math.min(i, 6) * .35); y = groundY(x, zz);
      g.position.set(x, y, zz); g.lookAt(pathX(zz + 9), y, zz + 9);
    } else { x = pathX(z) + (k - 1) * spread; zz = z + (k == 1 ? -1.5 : 0); y = groundY(x, zz); g.position.set(x, y, zz); g.lookAt(s.x, y, s.z); }
    const disc = new THREE.Mesh(discGeo, [strawMat, faceMat, strawMat]); disc.position.y = DISC_Y; disc.castShadow = true;
    const stand = new THREE.Mesh(standGeo, vcMat); stand.castShadow = true;
    const tex = plaqueTexture(opts[oi], k);
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(PLQ_W, PLQ_H), new THREE.MeshStandardMaterial({ map: tex, roughness: .8 })); plaque.position.set(0, PLQ_Y, .02); plaque.castShadow = true;
    const back = new THREE.Mesh(new THREE.BoxGeometry(PLQ_W + .12, PLQ_H + .12, .08), new THREE.MeshStandardMaterial({ color: '#5a3a20' })); back.position.set(0, PLQ_Y, -.03);
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex[k], sizeAttenuation: false, depthTest: false, fog: false, transparent: true }));
    badge.scale.setScalar(.075); badge.position.set(0, PLQ_Y + PLQ_H / 2 + .7, 0); badge.renderOrder = 5;
    const inner = new THREE.Group(); inner.add(disc, stand, plaque, back, badge); inner.position.y = -4.2; g.add(inner); scene.add(g);
    return { g, inner, correct: oi == 0, k, text: opts[oi], tex, alive: true };
  });
  // فوانيس متحركة (نقاط إضافية) من المحطة الثالثة
  const lanterns = [];
  if (i >= 2) for (let k = 0; k < (i >= 6 ? 2 : 1); k++) {
    const L = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 12), new THREE.MeshStandardMaterial({ color: '#ffcf6a', emissive: '#ffb53a', emissiveIntensity: 2.2, roughness: .3 }));
    const cap = new THREE.Mesh(merge([[new THREE.ConeGeometry(.2, .22, 8), '#8a6a2a', M4(0, .38, 0)], [new THREE.TorusGeometry(.08, .015, 6, 12), '#8a6a2a', M4(0, .52, 0)], [new THREE.CylinderGeometry(.16, .12, .1, 8), '#8a6a2a', M4(0, -.3, 0)]]), vcMat);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: '#ffc861', blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .8 })); halo.scale.setScalar(2.2);
    L.add(glass, cap, halo); scene.add(L);
    const lz = G.ride ? s.z - 17 - k * 6 : z + 5 - k * 3;
    lanterns.push({ L, base: new THREE.Vector3(pathX(lz), groundY(pathX(lz), lz) + (G.ride ? 4.6 : 4.2) + k * 1.2, lz), amp: G.ride ? 4.5 : spread * 1.4, ph: rnd(0, 6), sp: .55 + i * .05 + k * .2, alive: true, vis: 0 });
  }
  const ang = rnd(0, 6.28), wmag = (i < 1 ? 0 : Math.min(3.2, .35 * i + rnd(0, .5))) * (G.ride ? .55 : 1);
  return { i, q, s, targets, lanterns, wind: new THREE.Vector3(Math.cos(ang) * wmag, 0, Math.sin(ang) * wmag * .5), rise: 0, sinking: false, state: 'idle' };
}
function disposeStation(st) {
  for (const t of st.targets) { scene.remove(t.g); t.g.traverse(o => { if (o.isMesh && o !== nocked) { if (o.geometry !== discGeo && o.geometry !== standGeo && o.geometry !== arrowGeo) o.geometry.dispose(); } }); t.tex.dispose(); }
  for (const l of st.lanterns) scene.remove(l.L);
}

/* ================= الأصوات ================= */
const audio = { ctx: null, buf: {}, on: store.get('snd', true), wind: null, draw: null };
async function initAudio() {
  if (audio.ctx) return; const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
  audio.ctx = new A(); audio.master = audio.ctx.createGain(); audio.master.gain.value = audio.on ? 1 : 0; audio.master.connect(audio.ctx.destination);
  const names = ['draw', 'release', 'fly', 'hitwood', 'bull', 'sand', 'ok', 'bad', 'rise', 'tap'];
  await Promise.all(names.map(async n => { try { const r = await fetch('sfx/' + n + '.mp3'); audio.buf[n] = await audio.ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) {} }));
  // ريح الصحراء: ضوضاء مفلترة تتموج ببطء
  const len = audio.ctx.sampleRate * 4, nb = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate), d = nb.getChannelData(0);
  let last = 0; for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = audio.ctx.createBufferSource(); src.buffer = nb; src.loop = true;
  const bp = audio.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = .6;
  const g = audio.ctx.createGain(); g.gain.value = .0;
  src.connect(bp).connect(g).connect(audio.master); src.start(); audio.wind = { g, bp };
  // وقع حافر على الرمل: ضربة مكتومة قصيرة مولّدة بالكود (صوت طبيعي، ليس إيقاعًا موسيقيًا)
  { const sr = audio.ctx.sampleRate, n = Math.floor(sr * .13), b = audio.ctx.createBuffer(1, n, sr), hd = b.getChannelData(0); let lp = 0;
    for (let i = 0; i < n; i++) { const t = i / sr, e = Math.exp(-t * 34); lp += ((Math.random() * 2 - 1) - lp) * .12; hd[i] = (lp * 1.1 + Math.sin(2 * Math.PI * (88 - 160 * t) * t) * .7) * e; }
    audio.buf.hoof = b; }
}
function sfx(n, vol = 1, rate = 1, pan = 0) {
  if (!audio.ctx || !audio.buf[n]) return null;
  const s = audio.ctx.createBufferSource(); s.buffer = audio.buf[n]; s.playbackRate.value = rate;
  const g = audio.ctx.createGain(); g.gain.value = vol; let node = s.connect(g);
  if (audio.ctx.createStereoPanner) { const p = audio.ctx.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); node = node.connect(p); }
  node.connect(audio.master); s.start(); return { s, g };
}
function setSound(on) { audio.on = on; store.set('snd', on); if (audio.master) audio.master.gain.value = on ? 1 : 0; $('snd').textContent = $('snd2').textContent = on ? '🔊 الصوت' : '🔇 بدون صوت'; }
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

/* ================= حالة اللعبة ================= */
const G = { mode: 'menu', grade: store.get('grade', 7), src: store.get('src', store.get('exam', true) ? 'ex' : 'all'), ride: store.get('ride', false), n: STATIONS, qs: [], st: null, idx: 0, hearts: HEARTS, score: 0, right: 0, shots: 0, hits: 0, t: 0, arrows: [], draw: 0, drawing: false, cooldown: 0, cam: null, hint: 1, stuck: [] };
let BANK = null;

// مصدر الأسئلة: دروس الاختبار الأول، أو الكتاب كامل، أو دروس يختارها الطالب بنفسه
const qW = n => AR(n) + ' ' + (n >= 3 && n <= 10 ? 'أسئلة' : n > 10 ? 'سؤالًا' : 'سؤال'), lW = n => n == 1 ? 'درس واحد' : n == 2 ? 'درسان' : AR(n) + ' ' + (n >= 3 && n <= 10 ? 'دروس' : n > 10 ? 'درسًا' : 'درس');
const okQ = q => q[2].every(a => a.length < 90);
const myLessons = () => store.get('les' + G.grade, BANK[G.grade].ex.slice());
const lessonPool = les => BANK[G.grade].q.filter(q => les.includes(q[0]) && okQ(q));
function pickQuestions() {
  const b = BANK[G.grade];
  let pool = G.src === 'all' ? b.q.filter(okQ) : lessonPool(G.src === 'pick' ? myLessons() : b.ex);
  if (G.src === 'ex' && pool.length < G.n) pool = b.q.filter(okQ);
  // دروس مختارة قليلة: الجولة تقصر على عدد أسئلتها بدل تكرار الأسئلة
  return pool.sort(() => Math.random() - .5).slice(0, G.n);
}
function startGame() {
  initAudio();
  try { if (MOBILE && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {}); } catch (e) {}
  if (G.st) disposeStation(G.st);
  for (const a of G.arrows) scene.remove(a.m); for (const m of G.stuck) m.parent && m.parent.remove(m);
  input.fireWant = false; input.fireId = null; player.air = false; player.vy = 0;
  G.n = G.ride ? RIDE_N : STATIONS; setRideLook(G.ride); camY = null;
  G.qs = pickQuestions(); G.n = G.qs.length;
  Object.assign(G, { mode: 'play', qs: G.qs, idx: 0, hearts: HEARTS, score: 0, right: 0, shots: 0, hits: 0, t: 0, arrows: [], stuck: [], draw: 0, drawing: false, cooldown: 0, cam: null, hint: 1 });
  const s0 = stationPos(0); player.pos.set(s0.x, 0, s0.z + 14); player.yaw = 0; player.pitch = .06;
  if (G.ride) { Object.assign(ride, { x: pathX(24), z: 24, lane: 0, speed: 0, cyc: 0, hy: 0, vy: 0, air: false, started: false }); ride.heading = rideHeading(); player.yaw = ride.heading; player.pitch = .03; updateRide(0); }
  G.st = buildStation(0, G.qs[0]);
  $('menu').hidden = $('end').hidden = $('paused').hidden = true; $('top').hidden = $('cross').hidden = false; $('hl').hidden = $('hr').hidden = false; ['fire', 'fire2', 'jump'].forEach(id => $(id).hidden = false);
  setTimeout(() => { $('hl').style.opacity = $('hr').style.opacity = 0; }, 9000);
  $('hl').style.opacity = $('hr').style.opacity = .8;
  $('hl').textContent = G.ride ? '⇡ امشِ واعدُ · اترك = قف · ⇣ ارجع · ⇆ لِف' : 'حرّك بإبهامك ' + (SET.lefty ? 'الأيمن' : 'الأيسر');
  $('hr').textContent = G.ride ? 'قف عند الأهداف أو ارمِ وأنت تعدو' : 'اسحب للتصويب · ثبّت زر القوس للشد وأفلته للرمي';
  renderHearts(); setScore(0); updateStageUI();
  if (audio.wind) audio.wind.g.gain.value = .05;
}
function nextStation() {
  const old = G.st; old.sinking = true; old.sinkT = 0; sinkers.add(old);
  setTimeout(() => disposeStation(old), 1600);
  G.idx++;
  if (G.idx >= G.n || G.hearts <= 0) { setTimeout(endGame, 1300); return; }
  G.st = buildStation(G.idx, G.qs[G.idx]); updateStageUI(); hideQ();
}
function endGame() {
  G.mode = 'end'; $('top').hidden = $('cross').hidden = true; ['fire', 'fire2', 'jump'].forEach(id => $(id).hidden = true); hideQ(); $('hl').hidden = $('hr').hidden = true;
  const key = 'best' + G.grade + (G.ride ? 'h' : ''), best = store.get(key, 0), nb = G.score > best; if (nb) store.set(key, G.score);
  const acc = G.shots ? Math.round(100 * G.hits / G.shots) : 0;
  const r = G.right / G.n, stars = r >= .85 ? 3 : r >= .6 ? 2 : r >= .3 ? 1 : 0;
  $('endTitle').textContent = G.hearts <= 0 ? 'انتهت المحاولات… حاول مرة ثانية' : stars == 3 ? (G.ride ? 'ما شاء الله! فارس رامٍ' : 'ما شاء الله! رامٍ ماهر') : (G.ride ? 'أحسنت يا فارس' : 'أحسنت يا رامي');
  $('stars').innerHTML = [0, 1, 2].map(k => `<span class="${k < stars ? '' : 'off'}">★</span>`).join('');
  $('eScore').textContent = AR(G.score); $('eRight').textContent = AR(G.right) + ' / ' + AR(G.n); $('eAcc').textContent = AR(acc) + '٪';
  $('eBest').textContent = nb ? '🏆 رقم قياسي جديد لصفك!' : 'أفضل نتيجة لك: ' + AR(Math.max(best, G.score));
  $('end').hidden = false; if (audio.wind) audio.wind.g.gain.value = .02;
}

/* ================= الواجهة ================= */
const heartSVG = on => `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2 0 3.3 1 4.1 2.2h2.6c.8-1.2 2.1-2.2 4.1-2.2 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" fill="${on ? '#ff6b6b' : 'rgba(255,255,255,.2)'}"/></svg>`;
function renderHearts() { $('hearts').innerHTML = Array.from({ length: HEARTS }, (_, k) => heartSVG(k < G.hearts)).join(''); }
let shown = 0; function setScore(v) { G.score = v; }
function updateStageUI() { $('stage').textContent = 'المحطة ' + AR(G.idx + 1) + ' / ' + AR(G.n); }
function showQ(st) {
  $('qtext').textContent = st.q[1];
  $('qopts').innerHTML = [...st.targets].sort((a, b) => a.k - b.k).map(t => `<div class="opt" style="border-color:${COLORS[t.k]};background:${COLORS[t.k]}2e"><span class="l" style="background:${COLORS[t.k]}">${LETTERS[t.k]}</span><span>${t.text}</span></div>`).join('');
  $('qbar').classList.toggle('long', st.targets.some(t => t.text.length > 32));
  $('qcard').classList.add('on'); $('qbar').classList.add('on');
}
function hideQ() { $('qcard').classList.remove('on'); $('qbar').classList.remove('on'); $('aimLbl').classList.remove('on'); aimK = -1; }
let toastT = 0;
function toast(big, small, bad, ms = 2600) { $('tbig').textContent = big; $('tbig').classList.toggle('bad', !!bad); $('tsm').textContent = small || ''; $('tsm').style.display = small ? '' : 'none'; $('toast').classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => $('toast').classList.remove('on'), ms); }
function popPts(n) { const e = $('pts'); e.textContent = '+' + AR(n); e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); }

/* ================= التحكم ================= */
const input = { jx: 0, jy: 0, keys: {}, joyId: null, joy0: null, lookId: null, last: null, fireId: null, fireLast: null, jump: false };
const touch = $('touch');
const look = (dx, dy, mouse) => { const s = (G.drawing ? .0032 : .0058) * (mouse ? .8 : 1) * SET.sens; player.yaw -= dx * s; player.pitch = clamp(player.pitch - dy * s, -.32, .62); };
function startDraw() { if (G.drawing || G.cooldown > 0 || (G.cam && G.cam.mode === 'arrow')) return false; G.drawing = true; G.draw = 0; audio.draw = sfx('draw', .55); return true; }
touch.addEventListener('pointerdown', e => {
  if (G.mode !== 'play') return;
  if (G.cam && G.cam.mode === 'arrow') { G.cam.skip = true; return; }
  try { touch.setPointerCapture(e.pointerId); } catch (_) {}
  if (e.pointerType === 'mouse') { input.fireId = e.pointerId; input.fireLast = { x: e.clientX, y: e.clientY }; input.fireWant = true; return; }
  const joySide = SET.lefty ? e.clientX > innerWidth * .58 : e.clientX < innerWidth * .42; // الأعسر: المشي باليمين
  if (joySide && input.joyId == null) {
    input.joyId = e.pointerId; input.joy0 = { x: e.clientX, y: e.clientY };
    const j = $('joy'); j.style.left = e.clientX + 'px'; j.style.top = e.clientY + 'px'; j.classList.add('on'); j.firstElementChild.style.transform = '';
  } else if (input.lookId == null) { input.lookId = e.pointerId; input.last = { x: e.clientX, y: e.clientY }; }
});
touch.addEventListener('pointermove', e => {
  if (e.pointerId === input.joyId) {
    let dx = e.clientX - input.joy0.x, dy = e.clientY - input.joy0.y; const l = Math.hypot(dx, dy), m = 55;
    if (l > m) { dx *= m / l; dy *= m / l; }
    input.jx = dx / m; input.jy = dy / m; $('joy').firstElementChild.style.transform = `translate(${dx}px,${dy}px)`;
  } else if (e.pointerId === input.lookId) { look(e.clientX - input.last.x, e.clientY - input.last.y); input.last = { x: e.clientX, y: e.clientY }; }
  else if (e.pointerId === input.fireId && e.pointerType === 'mouse') { look(e.clientX - input.fireLast.x, e.clientY - input.fireLast.y, true); input.fireLast = { x: e.clientX, y: e.clientY }; }
});
const up = e => {
  if (e.pointerId === input.joyId) { input.joyId = null; input.jx = input.jy = 0; $('joy').classList.remove('on'); }
  else if (e.pointerId === input.lookId) input.lookId = null;
  else if (e.pointerId === input.fireId) { input.fireId = null; input.fireWant = false; if (G.drawing) release(); }
};
touch.addEventListener('pointerup', up); touch.addEventListener('pointercancel', up);
// زرّا الرمي: اضغط وثبّت للشد (وتقدر تصوّب وأنت ضاغط)، وأفلت للرمي
for (const id of ['fire', 'fire2']) {
  const b = $(id);
  b.addEventListener('pointerdown', e => { e.stopPropagation(); if (G.mode !== 'play') return; if (G.cam && G.cam.mode === 'arrow') { G.cam.skip = true; return; } try { b.setPointerCapture(e.pointerId); } catch (_) {} input.fireId = e.pointerId; input.fireLast = { x: e.clientX, y: e.clientY }; input.fireWant = true; b.classList.add('on'); });
  b.addEventListener('pointermove', e => { if (e.pointerId !== input.fireId) return; look(e.clientX - input.fireLast.x, e.clientY - input.fireLast.y); input.fireLast = { x: e.clientX, y: e.clientY }; });
  const off = e => { if (e.pointerId !== input.fireId) return; b.classList.remove('on'); up(e); };
  b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off);
}
$('jump').addEventListener('pointerdown', e => { e.stopPropagation(); if (G.mode === 'play') input.jump = true; $('jump').classList.add('on'); setTimeout(() => $('jump').classList.remove('on'), 150); });
addEventListener('keydown', e => { input.keys[e.code] = true; if (e.code === 'Space') { input.jump = true; e.preventDefault(); } if (e.code === 'Escape' && G.mode === 'play') pause(); });
addEventListener('keyup', e => { input.keys[e.code] = false; });
addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());

/* ================= الرمي ================= */
const tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
function aimDir(out = new THREE.Vector3()) { const c = Math.cos(player.pitch); return out.set(-Math.sin(player.yaw) * c, Math.sin(player.pitch), -Math.cos(player.yaw) * c); }
function nockWorld(out = new THREE.Vector3()) { return nocked.getWorldPosition(out); }
function aimPoint() {
  // نقطة التصويب = ما يقع تحت علامة التصويب في وسط الشاشة
  const o = camera.position, d = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  let best = 140;
  if (G.st) for (const t of G.st.targets) { if (!t.alive) continue; const hit = rayTarget(o, d, t); if (hit != null && hit < best) best = hit; }
  for (let s = 2; s < best; s += .8) { const p = tmpV.copy(o).addScaledVector(d, s); if (p.y < groundY(p.x, p.z)) { best = s; break; } }
  return o.clone().addScaledVector(d, best);
}
// وجها الهدف واللوحة من الأمام والخلف (الرمي من الخلف ممكن وأنت على الخيل)
const PLANES = [[discT / 2, 'disc'], [-discT / 2, 'disc'], [.02, 'plaque'], [-.07, 'plaque']];
const onFace = (p, kind) => kind === 'disc' ? Math.hypot(p.x, p.y - DISC_Y) <= discR : Math.abs(p.x) <= PLQ_W / 2 + .06 && Math.abs(p.y - PLQ_Y) <= PLQ_H / 2 + .06;
function rayTarget(o, d, t) {
  const inv = new THREE.Matrix4().copy(t.inner.matrixWorld).invert();
  const lo = o.clone().applyMatrix4(inv), ld = d.clone().transformDirection(inv);
  if (Math.abs(ld.z) < 1e-4) return null;
  let best = null;
  for (const [zf, kind] of PLANES) {
    const s = (zf - lo.z) / ld.z; if (s > 0 && (best == null || s < best)) { const p = lo.clone().addScaledVector(ld, s); if (onFace(p, kind)) best = s; }
  }
  return best;
}
function launchVel(power) {
  const from = nockWorld(), to = aimPoint();
  return { from, v: to.sub(from).normalize().multiplyScalar(24 + 50 * power) };
}
// محاكاة مسار السهم (تُستخدم للرمي الحقيقي ولخط المساعدة ولتوقع الإصابة)
function step(a, dt, wind) {
  a.v.y -= GRAV * dt; a.v.addScaledVector(wind, dt);
  a.prev.copy(a.p); a.p.addScaledVector(a.v, dt);
}
function testHit(a, st) {
  if (st && !st.sinking) {
    for (const t of st.targets) {
      if (!t.alive) continue;
      const inv = new THREE.Matrix4().copy(t.inner.matrixWorld).invert();
      const p0 = a.prev.clone().applyMatrix4(inv), p1 = a.p.clone().applyMatrix4(inv);
      let hit = null;
      for (const [zf, kind] of PLANES) {
        if ((p0.z - zf) * (p1.z - zf) <= 0 && p0.z !== p1.z) {
          const f = (p0.z - zf) / (p0.z - p1.z), p = p0.clone().lerp(p1, f);
          if ((!hit || f < hit.f) && onFace(p, kind)) hit = { type: 'target', t, ring: kind === 'disc' ? Math.max(1, 10 - Math.floor(Math.hypot(p.x, p.y - DISC_Y) / discR * 10)) : 0, f };
        }
      }
      if (hit) return hit;
    }
    for (const l of st.lanterns) {
      if (!l.alive || l.vis < .5) continue;
      const c = l.L.position, ab = a.p.clone().sub(a.prev), t = clamp(c.clone().sub(a.prev).dot(ab) / ab.lengthSq(), 0, 1);
      if (a.prev.clone().addScaledVector(ab, t).distanceTo(c) < .45) return { type: 'lantern', l, f: t };
    }
  }
  if (a.p.y <= groundY(a.p.x, a.p.z)) return { type: 'ground', f: 1 };
  return null;
}
function predict(from, v, wind, maxT = 4) {
  const a = { p: from.clone(), prev: from.clone(), v: v.clone() };
  for (let t = 0; t < maxT; t += 1 / 120) { step(a, 1 / 120, wind); const h = testHit(a, G.st); if (h) return { ...h, t, p: a.p.clone() }; }
  return null;
}
// خط المساعدة (يقل مع تقدم المحطات)
const guideN = 46, guideGeo = new THREE.BufferGeometry(); guideGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(guideN * 3), 3));
const guide = new THREE.Points(guideGeo, new THREE.PointsMaterial({ size: .14, map: DOT, color: '#fff3c4', transparent: true, depthWrite: false, opacity: .85 })); guide.frustumCulled = false; scene.add(guide);
function updateGuide() {
  const lim = G.idx < 3 ? 3 : G.idx < 6 ? .55 : 0;
  if (!G.drawing || lim === 0) { guide.visible = false; return; }
  const { from, v } = launchVel(G.draw), a = { p: from.clone(), prev: from.clone(), v }, P = guideGeo.attributes.position; let n = 0;
  for (let t = 0; t < lim && n < guideN; t += lim / guideN) { step(a, lim / guideN, G.st.wind); P.setXYZ(n++, a.p.x, a.p.y, a.p.z); if (testHit(a, G.st)) break; }
  for (; n < guideN; n++) P.setXYZ(n, 0, -999, 0);
  P.needsUpdate = true; guide.visible = true;
}
function release() {
  const power = G.draw; G.drawing = false; G.draw = 0;
  if (audio.draw) { try { audio.draw.g.gain.setTargetAtTime(0, audio.ctx.currentTime, .03); audio.draw.s.stop(audio.ctx.currentTime + .2); } catch (e) {} audio.draw = null; }
  if (power < .18) return;
  const { from, v } = launchVel(power);
  const m = new THREE.Mesh(arrowGeo, arrowMat); m.position.copy(from); m.castShadow = true; scene.add(m);
  const a = { m, p: from.clone(), prev: from.clone(), from: from.clone(), v, t: 0, st: G.st, wind: G.st.wind.clone(), power };
  G.arrows.push(a); G.shots++; G.cooldown = .38; nocked.visible = false;
  sfx('release', .9, rnd(.95, 1.08)); sfx('fly', .25 + .45 * power, rnd(.9, 1.1)); buzz(12);
  // لقطة متابعة السهم للرميات البعيدة التي ستصيب
  const pr = predict(from, v, a.wind);
  if (pr && pr.type !== 'ground' && from.distanceTo(pr.p) > 17 && (pr.type === 'lantern' || pr.t?.correct || pr.ring >= 8 || Math.random() < .5)) G.cam = { mode: 'arrow', a, hold: 0, blend: 0, skip: false };
}
function onHit(a, h) {
  const st = a.st;
  if (h.type === 'ground') {
    sfx('sand', .55, rnd(.9, 1.1)); dust.burst(a.p, 14, '#d9b07a', 2.2, .8, .9, 3, 2.5);
    a.p.y = groundY(a.p.x, a.p.z) + .05; a.m.position.copy(a.p).addScaledVector(a.v.clone().normalize(), .25);
    G.stuck.push(a.m); return;
  }
  G.hits++;
  if (h.type === 'lantern') {
    h.l.alive = false; sfx('ok', .5, 1.3); sparks.burst(h.l.L.position, 70, '#ffc04a', 7, 1, 1.2, 2, 1.2); scene.remove(a.m);
    setScore(G.score + 30); popPts(30); buzz(30); h.l.L.visible = false; return;
  }
  // سهم مغروس في الهدف
  const t = h.t; t.inner.attach(a.m); G.stuck.push(a.m);
  sfx(h.ring >= 9 ? 'bull' : 'hitwood', 1, rnd(.95, 1.05)); buzz(35);
  const hp = a.p.clone(); sparks.burst(hp, h.ring >= 9 ? 60 : 24, h.ring >= 9 ? '#ffd65a' : '#e8c58a', h.ring >= 9 ? 6 : 3, 1, .9, 3);
  if (st !== G.st || st.state !== 'quiz') return;
  st.state = 'done'; hideQ();
  if (t.correct) {
    const dist = Math.round((G.ride ? a.from : st.s).distanceTo(t.g.position)), pts = 100 + h.ring * 10 + dist * 2 + (G.ride ? Math.round(ride.speed * 4) : 0);
    G.right++; setScore(G.score + pts); popPts(pts);
    sfx('ok', .8); sparks.burst(t.g.position.clone().setY(t.g.position.y + DISC_Y + 1), 160, '#ffd65a', 9, 1.2, 1.6, 3, 1);
    toast(h.ring >= 9 ? 'في المنتصف!' : ['أحسنت', 'إصابة موفّقة', 'بارك الله فيك', 'رمية صائبة'][G.right % 4], st.q[3], false, 3200);
  } else {
    G.hearts--; renderHearts(); sfx('bad', .8); buzz([40, 60, 40]);
    $('flash').style.opacity = 1; setTimeout(() => $('flash').style.opacity = 0, 350);
    const c = st.targets.find(x => x.correct);
    toast('الإجابة الصحيحة: ' + LETTERS[c.k], st.q[3] && st.q[3].includes(c.text.slice(0, 12)) ? st.q[3] : c.text + (st.q[3] ? ' — ' + st.q[3] : ''), true, 4200);
  }
  setTimeout(nextStation, G.ride ? (t.correct ? 900 : 1400) : t.correct ? 1900 : 3200);
}

/* ================= الحلقة الرئيسية ================= */
const clock = new THREE.Clock(); let fpsAcc = 0, fpsN = 0, lowQ = false;
const st0 = () => G.st || { s: player.pos };
let camY = null;
function updateCamera(dt) {
  const dir = aimDir(), right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const zoom = G.drawing ? G.draw : 0, R = G.ride, dist = R ? lerp(4.7, 3.5, zoom) : lerp(3.1, 2.45, zoom), side = R ? lerp(.85, 1.05, zoom) : lerp(.75, .95, zoom);
  const pivot = player.pos.clone().add(new THREE.Vector3(0, 1.62, 0));
  if (R) { camY = camY == null ? pivot.y : lerp(camY, pivot.y, 1 - Math.exp(-dt * 8)); pivot.y = camY; } // بدون اهتزاز مع العدْو
  const pos = pivot.clone().addScaledVector(dir, -dist).addScaledVector(right, side).add(new THREE.Vector3(0, R ? .75 : .12, 0));
  pos.y = Math.max(pos.y, groundY(pos.x, pos.z) + .35);
  camera.fov = lerp(camera.fov, lerp(62, 44, zoom), 1 - Math.exp(-dt * 10)); camera.updateProjectionMatrix();
  const look = pos.clone().add(dir);
  if (G.cam) {
    const c = G.cam, a = c.a;
    if (c.mode === 'arrow') {
      const vd = a.v.clone().normalize(), want = a.p.clone().addScaledVector(vd, -1.5).add(new THREE.Vector3(0, .28, 0)).addScaledVector(right, .3);
      c.blend = Math.min(1, c.blend + dt * 6);
      camera.position.lerpVectors(pos, want, c.blend); camera.lookAt(a.p.clone().addScaledVector(vd, 4));
      return;
    } else if (c.mode === 'back') {
      if (!c.fromP) { c.fromP = camera.position.clone(); c.fromQ = camera.quaternion.clone(); c.k = 0; }
      c.k = Math.min(1, c.k + dt * 2.6); const e = c.k * c.k * (3 - 2 * c.k);
      camera.position.copy(pos); camera.lookAt(look); const tq = camera.quaternion.clone();
      camera.position.lerpVectors(c.fromP, pos, e); camera.quaternion.slerpQuaternions(c.fromQ, tq, e);
      if (c.k >= 1) G.cam = null; return;
    } else if (c.mode === 'hold') {
      if (!c.hv) { const back = (G.ride ? player.pos : st0().s).clone().sub(c.hp).setY(0).normalize(); c.hv = c.hp.clone().addScaledVector(back, 4.2).addScaledVector(right, 1.2).add(new THREE.Vector3(0, .9, 0)); }
      camera.position.lerp(c.hv, 1 - Math.exp(-dt * 6)); camera.lookAt(c.hp); return;
    }
  }
  camera.position.copy(pos); camera.lookAt(look);
}
function updatePlayer(dt) {
  let jx = input.jx, jy = input.jy; const k = input.keys;
  if (k.KeyW || k.ArrowUp) jy = -1; if (k.KeyS || k.ArrowDown) jy = 1; if (k.KeyA || k.ArrowLeft) jx = -1; if (k.KeyD || k.ArrowRight) jx = 1;
  const mag = Math.min(1, Math.hypot(jx, jy)), fwd = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)), right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const speed = (mag > .92 || k.ShiftLeft ? 6.2 : 4.2) * mag * (G.drawing ? .45 : 1);
  const want = fwd.multiplyScalar(-jy).add(right.multiplyScalar(jx)); if (want.lengthSq() > 0) want.normalize().multiplyScalar(speed);
  player.vel.lerp(want, 1 - Math.exp(-dt * (player.air ? 2.5 : 10))); player.pos.addScaledVector(player.vel, dt);
  player.pos.x = clamp(player.pos.x, pathX(player.pos.z) - 45, pathX(player.pos.z) + 45);
  player.pos.z = clamp(player.pos.z, -12 - (STATIONS - 1) * GAP - 8, 30);
  // القفز
  const gy = groundY(player.pos.x, player.pos.z);
  if (input.jump && !player.air) { player.vy = 5.4; player.air = true; sfx('release', .25, .6); }
  input.jump = false;
  if (player.air) { player.vy -= 15 * dt; player.pos.y += player.vy * dt; if (player.pos.y <= gy && player.vy < 0) { player.pos.y = gy; player.air = false; dust.burst(player.pos.clone().setY(gy + .05), 14, '#d9b07a', 2, .6, .7, 2, 3); sfx('sand', .35, .8); } }
  else player.pos.y = gy;
  const sp = player.air ? 0 : Math.hypot(player.vel.x, player.vel.z); player.walk += sp * dt * 2.3;
  const ws = Math.min(1, sp / 3);
  hero.position.copy(player.pos); hero.position.y += Math.abs(Math.sin(player.walk)) * .035 * ws;
  hero.rotation.y = player.yaw; torso.rotation.z = Math.sin(player.walk) * .025 * ws; torso.rotation.x = player.air ? -.06 : -.02 * ws;
  // خطوات القدمين
  for (const f of feet) { const ph = player.walk + (f.userData.s > 0 ? Math.PI : 0);
    f.position.set(f.userData.s * .09, player.air ? .16 : Math.max(0, Math.sin(ph)) * .07 * ws, (player.air ? -.05 : -Math.cos(ph) * .2 * ws) + .01);
    f.rotation.x = player.air ? .3 : Math.sin(ph) * .25 * ws; }
  poseArms();
}
function poseArms() {
  rig.rotation.x = player.pitch;
  // الذراعان والوتر
  const d = G.drawing ? G.draw : 0;
  const nock = new THREE.Vector3(-.03, 0, -.5 + .58 * d);
  ik(arms[0], SHL, GRIP);
  ik(arms[1], SHR, nock.clone().add(new THREE.Vector3(.025, .01, .025)));
  const P = strGeo.attributes.position; P.setXYZ(1, nock.x, nock.y, nock.z); P.needsUpdate = true;
  nocked.position.copy(nock); nocked.visible = G.cooldown <= 0;
}
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const rideHeading = () => { const x = pathX(ride.z) + ride.lane, ax = pathX(ride.z - 2) + ride.lane; return Math.atan2(-(ax - x), 2); };
const _seat = new THREE.Vector3();
function updateRide(dt) {
  let jx = input.jx, jy = input.jy; const k = input.keys;
  if (k.KeyW || k.ArrowUp) jy = -1; if (k.KeyS || k.ArrowDown) jy = 1; if (k.KeyA || k.ArrowLeft) jx = -1; if (k.KeyD || k.ArrowRight) jx = 1;
  if (!ride.started && G.t > .7) { ride.started = true; toast('يلّا يا فارس!', 'حرّك الخيل بإبهامك: قدّام تمشي، وتتركه توقف', false, 2600); }
  // التحكم الكامل بالخيل: ⇡ تمشي وتعدو (كلما دفعت أكثر أسرع)، ⇣ تهدّي وترجع للخلف، وتترك العصا = تقف. ⇆ تلف
  const want = !ride.started ? 0 : jy < -.05 ? -jy * 12.5 : jy > .05 ? -jy * 2.2 : 0;
  ride.speed = lerp(ride.speed, want, 1 - Math.exp(-dt * (Math.abs(want) < Math.abs(ride.speed) ? 3.6 : 1.4)));
  if (Math.abs(ride.speed) < .05 && want === 0) ride.speed = 0;
  const turn = jx * (Math.abs(jy) > .05 || Math.abs(ride.speed) > .3 ? 1.5 : 1.1) * dt * (ride.speed < -.05 ? -1 : 1);
  // زاوية التصويب نسبية لاتجاه الخيل: إذا لفّت الخيل تلف الكاميرا معها
  const rel = clamp(wrapA(player.yaw - ride.heading), -2.7, 2.7); ride.heading -= turn; player.yaw = ride.heading + rel;
  ride.x += -Math.sin(ride.heading) * ride.speed * dt; ride.z += -Math.cos(ride.heading) * ride.speed * dt;
  ride.z = clamp(ride.z, -12 - (RIDE_N - 1) * RIDE_GAP - 60, 40); ride.x = clamp(ride.x, pathX(ride.z) - 45, pathX(ride.z) + 45);
  // قفزة الخيل
  if (input.jump && !ride.air && ride.started) { ride.vy = 4.6; ride.air = true; sfx('hoof', .4, .8); }
  input.jump = false;
  if (ride.air) { ride.vy -= 13 * dt; ride.hy += ride.vy * dt; if (ride.hy <= 0 && ride.vy < 0) { ride.hy = 0; ride.air = false; dust.burst(horse.position.clone().setY(horse.position.y + .05), 22, '#d9b07a', 2.6, .6, .8, 2, 3); sfx('hoof', .5, .75); sfx('sand', .3, .8); } }
  // العدْو
  const gk = clamp(Math.abs(ride.speed) / 9, 0, 1), x = ride.x, gy = groundY(x, ride.z);
  ride.cyc += dt * (ride.air ? 2 : (ride.speed < 0 ? -1 : 1) * (Math.abs(ride.speed) < .05 ? 0 : 3 + Math.abs(ride.speed) * .85));
  horse.position.set(x, gy + ride.hy + (ride.air ? 0 : Math.abs(Math.sin(ride.cyc)) * .07 * gk), ride.z);
  horse.rotation.set(ride.air ? -.12 * Math.sign(ride.vy) : Math.sin(ride.cyc) * .035 * gk, ride.heading, -jx * .08 * gk, 'YXZ');
  for (const L of hLegs) {
    const a = ride.cyc + L.ph, amp = ride.air ? 0 : Math.max(gk, Math.abs(ride.speed) > .05 ? .35 : 0);
    if (ride.air) { L.hip.rotation.x = L.front ? .7 : -.5; L.knee.rotation.x = L.front ? -1.2 : .8; }
    else if (L.front) { L.hip.rotation.x = Math.sin(a) * .55 * amp; L.knee.rotation.x = -Math.max(0, Math.sin(a + 1.3)) * 1.15 * amp; }
    else { L.hip.rotation.x = Math.sin(a) * .5 * amp - .04; L.knee.rotation.x = Math.max(0, Math.sin(a - 1)) * .85 * amp; }
    const sn = Math.sin(a); if (L.last > 0 && sn <= 0 && gk > .15) { sfx('hoof', .07 + .1 * gk, rnd(.85, 1.12), L.hip.position.x * 2); if (gk > .6 && Math.random() < .5) dust.burst(L.hip.getWorldPosition(_seat).setY(gy + .05), 3, '#d9b07a', 1.4, .5, .6, 2, 3); }
    L.last = sn;
  }
  tail.rotation.set(-.2 - gk * .55 + Math.sin(ride.cyc * 2) * .08 * gk, 0, Math.sin(G.t * 1.7) * .1);
  // الفارس فوق السرج
  horse.updateMatrixWorld(); horse.localToWorld(_seat.set(0, 1.64 - .9, .06));
  hero.position.copy(_seat); hero.position.y += Math.sin(ride.cyc * 2) * .015 * gk;
  player.pos.copy(hero.position); player.vel.set(0, 0, 0);
  hero.rotation.y = player.yaw; torso.rotation.set(-.03 - .04 * gk, 0, 0);
  poseArms();
}
function update(dt) {
  G.t += dt;
  const st = G.st;
  // شد القوس
  if (G.cooldown > 0) G.cooldown -= dt;
  if (input.fireWant && !G.drawing) startDraw();
  if (G.drawing) G.draw = Math.min(1, G.draw + dt / .8);
  $('pow').style.strokeDashoffset = 138.2 * (1 - (G.drawing ? G.draw : 0));
  $('cross').style.opacity = G.cam ? 0 : 1;
  // السهام الطائرة
  const slow = G.cam && G.cam.mode === 'arrow' ? (G.cam.skip ? 1 : .32) : 1, adt = dt * slow;
  for (let i = G.arrows.length - 1; i >= 0; i--) {
    const a = G.arrows[i]; let hit = null;
    for (let s = 0; s < 4 && !hit; s++) { step(a, adt / 4, a.wind); hit = testHit(a, a.st); }
    a.t += adt;
    if (hit) { a.p.lerpVectors(a.prev, a.p, hit.f); a.m.position.copy(a.p); a.m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), a.v.clone().normalize()); a.m.position.addScaledVector(a.v.clone().normalize(), hit.type === 'target' ? .28 : 0); onHit(a, hit); G.arrows.splice(i, 1); if (G.cam && G.cam.a === a) { G.cam.mode = 'hold'; G.cam.hold = 0; G.cam.hp = a.p.clone(); G.cam.hv = null; } continue; }
    if (a.t > 6) { scene.remove(a.m); G.arrows.splice(i, 1); continue; }
    a.m.position.copy(a.p); a.m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), a.v.clone().normalize());
  }
  while (G.stuck.length > 28) { const m = G.stuck.shift(); m.parent && m.parent.remove(m); }
  if (G.cam && G.cam.mode === 'hold') { G.cam.hold += dt; if (G.cam.hold > (G.cam.skip ? .1 : 1.4)) G.cam = { mode: 'back' }; }
  if (G.ride) updateRide(dt * (G.cam && G.cam.mode === 'arrow' ? slow : G.cam && G.cam.mode === 'hold' ? .5 : 1));
  else if (!(G.cam && (G.cam.mode === 'arrow' || G.cam.mode === 'hold'))) updatePlayer(dt);
  updateCamera(dt);
  // المحطة الحالية
  if (st) {
    const near = Math.hypot(player.pos.x - st.s.x, player.pos.z - st.s.z);
    const tz = st.targets.map(t => t.g.position.z), zFront = Math.max(...tz), zLast = Math.min(...tz);
    if (st.state === 'idle' && (G.ride ? near < 13 || player.pos.z < st.s.z : near < 3.4)) { st.state = 'quiz'; st.rising = true; sfx('rise', .6); showQ(st); for (const t of st.targets) dust.burst(t.g.position.clone().setY(t.g.position.y + .3), 26, '#d9b07a', 3, 1.2, 1.4, 2.5, 2); }
    if (st.rising && st.rise < 1) { st.rise = Math.min(1, st.rise + dt * .9); const e = 1 - Math.pow(1 - st.rise, 3); for (const t of st.targets) t.inner.position.y = lerp(-4.2, 0, e) + Math.sin(st.rise * 9) * .05 * (1 - st.rise); }
    // على الخيل: السؤال يبقى حتى يرمي الإجابة؛ إذا ابتعد عن الأهداف ينبّهه يرجع لها
    if (G.ride && st.state === 'quiz' && Math.hypot(player.pos.x - st.targets[1].g.position.x, player.pos.z - zLast) > 55 && G.t - (st.warnT || 0) > 6) { st.warnT = G.t; toast('ارجع للأهداف', 'السؤال ينتظرك؛ لِف الخيل وارمِ الإجابة الصحيحة', true, 2600); }
    const vis = st.state !== 'idle';
    for (const l of st.lanterns) { l.vis = lerp(l.vis, vis && l.alive ? 1 : 0, 1 - Math.exp(-dt * 3)); l.L.visible = l.alive && l.vis > .02; l.L.scale.setScalar(Math.max(.001, l.vis));
      const tt = G.t * l.sp + l.ph; l.L.position.set(l.base.x + Math.sin(tt) * l.amp, l.base.y + Math.sin(tt * 2.3) * .5, l.base.z); }
    beam.position.copy(st.s); ring.position.copy(st.s).setY(st.s.y + .05);
    beam.visible = ring.visible = st.state === 'idle';
    beam.material.opacity = .35 + .15 * Math.sin(G.t * 3); ring.scale.setScalar(1 + .06 * Math.sin(G.t * 4));
    // مؤشر الاتجاه نحو المحطة
    const ang = Math.atan2(-(st.s.x - player.pos.x), -(st.s.z - player.pos.z)) - player.yaw;
    $('navArrow').setAttribute('transform', `rotate(${-ang * 180 / Math.PI} 12 12)`);
    $('navArrow').style.display = ''; $('nav').style.display = st.state === 'idle' ? '' : 'none'; $('navTxt').textContent = AR(Math.round(near)) + ' م';
    // الرياح
    const w = st.wind.length();
    $('windTxt').textContent = w < .2 ? 'هادئة' : 'ريح ' + AR(w.toFixed(1));
    $('windArrow').setAttribute('transform', `rotate(${(Math.atan2(st.wind.x, -st.wind.z) - (-player.yaw)) * 180 / Math.PI} 12 12)`);
    if (audio.wind) { audio.wind.g.gain.value = .03 + w * .025; audio.wind.bp.frequency.value = 350 + 120 * Math.sin(G.t * .3) + w * 60; }
  }
  updateGuide();
  updateAimLabel();
  sparks.update(dt * slow); dust.update(dt * slow);
  // عدّاد النقاط
  if (shown !== G.score) { shown += Math.sign(G.score - shown) * Math.max(1, Math.round(Math.abs(G.score - shown) * .18)); $('score').textContent = AR(shown); }
}
// اسم الإجابة تحت علامة التصويب: الطالب يعرف وش بيرمي قبل ما يرمي
let aimK = -1;
function updateAimLabel() {
  let k = -1;
  if (G.st && G.st.state === 'quiz' && !G.cam) {
    const o = camera.position, d = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion); let best = 1e9;
    for (const t of G.st.targets) { if (!t.alive) continue; const h = rayTarget(o, d, t); if (h != null && h < best) { best = h; k = t.k; } }
  }
  if (k === aimK) return; aimK = k; const el = $('aimLbl');
  if (k < 0) { el.classList.remove('on'); return; }
  const t = G.st.targets.find(x => x.k === k);
  el.innerHTML = `<span class="l" style="background:${COLORS[k]}">${LETTERS[k]}</span><span>${t.text}</span>`; el.style.borderColor = COLORS[k]; el.classList.add('on');
}
const sinkers = new Set();
function animateSink(dt) { for (const st of sinkers) { st.sinkT += dt; const e = Math.min(1, st.sinkT / 1.2); for (const t of st.targets) t.inner.position.y = -4.4 * e * e; st.lanterns.forEach(l => l.L.scale.setScalar(Math.max(.001, 1 - e))); if (e >= 1) sinkers.delete(st); } }

function menuCamera(t) {
  if (G.ride && G.mode === 'menu') { // لقطة دائرية حول الفارس وخيله
    const c = horse.position, r = 6.5, a = t * .12;
    camera.position.set(c.x + Math.sin(a) * r, c.y + 2.4 + Math.sin(t * .2) * .3, c.z + Math.cos(a) * r);
    camera.lookAt(c.x, c.y + 1.5, c.z); camera.fov = 52; camera.updateProjectionMatrix(); return;
  }
  const s = stationPos(0), r = 16;
  camera.position.set(s.x + Math.sin(t * .08) * r, s.y + 4 + Math.sin(t * .2), s.z + 8 + Math.cos(t * .08) * r);
  camera.lookAt(s.x, s.y + 1.5, s.z - 20); camera.fov = 58; camera.updateProjectionMatrix();
}
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 1 / 20);
  if (G.mode === 'play') update(dt);
  else if (G.mode === 'menu' || G.mode === 'end') { menuCamera(clock.elapsedTime); sparks.update(dt); dust.update(dt); }
  animateSink(dt);
  // الشمس والظل يتبعان الرامي
  const c = G.mode === 'menu' ? (G.ride ? horse.position : stationPos(0)) : player.pos;
  sunLight.position.copy(c).addScaledVector(SUN, 80); sunLight.target.position.copy(c);
  scene.userData.sky.position.copy(camera.position);
  renderer.render(scene, camera);
  // جودة تلقائية: إذا الجهاز بطيء نخفف
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 2.5) { const avg = fpsAcc / fpsN; if (avg > 1 / 38 && !lowQ) { lowQ = true; PR = 1; renderer.setPixelRatio(PR); renderer.shadowMap.enabled = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); } fpsAcc = fpsN = 0; }
}

/* ================= الشاشات ================= */
function pause() { if (G.mode !== 'play') return; G.mode = 'pause'; $('paused').hidden = false; if (audio.ctx) audio.ctx.suspend(); }
function resume() { G.mode = 'play'; $('paused').hidden = true; clock.getDelta(); if (audio.ctx) audio.ctx.resume(); }
function toMenu() { if (G.st) { disposeStation(G.st); G.st = null; } for (const a of G.arrows) scene.remove(a.m); G.arrows = []; G.mode = 'menu'; ['paused', 'end'].forEach(id => $(id).hidden = true); $('top').hidden = $('cross').hidden = true; ['fire', 'fire2', 'jump'].forEach(id => $(id).hidden = true); hideQ(); $('hl').hidden = $('hr').hidden = true; $('menu').hidden = false; renderMenu(); if (audio.ctx) audio.ctx.resume(); }
function renderMenu() {
  $('grades').innerHTML = Object.entries(GRADES).map(([g, n]) => `<button class="chip ${g == G.grade ? 'on' : ''}" data-g="${g}">${n}</button>`).join('');
  $('modes').innerHTML = [['ex', 'دروس الاختبار الأول'], ['all', 'الكتاب كامل'], ['pick', '✎ أختار الدروس']].map(([v, n]) => `<button class="chip ${G.src == v ? 'on' : ''}" data-m="${v}">${n}</button>`).join('');
  if (G.src === 'pick') { const L = myLessons(), n = lessonPool(L).length; $('pickSum').innerHTML = `${lW(L.length)}، ${qW(n)} <button class="ghost mini" id="pickEdit">تعديل</button>`; $('pickSum').hidden = false; $('pickEdit').onclick = openLessons; }
  else $('pickSum').hidden = true;
  $('rides').innerHTML = [[0, '🚶 على الأقدام'], [1, '🐎 على ظهر الخيل']].map(([v, n]) => `<button class="chip ${(+G.ride) == v ? 'on' : ''}" data-r="${v}">${n}</button>`).join('');
  $('hadith').innerHTML = HADITH[+G.ride];
  const b = store.get('best' + G.grade + (G.ride ? 'h' : ''), 0); $('best').textContent = b ? '🏆 أفضل نتيجة لك في هذا الصف: ' + AR(b) : '';
  menuPose();
}
// في القائمة: الفارس واقف على خيله قرب المحطة الأولى، أو الرامي على قدميه
function menuPose() {
  setRideLook(G.ride);
  if (G.ride) { Object.assign(ride, { x: pathX(-6) + 2.5, z: -6, lane: 2.5, speed: 0, hy: 0, air: false, started: true }); ride.heading = rideHeading(); player.yaw = ride.heading - .5; player.pitch = .05; G.drawing = false; updateRide(0); }
  else { player.pos.set(0, groundY(0, 0), 0); hero.position.copy(player.pos); hero.rotation.y = 0; poseArms(); }
}
/* ================= الإعدادات ================= */
let setFrom = 'menu';
function applySettings() {
  document.body.classList.toggle('lefty', SET.lefty);
  $('sens').value = Math.round(SET.sens * 100); $('sensV').textContent = AR(Math.round(SET.sens * 100)) + '٪';
  [...$('hand').children].forEach(b => b.classList.toggle('on', (+b.dataset.h) === (+SET.lefty)));
}
function openSettings(from) { setFrom = from; $(from).hidden = true; $('settings').hidden = false; applySettings(); }
$('sens').addEventListener('input', e => { SET.sens = +e.target.value / 100; store.set('sens', SET.sens); applySettings(); });
$('hand').addEventListener('click', e => { const b = e.target.closest('[data-h]'); if (!b) return; SET.lefty = b.dataset.h === '1'; store.set('lefty', SET.lefty); applySettings(); sfx('tap', .6); });
$('setBtn').onclick = () => openSettings('menu'); $('setBtn2').onclick = () => openSettings('paused');
$('setBack').onclick = () => { $('settings').hidden = true; $(setFrom).hidden = false; };
applySettings();
$('rides').addEventListener('click', e => { const r = e.target.closest('[data-r]'); if (!r) return; G.ride = r.dataset.r === '1'; store.set('ride', G.ride); renderMenu(); sfx('tap', .6); });
$('grades').addEventListener('click', e => { const g = e.target.closest('[data-g]'); if (!g) return; G.grade = +g.dataset.g; store.set('grade', G.grade); renderMenu(); sfx('tap', .6); });
$('modes').addEventListener('click', e => { const m = e.target.closest('[data-m]'); if (!m) return; G.src = m.dataset.m; store.set('src', G.src); renderMenu(); sfx('tap', .6); if (G.src === 'pick') openLessons(); });
/* ================= اختيار الدروس ================= */
let pickSel = [];
function openLessons() { pickSel = myLessons().slice(); $('menu').hidden = true; $('lessons').hidden = false; $('lesGrade').textContent = GRADES[G.grade]; renderLessons(); }
function renderLessons() {
  const b = BANK[G.grade];
  $('lesList').innerHTML = b.lessons.map((name, i) => { const n = lessonPool([i]).length; return n ? `<button class="les ${pickSel.includes(i) ? 'on' : ''}" data-l="${i}"><i>${pickSel.includes(i) ? '✓' : ''}</i><span>${name}</span><b>${AR(n)}</b></button>` : ''; }).join('');
  const n = lessonPool(pickSel).length, ok = n >= 3;
  $('lesDone').disabled = !ok;
  $('lesDone').textContent = ok ? `تم (${lW(pickSel.length)}، ${qW(n)})` : 'اختر دروسًا فيها ٣ أسئلة على الأقل';
}
$('lesList').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (!b) return; const i = +b.dataset.l; pickSel = pickSel.includes(i) ? pickSel.filter(x => x !== i) : [...pickSel, i].sort((a, c) => a - c); renderLessons(); sfx('tap', .5); });
$('lesAll').onclick = () => { pickSel = BANK[G.grade].lessons.map((_, i) => i).filter(i => lessonPool([i]).length); renderLessons(); };
$('lesNone').onclick = () => { pickSel = []; renderLessons(); };
$('lesEx').onclick = () => { pickSel = BANK[G.grade].ex.slice(); renderLessons(); };
$('lesDone').onclick = () => { store.set('les' + G.grade, pickSel); G.src = 'pick'; store.set('src', 'pick'); $('lessons').hidden = true; $('menu').hidden = false; renderMenu(); };
$('lesBack').onclick = () => { $('lessons').hidden = true; $('menu').hidden = false; renderMenu(); };
$('start').onclick = $('again').onclick = startGame;
$('pause').onclick = pause; $('resume').onclick = resume; $('toMenu').onclick = $('toMenu2').onclick = toMenu;
$('snd').onclick = $('snd2').onclick = () => { initAudio(); setSound(!audio.on); };
$('share').onclick = () => {
  const url = location.href.split('#')[0];
  const txt = `${G.ride ? '🐎' : '🏹'} لعبت «ميدان الرماة»${G.ride ? ' (الرماية على ظهر الخيل)' : ''} في موقع قسم التربية الإسلامية وجبت ${AR(G.score)} نقطة و${AR(G.right)} إجابات صحيحة من ${AR(G.n)}!\nتقدر تغلبني؟ ${url}`;
  if (navigator.share) navigator.share({ text: txt }).catch(() => {}); else open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank');
};
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
function onResize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); $('rotate').classList.toggle('need', G.mode === 'play' || G.mode === 'menu'); }
addEventListener('resize', onResize); onResize();

window.__rumat = { G, player, stationPos, ridePos, ride, THREE, scene, camera, release, aimPoint, input, hero, horse, SET };

(async () => {
  try { BANK = await (await fetch('q.json')).json(); } catch (e) { $('load').innerHTML = '<div style="text-align:center;padding:20px">تعذّر تحميل الأسئلة. تأكد من الإنترنت ثم حدّث الصفحة.</div>'; return; }
  try { await Promise.race([document.fonts.load('600 40px "Readex Pro"'), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
  setSound(audio.on); renderMenu(); $('menu').hidden = false; $('load').classList.add('off'); setTimeout(() => $('load').remove(), 700);
  frame();
})();
