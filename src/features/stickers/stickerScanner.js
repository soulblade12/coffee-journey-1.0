import Tesseract from 'tesseract.js';

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    if (src instanceof Blob || src instanceof File) {
      img.src = URL.createObjectURL(src);
    } else {
      img.src = src;
    }
  });
}

/**
 * Creates vinyl die-cut sticker effect on canvas with white border & soft drop shadow
 */
export async function createDieCutSticker(imgSource, options = {}) {
  const img = await loadImage(imgSource);
  const maxDim = options.maxSize || 450;
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

  const border = options.borderWidth || 12;
  const radius = options.borderRadius || 20;
  const canvas = document.createElement('canvas');
  canvas.width = w + border * 2 + 10;
  canvas.height = h + border * 2 + 10;
  const ctx = canvas.getContext('2d');

  const x = border + 5;
  const y = border + 5;

  // 1. Die-cut white border
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - border / 2, y - border / 2, w + border, h + border, radius + 4);
  } else {
    ctx.rect(x - border / 2, y - border / 2, w + border, h + border);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // 2. Inner image clipped
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  // 3. Subtle vinyl shine
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL('image/png', 0.88);
}

const COMMON_FLAVORS = [
  'floral', 'jasmine', 'citrus', 'lemon', 'orange', 'bergamot',
  'berry', 'blueberry', 'strawberry', 'peach', 'apple', 'tropical',
  'mango', 'passion fruit', 'caramel', 'brown sugar', 'honey',
  'chocolate', 'dark chocolate', 'nutty', 'almond', 'vanilla',
  'spicy', 'cinnamon', 'earl grey', 'winey', 'black tea'
];

/**
 * Perform OCR using Tesseract and extract coffee bean metadata
 */
export async function scanCoffeeCardOCR(imageSource, onProgress) {
  try {
    const worker = await Tesseract.createWorker('eng+ind', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && typeof onProgress === 'function') {
          onProgress(Math.round((m.progress || 0) * 100));
        }
      },
    });

    const res = await worker.recognize(imageSource);
    await worker.terminate();

    const rawText = res.data.text || '';
    const cleanLines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

    // Detect flavors
    const textLower = rawText.toLowerCase();
    const detectedFlavors = COMMON_FLAVORS.filter((f) => textLower.includes(f));

    // Detect origin or process
    let detectedProcess = '';
    if (textLower.includes('anaerobic')) detectedProcess = 'anaerobic';
    else if (textLower.includes('natural')) detectedProcess = 'natural';
    else if (textLower.includes('washed')) detectedProcess = 'washed';
    else if (textLower.includes('honey')) detectedProcess = 'honey';
    else if (textLower.includes('giling basah') || textLower.includes('wet hulled')) detectedProcess = 'wet_hulled';

    let bean = '';
    const originMatch = rawText.match(/(ethiopia|kenya|colombia|guatemala|panama|guji|yirgacheffe|geisha|gesha|toraja|gayo|kintamani|ijen|ciwidey|java)[^\n,]*/i);
    if (originMatch) bean = originMatch[0].trim();

    return {
      rawText,
      cleanLines,
      detectedFlavors,
      detectedProcess,
      bean,
    };
  } catch (err) {
    console.error('OCR Error:', err);
    return {
      rawText: '',
      cleanLines: [],
      detectedFlavors: [],
      detectedProcess: '',
      bean: '',
    };
  }
}
