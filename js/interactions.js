
(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.operation-journey').forEach(function (journey) {
    if (!('IntersectionObserver' in window) || reducedMotion.matches) return;
    journey.classList.add('journey-animated');
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { journey.classList.add('journey-in-view'); observer.disconnect(); }
    }, { threshold: .25 });
    observer.observe(journey);
  });
  var form = document.getElementById('quoteForm');
  if (form) {
    var service = document.getElementById('quoteService');
    var cargo = document.getElementById('quoteCargo');
    var destination = document.getElementById('quoteDestination');
    var result = document.getElementById('quoteResult');
    var routeRow = document.getElementById('quoteRouteRow');
    function getQuoteData() {
      return {
        service: service.value,
        name: document.getElementById('quoteName').value.trim(),
        origin: document.getElementById('quoteOrigin').value.trim(),
        destination: destination.disabled ? '' : destination.value.trim(),
        cargo: cargo.value.trim(),
        local: destination.disabled
      };
    }
    function updatePreview() {
      form.querySelector('.quote-preview').hidden = false;
      var data = getQuoteData();
      ['service', 'name', 'origin', 'destination', 'cargo'].forEach(function (key) {
        var target = form.querySelector('[data-preview="' + key + '"]');
        var row = form.querySelector('[data-preview-row="' + key + '"]');
        if (target) {
          target.textContent = data[key] || (key === 'service' ? 'Selecione um serviço' : key === 'cargo' ? 'Descreva sua carga' : '');
          target.classList.toggle('is-empty', !data[key]);
        }
        if (row) row.hidden = !data[key];
      });
      document.getElementById('quotePreviewOriginLabel').textContent = data.local ? 'Local da operação' : 'Origem';
      var missing = Number(!data.service) + Number(!data.cargo);
      var status = document.getElementById('quotePreviewStatus');
      var text = missing ? missing + (missing === 1 ? ' campo obrigatório pendente' : ' campos obrigatórios pendentes') : 'Pronto para revisar no WhatsApp';
      if (status.textContent !== text) status.textContent = text;
      status.classList.toggle('is-ready', !missing);
    }
    function syncService() {
      var local = service.value === 'Armazenagem' || service.value === 'Movimentação de cargas';
      document.getElementById('quoteOriginLabel').textContent = local ? 'Local da operação' : 'Origem';
      document.getElementById('quoteDestinationField').hidden = local;
      destination.disabled = local;
      if (routeRow) routeRow.classList.toggle('form-row-local', local);
      result.hidden = true;
      updatePreview();
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
    form.addEventListener('change', updatePreview);
    form.addEventListener('reset', function () { window.requestAnimationFrame(syncService); });
    form.addEventListener('input', function () {
      cargo.setCustomValidity('');
      result.hidden = true;
      updatePreview();
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
      var data = getQuoteData();
      var lines = ['Olá, Luiz Antonio! Vim pelo site da J.A Logística e gostaria de uma cotação.', ''];
      if (data.name) lines.push('Nome: ' + data.name);
      lines.push('Serviço: ' + data.service);
      if (data.origin) lines.push((data.local ? 'Local da operação: ' : 'Origem: ') + data.origin);
      if (data.destination) lines.push('Destino: ' + data.destination);
      lines.push('Carga / detalhes: ' + data.cargo);
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
  var thumbnailStrip = document.getElementById('galleryThumbnails');
  var thumbnails = [];
  function prepareThumbnails() {
    if (!thumbnailStrip || thumbnails.length) return;
    links.forEach(function (link, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-thumbnail';
      button.setAttribute('aria-label', 'Foto ' + (index + 1) + ' de ' + links.length + ': ' + link.closest('figure').querySelector('figcaption strong').textContent);
      var picture = link.querySelector('picture').cloneNode(true);
      picture.querySelectorAll('source').forEach(function (source) { source.sizes = '96px'; });
      var preview = picture.querySelector('img');
      preview.alt = ''; preview.loading = 'lazy'; preview.removeAttribute('id');
      var number = document.createElement('span');
      number.textContent = index + 1; number.setAttribute('aria-hidden', 'true');
      button.append(picture, number);
      button.addEventListener('click', function () { showPhoto(index); });
      thumbnailStrip.appendChild(button);
      thumbnails.push(button);
    });
  }
  function updateThumbnails() {
    thumbnails.forEach(function (button, index) {
      button.setAttribute('aria-pressed', String(index === current));
      button.tabIndex = index === current ? 0 : -1;
    });
    if (thumbnails[current]) {
      var button = thumbnails[current];
      var left = button.offsetLeft - thumbnailStrip.offsetLeft - (thumbnailStrip.clientWidth - button.offsetWidth) / 2;
      thumbnailStrip.scrollTo({ left: left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  }
  function showPhoto(index) {
    current = (index + links.length) % links.length;
    updateThumbnails();
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
      if (!reducedMotion.matches && image.animate) image.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
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
      prepareThumbnails();
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
    var next;
    if (event.key === 'ArrowLeft') next = current - 1;
    if (event.key === 'ArrowRight') next = current + 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = links.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      showPhoto(next);
      if (event.target.closest('.gallery-thumbnail')) thumbnails[current].focus({ preventScroll: true });
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
