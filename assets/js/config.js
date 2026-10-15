/* =========================================================
   E-WISE · config.js — KONFIGURASI FUNGSIONAL
   ---------------------------------------------------------
   Semua yang menentukan PERILAKU aplikasi (menu sidebar, alur
   masuk step-by-step, area, shift, tur, ambang warna) diatur
   di sini, bukan di dalam kode tampilan. Ubah file ini untuk
   menambah area, mengganti urutan menu, atau mengubah ambang.

   Bagian `technical` sengaja masih kosong: diisi nanti saat
   integrasi sensor (ESP32), kamera CV, NLP, dan backend.
   ========================================================= */
window.EW_CONFIG = {
  app: {
    name: "E-WISE",
    tagline: { id: "Environmental Waste & Safety Intelligence", en: "Environmental Waste & Safety Intelligence" },
    version: "0.1.0-fondasi",
    homeUrl: "index.html",        // tujuan logo & "Keluar ke beranda"
    sampleData: true,             // tampilkan label "Data contoh"
  },

  /* ---------- Alur masuk (Step by Step) — brief "Alur Aplikasi v2" ---------- */
  flow: {
    steps: ["loading", "select", "welcome", "tour", "app"],
    loadingMaxMs: 3000,           // catatan vendor #1: maksimal 3 detik
    loadingChecks: ["sensor", "camera", "data"],
    welcomeOnce: true,            // catatan vendor #2: sambutan & tur hanya sekali
    tourOnce: true,
    rememberLastSelection: true,  // catatan vendor #3: ingat area & shift terakhir
    defaultPage: "dashboard",
  },

  /* ---------- Sidebar (sama persis dengan brief) ---------- */
  menu: [
    {
      group: "monitor",
      label: { id: "Monitor", en: "Monitor" },
      items: [
        { id: "dashboard", icon: "grid", label: { id: "Dashboard", en: "Dashboard" },
          title: { id: "Dashboard risiko harian", en: "Daily risk dashboard" },
          sub: { id: "Semua data dalam satu layar", en: "All data on one screen" } },
        { id: "early-warning", icon: "bell", label: { id: "Early Warning", en: "Early Warning" }, badge: "ewActive",
          title: { id: "Early warning", en: "Early warning" },
          sub: { id: "Peringatan dini", en: "Early alerts" } },
        { id: "analisis", icon: "chart", label: { id: "Analisis Risiko", en: "Risk Analysis" }, role: "hse",
          title: { id: "Analisis risiko", en: "Risk analysis" },
          sub: { id: "Untuk HSE · gambaran besar semua area", en: "For HSE · big picture across areas" } },
      ],
    },
    {
      group: "input",
      label: { id: "Input data", en: "Data input" },
      items: [
        { id: "sensor", icon: "wave", label: { id: "Sensor Lingkungan", en: "Environmental Sensors" },
          title: { id: "Sensor lingkungan", en: "Environmental sensors" },
          sub: { id: "Debu · suhu · kelembapan · kebisingan", en: "Dust · temperature · humidity · noise" } },
        { id: "apd", icon: "eye", label: { id: "Computer Vision / APD", en: "Computer Vision / PPE" },
          title: { id: "Computer vision — kepatuhan APD", en: "Computer vision — PPE compliance" },
          sub: { id: "Deteksi otomatis dari kamera", en: "Automatic detection from cameras" } },
        { id: "hse", icon: "doc", label: { id: "HSE Walk-around", en: "HSE Walk-around" },
          title: { id: "HSE walk-around", en: "HSE walk-around" },
          sub: { id: "Unggah laporan inspeksi", en: "Upload inspection report" } },
        { id: "fiber-waste", icon: "bin", label: { id: "Fiber Waste", en: "Fiber Waste" },
          title: { id: "Fiber waste", en: "Fiber waste" },
          sub: { id: "Data limbah serat per shift", en: "Fiber waste data per shift" } },
      ],
    },
  ],

  /* ---------- Area produksi ---------- */
  areas: [
    { id: "cutting",  name: "Cutting",       status: "warn" },
    { id: "sewing-1", name: "Sewing line 1", status: "ok" },
    { id: "sewing-2", name: "Sewing line 2", status: "warn" },
    { id: "spinning", name: "Spinning",      status: "ok" },
    { id: "weaving",  name: "Weaving",       status: "ok" },
    { id: "finishing", name: "Finishing",    status: "ok" },
  ],

  /* ---------- Shift (yang sedang berjalan otomatis terpilih) ---------- */
  shifts: [
    { id: "s1", label: "Shift 1", start: 7,  end: 15 },
    { id: "s2", label: "Shift 2", start: 15, end: 23 },
    { id: "s3", label: "Shift 3", start: 23, end: 7 },
  ],

  /* ---------- Tur singkat: 4 langkah (urutan dari brief) ---------- */
  tour: [
    { target: "[data-tour='risk']",
      title: { id: "Ini skor risiko", en: "This is the risk score" },
      body: { id: "Gabungan semua data area ini. Hijau aman, kuning waspada, merah segera cek.", en: "A combination of all data for this area. Green safe, yellow caution, red check now." } },
    { target: "[data-tour='kpi']",
      title: { id: "Empat angka utama", en: "Four headline numbers" },
      body: { id: "Fiber loss, kepatuhan APD, housekeeping, dan jumlah peringatan aktif hari ini.", en: "Fiber loss, PPE compliance, housekeeping, and active warnings today." } },
    { target: "[data-tour='ew']",
      title: { id: "Early Warning", en: "Early Warning" },
      body: { id: "Kalau skor merah, buka menu ini untuk melihat penyebab dan saran tindakan.", en: "When the score is red, open this menu to see causes and suggested actions." } },
    { target: "[data-tour='input']",
      title: { id: "Input data", en: "Data input" },
      body: { id: "Sensor dan kamera bekerja sendiri. Laporan HSE dan fiber waste diunggah di akhir shift.", en: "Sensors and cameras run on their own. HSE reports and fiber waste are uploaded at end of shift." } },
  ],

  /* ---------- Ambang & aturan warna ---------- */
  risk: {
    // skor risiko 0–1 → status
    levels: [
      { status: "ok",   max: 0.4, label: { id: "Rendah", en: "Low" } },
      { status: "warn", max: 0.7, label: { id: "Sedang", en: "Medium" } },
      { status: "risk", max: 1.01, label: { id: "Tinggi", en: "High" } },
    ],
  },
  thresholds: {
    pm:    { unit: "µg/m³", warn: 100, risk: 200, note: { id: "action level 100 · NAB 200", en: "action level 100 · TLV 200" } },
    temp:  { unit: "°C",    warn: 30,  risk: 32,  note: { id: "indikatif · ISBB perlu globe", en: "indicative · WBGT needs globe sensor" } },
    rh:    { unit: "%RH",   warn: 75,  risk: 85,  note: { id: "aman", en: "safe" } },
    noise: { unit: "dBA",   warn: 82,  risk: 85,  note: { id: "NAB 85 dBA/8 jam", en: "TLV 85 dBA/8 h" } },
    apdTarget: 95,          // % kepatuhan APD
    fiberLossWarn: 2.0,     // % → kuning
    fiberLossRisk: 3.0,     // % → merah
  },

  /* ---------- Hierarki pengendalian (urutan rekomendasi) ---------- */
  controls: ["eliminasi", "substitusi", "rekayasa", "administratif", "apd"],

  /* =======================================================
     KONFIGURASI TEKNIS — DIISI NANTI
     ======================================================= */
  technical: {
    apiBaseUrl: null,          // contoh: "https://api.e-wise.id/v1"
    sensorNodes: [],           // contoh: [{ id: "ESP32-CUT-01", area: "cutting", sensors: ["DHT22","GP2Y1010","noise"] }]
    sensorIntervalSec: 60,
    cameras: [],               // contoh: [{ id: "CAM-04", area: "cutting" }]
    nlp: { endpoint: null, categories: ["Good", "Fair", "Poor"] },
    riskModel: { weights: null }, // bobot data fusion → skor risiko
    notifications: { push: false, email: false },
  },
};
