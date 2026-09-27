/* Service photo carousel; the first image remains available without JavaScript. */
(function () {
  'use strict';
  document.querySelectorAll('[data-service-carousel]').forEach(function (root) {
    const slides = Array.from(root.querySelectorAll('[data-carousel-slide]'));
    const captions = Array.from(root.querySelectorAll('[data-carousel-caption]'));
    const controls = root.querySelector('.service-carousel-controls');
    const buttons = Array.from(root.querySelectorAll('[data-carousel-index]'));
    const stage = root.querySelector('.service-carousel-stage');
    if (slides.length < 2 || !stage || !controls) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0, timer = null, requestId = 0, hovering = false, inView = true, gesture = null;
    function canRotate() {
      return !reducedMotion.matches && !document.hidden && inView && !hovering && !gesture && !root.contains(document.activeElement);
    }
    function schedule() {
      window.clearTimeout(timer);
      timer = null;
      if (canRotate()) timer = window.setTimeout(async function () {
        await show(current + 1, true);
        schedule();
      }, 5000);
    }
    async function show(index, automatic) {
      const request = ++requestId;
      index = (index + slides.length) % slides.length;
      if (index === current) return;
      const img = slides[index].querySelector('img');
      try {
        if (img.decode) await img.decode();
        else if (!img.complete || !img.naturalWidth) return;
      } catch (_) { return; }
      if (request !== requestId || (automatic && !canRotate())) return;
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
        slide.setAttribute('aria-hidden', String(i !== current));
        captions[i].classList.toggle('is-active', i === current);
        captions[i].setAttribute('aria-hidden', String(i !== current));
        buttons[i].setAttribute('aria-pressed', String(i === current));
      });
    }
    function choose(index) {
      window.clearTimeout(timer);
      show(index, false).then(schedule);
    }

    slides.forEach(function (slide) {
      slide.hidden = false;
      const img = slide.querySelector('img');
      img.draggable = false;
      img.loading = 'eager';
    });
    controls.hidden = false;
    buttons.forEach(function (button, i) {
      button.addEventListener('click', function () { choose(i); });
    });
    root.addEventListener('keydown', function (event) {
      let next;
      if (event.key === 'ArrowRight') next = current + 1;
      else if (event.key === 'ArrowLeft') next = current - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = slides.length - 1;
      else return;
      event.preventDefault();
      choose(next);
    });
    root.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse') { hovering = true; schedule(); }
    });
    root.addEventListener('pointerleave', function (event) {
      if (event.pointerType === 'mouse') { hovering = false; schedule(); }
    });
    root.addEventListener('focusin', schedule);
    root.addEventListener('focusout', function () { window.setTimeout(schedule, 0); });
    stage.addEventListener('pointerdown', function (event) {
      if (event.target.closest('button') || !event.isPrimary || event.button !== 0) return;
      gesture = {x: event.clientX, y: event.clientY, id: event.pointerId};
      stage.setPointerCapture(event.pointerId);
      window.clearTimeout(timer);
    });
    stage.addEventListener('pointerup', function (event) {
      if (!gesture || gesture.id !== event.pointerId) return;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      gesture = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) choose(current + (dx < 0 ? 1 : -1));
      else schedule();
    });
    stage.addEventListener('pointercancel', function () { gesture = null; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', schedule);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .15;
        schedule();
      }, {threshold: [0, .15]});
      observer.observe(root);
    }
    schedule();
  });
})();
