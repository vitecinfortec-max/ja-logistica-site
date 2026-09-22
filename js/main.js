
(function () {
  'use strict';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var slides = Array.from(document.querySelectorAll('.hero-slide'));
  var toggle = document.getElementById('carouselToggle');
  var active = 0;
  var timer = null;
  var advancing = false;
  var paused = reducedMotion.matches;

  function prepareSlide(slide) {
    var source = slide.querySelector('source');
    var img = slide.querySelector('img');
    if (source && source.dataset.srcset) {
      source.srcset = source.dataset.srcset;
      delete source.dataset.srcset;
    }
    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
    return img.decode ? img.decode() : new Promise(function (resolve, reject) {
      if (img.complete && img.naturalWidth) return resolve();
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', reject, { once: true });
    });
  }
  function syncCarousel() {
    window.clearInterval(timer);
    timer = null;
    if (toggle) {
      toggle.textContent = paused ? 'Reproduzir fotos' : 'Pausar fotos';
      toggle.setAttribute('aria-pressed', String(paused));
    }
    if (paused || document.hidden || document.querySelector("dialog[open]") || slides.length < 2) return;
    timer = window.setInterval(function () {
      if (advancing) return;
      advancing = true;
      var next = (active + 1) % slides.length;
      prepareSlide(slides[next]).then(function () {
        if (paused || document.hidden || document.querySelector("dialog[open]")) return;
        slides[active].classList.remove('is-active');
        slides[next].classList.add('is-active');
        active = next;
      }).catch(function () {
        // Keep the current photo if the next one cannot be loaded.
      }).finally(function () { advancing = false; });
    }, 3000);
  }
  if (toggle && slides.length > 1) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () { paused = !paused; syncCarousel(); });
    document.addEventListener('visibilitychange', syncCarousel);
    document.addEventListener('gallery:visibility', syncCarousel);
    reducedMotion.addEventListener('change', function (event) { paused = event.matches; syncCarousel(); });
    syncCarousel();
  }

  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('mainNav');
  var navToggle = document.getElementById('navToggle');
  var backToTop = document.getElementById('backToTop');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 12);
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function setMenu(open) {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  navToggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setMenu(false);
      navToggle.focus();
    }
  });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  function animateCount(el) {
    var text = el.textContent.trim();
    var match = text.match(/([\d.,]*\d)/);
    if (!match) return;
    var target = parseInt(match[1].replace(/[.,]/g, ''), 10);
    var prefix = text.slice(0, match.index);
    var suffix = text.slice(match.index + match[1].length);
    var start;
    function step(timestamp) {
      if (reducedMotion.matches) { el.textContent = text; return; }
      if (start === undefined) start = timestamp;
      var progress = Math.min((timestamp - start) / 800, 1);
      var value = Math.round((1 - Math.pow(1 - progress, 3)) * target);
      el.textContent = prefix + value.toLocaleString('pt-BR') + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
    document.documentElement.classList.add('motion-ready');
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.stat-number').forEach(function (el) { countObserver.observe(el); });
  }
})();
