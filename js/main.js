(function () {
  var header = document.getElementById('siteHeader');
  var nav = document.getElementById('mainNav');
  var navToggle = document.getElementById('navToggle');
  var backToTop = document.getElementById('backToTop');

  function onScroll() {
    var scrolled = window.scrollY > 12;
    header.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in-view');
    });
  }
})();
