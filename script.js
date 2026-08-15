// Mitsutaka Uehara — shared site behavior
// Loaded on every page. Each block is defensive (checks elements exist)
// so this one file can be shared across the whole site.

(function mobileNav() {
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function closeNav() {
    nav.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 640) closeNav();
  });
})();

(function themeToggle() {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  // Note: this choice is intentionally session-only (kept in memory, not
  // localStorage) so it stays consistent whether the page is previewed in
  // a sandboxed context or hosted live. It's a small, well-documented
  // trade-off — persisting the choice across visits with localStorage is
  // a one-line addition if you'd like that on the live site.
  function effectiveTheme() {
    var explicit = root.getAttribute('data-theme');
    return explicit || (prefersDark.matches ? 'dark' : 'light');
  }

  toggle.setAttribute('aria-pressed', String(effectiveTheme() === 'dark'));

  toggle.addEventListener('click', function () {
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    toggle.setAttribute('aria-pressed', String(next === 'dark'));
  });
})();

(function scrollReveal() {
  var targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (t) { observer.observe(t); });
})();

(function footerYear() {
  var els = document.querySelectorAll('.current-year');
  if (!els.length) return;
  var year = String(new Date().getFullYear());
  els.forEach(function (el) { el.textContent = year; });
})();
