# ☕ Jejak Kopi (Coffee Journey 2.0)
> **Darkroom Product Editorial & Coffee Journal** — Aplikasi web interaktif eksplorasi kedai kopi & jurnal rasa berbasis **React 18**, **Tailwind CSS**, arsitektur modular standar startup, dan estetika **ORYZO AI Darkroom Editorial**: kanvas gelap hangat (*Walnut Shadow* `#100904`), tipografi krem (*Warm Cream* `#ffedd7`), aksen solid *Bark Brown* (`#382416`), garis pemisah *Cork Border* (`#40372e`), dan aksen *Ember* (`#dc5000`).

Dilengkapi **Interactive Drag & Drop Scrapbook Book**, **AI Photo Scanner & Die-Cut Vinyl Sticker Generator**, **Pin-First Satellite Map**, **Hybrid Places API (Google + OpenStreetMap)**, **Check-in Cepat (30 Detik)**, **Wishlist Map Pinning**, dan gamifikasi petualangan rasa dengan dukungan penuh untuk layar **Mobile, Tablet, dan Desktop**.

![Jejak Kopi Darkroom Editorial Hero](docs/screenshots/map.png)

---

## 🛠️ Tech Stack & Architecture

- **Core & Framework:** React 18, Vite 5, Node.js 18+
- **Styling & Design System:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **UI Helper & Icons:** `lucide-react` (vektor ikon modern & tajam), `clsx`, `tailwind-merge` (utilitas `cn` standar industri)
- **Overlay Management:** React Portals (`createPortal(..., document.body)`) dengan `z-[9999]` memastikan modal, drawer, dan sheet selalu berada di layer teratas, kebal terhadap *stacking context* Leaflet.
- **Peta & Geospasial:** Leaflet, React-Leaflet, Esri World Imagery (Satelit), OpenStreetMap (Jalanan), Geolocation API browser
- **Penyimpanan Lokal:** Dexie.js (IndexedDB) dengan migrasi skema otomatis dari versi sebelumnya (aman & privat di perangkat user)
- **AI & Computer Vision:** Tesseract.js (Client-side offline OCR) & HTML5 Canvas untuk deteksi profil rasa dan pencetakan stiker vinyl die-cut
- **State Management:** Zustand (Store modular terpisah untuk Visits dan UI State)
- **Pengujian & Kualitas Kode:** Vitest 2.1+, Puppeteer E2E Testing, ESLint

---

## ☕ Sentuhan Autentik Pecinta Kopi & Barista

Berdasarkan review mendalam dari sudut pandang penikmat specialty coffee, Jejak Kopi menghadirkan:
1. **Bahasa Ngopi yang Hangat**: Seluruh istilah antarmuka menggunakan terminologi autentik kedai kopi (*Jurnal Ngopi, Logbook Seduhan, Catatan Rasa, Buku Kenangan, Mampir di sini?*).
2. **Check-in Cepat (< 30 Detik)**: Catat saat cangkir masih hangat! Cukup klik/sentuh titik pada peta, masukkan nama kafe (dengan saran otomatis), rating kilat, foto cepat, atau simpan ke Wishlist, lalu lengkapi detail cupping kapan pun kamu santai.
3. **1 Tempat = 1 Pin**: Kunjungan ulang ke kafe yang sama otomatis digabung dalam 1 pin rapi dengan lencana jumlah kunjungan (misal: "3x Mampir") dan riwayat lengkap, mencegah pin bertumpuk.
4. **Wishlist Kafe di Peta**: Pin "Mau Dicoba" dengan warna kuning hangat berpendar (*amber glowing star*) berbeda jelas dari kafe yang sudah dikunjungi.
5. **Atribut Cupping Sensori Mendalam**:
   - Skala sensori 1–5: *Acidity (Keasaman), Body (Kekentalan), Sweetness (Kemanisan), Aftertaste (Kesan Akhir)*.
   - Proses pascapanen: *Washed, Natural, Honey, Anaerobic, Giling Basah (Wet-Hulled)*.
   - Tingkat sangrai: *Light, Medium, Dark Roast*.
   - Kategori minuman: *Kopi Hitam (Filter/Espresso)* vs *Kopi Susu (Latte/Cappuccino/Aren)*.

---

## 📱 Responsif di Mobile, Tablet, dan Desktop

Aplikasi dirancang responsif dari nol:
- **Mobile (Layar HP):**
  - Navigasi bawah (*bottom bar*) dengan jangkauan jempol yang nyaman.
  - Floating action drawer pada peta untuk check-in instan dengan satu sentuhan.
  - Modal dan form yang adaptif terhadap keyboard virtual.
- **Tablet (iPad / Layar Sentuh):**
  - Drag-and-drop scrapbook yang halus dengan sentuhan jari atau stylus pen.
  - Tampilan split kartu logbook dan peta satelit yang proporsional.
- **Desktop:**
  - Navigasi editorial atas yang ramping (*fixed glass topbar*).
  - Tampilan grid responsif 3 kolom pada Logbook dan Lencana.

---

## 🔌 Strategi Hybrid Places API (Google + OSM Gratis)

Aplikasi mengadopsi arsitektur hybrid cerdas yang sepenuhnya mematuhi **Google Maps Platform Terms of Service**:

| Fitur | Penyedia | Kepatuhan & Peran |
| :--- | :--- | :--- |
| **Peta Dasar Satelit & Jalan** | **Leaflet + Esri / OSM** | Peta interaktif cepat tanpa biaya API. |
| **Pin Jurnal Pengguna** | **Koordinat Tap / GPS User** | Data milik user sendiri, bebas ditampilkan di peta mana pun. |
| **Saran Kafe Terdekat (Tap Peta)** | **Overpass API (OSM)** | Mengambil kafe sekitar radius 350m dengan atribusi *© OpenStreetMap* dan timeout 2.5s non-blocking. |
| **Autocomplete Pencarian Kafe** | **Google Places (New) → Fallback Photon (OSM)** | Jika `VITE_GOOGLE_MAPS_KEY` diisi, saran pencarian menggunakan data Google yang akurat di Indonesia, ditampilkan sebagai daftar teks dengan branding *"Powered by Google"*. Jika tanpa key atau kuota habis, otomatis beralih ke OSM. |
| **Info Detail Langsung** | **Google Place Details** | Menampilkan jam buka live dan rating Google langsung dari `place_id` tanpa disimpan permanen di database lokal (patuh ToS Google). |

---

## 🖼️ Fitur Scrapbook & Pemindai Stiker AI

1. **Buku Kenangan Interaktif (Drag & Drop)**:
   - Atur posisi foto polaroid miring, stiker label seduhan, washi tape (*Kraft, Amber, Matcha, Espresso*), dan cap kurasi (*Fresh Brew, Single Origin, Approved Taste*).
   - Bebas geser, putar derajat kemiringan, dan ubah ukuran dengan sentuhan layar tablet/HP atau mouse.
   - Tambahkan memo tulisan tangan (*handwritten note*) dengan font autentik *Caveat*.
   - Ekspor PNG tajam resolusi tinggi 2x yang persis dengan tata letak layar.
2. **AI Photo Scanner & Vinyl Die-Cut Sticker (Tesseract.js)**:
   - Foto kartu rasa (*tasting card*) dari barista atau stiker kemasan biji kopi.
   - Mesin OCR lokal membaca teks kartu secara otomatis, mendeteksi origin dan aroma (*Floral, Citrus, Berry, Caramel, dll.*), dan mencetaknya jadi stiker vinyl die-cut berbingkai putih.
   - Anti-storage bloat: seluruh foto dan stiker dikompresi otomatis dengan resolusi optimal sebelum disimpan.

---

## 🧱 Struktur Kode Bersih Standar Startup (Feature-Based)

Arsitektur aplikasi disusun modular, terstruktur rapi, dan mudah dipelihara (*maintainable*):

```
src/
├── app/                  # Kerangka aplikasi
│   └── App.jsx           # Layout ramping, routing tab & modal orchestration
├── config/
│   └── env.js            # Environment flags & Google Maps API key
├── data/
│   ├── db.js             # Dexie (IndexedDB) dengan migrasi skema otomatis dari versi lama
│   └── visitsRepo.js     # Repository CRUD data kunjungan & wishlist
├── features/             # Satu folder = satu domain fitur mandiri
│   ├── map/              # MapView.jsx, MapPicker.jsx, mapParts.jsx
│   ├── visits/           # QuickCheckinModal.jsx, VisitForm.jsx, VisitDetail.jsx, CuppingRadar.jsx
│   ├── journal/          # Journal.jsx (Logbook arsip seduhan & pencarian)
│   ├── scrapbook/        # Scrapbook.jsx, exportPng.js, accessories.js
│   ├── stickers/         # StickerScannerModal.jsx, stickerScanner.js (OCR & Canvas)
│   ├── gamification/     # lib/ (xp.js, missions.js, badges.js, stats.js), Quest.jsx, __tests__/
│   └── places/           # Hybrid Google Places + OSM (osmPlaces.js, googlePlaces.js, PlaceSuggestSheet.jsx)
├── shared/
│   ├── ui/               # Button, Card, Modal, Sheet, Stars, Chip, Tag, Input
│   ├── lib/              # cn.js, date.js, image.js (compress), geo.js, confetti.js, id.js
│   └── copy/id.js        # Bahasa Indonesia autentik kopi terpusat
└── store/
    ├── useVisitsStore.js # State kunjungan & repository binding (Zustand)
    └── useUiStore.js     # State navigasi, drawer, modal, dan notifikasi toast (Zustand)
```

---

## 🎮 Gamifikasi & Aturan XP yang Akurat

- **Tingkat & Gelar Pecinta Kopi**: Dari *Peminum Kopi Pemula*, *Pencicip Kedai*, *Penjelajah Kafe*, *Kartografer Seduhan*, *Pemburu Single Origin*, hingga *Legenda Coffee Sommelier*.
- **Sistem Perolehan XP Konsisten**:
  - Kafe baru: `+25 XP`
  - Kunjungan ulang: `+10 XP`
  - Kategori tempat baru: `+15 XP`
  - Foto dokumentasi: `+5 XP` per foto (maks 5 foto)
  - Nama menu / origin dicatat: `+5 XP`
  - Pin titik koordinat di peta: `+5 XP`
  - Profil rasa / cupping diisi: `+5 XP`
  - Catatan cerita deskriptif (≥ 20 huruf): `+10 XP`
  - Scan foto jadi stiker vinyl: `+15 XP`
  - Simpan susunan buku kenangan scrapbook: `+10 XP`
  - Bonus misi mingguan: `+20 s/d +35 XP` per misi selesai
- **15 Lencana Penghargaan Autentik**:
  *Tegukan Pertama, Rutin Ngopi, Kolektor Logbook, Legenda Penjelajah, Penjelajah Kedai, Kartografer Kopi, Penakluk Wishlist, Pencinta Slowbar, Analis Sensori, Artisan Stiker, Storyteller Kopi, Sommelier Rasa, Dokumentasi Visual, Seduhan Sempurna, dan Ritual 3 Minggu.*

---

## 🚀 Menjalankan Proyek

### Prasyarat
- Node.js (v18.12+ atau v20 LTS)
- npm

### Instalasi & Menjalankan Dev Server
```bash
# Pasang dependensi
npm install

# Jalankan development server
npm run dev
```
Buka browser pada tautan `http://localhost:5173`.

### Menjalankan Unit Tests (Vitest)
```bash
npm test
```

### Build untuk Produksi
```bash
npm run build
```

---

## 🔑 Konfigurasi Opsional Google Places

Jika ingin mengaktifkan Google Places Autocomplete & Details:
1. Salin `.env.example` ke `.env.local`
2. Masukkan API key Google Cloud dengan library **Places API (New)** aktif:
```env
VITE_GOOGLE_MAPS_KEY=AIzaSy...
```
*Jika key tidak diisi, aplikasi 100% otomatis menggunakan OpenStreetMap & Photon secara gratis tanpa error.*

---

&copy; 2026 Jejak Kopi — Dibangun dengan cinta untuk para penjelajah kedai dan penikmat seduhan kopi.
