/* =====================================================================
   3D LAPTOP + FILE BURST (three.js)
   Real-time rendered laptop with PBR materials, studio lighting and
   soft shadows, sitting on the hero photo. Its screen shows
   assets/screen-ui.png (a capture of the app UI); the flying documents
   use assets/docs-atlas.png.
   app.js drives it through window.Laptop3D.update(progress).
   ===================================================================== */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const host = document.querySelector(".lap3d");
const ST = (window.SITE && window.SITE.stage) || {};
if (host && (!ST.heroMode || ST.heroMode === "3d")) init().catch(err => console.warn("3D laptop unavailable, using fallback:", err));

async function init() {
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

  /* ---------- lights: warm desk-lamp key, cool rim, soft fill ---------- */
  const key = new THREE.DirectionalLight(0xffe0b8, 2.4);
  key.position.set(3.5, 6, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
  key.shadow.radius = 6; key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fa2c4, 1.6);
  rim.position.set(-5, 3, -4);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xc7d2e6, 0x1a120c, 0.35));

  /* ---------- textures ---------- */
  const loader = new THREE.TextureLoader();
  const load = url => new Promise(res => loader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); res(t); }, undefined, () => res(null)));
  const [screenTex, docsTex] = await Promise.all([load(ST.screenImage || "assets/screen-ui.png"), load(ST.docsAtlas || "assets/docs-atlas.png")]);

  /* ---------- materials (midnight finish) ---------- */
  const alu = new THREE.MeshPhysicalMaterial({ color: 0x232a37, metalness: 1, roughness: 0.34, clearcoat: 0.25, clearcoatRoughness: 0.5 });
  const aluEdge = new THREE.MeshPhysicalMaterial({ color: 0x333b4a, metalness: 1, roughness: 0.22 });
  const well = new THREE.MeshStandardMaterial({ color: 0x0b0f17, roughness: 0.8, metalness: 0.2 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x0b0e14, roughness: 0.62, metalness: 0.05 });
  const bezel = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.28, metalness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 1, roughness: 0.06, transparent: true, opacity: 0.16, depthWrite: false });
  const pad = new THREE.MeshPhysicalMaterial({ color: 0x2c3442, metalness: 0.9, roughness: 0.18, clearcoat: 0.6 });
  const display = new THREE.MeshBasicMaterial({ map: screenTex, color: screenTex ? 0xffffff : 0x182132, toneMapped: false });

  /* ---------- laptop geometry (≈ 14" proportions, no branding) ---------- */
  const W = 3.1, D = 2.15, BH = 0.065, LH = 2.06, LT = 0.042;
  const laptop = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(W, BH, D, 6, 0.05), alu);
  base.position.y = BH / 2; base.castShadow = true; base.receiveShadow = true;
  laptop.add(base);
  // keyboard well + keys
  const wellMesh = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.875, D * 0.47), well);
  wellMesh.rotation.x = -Math.PI / 2; wellMesh.position.set(0, BH + 0.0015, -D * 0.2);
  laptop.add(wellMesh);
  const keyGeo = new RoundedBoxGeometry(0.168, 0.022, 0.152, 2, 0.01);
  const cols = 14, span = W * 0.84, pitch = span / cols, x0 = -span / 2 + pitch / 2;
  const rows = [-0.88, -0.71, -0.54, -0.37, -0.2, -0.03];
  const keys = [];
  rows.slice(0, 5).forEach((z, r) => { for (let c = 0; c < cols; c++) keys.push({ x: x0 + c * pitch, z, sx: 1, sz: r === 0 ? 0.62 : 1 }); });
  const zb = rows[5];
  [0, 1, 2].forEach(c => keys.push({ x: x0 + c * pitch, z: zb, sx: 1, sz: 1 }));
  keys.push({ x: x0 + 5.5 * pitch, z: zb, sx: (6 * pitch - 0.02) / 0.168, sz: 1 });
  [9, 10].forEach(c => keys.push({ x: x0 + c * pitch, z: zb, sx: 1, sz: 1 }));
  [11, 12, 13].forEach(c => { keys.push({ x: x0 + c * pitch, z: zb + 0.04, sx: 1, sz: 0.45 }); });
  keys.push({ x: x0 + 12 * pitch, z: zb - 0.04, sx: 1, sz: 0.45 });
  const keyMesh = new THREE.InstancedMesh(keyGeo, keyMat, keys.length);
  const m4 = new THREE.Matrix4();
  keys.forEach((k, i) => { m4.compose(new THREE.Vector3(k.x, BH + 0.012, k.z), new THREE.Quaternion(), new THREE.Vector3(k.sx, 1, k.sz)); keyMesh.setMatrixAt(i, m4); });
  keyMesh.castShadow = true;
  laptop.add(keyMesh);
  const padMesh = new THREE.Mesh(new RoundedBoxGeometry(W * 0.39, 0.004, D * 0.33, 2, 0.002), pad);
  padMesh.position.set(0, BH + 0.001, D * 0.27);
  laptop.add(padMesh);
  // front lip highlight
  const lip = new THREE.Mesh(new THREE.BoxGeometry(W * 0.2, 0.012, 0.01), aluEdge);
  lip.position.set(0, BH * 0.7, D / 2 + 0.002);
  laptop.add(lip);
  // hinge
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, W * 0.8, 24), bezel);
  hinge.rotation.z = Math.PI / 2; hinge.position.set(0, BH + 0.02, -D / 2 + 0.03);
  laptop.add(hinge);

  // lid (pivot at the hinge)
  const lid = new THREE.Group();
  lid.position.set(0, BH + 0.02, -D / 2 + 0.03);
  const shell = new THREE.Mesh(new RoundedBoxGeometry(W, LH, LT, 6, 0.04), alu);
  shell.position.set(0, LH / 2, -LT / 2); shell.castShadow = true;
  lid.add(shell);
  const bez = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.03, LH - 0.03), bezel);
  bez.position.set(0, LH / 2, 0.0008);
  lid.add(bez);
  const sw = W * 0.935, sh = sw / 1.6;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), display);
  screen.position.set(0, LH / 2 + 0.035, 0.0016);
  lid.add(screen);
  const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.04, LH - 0.04), glass);
  glassMesh.position.set(0, LH / 2, 0.0024);
  lid.add(glassMesh);
  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.014, 20), new THREE.MeshStandardMaterial({ color: 0x1b2433, roughness: 0.2 }));
  cam.position.set(0, LH - 0.045, 0.002);
  lid.add(cam);
  laptop.add(lid);

  // ground: real shadow + soft contact shadow
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.42 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  laptop.add(ground);
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d"), grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  grd.addColorStop(0, "rgba(0,0,0,.75)"); grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.35, D * 1.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2; contact.position.y = 0.002;
  laptop.add(contact);
  scene.add(laptop);

  /* ---------- flying documents ---------- */
  const COLS = 4, ROWS = 2;
  const docGeos = Array.from({ length: COLS * ROWS }, (_, i) => {
    const geo = new THREE.PlaneGeometry(0.46, 0.613);
    const uv = geo.attributes.uv, col = i % COLS, row = Math.floor(i / COLS);
    for (let j = 0; j < uv.count; j++) uv.setXY(j, (col + uv.getX(j)) / COLS, (ROWS - 1 - row + uv.getY(j)) / ROWS);
    return geo;
  });
  const rnd = (s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; })(424242);
  const N = innerWidth < 720 ? 50 : 96;
  const docs = Array.from({ length: N }, (_, i) => {
    const mat = new THREE.MeshStandardMaterial({ map: docsTex, color: docsTex ? 0xffffff : 0xe8e2d8, roughness: 0.82, metalness: 0, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const m = new THREE.Mesh(docGeos[i % docGeos.length], mat);
    m.visible = false;
    scene.add(m);
    return {
      m, d: rnd() * 0.6, big: 1.1 + rnd() * 1.1,
      end: new THREE.Vector3(-3.4 + rnd() * 4.6, -1.3 + rnd() * 2.2, 4.2 + rnd() * 2.6),
      ctrl: new THREE.Vector3(-1.8 + rnd() * 1.6, 0.6 + rnd() * 1.6, 1.2 + rnd() * 1.6),
      spin: new THREE.Vector3((rnd() - .5) * 6, (rnd() - .5) * 6, (rnd() - .5) * 4),
    };
  });

  /* ---------- layout & animation ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const LID_OPEN = -0.2, LID_CLOSED = Math.PI / 2 - 0.035;
  // lid starts closed and opens on load (instantly with reduced motion or the ?stage= debug freeze)
  let lidT = matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(location.search).has("stage") ? 1 : 0;
  let progress = window.__heroP || 0, lookY = 1.6;

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the laptop ≈ 40% of the width on desktop, ≈ 84% on phones, and never taller than ~half the viewport
    const target = camera.aspect < .8 ? .84 : .40;
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const distW = W / (target * camera.aspect * 2 * tanH);
    const distH = 2.6 / (0.5 * 2 * tanH);
    const dist = Math.max(9, distW, camera.aspect < .8 ? 0 : distH);
    camera.position.set(0, dist * 0.3, dist);
    camera.lookAt(0, dist * 0.195, 0);
    lookY = dist * 0.195;
    camera.updateProjectionMatrix();
    render();
  }

  const screenPos = new THREE.Vector3(), tmp = new THREE.Vector3();
  function render() {
    const p = progress;
    const pb = ease(seg(p, .04, .32));
    laptop.rotation.y = lerp(0, -0.9, pb);
    laptop.rotation.z = lerp(0, 0.04, pb);
    const narrow = camera.aspect < .8;
    laptop.position.set(lerp(0, narrow ? 0.35 : 1.9, pb), lerp(0, 0.3, pb), lerp(0, narrow ? -1.6 : -2.6, pb));
    lid.rotation.x = lerp(LID_CLOSED, LID_OPEN, ease(lidT));
    laptop.updateMatrixWorld(true);

    // documents stream out of the screen toward the camera
    screen.getWorldPosition(screenPos);
    const pc = seg(p, .14, .44);
    const camPos = camera.position;
    docs.forEach(o => {
      const t = clamp((pc - o.d) / .38, 0, 1);
      if (t <= 0 || t >= 1) { o.m.visible = false; return; }
      const k = ease(t), u = 1 - k;
      const end = tmp.copy(o.end); end.z += camPos.z - 9; end.y += lookY; // end points spread around the line of sight
      const cx = screenPos.x + o.ctrl.x, cy = screenPos.y + o.ctrl.y, cz = screenPos.z + o.ctrl.z;
      o.m.position.set(
        u * u * screenPos.x + 2 * u * k * cx + k * k * end.x,
        u * u * screenPos.y + 2 * u * k * cy + k * k * end.y,
        u * u * screenPos.z + 2 * u * k * cz + k * k * end.z);
      o.m.rotation.set(o.spin.x * k, o.spin.y * k - 0.9 * (1 - k), o.spin.z * k);
      o.m.scale.setScalar(0.2 + k * o.big);
      o.m.material.opacity = Math.min(1, t * 5) * (1 - seg(t, .82, 1));
      o.m.visible = true;
    });
    renderer.render(scene, camera);
  }

  host.prepend(canvas);
  canvas.className = "lap3d-canvas";
  addEventListener("resize", resize);
  resize();
  document.getElementById("hero").classList.add("has-3d");

  // lid opens on load
  if (lidT < 1) {
    const t0 = performance.now() + 250;
    const tick = now => { lidT = clamp((now - t0) / 1700, 0, 1); render(); if (lidT < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  window.Laptop3D = { update(p) { progress = p; render(); } };
}
