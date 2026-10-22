/**
 * Image processing & compression utilities
 * Prevents IndexedDB quota errors by scaling high-res photos to optimal sizes
 */

/**
 * Compress an image file to a data URL with max dimension and quality
 * @param {File|Blob|string} source 
 * @param {number} maxDim - Max width or height (default 1280px)
 * @param {number} quality - JPEG quality 0..1 (default 0.82)
 * @returns {Promise<string>}
 */
export async function compressImage(source, maxDim = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let shouldRevoke = false;

    if (typeof source === 'string') {
      srcUrl = source;
    } else if (source instanceof Blob) {
      srcUrl = URL.createObjectURL(source);
      shouldRevoke = true;
    } else {
      return reject(new Error('Invalid image source'));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl);

      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(srcUrl);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = 'image/jpeg';
      const compressedData = canvas.toDataURL(mimeType, quality);
      resolve(compressedData);
    };

    img.onerror = (err) => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl);
      reject(err);
    };

    img.src = srcUrl;
  });
}
