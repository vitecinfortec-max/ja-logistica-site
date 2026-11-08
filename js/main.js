(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('mainNav');
  var navToggle = document.getElementById('navToggle');
  var motion = new Set();
  var finishAccordions = new Set();
  var servicesToggle = document.getElementById('servicesNavToggle');
  var servicesPanel = document.getElementById('servicesMenu');
  var servicesAnimation = null;
  var compactNav = window.matchMedia('(max-width: 760px)');

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
  var navItems = Array.from(nav.querySelectorAll(':scope > a, .services-nav-fallback')).map(function (link) {
    var url = new URL(link.href);
    var section = url.pathname === location.pathname && url.hash ? document.getElementById(url.hash.slice(1)) : null;
    return { link: link.classList.contains('services-nav-fallback') && servicesToggle ? servicesToggle : link, section: section, url: url };
  });
  var servicePage = document.body.classList.contains('service-page');
  var scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    header.classList.toggle('scrolled', window.scrollY > 12);
    updateMenuHeight();
    var distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0) + ')';
    var line = header.getBoundingClientRect().bottom + Math.min(180, window.innerHeight * .2);
    navItems.forEach(function (item) {
      var rect = item.section && item.section.getBoundingClientRect();
      var current = servicePage ? item.url.hash === '#servicos' : Boolean(rect && rect.top <= line && rect.bottom > line);
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
  function updateMenuHeight() {
    var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    header.style.setProperty('--nav-available-height', Math.max(140, height - header.getBoundingClientRect().bottom - 12) + 'px');
  }
  function setServicesMenu(open, restoreFocus) {
    if (!servicesPanel || !servicesToggle) return;
    if (servicesAnimation) { servicesAnimation.cancel(); servicesAnimation = null; }
    if (!open && (restoreFocus || servicesPanel.contains(document.activeElement))) servicesToggle.focus({ preventScroll: true });
    servicesPanel.hidden = !open;
    servicesToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      updateMenuHeight();
      servicesPanel.scrollTop = 0;
      if (!servicesPanel.contains(document.activeElement)) {
        servicesAnimation = animate(servicesPanel, [{ opacity: .35, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 200, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    }
  }
  function setMenu(open) {
    if (!open) setServicesMenu(false, false);
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) updateMenuHeight();
  }
  navToggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      var field = document.getElementById('quoteService');
      var target = document.getElementById('cotacao');
      var name = link.dataset.navService;
      if (name && field && target && Array.from(field.options).some(function (option) { return option.value === name; })) {
        event.preventDefault();
        setMenu(false);
        field.value = name;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        var url = new URL(location.href);
        url.searchParams.set('servico', new URL(link.href).searchParams.get('servico'));
        url.hash = 'cotacao';
        history.pushState(null, '', url);
        target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
        field.focus({ preventScroll: true });
        return;
      }
      setMenu(false);
    });
  });
  if (servicesToggle && servicesPanel) {
    servicesToggle.addEventListener('click', function () { setServicesMenu(servicesPanel.hidden, false); });
    servicesToggle.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setServicesMenu(true, false);
      if (servicesAnimation) { servicesAnimation.cancel(); servicesAnimation = null; }
      servicesPanel.querySelector('.services-menu-link').focus({ preventScroll: true });
    });
    servicesPanel.querySelector('.services-menu-close').addEventListener('click', function () { setServicesMenu(false, true); });
    servicesPanel.querySelectorAll('.services-menu-link').forEach(function (link) {
      if (new URL(link.href).pathname.replace(/\/$/, '') === location.pathname.replace(/\.html$|\/$/g, '')) {
        link.setAttribute('aria-current', 'page');
      }
    });
    servicesToggle.hidden = false;
    nav.querySelector('.services-nav-fallback').hidden = true;
  }
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (servicesPanel && !servicesPanel.hidden) {
      event.preventDefault(); setServicesMenu(false, true); return;
    }
    if (nav.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });
  document.addEventListener('pointerdown', function (event) {
    if (servicesPanel && !servicesPanel.hidden && !servicesToggle.closest('.services-nav').contains(event.target)) setServicesMenu(false, false);
    if (nav.classList.contains('open') && !header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('focusin', function (event) {
    if (servicesPanel && !servicesPanel.hidden && !servicesToggle.closest('.services-nav').contains(event.target)) setServicesMenu(false, false);
    if (compactNav.matches && nav.classList.contains('open') && !header.contains(event.target)) setMenu(false);
    // Interactive links should never remain faded while receiving keyboard focus.
    if (servicesAnimation && servicesPanel.contains(event.target)) { servicesAnimation.cancel(); servicesAnimation = null; }
  });
  compactNav.addEventListener('change', function () {
    var hadFocus = nav.contains(document.activeElement);
    setMenu(false);
    if (hadFocus) (compactNav.matches ? navToggle : servicesToggle || nav.querySelector('a')).focus({ preventScroll: true });
    updateMenuHeight();
  });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', updateMenuHeight);
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

  // WhatsApp links name the page and block they were clicked from, so the team can count leads by page.
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href^="https://wa.me/"]');
    if (!link || link.id === 'quoteFallback') return;
    var url = new URL(link.dataset.waHref || (link.dataset.waHref = link.href));
    var text = (url.searchParams.get('text') || 'Olá! Vim pelo site da J.A Logística.').replace(/s+$/, '');
    var heading = document.querySelector('h1');
    var page = document.body.classList.contains('service-page') && heading ? heading.textContent.trim() : 'Página inicial';
    var block = link.closest('article, aside, section, nav');
    var title = block && block.querySelector('h2, h3');
    var where = title ? title.textContent.trim() : (block && block.getAttribute('aria-label')) || 'botão do WhatsApp';
    url.searchParams.set('text', text + '\n\n(Origem no site: ' + page + ' · ' + where + ')');
    link.href = url.toString();
  }, true);
})();
