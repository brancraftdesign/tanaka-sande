/* REVERE motion pieces. Each piece renders from a single time value, so the
   same code drives the live page and the frame-by-frame video export. */
(function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const easeOut = p => 1 - Math.pow(1 - p, 3);
  const easeInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const back = p => { const c = 1.4; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };

  function prepLines(root, sel) {
    return [...root.querySelectorAll(sel)].map(el => {
      const len = el.getTotalLength ? el.getTotalLength() : 0;
      el.style.strokeDasharray = len + ' ' + len;
      return { el, len };
    });
  }
  function drawLine(l, p) { l.el.style.strokeDashoffset = (l.len * (1 - p)).toFixed(2); }

  /* ---------- Drop 01: turntable draws itself, record spins, crate flip ---------- */
  function drop01(node) {
    const D = 12;
    const lines = prepLines(node, '.tt .ln');
    const fills = [...node.querySelectorAll('.tt .cf')];
    const rec = node.querySelector('.tt .rec');
    const arm = node.querySelector('.tt .arm');
    const inks = [...node.querySelectorAll('.tt .ink')];
    const word = node.querySelector('.d-word');
    const code = node.querySelector('.d-code');
    const foot = node.querySelector('.d-foot');
    const tt = node.querySelector('.d-tt');
    const cards = [...node.querySelectorAll('.d-crate img')];
    const end = node.querySelector('.d-end');
    const veil = node.querySelector('.d-veil');
    const n = lines.length;
    return {
      D, rest: 10.6,
      render(t) {
        t = ((t % D) + D) % D;
        lines.forEach((l, i) => {
          const s = 0.15 + (i / n) * 1.7;
          drawLine(l, easeInOut(prog(t, s, s + 0.95)));
        });
        inks.forEach(el => (el.style.opacity = prog(t, 1.6, 2.3)));
        fills.forEach((el, i) => {
          const p = easeOut(prog(t, 2.0 + i * 0.18, 2.9 + i * 0.18));
          el.style.opacity = p;
          el.style.transform = `translate(${(1 - p) * 16}px, ${(1 - p) * -12}px)`;
        });
        const a = easeInOut(prog(t, 2.8, 3.9));
        arm.style.transform = `rotate(${(1 - a) * -24}deg)`;
        // spin: accelerate from 3.7 s, then constant speed
        const sp = t < 3.7 ? 0 : (t < 4.7 ? 110 * Math.pow(t - 3.7, 2) : 110 + 220 * (t - 4.7));
        rec.style.transform = `rotate(${sp}deg)`;
        const w = easeOut(prog(t, 3.3, 4.2));
        word.style.opacity = w; word.style.transform = `translateY(${(1 - w) * 10}px)`;
        code.style.opacity = prog(t, 3.6, 4.3);
        foot.style.opacity = prog(t, 3.9, 4.6);
        // crate flip 6.0 – 9.6 s
        const crateOn = t > 5.85 && t < 9.75;
        tt.style.opacity = 1 - 0.85 * (prog(t, 5.6, 6.0) - prog(t, 9.5, 9.9));
        cards.forEach((c, i) => {
          const s = 6.0 + i * 0.6;
          const pin = easeOut(prog(t, s - 0.05, s + 0.25));
          const pout = prog(t, s + 0.45, s + 0.6);
          const last = i === cards.length - 1;
          const out = last ? prog(t, 9.4, 9.7) : pout;
          c.style.opacity = crateOn ? Math.min(pin * 1.4, 1) * (1 - out) : 0;
          c.style.transform = `perspective(900px) rotateX(${(1 - pin) * 70 - out * 75}deg) translateY(${(1 - pin) * 30}px)`;
        });
        const e = easeOut(prog(t, 9.8, 10.5));
        end.style.opacity = e; end.style.transform = `translateY(${(1 - e) * 8}px)`;
        foot.style.opacity = Math.min(prog(t, 3.9, 4.6), 1 - prog(t, 9.6, 9.9));
        veil.style.opacity = prog(t, 11.35, 11.95);
      }
    };
  }

  /* ---------- Walk home: the line draws, then the colour lands off-register ---------- */
  function walkhome(node) {
    const D = 9;
    const lines = prepLines(node, '.wh .ln');
    const sheet = node.querySelector('.wh .sheet');
    const fills = [...node.querySelectorAll('.wh .cf')];
    const inks = [...node.querySelectorAll('.wh .ink')];
    const lab = node.querySelector('.w-lab');
    const veil = node.querySelector('.w-veil');
    const n = lines.length;
    return {
      D, rest: 7.2,
      render(t) {
        t = ((t % D) + D) % D;
        const s0 = easeOut(prog(t, 0.05, 0.7));
        sheet.style.opacity = s0;
        sheet.style.transform = `scale(${0.97 + 0.03 * s0})`;
        lines.forEach((l, i) => {
          const s = 0.5 + (i / n) * 3.6;
          drawLine(l, easeInOut(prog(t, s, s + 0.8)));
        });
        inks.forEach(el => (el.style.opacity = prog(t, 3.6, 4.4)));
        fills.forEach((el, i) => {
          const p = easeOut(prog(t, 4.4 + i * 0.25, 5.4 + i * 0.25));
          el.style.opacity = p * 0.88;
          el.style.transform = `translate(${(1 - p) * 18}px, ${(1 - p) * -14}px)`;
        });
        lab.style.opacity = prog(t, 0.4, 1.0);
        veil.style.opacity = prog(t, 8.4, 8.95);
      }
    };
  }

  /* ---------- Rain on glass: a 9 × 9 grid keeping time in 9/8 (2+2+2+3) ---------- */
  function rain(node) {
    const E = 0.24;               // one eighth note
    const BAR = 9 * E;
    const D = BAR * 4;
    const svg = node.querySelector('.r-grid');
    const NS = 'http://www.w3.org/2000/svg';
    const dots = [];
    const gap = 50, r0 = 7, ox = 200, oy = 170;
    for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) {
      const c = document.createElementNS(NS, 'rect');
      c.setAttribute('x', ox + col * gap - r0); c.setAttribute('y', oy + row * gap - r0);
      c.setAttribute('width', r0 * 2); c.setAttribute('height', r0 * 2);
      c.setAttribute('rx', r0); c.setAttribute('fill', 'currentColor');
      svg.appendChild(c); dots.push({ c, row, col });
    }
    const accents = [0, 2, 4, 6];  // group starts: 2+2+2+3
    const DROP = 33;
    return {
      D, rest: BAR * 3 + E * 6.2,
      render(t) {
        t = ((t % D) + D) % D;
        const bar = Math.floor(t / BAR);
        const inBar = t - bar * BAR;
        dots.forEach((d, i) => {
          // the pulse sweeps one column per eighth; each bar starts on the next row group
          const hit = inBar - d.col * E;
          let amp = 0;
          if (hit >= 0 && hit < 0.9) {
            const k = Math.exp(-hit * 5.5);
            const accent = accents.includes(d.col) ? 1 : 0.55;
            const rowWave = 0.55 + 0.45 * Math.cos(((d.row - bar * 2) / 9) * Math.PI * 2);
            amp = k * accent * rowWave;
          }
          let h = r0 * 2, y = oy + d.row * gap - r0;
          let op = 0.28 + 0.72 * amp;
          let s = 1 + 0.5 * amp;
          if (i === DROP) {
            // in the last bar the drop lets go and runs down the glass
            const p = bar === 3 ? easeInOut(prog(inBar, E * 2, E * 7)) : 0;
            const back = bar === 3 ? prog(inBar, E * 7.5, E * 9) : 0;
            const run = p * (1 - back);
            h = r0 * 2 + run * 52; y = y + run * 18;
            op = Math.max(op, 0.95 * run + 0.6 * (1 - run) * (bar === 3 ? 1 : 0), 0.95 - 0.65 * (1 - run));
            s = 1;
          }
          const w = r0 * 2 * s;
          d.c.setAttribute('x', (ox + d.col * gap - w / 2).toFixed(2));
          d.c.setAttribute('width', w.toFixed(2));
          d.c.setAttribute('y', (y - (s - 1) * r0).toFixed(2));
          d.c.setAttribute('height', (h * (i === DROP ? 1 : s)).toFixed(2));
          d.c.setAttribute('fill-opacity', op.toFixed(3));
        });
        const cnt = node.querySelector('.r-count');
        if (cnt) {
          const e = Math.floor(inBar / E);
          const grp = e < 2 ? 1 : e < 4 ? 2 : e < 6 ? 3 : 4;
          cnt.textContent = `bar ${bar + 1} · ${'2+2+2+3'.split('+').map((g, gi) => (gi + 1 === grp ? `[${g}]` : g)).join('+')}`;
        }
      }
    };
  }

  const makers = { drop01, walkhome, rain };
  const pieces = [];
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mountAll() {
    document.querySelectorAll('[data-motion]').forEach(node => {
      const make = makers[node.dataset.motion];
      if (!make) return;
      const p = make(node);
      p.node = node; p.t = 0; p.visible = false;
      p.render(p.rest);
      pieces.push(p);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => es.forEach(e => (p.visible = e.isIntersecting)), { threshold: 0.25 }).observe(node);
      } else p.visible = true;
    });
    window.__motion = {
      pieces,
      renderAt(name, t) { pieces.filter(p => p.node.dataset.motion === name).forEach(p => p.render(t)); },
      duration(name) { const p = pieces.find(p => p.node.dataset.motion === name); return p ? p.D : 0; }
    };
    if (reduce || window.__noLoop) return;
    let last = performance.now();
    function tick(now) {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      pieces.forEach(p => { if (p.visible) { p.t += dt; p.render(p.t); } });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const go = () => (document.fonts && document.fonts.ready ? document.fonts.ready.then(mountAll) : mountAll());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
