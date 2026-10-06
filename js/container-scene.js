import * as THREE from './vendor/three-0.180.0/three.module.min.js';
import { createContainerModel } from './container-geometry.js?v=20261005-2';

// The renderer is reused when changing models and only draws on interaction or resize.
export function createContainerScene(host, onUnavailable, initialModel, options = {}) {
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{antialias:true,alpha:false});
  if(!context)throw new Error('WebGL unavailable');
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,options.pixelRatioLimit || 1.7));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.setClearColor(0xeaf0f3);canvas.setAttribute('aria-hidden','true');host.appendChild(canvas);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,160);
  const direction=new THREE.Vector3(...(options.viewDirection || [.85,.60,1.18])).normalize();
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();
  const up=new THREE.Vector3().crossVectors(direction,right).normalize();
  const target=new THREE.Vector3();
  let current,model,spec,observer,frame=0,disposed=false,pointer=null,zoom=1,environment;
  const floorGeo=new THREE.PlaneGeometry(100,100);
  const floorMat=new THREE.ShadowMaterial({color:0x334a55,opacity:.22});
  const floor=new THREE.Mesh(floorGeo,floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.008;floor.receiveShadow=true;scene.add(floor);
  scene.add(new THREE.HemisphereLight(0xeaf4ff,0x8c9392,2.2));
  const key=new THREE.DirectionalLight(0xffefd9,3.2);key.position.set(5,10,8);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;
  key.shadow.normalBias=.025;key.shadow.bias=-.00008;scene.add(key);
  const fill=new THREE.DirectionalLight(0xd9efff,1.4);fill.position.set(-8,5,-7);scene.add(fill);
  function studio() {
    const room=new THREE.Scene();room.background=new THREE.Color(0xaab5bc);
    const g=new THREE.PlaneGeometry(12,8);
    const whites=new THREE.MeshBasicMaterial({color:0xffffff});
    for(const pos of[[0,5,8],[-8,4,-3],[5,7,-8]]){
      const panel=new THREE.Mesh(g,whites);panel.position.set(...pos);panel.lookAt(0,0,0);room.add(panel);
    }
    const pmrem=new THREE.PMREMGenerator(renderer);
    try {environment=pmrem.fromScene(room,.04,.1,100);scene.environment=environment.texture;}
    finally {g.dispose();whites.dispose();pmrem.dispose();}
  }
  function draw() {
    frame=0;if(disposed)return;
    try {renderer.render(scene,camera);host.dataset.rotation=model.rotation.y.toFixed(3);}
    catch (_) {onUnavailable();}
  }
  function render(){if(!frame&&!disposed)frame=requestAnimationFrame(draw);}
  function resize() {
    if(disposed||!model)return;
    const w=Math.max(host.clientWidth,1),h=Math.max(host.clientHeight,1);
    const fit=options.fitModel || spec;
    renderer.setSize(w,h,false);camera.aspect=w/h;target.set(0,fit.height*.48,0);
    const tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect;
    let distance=0;
    // Fit every horizontal rotation, so long 40-foot containers remain inside the frame.
    for(let angle=0;angle<Math.PI*2;angle+=Math.PI/12)for(const x of[-fit.length/2,fit.length/2])
      for(const z of[-fit.width/2,fit.width/2])for(const y of[0,fit.height]){
        const p=new THREE.Vector3(x*Math.cos(angle)+z*Math.sin(angle),y-target.y,-x*Math.sin(angle)+z*Math.cos(angle));
        distance=Math.max(distance,Math.abs(p.dot(right))/tanH+p.dot(direction),Math.abs(p.dot(up))/tanV+p.dot(direction));
      }
    camera.position.copy(target).addScaledVector(direction,distance*1.08*zoom);
    camera.lookAt(target);camera.updateProjectionMatrix();render();
  }
  function setModel(next) {
    // Build first: a failed replacement must not leak geometry or remove the current model.
    const built=createContainerModel(next);
    if(current){scene.remove(current.object);current.dispose();}
    current=built;model=built.object;spec=next;zoom=1;
    model.rotation.y=spec.kind==='reefer'?Math.PI:0;scene.add(model);
    host.dataset.model=spec.id;resize();
  }
  function turn(delta){model.rotation.y+=delta;render();}
  function reset(){model.rotation.y=spec.kind==='reefer'?Math.PI:0;zoom=1;resize();}
  function magnify(delta){zoom=THREE.MathUtils.clamp(zoom+delta,.65,1.35);resize();}
  function down(e){if(!e.isPrimary||e.button!==0)return;pointer={id:e.pointerId,x:e.clientX};host.setPointerCapture(e.pointerId);host.focus({preventScroll:true});}
  function move(e){if(pointer&&e.pointerId===pointer.id){turn((e.clientX-pointer.x)*.009);pointer.x=e.clientX;}}
  function release(e){if(!pointer||e.pointerId!==pointer.id)return;const id=pointer.id;pointer=null;if(host.hasPointerCapture(id))host.releasePointerCapture(id);}
  function keydown(e){
    if(!['ArrowLeft','ArrowRight','Home','+','=','-'].includes(e.key))return;e.preventDefault();
    if(e.key==='Home')reset();else if(e.key==='-'||e.key==='+'||e.key==='=')magnify(e.key==='-'?.1:-.1);
    else turn(e.key==='ArrowLeft'?-Math.PI/12:Math.PI/12);
  }
  function lost(e){e.preventDefault();if(!disposed)onUnavailable();}
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);
    if(observer)observer.disconnect();
    if(pointer){const id=pointer.id;pointer=null;if(host.hasPointerCapture(id))host.releasePointerCapture(id);}
    host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);
    host.removeEventListener('pointerup',release);host.removeEventListener('pointercancel',release);host.removeEventListener('lostpointercapture',release);host.removeEventListener('keydown',keydown);
    canvas.removeEventListener('webglcontextlost',lost);
    if(current)current.dispose();floorGeo.dispose();floorMat.dispose();if(environment)environment.dispose();
    if(key.shadow.map)key.shadow.map.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
    delete host.dataset.rotation;delete host.dataset.model;
  }
  try {
    studio();setModel(initialModel);
    observer=new ResizeObserver(resize);observer.observe(host);
    host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',release);
    host.addEventListener('pointercancel',release);host.addEventListener('lostpointercapture',release);host.addEventListener('keydown',keydown);
    canvas.addEventListener('webglcontextlost',lost);
    return {turn,reset,magnify,setModel,dispose};
  } catch(error) {dispose();throw error;}
}
