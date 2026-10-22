import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';

const URL = process.env.URL || 'http://localhost:5173/';
const OUT = 'docs/screenshots';
const exe = process.env.BROWSER || [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync);
if (!exe) throw new Error('Browser tidak ditemukan. Set env BROWSER=path/ke/chrome');
mkdirSync(OUT, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

const seed = async () => {
  const mk = (emoji, c1, c2) => {
    const c = document.createElement('canvas'); c.width = c.height = 900;
    const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 900, 900);
    g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 900, 900);
    x.font = '380px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(emoji, 450, 470);
    return c.toDataURL('image/jpeg', .8);
  };
  const day = n => new Date(Date.now() - n * 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const V = [
    ['Kopi Senja', 'kedai kopi', 0, 'Kemang, Jakarta', 'V60 Ethiopia + croissant', 'V60', 'Ethiopia Guji, natural', ['Fruity', 'Floral', 'Berry'], 'Aroma blueberry yang kuat, asam manis seimbang. Duduk di dekat jendela sambil hujan.', '🌧️', [['☕', '#8b5a3c', '#3b2417'], ['🥐', '#e0a458', '#7a4a21'], ['🌧️', '#5266eb', '#171721']], [5, 5, 4], -6.2615, 106.8106],
    ['Slowbar Kala', 'slowbar', 1, 'Senopati, Jakarta', 'Aeropress Gayo', 'Aeropress', 'Gayo, washed', ['Chocolate', 'Nutty', 'Clean'], 'Barista menjelaskan tiap biji dengan sabar. Pelan, hangat, dan tenang.', '🫖', [['🫖', '#c9a77c', '#4a3320'], ['☕', '#6b4226', '#241510']], [5, 4, 5], -6.2297, 106.8085],
    ['Roastery 17', 'cafe', 3, 'Cipete, Jakarta', 'Flat white + banana bread', 'Latte / Flat white', 'House blend', ['Caramel', 'Creamy', 'Sweet'], 'Latte art-nya rapi, bread-nya hangat. Cocok buat kerja santai.', '🥐', [['🥐', '#ffb84d', '#8a4b1f']], [4, 4, 4], -6.2790, 106.8000],
    ['Teras Kopi Dago', 'kedai kopi', 6, 'Dago, Bandung', 'Es kopi susu aren', 'Espresso', 'Blend lokal', ['Sweet', 'Creamy'], 'Pemandangan kota dari teras. Kopi susunya manis pas.', '💛', [['💛', '#ff6b9d', '#5266eb'], ['☕', '#a87444', '#2d1b10']], [4, 5, 3], -6.8957, 107.6186],
    ['Tuang & Seduh', 'slowbar', 9, 'Prawirotaman, Yogyakarta', 'Japanese iced Kintamani', 'Japanese iced', 'Kintamani, honey', ['Citrus', 'Floral', 'Clean'], '', '✨', [['✨', '#4de2b3', '#171721']], [4, 4, 4], -7.8233, 110.3693],
    ['Kopi Tuku', 'cafe', 12, 'Cipete, Jakarta', 'Es kopi susu', '', '', [], '', '☕', [], [3, 4, 4], -6.2750, 106.7990],
  ];
  const visits = V.map(([name, type, d, area, menu, brew, bean, flavors, note, sticker, ph, r, lat, lng], i) => ({
    id: 'demo-' + i, created: Date.now() - i * 1e5, seed: 1234 + i * 77, paper: 'night',
    name, type, date: day(d), area, menu, brew, bean, flavors, note, sticker,
    photos: ph.map(p => mk(...p)), ratings: { coffee: r[0], vibe: r[1], service: r[2] },
    rating: r.reduce((a, b) => a + b, 0) / 3, lat, lng,
  }));
  const db = await new Promise((res, rej) => {
    const q = indexedDB.open('jejak-kopi', 1);
    q.onupgradeneeded = () => q.result.createObjectStore('kv');
    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
  });
  await new Promise((res, rej) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(visits, 'visits'); t.oncomplete = res; t.onerror = rej; });
};

const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2' });
await page.evaluate(seed);
await page.reload({ waitUntil: 'networkidle2' });
await sleep(2500);

const click = text => page.evaluate(t => {
  const b = [...document.querySelectorAll('button, a')].find(x => x.textContent.includes(t));
  if (!b) throw new Error('no button ' + t);
  b.click();
}, text);
const shot = (name, opts = {}) => page.screenshot({ path: `${OUT}/${name}.png`, ...opts });

// 01: Landing on Map Field Terminal
await shot('map');
await shot('journal');

// Interactively drop a pin
const mapWrap = await page.$('.terminal-map-wrapper');
if (mapWrap) {
  const box = await mapWrap.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(1500);
  await shot('map-add-pin');

  // Open Form from newly dropped pin
  await click('CATAT');
  await sleep(1500);
  await shot('form');
  await click('BATAL');
  await sleep(500);
}

// 02: Switch to Logbook
await click('LOGBOOK');
await sleep(1000);
await shot('journal-cards');

// 03: Switch to Scrapbook
await click('SCRAPBOOK');
await sleep(2000);
const notebook = await page.$('.interactive-notebook-page');
if (notebook) {
  await notebook.screenshot({ path: `${OUT}/scrapbook.png` });
} else {
  await shot('scrapbook');
}

// 04: Switch to Misi & Telemetri
await click('MISI');
await sleep(1000);
await shot('quest', { fullPage: true });

// 05: Tablet Viewport (iPad Air 820x1180)
await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true });
await click('PETA');
await sleep(1000);
await shot('tablet');

// 06: Mobile Viewport (iPhone 14 / 390x844)
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
await sleep(1000);
await shot('mobile');

await browser.close();
console.log('Selesai →', OUT);
