/* =========================================================
   E-WISE · core.js
   Dipakai bersama oleh SPA publik (index.html) dan aplikasi (app.html):
   - EW.store  : localStorage aman (try/catch)
   - EW.theme  : switch tema terang/gelap (default ikut sistem)
   - EW.i18n   : ID | EN — atribut data-i18n, data-i18n-html, data-i18n-attr
   - EW.toast  : notifikasi singkat
   ========================================================= */
(function () {
  "use strict";
  const EW = (window.EW = window.EW || {});
  const PREFIX = "ewise:";

  /* ---------- Storage ---------- */
  EW.store = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(PREFIX + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* abaikan */ }
    },
    remove(key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* abaikan */ }
    },
  };

  /* ---------- Tema ---------- */
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  EW.theme = {
    current() {
      const t = root.getAttribute("data-theme");
      if (t) return t;
      return mq && mq.matches ? "dark" : "light";
    },
    set(t) {
      root.setAttribute("data-theme", t);
      EW.store.set("theme", t);
      document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
        b.setAttribute("aria-label", t === "dark" ? EW.i18n.t("common.themeLight") : EW.i18n.t("common.themeDark"));
      });
      document.dispatchEvent(new CustomEvent("ew:theme", { detail: t }));
    },
    toggle() { this.set(this.current() === "dark" ? "light" : "dark"); },
    init() {
      const saved = EW.store.get("theme");
      if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
      document.addEventListener("click", (e) => {
        if (e.target.closest("[data-theme-toggle]")) EW.theme.toggle();
      });
    },
  };

  /* ---------- i18n ---------- */
  function lookup(dict, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict);
  }
  EW.i18n = {
    lang: "id",
    dicts: {},
    add(lang, dict) {
      this.dicts[lang] = deepMerge(this.dicts[lang] || {}, dict);
    },
    t(key, vars) {
      let s = lookup(this.dicts[this.lang], key);
      if (s === undefined) s = lookup(this.dicts.id, key);
      if (s === undefined) return key;
      if (vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ""));
      return s;
    },
    /* Pilih teks dari objek dwibahasa {id:"", en:""} */
    pick(obj) {
      if (obj == null || typeof obj !== "object") return obj;
      return obj[this.lang] !== undefined ? obj[this.lang] : obj.id;
    },
    apply(scope = document) {
      scope.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = this.t(el.dataset.i18n); });
      scope.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = this.t(el.dataset.i18nHtml); });
      scope.querySelectorAll("[data-i18n-attr]").forEach((el) => {
        // format: "placeholder:key;aria-label:key2"
        el.dataset.i18nAttr.split(";").forEach((pair) => {
          const [attr, key] = pair.split(":");
          if (attr && key) el.setAttribute(attr.trim(), this.t(key.trim()));
        });
      });
      document.querySelectorAll("[data-lang-btn]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.langBtn === this.lang));
      });
    },
    set(lang) {
      if (!this.dicts[lang]) return;
      this.lang = lang;
      document.documentElement.lang = lang;
      EW.store.set("lang", lang);
      this.apply();
      document.dispatchEvent(new CustomEvent("ew:lang", { detail: lang }));
    },
    init() {
      const saved = EW.store.get("lang");
      this.lang = saved === "en" ? "en" : "id";
      document.documentElement.lang = this.lang;
      document.addEventListener("click", (e) => {
        const b = e.target.closest("[data-lang-btn]");
        if (b) EW.i18n.set(b.dataset.langBtn);
      });
      this.apply();
    },
  };

  function deepMerge(a, b) {
    const out = Array.isArray(a) ? a.slice() : Object.assign({}, a);
    Object.keys(b).forEach((k) => {
      if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) out[k] = deepMerge(a[k] || {}, b[k]);
      else out[k] = b[k];
    });
    return out;
  }

  /* ---------- Toast ---------- */
  EW.toast = function (msg, ms = 2800) {
    let wrap = document.querySelector(".toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-wrap";
      wrap.setAttribute("role", "status");
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), ms);
  };

  /* ---------- Util kecil ---------- */
  EW.$ = (sel, scope = document) => scope.querySelector(sel);
  EW.$$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
  EW.fmt = (n, d = 1) =>
    Number(n).toLocaleString(EW.i18n.lang === "en" ? "en-US" : "id-ID", { minimumFractionDigits: d, maximumFractionDigits: d });
  EW.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Logo E-WISE (SVG inline) — daun + gelombang data */
  EW.logoSVG = function (cls = "logo-mark") {
    return `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1FA36B"/>
      <path d="M8 21c0-7 5-12 16-13-1 10-6 15-13 15" fill="none" stroke="#C8F169" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M8 24c3-3 6-6 10-8" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;
  };

  /* Grafik garis SVG sederhana (tanpa library) */
  EW.lineChart = function (opts) {
    const { series, labels = [], w = 560, h = 220, refs = [], yMin, yMax } = opts;
    const pad = opts.pad || { t: 16, r: opts.rightFmt ? 40 : 16, b: 28, l: 44 };
    const all = series.flatMap((s) => s.values);
    const lo = yMin !== undefined ? yMin : Math.min(...all, ...refs.map((r) => r.value));
    const hi = yMax !== undefined ? yMax : Math.max(...all, ...refs.map((r) => r.value));
    const n = Math.max(...series.map((s) => s.values.length));
    const x = (i) => pad.l + (i * (w - pad.l - pad.r)) / Math.max(1, n - 1);
    const y = (v) => pad.t + (1 - (v - lo) / (hi - lo || 1)) * (h - pad.t - pad.b);
    const ticks = 4;
    let g = "";
    for (let i = 0; i <= ticks; i++) {
      const v = lo + ((hi - lo) * i) / ticks;
      const yy = y(v);
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${yy}" y2="${yy}" stroke="var(--border)" stroke-width="1"/>`;
      g += `<text x="${pad.l - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="var(--text-faint)">${opts.fmt ? opts.fmt(v) : Math.round(v)}</text>`;
      if (opts.rightFmt) g += `<text x="${w - pad.r + 8}" y="${yy + 4}" text-anchor="start" font-size="11" fill="var(--warn-text)">${opts.rightFmt(v)}</text>`;
    }
    labels.forEach((l, i) => {
      g += `<text x="${x(i)}" y="${h - 8}" text-anchor="middle" font-size="11" fill="var(--text-faint)">${EW.esc(l)}</text>`;
    });
    refs.forEach((r) => {
      g += `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y(r.value)}" y2="${y(r.value)}" stroke="${r.color}" stroke-width="1.5" stroke-dasharray="5 5"/>`;
    });
    series.forEach((s) => {
      const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
      if (s.area) {
        g += `<polygon points="${x(0)},${y(lo)} ${pts} ${x(s.values.length - 1)},${y(lo)}" fill="${s.color}" fill-opacity=".1"/>`;
      }
      g += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? 'stroke-dasharray="6 5"' : ""}/>`;
      const li = s.values.length - 1;
      g += `<circle cx="${x(li)}" cy="${y(s.values[li])}" r="4" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`;
    });
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img" aria-label="${EW.esc(opts.label || "")}">${g}</svg>`;
  };

  /* Init otomatis */
  EW.theme.init();
  document.addEventListener("DOMContentLoaded", () => {
    EW.i18n.init();
    EW.$$("[data-logo]").forEach((el) => { el.insertAdjacentHTML("afterbegin", EW.logoSVG()); });
  });
})();
