import Tesseract from 'tesseract.js';
import { FLAVORS, BREWS } from './util';

/**
 * Memuat gambar dari File atau dataURL menjadi HTMLImageElement
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = e => reject(e);
    if (src instanceof Blob || src instanceof File) {
      img.src = URL.createObjectURL(src);
    } else {
      img.src = src;
    }
  });
}

/**
 * Membuat stiker dengan efek White Die-Cut Border & Glossy Outline pada Canvas
 */
export async function createDieCutSticker(imgSource, options = {}) {
  const img = await loadImage(imgSource);
  const maxDim = options.maxSize || 500;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  const border = options.borderWidth || 14;
  const radius = options.borderRadius || 24;
  const canvas = document.createElement('canvas');
  canvas.width = w + border * 2 + 10;
  canvas.height = h + border * 2 + 10;
  const ctx = canvas.getContext('2d');

  const x = border + 5;
  const y = border + 5;

  // 1. Gambar die-cut border putih tebal dengan efek stiker vinyl
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 6;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - border / 2, y - border / 2, w + border, h + border, radius + 4);
  } else {
    ctx.rect(x - border / 2, y - border / 2, w + border, h + border);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // 2. Garis potong die-cut outline halus
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - 2, y - 2, w + 4, h + 4, radius);
  } else {
    ctx.rect(x - 2, y - 2, w + 4, h + 4);
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e2ded4';
  ctx.stroke();

  // 3. Gambar foto di tengah dengan klip rounded
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius - 2);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);

  // Efek kilau stiker vinyl halus (gloss shine)
  const gloss = ctx.createLinearGradient(x, y, x + w, y + h);
  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  gloss.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
  gloss.addColorStop(0.5, 'transparent');
  gloss.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.fillStyle = gloss;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Membuat Kartu Koleksi Cupping Notes Vintage Stiker
 */
export function createCuppingCardSticker(info = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 460;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  // Background kartu vintage kraft / darkroom
  const bg = ctx.createLinearGradient(0, 0, 460, 300);
  bg.addColorStop(0, '#2b1c11');
  bg.addColorStop(1, '#160d07');

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // Kartu utama
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(10, 10, 440, 280, 14);
  else ctx.rect(10, 10, 440, 280);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  // Border emas vintage & garis jahitan
  ctx.strokeStyle = '#a67c4e';
  ctx.lineWidth = 2;
  if (ctx.roundRect) ctx.roundRect(16, 16, 428, 268, 10);
  else ctx.rect(16, 16, 428, 268);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 237, 215, 0.25)';
  ctx.setLineDash([4, 4]);
  if (ctx.roundRect) ctx.roundRect(22, 22, 416, 256, 8);
  else ctx.rect(22, 22, 416, 256);
  ctx.stroke();
  ctx.setLineDash([]);

  // Header Stamp
  ctx.fillStyle = '#ffedd7';
  ctx.font = '600 13px Inter, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('SPECIALTY COFFEE // CUPPING NOTES CARD', 34, 48);

  // Emblem Segel Emas
  ctx.fillStyle = '#d49b55';
  ctx.beginPath();
  ctx.arc(410, 45, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#100904';
  ctx.font = '700 12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', 410, 49);
  ctx.textAlign = 'left';

  // Garis pemisah
  ctx.strokeStyle = 'rgba(166, 124, 78, 0.4)';
  ctx.beginPath();
  ctx.moveTo(34, 62);
  ctx.lineTo(426, 62);
  ctx.stroke();

  // Nama Kafe & Origin
  ctx.fillStyle = '#ffedd7';
  ctx.font = '700 22px Inter, sans-serif';
  ctx.fillText(info.cafeName ? info.cafeName.toUpperCase() : 'SPECIALTY COFFEE', 34, 94);

  ctx.fillStyle = '#dc5000';
  ctx.font = '600 14px Inter, sans-serif';
  ctx.fillText(info.bean ? `ORIGIN: ${info.bean.toUpperCase()}` : 'SINGLE ORIGIN SELECTION', 34, 120);

  // Metode Seduh & Tanggal
  ctx.fillStyle = '#a89c8e';
  ctx.font = '500 12px monospace';
  const metaLine = [info.brew || 'V60 FILTER', info.date || 'SURVEY LOG', info.area].filter(Boolean).join(' · ');
  ctx.fillText(metaLine.toUpperCase(), 34, 142);

  // Label Tasting Notes
  ctx.fillStyle = '#ffedd7';
  ctx.font = '600 11px Inter, sans-serif';
  ctx.fillText('DETECTED FLAVOR PROFILE:', 34, 172);

  // Chips Rasa
  const flavors = info.flavors && info.flavors.length ? info.flavors : ['Floral', 'Citrus', 'Sweet Caramel'];
  let curX = 34;
  flavors.slice(0, 4).forEach(f => {
    ctx.font = '600 11px Inter, sans-serif';
    const textW = ctx.measureText(f.toUpperCase()).width;
    const boxW = textW + 20;

    ctx.fillStyle = '#382416';
    if (ctx.roundRect) ctx.roundRect(curX, 184, boxW, 26, 13);
    else ctx.rect(curX, 184, boxW, 26);
    ctx.fill();
    ctx.strokeStyle = '#a67c4e';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffedd7';
    ctx.fillText(f.toUpperCase(), curX + 10, 201);
    curX += boxW + 8;
  });

  // Footer Serial
  ctx.fillStyle = '#6c5f51';
  ctx.font = '500 10px monospace';
  ctx.fillText(`AUTHENTIC SENSORY STAMP // NO. ${Math.random().toString(36).substring(2, 8).toUpperCase()}`, 34, 254);

  return canvas.toDataURL('image/png');
}

/**
 * Scan gambar kartu rasa kopi menggunakan OCR Tesseract.js di sisi peramban
 */
export async function scanCoffeeCard(imageSource, onProgress = () => {}) {
  try {
    onProgress({ status: 'Memulai mesin OCR Tesseract...', progress: 0.1 });
    const { data: { text } } = await Tesseract.recognize(imageSource, 'eng+ind', {
      logger: m => {
        if (m.status === 'recognizing text') {
          onProgress({ status: 'Membaca tulisan pada kartu...', progress: 0.2 + (m.progress * 0.7) });
        }
      },
    });

    onProgress({ status: 'Menganalisis profil rasa & kata kunci...', progress: 0.95 });

    const lower = text.toLowerCase();

    // Deteksi Profil Rasa dari daftar 15 FLAVORS standar
    const detectedFlavors = FLAVORS.filter(f => lower.includes(f.toLowerCase()));

    // Deteksi Metode Seduh
    const detectedBrew = BREWS.find(b => lower.includes(b.toLowerCase())) || '';

    // Deteksi Origin Umum
    const origins = ['ethiopia', 'guji', 'kintamani', 'gayo', 'toraja', 'colombia', 'kenya', 'java', 'sumatra', 'honduras', 'panama', 'geisha'];
    const foundOrigin = origins.find(o => lower.includes(o));
    const detectedOrigin = foundOrigin ? foundOrigin.charAt(0).toUpperCase() + foundOrigin.slice(1) : '';

    return {
      rawText: text,
      flavors: detectedFlavors,
      brew: detectedBrew,
      bean: detectedOrigin,
      success: true,
    };
  } catch (err) {
    console.warn('OCR Scan failed or unavailable, falling back to manual detection', err);
    return {
      rawText: '',
      flavors: [],
      brew: '',
      bean: '',
      success: false,
      error: err.message,
    };
  }
}
