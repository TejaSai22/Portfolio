/* ============================================================
   Portfolio — Teja Sai Srinivas
   ============================================================ */
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    const t = root.getAttribute('data-theme');
    return t ? t === 'dark' : darkQuery.matches;
  }

  /* ─────────── Theme ─────────── */
  function setTheme(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#11110f' : '#f3efe6');
    if (room) room.redraw();
  }
  function toggleTheme() { setTheme(isDark() ? 'light' : 'dark'); }

  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  darkQuery.addEventListener && darkQuery.addEventListener('change', () => room && room.redraw());

  /* ─────────── Nav ─────────── */
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // Active link on scroll
  const sections = [...document.querySelectorAll('main section[id]')];
  const linkFor = id => navLinks.querySelector(`a[href="#${id}"]`);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
          const l = linkFor(e.target.id);
          if (l) l.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ─────────── Clock (Denton, TX) ─────────── */
  const clock = document.getElementById('clock');
  function tick() {
    try {
      const t = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago'
      }).format(new Date());
      clock.textContent = `Denton, TX · ${t}`;
    } catch (e) { /* keep fallback text */ }
  }
  if (clock) { tick(); setInterval(tick, 30000); }

  /* ─────────── Reveal on scroll ─────────── */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ─────────── Project filter ─────────── */
  const chips = document.querySelectorAll('.chip[data-filter]');
  const projects = document.querySelectorAll('.project');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    projects.forEach(p => {
      const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
      p.classList.toggle('hidden', !show);
      if (show) p.classList.add('in');
    });
  }));

  /* ─────────── Contact form (Formspree) ─────────── */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.className = 'form-status mono';
      status.textContent = 'Sending…';
      submitBtn.disabled = true;
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        status.classList.add('ok');
        status.textContent = 'Thanks! Message received. I’ll reply soon.';
      } catch (err) {
        status.classList.add('err');
        status.textContent = 'Something went wrong. Email me directly instead.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ─────────── Hotspot navigation (room objects) ─────────── */
  function flash(el) {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }
  document.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.go;
      document.querySelector('.room-frame')?.classList.add('seen');
      if (action === 'theme') { toggleTheme(); return; }
      if (action === 'lamp') { room && room.toggleLamp(); return; }
      if (action === 'ball') { room && room.bounce(); return; }
      const target = document.querySelector(action);
      if (!target) return;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => flash(target), reduceMotion ? 0 : 500);
    });
  });

  /* ─────────── Toast + copy ─────────── */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied ' + text);
    } catch (e) {
      showToast(text);
    }
  }
  document.querySelectorAll('[data-copy]').forEach(b =>
    b.addEventListener('click', () => copyText(b.dataset.copy)));

  /* ─────────── Scroll progress ─────────── */
  const progress = document.getElementById('progress');
  function onScrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
  window.addEventListener('scroll', onScrollProgress, { passive: true });
  onScrollProgress();

  /* ─────────── Quick menu (⌘K / Ctrl+K) ─────────── */
  const cmdk = document.getElementById('cmdk');
  const cmdkInput = document.getElementById('cmdkInput');
  const cmdkItems = [...document.querySelectorAll('#cmdkList li')];
  let sel = 0;

  function visibleItems() { return cmdkItems.filter(li => !li.hidden); }
  function paint() {
    const vis = visibleItems();
    cmdkItems.forEach(li => li.setAttribute('aria-selected', 'false'));
    if (vis[sel]) { vis[sel].setAttribute('aria-selected', 'true'); vis[sel].scrollIntoView({ block: 'nearest' }); }
  }
  function openCmdk() {
    if (!cmdk || cmdk.open) return;
    cmdkInput.value = '';
    cmdkItems.forEach(li => li.hidden = false);
    sel = 0; paint();
    cmdk.showModal();
    cmdkInput.focus();
  }
  function closeCmdk() { if (cmdk && cmdk.open) cmdk.close(); }
  function run(cmd) {
    closeCmdk();
    if (cmd === 'copy') {
      const src = document.querySelector('[data-copy]');
      return src && copyText(src.dataset.copy);
    }
    if (cmd === 'theme') return toggleTheme();
    if (cmd === 'ball') {
      document.getElementById('top').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      return setTimeout(() => room && room.bounce(), reduceMotion ? 0 : 450);
    }
    if (cmd.startsWith('url:')) return window.open(cmd.slice(4), '_blank', 'noopener');
    const target = document.querySelector(cmd);
    if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  if (cmdk) {
    const cmdkBtn = document.getElementById('cmdkBtn');
    if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) cmdkBtn.querySelector('kbd').textContent = 'Ctrl';
    cmdkBtn.addEventListener('click', openCmdk);
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        cmdk.open ? closeCmdk() : openCmdk();
      }
    });
    cmdkInput.addEventListener('input', () => {
      const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const q = norm(cmdkInput.value.trim());
      cmdkItems.forEach(li => li.hidden = !!q && !norm(li.textContent).includes(q));
      sel = 0; paint();
    });
    cmdkInput.addEventListener('keydown', e => {
      const vis = visibleItems();
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, vis.length - 1); paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
      else if (e.key === 'Enter' && vis[sel]) { e.preventDefault(); run(vis[sel].dataset.run); }
    });
    cmdkItems.forEach(li => {
      li.addEventListener('click', () => run(li.dataset.run));
      li.addEventListener('mousemove', () => { sel = visibleItems().indexOf(li); paint(); });
    });
    cmdk.addEventListener('click', e => { if (e.target === cmdk) closeCmdk(); });
  }

  /* ============================================================
     THE ROOM — pixel-art scene drawn on a 320×180 canvas
     ============================================================ */
  const room = (function () {
    const canvas = document.getElementById('room');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const W = 320, H = 180;
    canvas.width = W; canvas.height = H;

    let hovered = null;
    let frame = 0;
    let lampOn = true;
    // tennis ball easter egg: rests by the bag, bounces across the room when clicked
    const ball = { x: 300, from: 300, to: 300, start: -1, dur: 26 };
    const BALL_Y = 154;

    // seeded RNG so the scene is stable between frames
    function rng(seed) {
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }

    const r = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    const px = (x, y, c) => r(x, y, 1, 1, c);
    function line(x0, y0, x1, y1, c) {
      const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
      const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (; ;) {
        px(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }
    function disc(cx, cy, rad, c) {
      for (let y = -rad; y <= rad; y++)
        for (let x = -rad; x <= rad; x++)
          if (x * x + y * y <= rad * rad + rad * 0.6) px(cx + x, cy + y, c);
    }

    const NIGHT = {
      wall: '#2b3a55', wallStripe: '#283651', trim: '#1a2236',
      floor: '#4e3426', floorLine: '#3f291e', floorHi: '#5b3d2d',
      sky: ['#0c1330', '#121b42', '#1a2758', '#22326b'],
      city: '#0a0f24', cityLit: '#f6c35b',
      frame: '#c9b79c', frameShade: '#a8977c',
      shadow: 'rgba(5,8,20,.35)'
    };
    const DAY = {
      wall: '#e6d6b8', wallStripe: '#e0cfaf', trim: '#b49a74',
      floor: '#a8744c', floorLine: '#8f6140', floorHi: '#b8825a',
      sky: ['#7dbbe8', '#94c8ee', '#acd5f2', '#c4e2f5'],
      city: '#86a0bb', cityLit: '#86a0bb',
      frame: '#f4efe6', frameShade: '#d9d1c2',
      shadow: 'rgba(80,50,20,.18)'
    };

    // Highlight hovered object by drawing a 1px accent outline around its box
    const ACCENT = '#ff4f1f';
    const spots = {};
    document.querySelectorAll('.spot').forEach(s => {
      const [x, y, w, h] = s.dataset.box.split(',').map(Number);
      spots[s.dataset.id] = { x, y, w, h, el: s };
      s.style.left = (x / W * 100) + '%';
      s.style.top = (y / H * 100) + '%';
      s.style.width = (w / W * 100) + '%';
      s.style.height = (h / H * 100) + '%';
      s.addEventListener('mouseenter', () => { hovered = s.dataset.id; if (reduceMotion) draw(); });
      s.addEventListener('mouseleave', () => { hovered = null; if (reduceMotion) draw(); });
      s.addEventListener('focus', () => { hovered = s.dataset.id; if (reduceMotion) draw(); });
      s.addEventListener('blur', () => { hovered = null; if (reduceMotion) draw(); });
    });

    function draw() {
      const night = isDark();
      const P = night ? NIGHT : DAY;
      const rand = rng(7);
      const t = frame;

      /* wall */
      r(0, 0, W, 151, P.wall);
      for (let x = 4; x < W; x += 12) r(x, 0, 2, 148, P.wallStripe);

      /* string lights */
      const bulbs = ['#ff4f1f', '#f6c35b', '#7fd1b9', '#9aa7ff', '#ff8fb1'];
      for (let x = 0; x < W; x++) {
        const y = 6 + Math.round(Math.sin(x / 26) * 2.2);
        px(x, y, night ? '#11172a' : '#7b6a52');
        if (x % 13 === 6) {
          const c = bulbs[(x / 13 | 0) % bulbs.length];
          const on = !night || ((x + t * 3) % 39) > 5;
          r(x - 1, y + 1, 3, 3, on ? c : '#3a3f55');
          if (night && on) {
            ctx.fillStyle = c + '33';
            ctx.fillRect(x - 3, y - 1, 7, 7);
          }
        }
      }

      /* window */
      const wx = 16, wy = 20, ww = 70, wh = 66;
      for (let i = 0; i < 4; i++) r(wx + 3, wy + 3 + i * 15, ww - 6, 16, P.sky[i]);
      if (night) {
        for (let i = 0; i < 26; i++) {
          const sx = wx + 4 + Math.floor(rand() * (ww - 8));
          const sy = wy + 4 + Math.floor(rand() * 34);
          const tw = (i + t) % 9 === 0;
          px(sx, sy, tw ? '#ffffff' : '#c9d3ff');
          if (tw) { px(sx - 1, sy, '#7c8bd6'); px(sx + 1, sy, '#7c8bd6'); }
        }
        disc(wx + 52, wy + 14, 6, '#f4e6b8');
        disc(wx + 55, wy + 12, 5, P.sky[0]);
      } else {
        disc(wx + 52, wy + 15, 6, '#ffe28a');
        // clouds drift
        const cx = wx + 4 + ((t / 2) % (ww + 20)) - 20;
        ctx.save(); ctx.beginPath(); ctx.rect(wx + 3, wy + 3, ww - 6, wh - 6); ctx.clip();
        r(cx, wy + 24, 18, 4, '#ffffff'); r(cx + 4, wy + 21, 9, 3, '#ffffff');
        r(cx + 30, wy + 12, 12, 3, '#f4fbff'); r(cx + 33, wy + 10, 6, 2, '#f4fbff');
        ctx.restore();
      }
      // skyline
      const bld = [[0, 18], [8, 26], [15, 14], [22, 30], [31, 20], [38, 34], [47, 16], [55, 24]];
      bld.forEach(([bx, bh], i) => {
        const x0 = wx + 3 + bx, w0 = (bld[i + 1] ? bld[i + 1][0] : 64) - bx;
        r(x0, wy + wh - 3 - bh, w0, bh, P.city);
        if (night) for (let yy = wy + wh - bh; yy < wy + wh - 5; yy += 4)
          for (let xx = x0 + 2; xx < x0 + w0 - 1; xx += 3)
            if (rand() > .55) px(xx, yy, P.cityLit);
      });
      // frame + bars + sill
      r(wx, wy, ww, 3, P.frame); r(wx, wy + wh - 3, ww, 3, P.frame);
      r(wx, wy, 3, wh, P.frame); r(wx + ww - 3, wy, 3, wh, P.frame);
      r(wx + ww / 2 - 1, wy, 2, wh, P.frame); r(wx, wy + 33, ww, 2, P.frame);
      r(wx - 4, wy + wh, ww + 8, 4, P.frame); r(wx - 4, wy + wh + 4, ww + 8, 1, P.frameShade);

      /* diploma frame */
      r(104, 24, 28, 24, '#6e4326'); r(106, 26, 24, 20, '#f3ead2');
      r(110, 29, 16, 2, '#6e5a3a'); r(109, 33, 18, 1, '#b3a483'); r(109, 36, 18, 1, '#b3a483'); r(112, 39, 12, 1, '#b3a483');
      disc(124, 42, 2, '#d0402b'); px(123, 45, '#d0402b'); px(125, 45, '#d0402b');
      r(104, 48, 28, 1, P.shadow);
      /* certificate frame */
      r(140, 30, 26, 20, '#1f2430'); r(142, 32, 22, 16, '#fbf6ea');
      r(144, 34, 8, 2, '#c74634'); r(144, 38, 18, 1, '#b3a483'); r(144, 41, 14, 1, '#b3a483');
      disc(159, 44, 2, '#e3b341');
      r(140, 50, 26, 1, P.shadow);
      /* tiny wall clock */
      disc(184, 38, 6, '#f4efe6'); disc(184, 38, 5, '#fffdf7');
      const ang = (t / 40) % (Math.PI * 2);
      line(184, 38, 184 + Math.round(Math.cos(ang) * 4), 38 + Math.round(Math.sin(ang) * 4), '#222');
      line(184, 38, 184, 35, '#222'); px(184, 38, ACCENT);

      /* whiteboard */
      r(228, 18, 78, 52, '#8b939c'); r(230, 20, 74, 48, '#f1f4f5');
      r(240, 70, 56, 2, '#8b939c');
      r(250, 69, 6, 1, '#2f6fdf'); r(258, 69, 6, 1, '#d63b2a');
      const L = [[238, [28, 40, 52]], [256, [24, 34, 44, 56]], [274, [30, 42, 54]], [292, [42]]];
      for (let i = 0; i < L.length - 1; i++)
        L[i][1].forEach(y0 => L[i + 1][1].forEach(y1 => line(L[i][0], y0, L[i + 1][0], y1, '#b8c6dc')));
      L.forEach(([x, ys], i) => ys.forEach(y => {
        disc(x, y, 2, i === L.length - 1 ? ACCENT : '#2f6fdf');
      }));
      r(232, 60, 18, 1, '#d63b2a'); r(232, 63, 12, 1, '#d63b2a');
      // sticky note
      r(286, 22, 12, 12, '#ffe066'); r(288, 25, 8, 1, '#b39a20'); r(288, 28, 6, 1, '#b39a20');

      /* floor */
      r(0, 151, W, 29, P.floor);
      for (let y = 155; y < H; y += 6) r(0, y, W, 1, P.floorLine);
      for (let y = 151, row = 0; y < H; y += 6, row++)
        for (let x = (row % 2) * 22; x < W; x += 44) r(x, y, 1, 6, P.floorLine);
      r(0, 151, W, 1, P.floorHi);
      r(0, 147, W, 4, P.trim);

      /* rug */
      r(140, 163, 124, 14, '#7a2e1f'); r(142, 165, 120, 10, '#c45a35');
      r(146, 167, 112, 6, '#e8c48a');
      for (let x = 150; x < 256; x += 8) { r(x, 168, 4, 4, '#7a2e1f'); }
      for (let x = 140; x < 264; x += 3) { px(x, 162, '#e8c48a'); px(x + 1, 177, '#e8c48a'); }

      /* bookshelf + plant */
      r(14, 96, 48, 54, '#7a4a2b'); r(16, 98, 44, 50, '#5a3520');
      [115, 132].forEach(y => r(16, y, 44, 2, '#7a4a2b'));
      const bookC = ['#c74634', '#2f6fdf', '#e3b341', '#3f8f4f', '#9a5bd1', '#e8e2d6', '#ff4f1f', '#2a9d8f'];
      [[98, 17], [117, 15], [134, 14]].forEach(([y0, hMax], s) => {
        let x = 17;
        while (x < 58) {
          const bw = 2 + Math.floor(rand() * 3), bh = hMax - Math.floor(rand() * 5);
          if (x + bw > 59) break;
          const c = bookC[Math.floor(rand() * bookC.length)];
          if (s === 2 && x > 44) { // a leaning book
            line(x, y0 + hMax - 1, x + 6, y0 + 4, c); line(x + 1, y0 + hMax - 1, x + 7, y0 + 4, c);
            break;
          }
          r(x, y0 + (hMax - bh) + 1, bw, bh - 1, c);
          px(x, y0 + (hMax - bh) + 3, 'rgba(255,255,255,.35)');
          x += bw + (rand() > .8 ? 1 : 0);
        }
      });
      r(20, 88, 12, 8, '#c0643c'); r(19, 87, 14, 2, '#d77a50');
      const leaf = ['#3f8f4f', '#2f6f3f', '#57a865'];
      [[26, 86, 20, 74], [26, 86, 31, 72], [26, 86, 36, 80], [26, 86, 16, 82], [26, 86, 25, 70]].forEach(([a, b, c, d], i) => {
        line(a, b, c, d, leaf[i % 3]); line(a + 1, b, c + 1, d, leaf[(i + 1) % 3]);
      });
      // can of tennis balls
      r(42, 84, 9, 12, 'rgba(230,240,250,.55)'); r(42, 84, 9, 2, ACCENT); r(42, 94, 9, 2, '#d9d3c4');
      disc(46, 88, 2, '#d7f031'); disc(46, 92, 1, '#c3dc22'); px(45, 87, '#f4ffd0');

      /* desk legs + under-desk stuff */
      r(112, 116, 4, 42, '#6e4326'); r(254, 116, 4, 42, '#6e4326');
      // briefcase
      r(124, 142, 26, 15, '#8b4a2b'); r(124, 142, 26, 2, '#a65d38');
      r(133, 139, 8, 3, '#5a2f1b'); r(135, 140, 4, 2, P.wall === NIGHT.wall ? '#3b2416' : '#7a4a2b');
      r(136, 146, 2, 3, '#e3b341'); r(124, 157, 26, 1, P.shadow);
      // pc tower
      r(225, 126, 20, 31, '#22252c'); r(227, 128, 16, 1, '#343844');
      for (let y = 132; y < 150; y += 3) r(229, y, 12, 1, '#2d313a');
      const led = (t % 12) < 7;
      px(240, 153, led ? '#45f08a' : '#1d5a36'); px(237, 153, (t % 5) < 2 ? '#ff9f43' : '#5a3a1a');
      r(225, 157, 20, 1, P.shadow);

      /* tennis: racquet poking out of a bag */
      const rcx = 281, rcy = 92, rx = 8, ry = 11;
      for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
        const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        if (d <= 1 && d >= .66) px(rcx + x, rcy + y, d > .85 ? '#22252c' : '#3a3f4a');
        else if (d < .66 && ((x + 40) % 2 === 0 || (y + 40) % 2 === 0)) px(rcx + x, rcy + y, '#e8e2d6');
      }
      r(rcx - 3, rcy - ry, 2, 2, ACCENT); r(rcx + 2, rcy - ry, 2, 2, ACCENT);
      line(rcx - 3, rcy + ry, rcx - 1, rcy + ry + 6, '#22252c'); line(rcx + 3, rcy + ry, rcx + 1, rcy + ry + 6, '#22252c');
      r(rcx - 1, rcy + ry + 5, 3, 4, '#22252c');
      // second racquet's handle
      r(290, 104, 4, 9, '#f4efe6'); for (let y = 105; y < 113; y += 2) r(290, y, 4, 1, '#cfc8b8'); r(290, 103, 4, 1, '#22252c');
      // the bag
      r(270, 111, 28, 2, '#1f6f5c'); r(268, 113, 32, 39, '#1f6f5c'); r(270, 152, 28, 1, '#1f6f5c');
      r(268, 113, 2, 39, '#2a8a72'); r(298, 113, 2, 39, '#174f42');
      r(270, 116, 28, 1, '#174f42');
      r(268, 123, 32, 3, '#f4efe6'); r(268, 126, 32, 1, ACCENT);
      r(272, 131, 24, 15, '#1a5e4e'); r(273, 133, 22, 1, '#123d33'); r(282, 134, 3, 2, '#d9d3c4');
      line(269, 114, 297, 150, '#123d33');
      r(266, 153, 36, 1, P.shadow);

      r(108, 112, 154, 4, '#b0703f'); r(108, 116, 154, 2, '#8a5530'); r(108, 112, 154, 1, '#c98552');

      /* lamp */
      r(116, 108, 12, 4, '#2a2d35'); line(122, 108, 118, 92, '#3a3f4a'); line(123, 108, 119, 92, '#3a3f4a');
      line(118, 92, 128, 82, '#3a3f4a'); line(119, 92, 129, 82, '#3a3f4a');
      r(126, 78, 10, 6, ACCENT); r(128, 77, 6, 1, '#ff7a4f'); r(127, 84, 8, 1, '#c73a12');

      /* monitor */
      r(172, 104, 8, 8, '#2a2d35'); r(164, 110, 24, 2, '#2a2d35');
      r(140, 62, 72, 42, '#15171c'); r(143, 65, 66, 35, '#0d1b2a');
      r(143, 65, 66, 4, '#16263a'); px(145, 66, '#ff5f57'); px(147, 66, '#febc2e'); px(149, 66, '#28c840');
      r(154, 66, 14, 2, '#24364f');
      const codeC = ['#ff7a59', '#7fd1b9', '#f6c35b', '#9aa7ff', '#e6e6e6', '#c792ea'];
      const crand = rng(42);
      const rows = 7, typed = reduceMotion ? rows : Math.min(rows, Math.floor((t % 90) / 9) + 1);
      let lastX = 146, lastY = 71;
      for (let i = 0; i < rows; i++) {
        const y = 71 + i * 4;
        let x = 146 + (i % 3 === 0 ? 0 : (i % 3) * 4);
        const segs = 2 + Math.floor(crand() * 3);
        for (let s = 0; s < segs; s++) {
          const len = 3 + Math.floor(crand() * 10);
          const c = codeC[Math.floor(crand() * codeC.length)];
          if (i < typed && x + len < 206) { r(x, y, len, 2, c); lastX = x + len + 1; lastY = y; }
          x += len + 2;
        }
      }
      if ((t % 8) < 4) r(Math.min(lastX, 205), lastY, 2, 2, '#ffffff');
      // screen glow at night
      if (night) { ctx.fillStyle = 'rgba(120,170,255,.06)'; ctx.fillRect(132, 58, 88, 56); }

      /* keyboard + mouse */
      r(148, 108, 52, 4, '#2a2d35');
      for (let x = 150; x < 198; x += 3) { px(x, 109, '#4a4f5c'); px(x + 1, 110, '#4a4f5c'); }
      for (let x = 150; x < 198; x++) px(x, 111, ['#ff4f1f', '#f6c35b', '#7fd1b9', '#9aa7ff'][((x + t) >> 2) % 4]);
      r(204, 109, 5, 3, '#d9d3c4'); px(206, 109, '#9a958a');

      /* rubber duck */
      const dq = hovered === 'duck' && (t % 4) < 2 ? -2 : 0;
      r(131, 106 + dq, 9, 6, '#f6c935'); r(134, 102 + dq, 6, 5, '#f6c935');
      r(140, 104 + dq, 3, 2, '#ff8a1f'); px(137, 103 + dq, '#1a1a1a'); r(131, 106 + dq, 2, 2, '#e0b020');
      r(133, 108 + dq, 4, 1, '#e0b020');

      /* mug + steam */
      r(228, 102, 9, 10, '#f4efe6'); r(237, 104, 2, 5, '#f4efe6'); r(239, 105, 1, 3, '#f4efe6');
      r(229, 103, 7, 1, '#5a3520'); r(229, 107, 7, 2, ACCENT);
      if (!reduceMotion) for (let i = 0; i < 3; i++) {
        const sy = 99 - ((t + i * 6) % 18);
        const sx = 230 + i * 2 + Math.round(Math.sin((t + i * 8) / 4));
        const a = 1 - ((t + i * 6) % 18) / 18;
        ctx.fillStyle = `rgba(255,255,255,${(a * .55).toFixed(2)})`;
        ctx.fillRect(sx, sy, 1, 2);
      }

      /* résumé stack */
      r(244, 106, 15, 6, '#e8e2d6'); r(245, 105, 15, 6, '#fbf8f1');
      r(247, 106, 6, 1, ACCENT); r(247, 108, 10, 1, '#b3a483'); r(247, 110, 8, 1, '#b3a483');

      /* tennis ball */
      let by = BALL_Y;
      if (ball.start >= 0) {
        const p = Math.min(1, (t - ball.start) / ball.dur);
        ball.x = Math.round(ball.from + (ball.to - ball.from) * p);
        by = BALL_Y - Math.round(Math.abs(Math.sin(p * Math.PI * 3)) * 16 * (1 - p));
        if (p >= 1) ball.start = -1;
        if (spots.ball) { spots.ball.x = ball.x - 4; spots.ball.el.style.left = ((ball.x - 4) / W * 100) + '%'; }
      }
      r(ball.x - 2, BALL_Y + 2, 5, 1, P.shadow);
      disc(ball.x, by, 2, '#d7f031'); px(ball.x - 1, by - 1, '#f4ffd0'); px(ball.x + 1, by + 1, '#b9d11c');

      /* bulb */
      if (lampOn) r(128, 85, 6, 1, '#ffe9a8');

      /* lamp light */
      if (night) {
        if (lampOn) {
        ctx.fillStyle = 'rgba(255,214,140,.10)';
        ctx.beginPath(); ctx.moveTo(127, 85); ctx.lineTo(135, 85); ctx.lineTo(162, 112); ctx.lineTo(104, 112); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,214,140,.08)';
        ctx.fillRect(104, 110, 60, 3);
        }
        // shooting star every so often
        const ss = t % 70;
        if (!reduceMotion && ss < 6) {
          const sx = 72 - ss * 8, sy = 26 + ss * 3;
          ctx.save(); ctx.beginPath(); ctx.rect(19, 23, 64, 60); ctx.clip();
          line(sx, sy, sx + 6, sy - 2, 'rgba(255,255,255,.5)'); px(sx, sy, '#ffffff');
          ctx.restore();
        }
        // darken edges of room at night
        const g = ctx.createRadialGradient(170, 95, 40, 170, 95, 210);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, lampOn ? 'rgba(4,6,18,.45)' : 'rgba(4,6,18,.62)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      /* hover outline */
      if (hovered && spots[hovered]) {
        const b = spots[hovered];
        const c = (t % 6) < 3 ? '#ffffff' : ACCENT;
        r(b.x - 2, b.y - 2, b.w + 4, 1, c); r(b.x - 2, b.y + b.h + 1, b.w + 4, 1, c);
        r(b.x - 2, b.y - 2, 1, b.h + 4, c); r(b.x + b.w + 1, b.y - 2, 1, b.h + 4, c);
      }
    }

    let last = 0;
    function loop(ts) {
      if (ts - last > 110) { frame++; draw(); last = ts; }
      requestAnimationFrame(loop);
    }

    draw();
    if (!reduceMotion) requestAnimationFrame(loop);

    return {
      redraw: draw,
      toggleLamp() { lampOn = !lampOn; draw(); },
      bounce() {
        if (ball.start >= 0) return;
        ball.from = ball.x;
        ball.to = ball.x > 240 ? 165 + Math.floor(Math.random() * 50) : 300;
        ball.start = frame;
        if (reduceMotion) { ball.x = ball.to; ball.start = -1; draw(); }
      }
    };
  })();
})();
