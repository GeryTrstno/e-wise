/* E-WISE · Kamus ID | EN — aplikasi (Config ERP) */
(function () {
  const ID = {
    common: { themeDark: "Ganti ke tema gelap", themeLight: "Ganti ke tema terang", lang: "Bahasa", sample: "Data contoh", save: "Simpan", cancel: "Batal", close: "Tutup", soon: "Segera", edit: "ubah" },
    shell: {
      exit: "Keluar ke beranda", sensorsOnline: "{n} sensor online", areaRisk: "{area} · risiko {level}",
      area: "Area", shift: "Shift", tutorial: "Tutorial", menu: "Buka menu", user: "Supervisor",
    },
    loading: { title: "Menyiapkan E-WISE", sensor: "Sensor terhubung", camera: "Kamera terhubung", data: "Data hari ini dimuat" },
    select: {
      title: "Mau pantau area mana?", sub: "Pilih satu area. Bisa diganti nanti.",
      shift: "Shift", skip: "Lewati, pakai pilihan terakhir", enter: "Masuk →",
      stOk: "Aman", stWarn: "Sedang", stRisk: "Tinggi", now: "berjalan",
    },
    welcome: {
      title: "Selamat datang di E-WISE", body: "Anda memantau area <b>{area}</b> · <b>{shift}</b>. Mau lihat tur singkat 4 langkah?",
      tour: "Mulai tur", skip: "Lewati",
    },
    tour: { of: "Tur {i} dari {n}", next: "Lanjut →", done: "Selesai", skip: "Lewati tur" },
    steps: { s1: "Loading", s2: "Pilih area", s3: "Sambutan", s4: "Tur", s5: "Dashboard" },

    dash: {
      tasks: "Tugas hari ini", tasksAllDone: "Semua tugas hari ini selesai.", go: "Buka",
      k1: "Fiber loss hari ini", k1s: "{kg} kg · {d}% vs kemarin", k2: "Kepatuhan APD", k2s: "target {t}%",
      k3: "Housekeeping", k3s: "dari laporan HSE", k4: "Early warning aktif", k4s: "{h} tinggi · {m} sedang",
      oneRecord: "One Record · {area} · {win}", riskScore: "Risk score",
      srcSensor: "Sensor", srcCv: "Computer vision", srcHse: "HSE walk-around", srcFiber: "Fiber waste",
      trend: "Fiber loss vs debu · 7 hari", legendFiber: "fiber loss %", legendPm: "PM µg/m³ (sumbu kanan)", legendRef: "action level",
      areas: "Status area produksi", openEw: "Buka Early Warning →",
    },
    ew: {
      filterAll: "Semua", filterHigh: "Tinggi", filterMed: "Sedang", filterDone: "Selesai",
      why: "Mengapa peringatan ini muncul?", rec: "Rekomendasi tindakan",
      assign: "Tugaskan PIC", mark: "Tandai ditindaklanjuti", marked: "Ditindaklanjuti",
      note: "Keputusan akhir tetap pada supervisor/HSE.", empty: "Tidak ada peringatan di filter ini.",
      pic: "PIC", due: "Batas waktu", assignSave: "Tugaskan", assigned: "Ditugaskan ke {p} · {d}",
      pick: "Pilih peringatan untuk melihat detail.",
    },
    an: {
      period: "Periode", d7: "7 hari", d30: "30 hari", d90: "90 hari",
      heat: "Peta panas risiko · semua area", matrix: "Matriks risiko", likelihood: "Kemungkinan", severity: "Keparahan",
      causes: "Penyebab utama", corr: "Hubungan fiber loss dengan debu", corrR: "korelasi r = {r}",
      recs: "Rekomendasi · hierarki pengendalian", download: "Unduh laporan PDF",
      lvl: { eliminasi: "Eliminasi", substitusi: "Substitusi", rekayasa: "Rekayasa", administratif: "Administratif", apd: "APD" },
      onlyFor: "Untuk HSE", periodNote: "Data 30/90 hari tersedia setelah konfigurasi teknis.",
    },
    sensor: {
      pm: "Debu (PM)", temp: "Suhu", rh: "Kelembapan", noise: "Kebisingan", dose: "dosis {d}% · NAB 85 dBA/8 jam",
      series: "Time-series · hari ini", manual: "Input manual / kalibrasi", range: "Rentang waktu",
      lev: "Status LEV / ventilasi", levNormal: "Normal", levAbn: "Abnormal — suction menurun",
      saveReading: "Simpan pembacaan", saved: "Pembacaan tersimpan ke One Record.",
      node: "Node: ESP32-CUT-01 · DHT22 · Sharp GP2Y1010 · modul bising · update tiap 60 dtk · label",
      calibrated: "terkalibrasi", indicative: "indikatif", invalid: "Isi semua angka dengan benar.",
    },
    apd: {
      live: "Live detection · CAM-04 {area}", perApd: "Kepatuhan per APD · {win}",
      mask: "Masker", gloves: "Cut-resistant gloves",
      workers: "Pekerja terdeteksi", avg: "Rata-rata", send: "Kirim ke HSE report", sent: "Log APD terkirim ke HSE report.",
      privacy: "Video tidak disimpan — hanya log status, waktu, lokasi.", camOff: "Kamera belum dikonfigurasi · tampilan contoh",
    },
    hse: {
      upload: "Unggah laporan inspeksi", drop: "Tarik file ke sini atau pilih file",
      cols: ".csv / .xlsx — kolom minimal: Aspek, Catatan lapangan", process: "Proses file",
      nlp: "Teks dinormalisasi (NLP) lalu dicocokkan ke kategori Good/Fair/Poor.",
      result: "Hasil klasifikasi otomatis — {file}", aspect: "Aspek", note: "Catatan dari file", status: "Status",
      save: "Simpan ke One Record", savedMsg: "Laporan HSE tersimpan ke One Record.",
      noFile: "Pilih file .csv atau .xlsx dulu.", processing: "Memproses…", template: "Unduh template Excel",
      sampleFile: "HSE_CUTTING_10OKT.xlsx",
    },
    fiber: {
      upload: "Unggah data waste (.csv / .xlsx)", cols: "kolom: Area, Shift, Berat waste (kg), Input bahan (kg), Jenis, Catatan",
      manual: "Isi manual per shift", waste: "Berat fiber waste (kg)", input: "Input bahan (kg)", kind: "Jenis limbah",
      rate: "Fiber loss rate", formula: "waste ÷ input bahan × 100%", bin: "Kondisi penampungan",
      binOpts: ["Normal", "Hampir penuh", "Penuh / tercecer"],
      save: "Simpan data shift", saved: "Data fiber waste tersimpan.", invalid: "Berat waste dan input bahan harus lebih dari 0.",
      table: "Hasil pembacaan · shift ini", area: "Area", shiftCol: "Shift", data: "Data", status: "Status",
      trend: "Fiber loss rate · 7 hari", recorded: "Tercatat",
    },
  };

  const EN = {
    common: { themeDark: "Switch to dark theme", themeLight: "Switch to light theme", lang: "Language", sample: "Sample data", save: "Save", cancel: "Cancel", close: "Close", soon: "Soon", edit: "edit" },
    shell: {
      exit: "Back to website", sensorsOnline: "{n} sensors online", areaRisk: "{area} · {level} risk",
      area: "Area", shift: "Shift", tutorial: "Tutorial", menu: "Open menu", user: "Supervisor",
    },
    loading: { title: "Preparing E-WISE", sensor: "Sensors connected", camera: "Cameras connected", data: "Today's data loaded" },
    select: {
      title: "Which area do you want to monitor?", sub: "Pick one area. You can change it later.",
      shift: "Shift", skip: "Skip, use my last choice", enter: "Enter →",
      stOk: "Safe", stWarn: "Medium", stRisk: "High", now: "running",
    },
    welcome: {
      title: "Welcome to E-WISE", body: "You are monitoring <b>{area}</b> · <b>{shift}</b>. Want a quick 4-step tour?",
      tour: "Start tour", skip: "Skip",
    },
    tour: { of: "Tour {i} of {n}", next: "Next →", done: "Done", skip: "Skip tour" },
    steps: { s1: "Loading", s2: "Pick area", s3: "Welcome", s4: "Tour", s5: "Dashboard" },

    dash: {
      tasks: "Today's tasks", tasksAllDone: "All of today's tasks are done.", go: "Open",
      k1: "Fiber loss today", k1s: "{kg} kg · {d}% vs yesterday", k2: "PPE compliance", k2s: "target {t}%",
      k3: "Housekeeping", k3s: "from HSE report", k4: "Active early warnings", k4s: "{h} high · {m} medium",
      oneRecord: "One Record · {area} · {win}", riskScore: "Risk score",
      srcSensor: "Sensors", srcCv: "Computer vision", srcHse: "HSE walk-around", srcFiber: "Fiber waste",
      trend: "Fiber loss vs dust · 7 days", legendFiber: "fiber loss %", legendPm: "PM µg/m³ (right axis)", legendRef: "action level",
      areas: "Production area status", openEw: "Open Early Warning →",
    },
    ew: {
      filterAll: "All", filterHigh: "High", filterMed: "Medium", filterDone: "Done",
      why: "Why did this warning appear?", rec: "Recommended action",
      assign: "Assign PIC", mark: "Mark as followed up", marked: "Followed up",
      note: "Final decisions stay with the supervisor/HSE.", empty: "No warnings in this filter.",
      pic: "PIC", due: "Deadline", assignSave: "Assign", assigned: "Assigned to {p} · {d}",
      pick: "Pick a warning to see details.",
    },
    an: {
      period: "Period", d7: "7 days", d30: "30 days", d90: "90 days",
      heat: "Risk heat map · all areas", matrix: "Risk matrix", likelihood: "Likelihood", severity: "Severity",
      causes: "Main causes", corr: "Fiber loss vs dust", corrR: "correlation r = {r}",
      recs: "Recommendations · hierarchy of controls", download: "Download PDF report",
      lvl: { eliminasi: "Elimination", substitusi: "Substitution", rekayasa: "Engineering", administratif: "Administrative", apd: "PPE" },
      onlyFor: "For HSE", periodNote: "30/90-day data is available after technical setup.",
    },
    sensor: {
      pm: "Dust (PM)", temp: "Temperature", rh: "Humidity", noise: "Noise", dose: "dose {d}% · TLV 85 dBA/8 h",
      series: "Time series · today", manual: "Manual input / calibration", range: "Time window",
      lev: "LEV / ventilation status", levNormal: "Normal", levAbn: "Abnormal — suction dropping",
      saveReading: "Save reading", saved: "Reading saved to One Record.",
      node: "Node: ESP32-CUT-01 · DHT22 · Sharp GP2Y1010 · noise module · updates every 60 s · label",
      calibrated: "calibrated", indicative: "indicative", invalid: "Fill in all values correctly.",
    },
    apd: {
      live: "Live detection · CAM-04 {area}", perApd: "Compliance per PPE · {win}",
      mask: "Mask", gloves: "Cut-resistant gloves",
      workers: "Workers detected", avg: "Average", send: "Send to HSE report", sent: "PPE log sent to HSE report.",
      privacy: "Video is not stored — only status, time, and location logs.", camOff: "Camera not configured yet · sample view",
    },
    hse: {
      upload: "Upload inspection report", drop: "Drag a file here or choose a file",
      cols: ".csv / .xlsx — minimum columns: Aspect, Field note", process: "Process file",
      nlp: "Text is normalized (NLP) and matched to Good/Fair/Poor categories.",
      result: "Automatic classification — {file}", aspect: "Aspect", note: "Note from file", status: "Status",
      save: "Save to One Record", savedMsg: "HSE report saved to One Record.",
      noFile: "Choose a .csv or .xlsx file first.", processing: "Processing…", template: "Download Excel template",
      sampleFile: "HSE_CUTTING_10OCT.xlsx",
    },
    fiber: {
      upload: "Upload waste data (.csv / .xlsx)", cols: "columns: Area, Shift, Waste weight (kg), Material input (kg), Type, Note",
      manual: "Enter manually per shift", waste: "Fiber waste weight (kg)", input: "Material input (kg)", kind: "Waste type",
      rate: "Fiber loss rate", formula: "waste ÷ material input × 100%", bin: "Bin condition",
      binOpts: ["Normal", "Almost full", "Full / spilled"],
      save: "Save shift data", saved: "Fiber waste data saved.", invalid: "Waste weight and material input must be above 0.",
      table: "Readings · this shift", area: "Area", shiftCol: "Shift", data: "Data", status: "Status",
      trend: "Fiber loss rate · 7 days", recorded: "Recorded",
    },
  };

  EW.i18n.add("id", ID);
  EW.i18n.add("en", EN);
})();
