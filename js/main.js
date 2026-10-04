(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('mainNav');
  var navToggle = document.getElementById('navToggle');
  var backToTop = document.getElementById('backToTop');
  var motion = new Set();
  var finishAccordions = new Set();

  // The document is always visible. Animations enhance it only when supported.
  function animate(el, frames, options) {
    if (reducedMotion.matches || !el.animate) return null;
    var animation = el.animate(frames, options);
    motion.add(animation);
    function release() { motion.delete(animation); }
    animation.addEventListener('finish', release, { once: true });
    animation.addEventListener('cancel', release, { once: true });
    return animation;
  }
  reducedMotion.addEventListener('change', function () {
    if (!reducedMotion.matches) return;
    motion.forEach(function (animation) { animation.cancel(); });
    finishAccordions.forEach(function (finish) { finish(); });
  });

  var progress = document.createElement('span');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  header.appendChild(progress);
  var navItems = Array.from(nav.querySelectorAll('a')).map(function (link) {
    var url = new URL(link.href);
    var section = url.pathname === location.pathname && url.hash ? document.getElementById(url.hash.slice(1)) : null;
    return { link: link, section: section };
  });
  var servicePage = document.body.classList.contains('service-page');
  var scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    header.classList.toggle('scrolled', window.scrollY > 12);
    backToTop.classList.toggle('visible', window.scrollY > 500);
    var distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0) + ')';
    var line = header.getBoundingClientRect().bottom + Math.min(180, window.innerHeight * .2);
    navItems.forEach(function (item) {
      var rect = item.section && item.section.getBoundingClientRect();
      var current = servicePage ? new URL(item.link.href).hash === '#servicos' : Boolean(rect && rect.top <= line && rect.bottom > line);
      item.link.classList.toggle('is-current', current);
      if (current) item.link.setAttribute('aria-current', servicePage ? 'true' : 'location');
      else item.link.removeAttribute('aria-current');
    });
  }
  function scheduleScroll() { if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll); }
  document.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleScroll).observe(document.body);
  updateScroll();
  function setMenu(open) {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  navToggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });
  backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }); });
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Original background slideshow, paused when hidden or during interaction.
  var hero = document.querySelector('.hero');
  var slides = Array.from(document.querySelectorAll('.hero-slide'));
  var active = 0, timer = null, request = 0;
  var heroVisible = true, hovering = false, focused = false;
  function canRotate() {
    return !reducedMotion.matches && !document.hidden && heroVisible && !hovering && !focused && !document.querySelector('dialog[open]');
  }
  function prepareSlide(slide) {
    var source = slide.querySelector('source'), img = slide.querySelector('img');
    if (source && source.dataset.srcset) { source.srcset = source.dataset.srcset; delete source.dataset.srcset; }
    if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
    return img.decode ? img.decode() : new Promise(function (resolve, reject) {
      if (img.complete) return img.naturalWidth ? resolve() : reject(new Error('Photo unavailable'));
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', reject, { once: true });
    });
  }
  function syncCarousel() {
    window.clearTimeout(timer);
    timer = null;
    if (slides.length > 1 && canRotate()) timer = window.setTimeout(function () { showSlide((active + 1) % slides.length); }, 3000);
  }
  function showSlide(index) {
    var ticket = ++request;
    window.clearTimeout(timer);
    prepareSlide(slides[index]).then(function () {
      if (ticket !== request || !canRotate()) return;
      slides[active].classList.remove('is-active');
      slides[index].classList.add('is-active');
      active = index;
    }).catch(function () {
      // Leave the current photo intact on failure.
    }).finally(function () { if (ticket === request) syncCarousel(); });
  }
  if (slides.length > 1) {
    hero.addEventListener('pointerenter', function (event) { if (event.pointerType === 'mouse') { hovering = true; syncCarousel(); } });
    hero.addEventListener('pointerleave', function () { hovering = false; syncCarousel(); });
    hero.addEventListener('focusin', function () { focused = true; syncCarousel(); });
    hero.addEventListener('focusout', function (event) { focused = hero.contains(event.relatedTarget); syncCarousel(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting; syncCarousel();
    }, { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', syncCarousel);
    document.addEventListener('gallery:visibility', syncCarousel);
    reducedMotion.addEventListener('change', syncCarousel);
    syncCarousel();
  }

  // Each row enters once, with a short capped stagger. No persistent hidden styles.
  if ('IntersectionObserver' in window) {
    var seen = new WeakSet();
    var revealObserver = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) { return entry.isIntersecting; });
      visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
      var previousTop = -Infinity, rowIndex = 0;
      visible.forEach(function (entry) {
        revealObserver.unobserve(entry.target);
        if (seen.has(entry.target)) return;
        seen.add(entry.target);
        var top = entry.boundingClientRect.top;
        rowIndex = Math.abs(top - previousTop) < 24 ? rowIndex + 1 : 0;
        previousTop = top;
        if (reducedMotion.matches || entry.target.contains(document.activeElement) || top < 0) return;
        animate(entry.target, [{ opacity: .3, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 520, delay: Math.min(rowIndex * 65, 195), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      });
    }, { threshold: .08 });
    var targets = '.advantages-heading, .about-heading, .services-heading, .operations-heading, .partners-heading, .clients-heading, .faq-intro, .contact-heading, .advantage-card, .principle-card, .resource-card, .service-card, .gallery-grid > figure, .partner-card, .container-sales, .contact-card, .contact-terminal, .service-section-heading, .service-capability, .service-planning-copy, .service-related-link';
    document.querySelectorAll(targets).forEach(function (el) { revealObserver.observe(el); });
    document.addEventListener('focusin', function (event) {
      // Keyboard navigation must never land on a faded or moving control.
      motion.forEach(function (animation) {
        if (animation.effect && animation.effect.target.contains(event.target)) animation.cancel();
      });
    });
  }
  if (!reducedMotion.matches) {
    document.querySelectorAll('.service-intro-copy .eyebrow, .service-lead, .service-page-actions').forEach(function (el, index) {
      animate(el, [{ opacity: .5, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 480, delay: Math.min(index * 60, 120), easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    });
  }

  // Native details remains the fallback; rapid toggles and reduced motion settle cleanly.
  document.querySelectorAll('.faq-list details').forEach(function (details) {
    var summary = details.querySelector('summary'), animation = null, wanted = details.open;
    function settle() {
      if (animation) { animation.cancel(); animation = null; }
      details.open = wanted;
      details.style.removeProperty('overflow');
      finishAccordions.delete(settle);
    }
    summary.addEventListener('click', function (event) {
      if (reducedMotion.matches || !details.animate) return;
      event.preventDefault();
      var start = details.getBoundingClientRect().height;
      if (!animation) wanted = details.open;
      wanted = !wanted;
      if (animation) { animation.cancel(); animation = null; }
      details.open = true;
      var end = wanted ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + 2;
      details.style.overflow = 'hidden';
      animation = details.animate([{ height: start + 'px' }, { height: end + 'px' }], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
      finishAccordions.add(settle);
      animation.onfinish = settle;
    });
    window.addEventListener('resize', function () { if (animation) settle(); });
  });

  function animateCount(el) {
    var text = el.textContent.trim(), match = text.match(/([\d.,]*\d)/);
    if (!match) return;
    var target = parseInt(match[1].replace(/[.,]/g, ''), 10), start;
    // Keep the accessible label stable while the visual number counts.
    el.setAttribute('aria-label', text);
    function step(timestamp) {
      if (reducedMotion.matches || document.hidden) { el.textContent = text; return; }
      if (start === undefined) start = timestamp;
      var ratio = Math.min((timestamp - start) / 700, 1);
      el.textContent = text.slice(0, match.index) + Math.round((1 - Math.pow(1 - ratio, 3)) * target).toLocaleString('pt-BR') + text.slice(match.index + match[1].length);
      if (ratio < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); countObserver.unobserve(entry.target); }
      });
    }, { threshold: .4 });
    document.querySelectorAll('.stat-number').forEach(function (el) { countObserver.observe(el); });
  }
})();
