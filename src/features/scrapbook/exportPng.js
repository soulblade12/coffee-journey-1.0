import { fmtDate } from '@/shared/lib/date';

/**
 * High-resolution canvas PNG export matching the screen scrapbook layout
 */
export async function exportScrapbookToPng(visit, items = [], canvasWidth = 860) {
  const scale = 2; // High-res 2x
  const W = canvasWidth * scale;
  const H = 1180 * scale;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background warm darkness
  ctx.fillStyle = '#18100a';
  ctx.fillRect(0, 0, W, H);

  // Left spine ribbon
  ctx.fillStyle = 'rgba(56, 36, 22, 0.45)';
  ctx.fillRect(0, 0, 40 * scale, H);
  ctx.strokeStyle = '#40372e';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(40 * scale, 0, 1 * scale, H);

  // Subtle dot grid
  ctx.fillStyle = 'rgba(255, 237, 215, 0.07)';
  for (let x = 60 * scale; x < W; x += 30 * scale) {
    for (let y = 30 * scale; y < H; y += 30 * scale) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Header
  ctx.fillStyle = '#ffedd7';
  ctx.font = `600 ${22 * scale}px Inter, sans-serif`;
  ctx.fillText(`${(visit.name || 'JURNAL KOPI').toUpperCase()}`, 60 * scale, 55 * scale);

  ctx.fillStyle = '#8e7f70';
  ctx.font = `500 ${12 * scale}px monospace`;
  ctx.fillText(
    `${fmtDate(visit.date)} · ${visit.area || 'INDONESIA'} · ★ ${Number(visit.rating || 0).toFixed(1)}/5.0`,
    60 * scale,
    78 * scale
  );

  // Render items
  for (const it of items) {
    ctx.save();
    const cx = (it.x + (it.width || 200) / 2) * scale;
    const cy = (it.y + 100) * scale;
    ctx.translate(cx, cy);
    ctx.rotate(((it.rotate || 0) * Math.PI) / 180);

    const w = (it.width || 200) * scale;

    if (it.type === 'polaroid' || it.type === 'scanned-sticker') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = it.src;
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });

      if (it.type === 'polaroid') {
        const h = w * 1.15;
        // White polaroid frame
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 12 * scale;
        ctx.fillRect(-w / 2, -h / 2, w, h);

        // Photo
        const photoH = w * 0.82;
        ctx.drawImage(img, -w / 2 + 10 * scale, -h / 2 + 10 * scale, w - 20 * scale, photoH);

        // Caption
        ctx.fillStyle = '#222222';
        ctx.font = `600 ${14 * scale}px Caveat, cursive`;
        ctx.fillText(it.caption || visit.name, -w / 2 + 12 * scale, h / 2 - 12 * scale);
      } else {
        // Scanned Sticker
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10 * scale;
        const imgH = (img.height * w) / (img.width || 1);
        ctx.drawImage(img, -w / 2, -imgH / 2, w, imgH);
      }
    } else if (it.type === 'text-note') {
      const h = 130 * scale;
      ctx.fillStyle = it.bg || 'rgba(255, 237, 215, 0.95)';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 8 * scale;
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.fillStyle = it.color || '#2b1b11';
      ctx.font = `600 ${16 * scale}px Caveat, cursive`;
      const words = (it.text || '').split(' ');
      let line = '';
      let lineY = -h / 2 + 26 * scale;
      for (const word of words) {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > w - 24 * scale) {
          ctx.fillText(line, -w / 2 + 12 * scale, lineY);
          line = word + ' ';
          lineY += 22 * scale;
        } else {
          line = test;
        }
      }
      ctx.fillText(line, -w / 2 + 12 * scale, lineY);
    } else if (it.type === 'cupping-badge') {
      const h = 130 * scale;
      ctx.fillStyle = '#22140c';
      ctx.strokeStyle = '#a67c4e';
      ctx.lineWidth = 2 * scale;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      ctx.fillStyle = '#ffedd7';
      ctx.font = `700 ${14 * scale}px Inter, sans-serif`;
      ctx.fillText(it.title, -w / 2 + 14 * scale, -h / 2 + 26 * scale);

      ctx.fillStyle = '#dc5000';
      ctx.font = `600 ${12 * scale}px Inter, sans-serif`;
      ctx.fillText(it.bean, -w / 2 + 14 * scale, -h / 2 + 48 * scale);

      ctx.fillStyle = '#a89c8e';
      ctx.font = `500 ${11 * scale}px monospace`;
      ctx.fillText(`NOTES: ${(it.flavors || []).join(', ')}`, -w / 2 + 14 * scale, -h / 2 + 72 * scale);
    } else if (it.type === 'stamp') {
      ctx.strokeStyle = it.color || '#dc5000';
      ctx.lineWidth = 2 * scale;
      ctx.fillStyle = it.color || '#dc5000';
      ctx.strokeRect(-w / 2, -22 * scale, w, 44 * scale);
      ctx.font = `700 ${14 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(it.text, 0, 6 * scale);
      ctx.textAlign = 'start';
    }

    ctx.restore();
  }

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `scrapbook-${(visit.name || 'kopi').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
  a.click();
}
