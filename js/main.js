(function () {
  var heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 1) {
    var currentSlide = 0;
    setInterval(function () {
      heroSlides[currentSlide].classList.remove('is-active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('is-active');
    }, 3000);
  }

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

  function animateCount(el) {
    var text = el.textContent.trim();
    var match = text.match(/([\d.,]*\d)/);
    if (!match) return;
    var raw = match[1];
    var target = parseInt(raw.replace(/[.,]/g, ''), 10);
    var prefix = text.slice(0, match.index);
    var suffix = text.slice(match.index + raw.length);
    var duration = 800;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString('pt-BR') + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString('pt-BR') + suffix;
      }
    }
    window.requestAnimationFrame(step);
  }

  var statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length) {
    if ('IntersectionObserver' in window) {
      var statObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      statNumbers.forEach(function (el) {
        statObserver.observe(el);
      });
    }
  }
})();
