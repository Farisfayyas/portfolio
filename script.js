/* ============================================================
   FARIS FAYYAS - PORTFOLIO
   1. Circuit-trace hero canvas (traces end in math glyphs)
   2. Boot readout typing effect
   3. Scroll reveal + stat counters
   ============================================================ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. CIRCUIT CANVAS ---------- */
(() => {
  const canvas = document.getElementById("circuit");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const GLYPHS = ["∫", "Σ", "∂", "π", "∇", "λ", "♞"];
  const AMBER = "255, 180, 36";
  const CYAN = "95, 212, 229";
  const GRID = 44;
  let traces = [];
  let W, H, raf;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Build one trace: a polyline on the grid with 90° turns, ending in a glyph
  function makeTrace() {
    const steps = 3 + Math.floor(Math.random() * 4);
    let x = Math.round((Math.random() * W) / GRID) * GRID;
    let y = Math.round((Math.random() * H) / GRID) * GRID;
    const pts = [{ x, y }];
    let horizontal = Math.random() < 0.5;
    for (let i = 0; i < steps; i++) {
      const len = GRID * (1 + Math.floor(Math.random() * 4));
      const dir = Math.random() < 0.5 ? -1 : 1;
      if (horizontal) x += len * dir; else y += len * dir;
      horizontal = !horizontal;
      pts.push({ x, y });
    }
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      total += Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
    }
    return {
      pts,
      total,
      drawn: 0,
      speed: 1.2 + Math.random() * 2.2,
      color: Math.random() < 0.72 ? AMBER : CYAN,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      age: 0,
      life: 340 + Math.random() * 240, // frames before fade-out
    };
  }

  function drawTrace(t) {
    const alphaBase = t.age > t.life ? Math.max(0, 1 - (t.age - t.life) / 60) : 1;
    if (alphaBase <= 0) return false;
    ctx.strokeStyle = `rgba(${t.color}, ${0.16 * alphaBase})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    let remaining = t.drawn;
    ctx.moveTo(t.pts[0].x, t.pts[0].y);
    let endX = t.pts[0].x, endY = t.pts[0].y, complete = true;
    for (let i = 1; i < t.pts.length; i++) {
      const a = t.pts[i - 1], b = t.pts[i];
      const segLen = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
      if (remaining >= segLen) {
        ctx.lineTo(b.x, b.y);
        endX = b.x; endY = b.y;
        remaining -= segLen;
      } else {
        const f = remaining / segLen;
        endX = a.x + (b.x - a.x) * f;
        endY = a.y + (b.y - a.y) * f;
        ctx.lineTo(endX, endY);
        complete = false;
        break;
      }
    }
    ctx.stroke();
    // node dot at the start
    ctx.fillStyle = `rgba(${t.color}, ${0.35 * alphaBase})`;
    ctx.fillRect(t.pts[0].x - 1.5, t.pts[0].y - 1.5, 3, 3);
    if (t.drawn >= t.total) {
      // glyph terminal
      ctx.font = "13px 'JetBrains Mono', monospace";
      ctx.fillStyle = `rgba(${t.color}, ${0.55 * alphaBase})`;
      ctx.fillText(t.glyph, endX + 5, endY + 4);
      ctx.strokeStyle = `rgba(${t.color}, ${0.4 * alphaBase})`;
      ctx.strokeRect(endX - 3, endY - 3, 6, 6);
    }
    return true;
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    traces = traces.filter((t) => {
      t.drawn = Math.min(t.total, t.drawn + t.speed);
      t.age++;
      return drawTrace(t);
    });
    const cap = Math.max(6, Math.min(16, Math.floor(W / 90)));
    if (traces.length < cap && Math.random() < 0.05) traces.push(makeTrace());
    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", () => { resize(); });

  if (reducedMotion) {
    // static render: a handful of completed traces, no animation
    for (let i = 0; i < 10; i++) {
      const t = makeTrace();
      t.drawn = t.total;
      drawTrace(t);
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const t = makeTrace();
      t.drawn = Math.random() * t.total;
      traces.push(t);
    }
    frame();
    // pause when tab hidden
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else frame();
    });
  }
})();

/* ---------- 2. BOOT READOUT ---------- */
(() => {
  const el = document.getElementById("readout");
  if (!el) return;
  const LINES = [
    ["NAME", "FARIS FAYYAS"],
    ["EDUCATION", "CS & MATHEMATICS, NYU ABU DHABI"],
    ["GRADUATION", "CLASS OF 2029"],
    ["SAT", "1560 / 1600"],
    ["TAKAMUL CUP", "2ND IN UAE"],
    ["CBSE MATHEMATICS", "100 / 100"],
    ["PROJECTS", "SWIPEFIT · SONAR AI · CLIENT WEBSITES"],
    ["STATUS", "OPEN TO WORK"],
  ];

  function render(upTo, partial) {
    let html = "";
    for (let i = 0; i < upTo; i++) {
      const [k, v] = LINES[i];
      html += v
        ? `<span class="ok">${k}:</span> <span class="val">${v}</span>\n`
        : `<span class="ok">${k}</span>\n`;
    }
    if (partial !== undefined) html += partial;
    el.innerHTML = html + '<span class="cursor"></span>';
  }

  if (reducedMotion) {
    render(LINES.length);
    return;
  }

  let line = 0;
  function typeLine() {
    if (line >= LINES.length) { render(LINES.length); return; }
    const [k, v] = LINES[line];
    const full = v ? `${k}: ${v}` : k;
    let ch = 0;
    const iv = setInterval(() => {
      ch += 2;
      render(line, full.slice(0, ch));
      if (ch >= full.length) {
        clearInterval(iv);
        line++;
        setTimeout(typeLine, 110);
      }
    }, 14);
  }
  setTimeout(typeLine, 400);
})();

/* ---------- 3. SCROLL REVEAL + COUNTERS ---------- */
(() => {
  const reveals = document.querySelectorAll(".reveal");
  if (reducedMotion) {
    reveals.forEach((r) => r.classList.add("on"));
    document.querySelectorAll(".stat-num").forEach((s) => {
      s.textContent = s.dataset.count;
    });
    return;
  }

  const counted = new WeakSet();
  function runCounter(numEl) {
    if (counted.has(numEl)) return;
    counted.add(numEl);
    const target = parseInt(numEl.dataset.count, 10);
    const dur = 900;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("on");
        e.target.querySelectorAll(".stat-num").forEach(runCounter);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((r) => io.observe(r));
})();
