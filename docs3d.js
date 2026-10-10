/* =====================================================================
   DOCUMENT BURST over the photographed laptop (three.js)
   Used when content.js → stage.heroMode === "photo". Renders only the
   flying documents (transparent canvas); they leave the laptop screen in
   the photo, whose on-screen centre app.js passes in each frame.
   ===================================================================== */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const ST = (window.SITE && window.SITE.stage) || {};
const host = document.querySelector(".lap3d");
if (host && ST.heroMode === "photo") init().catch(err => console.warn("3D document burst unavailable, using fallback:", err));

async function init() {
  const canvas = document.createElement("canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  const key = new THREE.DirectionalLight(0xffe0b8, 2.2);   // warm, from the desk lamp side
  key.position.set(4, 5, 4);
  scene.add(key, new THREE.HemisphereLight(0xc7d2e6, 0x1a120c, 0.5));

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  camera.lookAt(0, 0, 0);

  const tex = await new Promise(res => new THREE.TextureLoader().load(ST.docsAtlas || "assets/docs-atlas.png",
    t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); res(t); }, undefined, () => res(null)));

  const COLS = 4, ROWS = 2;
  const geos = Array.from({ length: COLS * ROWS }, (_, i) => {
    const geo = new THREE.PlaneGeometry(0.46, 0.613);
    const uv = geo.attributes.uv, col = i % COLS, row = Math.floor(i / COLS);
    for (let j = 0; j < uv.count; j++) uv.setXY(j, (col + uv.getX(j)) / COLS, (ROWS - 1 - row + uv.getY(j)) / ROWS);
    return geo;
  });
  const rnd = (s => () => { s = (s * 16807) % 2147483647; return s / 2147483647; })(424242);
  const docs = Array.from({ length: innerWidth < 720 ? 50 : 96 }, (_, i) => {
    const m = new THREE.Mesh(geos[i % geos.length], new THREE.MeshStandardMaterial({ map: tex, color: tex ? 0xffffff : 0xe8e2d8, roughness: 0.82, side: THREE.DoubleSide, transparent: true, opacity: 0 }));
    m.visible = false; scene.add(m);
    return {
      m, d: rnd() * 0.6, big: 1.1 + rnd() * 1.1,
      end: new THREE.Vector3(-3.6 + rnd() * 5, -1.6 + rnd() * 2.6, 4.2 + rnd() * 2.6),
      ctrl: new THREE.Vector3(-1.8 + rnd() * 1.6, 0.6 + rnd() * 1.6, 1.2 + rnd() * 1.6),
      spin: new THREE.Vector3((rnd() - .5) * 6, (rnd() - .5) * 6, (rnd() - .5) * 4),
    };
  });

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  let progress = 0, origin = { x: innerWidth / 2, y: innerHeight * .6 };
  const start = new THREE.Vector3(), ray = new THREE.Vector3();

  function resize() {
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    render();
  }
  function render() {
    // where the photographed screen is, projected onto the z = 0 plane
    ray.set(origin.x / host.clientWidth * 2 - 1, -(origin.y / host.clientHeight) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
    start.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z);
    const pc = seg(progress, .14, .44);
    docs.forEach(o => {
      const t = clamp((pc - o.d) / .38, 0, 1);
      if (t <= 0 || t >= 1) { o.m.visible = false; return; }
      const k = ease(t), u = 1 - k;
      const ex = start.x * .4 + o.end.x, ey = start.y * .4 + o.end.y, ez = o.end.z;
      const cx = start.x + o.ctrl.x, cy = start.y + o.ctrl.y, cz = o.ctrl.z;
      o.m.position.set(u * u * start.x + 2 * u * k * cx + k * k * ex, u * u * start.y + 2 * u * k * cy + k * k * ey, 2 * u * k * cz + k * k * ez);
      o.m.rotation.set(o.spin.x * k, o.spin.y * k - 0.9 * (1 - k), o.spin.z * k);
      o.m.scale.setScalar(0.12 + k * o.big);
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
  window.Docs3D = { update(p, o) { progress = p; if (o) origin = o; render(); } };
}
