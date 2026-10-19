'use strict';
/* ---------- Util & penyimpanan (IndexedDB, sehingga foto muat banyak) ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES = {'kedai kopi':'Kedai kopi', cafe:'Cafe', slowbar:'Slowbar'};
let visits = [];

const idb = () => new Promise((res, rej) => {
  const r = indexedDB.open('jejak-kopi', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('kv');
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
async function loadData() {
  try {
    const db = await idb();
    return await new Promise(res => {
      const q = db.transaction('kv').objectStore('kv').get('visits');
      q.onsuccess = () => res(q.result || []);
      q.onerror = () => res([]);
    });
  } catch { return []; }
}
async function saveData() {
  const db = await idb();
  return new Promise((res, rej) => {
    const t = db.transaction('kv', 'readwrite');
    t.objectStore('kv').put(visits, 'visits');
    t.oncomplete = res; t.onerror = () => rej(t.error);
  });
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200);
}
const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const fmtDate = d => new Date(d + 'T00:00').toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
const stars = (n, cls = '') => {
  const r = Math.round(n);
  return `<span class="star ${cls}" aria-label="${n.toFixed(1)} dari 5">${'★'.repeat(r)}<span class="off">${'★'.repeat(5 - r)}</span></span>`;
};

/* ---------- Gamifikasi ---------- */
const xpFor = l => 40 * (l - 1) ** 2;
const TITLES = ['Penyeduh Pemula', 'Pencicip Setia', 'Barista Tamu', 'Penjelajah Kopi', 'Pemburu Single Origin', 'Master Slowbar', 'Legenda Kopi'];

function weekId(d) { return Math.floor((Date.parse(d + 'T00:00:00Z') / 864e5 + 3) / 7); }

function computeStats() {
  const sorted = [...visits].sort((a, b) => a.date.localeCompare(b.date) || a.created - b.created);
  const seenPlace = new Set(), seenType = new Set();
  let xp = 0;
  for (const v of sorted) {
    const k = v.name.trim().toLowerCase();
    xp += seenPlace.has(k) ? 10 : 25; seenPlace.add(k);
    if (!seenType.has(v.type)) { xp += 15; seenType.add(v.type); }
    xp += Math.min(v.photos.length, 5) * 5;
    if (v.menu) xp += 5;
    if ((v.note || '').length >= 20) xp += 10;
  }
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const weeks = new Set(visits.map(v => weekId(v.date)));
  let w = weekId(todayStr()); if (!weeks.has(w)) w--;
  let streak = 0; while (weeks.has(w)) { streak++; w--; }
  const count = t => visits.filter(v => v.type === t).length;
  return {
    xp, level, streak, total: visits.length, places: seenPlace.size,
    areas: new Set(visits.map(v => (v.area || '').trim().toLowerCase()).filter(Boolean)).size,
    photos: visits.reduce((a, v) => a + v.photos.length, 0),
    notes: visits.filter(v => (v.note || '').length >= 20).length,
    five: visits.some(v => v.rating >= 4.95),
    slowbar: count('slowbar'), cafe: count('cafe'), kedai: count('kedai kopi'),
    types: seenType.size,
  };
}
const BADGES = [
  {id:'first', ic:'🌱', name:'Tegukan Pertama', d:'Catat 1 kunjungan', test: s => s.total >= 1},
  {id:'five', ic:'🔥', name:'Rutin Ngopi', d:'5 kunjungan', test: s => s.total >= 5},
  {id:'ten', ic:'📚', name:'Kolektor', d:'10 kunjungan', test: s => s.total >= 10},
  {id:'25', ic:'👑', name:'Legenda', d:'25 kunjungan', test: s => s.total >= 25},
  {id:'places', ic:'🧭', name:'Penjelajah', d:'5 tempat berbeda', test: s => s.places >= 5},
  {id:'areas', ic:'🗺️', name:'Cafe Hopper', d:'3 area berbeda', test: s => s.areas >= 3},
  {id:'slow', ic:'🫖', name:'Slowbar Lover', d:'3 kunjungan slowbar', test: s => s.slowbar >= 3},
  {id:'types', ic:'🎯', name:'Serba Bisa', d:'Coba ketiga jenis tempat', test: s => s.types >= 3},
  {id:'photo', ic:'📸', name:'Fotografer', d:'10 foto terkumpul', test: s => s.photos >= 10},
  {id:'notes', ic:'✍️', name:'Kritikus', d:'5 catatan lengkap', test: s => s.notes >= 5},
  {id:'perfect', ic:'⭐', name:'Bintang Lima', d:'Beri rating sempurna', test: s => s.five},
  {id:'streak', ic:'⚡', name:'Streak 3 Minggu', d:'Ngopi 3 minggu beruntun', test: s => s.streak >= 3},
];
const earned = s => new Set(BADGES.filter(b => b.test(s)).map(b => b.id));

function renderHud() {
  const s = computeStats(), lo = xpFor(s.level), hi = xpFor(s.level + 1);
  $('#hud').innerHTML = `<div>Level<b>${s.level}</b><span class="bar"><i style="width:${Math.round((s.xp - lo) / (hi - lo) * 100)}%"></i></span></div><div>XP<b>${s.xp}</b></div><div>Streak mingguan<b>${s.streak}</b></div><div>Kunjungan<b>${s.total}</b></div>`;
}
function renderQuest() {
  const s = computeStats(), lo = xpFor(s.level), hi = xpFor(s.level + 1), got = earned(s);
  $('#levelCard').innerHTML = `<div class="meta">Level ${s.level}</div><div class="big">${TITLES[Math.min(s.level - 1, TITLES.length - 1)]}</div>
    <div class="bar"><i style="width:${Math.round((s.xp - lo) / (hi - lo) * 100)}%"></i></div>
    <div class="meta">${s.xp} XP · ${hi - s.xp} XP lagi ke level ${s.level + 1}</div>
    <p>${s.places} tempat · ${s.total} kunjungan · ${s.photos} foto · streak ${s.streak} minggu</p>
    <p class="meta">XP: tempat baru +25, kunjungan ulang +10, jenis baru +15, foto +5 (maks 5), menu +5, catatan lengkap +10</p>`;
  $('#badges').innerHTML = BADGES.map(b => `<div class="badge ${got.has(b.id) ? '' : 'locked'}"><div class="ic">${b.ic}</div><b>${b.name}</b><small>${b.d}</small></div>`).join('');
}

/* ---------- Jurnal ---------- */
function renderList() {
  const q = $('#q').value.trim().toLowerCase(), ft = $('#filterType').value, sort = $('#sortBy').value;
  let list = visits.filter(v => (!ft || v.type === ft) && (!q || [v.name, v.area, v.menu, v.note].join(' ').toLowerCase().includes(q)));
  list.sort((a, b) => sort === 'rating' ? b.rating - a.rating : sort === 'name' ? a.name.localeCompare(b.name) : b.date.localeCompare(a.date) || b.created - a.created);
  $('#empty').hidden = visits.length > 0;
  $('#list').innerHTML = list.map(v => {
    const n = visits.filter(x => x.name.toLowerCase() === v.name.toLowerCase()).length;
    return `<button class="card visit" data-id="${v.id}">
      <div class="cover">${v.photos[0] ? `<img src="${v.photos[0]}" alt="" loading="lazy">` : v.sticker}</div>
      <div class="info"><h3>${esc(v.name)}</h3>
      <div>${stars(v.rating)} <span class="meta">${v.rating.toFixed(1)}</span></div>
      <div class="meta"><span class="tag">${TYPES[v.type]}</span>${n > 1 ? `<span class="tag">🔁 ${n}×</span>` : ''}</div>
      <div class="meta">${fmtDate(v.date)}${v.area ? ' · ' + esc(v.area) : ''}</div></div></button>`;
  }).join('');
  $('#places').innerHTML = [...new Set(visits.map(v => v.name))].map(n => `<option value="${esc(n)}">`).join('');
}
function openDetail(id) {
  const v = visits.find(x => x.id === id); if (!v) return;
  $('#detail').innerHTML = `<h2>${v.sticker} ${esc(v.name)}</h2>
    <div class="meta"><span class="tag">${TYPES[v.type]}</span>${fmtDate(v.date)}${v.area ? ' · ' + esc(v.area) : ''}</div>
    <p>${stars(v.rating)} <b>${v.rating.toFixed(1)}</b><br><span class="meta">Kopi ${v.ratings.coffee || '-'} · Suasana ${v.ratings.vibe || '-'} · Pelayanan ${v.ratings.service || '-'}</span></p>
    ${v.photos.length ? `<div class="detail-photos">${v.photos.map(p => `<img src="${p}" alt="Foto ${esc(v.name)}">`).join('')}</div>` : ''}
    ${v.menu ? `<p>🍽️ ${esc(v.menu)}</p>` : ''}${v.note ? `<p>${esc(v.note).replace(/\n/g, '<br>')}</p>` : ''}
    <div class="actions">
      <button class="ghost danger" data-act="del">Hapus</button>
      <button class="ghost" data-act="edit">Ubah</button>
      <button class="ghost" data-act="scrap">Scrapbook</button>
      <button class="outline" data-act="close">Tutup</button></div>`;
  $('#detail').dataset.id = id;
  $('#detailDlg').showModal();
}
$('#detail').addEventListener('click', async e => {
  const act = e.target.dataset.act, id = $('#detail').dataset.id; if (!act) return;
  $('#detailDlg').close();
  if (act === 'edit') openForm(id);
  if (act === 'scrap') { $('#scrapVisit').value = id; showView('scrap'); }
  if (act === 'del' && confirm('Hapus kunjungan ini?')) { visits = visits.filter(v => v.id !== id); await saveData(); refresh(); toast('Kunjungan dihapus'); }
});
$('#list').addEventListener('click', e => { const c = e.target.closest('.visit'); if (c) openDetail(c.dataset.id); });
['q', 'filterType', 'sortBy'].forEach(i => $('#' + i).addEventListener('input', renderList));

/* ---------- Form ---------- */
let editId = null, formPhotos = [], formRates = {coffee: 0, vibe: 0, service: 0};
function drawStars(box) {
  const key = box.dataset.key, wrap = box.querySelector('.stars');
  wrap.innerHTML = [1, 2, 3, 4, 5].map(i => `<button type="button" class="${i <= formRates[key] ? 'on' : ''}" data-v="${i}" aria-label="${i} bintang">★</button>`).join('');
}
document.querySelectorAll('.rate').forEach(box => {
  drawStars(box);
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = +b.dataset.v; formRates[box.dataset.key] = formRates[box.dataset.key] === v ? 0 : v; drawStars(box);
  });
});
function drawThumbs() {
  $('#thumbs').innerHTML = formPhotos.map((p, i) => `<div><img src="${p}" alt="Foto ${i + 1}"><button type="button" data-i="${i}" aria-label="Hapus foto">×</button></div>`).join('');
}
$('#thumbs').addEventListener('click', e => { const i = e.target.dataset.i; if (i != null) { formPhotos.splice(+i, 1); drawThumbs(); } });
async function compress(file, max = 1000) {
  const bmp = await createImageBitmap(file), s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', .8);
}
$('#photos').addEventListener('change', async e => {
  for (const f of [...e.target.files]) {
    if (formPhotos.length >= 6) { toast('Maksimal 6 foto per kunjungan'); break; }
    try { formPhotos.push(await compress(f)); } catch { toast('Gagal membaca foto'); }
  }
  e.target.value = ''; drawThumbs();
});
function openForm(id = null) {
  editId = id;
  const f = $('#form'), v = id && visits.find(x => x.id === id);
  f.reset();
  f.name.value = v?.name || ''; f.type.value = v?.type || 'kedai kopi'; f.date.value = v?.date || todayStr();
  f.area.value = v?.area || ''; f.menu.value = v?.menu || ''; f.note.value = v?.note || ''; f.sticker.value = v?.sticker || '☕';
  formPhotos = [...(v?.photos || [])]; formRates = {coffee: 0, vibe: 0, service: 0, ...(v?.ratings || {})};
  document.querySelectorAll('.rate').forEach(drawStars); drawThumbs();
  $('#formTitle').textContent = v ? 'Ubah kunjungan' : 'Kunjungan baru';
  $('#formDlg').showModal();
}
$('#add').onclick = () => openForm();
$('#cancel').onclick = () => $('#formDlg').close();
$('#form').addEventListener('submit', async e => {
  const f = e.target;
  if (!Object.values(formRates).some(Boolean)) { e.preventDefault(); toast('Beri minimal satu rating ⭐'); return; }
  const r = Object.values(formRates).filter(Boolean), before = computeStats(), had = earned(before);
  const data = {
    name: f.name.value.trim(), type: f.type.value, date: f.date.value, area: f.area.value.trim(), menu: f.menu.value.trim(),
    note: f.note.value.trim(), sticker: f.sticker.value, photos: formPhotos, ratings: {...formRates},
    rating: r.reduce((a, b) => a + b, 0) / r.length,
  };
  if (editId) Object.assign(visits.find(v => v.id === editId), data);
  else visits.push({id: crypto.randomUUID(), created: Date.now(), seed: Math.floor(Math.random() * 1e9), paper: 'night', ...data});
  try { await saveData(); } catch { toast('Penyimpanan penuh! Kurangi foto.'); return; }
  const after = computeStats(), gained = after.xp - before.xp, newB = BADGES.filter(b => earned(after).has(b.id) && !had.has(b.id));
  let msg = `+${gained} XP`;
  if (after.level > before.level) msg += ` · 🎉 Naik ke level ${after.level}!`;
  if (newB.length) msg += ` · Lencana baru: ${newB.map(b => b.ic + ' ' + b.name).join(', ')}`;
  refresh(); toast(msg);
});

/* ---------- Scrapbook (digambar di canvas agar bisa diunduh) ---------- */
const PAPERS = {
  kraft: {bg: '#c9a77c', ink: '#3a2716', card: '#fff8ea', dots: '#b4905f'},
  cream: {bg: '#f7f0e2', ink: '#3a2716', card: '#ffffff'},
  grid: {bg: '#fbf8f1', ink: '#2d3a4a', card: '#ffffff', grid: '#cfe0ea'},
  night: {bg: '#26211f', ink: '#f3e6d2', card: '#f7efe2', dots: '#3a312d'},
};
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
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
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
let scrapToken = 0;
async function renderScrap() {
  const v = visits.find(x => x.id === $('#scrapVisit').value), cv = $('#scrapCanvas');
  const has = !!v; $('#scrapEmpty').hidden = has; cv.hidden = !has; if (!has) return;
  const token = ++scrapToken, P = PAPERS[v.paper] || PAPERS.kraft, r = rng(v.seed);
  await Promise.all([document.fonts.load('700 60px Caveat'), document.fonts.load('800 60px Fraunces')]).catch(() => {});
  const imgs = (await Promise.all(v.photos.map(loadImg))).filter(Boolean);
  if (token !== scrapToken) return;
  const W = 900, n = imgs.length, rows = Math.ceil(n / 2), headH = 260, cellH = 440;
  const body = `${v.menu ? 'Pesanan: ' + v.menu + '\n' : ''}${v.note || ''}`;
  const m = document.createElement('canvas').getContext('2d'); m.font = '500 30px Caveat, cursive';
  const lines = body ? wrap(m, body, 660) : [];
  const infoH = 230 + lines.length * 36 + 60, H = headH + rows * cellH + infoH;
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
  if (P.grid) { c.strokeStyle = P.grid; c.lineWidth = 1; for (let x = 0; x < W; x += 30) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
  if (P.dots) { c.fillStyle = P.dots; for (let i = 0; i < 500; i++) { c.beginPath(); c.arc(r() * W, r() * H, 1 + r() * 2, 0, 7); c.fill(); } }
  // header
  c.fillStyle = P.ink; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  let size = 84; do { c.font = `700 ${size}px Caveat, cursive`; size -= 4; } while (c.measureText(v.name).width > 740 && size > 30);
  c.fillText(v.name, W / 2, 120);
  c.font = '500 34px Caveat, cursive';
  c.fillText(`${fmtDate(v.date)}${v.area ? ' · ' + v.area : ''}`, W / 2, 175);
  c.font = '60px serif'; c.save(); c.translate(80, 90); c.rotate(-.25); c.fillText(v.sticker, 0, 0); c.restore();
  c.save(); c.translate(W - 80, 100); c.rotate(.2); c.fillText(v.sticker, 0, 0); c.restore();
  c.font = '500 28px Caveat, cursive'; c.fillText(TYPES[v.type].toUpperCase() + ' · ' + '★'.repeat(Math.round(v.rating)) + '☆'.repeat(5 - Math.round(v.rating)), W / 2, 220);
  // photos
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
  // info card
  const y0 = headH + rows * cellH + 10;
  c.save(); c.translate(W / 2, y0 + (infoH - 20) / 2); c.rotate((r() - .5) * .03);
  c.shadowColor = '#0005'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = P.card;
  rrect(c, -390, -(infoH - 40) / 2, 780, infoH - 40, 14); c.fill(); c.shadowColor = 'transparent';
  c.strokeStyle = '#c9a77c'; c.setLineDash([8, 6]); c.lineWidth = 2; rrect(c, -378, -(infoH - 40) / 2 + 12, 756, infoH - 64, 10); c.stroke(); c.setLineDash([]);
  let y = -(infoH - 40) / 2 + 70; c.textAlign = 'left'; c.fillStyle = '#3a2716';
  c.font = '800 44px Fraunces, serif'; c.fillText(`${v.rating.toFixed(1)} / 5`, -340, y);
  c.fillStyle = '#e0a526'; c.font = '44px serif'; c.fillText('★'.repeat(Math.round(v.rating)), -150, y);
  y += 50; c.fillStyle = '#7d6a5c'; c.font = '500 30px Caveat, cursive';
  c.fillText(`Kopi ${v.ratings.coffee || '-'}   Suasana ${v.ratings.vibe || '-'}   Pelayanan ${v.ratings.service || '-'}`, -340, y);
  y += 20; c.fillStyle = '#3a2716'; c.font = '500 30px Caveat, cursive';
  lines.forEach(l => { y += 36; c.fillText(l, -340, y); });
  c.restore();
  c.fillStyle = P.ink; c.globalAlpha = .6; c.font = '500 24px Caveat, cursive'; c.textAlign = 'center';
  c.fillText('Jejak Kopi ☕', W / 2, H - 14); c.globalAlpha = 1;
  cv.dataset.name = v.name;
}
function fillScrapSelect() {
  const sel = $('#scrapVisit'), cur = sel.value;
  const list = [...visits].sort((a, b) => b.date.localeCompare(a.date));
  sel.innerHTML = list.map(v => `<option value="${v.id}">${esc(v.name)} — ${fmtDate(v.date)}</option>`).join('');
  if (list.some(v => v.id === cur)) sel.value = cur;
  const v = visits.find(x => x.id === sel.value); if (v) $('#scrapPaper').value = v.paper || 'kraft';
}
$('#scrapVisit').onchange = () => { fillPaper(); renderScrap(); };
function fillPaper() { const v = visits.find(x => x.id === $('#scrapVisit').value); if (v) $('#scrapPaper').value = v.paper || 'kraft'; }
$('#scrapPaper').onchange = async () => { const v = visits.find(x => x.id === $('#scrapVisit').value); if (v) { v.paper = $('#scrapPaper').value; await saveData(); renderScrap(); } };
$('#shuffle').onclick = async () => { const v = visits.find(x => x.id === $('#scrapVisit').value); if (v) { v.seed = Math.floor(Math.random() * 1e9); await saveData(); renderScrap(); } };
$('#download').onclick = () => {
  const cv = $('#scrapCanvas'); if (cv.hidden) return;
  cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `scrapbook-${(cv.dataset.name || 'kopi').replace(/\W+/g, '-')}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); });
};

/* ---------- Ekspor / impor ---------- */
$('#export').onclick = () => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(visits)], {type: 'application/json'}));
  a.download = `jejak-kopi-${todayStr()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
$('#import').onchange = async e => {
  try {
    const d = JSON.parse(await e.target.files[0].text());
    if (!Array.isArray(d) || d.some(v => !v.id || !v.name || !Array.isArray(v.photos))) throw 0;
    if (!confirm(`Ganti data saat ini dengan ${d.length} kunjungan dari berkas?`)) return;
    visits = d; await saveData(); refresh(); toast('Impor berhasil');
  } catch { toast('Berkas tidak valid'); }
  e.target.value = '';
};

/* ---------- Navigasi ---------- */
function showView(name) {
  document.querySelectorAll('.view').forEach(s => s.hidden = s.id !== 'view-' + name);
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.view === name));
  $('#hero').hidden = name !== 'journal';
  if (name === 'scrap') { fillScrapSelect(); fillPaper(); renderScrap(); }
  if (name === 'quest') renderQuest();
  scrollTo(0, 0);
}
document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => showView(b.dataset.view));
function refresh() {
  renderHud(); renderList();
  if ($('#formDlg').open) $('#formDlg').close();
  const cur = document.querySelector('.tabs button.on').dataset.view;
  if (cur !== 'journal') showView(cur);
}
(async () => { visits = await loadData(); renderHud(); renderList(); })();
