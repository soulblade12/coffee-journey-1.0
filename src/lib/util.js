export const TYPES = { 'kedai kopi': 'Kedai kopi', cafe: 'Cafe', slowbar: 'Slowbar' };
export const BREWS = ['Espresso', 'Latte / Flat white', 'Cappuccino', 'V60', 'Japanese iced', 'Aeropress', 'French press', 'Kopi tubruk', 'Cold brew', 'Manual brew lain', 'Non-kopi'];
export const FLAVORS = ['Fruity', 'Floral', 'Citrus', 'Berry', 'Nutty', 'Chocolate', 'Caramel', 'Sweet', 'Spicy', 'Earthy', 'Smoky', 'Bitter', 'Acidic', 'Creamy', 'Clean'];
export const STICKERS = ['☕', '🌿', '🥐', '🎧', '📚', '🌧️', '✨', '💛'];

export const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
export const fmtDate = d => new Date(d + 'T00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export async function compress(file, max = 1000) {
  const bmp = await createImageBitmap(file), s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', .8);
}

export function download(href, name) {
  const a = document.createElement('a'); a.href = href; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}
