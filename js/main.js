/* ==========================================================================
   黑神话·悟空 — 课程设计站点交互
   原生 JavaScript，无第三方依赖
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- 1. 顶栏 / 阅读进度 ---------- */
  var header = $('#siteHeader');
  var bar = $('#progressBar');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- 2. 移动端菜单 ---------- */
  var nav = $('#siteNav');
  var navToggle = $('#navToggle');
  var body = document.body;

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    body.classList.toggle('no-scroll', open);
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setNav(!nav.classList.contains('is-open'));
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });
    var wide = window.matchMedia('(min-width: 901px)');
    var onChange = function (e) { if (e.matches) setNav(false); };
    if (wide.addEventListener) wide.addEventListener('change', onChange);
    else if (wide.addListener) wide.addListener(onChange);
  }

  /* ---------- 3. 滚动入场 ---------- */
  var reveals = $$('.reveal');
  var snap = /(?:\?|&)snap=1(?:&|$)/.test(window.location.search);

  if (snap || reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. 首页视差 ---------- */
  var hero = $('.hero');
  var sky = $('.hero-sky');
  var fg = $('.hero-fg');

  if (hero && sky && fg && !reduced && window.matchMedia('(hover: hover)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    function frame() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      sky.style.transform = 'scale(1.09) translate3d(' + (cx * -16).toFixed(2) + 'px,' + (cy * -11).toFixed(2) + 'px,0)';
      fg.style.transform = 'scale(1.03) translate3d(' + (cx * -28).toFixed(2) + 'px,' + (cy * -17 + 8).toFixed(2) + 'px,0)';
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
      }
    }

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(frame);
    });
  }

  /* ---------- 5. 余烬粒子 ---------- */
  var canvas = $('#embers');

  if (canvas && canvas.getContext && !reduced) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, parts = [], emberRaf = null;

    function sizeCanvas() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      parts = [];
      var n = Math.max(22, Math.min(64, Math.round(w / 24)));
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * w,
          y: h * (0.2 + Math.random() * 0.9),
          r: Math.random() * 1.5 + 0.4,
          v: Math.random() * 0.3 + 0.08,
          a: Math.random() * 0.5 + 0.12,
          ph: Math.random() * Math.PI * 2
        });
      }
    }

    function embers(t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.v;
        p.x += Math.sin(t / 2400 + p.ph) * 0.22;
        if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
        var tw = 0.62 + Math.sin(t / 760 + p.ph) * 0.38;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(233,207,154,' + (p.a * tw).toFixed(3) + ')';
        ctx.shadowColor = 'rgba(233,207,154,.75)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      emberRaf = requestAnimationFrame(embers);
    }

    sizeCanvas();
    seed();
    emberRaf = requestAnimationFrame(embers);

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (emberRaf) cancelAnimationFrame(emberRaf);
        sizeCanvas();
        seed();
        emberRaf = requestAnimationFrame(embers);
      }, 200);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (emberRaf) cancelAnimationFrame(emberRaf);
        emberRaf = null;
      } else if (!emberRaf) {
        emberRaf = requestAnimationFrame(embers);
      }
    });
  }

  /* ---------- 6. 数字滚动 ---------- */
  var counters = $$('[data-count]');

  if (counters.length) {
    function runCount(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var decimals = parseInt(el.getAttribute('data-dec') || '0', 10);

      function render(value) {
        el.textContent = decimals
          ? value.toFixed(decimals)
          : String(Math.round(value));
      }

      if (reduced || snap) { render(target); return; }

      var start = null;
      var duration = 1700;

      function step(t) {
        if (start === null) start = t;
        var k = Math.min((t - start) / duration, 1);
        var eased = 1 - Math.pow(1 - k, 3);
        render(target * eased);
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && !snap) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            cio.unobserve(entry.target);
            runCount(entry.target);
          }
        });
      }, { threshold: 0.35 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---------- 7. 众生筛选 ---------- */
  var peopleGrid = $('#peopleGrid');

  if (peopleGrid) {
    var people = $$('.person', peopleGrid);
    var peopleChips = $$('[data-people-filter]');
    var peopleCount = $('#peopleCount');
    var peopleEmpty = $('#peopleEmpty');

    function filterPeople(cat) {
      var shown = 0;
      people.forEach(function (p) {
        var ok = cat === 'all' || p.getAttribute('data-cat') === cat;
        if (ok) { p.hidden = false; shown++; } else { p.hidden = true; }
      });
      if (peopleCount) peopleCount.textContent = '共 ' + people.length + ' 位 · 当前 ' + shown;
      if (peopleEmpty) peopleEmpty.hidden = shown > 0;
    }

    peopleChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        peopleChips.forEach(function (c) {
          c.classList.toggle('is-active', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        filterPeople(chip.getAttribute('data-people-filter') || 'all');
      });
    });
  }

  /* ---------- 8. 影神图：筛选 / 搜索 / 弹窗 ---------- */
  var beastGrid = $('#beastGrid');
  var modal = $('#beastModal');

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (!nav || !nav.classList.contains('is-open')) body.classList.remove('no-scroll');
  }

  if (beastGrid) {
    var beasts = $$('.beast', beastGrid);
    var beastChips = $$('[data-beast-filter]');
    var beastSearch = $('#beastSearch');
    var beastCount = $('#beastCount');
    var beastEmpty = $('#beastEmpty');
    var activeCat = 'all';
    var cardCount = $$('.beast', beastGrid).length;
    var lastFocus = null;

    function filterBeasts() {
      var q = beastSearch ? beastSearch.value.trim().toLowerCase() : '';
      var shown = 0;

      beasts.forEach(function (card) {
        var hay = [
          card.getAttribute('data-name'),
          card.getAttribute('data-alias'),
          card.getAttribute('data-chapter'),
          card.getAttribute('data-cat'),
          card.textContent
        ].join(' ').toLowerCase();
        var ok = (activeCat === 'all' || card.getAttribute('data-cat') === activeCat) &&
                 (!q || hay.indexOf(q) !== -1);
        card.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });

      if (beastCount) beastCount.textContent = '共 ' + cardCount + ' 条 · 命中 ' + shown;
      if (beastEmpty) beastEmpty.hidden = shown > 0;
    }

    beastChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeCat = chip.getAttribute('data-beast-filter') || 'all';
        beastChips.forEach(function (c) {
          c.classList.toggle('is-active', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        filterBeasts();
      });
    });

    if (beastSearch) beastSearch.addEventListener('input', filterBeasts);

    if (modal) {
      var mSigil = $('#modalSigil');
      var mTitle = $('#modalTitle');
      var mMeta = $('#modalMeta');
      var mP1 = $('#modalP1');
      var mP2 = $('#modalP2');
      var mTip = $('#modalTip');
      var mIndex = $('#modalIndex');
      var mClose = $('.modal-close', modal);

      function openBeast(card) {
        mSigil.textContent = card.getAttribute('data-glyph') || '妖';
        mTitle.textContent = card.getAttribute('data-name') || '';
        mMeta.textContent = (card.getAttribute('data-chapter') || '') + ' · ' +
                            (card.getAttribute('data-cat') || '') + ' · ' +
                            (card.getAttribute('data-alias') || '');
        mP1.textContent = card.getAttribute('data-p1') || '';
        mP2.textContent = card.getAttribute('data-p2') || '';
        mTip.textContent = card.getAttribute('data-tip') || '';
        mIndex.textContent = '影神图 · 第 ' + (card.getAttribute('data-no') || '') + ' 页';
        lastFocus = card;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        body.classList.add('no-scroll');
        if (mClose) mClose.focus();
      }

      beasts.forEach(function (card) {
        card.addEventListener('click', function () { openBeast(card); });
      });

      $$('[data-close]', modal).forEach(function (el) {
        el.addEventListener('click', closeModal);
      });

      modal.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });

      modal.addEventListener('transitionend', function () {
        if (!modal.classList.contains('is-open') && lastFocus) {
          lastFocus.focus();
          lastFocus = null;
        }
      });

      filterBeasts();
    }
  }

  /* ---------- 9. 棍势切换 ---------- */
  var stanceTabs = $$('.stance-tab');

  stanceTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = tab.getAttribute('aria-controls');
      stanceTabs.forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      $$('.stance-panel').forEach(function (panel) {
        panel.classList.toggle('is-active', panel.id === targetId);
      });
    });
  });

  /* ---------- 10. 键盘与年份 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      setNav(false);
      closeModal();
    }
  });

  $$('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
