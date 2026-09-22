/* Róza Parlagi — portfolio · small progressive enhancements (the site works without this file) */
(function () {
  'use strict';

  /* ---------- Scroll-reveal ---------- */
  var reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Horizontal rows: drag to scroll with a mouse ---------- */
  document.querySelectorAll('[data-scroller]').forEach(function (row) {
    var down = false, moved = false, startX = 0, startLeft = 0;

    row.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;   // touch already scrolls natively
      down = true; moved = false;
      startX = e.clientX; startLeft = row.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; row.classList.add('is-dragging'); }
      if (moved) row.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      // keep .is-dragging one tick so the click that follows a drag doesn't open a card
      setTimeout(function () { row.classList.remove('is-dragging'); }, 0);
    });
  });

  /* ---------- Project arrows ---------- */
  var projects = document.getElementById('projects');
  if (projects) {
    var row = projects.querySelector('[data-scroller]');
    var prev = projects.querySelector('[data-scroll="prev"]');
    var next = projects.querySelector('[data-scroll="next"]');

    var step = function () {
      var card = row.querySelector('.card');
      var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : row.clientWidth * 0.8;
    };
    var update = function () {
      var arrows = projects.querySelector('.scroller-nav');
      if (arrows) arrows.style.visibility = row.scrollWidth > row.clientWidth + 2 ? '' : 'hidden';
      var max = row.scrollWidth - row.clientWidth - 2;
      if (prev) prev.disabled = row.scrollLeft <= 2;
      if (next) next.disabled = row.scrollLeft >= max;
    };

    if (prev) prev.addEventListener('click', function () { row.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { row.scrollBy({ left: step(), behavior: 'smooth' }); });
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();

/* ---------- Mouse wheel: glide smoothly, one section per scroll ---------- */
(function () {
  'use strict';
  var panels = Array.prototype.slice.call(document.querySelectorAll('.hero, .projects, .about, .contact, .gallery'));
  if (!panels.length) return;

  var root = document.documentElement;
  var tall = window.matchMedia('(min-height: 700px)');           // same rule as the CSS snapping
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var busy = false;

  // where each section should end up (scroll position), ignoring reveal animations
  function stops() {
    var nav = document.querySelector('.nav').offsetHeight;
    var max = root.scrollHeight - window.innerHeight;
    return panels.map(function (p) { return Math.min(Math.max(p.offsetTop - nav, 0), max); });
  }

  // A mouse wheel sends big, regular "notches"; a touchpad sends many small values.
  // Touchpads and phones keep the browser's own (already smooth) snapping.
  function isMouseWheel(e) {
    if (e.deltaMode === 1) return true;                            // Firefox mouse wheel
    var wd = e.wheelDeltaY;                                        // Chrome / Edge / Safari
    return !!wd && Math.abs(wd) % 120 === 0 && Math.abs(e.deltaY) >= 50;
  }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function glideTo(target) {
    var from = window.scrollY, dist = target - from, t0 = null;
    var dur = reduce.matches ? 0 : 800;
    busy = true;
    root.classList.add('is-paging');                               // pauses CSS snapping while we animate
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = dur ? Math.min((ts - t0) / dur, 1) : 1;
      window.scrollTo(0, Math.round(from + dist * ease(k)));
      if (k < 1) {
        requestAnimationFrame(step);
      } else {
        root.classList.remove('is-paging');
        setTimeout(function () { busy = false; }, 150);            // ignore the wheel's leftover ticks
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey || !tall.matches) return;                        // pinch-zoom / short windows: leave alone
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;           // sideways scroll: leave alone
    if (!isMouseWheel(e)) return;

    e.preventDefault();
    if (busy) return;

    var y = window.scrollY, list = stops(), target = null, i;
    if (e.deltaY > 0) {
      for (i = 0; i < list.length; i++) { if (list[i] > y + 2) { target = list[i]; break; } }
    } else {
      for (i = list.length - 1; i >= 0; i--) { if (list[i] < y - 2) { target = list[i]; break; } }
    }
    if (target !== null) glideTo(target);
  }, { passive: false });
})();

/* ---------- Dark mode switch (button in the header) ---------- */
(function () {
  'use strict';
  var root = document.documentElement;
  var buttons = document.querySelectorAll('.theme-toggle');
  if (!buttons.length) return;

  function sync() {
    var dark = root.getAttribute('data-theme') === 'dark';
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') !== 'dark';
      if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
      sync();
    });
  });
  sync();
})();

/* ---------- "Get to know me" photos: arrows + endless loop ---------- */
(function () {
  'use strict';
  var row = document.querySelector('[data-scroller][data-loop]');
  if (!row) return;
  var originals = Array.prototype.slice.call(row.querySelectorAll('.frame'));
  if (originals.length < 2) return;

  // copies before and after the real photos, so scrolling can wrap around without a jump you can see
  function copy(el) {
    var c = el.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('img').forEach(function (i) { i.alt = ''; i.loading = 'lazy'; });
    return c;
  }
  var first = originals[0];
  originals.forEach(function (f) { row.insertBefore(copy(f), first); });
  originals.forEach(function (f) { row.appendChild(copy(f)); });

  var afterFirst = originals[originals.length - 1].nextElementSibling;   // first copy after the originals
  function setStart() { return first.offsetLeft - row.firstElementChild.offsetLeft; }
  function setWidth() { return afterFirst.offsetLeft - first.offsetLeft; }
  function step() {
    var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  }
  function jumpTo(x) {                       // instant move, no animation, no snapping fight
    row.style.scrollSnapType = 'none';
    row.style.scrollBehavior = 'auto';
    row.scrollLeft = x;
    requestAnimationFrame(function () { row.style.scrollSnapType = ''; row.style.scrollBehavior = ''; });
  }
  function wrap() {
    var start = setStart(), w = setWidth(), x = row.scrollLeft;
    if (x < start - w / 2) jumpTo(x + w);
    else if (x >= start + w / 2) jumpTo(x - w);
  }

  jumpTo(setStart());
  window.addEventListener('load', function () { jumpTo(setStart()); });

  var t;
  row.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(wrap, 140); }, { passive: true });
  window.addEventListener('resize', function () { jumpTo(setStart()); });

  var prev = document.querySelector('[data-gallery="prev"]');
  var next = document.querySelector('[data-gallery="next"]');
  if (next) next.addEventListener('click', function () {
    if (prev) prev.classList.remove('is-hidden');           // the back arrow shows up after the first click
    row.scrollBy({ left: step(), behavior: 'smooth' });
  });
  if (prev) prev.addEventListener('click', function () {
    row.scrollBy({ left: -step(), behavior: 'smooth' });
  });
})();
