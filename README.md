# ☕ Jejak Kopi (Coffee Journey 2.0)
> **Darkroom Product Editorial & Coffee Expedition Journal** — Aplikasi web interaktif cafe hunting & jurnal kopi berbasis **Tailwind CSS** dengan estetika **ORYZO AI Darkroom Editorial**: kanvas gelap hangat (*Walnut Shadow* `#100904`), tipografi krem (*Warm Cream* `#ffedd7`), aksen solid *Bark Brown* (`#382416`), garis pemisah *Cork Border* (`#40372e`), dan aksen *Ember* (`#dc5000`). Berfokus pada penandaan pin koordinat di peta satelit terlebih dahulu (*Pin-First Workflow*).

![Jejak Kopi Darkroom Editorial Hero](docs/screenshots/map.png)

---

## ⚡ Filosofi Desain: ORYZO AI Darkroom Editorial

Desain antarmuka dirancang ulang mengikuti sistem desain **ORYZO AI**:
- **Palet Warna Warm Darkroom**:
  - `Walnut Shadow (#100904)`: Kanvas gelap hangat natural (bukan hitam pekat sintetis).
  - `Warm Cream (#ffedd7)`: Teks utama dan garis interaktif yang hangat seperti kertas klasik.
  - `Bark Brown (#382416)`: Permukaan solid untuk satu-satunya tombol CTA utama.
  - `Cork Border (#40372e)`: Hairline dashed dividers (1px garis putus-putus) dan pembatas kontainer.
  - `Driftwood (#6c5f51)`: Nuansa abu-abu hangat transisi untuk teks sekunder.
  - `Ember Accent (#dc5000)`: Aksen oranye untuk link, tag khusus, dan indikator status aktif.
- **Tipografi Editorial**:
  - **Uppercase Weight 500**: Standar tegas pada navigasi, heading, tombol, dan label data.
  - **Mixed Case Weight 400**: Khusus untuk catatan seduhan, deskripsi cupping, dan cerita jurnal lapangan.
  - **Line-Height Ketat (0.9)**: Menghasilkan judul display yang sculptural seperti karya editorial majalah desain.
- **Kemudahan Pemeliharaan (Maintainability)**:
  - Dibangun dengan **Tailwind CSS** + **PostCSS** + konfigurasi token terpusat di `tailwind.config.js`.
  - Komponen modular dan kelas utilitas yang terstruktur rapi.
- **Zero Drop-Shadows**: Kedalaman visual murni dicapai dari hierarki warna permukaan (`#100904` → `#382416`), tanpa efek blur berlebihan.

---

## 🗺️ Fitur Utama

### 1. ⌖ Peta Lapangan Satelit (Pin-First Workflow — Fitur Utama)
Halaman awal langsung menyajikan terminal peta satelit resolusi tinggi sehingga kamu dapat langsung menandai titik sebelum mengisi jurnal:
- **Tandai Langsung di Peta**: Klik koordinat mana pun pada peta satelit untuk memunculkan bidik reticle warm cream/ember dan membuka formulir *Tandai Kafe di Titik Ini*.
- **HUD Telemetri Koordinat Realtime**: Menampilkan `CURSOR POS` (latitude/longitude saat kursor bergerak) dan `TARGET PIN` secara presisi.
- **Lokasi Saya Instan (GPS)**: Tombol `⌖ LOKASI SAYA SEKARANG` untuk langsung mengunci koordinat GPS perangkat kamu di lapangan.
- **Pencarian Alamat & Tempat**: Kolom pencarian minimalis (*underline-only*) terintegrasi dengan OpenStreetMap Nominatim.
- **Reverse Geocoding Otomatis**: Mendeteksi nama jalan, kelurahan, dan kota secara otomatis saat koordinat dipilih.
- **Tabel Log Ekspedisi**: Ringkasan daftar kafe yang telah ditandai lengkap dengan stempel koordinat dan link cepat ke detail.

| Peta Satelit & Penandaan Pin Baru | Formulir Logbook dengan Mini Map Satelit |
| :---: | :---: |
| ![Peta](docs/screenshots/map-add-pin.png) | ![Form](docs/screenshots/form.png) |

---

### 2. 📖 Logbook Kafe & Degustasi Rasa
- Catat kedai kopi, roastery, slowbar, maupun espresso bar favoritmu.
- **Rating 3 Dimensi**: Kopi, Suasana, dan Pelayanan beserta kalkulasi skor agregat.
- **Degustasi Cupping Lengkap**:
  - Metode seduh (*Espresso, V60, Aeropress, Japanese Iced, Cold Brew, Kalita Wave, dll.*)
  - Origin / jenis biji kopi (*Single Origin, Blend, Process*)
  - 15 pilihan chips profil rasa (*Fruity, Floral, Citrus, Caramel, Nutty, Creamy, Clean, Fermented, dll.*)
- Pencarian instan berdasarkan nama kafe, area, origin biji kopi, maupun filter rasa.

![Daftar Logbook Kafe](docs/screenshots/journal.png)

---

### 3. 🖼️ Scrapbook Polaroid Generator
- Ubah dokumentasi foto kunjungan menjadi lembaran scrapbook estetis.
- Tampilan foto bergaya polaroid miring dengan selotip washi tape, stiker ekspedisi, dan catatan tiket seduhan.
- Pilihan tekstur kertas: *Walnut Darkroom, Kertas Kraft, Krem Vellum, dan Kotak-kotak (Grid)*.
- Tombol **🎲 Acak Tata Letak** untuk mengocok sudut kemiringan dan posisi secara dinamis.
- Ekspor langsung dalam resolusi tinggi sebagai format **PNG**.

<p align="center">
  <img src="docs/screenshots/scrapbook.png" alt="Scrapbook Polaroid" width="480" />
</p>

---

### 4. 🎮 Misi & Telemetri Gamifikasi (Expedition Operator)
- **Tingkat & Peringkat Operator**: Dari *Operator Pemula* hingga *Master Roastery & Explorer*.
- **Sistem Perolehan XP**:
  - Kafe baru: `+25 XP`
  - Kunjungan ulang: `+10 XP`
  - Jenis tempat baru: `+15 XP`
  - Foto dokumentasi: `+5 XP` per foto
  - Pin koordinat di peta: `+5 XP`
  - Profil rasa kopi diisi: `+5 XP`
  - Catatan deskriptif (≥ 20 huruf): `+10 XP`
- **Misi Mingguan Dinamis**: Misi eksplorasi yang diperbarui berkala untuk memicu petualangan baru.
- **13 Lencana Penghargaan Lapangan**: *Tegukan Pertama, Rutin Ngopi, Cafe Hopper, Kartografer, Slowbar Lover, Fotografer, Bintang Lima, dll.*
- **Efek Konfeti Selebrasi**: Umpan balik visual saat menyelesaikan misi dan mencapai level baru.

![Misi & Telemetri](docs/screenshots/quest.png)

---

### 5. 💾 Penyimpanan Offline-First & Keamanan Data
- Berjalan sepenuhnya di sisi klien menggunakan **IndexedDB** berkapasitas besar.
- Kompresi foto otomatis di peramban sehingga hemat ruang penyimpanan dan cepat dimuat.
- **Ekspor Cadangan JSON** dan **Impor** untuk memindahkan data antar perangkat dengan aman tanpa server pihak ketiga.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Frontend Core**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **Styling Framework**: [Tailwind CSS v3](https://tailwindcss.com/) + [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer)
- **Peta Satelit**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) + [Esri World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9) + OSM Nominatim
- **Sistem Desain**: ORYZO AI Style Reference (`#100904` Walnut Shadow, `#ffedd7` Warm Cream, `#382416` Bark Brown, `#40372e` Cork Border, `#dc5000` Ember Accent)
- **Tipografi**: Inter (Halyard substitute), JetBrains Mono, Caveat, Fraunces
- **Rendering Kanvas**: HTML5 Canvas API (Generator Scrapbook PNG)
- **Database**: IndexedDB Browser API

---

## 🚀 Cara Menjalankan di Lokal

Pastikan [Node.js](https://nodejs.org/) (versi 18+) sudah terpasang di komputermu:

```bash
# 1. Clone repositori ini
git clone https://github.com/soulblade12/coffee-journey-1.0.git
cd coffee-journey-1.0

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```

Buka peramban di `http://localhost:5173`.

### Build untuk Produksi
```bash
npm run build
```
Hasil siap pakai akan otomatis dibangun di dalam folder `dist/`.

---

## 📱 Tampilan Mobile

Dirancang responsif untuk memudahkan inspeksi dan pencatatan langsung saat berada di kedai kopi:

<p align="center">
  <img src="docs/screenshots/mobile.png" alt="Tampilan Mobile" width="340" />
</p>

---

Dibuat dengan ☕ untuk para penikmat kopi & cafe hunters.
