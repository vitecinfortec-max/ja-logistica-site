// The catalogue and scene are shared with the existing full-size viewer.
export function mountContainerShowcase(root, models, sceneURL) {
  const host=root.querySelector('.showcase-viewport');
  const replay=root.querySelector('[data-showcase-replay]');
  const hint=root.querySelector('[data-showcase-hint]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const model=models[0];
  let scene=null,frame=0,ticket=0,visible=false,loading=false,failed=false,animated=false,disposed=false,rotation=0;
  let appearance=null;
  root.querySelector('[data-showcase-name]').textContent=model.name+' · '+model.feet+' pés';
  host.setAttribute('aria-label',model.name+' de '+model.feet+' pés. Arraste ou use as setas para girar. Home restaura a vista.');
  function allowed(){return visible&&!document.hidden&&!document.querySelector('dialog[open]')&&!disposed;}
  function stop(){cancelAnimationFrame(frame);frame=0;if(appearance){appearance.cancel();appearance=null;}root.dataset.animating='false';}
  function remember(){if(scene)rotation=Number(host.dataset.rotation)||0;}
  function release(){
    ++ticket;loading=false;stop();remember();
    if(scene){scene.dispose();scene=null;}
    host.replaceChildren();host.tabIndex=-1;root.dataset.ready='false';replay.hidden=true;
    hint.textContent='Visualização ilustrativa do modelo.';
  }
  function unavailable(){failed=true;release();root.dataset.state='unavailable';}
  function buttonLabel(){replay.querySelector('span').textContent=reduced.matches?'Restaurar vista':'Rever animação';}
  function runIntro(){
    stop();if(!scene||!allowed())return;
    scene.reset();rotation=0;
    if(reduced.matches)return;
    animated=true;root.dataset.animating='true';
    const start=-.75,end=-.12,duration=2600;
    scene.turn(start);let previous=start,startTime=null;
    if(host.animate)appearance=host.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
    function tick(now){
      if(!scene||!allowed()){stop();return;}
      if(startTime===null)startTime=now;
      const t=Math.min(1,(now-startTime)/duration),ease=1-Math.pow(1-t,4);
      const angle=start+(end-start)*ease;scene.turn(angle-previous);previous=angle;rotation=angle;
      if(t<1)frame=requestAnimationFrame(tick);else{frame=0;root.dataset.animating='false';}
    }
    frame=requestAnimationFrame(tick);
  }
  async function load(){
    if(scene||loading||failed||!allowed())return;
    loading=true;const id=++ticket;let timeout;
    root.dataset.state='loading';
    try{
      const module=await Promise.race([import(sceneURL),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Timeout')),15000);})]);
      if(id!==ticket||!allowed())return;
      scene=module.createContainerScene(host,unavailable,model,{pixelRatioLimit:1.25,viewDirection:[.95,.48,1.25]});
      if(rotation)scene.turn(rotation);
      host.tabIndex=0;root.dataset.ready='true';root.dataset.state='ready';replay.hidden=false;buttonLabel();
      hint.textContent='Arraste para girar o contêiner.';
      if(!animated&&!reduced.matches)runIntro();
    }catch(_){if(id===ticket)unavailable();}
    finally{clearTimeout(timeout);if(id===ticket)loading=false;}
  }
  function sync(){if(allowed())load();else if(scene||loading)release();}
  function onVisibility(){sync();}
  function interaction(){stop();animated=true;}
  host.addEventListener('pointerdown',interaction);
  host.addEventListener('keydown',interaction);
  host.addEventListener('focusin',interaction);
  replay.addEventListener('click',runIntro);
  reduced.addEventListener('change',()=>{buttonLabel();if(reduced.matches){stop();if(scene){scene.reset();rotation=0;}}});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;sync();},{threshold:[0,.15]});
  observer.observe(root);
  document.addEventListener('visibilitychange',onVisibility);
  document.addEventListener('gallery:visibility',onVisibility);
  // Page cache restoration should resume a static view, never an old animation loop.
  window.addEventListener('pagehide',()=>{release();});
  window.addEventListener('pageshow',sync);
  return {dispose(){disposed=true;release();observer.disconnect();document.removeEventListener('visibilitychange',onVisibility);document.removeEventListener('gallery:visibility',onVisibility);}};
}
