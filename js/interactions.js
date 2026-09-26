
(function () {
  'use strict';
  var form = document.getElementById('quoteForm');
  if (form) {
    var service = document.getElementById('quoteService');
    var cargo = document.getElementById('quoteCargo');
    var destination = document.getElementById('quoteDestination');
    var result = document.getElementById('quoteResult');
    var routeRow = document.getElementById('quoteRouteRow');
    function syncService() {
      var local = service.value === 'Armazenagem' || service.value === 'Movimentação de cargas';
      document.getElementById('quoteOriginLabel').textContent = local ? 'Local da operação' : 'Origem';
      document.getElementById('quoteDestinationField').hidden = local;
      destination.disabled = local;
      if (routeRow) routeRow.classList.toggle('form-row-local', local);
      result.hidden = true;
    }
    // Accept only known service URLs; never reflect an arbitrary query value.
    var requestedService = new URLSearchParams(window.location.search).get('servico');
    var serviceFromPage = {
      'cargas-especiais': 'Cargas especiais',
      'conteineres': 'Contêineres e carga geral',
      'armazenagem': 'Armazenagem',
      'movimentacao-de-cargas': 'Movimentação de cargas'
    };
    if (Object.prototype.hasOwnProperty.call(serviceFromPage, requestedService)) {
      service.value = serviceFromPage[requestedService];
    }
    service.addEventListener('change', syncService);
    form.addEventListener('input', function () {
      cargo.setCustomValidity('');
      result.hidden = true;
    });
    document.querySelectorAll('[data-quote-service]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        service.value = link.dataset.quoteService;
        syncService();
      });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      cargo.setCustomValidity(cargo.value.trim() ? '' : 'Descreva a carga para preparar sua cotação.');
      if (!form.reportValidity()) return;
      var name = document.getElementById('quoteName').value.trim();
      var origin = document.getElementById('quoteOrigin').value.trim();
      var lines = ['Olá, Luiz Antonio! Vim pelo site da J.A Logística e gostaria de uma cotação.', ''];
      if (name) lines.push('Nome: ' + name);
      lines.push('Serviço: ' + service.value);
      if (origin) lines.push((destination.disabled ? 'Local da operação: ' : 'Origem: ') + origin);
      if (!destination.disabled && destination.value.trim()) lines.push('Destino: ' + destination.value.trim());
      lines.push('Carga / detalhes: ' + cargo.value.trim());
      var url = 'https://wa.me/5585991753831?text=' + encodeURIComponent(lines.join('\n'));
      document.getElementById('quoteFallback').href = url;
      result.hidden = false;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
    syncService();
    form.hidden = false;
  }

  var dialog = document.getElementById('galleryDialog');
  var links = Array.from(document.querySelectorAll('.gallery-open'));
  if (!dialog || typeof dialog.showModal !== 'function' || !links.length) return;
  var current = 0;
  var opener;
  var request = 0;
  var image = document.getElementById('galleryImage');
  var status = document.getElementById('galleryLoadStatus');
  function showPhoto(index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    var figure = link.closest('figure');
    var title = figure.querySelector('figcaption strong').textContent;
    var serial = ++request;
    document.getElementById('galleryTitle').textContent = title;
    document.getElementById('galleryDescription').textContent = figure.querySelector('figcaption p').textContent;
    document.getElementById('galleryCounter').textContent = (current + 1) + ' de ' + links.length;
    document.getElementById('galleryOriginal').href = link.href;
    image.hidden = true;
    image.removeAttribute('src');
    image.alt = link.querySelector('img').alt;
    status.hidden = false;
    status.textContent = 'Carregando foto…';
    var loader = new Image();
    loader.onload = function () {
      if (serial !== request || !dialog.open) return;
      image.src = loader.src;
      image.hidden = false;
      status.hidden = true;
    };
    loader.onerror = function () {
      if (serial !== request || !dialog.open) return;
      status.textContent = 'Não foi possível carregar a foto. Tente abrir a imagem original abaixo.';
    };
    loader.src = link.href;
  }
  links.forEach(function (link, index) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      dialog.showModal();
      document.documentElement.classList.add('gallery-modal-open');
      document.dispatchEvent(new Event('gallery:visibility'));
      showPhoto(index);
    });
  });
  document.getElementById('galleryClose').addEventListener('click', function () { dialog.close(); });
  document.getElementById('galleryPrev').addEventListener('click', function () { showPhoto(current - 1); });
  document.getElementById('galleryNext').addEventListener('click', function () { showPhoto(current + 1); });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', function () {
    request++;
    image.removeAttribute('src');
    document.documentElement.classList.remove('gallery-modal-open');
    document.dispatchEvent(new Event('gallery:visibility'));
    if (opener) opener.focus({ preventScroll: true });
  });
})();
