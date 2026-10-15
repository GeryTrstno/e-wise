/* =========================================================
   E-WISE · data-sample.js — DATA CONTOH (dari brief/demo)
   Nanti diganti dengan data dari config.technical.apiBaseUrl.
   Struktur objek di sini = kontrak data yang diharapkan UI.
   ========================================================= */
window.EW_DATA = {
  date: "12 Okt 2026",

  /* One Record per area (snapshot jam terakhir) */
  records: {
    cutting: {
      risk: 0.72, window: "10.00–11.00",
      kpi: { fiberLoss: 2.4, fiberKg: 18, fiberDelta: 12, apd: 85, housekeeping: "Poor", ewHigh: 1, ewMed: 2 },
      sensor: { pm: 165, temp: 31, rh: 70, noise: 79, noiseDose: 42, lev: "abnormal" },
      apd: { workers: 14, mask: 100, eye: 71, gloves: 86, shoes: 100 },
      sources: {
        sensor: "PM 165 µg/m³ · 31 °C · 79 dBA",
        cv: { id: "APD 85% · kacamata ✕", en: "PPE 85% · goggles ✕" },
        hse: "Housekeeping Poor",
        fiber: { id: "18 kg · wadah hampir penuh", en: "18 kg · bin almost full" },
      },
    },
    "sewing-2": {
      risk: 0.48, window: "10.00–11.00",
      kpi: { fiberLoss: 1.1, fiberKg: 6, fiberDelta: -3, apd: 87, housekeeping: "Fair", ewHigh: 0, ewMed: 1 },
      sensor: { pm: 92, temp: 30, rh: 68, noise: 76, noiseDose: 30, lev: "normal" },
      apd: { workers: 22, mask: 95, eye: 80, gloves: 82, shoes: 100 },
      sources: { sensor: "PM 92 µg/m³ · 30 °C · 76 dBA", cv: { id: "APD 87%", en: "PPE 87%" }, hse: "Housekeeping Fair", fiber: { id: "6 kg · serat lepas", en: "6 kg · lint" } },
    },
    _default: {
      risk: 0.21, window: "10.00–11.00",
      kpi: { fiberLoss: 0.8, fiberKg: 4, fiberDelta: -5, apd: 97, housekeeping: "Good", ewHigh: 0, ewMed: 0 },
      sensor: { pm: 48, temp: 29, rh: 62, noise: 72, noiseDose: 18, lev: "normal" },
      apd: { workers: 10, mask: 100, eye: 95, gloves: 96, shoes: 100 },
      sources: { sensor: "PM 48 µg/m³ · 29 °C · 72 dBA", cv: { id: "APD 97%", en: "PPE 97%" }, hse: "Housekeeping Good", fiber: { id: "4 kg · tercatat", en: "4 kg · recorded" } },
    },
  },

  areaStatus: [
    { area: "Cutting", risk: 0.72, note: { id: "debu tinggi · LEV di bawah ambang", en: "high dust · LEV below threshold" } },
    { area: "Sewing line 2", risk: 0.48, note: { id: "APD non-compliant 13%", en: "PPE non-compliant 13%" } },
    { area: "Sewing line 1", risk: 0.31, note: { id: "tren stabil", en: "stable trend" } },
    { area: "Finishing", risk: 0.21, note: { id: "semua parameter aman", en: "all parameters safe" } },
  ],

  /* 7 hari: fiber loss (%) & PM (µg/m³) — area Cutting */
  trend7: {
    labels: ["6", "7", "8", "9", "10", "11", "12"],
    fiberLoss: [1.6, 1.7, 1.65, 1.9, 1.95, 2.25, 2.4],
    pm: [88, 104, 90, 118, 136, 141, 165],
  },
  /* Time-series hari ini (per jam) */
  today: {
    labels: ["07", "08", "09", "10", "11", "12", "13"],
    pm: [70, 78, 96, 132, 158, 162, 165],
    temp: [27, 28, 29, 30, 31, 31, 31],
    rh: [74, 73, 72, 71, 70, 70, 70],
    noise: [74, 76, 78, 79, 80, 79, 79],
  },

  tasks: [
    { id: "t1", page: "hse", done: false, title: { id: "Unggah laporan HSE walk-around", en: "Upload HSE walk-around report" }, due: { id: "sebelum 15.00", en: "before 15:00" } },
    { id: "t2", page: "fiber-waste", done: false, title: { id: "Timbang & unggah fiber waste", en: "Weigh & upload fiber waste" }, due: { id: "akhir shift", en: "end of shift" } },
    { id: "t3", page: "apd", done: false, title: { id: "Kirim log APD ke HSE report", en: "Send PPE log to HSE report" }, due: { id: "akhir shift", en: "end of shift" } },
    { id: "t4", page: "early-warning", done: false, title: { id: "Tindak lanjuti 1 peringatan tinggi", en: "Follow up 1 high warning" }, due: { id: "segera", en: "now" } },
  ],

  alerts: [
    { id: "ew1", level: "risk", status: "open",
      title: { id: "Deposisi microfiber tinggi berulang", en: "Repeated high microfiber deposition" },
      where: { id: "Cutting · 10 Okt · 3 hari berturut-turut", en: "Cutting · 10 Oct · 3 days in a row" },
      action: { id: "Verifikasi segera", en: "Verify now" },
      factors: [["Debu (PM)", 0.35], ["Housekeeping", 0.20], ["Fiber loss", 0.12], ["APD", 0.05]],
      rec: { id: "Periksa ducting/suction LEV di stasiun potong, tambah jadwal pembersihan, tinjau ulang penempatan wadah fiber.", en: "Inspect LEV ducting/suction at the cutting station, add cleaning rounds, review fiber bin placement." } },
    { id: "ew2", level: "warn", status: "open",
      title: { id: "Housekeeping turun + fiber waste naik", en: "Housekeeping down + fiber waste up" },
      where: { id: "Sewing line 2 · 7–10 Okt", en: "Sewing line 2 · 7–10 Oct" },
      action: { id: "Tindak lanjut", en: "Follow up" },
      factors: [["Housekeeping", 0.22], ["Fiber loss", 0.16], ["Debu (PM)", 0.10]],
      rec: { id: "Tambah titik penampungan serat di ujung line, jadwalkan pembersihan tengah shift.", en: "Add fiber collection points at line end, schedule mid-shift cleaning." } },
    { id: "ew3", level: "warn", status: "open",
      title: { id: "Kepatuhan APD di bawah target", en: "PPE compliance below target" },
      where: { id: "Cutting · Shift 1 · tren stabil", en: "Cutting · Shift 1 · stable trend" },
      action: { id: "Pantau", en: "Monitor" },
      factors: [["APD (eye protection)", 0.18], ["Jumlah pekerja", 0.06]],
      rec: { id: "Briefing singkat APD sebelum shift, sediakan kacamata cadangan di stasiun potong.", en: "Short PPE briefing before shift, provide spare goggles at the cutting station." } },
    { id: "ew4", level: "ok", status: "done",
      title: { id: "Kebisingan Weaving kembali normal", en: "Weaving noise back to normal" },
      where: { id: "Weaving · 9 Okt", en: "Weaving · 9 Oct" },
      action: { id: "Selesai", en: "Done" },
      factors: [["Kebisingan", 0.08]],
      rec: { id: "Peredam mesin sudah terpasang. Pantau rutin.", en: "Machine dampers installed. Routine monitoring." } },
  ],

  hseRows: [
    { aspect: { id: "Kondisi mesin", en: "Machine condition" }, note: "Guard terpasang, emergency stop berfungsi", status: "Good" },
    { aspect: { id: "APD", en: "PPE" }, note: "2 pekerja tidak pakai eye protection", status: "Non-compliant" },
    { aspect: { id: "Housekeeping", en: "Housekeeping" }, note: "banyak sisa serat berserakan di jalur kerja", status: "Poor" },
    { aspect: { id: "Ventilasi / LEV", en: "Ventilation / LEV" }, note: "suction terasa lemah", status: "Abnormal" },
    { aspect: { id: "Material & waste", en: "Material & waste" }, note: "wadah waste hampir penuh", status: "Fair" },
    { aspect: { id: "Incident / near miss", en: "Incident / near miss" }, note: "tidak ada kejadian", status: "Tidak ada" },
  ],
  hseOptions: ["Good", "Fair", "Poor", "Compliant", "Non-compliant", "Normal", "Abnormal", "Tidak ada", "Ada"],

  fiberRows: [
    { area: "Cutting", shift: "S1", waste: 18, input: 750, kind: { id: "sisa potongan kain", en: "fabric offcuts" }, bin: { id: "Hampir penuh", en: "Almost full" } },
    { area: "Sewing line 2", shift: "S1", waste: 6, input: 540, kind: { id: "serat lepas / lint", en: "loose fibers / lint" }, bin: { id: "Normal", en: "Normal" } },
    { area: "Finishing", shift: "S1", waste: 3, input: 410, kind: { id: "wadah hampir penuh, tercecer", en: "bin almost full, spilled" }, bin: { id: "Fair — cek", en: "Fair — check" } },
  ],

  /* Analisis: peta panas area × hari (skor 0–1) */
  heat: {
    days: ["6", "7", "8", "9", "10", "11", "12"],
    rows: [
      ["Cutting",       [0.42, 0.45, 0.44, 0.58, 0.66, 0.70, 0.72]],
      ["Sewing line 1", [0.28, 0.30, 0.27, 0.31, 0.33, 0.30, 0.31]],
      ["Sewing line 2", [0.35, 0.38, 0.41, 0.46, 0.50, 0.47, 0.48]],
      ["Spinning",      [0.30, 0.29, 0.33, 0.35, 0.32, 0.31, 0.30]],
      ["Weaving",       [0.44, 0.46, 0.41, 0.36, 0.30, 0.28, 0.27]],
      ["Finishing",     [0.22, 0.20, 0.24, 0.23, 0.21, 0.22, 0.21]],
    ],
  },
  /* Matriks risiko: L (kemungkinan 1–5) × S (keparahan 1–5) */
  hazards: [
    { code: "H1", L: 4, S: 4, name: { id: "Paparan debu serat (PM) di zona napas", en: "Fiber dust (PM) in breathing zone" } },
    { code: "H2", L: 3, S: 3, name: { id: "Pelindung mata tidak dipakai", en: "Eye protection not worn" } },
    { code: "H3", L: 3, S: 2, name: { id: "Serat berserakan · terpeleset", en: "Scattered fibers · slipping" } },
    { code: "H4", L: 2, S: 3, name: { id: "Kebisingan mesin tenun", en: "Loom noise" } },
    { code: "H5", L: 2, S: 2, name: { id: "Panas & kelembapan finishing", en: "Finishing heat & humidity" } },
  ],
  causes: [
    { name: { id: "Debu (PM) di atas action level", en: "Dust (PM) above action level" }, share: 49 },
    { name: { id: "Housekeeping buruk", en: "Poor housekeeping" }, share: 28 },
    { name: { id: "Fiber loss naik", en: "Rising fiber loss" }, share: 16 },
    { name: { id: "Kepatuhan APD", en: "PPE compliance" }, share: 7 },
  ],
  corr: { note: { id: "Fiber loss dan PM bergerak searah selama 7 hari di Cutting.", en: "Fiber loss and PM moved together over 7 days in Cutting." } },
  recs: [
    { level: "rekayasa", text: { id: "Perbaiki suction LEV di stasiun potong dan pasang penutup pada mesin potong.", en: "Repair LEV suction at the cutting station and fit enclosures on cutters." } },
    { level: "administratif", text: { id: "Tambah jadwal pembersihan tengah shift dan pindahkan wadah fiber lebih dekat ke sumber.", en: "Add mid-shift cleaning and move fiber bins closer to the source." } },
    { level: "apd", text: { id: "Wajibkan respirator N95 dan kacamata di Cutting selama skor ≥ 0,70.", en: "Require N95 respirators and goggles in Cutting while score ≥ 0.70." } },
  ],
  people: ["Supervisor Cutting", "Koordinator HSE", "Teknisi Maintenance", "Leader Shift 1"],
};
