
(function () {
  'use strict';
  var root = document.querySelector('[data-clients-carousel]');
  if (!root) return;
  var viewport = root.querySelector('.clients-viewport');
  var track = root.querySelector('.clients-grid');
  var originals = Array.from(track.children);
  if (originals.length < 2) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hovered = false;
  var focusPaused = false;
  var dragging = false;
  var touching = false;
  var visible = false;
  var imagesReady = false;
  var loadingImages = false;
  var cycle = 0;
  var cardStep = 0;
  var position = 0;
  var lastWritten = 0;
  var frame = 0;
  var previousTime = 0;
  var resumeAt = 0;
  var wakeTimer;
  var settleTimer;
  var previousX = 0;

  function copyItems() {
    var fragment = document.createDocumentFragment();
    originals.forEach(function (item) {
      var copy = item.cloneNode(true);
      copy.dataset.clientCopy = '';
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('role', 'presentation');
      copy.inert = true;
      copy.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
      fragment.appendChild(copy);
    });
    return fragment;
  }
  track.insertBefore(copyItems(), originals[0]);
  track.appendChild(copyItems());
  root.classList.add('is-ready');
  root.setAttribute('role', 'region');
  root.setAttribute('aria-labelledby', 'clientsTitle');
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'group');
  viewport.setAttribute('aria-label', 'Logos dos clientes. Use as setas do teclado para navegar.');

  function writePosition(value) {
    position = value;
    viewport.scrollLeft = value;
    lastWritten = viewport.scrollLeft;
  }
  function normalize() {
    if (!cycle) return;
    var offset = ((viewport.scrollLeft - cycle) % cycle + cycle) % cycle;
    writePosition(cycle + offset);
  }
  function measure() {
    var progress = cycle ? ((position % cycle) + cycle) % cycle / cycle : 0;
    cycle = originals[0].getBoundingClientRect().left - track.firstElementChild.getBoundingClientRect().left;
    cardStep = originals[1].getBoundingClientRect().left - originals[0].getBoundingClientRect().left;
    writePosition(cycle * (1 + progress));
    sync();
  }
  function canMove() {
    return cycle > 0 && visible && imagesReady && !document.hidden &&
      !reducedMotion.matches && !hovered && !focusPaused && !dragging && !touching &&
      performance.now() >= resumeAt && !document.querySelector('dialog[open]');
  }
  function tick(time) {
    frame = 0;
    if (!canMove()) { previousTime = 0; return; }
    var elapsed = previousTime ? Math.min(time - previousTime, 50) : 0;
    previousTime = time;
    var next = position + elapsed * 0.032;
    if (next >= cycle * 2) next -= cycle;
    writePosition(next);
    frame = window.requestAnimationFrame(tick);
  }
  function sync() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (canMove()) frame = window.requestAnimationFrame(tick);
  }
  function hold() {
    resumeAt = performance.now() + 3000;
    window.clearTimeout(wakeTimer);
    wakeTimer = window.setTimeout(sync, 3050);
    sync();
  }
  function settle() {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(function () {
      if (!dragging && !touching) normalize();
    }, 180);
  }
  function move(direction) {
    hold();
    viewport.scrollBy({
      left: direction * cardStep,
      behavior: reducedMotion.matches ? 'instant' : 'smooth'
    });
  }

  viewport.addEventListener('scroll', function () {
    // Browser echoes from animation writes must not reset its fractional progress.
    if (Math.abs(viewport.scrollLeft - lastWritten) < 1) return;
    position = viewport.scrollLeft;
    hold();
    settle();
  }, { passive: true });
  viewport.addEventListener('wheel', hold, { passive: true });
  root.addEventListener('pointerenter', function (event) {
    if (event.pointerType === 'mouse') { hovered = true; sync(); }
  });
  root.addEventListener('pointerleave', function (event) {
    if (event.pointerType === 'mouse') { hovered = false; sync(); }
  });
  root.addEventListener('focusin', function (event) {
    if (event.target.matches(':focus-visible')) { focusPaused = true; sync(); }
  });
  root.addEventListener('focusout', function () {
    window.setTimeout(function () {
      if (!root.contains(document.activeElement)) { focusPaused = false; sync(); }
    }, 0);
  });
  viewport.addEventListener('dragstart', function (event) { event.preventDefault(); });
  viewport.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    hold();
    if (event.pointerType === 'mouse') {
      dragging = true;
      previousX = event.clientX;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
      event.preventDefault();
    } else {
      touching = true;
    }
    sync();
  });
  viewport.addEventListener('pointermove', function (event) {
    if (!dragging) return;
    writePosition(viewport.scrollLeft + previousX - event.clientX);
    previousX = event.clientX;
    normalize();
  });
  function endPointer() {
    dragging = false;
    touching = false;
    viewport.classList.remove('is-dragging');
    hold();
    settle();
  }
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);
  viewport.addEventListener('lostpointercapture', function () {
    if (dragging) endPointer();
  });
  viewport.addEventListener('keydown', function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      hold();
      writePosition(event.key === 'Home' ? cycle : cycle + (originals.length - 1) * cardStep);
    }
  });
  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('gallery:visibility', sync);

  function loadImages() {
    if (loadingImages) return;
    loadingImages = true;
    var promises = Array.from(track.querySelectorAll('img')).map(function (img) {
      img.loading = 'eager';
      return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    });
    Promise.all(promises).then(function () { imagesReady = true; sync(); });
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(viewport);
  } else {
    window.addEventListener('resize', measure);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) loadImages();
      sync();
    }, { threshold: 0.1 }).observe(viewport);
  } else {
    visible = true;
    loadImages();
  }
  measure();
})();
