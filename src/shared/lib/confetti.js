const PALETTE = ['#ffedd7', '#dc5000', '#f4cf65', '#a0714f', '#7b9351', '#e8b87d'];

/**
 * Lightweight canvas confetti particle celebration
 */
export function confetti(count = 70) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cv = document.createElement('canvas');
  Object.assign(cv.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '9999',
  });
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  document.body.appendChild(cv);

  const c = cv.getContext('2d');
  if (!c) {
    cv.remove();
    return;
  }

  const ps = Array.from({ length: count }, () => ({
    x: cv.width / 2,
    y: cv.height * 0.7,
    vx: (Math.random() - 0.5) * 14,
    vy: -7 - Math.random() * 12,
    s: 5 + Math.random() * 6,
    r: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.35,
    col: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  }));

  let t = 0;
  function frame() {
    c.clearRect(0, 0, cv.width, cv.height);
    for (const p of ps) {
      p.vy += 0.32;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.r);
      c.fillStyle = p.col;
      c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      c.restore();
    }
    if (++t < 100) {
      requestAnimationFrame(frame);
    } else {
      cv.remove();
    }
  }
  requestAnimationFrame(frame);
}
