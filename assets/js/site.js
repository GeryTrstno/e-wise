/* =========================================================
   E-WISE · site.js — SPA publik
   Router berbasis hash:
     #dashboard | #tentang | #demo        → ganti view
     #<id-section>                        → buka view pemilik section lalu gulir
     #demo-1 … #demo-6                    → buka Demo pada langkah ke-N
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, i18n } = EW;
  const VIEWS = ["dashboard", "tentang", "demo"];
  let currentStep = 0;

  /* ---------- Router ---------- */
  function route() {
    const raw = (location.hash || "#dashboard").slice(1) || "dashboard";
    let view = "dashboard";
    let target = null;
    const stepMatch = raw.match(/^demo-([1-6])$/);

    if (VIEWS.includes(raw)) {
      view = raw;
    } else if (stepMatch) {
      view = "demo";
      currentStep = Number(stepMatch[1]) - 1;
      target = $("#stepTabs");
    } else {
      const el = document.getElementById(raw);
      if (el) {
        const owner = el.closest("[data-view]");
        if (owner) view = owner.dataset.view;
        target = el;
      }
    }
    showView(view);
    closeMenu();
    if (view === "demo") renderStep();

    requestAnimationFrame(() => {
      if (target && target.id !== "top") {
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
  }

  function showView(name) {
    $$("[data-view]").forEach((v) => { v.hidden = v.dataset.view !== name; });
    $$("[data-route]").forEach((a) => {
      if (a.dataset.route === name) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const titles = { dashboard: "E-WISE", tentang: i18n.t("nav.about") + " · E-WISE", demo: i18n.t("nav.demo") + " · E-WISE" };
    document.title = titles[name] || "E-WISE";
  }

  /* ---------- Menu HP ---------- */
  const burger = $("#navBurger");
  const nav = $("#mainNav");
  function closeMenu() { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  /* ---------- Demo: 6 langkah ---------- */
  const SIDE = {
    id: { mon: "MONITOR", inp: "INPUT DATA", dashboard: "Dashboard", ew: "Early Warning", sensor: "Sensor Lingkungan", apd: "Computer Vision / APD", hse: "HSE Walk-around", fiber: "Fiber Waste" },
    en: { mon: "MONITOR", inp: "DATA INPUT", dashboard: "Dashboard", ew: "Early Warning", sensor: "Environmental Sensors", apd: "Computer Vision / PPE", hse: "HSE Walk-around", fiber: "Fiber Waste" },
  };
  const MOCK = {
    sensor: [["Debu (PM)", "165 µg/m³"], ["Suhu", "31 °C"], ["RH", "70 %"], ["dBA", "79"]],
    apd: [["Masker", "100%"], ["Eye protection", "71%"], ["Gloves", "86%"], ["Safety shoes", "100%"]],
    hse: [["Mesin", "Good"], ["APD", "Non-compliant"], ["Housekeeping", "Poor"], ["LEV", "Abnormal"]],
    fiber: [["Waste", "18 kg"], ["Input", "750 kg"], ["Fiber loss", "2,4%"], ["Wadah", "Hampir penuh"]],
    dashboard: [["Fiber loss", "2,4%"], ["APD", "85%"], ["Housekeeping", "Poor"], ["Risk score", "0,72"]],
  };
  const APP_LINK = { "": "app.html", sensor: "app.html#sensor", apd: "app.html#apd", hse: "app.html#hse", fiber: "app.html#fiber-waste", dashboard: "app.html#dashboard" };

  function renderTabs() {
    const steps = i18n.t("demo.steps");
    $("#stepTabs").innerHTML = steps.map((s, i) => `
      <button type="button" class="step-tab" role="tab" id="tab-${i}" aria-controls="stepPanel"
        aria-selected="${i === currentStep}" tabindex="${i === currentStep ? 0 : -1}" data-step="${i}">
        <small>${EW.esc(i18n.t("demo.step"))} ${i + 1}</small><span>${EW.esc(s.t)}</span>
      </button>`).join("");
  }

  function miniApp(step) {
    const L = SIDE[i18n.lang] || SIDE.id;
    const m = step.menu;
    const url = "e-wise.id" + step.path.replace("#", "/");
    let main;
    if (!m) {
      main = `<p class="mm-title">${i18n.lang === "en" ? "Which area to monitor?" : "Mau pantau area mana?"}</p>
        <div class="mm-select">
          <div class="on"><span class="dot dot-warn"></span> Cutting</div>
          <div><span class="dot dot-ok"></span> Sewing line 1</div>
          <div>Shift 1 · 07.00–15.00</div>
        </div>
        <span class="mm-btn">${i18n.lang === "en" ? "Enter Dashboard" : "Masuk Dashboard"}</span>`;
    } else {
      main = `<p class="mm-title">${EW.esc(L[m] || L.dashboard)}</p>
        <div class="mm-grid">${MOCK[m].map(([k, v]) => `<div>${EW.esc(k)}<b>${EW.esc(v)}</b></div>`).join("")}</div>`;
    }
    const item = (k) => `<span class="${m === k ? "on" : ""}">${EW.esc(L[k])}</span>`;
    return `<div class="mini-app" aria-hidden="true">
      <div class="mini-bar"><i></i><i></i><i></i><code>${EW.esc(url)}</code></div>
      <div class="mini-body">
        <div class="mini-side"><p>${L.mon}</p>${item("dashboard")}<span>${L.ew}</span><p>${L.inp}</p>${item("sensor")}${item("apd")}${item("hse")}${item("fiber")}</div>
        <div class="mini-main">${main}</div>
      </div>
    </div>`;
  }

  function renderStep() {
    renderTabs();
    const step = i18n.t("demo.steps")[currentStep];
    $("#stepPanel").setAttribute("aria-labelledby", "tab-" + currentStep);
    $("#stepPanel").innerHTML = `
      <div class="step-info">
        <p class="eyebrow">${EW.esc(i18n.t("demo.step"))} ${currentStep + 1} · ${EW.esc(step.t)}</p>
        <h2>${EW.esc(step.lead)}</h2>
        <ol class="step-points">${step.pts.map((p, i) => `<li><span>${i + 1}</span><p>${EW.esc(p)}</p></li>`).join("")}</ol>
        <p class="step-tip">💡 ${EW.esc(step.tip)}</p>
        <a class="btn btn-primary" href="${APP_LINK[step.menu]}">${EW.esc(i18n.t("demo.tryIt"))}</a>
      </div>
      ${miniApp(step)}`;
  }

  $("#stepTabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (!b) return;
    currentStep = Number(b.dataset.step);
    renderStep();
    $("#tab-" + currentStep).focus();
  });
  $("#stepTabs").addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    currentStep = (currentStep + (e.key === "ArrowRight" ? 1 : 5)) % 6;
    renderStep();
    $("#tab-" + currentStep).focus();
  });

  /* ---------- FAQ ---------- */
  function renderFaq() {
    $("#faqList").innerHTML = i18n.t("demo.faq").map((f, i) => `
      <details ${i === 0 ? "open" : ""}><summary>${EW.esc(f.q)}</summary><p>${EW.esc(f.a)}</p></details>`).join("");
  }

  /* ---------- Form jadwal demo ----------
     Teknis (nanti): kirim ke endpoint backend. Sekarang disimpan lokal. */
  $("#demoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const msg = $("#formMsg");
    const data = Object.fromEntries(new FormData(f).entries());
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "");
    if (!data.name || !okEmail) {
      msg.className = "form-msg err";
      msg.textContent = i18n.t("demo.fErr");
      return;
    }
    const list = EW.store.get("demoRequests", []);
    list.push(Object.assign({ at: new Date().toISOString() }, data));
    EW.store.set("demoRequests", list);
    msg.className = "form-msg ok";
    msg.textContent = i18n.t("demo.fDone");
    f.reset();
  });

  /* ---------- Init ---------- */
  function renderDynamic() { renderFaq(); if (!$('[data-view="demo"]').hidden) renderStep(); else renderTabs(); }
  document.addEventListener("ew:lang", () => { renderDynamic(); showView(($("[data-view]:not([hidden])") || {}).dataset?.view || "dashboard"); });
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", () => {
    renderDynamic();
    renderStep();
    route();
  });
})();
