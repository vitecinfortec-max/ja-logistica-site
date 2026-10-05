(function () {
  'use strict';
  var triggers = Array.from(document.querySelectorAll('[data-container-preview]'));
  if (!triggers.length || typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
  var dialog, viewport, status, controls, opener, scene, ticket = 0;
  var moduleURL = new URL('container-scene.js?v=20261005-1', document.currentScript.src).href;
  function notifyVisibility() { document.dispatchEvent(new Event('gallery:visibility')); }
  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'container-viewer';
    dialog.id = 'containerViewer';
    dialog.setAttribute('aria-labelledby', 'containerViewerTitle');
    dialog.innerHTML = '<div class="container-viewer-head"><div><p class="eyebrow">Explore em 3D</p><h2 id="containerViewerTitle">Contêiner ilustrativo</h2></div><button type="button" class="container-viewer-close" autofocus aria-label="Fechar visualização 3D">Fechar ×</button></div>' +
      '<div class="container-viewer-stage"><div class="container-viewer-viewport" tabindex="0" role="group" aria-label="Contêiner em 3D. Use as setas esquerda e direita para girar, ou a tecla Home para a vista inicial." aria-describedby="containerViewerHint"></div><p class="container-viewer-status" role="status">Carregando visualização…</p></div>' +
      '<div class="container-viewer-tools" hidden><p id="containerViewerHint" class="container-viewer-hint">Arraste para girar ou use os controles abaixo.</p><button type="button" data-viewer-turn="-1" aria-label="Girar contêiner para a esquerda">↶ Girar</button><button type="button" data-viewer-reset>Vista inicial</button><button type="button" data-viewer-turn="1" aria-label="Girar contêiner para a direita">Girar ↷</button></div>' +
      '<div class="container-viewer-footer"><p>Representação ilustrativa. Consulte modelos, medidas, condições e disponibilidade com nosso atendimento de vendas.</p><a class="container-sales-whatsapp" target="_blank" rel="noopener">Consultar disponibilidade ↗</a></div>';
    document.body.appendChild(dialog);
    viewport = dialog.querySelector('.container-viewer-viewport');
    status = dialog.querySelector('.container-viewer-status');
    controls = dialog.querySelector('.container-viewer-tools');
    dialog.querySelector('.container-viewer-close').addEventListener('click', function () { dialog.close(); });
    dialog.querySelectorAll('[data-viewer-turn]').forEach(function (button) {
      button.addEventListener('click', function () { if (scene) scene.turn(Number(button.dataset.viewerTurn) * Math.PI / 6); });
    });
    dialog.querySelector('[data-viewer-reset]').addEventListener('click', function () { if (scene) scene.reset(); });
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog) return;
      var r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', function () {
      ++ticket;
      if (scene) { scene.dispose(); scene = null; }
      viewport.replaceChildren();
      document.documentElement.classList.remove('container-modal-open');
      notifyVisibility();
      if (opener) opener.focus({ preventScroll: true });
    });
  }
  function unavailable() {
    if (scene) { scene.dispose(); scene = null; }
    viewport.replaceChildren();
    viewport.tabIndex = -1;
    status.hidden = false;
    status.textContent = 'A visualização 3D não está disponível neste momento. Você pode consultar os contêineres diretamente pelo WhatsApp abaixo.';
    controls.hidden = true;
  }
  triggers.forEach(function (trigger) {
    trigger.hidden = false;
    trigger.addEventListener('click', async function () {
      if (!dialog) createDialog();
      opener = trigger;
      var salesLink = trigger.closest('.container-sales').querySelector('.container-sales-whatsapp');
      dialog.querySelector('.container-viewer-footer a').href = salesLink.href;
      dialog.showModal();
      document.documentElement.classList.add('container-modal-open');
      notifyVisibility();
      status.hidden = false;
      status.textContent = 'Carregando visualização…';
      controls.hidden = true;
      viewport.tabIndex = -1;
      var id = ++ticket, timeout;
      try {
        var module = await Promise.race([
          import(moduleURL),
          new Promise(function (_, reject) { timeout = setTimeout(function () { reject(new Error('Load timeout')); }, 15000); })
        ]);
        if (id !== ticket || !dialog.open) return;
        scene = module.createContainerScene(viewport, unavailable);
        viewport.tabIndex = 0;
        status.hidden = true;
        controls.hidden = false;
      } catch (_) {
        if (id === ticket && dialog.open) unavailable();
      } finally { clearTimeout(timeout); }
    });
  });
})();
