# E-WISE — Website & Aplikasi (fondasi)

Environmental Waste & Safety Intelligence · Tim E-WISE · Kompetisi 2026

Website statis murni (HTML + CSS + JavaScript, tanpa framework dan tanpa build).
Buka `index.html` di browser, atau unggah seluruh folder ke hosting statis
(GitHub Pages, Netlify, Vercel, cPanel).

## Struktur

```
index.html              SPA publik: header · Dashboard · Tentang Kami · Demo · footer
app.html                Aplikasi (Config ERP): alur masuk + sidebar + 7 halaman
assets/css/tokens.css   Sistem desain dari brief (palet GSM, Poppins, tema terang/gelap)
assets/css/site.css     Gaya halaman publik
assets/css/app.css      Gaya aplikasi
assets/js/core.js       Bersama: storage, tema, ID|EN, toast, grafik SVG
assets/js/i18n-site.js  Teks ID|EN halaman publik
assets/js/i18n-app.js   Teks ID|EN aplikasi
assets/js/config.js     KONFIGURASI FUNGSIONAL (menu, alur, area, shift, tur, ambang)
assets/js/data-sample.js Data contoh dari brief (ganti dengan data backend nanti)
assets/js/app.js        Logika aplikasi
```

## Bagian 1 — SPA publik (`index.html`)

Router hash, tanpa reload:

| Hash | Isi |
|---|---|
| `#dashboard` | Hero, angka masalah, 4 modul solusi, Inti Inovasi, cara kerja, preview dashboard, area penerapan, CTA |
| `#tentang` | Masalah (shortcut sesuai brief), cerita, visi–misi, standar acuan, tim, perjalanan |
| `#demo` | 6 langkah cara pakai (dengan mockup), video walkthrough, arti warna, FAQ, form jadwal demo |
| `#demo-1` … `#demo-6` | Langsung ke langkah tertentu (dipakai link "Lihat cara kerja" di kartu modul) |

Header: Dashboard · Tentang Kami · Demo · ID | EN · switch tema · tombol **Mulai →** ke `app.html`.
Pilihan bahasa dan tema diingat di perangkat (localStorage) dan dipakai bersama oleh aplikasi.

## Bagian 2 — Config ERP (`app.html`)

**Step by step (alur masuk, sesuai "Alur Aplikasi v2")**
1. Loading ≤ 3 detik — cek sensor, kamera, data hari ini
2. Pilih area & shift — shift yang berjalan otomatis terpilih; pilihan terakhir diingat
3. Sambutan — hanya muncul pertama kali
4. Tur singkat 4 sorotan — skor risiko → angka utama → Early Warning → input data
5. Dashboard

Tombol **? Tutorial** di topbar memutar ulang tur. Untuk mengulang sambutan, hapus
`ewise:welcomed` dan `ewise:toured` di localStorage browser.

**Sidebar (sesuai brief)** — MONITOR: Dashboard, Early Warning, Analisis Risiko (HSE) ·
INPUT DATA: Sensor Lingkungan, Computer Vision / APD, HSE Walk-around, Fiber Waste ·
status sensor & risiko area · "Keluar ke beranda".

**Config fungsional** — semuanya di `assets/js/config.js`:
menambah area, mengganti urutan menu, mengubah teks tur, ambang warna
(PM action level 100 / NAB 200 µg/m³, kebisingan NAB 85 dBA, target APD 95%,
fiber loss kuning ≥ 2% merah ≥ 3%, skor risiko < 0,40 / < 0,70 / ≥ 0,70).

Yang sudah berfungsi di fondasi ini:
- Fiber loss dihitung langsung: `berat waste ÷ input bahan × 100%`
- Input manual sensor memperbarui kartu, grafik, dan One Record
- Laporan HSE: unggah `.csv` (kolom `Aspek`, `Catatan`) → klasifikasi sementara berbasis kata kunci → bisa diubah → simpan
- Early Warning: filter, detail penyebab, Tugaskan PIC, Tandai ditindaklanjuti
- Tugas hari ini tercentang otomatis saat input selesai

## Konfigurasi teknis (tahap berikutnya)

Bagian `technical` di `config.js` masih kosong, diisi saat integrasi:
`apiBaseUrl`, node sensor ESP32, kamera CV, endpoint NLP, bobot model risiko, notifikasi.
Juga: membaca `.xlsx` (SheetJS atau backend), unduh template Excel, unduh laporan PDF,
data periode 30/90 hari, dan pengiriman form jadwal demo.

## Versi HP

Sudah responsif dasar (tidak pecah di lebar 390 px). Versi HP lengkap sesuai
"E-WISE Versi HP" (navigasi bawah 5 menu, tombol + di tengah, bottom sheet) menyusul.

## Yang perlu diganti tim

- Nama & foto anggota: `index.html` bagian `#tim`
- Email kontak: footer `index.html`
- Sumber angka statistik (2,86×10⁶; ≤1,2×10⁶; 32,1%): cantumkan rujukan dari paper
