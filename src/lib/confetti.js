const COLORS = ['#5266eb', '#ededf3', '#ffb84d', '#ff6b9d', '#4de2b3'];

/** Konfeti ringan tanpa dependensi. */
export function confetti(count = 80) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas');
  Object.assign(cv.style, { position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3000 });
  cv.width = innerWidth; cv.height = innerHeight;
  document.body.appendChild(cv);
  const c = cv.getContext('2d');
  const ps = Array.from({ length: count }, () => ({
    x: cv.width / 2, y: cv.height * .7, vx: (Math.random() - .5) * 16, vy: -8 - Math.random() * 12,
    s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, col: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
  let t = 0;
  (function frame() {
    c.clearRect(0, 0, cv.width, cv.height);
    for (const p of ps) {
      p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore();
    }
    if (++t < 110) requestAnimationFrame(frame); else cv.remove();
  })();
}
