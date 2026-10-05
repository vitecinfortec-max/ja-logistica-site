import * as THREE from './vendor/three-0.180.0/three.module.min.js';

// External reference proportions, in metres. Details are representative, not a stock specification.
export function createContainerModel(spec) {
  const root = new THREE.Group();
  root.name = spec.id;
  const geometries = new Set(), materials = new Set(), textures = new Set();
  const L = spec.length, W = spec.width, H = spec.height;
  const reefer = spec.kind === 'reefer', open = spec.kind === 'open-top';
  const paintColor = reefer ? 0xe8e6dc : spec.kind === 'high-cube' ? 0x9b5936 : open ? 0x466c7d : 0x326779;
  const geo = g => { geometries.add(g); return g; };
  const mat = options => { const m = new THREE.MeshStandardMaterial(options); materials.add(m); return m; };
  const tex = t => { textures.add(t); return t; };
  function dispose() {
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    textures.forEach(t => t.dispose());
  }
  try {
    // Deterministic fine paint texture; generated locally, with no image download.
    const noise = new Uint8Array(64 * 64 * 4);
    let seed = 9187;
    for (let i = 0; i < noise.length; i += 4) {
      seed = (1664525 * seed + 1013904223) >>> 0;
      const v = 130 + (seed % 80);
      noise[i] = noise[i + 1] = noise[i + 2] = v; noise[i + 3] = 255;
    }
    const grain = tex(new THREE.DataTexture(noise, 64, 64));
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(5, 2); grain.needsUpdate = true;
    const paint = mat({color:paintColor, roughness:.56, metalness:.34, bumpMap:grain, bumpScale:.004, side:THREE.DoubleSide});
    const frame = mat({color:reefer ? 0x9ca7aa : new THREE.Color(paintColor).multiplyScalar(.74), roughness:.47, metalness:.55});
    const steel = mat({color:0xabb5b8, roughness:.31, metalness:.77});
    const rubber = mat({color:0x232e31, roughness:.86});
    const dark = mat({color:0x142227, roughness:.69, metalness:.28});
    const interior = mat({color:reefer ? 0xdadcd5 : 0x74807c, roughness:.68, metalness:.2, side:THREE.DoubleSide});
    const wood = mat({color:0x80745f, roughness:.95, metalness:0});
    const unitBox = geo(new THREE.BoxGeometry(1, 1, 1));
    const unitCylinder = geo(new THREE.CylinderGeometry(1, 1, 1, 12));
    const unitDisc = geo(new THREE.CircleGeometry(1, 20));
    function mesh(g, material, parent = root) {
      const m = new THREE.Mesh(g, material); parent.add(m); m.castShadow = true; m.receiveShadow = true; return m;
    }
    function box(w,h,d,x,y,z,material=paint,parent=root) {
      const m=mesh(unitBox,material,parent);m.scale.set(w,h,d);m.position.set(x,y,z);return m;
    }
    function rod(r,h,x,y,z,material=steel,axis='y',parent=root) {
      const m=mesh(unitCylinder,material,parent);m.scale.set(r,h,r);m.position.set(x,y,z);
      if(axis==='x')m.rotation.z=Math.PI/2; if(axis==='z')m.rotation.x=Math.PI/2; return m;
    }
    function hole(x,y,z,rx,ry,axis) {
      const m=mesh(unitDisc,dark);m.scale.set(rx,ry,1);m.position.set(x,y,z);
      if(axis==='y')m.rotation.x=-Math.PI/2;
      if(axis==='x')m.rotation.y=x<0?-Math.PI/2:Math.PI/2;
      if(axis==='z'&&z<0)m.rotation.y=Math.PI;
      m.castShadow=false;
    }
    // One folded sheet per wall instead of hundreds of separate ribs.
    function corrugated(span,height,x,y,z,rotation=0,material=paint,depth=.035,pitch=.27) {
      const points=[],v=[],indices=[];
      const count=Math.max(2,Math.round(span/pitch)),step=span/count;
      const profile=[[0,0],[.18,0],[.34,depth],[.68,depth],[.84,0],[1,0]];
      for(let n=0;n<count;n++) for(let i=0;i<profile.length-(n===count-1?0:1);i++)
        points.push([-span/2+(n+profile[i][0])*step,profile[i][1]]);
      for(const [u,d] of points) v.push(u,0,d,u,height,d);
      for(let i=0;i<points.length-1;i++){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
      const g=geo(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(indices);g.computeVertexNormals();
      const m=mesh(g,material);m.position.set(x,y,z);m.rotation.y=rotation;return m;
    }
    // Soft contact shadow grounds the model without downloading a texture.
    const contactCanvas=document.createElement('canvas');contactCanvas.width=256;contactCanvas.height=128;
    const contactContext=contactCanvas.getContext('2d');
    if(contactContext){
      contactContext.filter='blur(12px)';contactContext.fillStyle='rgba(18,34,39,.38)';
      contactContext.fillRect(21,18,214,92);
      const contactTexture=tex(new THREE.CanvasTexture(contactCanvas));
      const contactMaterial=new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false});
      materials.add(contactMaterial);
      const contact=new THREE.Mesh(geo(new THREE.PlaneGeometry(L*1.16,W*1.42)),contactMaterial);
      contact.rotation.x=-Math.PI/2;contact.position.y=-.003;root.add(contact);
    }
    // Undercarriage, wooden / aluminium floor and structural crossmembers.
    box(L-.12,.12,W-.16,0,.11,0,frame);
    for(let x=-L/2+.35;x<L/2-.2;x+=.65)box(.075,.12,W-.22,x,.08,0,frame);
    box(L-.26,.07,W-.2,0,.215,0,reefer?steel:wood);
    for(let x=-L/2+.2;x<L/2-.2;x+=.6)box(.009,.002,W-.25,x,.252,0,rubber);
    if(reefer)for(let z=-W/2+.2;z<W/2-.15;z+=.11)box(L-.3,.018,.04,0,.26,z,steel);
    // Corner posts and rails stay within the nominal external dimensions.
    for(const z of[-W/2+.07,W/2-.07]){
      for(const y of[.09,H-.065])box(L-.14,.13,.14,0,y,z,frame);
      for(const x of[-L/2+.075,L/2-.075]){
        box(.15,H-.22,.15,x,H/2,z,frame);
        for(const y of[.085,H-.085]){
          box(.17,.17,.16,x,y,z,steel);
          hole(x,y,z+(z>0?.081:-.081),.042,.022,'z');
          hole(x+(x>0?.086:-.086),y,z,.037,.023,'x');
          if(y>1)hole(x,H+.001,z,.044,.026,'y');
        }
      }
    }
    for(const x of[-L/2+.065,L/2-.065]){
      box(.13,.13,W-.14,x,.09,0,frame);
      box(.13,.13,W-.14,x,H-.065,0,frame);
    }
    const wallStart=reefer?.7:.16,wallLength=L-wallStart-.16;
    const wallX=(wallStart-.16)/2;
    for(const sign of[-1,1]){
      corrugated(wallLength,H-.34,wallX,.2,sign*(W/2-.047),sign>0?0:Math.PI,paint,reefer?.013:.034,reefer?.145:.27);
      if(reefer)box(wallLength,H-.37,.055,wallX,H/2,sign*(W/2-.11),interior);
      // Fine seams and rivets on insulated reefer panels.
      if(reefer)for(let x=-L/2+.78;x<L/2-.15;x+=.8){
        box(.012,H-.4,.014,x,H/2,sign*(W/2-.025),steel);
      }
    }
    if(!reefer)corrugated(W-.29,H-.34,-L/2+.045,.2,0,-Math.PI/2);
    else box(.085,H-.29,W-.23,-L/2+.64,H/2,0,interior);
    if(!open){
      box(L-.2,.045,W-.22,0,H-.085,0,paint);
      for(let x=-L/2+.28;x<L/2-.2;x+=.29)box(.10,.019,W-.31,x,H-.05,0,paint);
    }else{
      // Visible hollow interior, removable roof bows and rolled tarpaulin.
      const bowCount=spec.feet===20?4:8;
      for(let i=0;i<bowCount;i++){
        const x=-L/2+.6+i*(L-1.2)/(bowCount-1);
        const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,H-.07,-W/2+.10),new THREE.Vector3(x,H-.005,0),new THREE.Vector3(x,H-.07,W/2-.10)]);
        mesh(geo(new THREE.TubeGeometry(curve,12,.018,6,false)),steel);
        for(const z of[-W/2+.045,W/2-.045])box(.08,.055,.1,x,H-.09,z,steel);
      }
      const canvas=mat({color:0x738278,roughness:.99,bumpMap:grain,bumpScale:.007});
      rod(.085,W-.28,-L/2+.3,H-.16,0,canvas,'z');
      for(const z of[-.8,0,.8])rod(.088,.055,-L/2+.3,H-.16,z,dark,'z');
    }
    // Double cargo doors with gaskets, four locking bars, hinges and handles.
    const doorH=H-.31,doorW=(W-.25)/2;
    for(const sign of[-1,1]){
      const z=sign*(doorW/2+.008),x=L/2-.048;
      box(.052,doorH,doorW,x,H/2,z,rubber);
      if(reefer)box(.062,doorH-.035,doorW-.035,x+.025,H/2,z,paint);
      else corrugated(doorW-.04,doorH-.035,x,.173,z,Math.PI/2,paint,.022,.21);
      for(const y of[.18,H-.18])box(.025,.045,doorW-.025,x+.04,y,z,frame);
      for(const edge of[-1,1])box(.027,doorH-.035,.028,x+.04,H/2,z+edge*(doorW/2-.017),frame);
      for(const offset of[-.28,.28]){
        const barZ=z+offset;
        rod(.018,H-.4,L/2+.012,H/2,barZ,steel);
        for(const y of[.35,.83,H-.75,H-.33]){
          box(.047,.08,.065,L/2+.012,y,barZ,steel);
          rod(.012,.027,L/2+.047,y,barZ,dark,'x');
        }
        rod(.012,.20,L/2+.055,.97,barZ+.075,steel,'z');
        box(.027,.085,.06,L/2+.07,.96,barZ+.16,dark);
        for(const y of[.19,H-.19])box(.045,.045,.09,L/2+.022,y,barZ,steel);
      }
      for(const y of[.45,H/2,H-.43]){
        box(.045,.065,.18,L/2+.009,y,sign*(W/2-.17),steel);
        rod(.026,.105,L/2+.029,y,sign*(W/2-.1),steel);
      }
    }
    // Forklift pockets on the 20-foot chassis.
    if(spec.feet===20)for(const x of[-1.05,1.05])for(const sign of[-1,1]){
      box(.34,.105,.008,x,.10,sign*(W/2+.002),dark);
      box(.36,.022,.017,x,.035,sign*(W/2+.006),steel);
    }
    // High-cube corner markings (no serial numbers, certificates or brand claims).
    if(H>2.8){
      const yellow=mat({color:0xc99739,roughness:.65});
      for(const x of[-L/2+.23,L/2-.23])for(const sign of[-1,1]){
        box(.21,.13,.013,x,H-.24,sign*(W/2-.005),yellow);
        for(const dx of[-.06,.02,.10]){
          const stripe=box(.035,.145,.015,x+dx,H-.24,sign*W/2,dark);stripe.rotation.z=-.35;
        }
      }
    }
    if(reefer){
      // Refrigeration machinery occupies the opposite end from the cargo doors.
      const unitX=-L/2+.17;
      box(.42,H-.34,W-.27,unitX,H/2,0,dark);
      const housing=mat({color:0xc6cecb,roughness:.48,metalness:.5});
      box(.035,H-.37,.075,-L/2-.004,H/2,-W/2+.16,housing);
      box(.035,H-.37,.075,-L/2-.004,H/2,W/2-.16,housing);
      box(.035,.10,W-.25,-L/2-.004,H-.2,0,housing);
      box(.07,1.03,1.77,-L/2-.006,.9,0,rubber);
      // Finned condenser, protective grille and control console.
      for(let y=.43;y<1.37;y+=.045)box(.024,.012,1.71,-L/2-.049,y,0,steel);
      for(const z of[-.82,-.4,0,.4,.82])box(.03,.97,.013,-L/2-.063,.9,z,dark);
      box(.07,.38,.42,-L/2-.04,1.65,-.72,housing);
      const lcd=mat({color:0x264f48,emissive:0x0b312a,emissiveIntensity:.15,roughness:.3});
      box(.007,.11,.27,-L/2-.078,1.70,-.72,lcd);
      for(const z of[-.81,-.72,-.63])rod(.018,.01,-L/2-.085,1.55,z,rubber,'x');
      const fanGeo=geo(new THREE.TorusGeometry(.29,.014,6,40));
      const fanShape=new THREE.Shape();fanShape.moveTo(.035,0);fanShape.bezierCurveTo(.10,.06,.27,.06,.25,.17);fanShape.bezierCurveTo(.14,.23,.065,.11,.035,0);
      const bladeGeo=geo(new THREE.ShapeGeometry(fanShape));
      const bladeMat=mat({color:0x697b7f,roughness:.45,metalness:.6,side:THREE.DoubleSide});
      for(const z of[-.51,.51]){
        const fan=new THREE.Group();fan.position.set(-L/2-.045,H-.68,z);fan.rotation.y=-Math.PI/2;root.add(fan);
        const disk=mesh(unitDisc,rubber,fan);disk.scale.set(.315,.315,1);
        for(let n=0;n<6;n++){const b=mesh(bladeGeo,bladeMat,fan);b.rotation.z=n*Math.PI/3;b.position.z=.015;}
        const ring=mesh(fanGeo,steel,fan);ring.position.z=.047;
        const innerRing=mesh(fanGeo,steel,fan);innerRing.scale.setScalar(.64);innerRing.position.z=.05;
        for(let n=0;n<4;n++){const guard=box(.018,.6,.017,0,0,.057,steel,fan);guard.rotation.z=n*Math.PI/4;}
        const hub=mesh(unitDisc,housing,fan);hub.scale.set(.065,.065,1);hub.position.z=.07;
      }
      const copper=mat({color:0x9b7155,roughness:.48,metalness:.55});
      for(const z of[-.74,.66]){
        rod(.075,.24,-L/2+.015,.31,z,dark);
        rod(.013,.31,-L/2-.03,.30,z+.07,copper,'z');
      }
    }
    root.userData={id:spec.id,length:L,width:W,height:H,kind:spec.kind,roofOpen:open,refrigerated:reefer};
    return {object:root,dispose};
  } catch(error) {dispose();throw error;}
}
