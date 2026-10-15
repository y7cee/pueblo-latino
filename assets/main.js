(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PAL = ['#E5177A', '#F7B32B', '#1E8C5A', '#0FA3A3', '#E0401F', '#2D5BD8', '#8B3FD1'];

  /* ---------- Horaires et statut en direct ---------- */
  // 0 = dimanche … 6 = samedi, en minutes depuis minuit
  const HOURS = { 0: [600, 1050], 1: null, 2: [600, 1200], 3: [600, 1200], 4: [600, 1200], 5: [600, 1230], 6: [600, 1230] };
  const fmt = m => Math.floor(m / 60) + 'h' + (m % 60 ? String(m % 60).padStart(2, '0') : '');
  function nowBxl() {
    try {
      const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const g = t => p.find(x => x.type === t).value;
      return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), m: +g('hour') * 60 + +g('minute') };
    } catch (e) { const n = new Date(); return { d: n.getDay(), m: n.getHours() * 60 + n.getMinutes() }; }
  }
  function status() {
    const { d, m } = nowBxl(), h = HOURS[d];
    if (h && m >= h[0] && m < h[1]) return { open: true, txt: 'Ouvert · jusqu\'à ' + fmt(h[1]) };
    for (let k = 0; k < 8; k++) {
      const dd = (d + k) % 7, hh = HOURS[dd]; if (!hh) continue;
      if (k === 0 && m < hh[0]) return { open: false, txt: 'Fermé · ouvre à ' + fmt(hh[0]) };
      if (k > 0) return { open: false, txt: 'Fermé · ouvre ' + (k === 1 ? 'demain' : ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][dd]) + ' à ' + fmt(hh[0]) };
    }
    return { open: false, txt: 'Fermé' };
  }
  function paintStatus() {
    const s = status();
    $$('.status').forEach(el => { el.classList.toggle('open', s.open); el.classList.toggle('closed', !s.open); const t = $('span', el); if (t) t.textContent = s.txt; });
    const d = nowBxl().d; $$('.hours li').forEach(li => li.classList.toggle('today', +li.dataset.d === d));
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- Rideau entre les pages ---------- */
  const curtain = $('.curtain');
  let cameIn = false; try { cameIn = sessionStorage.getItem('pl-cur') === '1'; sessionStorage.removeItem('pl-cur'); } catch (e) {}
  if (curtain && cameIn && !reduce) { curtain.classList.add('in'); setTimeout(() => curtain.classList.remove('in'), 1000); }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || !curtain || reduce) return;
    const href = a.getAttribute('href');
    if (!/^[a-z-]+\.html(\?.*)?$/.test(href) || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); curtain.classList.remove('in'); curtain.classList.add('out');
    try { sessionStorage.setItem('pl-cur', '1'); } catch (er) {}
    setTimeout(() => { location.href = href; }, 520);
  });
  addEventListener('pageshow', e => { if (e.persisted && curtain) curtain.classList.remove('out', 'in'); });

  /* ---------- Papel picado ---------- */
  const circ = (x, y, r) => `M${x - r},${y}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0Z`;
  const dia = (x, y, w, h) => `M${x},${y - h}L${x + w},${y}L${x},${y + h}L${x - w},${y}Z`;
  const zig = (() => { let d = 'M0,0H60V72'; for (let x = 60; x > 0; x -= 6) d += `L${x - 3},78L${x - 6},72`; return d + 'Z'; })();
  const P1 = (() => { let d = circ(30, 38, 4); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; d += circ(30 + Math.cos(a) * 12.5, 38 + Math.sin(a) * 12.5, 4.4); } d += dia(10, 14, 4, 5) + dia(50, 14, 4, 5) + dia(10, 62, 4, 5) + dia(50, 62, 4, 5); for (let x = 12; x <= 48; x += 9) d += circ(x, 66, 1.6); return d; })();
  const P2 = (() => { let d = dia(30, 38, 17, 21) + dia(30, 38, 9, 11) + circ(30, 38, 3.2); d += 'M5,8L16,8L5,20Z' + 'M55,8L44,8L55,20Z' + 'M5,68L16,68L5,56Z' + 'M55,68L44,68L55,56Z'; return d; })();
  const P3 = (() => { let d = circ(30, 38, 7); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, b = .17; d += `M${(30 + Math.cos(a - b) * 10.5).toFixed(2)},${(38 + Math.sin(a - b) * 10.5).toFixed(2)}L${(30 + Math.cos(a) * 21).toFixed(2)},${(38 + Math.sin(a) * 21).toFixed(2)}L${(30 + Math.cos(a + b) * 10.5).toFixed(2)},${(38 + Math.sin(a + b) * 10.5).toFixed(2)}Z`; } d += circ(8, 10, 2.4) + circ(52, 10, 2.4) + circ(8, 68, 2.4) + circ(52, 68, 2.4); return d; })();
  const MASKS = [P1, P2, P3].map(p => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 80'><path fill-rule='evenodd' d='${zig}${p}'/></svg>`)}")`);
  const picados = [];
  function buildPicado(el) {
    el.innerHTML = ''; const W = el.clientWidth, H = el.clientHeight; if (W < 50) return;
    const fw = W < 640 ? 38 : W < 1100 ? 46 : 54, rows = el.dataset.rows ? +el.dataset.rows : 2;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'strings'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('aria-hidden', 'true'); el.append(svg);
    const flags = [];
    for (let r = 0; r < rows; r++) {
      const y0 = 6 + r * (fw * .9), sag = 18 + r * 8, gap = fw * 1.22, off = r % 2 ? gap / 2 : 0;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', `M-20,${y0} Q${W / 2},${y0 + sag * 2} ${W + 20},${y0}`); svg.append(p);
      for (let x = off + fw / 2; x < W; x += gap) {
        const t = (x + 20) / (W + 40), y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * (y0 + sag * 2) + t * t * y0;
        const f = document.createElement('i'); f.className = 'flag';
        const k = flags.length + r * 3;
        f.style.cssText = `--fw:${fw}px;--c:${PAL[k % PAL.length]};--m:${MASKS[(k + r) % 3]};left:${(x - fw / 2).toFixed(1)}px;top:${y.toFixed(1)}px`;
        el.append(f); flags.push({ el: f, x, a: 0, v: 0, ph: Math.random() * 6.28, r });
      }
    }
    el.__flags = flags;
  }
  $$('.picado').forEach(el => { buildPicado(el); picados.push(el); });
  let lastW = innerWidth; addEventListener('resize', () => { if (Math.abs(innerWidth - lastW) > 30) { lastW = innerWidth; picados.forEach(buildPicado); } });
  let px = -999, py = -999, pvx = 0, lastPx = null;
  addEventListener('pointermove', e => { if (lastPx !== null) pvx = pvx * .6 + (e.clientX - lastPx) * .4; lastPx = e.clientX; px = e.clientX; py = e.clientY; }, { passive: true });
  if (!reduce && picados.length) {
    let t0 = performance.now();
    const loop = t => {
      const dt = Math.min(32, t - t0) / 16.67; t0 = t; const s = t / 1000;
      picados.forEach(el => {
        const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || !el.__flags) return;
        el.__flags.forEach(f => {
          const breeze = Math.sin(s * 1.3 + f.ph) * 2.2 + Math.sin(s * .5 + f.x * .004) * 3;
          const fy = r.top + 30 + f.r * 45, d = Math.hypot(px - (r.left + f.x), py - fy);
          if (d < 140) f.v += pvx * .09 * (1 - d / 140);
          f.v += (-(f.a - breeze) * .06 - f.v * .08) * dt; f.a += f.v * dt; f.a = clamp(f.a, -40, 40);
          f.el.style.transform = `rotate(${f.a.toFixed(2)}deg) skewX(${(f.a * .25).toFixed(2)}deg)`;
        });
      });
      pvx *= .9; requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Titres découpés lettre par lettre ---------- */
  $$('[data-split]').forEach(h => {
    let i = 0;
    $$('.row, .sp', h).forEach(row => {
      const txt = row.textContent; row.textContent = '';
      [...txt].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = c === ' ' ? ' ' : c; row.append(s); });
    });
  });
  const go = () => requestAnimationFrame(() => { $$('[data-split], .collage').forEach(el => el.classList.add('go')); setTimeout(() => $$('.collage').forEach(c => c.classList.add('live')), 2200); });
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(go); else go();

  /* Collage : parallaxe à la souris */
  const col = $('.collage');
  if (col && fine && !reduce) {
    const phs = $$('.ph', col), dep = [18, -26, 12];
    addEventListener('pointermove', e => {
      if (!col.classList.contains('live')) return;
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      phs.forEach((p, i) => { p.style.setProperty('--px', (x * dep[i]).toFixed(1) + 'px'); p.style.setProperty('--py', (y * dep[i]).toFixed(1) + 'px'); });
    }, { passive: true });
  }

  /* ---------- Bandes défilantes liées au défilement ---------- */
  const marqs = $$('.marq-track').map((t, i) => { t.innerHTML += t.innerHTML; return { t, x: 0, dir: i % 2 ? 1 : -1 }; });
  let lastY = scrollY, vel = 0;
  if (marqs.length && !reduce) {
    const loop = () => {
      const dy = scrollY - lastY; lastY = scrollY; vel = vel * .9 + dy * .1;
      marqs.forEach(m => {
        const w = m.t.scrollWidth / 2; m.x += (0.6 + Math.abs(vel) * .35) * m.dir * (vel < -.5 ? -1 : 1);
        if (m.x <= -w) m.x += w; if (m.x > 0) m.x -= w;
        m.t.style.transform = `translate3d(${m.x.toFixed(1)}px,0,0) skewX(${clamp(-vel * .4, -8, 8).toFixed(2)}deg)`;
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Cartes inclinables ---------- */
  if (fine && !reduce) $$('.ray').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); c.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg'); });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
  });

  /* ---------- Texte révélé + parallaxe ---------- */
  $$('.reveal-txt').forEach(el => {
    const words = [];
    el.childNodes.forEach(n => words.push(n));
    const frag = document.createDocumentFragment();
    words.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) frag.append(document.createTextNode(' ')); else { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.append(s); } });
      else { n.classList.add('w'); frag.append(n); }
    });
    el.textContent = ''; el.append(frag);
  });
  const revs = $$('.reveal-txt'), pars = $$('[data-par]');
  function onScroll() {
    revs.forEach(el => {
      const r = el.getBoundingClientRect(), p = clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35), 0, 1), ws = $$('.w', el), n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', reduce || i < n));
    });
    if (!reduce) pars.forEach(el => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; el.style.transform = `translate3d(0,${(p * -(+el.dataset.par || 60)).toFixed(1)}px,0)`; });
  }
  onScroll(); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);

  /* ---------- Apparitions ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
    $$('[data-rv]').forEach(el => io.observe(el));
  } else $$('[data-rv]').forEach(el => el.classList.add('in'));

  /* ---------- Le voyage ---------- */
  const trip = $('#trip');
  if (trip) {
    const C = JSON.parse($('#trip-data').textContent);
    const stage = $('#stage'), wipe = $('.stage-wipe', stage), inner = $('.stage-in', stage), btns = $$('.trip-list button');
    let cur = -1, busy = 0;
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    function paint(c) {
      stage.style.setProperty('--c1', c.c1); stage.style.setProperty('--t', c.t);
      stage.style.setProperty('--tag-bg', c.tb); stage.style.setProperty('--tag-c', c.tc);
      let i = 0; const name = [...c.name].map(ch => `<span class="ch" style="--i:${i++}">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('');
      inner.innerHTML = `<span class="stage-k">Destino ${String(C.indexOf(c) + 1).padStart(2, '0')} / ${String(C.length).padStart(2, '0')}</span>
        <h2 class="stage-name" aria-live="polite">${name}</h2>
        <p class="stage-line">${esc(c.line)}</p>
        <p class="stage-desc">${esc(c.desc)}</p>
        ${c.brands ? `<p class="stage-brands">À ramener : <b>${esc(c.brands)}</b></p>` : ''}
        <div class="stage-tags">${c.tags.map((t, k) => `<span style="--i:${k};--rot:${((k * 37) % 9 - 4)}deg">${esc(t)}</span>`).join('')}</div>`;
      $('.sello', stage).innerHTML = `<span>${esc(c.code)}<small>Pueblo Latino</small></span>`;
      const sello = $('.sello', stage); sello.style.animation = 'none'; void sello.offsetWidth; sello.style.animation = '';
      $('.stage-stripes', stage).innerHTML = c.stripes.map((s, k) => `<i style="background:${s};animation-delay:${k * 90}ms"></i>`).join('');
    }
    function show(i, from) {
      if (i === cur || busy) return; cur = i; const c = C[i];
      btns.forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
      if (reduce || !from) { paint(c); return; }
      const sr = stage.getBoundingClientRect(), br = from.getBoundingClientRect();
      const wx = clamp(br.left + br.width / 2 - sr.left, 0, sr.width), wy = clamp(br.top + br.height / 2 - sr.top, 0, sr.height);
      stage.style.setProperty('--wx', wx + 'px'); stage.style.setProperty('--wy', wy + 'px');
      wipe.style.background = c.c1; wipe.classList.remove('go'); void wipe.offsetWidth; wipe.classList.add('go'); busy = 1;
      setTimeout(() => paint(c), 260);
      setTimeout(() => { stage.style.setProperty('--c1', c.c1); wipe.classList.remove('go'); busy = 0; }, 920);
    }
    btns.forEach((b, i) => {
      b.addEventListener('click', () => show(i, b));
      b.addEventListener('keydown', e => { const n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0; if (n) { e.preventDefault(); const k = (cur + n + C.length) % C.length; btns[k].focus(); show(k, btns[k]); } });
    });
    let sx = 0; stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) { const k = (cur + (dx < 0 ? 1 : -1) + C.length) % C.length; show(k, btns[k]); } });
    const want = (location.hash || '').slice(1), start = Math.max(0, C.findIndex(c => c.id === want));
    show(start, null);
  }

  /* ---------- Picantómetro ---------- */
  const heat = $('#heat');
  if (heat) {
    const L = JSON.parse($('#heat-data').textContent);
    const range = $('#heat-range'), name = $('#heat-name'), sub = $('#heat-sub'), desc = $('#heat-desc'), chs = $$('.chilis button'), img = $('.heat-photo img'), turb = $('#haze-t'), disp = $('#haze-d');
    let lv = 1;
    function setLv(n) {
      lv = clamp(n, 1, 5); const d = L[lv - 1]; range.value = lv;
      heat.style.setProperty('--hb', d.c);
      name.textContent = d.name; sub.textContent = d.sub; desc.textContent = d.desc;
      name.classList.toggle('shake', lv === 4); name.classList.toggle('shake2', lv === 5);
      chs.forEach((b, k) => { b.classList.toggle('on', k < lv); b.setAttribute('aria-pressed', String(k < lv)); });
      if (img) img.style.filter = `saturate(${1 + lv * .12}) contrast(${1 + lv * .04})` + (lv >= 3 && !reduce ? ' url(#haze)' : '');
      if (disp) disp.setAttribute('scale', String(lv >= 3 ? (lv - 2) * 6 : 0));
      range.setAttribute('aria-valuetext', d.name);
    }
    range.addEventListener('input', () => setLv(+range.value));
    chs.forEach((b, k) => b.addEventListener('click', () => setLv(k + 1)));
    setLv(1);
    // braises
    const cv = $('canvas', heat), cx = cv.getContext('2d'); let parts = [], W = 0, H = 0;
    const size = () => { const r = heat.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    const spawn = () => ({ x: Math.random() * W, y: H + 10, r: 1 + Math.random() * (1.5 + lv * .7), vy: -(0.4 + Math.random() * (0.6 + lv * .55)), vx: (Math.random() - .5) * .6, life: 0, max: 200 + Math.random() * 200, h: 30 + Math.random() * 25 - lv * 6 });
    let fr = 0;
    const loop = () => {
      cx.clearRect(0, 0, W, H); const target = lv * 26;
      while (parts.length < target) parts.push(spawn());
      parts = parts.filter(p => p.life < p.max && p.y > -20);
      parts.forEach((p, i) => {
        p.life++; p.y += p.vy; p.x += p.vx + Math.sin((p.life + i) * .05) * .3;
        const a = Math.sin(Math.PI * p.life / p.max) * (.35 + lv * .1);
        cx.beginPath(); cx.fillStyle = `hsla(${p.h},100%,${lv > 2 ? 62 : 85}%,${a})`; cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      });
      if (turb && lv >= 3) { fr += .004 + lv * .002; turb.setAttribute('baseFrequency', `${(0.012 + Math.sin(fr) * .004).toFixed(4)} ${(0.04 + Math.cos(fr * 1.3) * .01).toFixed(4)}`); }
      requestAnimationFrame(loop);
    };
    if (!reduce) requestAnimationFrame(loop);
  }

  /* ---------- Empanadas : le panier ---------- */
  const bask = $('#basket');
  if (bask) {
    const PRICE = +bask.dataset.price || 1.2;
    const cv = $('canvas', bask), g = cv.getContext('2d'), out = $('#qty'), tot = $('#total'), cta = $('#emp-cta'), presets = $$('.presets button');
    let W = 0, H = 0, R = 0, cxp = 0, cyp = 0, er = 0, items = [], n = 0, shownTot = 0, sc = 1, scT = 1;
    function size() { const r = bask.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); R = W * .42; cxp = W / 2; cyp = H * .42; er = W * .055; }
    size(); addEventListener('resize', () => { size(); items.forEach(it => { it.x = clamp(it.x, cxp - R + er, cxp + R - er); }); });
    function add() { items.push({ x: cxp + (Math.random() - .5) * R * .7, y: -er * 2 - Math.random() * 60, px: 0, py: 0, a: (Math.random() - .5) * 1.2, va: (Math.random() - .5) * .1, out: 0 }); const it = items[items.length - 1]; it.px = it.x; it.py = it.y - 2; }
    function setN(v) {
      n = clamp(v, 0, 60); out.value = out.textContent = n; scT = Math.max(.62, Math.min(1, Math.sqrt(12 / Math.max(n, 12))));
      while (items.filter(i => !i.out).length < n) add();
      const live = items.filter(i => !i.out); for (let k = live.length - 1; k >= n; k--) live[k].out = 1;
      presets.forEach(b => b.classList.toggle('on', +b.dataset.n === n));
      if (cta) cta.href = 'contact.html?empanadas=' + n;
      if (reduce) shownTot = n * PRICE;
      if (reduce || !bask.__loop) { tot.textContent = (n * PRICE).toFixed(2).replace('.', ',') + ' €'; drawStatic(); }
    }
    $('#qty-m').addEventListener('click', () => setN(n - 1));
    $('#qty-p').addEventListener('click', () => setN(n + 1));
    presets.forEach(b => b.addEventListener('click', () => setN(+b.dataset.n)));
    function emp(x, y, a, s) {
      g.save(); g.translate(x, y); g.rotate(a); const r = er * 1.25 * s;
      g.beginPath(); g.moveTo(-r, r * .25); g.arc(0, r * .25, r, Math.PI, 0); g.closePath();
      const gr = g.createLinearGradient(0, -r, 0, r * .3); gr.addColorStop(0, '#F2B84B'); gr.addColorStop(1, '#C97B22');
      g.fillStyle = gr; g.fill();
      g.fillStyle = 'rgba(120,60,10,.45)'; for (let k = 1; k < 10; k++) { const t = Math.PI + k * Math.PI / 10; g.beginPath(); g.arc(Math.cos(t) * r * .86, r * .25 + Math.sin(t) * r * .86, r * .07, 0, 6.283); g.fill(); }
      g.fillStyle = 'rgba(255,240,200,.35)'; g.beginPath(); g.ellipse(-r * .2, -r * .25, r * .35, r * .12, -.3, 0, 6.283); g.fill();
      g.restore();
    }
    function basket(front) {
      g.save();
      if (!front) {
        g.fillStyle = '#5A3218'; g.beginPath(); g.arc(cxp, cyp, R, 0, Math.PI); g.closePath(); g.fill();
        g.fillStyle = '#3E2010'; g.beginPath(); g.ellipse(cxp, cyp, R, R * .16, 0, 0, 6.283); g.fill();
      } else {
        g.beginPath(); g.arc(cxp, cyp, R, 0, Math.PI); g.lineTo(cxp - R * .78, cyp); g.arc(cxp, cyp, R * .78, Math.PI, 0, true); g.closePath();
        g.fillStyle = '#9C5E2B'; g.fill();
        g.strokeStyle = 'rgba(60,30,10,.45)'; g.lineWidth = 2;
        for (let k = 1; k < 4; k++) { g.beginPath(); g.arc(cxp, cyp, R * (.78 + k * .055), .1, Math.PI - .1); g.stroke(); }
        g.lineWidth = 6; g.strokeStyle = '#C98A45'; g.beginPath(); g.ellipse(cxp, cyp, R, R * .16, 0, 0, Math.PI); g.stroke();
        const colors = ['#E5177A', '#F7B32B', '#1E8C5A', '#0FA3A3'];
        for (let k = 0; k < 4; k++) { g.strokeStyle = colors[k]; g.lineWidth = 7; g.beginPath(); g.arc(cxp, cyp, R * (.8 + k * .045), .35 + k * .03, Math.PI - .35 - k * .03); g.stroke(); }
      }
      g.restore();
    }
    function drawStatic() { g.clearRect(0, 0, W, H); basket(false); items.filter(i => !i.out).forEach((it, k) => { const row = Math.floor(k / 7), col = k % 7; emp(cxp - R * .6 + col * R * .2, cyp + R * .55 - row * er * 1.3, (k % 3 - 1) * .3, 1); }); basket(true); }
    function step() {
      sc += (scT - sc) * .08; const gr = .45, fl = cyp + R * .78, e = er * sc;
      items.forEach(it => {
        if (it.out) { it.y -= 9; it.a += .2; return; }
        const vx = (it.x - it.px) * .98, vy = (it.y - it.py) * .98; it.px = it.x; it.py = it.y; it.x += vx; it.y += vy + gr; it.a += it.va; it.va *= .96;
      });
      for (let iter = 0; iter < 7; iter++) {
        const live = items.filter(i => !i.out);
        for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01, m = e * 1.8;
          if (d < m) { const k = (m - d) / d * .5, side = (Math.random() - .5) * .6; a.x -= dx * k + side; a.y -= dy * k; b.x += dx * k + side; b.y += dy * k; }
        }
        live.forEach(it => {
          if (it.y > cyp) { const dx = it.x - cxp, dy = it.y - cyp, d = Math.hypot(dx, dy), lim = R * .8 - e; if (d > lim) { it.x = cxp + dx / d * lim; it.y = cyp + dy / d * lim; it.va += dx > 0 ? -.01 : .01; } }
          else it.x = clamp(it.x, cxp - R * .8 + e, cxp + R * .8 - e);
          if (it.y > fl - e) it.y = fl - e;
        });
      }
      items = items.filter(it => !(it.out && it.y < -80));
    }
    const loop = () => {
      step(); g.clearRect(0, 0, W, H); basket(false);
      items.forEach(it => emp(it.x, it.y, it.a, sc)); basket(true);
      const target = n * PRICE; shownTot += (target - shownTot) * .15; if (Math.abs(target - shownTot) < .005) shownTot = target;
      tot.textContent = shownTot.toFixed(2).replace('.', ',') + ' €';
      requestAnimationFrame(loop);
    };
    if (!reduce) { bask.__loop = 1; requestAnimationFrame(loop); }
    let started = false;
    const startIt = () => { if (!started) { started = true; setN(6); } };
    if ('IntersectionObserver' in window && !reduce) new IntersectionObserver((es, o) => es.forEach(en => { if (en.isIntersecting) { startIt(); o.disconnect(); } }), { threshold: .3 }).observe(bask);
    else startIt();
  }

  /* ---------- Formulaire (Web3Forms) ---------- */
  const WEB3FORMS_KEY = 'VOTRE_CLE_WEB3FORMS';
  const form = $('#contact-form');
  if (form) {
    const q = new URLSearchParams(location.search), ne = parseInt(q.get('empanadas'), 10);
    if (ne > 0) { $('#f-sujet').value = 'Réserver des empanadas'; $('#f-msg').value = `Bonjour, je voudrais réserver ${ne} empanada${ne > 1 ? 's' : ''} pour le … (jour et heure de passage).`; }
    const msg = $('#form-msg');
    form.addEventListener('submit', async e => {
      e.preventDefault(); msg.className = 'form-msg';
      const bad = $$('[required]', form).find(f => !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)));
      if (bad) { msg.classList.add('err'); msg.textContent = 'Vérifiez le champ « ' + $('label[for="' + bad.id + '"]', form).textContent + ' ».'; bad.focus(); return; }
      const key = $('[name="access_key"]', form); key.value = WEB3FORMS_KEY;
      if (WEB3FORMS_KEY === 'VOTRE_CLE_WEB3FORMS') { msg.classList.add('err'); msg.textContent = 'Le formulaire sera bientôt actif. En attendant, appelez-nous au 0479 84 37 44.'; return; }
      const btn = $('[type="submit"]', form); btn.disabled = true; msg.textContent = 'Envoi en cours…';
      try {
        const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        const j = await r.json(); if (!j.success) throw new Error(j.message);
        form.reset(); msg.classList.add('ok'); msg.textContent = '¡Gracias! Votre message est bien parti, on vous répond vite.';
      } catch (er) { msg.classList.add('err'); msg.textContent = "L'envoi n'a pas fonctionné. Appelez-nous au 0479 84 37 44."; }
      btn.disabled = false;
    });
  }

  /* ---------- En-tête, menu, retour en haut ---------- */
  const hd = $('.hd'); const onS = () => hd && hd.classList.toggle('scrolled', scrollY > 8); onS(); addEventListener('scroll', onS, { passive: true });
  const mm = $('#mm'), burger = $('#burger');
  if (mm && burger) {
    const setMenu = o => { mm.classList.toggle('open', o); mm.setAttribute('aria-hidden', String(!o)); mm.inert = !o; burger.setAttribute('aria-expanded', String(o)); document.body.classList.toggle('locked', o); if (o) setTimeout(() => $('.mm-close').focus({ preventScroll: true }), 80); };
    burger.addEventListener('click', () => setMenu(true));
    $('.mm-close').addEventListener('click', () => { setMenu(false); burger.focus(); });
    $$('#mm a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && mm.classList.contains('open')) { setMenu(false); burger.focus(); } });
    addEventListener('resize', () => { if (innerWidth > 1040 && mm.classList.contains('open')) setMenu(false); });
  }
  const tt = $('#to-top'); const t2 = () => tt && tt.classList.toggle('show', scrollY > 600); t2(); addEventListener('scroll', t2, { passive: true });
  $$('[data-top]').forEach(b => b.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })));
  $$('[data-year]').forEach(y => y.textContent = new Date().getFullYear());
})();
