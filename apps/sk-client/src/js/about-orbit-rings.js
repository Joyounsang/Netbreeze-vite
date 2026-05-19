'use strict';

/**
 * about 인포그래피: 원이 회전하지 않고 선이 살짝 찌그러졌다 펴지는 Canvas 링
 */
function initAboutOrbitRings() {
  const container = document.querySelector('.app-section.about .orbit-rings');
  const canvas = container?.querySelector('.orbit-rings__canvas');
  if (!container || !canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const VIEW_SIZE = 620;
  /** 찌그러짐·blur가 잘리지 않도록 좌우상하 여백 (view 좌표) */
  const DRAW_INSET = 40;
  const DRAW_SCALE = (VIEW_SIZE - DRAW_INSET * 2) / VIEW_SIZE;
  const SEGMENTS = 200;

  const rings = [
    {
      cx: 310,
      cy: 310,
      baseR: 276,
      stroke: 'rgba(49, 26, 197, 0.22)',
      lineWidth: 1,
      blur: 2.5,
      harmonics: [
        { amp: 5, freq: 7, speed: 0.62, phase: 1.5 },
        { amp: 3, freq: 4, speed: -0.35, phase: 0.2 },
      ],
    },
    {
      cx: 302,
      cy: 326,
      rx: 298,
      ry: 286,
      stroke: 'rgba(49, 26, 197, 0.4)',
      lineWidth: 1,
      blur: 1.2,
      harmonics: [
        { amp: 12, freq: 4, speed: -0.48, phase: 0.6 },
        { amp: 7, freq: 6, speed: 0.36, phase: 2.1 },
        { amp: 5, freq: 3, speed: -0.25, phase: 3.8 },
      ],
    },
    {
      cx: 310,
      cy: 310,
      baseR: 294,
      stroke: 'rgba(105, 46, 255, 0.6)',
      lineWidth: 1.5,
      blur: 1.5,
      harmonics: [
        { amp: 10, freq: 3, speed: 0.55, phase: 0 },
        { amp: 6, freq: 5, speed: -0.42, phase: 1.2 },
        { amp: 4, freq: 2, speed: 0.28, phase: 2.4 },
      ],
    },
  ];

  let rafId = null;
  let startTime = performance.now();
  let isVisible = true;
  let size = VIEW_SIZE;

  function buildCirclePoints(ring, time) {
    const points = [];

    for (let i = 0; i <= SEGMENTS; i += 1) {
      const angle = (i / SEGMENTS) * Math.PI * 2;
      let radius = ring.baseR;

      ring.harmonics.forEach((h) => {
        radius += h.amp * Math.sin(h.freq * angle + time * h.speed + h.phase);
      });

      points.push({
        x: ring.cx + radius * Math.cos(angle),
        y: ring.cy + radius * Math.sin(angle),
      });
    }

    return points;
  }

  function buildEllipsePoints(ring, time) {
    const points = [];

    for (let i = 0; i <= SEGMENTS; i += 1) {
      const angle = (i / SEGMENTS) * Math.PI * 2;
      let rx = ring.rx;
      let ry = ring.ry;

      ring.harmonics.forEach((h) => {
        const wave = Math.sin(h.freq * angle + time * h.speed + h.phase);
        rx += h.amp * wave;
        ry -= h.amp * 0.72 * Math.cos(h.freq * angle + time * h.speed + h.phase + 0.5);
      });

      points.push({
        x: ring.cx + rx * Math.cos(angle),
        y: ring.cy + ry * Math.sin(angle),
      });
    }

    return points;
  }

  function getRingPoints(ring, time) {
    if (ring.baseR) {
      return buildCirclePoints(ring, time);
    }

    return buildEllipsePoints(ring, time);
  }

  function drawPath(points) {
    if (points.length < 2) return;

    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.closePath();
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    size = rect.width > 0 ? rect.width : VIEW_SIZE;

    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function strokeRing(ring, points) {
    ctx.beginPath();
    drawPath(points);
    ctx.strokeStyle = ring.stroke;
    ctx.lineWidth = ring.lineWidth;
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (ring.blur > 0) {
      ctx.save();
      ctx.filter = `blur(${ring.blur}px)`;
      ctx.stroke();
      ctx.restore();
      ctx.filter = 'none';
      return;
    }

    ctx.filter = 'none';
    ctx.stroke();
  }

  function drawFrame(time) {
    const displayScale = size / VIEW_SIZE;
    const t = time * 0.001;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.scale(displayScale, displayScale);
    ctx.translate(DRAW_INSET, DRAW_INSET);
    ctx.scale(DRAW_SCALE, DRAW_SCALE);

    rings.forEach((ring) => {
      strokeRing(ring, getRingPoints(ring, t));
    });

    ctx.restore();
  }

  function drawStatic() {
    drawFrame(0);
  }

  function tick(now) {
    if (!isVisible) {
      rafId = null;
      return;
    }

    drawFrame(now - startTime);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (rafId || reduceMotion) return;
    startTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  resize();

  if (reduceMotion) {
    drawStatic();
    window.addEventListener('resize', () => {
      resize();
      drawStatic();
    }, { passive: true });
    return;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.05 },
    );
    observer.observe(container);
  } else {
    start();
  }

  window.addEventListener('resize', () => {
    resize();
  }, { passive: true });

  start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutOrbitRings);
} else {
  initAboutOrbitRings();
}
