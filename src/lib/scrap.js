import { TYPES, fmtDate } from './util';

export const PAPERS = {
  night: { label: 'Malam', bg: '#26211f', ink: '#f3e6d2', card: '#f7efe2', dots: '#3a312d' },
  kraft: { label: 'Kertas kraft', bg: '#c9a77c', ink: '#3a2716', card: '#fff8ea', dots: '#b4905f' },
  cream: { label: 'Krem polos', bg: '#f7f0e2', ink: '#3a2716', card: '#ffffff' },
  grid: { label: 'Kotak-kotak', bg: '#fbf8f1', ink: '#2d3a4a', card: '#ffffff', grid: '#cfe0ea' },
};

const rng = seed => () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

function wrap(ctx, text, maxW) {
  const lines = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    }
    lines.push(line);
  }
  return lines;
}
const rrect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };

/** Menggambar scrapbook untuk satu kunjungan ke dalam canvas. Mengembalikan false jika dibatalkan. */
export async function renderScrap(cv, v, isStale = () => false) {
  const P = PAPERS[v.paper] || PAPERS.night, r = rng(v.seed);
  await Promise.all([document.fonts.load('700 60px Caveat'), document.fonts.load('800 60px Fraunces')]).catch(() => {});
  const imgs = (await Promise.all(v.photos.map(loadImg))).filter(Boolean);
  if (isStale()) return false;

  const W = 900, n = imgs.length, rows = Math.ceil(n / 2), headH = 260, cellH = 440;
  const coffee = [v.brew, v.bean, v.flavors?.length ? v.flavors.join(', ').toLowerCase() : ''].filter(Boolean).join(' · ');
  const body = [v.menu && 'Pesanan: ' + v.menu, coffee, v.note].filter(Boolean).join('\n');
  const m = document.createElement('canvas').getContext('2d'); m.font = '500 30px Caveat, cursive';
  const lines = body ? wrap(m, body, 660) : [];
  const infoH = 230 + lines.length * 36 + 60, H = headH + rows * cellH + infoH;
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');

  c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
  if (P.grid) { c.strokeStyle = P.grid; c.lineWidth = 1; for (let x = 0; x < W; x += 30) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
  if (P.dots) { c.fillStyle = P.dots; for (let i = 0; i < 500; i++) { c.beginPath(); c.arc(r() * W, r() * H, 1 + r() * 2, 0, 7); c.fill(); } }

  c.fillStyle = P.ink; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  let size = 84; do { c.font = `700 ${size}px Caveat, cursive`; size -= 4; } while (c.measureText(v.name).width > 740 && size > 30);
  c.fillText(v.name, W / 2, 120);
  c.font = '500 34px Caveat, cursive';
  c.fillText(`${fmtDate(v.date)}${v.area ? ' · ' + v.area : ''}`, W / 2, 175);
  c.font = '60px serif';
  c.save(); c.translate(80, 90); c.rotate(-.25); c.fillText(v.sticker, 0, 0); c.restore();
  c.save(); c.translate(W - 80, 100); c.rotate(.2); c.fillText(v.sticker, 0, 0); c.restore();
  const rr = Math.round(v.rating);
  c.font = '500 28px Caveat, cursive';
  c.fillText(`${TYPES[v.type].toUpperCase()} · ${'★'.repeat(rr)}${'☆'.repeat(5 - rr)}`, W / 2, 220);

  const caps = ['', 'yummm', 'vibes ✨', 'again?', 'cozy', 'mood'];
  imgs.forEach((img, i) => {
    const col = i % 2, row = Math.floor(i / 2), single = n % 2 === 1 && i === n - 1;
    const cx = (single ? .5 : col ? .72 : .28) * W + (r() - .5) * 30, cy = headH + row * cellH + cellH / 2 + (r() - .5) * 20;
    c.save(); c.translate(cx, cy); c.rotate((r() - .5) * .22);
    c.shadowColor = '#0006'; c.shadowBlur = 18; c.shadowOffsetY = 8;
    c.fillStyle = P.card; c.fillRect(-170, -190, 340, 400); c.shadowColor = 'transparent';
    const s = Math.min(img.width, img.height), sx = (img.width - s) / 2, sy = (img.height - s) / 2;
    c.drawImage(img, sx, sy, s, s, -150, -170, 300, 300);
    c.fillStyle = '#3a2716'; c.font = '700 34px Caveat, cursive'; c.textAlign = 'center';
    c.fillText(i === 0 ? v.name.slice(0, 22) : caps[i % caps.length], 0, 180);
    c.fillStyle = ['#e8b4b899', '#b4d8e899', '#f2e394aa', '#b9e0b4aa'][Math.floor(r() * 4)];
    c.save(); c.translate(0, -190); c.rotate((r() - .5) * .5); c.fillRect(-45, -14, 90, 30); c.restore();
    c.restore();
  });

  const y0 = headH + rows * cellH + 10;
  c.save(); c.translate(W / 2, y0 + (infoH - 20) / 2); c.rotate((r() - .5) * .03);
  c.shadowColor = '#0005'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = P.card;
  rrect(c, -390, -(infoH - 40) / 2, 780, infoH - 40, 14); c.fill(); c.shadowColor = 'transparent';
  c.strokeStyle = '#c9a77c'; c.setLineDash([8, 6]); c.lineWidth = 2; rrect(c, -378, -(infoH - 40) / 2 + 12, 756, infoH - 64, 10); c.stroke(); c.setLineDash([]);
  let y = -(infoH - 40) / 2 + 70; c.textAlign = 'left'; c.fillStyle = '#3a2716';
  c.font = '800 44px Fraunces, serif'; c.fillText(`${v.rating.toFixed(1)} / 5`, -340, y);
  c.fillStyle = '#e0a526'; c.font = '44px serif'; c.fillText('★'.repeat(rr), -150, y);
  y += 50; c.fillStyle = '#7d6a5c'; c.font = '500 30px Caveat, cursive';
  c.fillText(`Kopi ${v.ratings.coffee || '-'}   Suasana ${v.ratings.vibe || '-'}   Pelayanan ${v.ratings.service || '-'}`, -340, y);
  y += 20; c.fillStyle = '#3a2716';
  lines.forEach(l => { y += 36; c.fillText(l, -340, y); });
  c.restore();

  c.fillStyle = P.ink; c.globalAlpha = .6; c.font = '500 24px Caveat, cursive'; c.textAlign = 'center';
  c.fillText('Jejak Kopi', W / 2, H - 14); c.globalAlpha = 1;
  return true;
}
