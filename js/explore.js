(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coverage = document.querySelector('.coverage-explorer');
  if (coverage) {
    var regions = {
      nordeste: {
        label: 'Nossa área de atendimento',
        title: 'Atendimento no Nordeste',
        text: 'Atendemos a região Nordeste. Informe a origem, o destino e o serviço para consultar a disponibilidade da sua operação.',
        note: 'AL · BA · CE · MA · PB · PE · PI · RN · SE'
      },
      norte: {
        label: 'Disponibilidade por rota',
        title: 'Região Norte: consulte sua rota',
        text: 'Atendemos parte da região Norte. Informe as cidades de origem e destino para confirmar se sua rota é atendida.',
        note: 'Disponibilidade mediante consulta ao comercial.'
      },
      terminal: {
        label: 'Nossa base de operação',
        title: 'Terminal em Caucaia–CE',
        text: 'Rodovia CE 155, 16.226 · Distrito Industrial. Estrutura para armazenagem e movimentação de cargas, com apoio às operações de transporte.',
        note: 'Em frente à fábrica do Cimento Apodi.'
      }
    };
    var controls = Array.from(coverage.querySelectorAll('[data-coverage-select]'));
    var mapTargets = Array.from(coverage.querySelectorAll('[data-coverage-target]'));
    var fields = {
      label: document.getElementById('coverageDetailLabel'),
      title: document.getElementById('coverageDetailTitle'),
      text: document.getElementById('coverageDetailText'),
      note: document.getElementById('coverageDetailNote')
    };
    var activeRegion = '';
    function selectRegion(key) {
      if (!regions[key] || key === activeRegion) return;
      activeRegion = key;
      Object.keys(fields).forEach(function (field) { fields[field].textContent = regions[key][field]; });
      controls.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.coverageSelect === key)); });
      mapTargets.forEach(function (target) { target.setAttribute('aria-pressed', String(target.dataset.coverageTarget === key)); });
    }
    controls.forEach(function (button) {
      button.setAttribute('aria-controls', 'coverageDetails');
      button.addEventListener('click', function () { selectRegion(button.dataset.coverageSelect); });
    });
    // The static image becomes an accessible group only when keyboard controls are ready.
    var svg = coverage.querySelector('.coverage-svg');
    svg.setAttribute('role', 'group');
    mapTargets.forEach(function (target) {
      target.setAttribute('role', 'button');
      target.setAttribute('tabindex', '0');
      target.setAttribute('aria-controls', 'coverageDetails');
      target.addEventListener('click', function () { selectRegion(target.dataset.coverageTarget); });
      target.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectRegion(target.dataset.coverageTarget);
        }
      });
    });
    selectRegion('nordeste');
    coverage.querySelector('.coverage-controls').hidden = false;
    coverage.querySelector('.coverage-quote').addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      var field = document.getElementById('quoteService');
      // Wait for native anchor navigation before moving keyboard focus into the form.
      if (field && !field.closest('[hidden]')) window.requestAnimationFrame(function () { field.focus({ preventScroll: true }); });
    });
    if ('IntersectionObserver' in window) {
      var mapObserver = new IntersectionObserver(function (entries) {
        if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
        coverage.classList.add('coverage-map-in-view');
        mapObserver.disconnect();
      }, { threshold: .2 });
      mapObserver.observe(svg);
    } else coverage.classList.add('coverage-map-in-view');
  }

  var toolbar = document.querySelector('.gallery-toolbar');
  var grid = document.querySelector('.gallery-grid');
  if (!toolbar || !grid) return;
  var cards = Array.from(grid.querySelectorAll('figure[data-gallery-categories]'));
  var buttons = Array.from(toolbar.querySelectorAll('[data-gallery-filter]'));
  var status = toolbar.querySelector('.gallery-filter-status');
  var imageSizes = new Map();
  grid.querySelectorAll('source[srcset]').forEach(function (source) { imageSizes.set(source, source.sizes); });
  var activeFilter = 'all';
  var animations = [];
  function matches(card, category) {
    return category === 'all' || card.dataset.galleryCategories.split(' ').includes(category);
  }
  function cancelAnimations() {
    animations.forEach(function (animation) { animation.cancel(); });
    animations = [];
  }
  function selectFilter(button) {
    var category = button.dataset.galleryFilter;
    if (category === activeFilter) return;
    activeFilter = category;
    cancelAnimations();
    // Cancel a pending entry animation before measuring card positions for this layout.
    cards.forEach(function (card) {
      if (card.getAnimations) card.getAnimations().forEach(function (animation) { animation.cancel(); });
    });
    grid.dataset.filtering = 'true';
    var before = new Map();
    cards.forEach(function (card) { if (!card.hidden) before.set(card, card.getBoundingClientRect()); });
    var visible = [];
    cards.forEach(function (card) {
      var show = matches(card, category);
      if (!show && card.contains(document.activeElement)) button.focus({ preventScroll: true });
      card.hidden = !show;
      if (show) visible.push(card);
    });
    grid.dataset.visibleCount = String(visible.length);
    imageSizes.forEach(function (original, source) {
      source.sizes = visible.length === 2
        ? '(min-width: 1200px) and (hover: hover) and (pointer: fine) min(46vw, 950px), ' + original
        : original;
    });
    buttons.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
    status.textContent = visible.length + (visible.length === 1 ? ' foto · ' : ' fotos · ') + button.dataset.galleryLabel;
    if (reducedMotion.matches) return;
    visible.forEach(function (card) {
      if (!card.animate || card.contains(document.activeElement)) return;
      var after = card.getBoundingClientRect(), old = before.get(card);
      var from = old
        ? { transform: 'translate(' + (old.left - after.left) + 'px,' + (old.top - after.top) + 'px)', opacity: 1 }
        : { transform: 'translateY(8px)', opacity: .4 };
      var animation = card.animate([from, { transform: 'translate(0,0)', opacity: 1 }], {
        duration: 280, easing: 'cubic-bezier(.22,1,.36,1)'
      });
      animations.push(animation);
      animation.onfinish = function () { animations = animations.filter(function (item) { return item !== animation; }); };
    });
  }
  buttons.forEach(function (button) {
    var count = cards.filter(function (card) { return matches(card, button.dataset.galleryFilter); }).length;
    button.querySelector('span').textContent = count;
    button.setAttribute('aria-controls', 'operationGallery');
    button.addEventListener('click', function () { selectFilter(button); });
  });
  grid.addEventListener('focusin', function () { cancelAnimations(); });
  reducedMotion.addEventListener('change', function () { if (reducedMotion.matches) cancelAnimations(); });
  toolbar.hidden = false;
})();
