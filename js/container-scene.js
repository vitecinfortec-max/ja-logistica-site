import * as THREE from './vendor/three-0.180.0/three.module.min.js';

// Schematic geometry, not a stock item or dimensional specification.
// Render on demand: there is no animation loop while the visitor is idle.
export function createContainerScene(host, onUnavailable) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', { antialias: true, alpha: false });
  if (!context) throw new Error('WebGL unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xeaf0f3);
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 70);
  const target = new THREE.Vector3(0, 1.1, 0);
  const model = new THREE.Group();
  scene.add(model);
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x2b7181, roughness: .58, metalness: .32 }),
    new THREE.MeshStandardMaterial({ color: 0x185064, roughness: .62, metalness: .35 }),
    new THREE.MeshStandardMaterial({ color: 0x95a6ad, roughness: .4, metalness: .7 }),
    new THREE.MeshStandardMaterial({ color: 0x163c49, roughness: .7, metalness: .2 }),
    new THREE.ShadowMaterial({ color: 0x35515c, opacity: .18 })
  ];
  const geometries = new Set();
  function box(w, h, d, x, y, z, material = 0, parent = model) {
    const geo = new THREE.BoxGeometry(w, h, d);
    geometries.add(geo);
    const mesh = new THREE.Mesh(geo, materials[material]);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  const body = box(6.4, 2.46, 2.45, 0, 1.38, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  // Corrugations, perimeter rails, end doors and locking bars.
  for (let x = -2.95; x <= 2.96; x += .23) {
    box(.085, 2.15, .065, x, 1.38, 1.252);
    box(.085, 2.15, .065, x, 1.38, -1.252);
    box(.085, .035, 2.12, x, 2.626, 0, 1);
  }
  for (const z of [-1.26, 1.26]) {
    box(6.55, .13, .14, 0, .18, z, 1);
    box(6.55, .13, .14, 0, 2.64, z, 1);
    for (const x of [-3.2, 3.2]) {
      box(.15, 2.6, .15, x, 1.41, z, 1);
      for (const y of [.18, 2.64]) box(.21, .18, .2, x, y, z, 2);
    }
  }
  for (const x of [-3.21, 3.21]) {
    box(.14, .13, 2.5, x, .18, 0, 1);
    box(.14, .13, 2.5, x, 2.64, 0, 1);
  }
  for (const z of [-.615, .615]) {
    box(.055, 2.19, 1.18, 3.235, 1.39, z, 1);
    box(.04, 2.07, 1.08, 3.27, 1.39, z, 0);
    for (const offset of [-.27, .27]) {
      box(.05, 1.99, .042, 3.31, 1.4, z + offset, 2);
      box(.055, .038, .19, 3.35, 1.04, z + offset + .06, 2);
      for (const y of [.6, 2.14]) box(.08, .09, .085, 3.33, y, z + offset, 2);
    }
    for (const y of [.52, 1.42, 2.25]) box(.08, .09, .17, 3.31, y, z > 0 ? 1.19 : -1.19, 2);
  }
  // A small neutral plate intentionally contains no branding, dimensions or stock claims.
  box(.05, .19, .27, 3.315, .51, -.36, 2);
  for (let z = -.95; z <= .96; z += .23) box(.06, 2.15, .085, -3.24, 1.38, z);
  const floorGeo = new THREE.PlaneGeometry(40, 40);
  geometries.add(floorGeo);
  const floor = new THREE.Mesh(floorGeo, materials[4]);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = .02;
  floor.receiveShadow = true;
  scene.add(floor);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8096a0, 2.5));
  const key = new THREE.DirectionalLight(0xffffff, 3.4);
  key.position.set(6, 10, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  key.shadow.normalBias = .04;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffd6a8, 1.3);
  fill.position.set(-5, 4, -6);
  scene.add(fill);
  let frame = 0, disposed = false, pointer = null;
  function draw() {
    frame = 0;
    if (disposed) return;
    renderer.render(scene, camera);
    host.dataset.rotation = model.rotation.y.toFixed(3);
  }
  function render() { if (!frame && !disposed) frame = requestAnimationFrame(draw); }
  function resize() {
    if (disposed) return;
    const w = Math.max(host.clientWidth, 1), h = Math.max(host.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const distance = camera.aspect < 1.15 ? 14.4 / camera.aspect : 12.5;
    camera.position.set(distance * .7, distance * .48, distance * .78);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    render();
  }
  function turn(delta) { model.rotation.y += delta; render(); }
  function reset() { model.rotation.y = 0; render(); }
  function down(e) {
    if (!e.isPrimary || e.button !== 0) return;
    pointer = { id: e.pointerId, x: e.clientX };
    host.setPointerCapture(e.pointerId);
    host.focus({ preventScroll: true });
  }
  function move(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    turn((e.clientX - pointer.x) * .009);
    pointer.x = e.clientX;
  }
  function up(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
    pointer = null;
  }
  function keydown(e) {
    if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') reset(); else turn(e.key === 'ArrowLeft' ? -Math.PI / 12 : Math.PI / 12);
  }
  function lost(e) { e.preventDefault(); if (!disposed) onUnavailable(); }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  host.addEventListener('pointerdown', down);
  host.addEventListener('pointermove', move);
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', up);
  host.addEventListener('lostpointercapture', up);
  host.addEventListener('keydown', keydown);
  canvas.addEventListener('webglcontextlost', lost);
  resize();
  return { turn, reset, dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    if (pointer && host.hasPointerCapture(pointer.id)) host.releasePointerCapture(pointer.id);
    host.removeEventListener('pointerdown', down); host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerup', up); host.removeEventListener('pointercancel', up);
    host.removeEventListener('lostpointercapture', up); host.removeEventListener('keydown', keydown);
    canvas.removeEventListener('webglcontextlost', lost);
    geometries.forEach(geo => geo.dispose());
    materials.forEach(material => material.dispose());
    if (key.shadow.map) key.shadow.map.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    delete host.dataset.rotation;
  }};
}
