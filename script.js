/* Mitsutaka Uehara — portfolio behaviour. No dependencies. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------ theme */
  // The choice lasts for this visit. (Persisting it across visits would need
  // localStorage; see README for the two-line addition.)
  var themeBtn = $('#theme-toggle');
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function syncTheme() {
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(isDark()));
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark() ? '#0b1030' : '#eef0f5');
  }
  syncTheme();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    root.setAttribute('data-theme', isDark() ? 'light' : 'dark');
    syncTheme();
  });

  /* ------------------------------------------------------------ mobile menu */
  var menuBtn = $('#menu-btn');
  var navLinks = $('#nav-links');
  function setMenu(open) {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    root.classList.toggle('nav-open', open);
  }
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () { setMenu(!navLinks.classList.contains('is-open')); });
    navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 820) setMenu(false); });
  }

  /* ------------------------------------------- highlight the current section */
  if ('IntersectionObserver' in window) {
    var linkMap = {};
    $$('.nav-links a[href^="#"]').forEach(function (a) { linkMap[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(linkMap).forEach(function (k) { linkMap[k].removeAttribute('aria-current'); });
        if (linkMap[en.target.id]) linkMap[en.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['top', 'about', 'work', 'toolkit', 'contact'].forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* -------------------------------------------------------------- accordion */
  function setOpen(item, open) {
    item.classList.toggle('is-open', open);
    var btn = $('.q-btn', item);
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }
  $$('.q-item').forEach(function (item) {
    var btn = $('.q-btn', item);
    if (btn) btn.addEventListener('click', function () { setOpen(item, !item.classList.contains('is-open')); });
  });
  function openFromHash() {
    var id = window.location.hash.slice(1);
    var el = id ? doc.getElementById(id) : null;
    if (el && el.classList.contains('q-item')) setOpen(el, true);
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ----------------------------------------------- threshold playground (hero) */
  (function playground() {
    var wrap = $('#pg-plot');
    if (!wrap) return;

    var svg = $('#pg-svg');
    var zone = $('#pg-zone');
    var handle = $('#pg-handle');
    var valueEl = $('#pg-value');
    var NS = 'http://www.w3.org/2000/svg';
    var PAD = 22;

    // Seeded random numbers, so the picture is identical on every visit.
    function mulberry32(a) {
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    var rand = mulberry32(7);
    function normal() {
      var u = 0, v = 0;
      while (!u) u = rand();
      while (!v) v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    var NORMAL_N = 190, ATTACK_N = 34;
    var pts = [];
    function gen(n, mu, sd, attack) {
      for (var i = 0; i < n; i++) {
        pts.push({ s: Math.min(0.985, Math.max(0.015, mu + sd * normal())), attack: attack });
      }
    }
    gen(NORMAL_N, 0.30, 0.14, false);
    gen(ATTACK_N, 0.66, 0.17, true);
    pts.sort(function (a, b) { return a.s - b.s; });

    pts.forEach(function (p) {
      var c = doc.createElementNS(NS, 'circle');
      c.setAttribute('class', 'd');
      c.setAttribute('data-s', p.attack ? 'fn' : 'tn');
      c.style.setProperty('--dl', (p.s * 1.1).toFixed(2) + 's');
      svg.appendChild(c);
      p.el = c;
    });

    var minAttack = Math.min.apply(null, pts.filter(function (p) { return p.attack; }).map(function (p) { return p.s; }));
    var maxNormal = Math.max.apply(null, pts.filter(function (p) { return !p.attack; }).map(function (p) { return p.s; }));

    var W = 0, H = 0, R = 4.6;
    var t = 1;                      // threshold, 0..1 (events scoring >= t raise an alert)
    var state = { tp: 0, fp: 0, fn: 0, tn: 0 };

    var elPrec = $('#rd-prec'), elRec = $('#rd-rec'), elMsg = $('#pg-msg');
    var elAlerts = $('#c-alerts'), elFp = $('#c-fp'), elFn = $('#c-fn');
    var live = $('#pg-live');
    var chips = $$('.chip[data-preset]');
    var presetT = {};

    function layout() {
      R = W < 520 ? 3.6 : 4.6;
      var yTop = 64, yBot = H - 18;
      var r2 = mulberry32(7);
      var placed = [];
      pts.forEach(function (p) {
        p.x = PAD + p.s * (W - 2 * PAD);
        var best = yTop, bestD = -1;
        for (var k = 0; k < 18; k++) {
          var y = yTop + r2() * (yBot - yTop);
          var md = 1e9;
          for (var j = placed.length - 1; j >= 0; j--) {
            var dx = p.x - placed[j].x;
            if (dx > R * 4) break;
            var dy = y - placed[j].y;
            var d = dx * dx + dy * dy;
            if (d < md) md = d;
          }
          if (md > bestD) { bestD = md; best = y; }
        }
        p.y = best;
        placed.push(p);
      });
    }

    function render() {
      W = wrap.clientWidth; H = wrap.clientHeight;
      if (!W || !H) return;
      layout();
      pts.forEach(function (p) {
        p.el.setAttribute('cx', p.x.toFixed(1));
        p.el.setAttribute('cy', p.y.toFixed(1));
        p.el.setAttribute('r', R);
      });
      update();
    }

    function pct(n) { return Math.round(n * 100) + '%'; }
    function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

    function message(alerts, prec, rec) {
      if (alerts === 0) return 'Nothing raises an alert, so every attack goes unnoticed.';
      if (state.fp === 0 && state.fn > 0) return 'A perfectly quiet queue, but ' + plural(state.fn, 'attack slips', 'attacks slip') + ' through.';
      if (rec >= 0.99 && prec < 0.6) return 'Every attack is caught, but ' + plural(state.fp, 'false alarm buries', 'false alarms bury') + ' the real ones.';
      if (rec >= 0.9 && prec < 0.6) return 'Almost every attack is caught, at the cost of ' + plural(state.fp, 'false alarm', 'false alarms') + ' to chase.';
      if (prec >= 0.85 && rec < 0.7) return 'The queue is quiet and trustworthy, but ' + plural(state.fn, 'attack goes', 'attacks go') + ' unseen.';
      return 'A trade-off: ' + state.tp + ' of ' + (state.tp + state.fn) + ' attacks caught, ' + plural(state.fp, 'false alarm', 'false alarms') + '.';
    }

    function update() {
      var x = PAD + t * (W - 2 * PAD);
      handle.style.left = x + 'px';
      zone.style.left = x + 'px';
      valueEl.textContent = t.toFixed(2);

      var tp = 0, fp = 0, fn = 0, tn = 0;
      pts.forEach(function (p) {
        var alert = p.s >= t;
        var s = p.attack ? (alert ? 'tp' : 'fn') : (alert ? 'fp' : 'tn');
        if (p.st !== s) { p.el.setAttribute('data-s', s); p.st = s; }
        if (s === 'tp') tp++; else if (s === 'fp') fp++; else if (s === 'fn') fn++; else tn++;
      });
      state = { tp: tp, fp: fp, fn: fn, tn: tn };

      var alerts = tp + fp;
      var prec = alerts ? tp / alerts : null;
      var rec = (tp + fn) ? tp / (tp + fn) : null;

      elPrec.textContent = prec === null ? '–' : pct(prec);
      elRec.textContent = rec === null ? '–' : pct(rec);
      elAlerts.textContent = alerts;
      elFp.textContent = fp;
      elFn.textContent = fn;
      elAlerts.nextSibling.textContent = alerts === 1 ? 'alert raised' : 'alerts raised';
      elFn.nextSibling.textContent = fn === 1 ? 'attack missed' : 'attacks missed';
      elMsg.textContent = message(alerts, prec, rec);

      handle.setAttribute('aria-valuenow', Math.round(t * 100));
      handle.setAttribute('aria-valuetext', 'Threshold ' + t.toFixed(2) + ': ' + plural(alerts, 'alert', 'alerts') + ', ' + plural(fp, 'false alarm', 'false alarms') + ', ' + plural(fn, 'attack', 'attacks') + ' missed');

      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', String(Math.abs(t - presetT[c.dataset.preset]) < 0.006));
      });
    }

    function setT(v) { t = Math.min(1, Math.max(0, v)); update(); }

    var liveTimer = 0;
    function announce() {
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () {
        live.textContent = elMsg.textContent + ' Precision ' + elPrec.textContent + ', recall ' + elRec.textContent + '.';
      }, 350);
    }

    /* tweening (used by presets and the intro) */
    var raf = 0;
    function cancelTween() { cancelAnimationFrame(raf); }
    function tweenTo(target, dur) {
      cancelTween();
      if (reduce) { setT(target); announce(); return; }
      var from = t, t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        setT(from + (target - from) * e);
        if (k < 1) raf = requestAnimationFrame(step); else announce();
      })(t0);
    }

    /* pointer: click or drag anywhere on the plot (touch must start near the handle,
       so scrolling the page past the plot never moves the threshold) */
    var dragging = false;
    function fromEvent(e) {
      var r = wrap.getBoundingClientRect();
      setT((e.clientX - r.left - PAD) / (r.width - 2 * PAD));
    }
    wrap.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.pointerType === 'touch') {
        var hr = handle.getBoundingClientRect();
        if (Math.abs(e.clientX - (hr.left + hr.width / 2)) > 40) return;
      }
      cancelTween();
      dragging = true;
      try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
      wrap.classList.add('is-drag');
      fromEvent(e);
      handle.focus({ preventScroll: true });
    });
    wrap.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e); });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      wrap.classList.remove('is-drag');
      announce();
    }
    wrap.addEventListener('pointerup', endDrag);
    wrap.addEventListener('pointercancel', endDrag);

    handle.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 0.05 : 0.01, v = t;
      switch (e.key) {
        case 'ArrowLeft': case 'ArrowDown': v -= step; break;
        case 'ArrowRight': case 'ArrowUp': v += step; break;
        case 'PageDown': v -= 0.1; break;
        case 'PageUp': v += 0.1; break;
        case 'Home': v = 0; break;
        case 'End': v = 1; break;
        default: return;
      }
      e.preventDefault();
      cancelTween();
      setT(v);
      announce();
    });

    /* presets */
    function bestBalance() {
      var best = 0.5, bestF = -1;
      pts.forEach(function (c) {
        var tp = 0, fp = 0, fn = 0;
        pts.forEach(function (p) {
          var a = p.s >= c.s;
          if (p.attack) { if (a) tp++; else fn++; } else if (a) fp++;
        });
        var pr = tp / ((tp + fp) || 1), rc = tp / ((tp + fn) || 1);
        var f = (pr + rc) ? 2 * pr * rc / (pr + rc) : 0;
        if (f > bestF) { bestF = f; best = c.s; }
      });
      return best;
    }
    presetT.recall = Math.max(0, minAttack - 0.002);
    presetT.quiet = Math.min(1, maxNormal + 0.002);
    presetT.balanced = bestBalance();
    chips.forEach(function (c) {
      c.addEventListener('click', function () { tweenTo(presetT[c.dataset.preset], 700); });
    });

    var note = $('#pg-note');
    if (note) note.textContent = 'Synthetic data for illustration: ' + NORMAL_N + ' normal events and ' + ATTACK_N + ' attacks. Attacks are rare compared with normal traffic, as in real networks.';

    /* start */
    if (!reduce) {
      wrap.classList.add('is-boot');
      setTimeout(function () { wrap.classList.remove('is-boot'); }, 2400);
    }
    render();
    if (reduce) { setT(0.5); announce(); }
    else { setTimeout(function () { tweenTo(0.5, 1600); }, 1100); }

    if ('ResizeObserver' in window) {
      var pending = 0;
      new ResizeObserver(function () {
        cancelAnimationFrame(pending);
        pending = requestAnimationFrame(render);
      }).observe(wrap);
    } else {
      window.addEventListener('resize', render);
    }
  })();

  /* ------------------------------------------------------------ copy e-mail */
  var toast = $('#toast');
  var toastTimer = 0;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }
  var copyBtn = $('#copy-mail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var mail = copyBtn.getAttribute('data-mail');
    function fallback() {
      var ok = false;
      var ta = doc.createElement('textarea');
      ta.value = mail; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select();
      try { ok = doc.execCommand('copy'); } catch (err) {}
      doc.body.removeChild(ta);
      showToast(ok ? 'Email address copied' : 'Could not copy. Select the address above instead.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mail).then(function () { showToast('Email address copied'); }, fallback);
    } else { fallback(); }
  });

  /* ------------------------------------------------- local time + footer year */
  var timeNote = $('#time-note');
  function tick() {
    if (!timeNote) return;
    try {
      var f = function (tz) { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date()); };
      timeNote.textContent = 'Right now it is ' + f('America/Los_Angeles') + ' in Washington and ' + f('Asia/Tokyo') + ' in Tokyo.';
    } catch (err) {}
  }
  tick();
  setInterval(tick, 30000);

  $$('.year').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
