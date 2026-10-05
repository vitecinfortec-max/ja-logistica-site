(function () {
  'use strict';
  var triggers=Array.from(document.querySelectorAll('[data-container-preview]'));
  if(!triggers.length||typeof HTMLDialogElement==='undefined'||!HTMLDialogElement.prototype.showModal)return;
  // External nominal dimensions. See docs/container-models.md for reference sources.
  var models=[
    {id:'dry-20',name:'Dry Box',feet:20,kind:'dry',length:6.058,width:2.438,height:2.591,description:'Estrutura fechada em aço, com teto rígido e portas duplas para carga seca.'},
    {id:'dry-40',name:'Dry Box',feet:40,kind:'dry',length:12.192,width:2.438,height:2.591,description:'Versão de 40 pés para carga seca, com maior comprimento e teto rígido.'},
    {id:'hc-40',name:'High Cube (HC)',feet:40,kind:'high-cube',length:12.192,width:2.438,height:2.896,description:'Estrutura fechada com altura externa de referência de 2,90 m, superior à do Dry Box.'},
    {id:'open-top-20',name:'Open Top',feet:20,kind:'open-top',length:6.058,width:2.438,height:2.591,description:'Abertura superior para carregamento pelo teto. Exibido com a lona recolhida e os arcos aparentes.'},
    {id:'open-top-40',name:'Open Top',feet:40,kind:'open-top',length:12.192,width:2.438,height:2.591,description:'Versão de 40 pés com abertura superior, lona removível e estrutura interna visível.'},
    {id:'reefer-hc-20',name:'Reefer (HC)',feet:20,kind:'reefer',length:6.058,width:2.438,height:2.896,description:'Modelo refrigerado High Cube, com painéis isolados e unidade de refrigeração na extremidade.'},
    {id:'reefer-hc-40',name:'Reefer (HC)',feet:40,kind:'reefer',length:12.192,width:2.438,height:2.896,description:'Versão refrigerada High Cube de 40 pés, com painéis isolados e conjunto de refrigeração.'}
  ];
  var dialog,viewport,status,controls,opener,scene,salesURL,ticket=0,selected=models[0];
  var moduleURL=new URL('container-scene.js?v=20261005-2',document.currentScript.src).href;
  function notifyVisibility(){document.dispatchEvent(new Event('gallery:visibility'));}
  function label(m){return m.name+' · '+m.feet+' pés';}
  function metres(value){return value.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' m';}
  function updateInfo(){
    dialog.querySelector('#containerModelName').textContent=label(selected);
    dialog.querySelector('#containerModelDescription').textContent=selected.description;
    dialog.querySelector('.container-model-select').value=selected.id;
    dialog.querySelectorAll('[data-container-model]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.containerModel===selected.id));});
    ['length','width','height'].forEach(function(key){dialog.querySelector('[data-model-dimension="'+key+'"]').textContent=metres(selected[key]);});
    var url=new URL(salesURL);
    url.searchParams.set('text','Olá! Vim pelo site da J.A Logística e gostaria de consultar a disponibilidade e as condições de compra do contêiner '+selected.name+' de '+selected.feet+' pés no terminal.');
    var link=dialog.querySelector('.container-viewer-footer a');
    link.href=url.href;link.setAttribute('aria-label','Consultar '+label(selected)+' pelo WhatsApp');
    viewport.setAttribute('aria-label',label(selected)+'. Use as setas para girar, mais e menos para aproximar ou afastar e Home para a vista inicial.');
  }
  function choose(id){
    var next=models.find(function(m){return m.id===id;});if(!next)return;
    selected=next;updateInfo();
    if(scene){try{scene.setModel(selected);}catch(_){unavailable();}}
  }
  function createDialog(){
    dialog=document.createElement('dialog');dialog.className='container-viewer';dialog.id='containerViewer';
    dialog.setAttribute('aria-labelledby','containerViewerTitle');
    dialog.innerHTML='<div class="container-viewer-head"><div><p class="eyebrow">Explore em 3D</p><h2 id="containerViewerTitle">Modelos de contêineres</h2></div><button type="button" class="container-viewer-close" autofocus aria-label="Fechar visualização 3D">Fechar <span aria-hidden="true">×</span></button></div>'+
      '<div class="container-mobile-picker"><label for="containerModelSelect">Escolha o modelo</label><select id="containerModelSelect" class="container-model-select"></select></div>'+
      '<div class="container-viewer-layout"><div class="container-viewer-main"><div class="container-viewer-stage"><span class="container-viewer-badge" aria-hidden="true">Visualização 3D · 360°</span><div class="container-viewer-viewport" tabindex="-1" role="group" aria-describedby="containerViewerHint"></div><p class="container-viewer-status" role="status">Carregando visualização…</p></div>'+
      '<div class="container-viewer-tools" hidden><button type="button" data-viewer-turn="-1" aria-label="Girar contêiner para a esquerda">↶ Girar</button><button type="button" data-viewer-reset>Vista inicial</button><button type="button" data-viewer-turn="1" aria-label="Girar contêiner para a direita">Girar ↷</button><span class="container-zoom-controls"><button type="button" data-viewer-zoom=".1" aria-label="Afastar contêiner">−</button><button type="button" data-viewer-zoom="-.1" aria-label="Aproximar contêiner">+</button></span><p id="containerViewerHint" class="container-viewer-hint">Arraste para girar. Use + e − para ver os detalhes.</p></div>'+
      '<section class="container-model-info" aria-labelledby="containerModelName"><h3 id="containerModelName" aria-live="polite" aria-atomic="true"></h3><p id="containerModelDescription"></p><dl class="container-model-dimensions"><div><dt>Comprimento</dt><dd data-model-dimension="length"></dd></div><div><dt>Largura</dt><dd data-model-dimension="width"></dd></div><div><dt>Altura</dt><dd data-model-dimension="height"></dd></div></dl><p class="container-model-reference">Medidas externas de referência.</p></section></div>'+
      '<aside class="container-model-catalog" aria-label="Escolha o modelo"><p class="container-catalog-heading">Escolha o modelo <span>7 opções</span></p><div class="container-model-options"></div></aside></div>'+
      '<div class="container-viewer-footer"><p>Modelos ilustrativos. Acabamento e especificações variam conforme a unidade. Consulte condições e disponibilidade.</p><a class="container-sales-whatsapp" target="_blank" rel="noopener">Consultar este modelo ↗</a></div>';
    document.body.appendChild(dialog);
    viewport=dialog.querySelector('.container-viewer-viewport');status=dialog.querySelector('.container-viewer-status');controls=dialog.querySelector('.container-viewer-tools');
    var picker=dialog.querySelector('select'),options=dialog.querySelector('.container-model-options');
    models.forEach(function(m){
      var option=document.createElement('option');option.value=m.id;option.textContent=label(m);picker.appendChild(option);
      var button=document.createElement('button');button.type='button';button.dataset.containerModel=m.id;button.className='container-model-option';
      var name=document.createElement('span');name.textContent=m.name;
      var size=document.createElement('strong');size.textContent=m.feet+' pés';
      button.append(name,size);button.addEventListener('click',function(){choose(m.id);});options.appendChild(button);
    });
    picker.addEventListener('change',function(){choose(picker.value);});
    dialog.querySelector('.container-viewer-close').addEventListener('click',function(){dialog.close();});
    dialog.querySelectorAll('[data-viewer-turn]').forEach(function(button){button.addEventListener('click',function(){if(scene)scene.turn(Number(button.dataset.viewerTurn)*Math.PI/6);});});
    dialog.querySelectorAll('[data-viewer-zoom]').forEach(function(button){button.addEventListener('click',function(){if(scene)scene.magnify(Number(button.dataset.viewerZoom));});});
    dialog.querySelector('[data-viewer-reset]').addEventListener('click',function(){if(scene)scene.reset();});
    dialog.addEventListener('click',function(event){if(event.target!==dialog)return;var r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
    dialog.addEventListener('close',function(){
      ++ticket;if(scene){scene.dispose();scene=null;}viewport.replaceChildren();document.documentElement.classList.remove('container-modal-open');notifyVisibility();
      if(opener)opener.focus({preventScroll:true});
    });
  }
  function unavailable(){
    if(scene){scene.dispose();scene=null;}viewport.replaceChildren();viewport.tabIndex=-1;status.hidden=false;
    status.textContent='A visualização 3D não está disponível neste momento. Escolha o modelo e consulte nosso atendimento pelo WhatsApp.';
    controls.hidden=true;
  }
  triggers.forEach(function(trigger){
    trigger.hidden=false;
    trigger.addEventListener('click',async function(){
      if(!dialog)createDialog();opener=trigger;salesURL=trigger.closest('.container-sales').querySelector('.container-sales-whatsapp').href;
      updateInfo();dialog.showModal();document.documentElement.classList.add('container-modal-open');notifyVisibility();
      status.hidden=false;status.textContent='Carregando visualização…';controls.hidden=true;viewport.tabIndex=-1;
      var id=++ticket,timeout;
      try{
        var module=await Promise.race([import(moduleURL),new Promise(function(_,reject){timeout=setTimeout(function(){reject(new Error('Load timeout'));},15000);})]);
        if(id!==ticket||!dialog.open)return;
        scene=module.createContainerScene(viewport,unavailable,selected);viewport.tabIndex=0;status.hidden=true;controls.hidden=false;
      }catch(_){if(id===ticket&&dialog.open)unavailable();}finally{clearTimeout(timeout);}
    });
  });
})();
