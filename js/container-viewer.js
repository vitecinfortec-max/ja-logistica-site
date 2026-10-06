(function () {
  'use strict';
  var triggers=Array.from(document.querySelectorAll('[data-container-preview], [data-container-compare]'));
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
  var mode='single',compareModels=[models[0],models[2]],compareScenes=[null,null],compareCards=[];
  var fitModel={length:12.192,width:2.438,height:2.896};
  var families={
    dry:{roof:'Rígido e fechado',cooling:'Sem refrigeração',use:'Carga seca de uso geral'},
    'high-cube':{roof:'Rígido e fechado',cooling:'Sem refrigeração',use:'Carga seca que exige maior altura'},
    'open-top':{roof:'Aberto, com lona removível',cooling:'Sem refrigeração',use:'Cargas com carregamento pela abertura superior'},
    reefer:{roof:'Rígido, com isolamento térmico',cooling:'Unidade de refrigeração',use:'Cargas que precisam de controle de temperatura'}
  };
  var compareFields=[
    {key:'length',label:'Comprimento',difference:'comprimento'},
    {key:'width',label:'Largura',difference:'largura'},
    {key:'height',label:'Altura externa',difference:'altura'},
    {key:'roof',label:'Tipo de teto',difference:'teto'},
    {key:'cooling',label:'Refrigeração',difference:'refrigeração'},
    {key:'use',label:'Uso comum',difference:'uso comum'}
  ];
  var moduleURL=new URL('container-scene.js?v=20261006-compare1',document.currentScript.src).href;
  function notifyVisibility(){document.dispatchEvent(new Event('gallery:visibility'));}
  function label(m){return m.name+' · '+m.feet+' pés';}
  function metres(value){return value.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+' m';}
  function updateInfo(){
    dialog.querySelector('#containerModelName').textContent=label(selected);
    dialog.querySelector('#containerModelDescription').textContent=selected.description;
    dialog.querySelector('.container-model-select').value=selected.id;
    dialog.querySelectorAll('[data-container-model]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.containerModel===selected.id));});
    ['length','width','height'].forEach(function(key){dialog.querySelector('[data-model-dimension="'+key+'"]').textContent=metres(selected[key]);});
    setInquiry(dialog.querySelector('.container-viewer-footer a'),selected);
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
    createComparison();
    var picker=dialog.querySelector('.container-model-select'),options=dialog.querySelector('.container-model-options');
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
      ++ticket;disposeScenes();document.documentElement.classList.remove('container-modal-open');notifyVisibility();
      if(opener)opener.focus({preventScroll:true});
    });
  }
  function unavailable(){
    if(scene){scene.dispose();scene=null;}viewport.replaceChildren();viewport.tabIndex=-1;status.hidden=false;
    status.textContent='A visualização 3D não está disponível neste momento. Escolha o modelo e consulte nosso atendimento pelo WhatsApp.';
    controls.hidden=true;
  }
  function setInquiry(link,model){
    var url=new URL(salesURL);
    url.searchParams.set('text','Olá! Vim pelo site da J.A Logística e gostaria de consultar a disponibilidade e as condições de compra do contêiner '+model.name+' de '+model.feet+' pés no terminal.');
    link.href=url.href;link.setAttribute('aria-label','Consultar '+label(model)+' pelo WhatsApp');
  }
  function comparisonValue(model,key){
    return ['length','width','height'].includes(key)?metres(model[key]):families[model.kind][key];
  }
  function updateComparison(){
    var differences=compareFields.filter(function(field){return comparisonValue(compareModels[0],field.key)!==comparisonValue(compareModels[1],field.key);});
    compareCards.forEach(function(card,index){
      var model=compareModels[index],picker=card.querySelector('select');
      picker.value=model.id;
      Array.from(picker.options).forEach(function(option){option.disabled=option.value===compareModels[1-index].id;});
      card.setAttribute('aria-label',label(model)+' — '+(index===0?'primeiro':'segundo')+' modelo da comparação');
      card.querySelector('.container-viewer-viewport').setAttribute('aria-label',label(model)+'. Arraste ou use as setas para girar. Mais e menos ajustam o zoom; Home restaura a vista inicial.');
      card.querySelectorAll('[data-compare-field]').forEach(function(row){
        var key=row.dataset.compareField;
        row.querySelector('dd').textContent=comparisonValue(model,key);
        row.classList.toggle('is-different',differences.some(function(field){return field.key===key;}));
      });
      setInquiry(card.querySelector('.container-sales-whatsapp'),model);
    });
    var names=differences.map(function(field){return field.difference;});
    var summary=names.length>1?names.slice(0,-1).join(', ')+' e '+names[names.length-1]:names[0];
    dialog.querySelector('.container-compare-summary').textContent='Diferenças destacadas: '+summary+'.';
  }
  function chooseComparison(index,id){
    var next=models.find(function(model){return model.id===id;});
    if(!next||next.id===compareModels[1-index].id){updateComparison();return;}
    compareModels[index]=next;updateComparison();
    if(compareScenes[index]){try{compareScenes[index].setModel(next);}catch(_){comparisonUnavailable(index);}}
  }
  function createComparison(){
    var single=document.createElement('div');
    single.id='containerSinglePanel';single.className='container-single-panel';
    single.setAttribute('role','tabpanel');single.setAttribute('aria-labelledby','containerSingleTab');
    while(dialog.children.length>1)single.appendChild(dialog.children[1]);
    dialog.appendChild(single);
    var tabs=document.createElement('div');
    tabs.className='container-mode-switch';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Modo de visualização dos contêineres');
    tabs.innerHTML='<button id="containerSingleTab" type="button" role="tab" aria-selected="true" aria-controls="containerSinglePanel" data-container-mode="single">Explorar modelo</button><button id="containerCompareTab" type="button" role="tab" tabindex="-1" aria-selected="false" aria-controls="containerComparePanel" data-container-mode="compare">Comparar modelos <span aria-hidden="true">2</span></button>';
    dialog.insertBefore(tabs,single);
    var panel=document.createElement('section');
    panel.id='containerComparePanel';panel.className='container-compare-panel';panel.hidden=true;
    panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','containerCompareTab');
    panel.innerHTML='<div class="container-compare-intro"><p>Escolha dois modelos e veja o que muda entre eles.</p><p class="container-compare-summary" role="status" aria-live="polite" aria-atomic="true"></p><p class="container-compare-scale">Medidas externas de referência. Visualizações na mesma escala inicial.</p></div><div class="container-compare-grid"></div><p class="container-compare-note">Modelos ilustrativos. Acabamento e especificações variam conforme a unidade. Consulte condições e disponibilidade.</p>';
    dialog.appendChild(panel);
    compareModels.forEach(function(_,index){
      var card=document.createElement('article');
      card.className='container-compare-card';card.dataset.compareSlot=index;
      card.innerHTML='<div class="container-compare-picker"><label for="containerCompareSelect'+index+'"><span aria-hidden="true">'+(index===0?'A':'B')+'</span>'+(index===0?'Primeiro modelo':'Segundo modelo')+'</label><select id="containerCompareSelect'+index+'" class="container-compare-select"></select></div>'+
        '<div class="container-viewer-stage container-compare-stage"><div class="container-viewer-viewport" role="group" tabindex="-1" aria-describedby="containerCompareHint'+index+'"></div><p class="container-viewer-status" role="status">Carregando visualização…</p></div>'+
        '<div class="container-viewer-tools container-compare-tools" hidden><button type="button" data-compare-turn="-1" aria-label="Girar modelo '+(index===0?'A':'B')+' para a esquerda">↶</button><button type="button" data-compare-reset>Vista inicial</button><button type="button" data-compare-turn="1" aria-label="Girar modelo '+(index===0?'A':'B')+' para a direita">↷</button><span class="container-zoom-controls"><button type="button" data-compare-zoom=".1" aria-label="Afastar modelo '+(index===0?'A':'B')+'">−</button><button type="button" data-compare-zoom="-.1" aria-label="Aproximar modelo '+(index===0?'A':'B')+'">+</button></span><p class="container-viewer-hint" id="containerCompareHint'+index+'">Arraste para girar. Use + e − para ver detalhes.</p></div>'+
        '<dl class="container-compare-specs"></dl><div class="container-compare-action"><a class="container-sales-whatsapp" target="_blank" rel="noopener">Consultar este modelo ↗</a></div>';
      var picker=card.querySelector('select');
      models.forEach(function(model){var option=document.createElement('option');option.value=model.id;option.textContent=label(model);picker.appendChild(option);});
      picker.addEventListener('change',function(){chooseComparison(index,picker.value);});
      compareFields.forEach(function(field){
        var row=document.createElement('div');row.dataset.compareField=field.key;
        if(['length','width','height'].includes(field.key))row.className='compare-numeric';
        var term=document.createElement('dt'),value=document.createElement('dd');term.textContent=field.label;row.append(term,value);
        card.querySelector('dl').appendChild(row);
      });
      card.querySelectorAll('[data-compare-turn]').forEach(function(button){button.addEventListener('click',function(){if(compareScenes[index])compareScenes[index].turn(Number(button.dataset.compareTurn)*Math.PI/6);});});
      card.querySelectorAll('[data-compare-zoom]').forEach(function(button){button.addEventListener('click',function(){if(compareScenes[index])compareScenes[index].magnify(Number(button.dataset.compareZoom));});});
      card.querySelector('[data-compare-reset]').addEventListener('click',function(){if(compareScenes[index])compareScenes[index].reset();});
      panel.querySelector('.container-compare-grid').appendChild(card);compareCards.push(card);
    });
    var tabButtons=Array.from(tabs.querySelectorAll('[role="tab"]'));
    tabButtons.forEach(function(button,index){
      button.addEventListener('click',function(){switchMode(button.dataset.containerMode);});
      button.addEventListener('keydown',function(event){
        var next;
        if(event.key==='ArrowLeft'||event.key==='ArrowRight')next=1-index;
        if(event.key==='Home')next=0;if(event.key==='End')next=1;
        if(next!==undefined){event.preventDefault();tabButtons[next].focus();switchMode(tabButtons[next].dataset.containerMode);}
      });
    });
  }
  function disposeScenes(){
    if(scene){scene.dispose();scene=null;}viewport.replaceChildren();viewport.tabIndex=-1;
    compareCards.forEach(function(card,index){
      if(compareScenes[index]){compareScenes[index].dispose();compareScenes[index]=null;}
      var host=card.querySelector('.container-viewer-viewport');host.replaceChildren();host.tabIndex=-1;
    });
  }
  function comparisonUnavailable(index){
    if(compareScenes[index]){compareScenes[index].dispose();compareScenes[index]=null;}
    var card=compareCards[index],host=card.querySelector('.container-viewer-viewport');
    host.replaceChildren();host.tabIndex=-1;
    var message=card.querySelector('.container-viewer-status');message.hidden=false;
    message.textContent='Visualização 3D indisponível. As medidas, características e consulta deste modelo continuam disponíveis.';
    card.querySelector('.container-viewer-tools').hidden=true;
  }
  async function loadScenes(){
    var id=++ticket,timeout;
    var cards=mode==='single'?[dialog.querySelector('.container-single-panel')]:compareCards;
    cards.forEach(function(card){
      var message=card.querySelector('.container-viewer-status');message.hidden=false;message.textContent='Carregando visualização…';
      card.querySelector('.container-viewer-tools').hidden=true;card.querySelector('.container-viewer-viewport').tabIndex=-1;
    });
    try{
      var module=await Promise.race([import(moduleURL),new Promise(function(_,reject){timeout=setTimeout(function(){reject(new Error('Load timeout'));},15000);})]);
      if(id!==ticket||!dialog.open)return;
      if(mode==='single'){
        scene=module.createContainerScene(viewport,unavailable,selected);
        viewport.tabIndex=0;status.hidden=true;controls.hidden=false;
      }else{
        compareCards.forEach(function(card,index){
          var host=card.querySelector('.container-viewer-viewport');
          try{
            compareScenes[index]=module.createContainerScene(host,function(){comparisonUnavailable(index);},compareModels[index],{fitModel:fitModel,pixelRatioLimit:1.4,viewDirection:[.6,.45,1.5]});
            host.tabIndex=0;card.querySelector('.container-viewer-status').hidden=true;card.querySelector('.container-viewer-tools').hidden=false;
          }catch(_){comparisonUnavailable(index);}
        });
      }
    }catch(_){if(id===ticket&&dialog.open){if(mode==='single')unavailable();else compareCards.forEach(function(_,index){comparisonUnavailable(index);});}}
    finally{clearTimeout(timeout);}
  }
  function switchMode(next,opening){
    if(next===mode&&!opening)return;
    ++ticket;disposeScenes();
    if(next==='compare'&&mode==='single'){
      compareModels[0]=selected;
      if(compareModels[1].id===selected.id)compareModels[1]=models.find(function(model){return model.id!==selected.id;});
    }else if(next==='single'&&mode==='compare')selected=compareModels[0];
    mode=next;dialog.dataset.mode=mode;
    dialog.querySelector('#containerSinglePanel').hidden=mode!=='single';
    dialog.querySelector('#containerComparePanel').hidden=mode!=='compare';
    dialog.querySelectorAll('[data-container-mode]').forEach(function(button){
      var active=button.dataset.containerMode===mode;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;
    });
    updateInfo();updateComparison();loadScenes();
    dialog.scrollTop=0;
  }
  triggers.forEach(function(trigger){
    trigger.hidden=false;
    trigger.addEventListener('click',function(){
      if(!dialog)createDialog();
      opener=trigger;salesURL=trigger.closest('.container-sales').querySelector('.container-sales-whatsapp').href;
      dialog.showModal();document.documentElement.classList.add('container-modal-open');notifyVisibility();
      switchMode(trigger.hasAttribute('data-container-compare')?'compare':'single',true);
    });
  });
})();
