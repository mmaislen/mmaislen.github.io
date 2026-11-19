/* A stylized Mount Si: a heightfield, cut into contour lines with marching squares, then drawn in 3D.
   Each contour sits at its own elevation, so turning the model shows the shape the way a 3D package would. */
(function () {
  const N = 72, LEVELS = 26;
  const g = (x, y, cx, cy, sx, sy, a) => a * Math.exp(-(((x - cx) ** 2) / (2 * sx * sx) + ((y - cy) ** 2) / (2 * sy * sy)));
  function height(x, y) {
    let h = g(x, y, 0.08, -0.02, 0.42, 0.2, 1.0)      // main summit
          + g(x, y, -0.42, 0.08, 0.3, 0.24, 0.62)     // western shoulder
          + g(x, y, 0.42, 0.22, 0.22, 0.3, 0.42)       // eastern ridge
          + g(x, y, -0.1, 0.5, 0.5, 0.18, 0.22);       // lower foothills
    h += g(x, y, 0.5, -0.25, 0.12, 0.1, 0.18) + g(x, y, -0.2, -0.35, 0.1, 0.16, -0.12);
    h += 0.05 * Math.sin(x * 8.3 + y * 2.9) * Math.cos(y * 6.1 - x * 2.4) + 0.025 * Math.sin(x * 17 - y * 13);
    const r = Math.sqrt(x * x + y * y);
    h *= Math.max(0, 1 - Math.pow(r / 1.05, 4));
    return Math.max(0, h);
  }
  const H = [];
  for (let j = 0; j <= N; j++) { H[j] = []; for (let i = 0; i <= N; i++) H[j][i] = height(-1 + 2 * i / N, -1 + 2 * j / N); }
  let max = 0; H.forEach(r => r.forEach(v => { if (v > max) max = v; }));
  const segs = [];
  for (let k = 1; k <= LEVELS; k++) {
    const t = (k / (LEVELS + 1)) * max;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const a = H[j][i], b = H[j][i + 1], c = H[j + 1][i + 1], d = H[j + 1][i];
      const pts = [];
      const edge = (v1, v2, x1, y1, x2, y2) => { if ((v1 < t) !== (v2 < t)) { const f = (t - v1) / (v2 - v1); pts.push([x1 + (x2 - x1) * f, y1 + (y2 - y1) * f]); } };
      edge(a, b, i, j, i + 1, j); edge(b, c, i + 1, j, i + 1, j + 1); edge(c, d, i + 1, j + 1, i, j + 1); edge(d, a, i, j + 1, i, j);
      for (let p = 0; p + 1 < pts.length; p += 2) segs.push([pts[p][0] / N * 2 - 1, pts[p][1] / N * 2 - 1, pts[p + 1][0] / N * 2 - 1, pts[p + 1][1] / N * 2 - 1, k]);
    }
  }
  // summit position
  let sx = 0, sy = 0, sv = 0;
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) if (H[j][i] > sv) { sv = H[j][i]; sx = -1 + 2 * i / N; sy = -1 + 2 * j / N; }

  function model(canvas, opts) {
    const ctx = canvas.getContext('2d');
    let angle = opts.angle, w = 0, h = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      if (!w) return;
      ctx.clearRect(0, 0, w, h);
      const s = Math.min(w, h * 1.0) * 0.56, cx = w * 0.5, cy = h * (w > h * 1.4 ? 0.82 : 0.76), tilt = opts.tilt, zs = 1.35 / max;
      const ca = Math.cos(angle), sa = Math.sin(angle), ct = Math.cos(tilt), st = Math.sin(tilt);
      const P = (x, y, z) => { const rx = x * ca - y * sa, ry = x * sa + y * ca; return [cx + rx * s, cy + (ry * st - z * zs * ct) * s]; };
      for (let k = 1; k <= LEVELS; k++) {
        const z = (k / (LEVELS + 1)) * max, index = k % 5 === 0;
        ctx.beginPath();
        for (const sg of segs) if (sg[4] === k) { const p = P(sg[0], sg[1], z), q = P(sg[2], sg[3], z); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
        ctx.strokeStyle = index ? opts.index : opts.line;
        ctx.lineWidth = index ? 1.6 : 0.9;
        ctx.globalAlpha = 0.45 + 0.55 * (k / LEVELS);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const top = P(sx, sy, sv);
      ctx.beginPath(); ctx.moveTo(top[0], top[1] - 4); ctx.lineTo(top[0], top[1] - 30); ctx.strokeStyle = opts.index; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(top[0], top[1] - 30); ctx.lineTo(top[0] + 18, top[1] - 25); ctx.lineTo(top[0], top[1] - 20); ctx.closePath(); ctx.fillStyle = '#f2b01e'; ctx.fill();
    }
    size(); draw();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); draw(); }, 100); });
    if (!opts.interactive) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dragging = false, lastX = 0, visible = true, spin = still ? 0 : 0.0012, last = performance.now();
    new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(canvas);
    canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (!dragging) return; angle += (e.clientX - lastX) * 0.008; lastX = e.clientX; draw(); });
    const stop = () => { dragging = false; };
    canvas.addEventListener('pointerup', stop); canvas.addEventListener('pointercancel', stop);
    if (still) return;
    (function loop(now) {
      const dt = Math.min(now - last, 50); last = now;
      if (visible && !dragging) { angle += spin * dt * 0.06; draw(); }
      requestAnimationFrame(loop);
    })(last);
  }
  const hero = document.getElementById('terrain-hero'), cta = document.getElementById('terrain-cta');
  if (hero) model(hero, { angle: -0.35, tilt: 0.55, line: '#7f978b', index: '#183a31', interactive: true });
  if (cta) model(cta, { angle: 0.9, tilt: 0.55, line: '#4f7366', index: '#a9c0b5', interactive: false });
})();
