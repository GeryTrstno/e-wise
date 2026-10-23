/* =========================================================
   E-WISE · app.js — Aplikasi (Config ERP)
   1) Alur masuk step-by-step : loading → pilih area & shift → sambutan → tur → dashboard
   2) Shell                   : sidebar dari EW_CONFIG.menu, topbar area/shift, router hash
   3) Halaman fondasi         : dashboard, early-warning, analisis, sensor, apd, hse, fiber-waste
   Semua perilaku dibaca dari EW_CONFIG (config.js); data dari EW_DATA (data-sample.js).
   ========================================================= */
(function () {
  "use strict";
  const C = window.EW_CONFIG;
  const D = window.EW_DATA;
  const { $, $$, esc, store } = EW;
  const t = (k, v) => EW.i18n.t(k, v);
  const P = (o) => EW.i18n.pick(o);
  const fmt = (n, d = 1) => EW.fmt(n, d);

  const PAGES = C.menu.flatMap((g) => g.items.map((it) => Object.assign({ group: g.group }, it)));
  const PAGE_IDS = PAGES.map((p) => p.id);

  /* ---------- State ---------- */
  const state = {
    area: null,
    shift: null,
    page: C.flow.defaultPage,
    stage: "loading",
    records: {},
    tasks: JSON.parse(JSON.stringify(D.tasks)),
    alerts: JSON.parse(JSON.stringify(D.alerts)),
    ewFilter: "all",
    ewSel: null,
    ewAssignOpen: false,
    metric: "pm",
    period: 7,
    hse: { file: null, rows: null, processing: false },
    fiberRows: JSON.parse(JSON.stringify(D.fiberRows)),
    fiberForm: { waste: 18, input: 750, kind: "sisa potongan kain", bin: 1 },
  };

  /* ---------- Helper status ---------- */
  function riskLevel(score) {
    return C.risk.levels.find((l) => score < l.max) || C.risk.levels[C.risk.levels.length - 1];
  }
  function sensorStatus(key, val) {
    const th = C.thresholds[key];
    if (!th) return "ok";
    if (key === "rh") return val >= th.risk ? "risk" : val >= th.warn ? "warn" : "ok";
    return val >= th.risk ? "risk" : val >= th.warn ? "warn" : "ok";
  }
  const fiberStatus = (pct) => (pct >= C.thresholds.fiberLossRisk ? "risk" : pct >= C.thresholds.fiberLossWarn ? "warn" : "ok");
  const apdStatus = (pct) => (pct >= C.thresholds.apdTarget ? "ok" : pct >= 80 ? "warn" : "risk");
  const hkStatus = (v) => ({ Good: "ok", Fair: "warn", Poor: "risk" }[v] || "warn");
  const chip = (status, label, dot = true) => `<span class="chip chip-${status}${dot ? "" : " no-dot"}">${esc(label)}</span>`;
  const areaObj = (id) => C.areas.find((a) => a.id === id) || C.areas[0];
  const shiftObj = (id) => C.shifts.find((s) => s.id === id) || C.shifts[0];
  const shiftLabel = (s) => `${s.label} (${String(s.start).padStart(2, "0")}.00–${String(s.end).padStart(2, "0")}.00)`;
  function rec() {
    if (!state.records[state.area]) {
      const base = D.records[state.area] || D.records._default;
      state.records[state.area] = JSON.parse(JSON.stringify(base));
    }
    return state.records[state.area];
  }
  function currentShiftId() {
    const h = new Date().getHours();
    const s = C.shifts.find((s) => (s.start < s.end ? h >= s.start && h < s.end : h >= s.start || h < s.end));
    return (s || C.shifts[0]).id;
  }
  const sampleFlag = () => (C.app.sampleData ? `<span class="sample-flag">${esc(t("common.sample"))}</span>` : "");
  const icon = (name) => ICONS[name] || "";
  const ICONS = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V4M4 20h16"/><path d="M8 15l3-4 3 2 5-6"/></svg>',
    wave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12h3l3-7 4 14 3-9 2 2h5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h6"/></svg>',
    bin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M9 6V4h6v2M6 6l1 15h10l1-15"/></svg>',
  };

  /* =======================================================
     1) ALUR MASUK — STEP BY STEP
     ======================================================= */
  const STAGE_KEYS = ["s1", "s2", "s3", "s4", "s5"];
  function renderStageSteps(activeIdx) {
    $("#stageSteps").innerHTML = STAGE_KEYS.map((k, i) =>
      `<li class="${i < activeIdx ? "done" : i === activeIdx ? "active" : ""}" ${i === activeIdx ? 'aria-current="step"' : ""}><span>${i < activeIdx ? "✓" : i + 1}</span>${esc(t("steps." + k))}</li>`
    ).join("");
  }
  function showStage(name) {
    state.stage = name;
    $$("[data-stage]").forEach((s) => { s.hidden = s.dataset.stage !== name; });
    renderStageSteps(C.flow.steps.indexOf(name));
  }

  /* Langkah 1 — Loading (maks 3 detik) */
  function runLoading() {
    showStage("loading");
    const checks = C.flow.loadingChecks;
    $("#loadChecks").innerHTML = checks.map((c) => `<li data-check="${c}"><i></i>${esc(t("loading." + c))}</li>`).join("");
    const total = Math.min(C.flow.loadingMaxMs, 2400);
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / total);
      $("#progressBar").style.width = (p * 100).toFixed(1) + "%";
      checks.forEach((c, i) => {
        if (p >= (i + 1) / (checks.length + 0.4)) {
          const li = $(`[data-check="${c}"]`);
          if (li && !li.classList.contains("ok")) { li.classList.add("ok"); li.querySelector("i").textContent = "✓"; }
        }
      });
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(runSelect, 180);
    }
    requestAnimationFrame(tick);
  }

  /* Langkah 2 — Pilih area & shift */
  function runSelect() {
    showStage("select");
    const last = C.flow.rememberLastSelection ? store.get("last") : null;
    state.area = (last && last.area) || state.area || C.areas[0].id;
    state.shift = currentShiftId();
    if (last && last.shift && last.date === new Date().toDateString()) state.shift = last.shift;
    $("#useLast").hidden = !last;
    renderSelect();
    setTimeout(() => { const el = $('.area-opt[aria-checked="true"]'); if (el) el.focus(); }, 60);
  }
  function renderSelect() {
    const stLabel = { ok: t("select.stOk"), warn: t("select.stWarn"), risk: t("select.stRisk") };
    $("#areaGrid").innerHTML = C.areas.map((a) => `
      <button type="button" class="area-opt" role="radio" aria-checked="${a.id === state.area}" data-area="${a.id}">
        <span class="ph"></span><b>${esc(a.name)}</b>
        <small><span class="dot dot-${a.status}"></span>${esc(stLabel[a.status])}</small>
      </button>`).join("");
    const nowId = currentShiftId();
    $("#shiftSeg").innerHTML = C.shifts.map((s) => `
      <button type="button" role="radio" aria-checked="${s.id === state.shift}" data-shift="${s.id}">
        ${esc(s.label)} · ${String(s.start).padStart(2, "0")}–${String(s.end).padStart(2, "0")}
        ${s.id === nowId ? `<small>● ${esc(t("select.now"))}</small>` : ""}
      </button>`).join("");
  }
  $("#areaGrid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-area]");
    if (!b) return;
    state.area = b.dataset.area;
    renderSelect();
    $(`[data-area="${state.area}"]`).focus();
  });
  $("#shiftSeg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-shift]");
    if (!b) return;
    state.shift = b.dataset.shift;
    renderSelect();
  });
  $("#enterBtn").addEventListener("click", finishSelect);
  $("#useLast").addEventListener("click", () => {
    const last = store.get("last");
    if (last) { state.area = last.area; state.shift = last.shift || state.shift; }
    finishSelect();
  });
  function finishSelect() {
    store.set("last", { area: state.area, shift: state.shift, date: new Date().toDateString() });
    enterApp();
    if (C.flow.welcomeOnce && store.get("welcomed")) return;
    runWelcome();
  }

  /* Langkah 3 — Sambutan (hanya pertama kali) */
  function runWelcome() {
    renderStageSteps(2);
    $("#welBody").innerHTML = t("welcome.body", { area: esc(areaObj(state.area).name), shift: esc(shiftObj(state.shift).label) });
    $("#welcome").hidden = false;
    $("#welTour").focus();
  }
  $("#welSkip").addEventListener("click", () => {
    store.set("welcomed", true);
    store.set("toured", true);
    $("#welcome").hidden = true;
    $("#page").focus();
  });
  $("#welTour").addEventListener("click", () => {
    store.set("welcomed", true);
    $("#welcome").hidden = true;
    startTour();
  });

  /* Langkah 4 — Tur singkat (4 sorotan) */
  let tourIdx = 0;
  function startTour() {
    if (state.page !== "dashboard") { location.hash = "dashboard"; }
    tourIdx = 0;
    $("#tour").hidden = false;
    setTimeout(placeTour, 80);
  }
  function placeTour() {
    const step = C.tour[tourIdx];
    const isMobile = window.innerWidth <= 860;
    const inSidebar = step.target.includes("ew") || step.target.includes("input");
    toggleSidebar(isMobile && inSidebar);
    const el = $(step.target);
    if (!el) return endTour();
    el.scrollIntoView({ block: "nearest" });
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const pad = 6;
      const spot = $("#tourSpot");
      Object.assign(spot.style, { top: r.top - pad + "px", left: r.left - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
      const pop = $("#tourPop");
      $("#tourOf").textContent = t("tour.of", { i: tourIdx + 1, n: C.tour.length });
      $("#tourTitle").textContent = P(step.title);
      $("#tourBody").textContent = P(step.body);
      $("#tourNext").textContent = tourIdx === C.tour.length - 1 ? t("tour.done") : t("tour.next");
      $("#tourDots").innerHTML = C.tour.map((_, i) => `<i class="${i === tourIdx ? "on" : ""}"></i>`).join("");
      const pw = pop.offsetWidth, ph = pop.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
      let top, left;
      if (r.right + pw + 24 < vw && inSidebar) { left = r.right + 16; top = Math.min(Math.max(16, r.top), vh - ph - 16); }
      else if (r.bottom + ph + 24 < vh) { top = r.bottom + 14; left = Math.min(Math.max(16, r.left), vw - pw - 16); }
      else { top = Math.max(16, r.top - ph - 14); left = Math.min(Math.max(16, r.left), vw - pw - 16); }
      Object.assign(pop.style, { top: top + "px", left: left + "px" });
      $("#tourNext").focus();
    }, 60);
  }
  function endTour() {
    $("#tour").hidden = true;
    store.set("toured", true);
    toggleSidebar(false);
    renderStageSteps(4);
    $("#page").focus();
  }
  $("#tourNext").addEventListener("click", () => {
    if (tourIdx < C.tour.length - 1) { tourIdx++; placeTour(); } else endTour();
  });
  $("#tourSkip").addEventListener("click", endTour);
  window.addEventListener("resize", () => { if (!$("#tour").hidden) placeTour(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("#tour").hidden) endTour();
      else if ($("#sidebar").classList.contains("open")) toggleSidebar(false);
    }
  });
  $("#tutorialBtn").addEventListener("click", startTour);

  /* Langkah 5 — Masuk ke aplikasi */
  function enterApp() {
    $("#stage").hidden = true;
    $("#shell").removeAttribute("aria-hidden");
    renderTopSelects();
    renderSidebar();
    route();
  }

  /* =======================================================
     2) SHELL — SIDEBAR, TOPBAR, ROUTER
     ======================================================= */
  function activeAlerts() { return state.alerts.filter((a) => a.status === "open" && a.level !== "ok"); }

  function renderSidebar() {
    const badge = activeAlerts().length;
    $("#sideNav").innerHTML = C.menu.map((g) => `
      <div class="side-group" ${g.group === "input" ? 'data-tour="input"' : ""}>
        <p class="side-label">${esc(P(g.label))}</p>
        ${g.items.map((it) => `
          <a class="side-link" href="#${it.id}" data-page="${it.id}" ${it.id === "early-warning" ? 'data-tour="ew"' : ""}
             ${it.id === state.page ? 'aria-current="page"' : ""}>
            ${icon(it.icon)}<span>${esc(P(it.label))}</span>
            ${it.badge === "ewActive" && badge ? `<span class="side-badge">${badge}</span>` : ""}
            ${it.role === "hse" ? `<span class="side-tag">HSE</span>` : ""}
          </a>`).join("")}
      </div>`).join("");
    const r = rec();
    const lvl = riskLevel(r.risk);
    $("#sideSensors").textContent = t("shell.sensorsOnline", { n: 3 });
    $("#sideRisk").textContent = t("shell.areaRisk", { area: areaObj(state.area).name, level: P(lvl.label).toLowerCase() });
    $("#sideRiskDot").className = "dot dot-" + lvl.status;
  }

  function renderTopSelects() {
    $("#areaSel").innerHTML = C.areas.map((a) => `<option value="${a.id}" ${a.id === state.area ? "selected" : ""}>${esc(t("shell.area"))}: ${esc(a.name)}</option>`).join("");
    $("#shiftSel").innerHTML = C.shifts.map((s) => `<option value="${s.id}" ${s.id === state.shift ? "selected" : ""}>${esc(s.label)} · ${esc(D.date)}</option>`).join("");
  }
  $("#areaSel").addEventListener("change", (e) => { state.area = e.target.value; state.ewSel = null; persistLast(); renderSidebar(); renderPage(); });
  $("#shiftSel").addEventListener("change", (e) => { state.shift = e.target.value; persistLast(); renderPage(); });
  function persistLast() { store.set("last", { area: state.area, shift: state.shift, date: new Date().toDateString() }); }

  function toggleSidebar(open) {
    $("#sidebar").classList.toggle("open", open);
    $("#sideScrim").hidden = !open;
    $("#sideToggle").setAttribute("aria-expanded", String(open));
  }
  $("#sideToggle").addEventListener("click", () => toggleSidebar(!$("#sidebar").classList.contains("open")));
  $("#sideScrim").addEventListener("click", () => toggleSidebar(false));

  function route() {
    const h = location.hash.slice(1);
    state.page = PAGE_IDS.includes(h) ? h : C.flow.defaultPage;
    if (!$("#tour").hidden && state.page !== "dashboard") return;
    toggleSidebar(false);
    $$(".side-link").forEach((a) => {
      if (a.dataset.page === state.page) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    renderPage();
    $("#page").scrollTop = 0;
  }
  window.addEventListener("hashchange", () => { if (state.stage !== "loading" && $("#stage").hidden) route(); });

  function renderPage() {
    const meta = PAGES.find((p) => p.id === state.page);
    $("#pageTitle").textContent = P(meta.title);
    $("#pageSub").textContent = P(meta.sub);
    document.title = P(meta.label) + " · E-WISE";
    const fn = RENDER[state.page];
    $("#page").onclick = null;
    $("#page").innerHTML = fn ? fn() : "";
    const after = AFTER[state.page];
    if (after) after();
  }

  /* =======================================================
     3) HALAMAN FONDASI
     ======================================================= */
  const RENDER = {};
  const AFTER = {};

  /* ---------- Dashboard ---------- */
  RENDER.dashboard = () => {
    const r = rec();
    const k = r.kpi;
    const lvl = riskLevel(r.risk);
    const ewH = state.alerts.filter((a) => a.status === "open" && a.level === "risk").length;
    const ewM = state.alerts.filter((a) => a.status === "open" && a.level === "warn").length;
    const ewTotal = ewH + ewM;
    const pending = state.tasks.filter((x) => !x.done);
    const fs = fiberStatus(k.fiberLoss), as = apdStatus(k.apd), hs = hkStatus(k.housekeeping), es = ewH ? "risk" : ewM ? "warn" : "ok";
    const arrow = k.fiberDelta >= 0 ? "▲" : "▼";
    return `
    <section class="panel">
      <div class="panel-h"><h2>${esc(t("dash.tasks"))}</h2>${sampleFlag()}</div>
      ${pending.length ? `<ul class="tasks">${state.tasks.map((x) => `
        <li class="task ${x.done ? "done" : ""}">
          <div><p>${x.done ? "✓ " : ""}${esc(P(x.title))}</p><small>${esc(P(x.due))}</small></div>
          ${x.done ? "" : `<a class="btn btn-outline btn-sm" href="#${x.page}">${esc(t("dash.go"))} →</a>`}
        </li>`).join("")}</ul>` : `<p class="muted-note">✓ ${esc(t("dash.tasksAllDone"))}</p>`}
    </section>

    <section class="kpi-row" data-tour="kpi">
      <div class="kpi-card"><span class="k-label">${esc(t("dash.k1"))}</span><span class="k-val t-${fs}">${fmt(k.fiberLoss)}%</span>
        <span class="k-sub">${esc(t("dash.k1s", { kg: fmt(k.fiberKg, 0), d: arrow + Math.abs(k.fiberDelta) }))}</span></div>
      <div class="kpi-card"><span class="k-label">${esc(t("dash.k2"))}</span><span class="k-val t-${as}">${fmt(k.apd, 0)}%</span>
        <div class="k-bar"><i class="b-${as}" style="width:${k.apd}%"></i></div>
        <span class="k-sub">${esc(t("dash.k2s", { t: C.thresholds.apdTarget }))}</span></div>
      <div class="kpi-card"><span class="k-label">${esc(t("dash.k3"))}</span><span class="k-val t-${hs}">${esc(k.housekeeping)}</span>
        <span class="k-sub">${esc(t("dash.k3s"))}</span></div>
      <div class="kpi-card"><span class="k-label">${esc(t("dash.k4"))}</span><span class="k-val t-${es}">${ewTotal}</span>
        <span class="k-sub">${esc(t("dash.k4s", { h: ewH, m: ewM }))}</span></div>
    </section>

    <section class="panel">
      <div class="panel-h"><h2>${esc(t("dash.oneRecord", { area: areaObj(state.area).name, win: r.window }))}</h2>${sampleFlag()}</div>
      <div class="record">
        <div class="sources">
          <div class="source"><span>${esc(t("dash.srcSensor"))}</span><b>${esc(P(r.sources.sensor))}</b></div>
          <div class="source"><span>${esc(t("dash.srcCv"))}</span><b>${esc(P(r.sources.cv))}</b></div>
          <div class="source"><span>${esc(t("dash.srcHse"))}</span><b>${esc(P(r.sources.hse))}</b></div>
          <div class="source"><span>${esc(t("dash.srcFiber"))}</span><b>${esc(P(r.sources.fiber))}</b></div>
        </div>
        <div class="risk-box lvl-${lvl.status}" data-tour="risk">
          <span class="rl">${esc(t("dash.riskScore"))}</span>
          <b>${fmt(r.risk, 2)}</b>
          ${chip(lvl.status, P(lvl.label))}
        </div>
      </div>
      ${lvl.status === "risk" ? `<p style="margin-top:12px"><a class="btn btn-primary btn-sm" href="#early-warning">${esc(t("dash.openEw"))}</a></p>` : ""}
    </section>

    <section class="grid-3-2">
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("dash.trend"))}</h3>${sampleFlag()}</div>
        <div id="trendChart"></div>
        <div class="legend">
          <span><i style="border-color:var(--brand)"></i>${esc(t("dash.legendFiber"))}</span>
          <span><i style="border-color:var(--warn);border-top-style:dashed"></i>${esc(t("dash.legendPm"))}</span>
          <span><i style="border-color:var(--risk);border-top-style:dashed"></i>${esc(t("dash.legendRef"))} (100)</span>
        </div>
      </div>
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("dash.areas"))}</h3></div>
        <ul class="status-list">${D.areaStatus.map((a) => {
          const l = riskLevel(a.risk);
          return `<li><div><b>${esc(a.area)}</b><small>${esc(P(a.note))}</small></div>${chip(l.status, P(l.label), false)}</li>`;
        }).join("")}</ul>
      </div>
    </section>`;
  };
  AFTER.dashboard = () => {
    // PM dinormalisasi ke skala fiber loss agar dua seri muat di satu sumbu (PM/100 → %-skala)
    const tr = D.trend7;
    $("#trendChart").innerHTML = EW.lineChart({
      label: t("dash.trend"),
      labels: tr.labels.map((d) => d + (EW.i18n.lang === "en" ? " Oct" : " Okt")),
      series: [
        { values: tr.fiberLoss, color: "var(--brand)", area: true },
        { values: tr.pm.map((v) => v / 70), color: "var(--warn)", dash: true },
      ],
      refs: [{ value: 100 / 70, color: "var(--risk)" }],
      yMin: 1, yMax: 2.6,
      fmt: (v) => fmt(v, 1) + "%",
      rightFmt: (v) => Math.round(v * 70),
    });
  };

  /* ---------- Early Warning ---------- */
  const LVL_ORDER = { risk: 0, warn: 1, ok: 2 };
  RENDER["early-warning"] = () => {
    const f = state.ewFilter;
    let list = state.alerts.slice().sort((a, b) => LVL_ORDER[a.level] - LVL_ORDER[b.level]);
    if (f === "risk") list = list.filter((a) => a.level === "risk" && a.status === "open");
    if (f === "warn") list = list.filter((a) => a.level === "warn" && a.status === "open");
    if (f === "done") list = list.filter((a) => a.status === "done");
    if (!state.ewSel || !state.alerts.find((a) => a.id === state.ewSel)) state.ewSel = (list[0] || {}).id || null;
    const sel = state.alerts.find((a) => a.id === state.ewSel);
    const filters = [["all", "filterAll"], ["risk", "filterHigh"], ["warn", "filterMed"], ["done", "filterDone"]];
    const levelLabel = (a) => (a.status === "done" ? t("ew.filterDone") : P(a.action));
    return `
    <section class="grid-2-3">
      <div class="panel stack">
        <div class="filters" role="group">${filters.map(([k, l]) => `<button type="button" class="filter" data-filter="${k}" aria-pressed="${f === k}">${esc(t("ew." + l))}</button>`).join("")}</div>
        ${list.length ? `<ul class="alerts">${list.map((a) => `
          <li><button type="button" class="alert-item" data-alert="${a.id}" aria-current="${a.id === state.ewSel}">
            <span class="sev b-${a.status === "done" ? "ok" : a.level}"></span>
            <span><b>${esc(P(a.title))}</b><small>${esc(P(a.where))}</small></span>
            ${chip(a.status === "done" ? "ok" : a.level, levelLabel(a), false)}
          </button></li>`).join("")}</ul>` : `<p class="muted-note">${esc(t("ew.empty"))}</p>`}
        ${sampleFlag()}
      </div>
      <div class="panel stack" id="ewDetail">
        ${sel ? ewDetail(sel) : `<p class="muted-note">${esc(t("ew.pick"))}</p>`}
      </div>
    </section>`;
  };
  function ewDetail(a) {
    const max = Math.max(...a.factors.map((f) => f[1]), 0.4);
    const total = a.factors.reduce((s, f) => s + f[1], 0);
    return `
      <div class="panel-h" style="margin:0"><h2>${esc(P(a.title))}</h2>${chip(a.status === "done" ? "ok" : a.level, a.status === "done" ? t("ew.marked") : P(a.action), false)}</div>
      <p class="muted-note">${esc(P(a.where))}</p>
      <div>
        <p class="row-h" style="margin-bottom:6px">${esc(t("ew.why"))}</p>
        ${a.factors.map(([n, v]) => `<div class="factor"><span>${esc(n)}</span><span class="fbar"><i style="width:${(v / max) * 100}%"></i></span><span>${fmt(v, 2)}</span></div>`).join("")}
        <p class="muted-note" style="margin-top:4px">Σ ${fmt(total, 2)}</p>
      </div>
      <div><p class="row-h" style="margin-bottom:6px">${esc(t("ew.rec"))}</p><div class="rec-box">${esc(P(a.rec))}</div></div>
      ${a.assigned ? `<p class="chip chip-ok no-dot">${esc(t("ew.assigned", { p: a.assigned.p, d: a.assigned.d }))}</p>` : ""}
      ${state.ewAssignOpen && a.status !== "done" ? `
        <form class="assign-form" id="assignForm">
          <div class="field"><label for="picSel">${esc(t("ew.pic"))}</label><select class="select" id="picSel">${D.people.map((p) => `<option>${esc(p)}</option>`).join("")}</select></div>
          <div class="field"><label for="picDue">${esc(t("ew.due"))}</label><input class="input" type="date" id="picDue" value="2026-10-13"></div>
          <button class="btn btn-primary btn-sm" type="submit">${esc(t("ew.assignSave"))}</button>
        </form>` : ""}
      ${a.status !== "done" ? `<div class="actions">
        <button type="button" class="btn btn-outline btn-sm" id="assignBtn">${esc(t("ew.assign"))}</button>
        <button type="button" class="btn btn-primary btn-sm" id="markBtn">${esc(t("ew.mark"))}</button>
      </div>` : ""}
      <p class="muted-note">${esc(t("ew.note"))}</p>`;
  }
  AFTER["early-warning"] = () => {
    const page = $("#page");
    page.onclick = (e) => {
      const fb = e.target.closest("[data-filter]");
      if (fb) { state.ewFilter = fb.dataset.filter; state.ewSel = null; state.ewAssignOpen = false; renderPage(); return; }
      const ab = e.target.closest("[data-alert]");
      if (ab) { state.ewSel = ab.dataset.alert; state.ewAssignOpen = false; renderPage(); return; }
      if (e.target.closest("#assignBtn")) { state.ewAssignOpen = !state.ewAssignOpen; renderPage(); return; }
      if (e.target.closest("#markBtn")) {
        const a = state.alerts.find((x) => x.id === state.ewSel);
        a.status = "done";
        const tk = state.tasks.find((x) => x.page === "early-warning");
        if (tk && !activeAlerts().some((x) => x.level === "risk")) tk.done = true;
        EW.toast(t("ew.marked") + " · " + P(a.title));
        renderSidebar(); renderPage();
      }
    };
    const form = $("#assignForm");
    if (form) form.onsubmit = (e) => {
      e.preventDefault();
      const a = state.alerts.find((x) => x.id === state.ewSel);
      a.assigned = { p: $("#picSel").value, d: $("#picDue").value };
      state.ewAssignOpen = false;
      EW.toast(t("ew.assigned", { p: a.assigned.p, d: a.assigned.d }));
      renderPage();
    };
  };

  /* ---------- Analisis Risiko (HSE) ---------- */
  function heatColor(v) {
    // hijau → kuning → merah, sesuai ambang risk.levels
    if (v < 0.4) return `color-mix(in srgb, var(--ok) ${Math.round(25 + v * 80)}%, var(--surface))`;
    if (v < 0.7) return `color-mix(in srgb, var(--warn) ${Math.round(35 + (v - 0.4) * 150)}%, var(--surface))`;
    return `color-mix(in srgb, var(--risk) ${Math.round(55 + (v - 0.7) * 150)}%, var(--surface))`;
  }
  function pearson(a, b) {
    const m = (x) => x.reduce((s, v) => s + v, 0) / x.length;
    const ma = m(a), mb = m(b);
    let n = 0, da = 0, db = 0;
    a.forEach((v, i) => { n += (v - ma) * (b[i] - mb); da += (v - ma) ** 2; db += (b[i] - mb) ** 2; });
    return n / Math.sqrt(da * db);
  }
  RENDER.analisis = () => {
    const H = D.heat;
    const mCell = (L, S) => {
      const s = L * S;
      const cls = s <= 4 ? "m-low" : s <= 9 ? "m-med" : "m-high";
      const hz = D.hazards.filter((h) => h.L === L && h.S === S).map((h) => `<span class="hz">${h.code}</span>`).join("");
      return `<div class="cell ${cls}" title="L${L} × S${S} = ${s}">${hz}</div>`;
    };
    let matrix = "";
    for (let S = 5; S >= 1; S--) {
      matrix += `<div class="ax">${S}</div>`;
      for (let L = 1; L <= 5; L++) matrix += mCell(L, S);
    }
    matrix += `<div></div>` + [1, 2, 3, 4, 5].map((l) => `<div class="ax">${l}</div>`).join("");
    const r = pearson(D.trend7.fiberLoss, D.trend7.pm);
    return `
    <section class="panel">
      <div class="panel-h">
        <div class="filters" role="group" aria-label="${esc(t("an.period"))}">
          ${[7, 30, 90].map((d) => `<button type="button" class="filter" data-period="${d}" aria-pressed="${state.period === d}">${esc(t("an.d" + d))}</button>`).join("")}
        </div>
        <button type="button" class="btn btn-outline btn-sm" disabled title="${esc(t("common.soon"))}">${esc(t("an.download"))} · ${esc(t("common.soon"))}</button>
      </div>
      <div class="kpi-row">
        ${["Cutting", "Sewing line 2", "Sewing line 1", "Finishing"].map((name) => {
          const a = D.areaStatus.find((x) => x.area === name); const l = riskLevel(a.risk);
          return `<div class="kpi-card"><span class="k-label">${esc(name)}</span><span class="k-val t-${l.status}">${fmt(a.risk, 2)}</span><span class="k-sub">${esc(P(l.label))}</span></div>`;
        }).join("")}
      </div>
    </section>

    <section class="grid-3-2">
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("an.heat"))}</h3>${sampleFlag()}</div>
        <div class="scroll-x"><table class="heat">
          <thead><tr><th></th>${H.days.map((d) => `<th>${d}</th>`).join("")}</tr></thead>
          <tbody>${H.rows.map(([name, vals]) => `<tr><th scope="row">${esc(name)}</th>${vals.map((v) => `<td style="background:${heatColor(v)}">${fmt(v, 2)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>
      </div>
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("an.matrix"))}</h3></div>
        <div class="matrix">${matrix}</div>
        <div class="axis-cap"><span>↑ ${esc(t("an.severity"))}</span><span>${esc(t("an.likelihood"))} →</span></div>
        <ul class="hz-list">${D.hazards.map((h) => `<li><b>${h.code}</b>${esc(P(h.name))} · L${h.L}×S${h.S}</li>`).join("")}</ul>
      </div>
    </section>

    <section class="grid-2">
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("an.causes"))}</h3></div>
        ${D.causes.map((c) => `<div class="cause"><span>${esc(P(c.name))}</span><span>${c.share}%</span><span class="fbar"><i style="width:${c.share}%"></i></span></div>`).join("")}
      </div>
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("an.corr"))}</h3>${chip("neutral", t("an.corrR", { r: fmt(r, 2) }), false)}</div>
        <div id="corrChart"></div>
        <p class="muted-note">${esc(P(D.corr.note))}</p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-h"><h3>${esc(t("an.recs"))}</h3></div>
      <ul class="recs">${D.recs.map((x, i) => `
        <li><span class="lvl">${i + 1}. ${esc(t("an.lvl." + x.level))}</span><p>${esc(P(x.text))}</p>
        <a class="btn btn-outline btn-sm" href="#early-warning">${esc(t("ew.assign"))}</a></li>`).join("")}</ul>
    </section>`;
  };
  AFTER.analisis = () => {
    const tr = D.trend7;
    $("#corrChart").innerHTML = EW.lineChart({
      label: t("an.corr"), h: 180,
      labels: tr.labels,
      series: [{ values: tr.fiberLoss, color: "var(--brand)", area: true }, { values: tr.pm.map((v) => v / 70), color: "var(--warn)", dash: true }],
      yMin: 1, yMax: 2.6, fmt: (v) => fmt(v, 1) + "%", rightFmt: (v) => Math.round(v * 70),
    });
    $("#page").onclick = (e) => {
      const b = e.target.closest("[data-period]");
      if (!b) return;
      const d = Number(b.dataset.period);
      if (d !== 7) { EW.toast(t("an.periodNote")); return; }
      state.period = d; renderPage();
    };
  };

  /* ---------- Sensor Lingkungan ---------- */
  RENDER.sensor = () => {
    const s = rec().sensor;
    const th = C.thresholds;
    const card = (key, label, val, unit, pct, note) => {
      const st = sensorStatus(key, val);
      return `<div class="kpi-card"><span class="k-label">${esc(label)}</span>
        <span class="k-val">${fmt(val, 0)} <small style="font-size:.75rem;font-weight:600">${esc(unit)}</small></span>
        <div class="k-bar"><i class="b-${st}" style="width:${Math.min(100, pct)}%"></i></div>
        <span class="k-sub">${esc(note)}</span></div>`;
    };
    const metrics = [["pm", "PM"], ["temp", t("sensor.temp")], ["rh", "RH"], ["noise", "dBA"]];
    return `
    <section class="sensor-cards">
      ${card("pm", t("sensor.pm"), s.pm, th.pm.unit, (s.pm / th.pm.risk) * 100, P(th.pm.note))}
      ${card("temp", t("sensor.temp"), s.temp, th.temp.unit, (s.temp / 40) * 100, P(th.temp.note))}
      ${card("rh", t("sensor.rh"), s.rh, th.rh.unit, s.rh, P(th.rh.note))}
      ${card("noise", t("sensor.noise"), s.noise, th.noise.unit, s.noiseDose, t("sensor.dose", { d: s.noiseDose }))}
    </section>
    <section class="grid-3-2">
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("sensor.series"))}</h3>
          <div class="tabs-mini" role="group">${metrics.map(([k, l]) => `<button type="button" data-metric="${k}" aria-pressed="${state.metric === k}">${esc(l)}</button>`).join("")}</div>
        </div>
        <div id="sensorChart"></div>
        ${sampleFlag()}
      </div>
      <form class="panel stack" id="manualForm" novalidate>
        <div class="panel-h" style="margin:0"><h3>${esc(t("sensor.manual"))}</h3></div>
        <div class="form-grid">
          <div class="field full"><label for="mRange">${esc(t("sensor.range"))}</label><input class="input" id="mRange" value="10.00 – 11.00"></div>
          <div class="field"><label for="mPm">PM µg/m³</label><input class="input" id="mPm" type="number" inputmode="decimal" min="0" value="${s.pm}"></div>
          <div class="field"><label for="mTemp">${esc(t("sensor.temp"))} °C</label><input class="input" id="mTemp" type="number" inputmode="decimal" value="${s.temp}"></div>
          <div class="field"><label for="mRh">RH %</label><input class="input" id="mRh" type="number" inputmode="decimal" min="0" max="100" value="${s.rh}"></div>
          <div class="field"><label for="mDb">dBA</label><input class="input" id="mDb" type="number" inputmode="decimal" min="0" value="${s.noise}"></div>
          <div class="field full"><label for="mLev">${esc(t("sensor.lev"))}</label>
            <select class="select" id="mLev"><option value="normal" ${s.lev === "normal" ? "selected" : ""}>${esc(t("sensor.levNormal"))}</option><option value="abnormal" ${s.lev === "abnormal" ? "selected" : ""}>${esc(t("sensor.levAbn"))}</option></select></div>
        </div>
        <button class="btn btn-primary" type="submit">${esc(t("sensor.saveReading"))}</button>
      </form>
    </section>
    <p class="foot-note">${esc(t("sensor.node"))} ${chip("ok", t("sensor.calibrated"), false)} / ${chip("warn", t("sensor.indicative"), false)}</p>`;
  };
  AFTER.sensor = () => {
    const drawSensor = () => {
      const m = state.metric;
      const refs = { pm: [{ value: 100, color: "var(--warn)" }, { value: 200, color: "var(--risk)" }], noise: [{ value: 85, color: "var(--risk)" }], temp: [], rh: [] }[m];
      const rng = { pm: [0, 220], temp: [24, 34], rh: [50, 90], noise: [65, 90] }[m];
      $("#sensorChart").innerHTML = EW.lineChart({
        label: t("sensor.series"), labels: D.today.labels.map((h) => h + ".00"),
        series: [{ values: D.today[m], color: "var(--brand)", area: true }], refs, yMin: rng[0], yMax: rng[1],
      });
      $$("[data-metric]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.metric === m)));
    };
    drawSensor();
    $("#page").onclick = (e) => {
      const b = e.target.closest("[data-metric]");
      if (b) { state.metric = b.dataset.metric; drawSensor(); }
    };
    $("#manualForm").onsubmit = (e) => {
      e.preventDefault();
      const v = { pm: +$("#mPm").value, temp: +$("#mTemp").value, rh: +$("#mRh").value, noise: +$("#mDb").value };
      if (Object.values(v).some((x) => !isFinite(x) || x < 0) || v.rh > 100) { EW.toast(t("sensor.invalid")); return; }
      const r = rec();
      Object.assign(r.sensor, v, { lev: $("#mLev").value });
      r.sources.sensor = `PM ${v.pm} µg/m³ · ${v.temp} °C · ${v.noise} dBA`;
      ["pm", "temp", "rh", "noise"].forEach((k) => { D.today[k][D.today[k].length - 1] = v[k]; });
      EW.toast(t("sensor.saved"));
      renderPage();
    };
  };

  /* ---------- Computer Vision / APD ---------- */
  RENDER.apd = () => {
    const a = rec().apd;
    const items = [["mask", a.mask], ["gloves", a.gloves]];
    const avg = Math.round(items.reduce((s, x) => s + x[1], 0) / items.length);
    const sent = state.tasks.find((x) => x.page === "apd").done;
    return `
    <section class="grid-3-2">
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("apd.live", { area: areaObj(state.area).name }))}</h3></div>
        <div class="cam" aria-hidden="true">
          <span class="cam-live">● LIVE</span>
          <div class="person" style="left:18%"></div><div class="person" style="left:58%"></div>
          <div class="bbox ok" style="left:21%;top:24%;width:12%;height:10%"><span>${esc(t("apd.mask"))} ✓</span></div>
          <div class="bbox bad" style="left:61%;top:58%;width:14%;height:10%"><span>${esc(t("apd.gloves"))} ✕</span></div>
          <span class="cam-off">${esc(t("apd.camOff"))}</span>
        </div>
        <p class="privacy" style="margin-top:10px">🔒 ${esc(t("apd.privacy"))}</p>
      </div>
      <div class="panel stack">
        <div class="panel-h" style="margin:0"><h3>${esc(t("apd.perApd", { win: rec().window }))}</h3></div>
        <div class="apd-bars">${items.map(([k, v]) => {
          const st = apdStatus(v);
          return `<div class="apd-bar"><span>${esc(t("apd." + k))}</span><span class="t-${st}">${v}%</span><span class="fbar"><i class="b-${st}" style="width:${v}%"></i></span></div>`;
        }).join("")}</div>
        <div class="mini-stats">
          <div><span>${esc(t("apd.workers"))}</span><b>${a.workers}</b></div>
          <div><span>${esc(t("apd.avg"))}</span><b class="t-${apdStatus(avg)}">${avg}%</b></div>
        </div>
        <button type="button" class="btn btn-primary" id="sendApd" ${sent ? "disabled" : ""}>${sent ? "✓ " : ""}${esc(t("apd.send"))}</button>
        ${sampleFlag()}
      </div>
    </section>`;
  };
  AFTER.apd = () => {
    const b = $("#sendApd");
    if (b) b.onclick = () => {
      state.tasks.find((x) => x.page === "apd").done = true;
      EW.toast(t("apd.sent"));
      renderPage();
    };
  };

  /* ---------- HSE Walk-around ---------- */
  /* Klasifikasi SEMENTARA berbasis kata kunci untuk file .csv.
     Akan diganti NLP (config.technical.nlp.endpoint) pada tahap teknis. */
  const RULES = [
    [/(tidak ada kejadian|nihil|aman terkendali)/i, "Tidak ada"],
    [/(tidak pakai|tanpa apd|tidak memakai|lepas masker)/i, "Non-compliant"],
    [/(lemah|menurun|mati|bocor)/i, "Abnormal"],
    [/(berserakan|banyak sisa|kotor|licin|rusak)/i, "Poor"],
    [/(hampir penuh|sedikit|perlu dicek|kurang)/i, "Fair"],
    [/(berfungsi|bersih|terpasang|baik|rapi)/i, "Good"],
  ];
  const classify = (note) => (RULES.find(([re]) => re.test(note)) || [null, "Fair"])[1];
  function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    const sep = lines[0].includes(";") ? ";" : ",";
    const head = lines[0].split(sep).map((h) => h.trim().toLowerCase());
    const ia = head.findIndex((h) => h.startsWith("aspek") || h.startsWith("aspect"));
    const ic = head.findIndex((h) => h.startsWith("catatan") || h.startsWith("note"));
    if (ia < 0 || ic < 0) return [];
    return lines.slice(1).map((l) => {
      const c = l.split(sep);
      const note = (c[ic] || "").replace(/^"|"$/g, "").trim();
      return { aspect: { id: c[ia].trim(), en: c[ia].trim() }, note, status: classify(note) };
    });
  }
  const hseStatusClass = (s) => ({ Good: "ok", Compliant: "ok", Normal: "ok", "Tidak ada": "ok", Fair: "warn", Poor: "risk", "Non-compliant": "risk", Abnormal: "risk", Ada: "risk" }[s] || "warn");
  RENDER.hse = () => {
    const h = state.hse;
    return `
    <section class="panel stack">
      <p class="row-h"><span class="step-n">1</span>${esc(t("hse.upload"))}</p>
      <label class="drop" id="drop" for="hseFile">
        <b>${esc(t("hse.drop"))}</b><span class="caption">${esc(t("hse.cols"))}</span>
        ${h.file ? `<span class="file-name">📄 ${esc(h.file.name)}</span>` : ""}
      </label>
      <input type="file" id="hseFile" accept=".csv,.xlsx,.xls" class="sr-only">
      <p class="row-h"><span class="step-n">2</span><button type="button" class="btn btn-primary btn-sm" id="hseProcess" ${h.processing ? "disabled" : ""}>${esc(h.processing ? t("hse.processing") : t("hse.process"))}</button></p>
      <p class="muted-note">${esc(t("hse.nlp"))}</p>
    </section>
    ${h.rows ? `
    <section class="panel stack">
      <div class="panel-h" style="margin:0"><h3>${esc(t("hse.result", { file: h.file ? h.file.name : t("hse.sampleFile") }))}</h3>${sampleFlag()}</div>
      <div class="scroll-x"><table class="table">
        <thead><tr><th>${esc(t("hse.aspect"))}</th><th>${esc(t("hse.note"))}</th><th>${esc(t("hse.status"))}</th></tr></thead>
        <tbody>${h.rows.map((r, i) => `<tr>
          <td>${esc(P(r.aspect))}</td><td class="note">“${esc(r.note)}”</td>
          <td><label class="sr-only" for="hs${i}">${esc(t("common.edit"))}</label>
            <select class="status-select" id="hs${i}" data-row="${i}">${D.hseOptions.map((o) => `<option ${o === r.status ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>
            ${chip(hseStatusClass(r.status), r.status, true)}</td>
        </tr>`).join("")}</tbody>
      </table></div>
      <p class="row-h"><span class="step-n">3</span><button type="button" class="btn btn-primary" id="hseSave">${esc(t("hse.save"))}</button></p>
    </section>` : ""}`;
  };
  AFTER.hse = () => {
    const h = state.hse;
    const input = $("#hseFile");
    const drop = $("#drop");
    input.onchange = () => { h.file = input.files[0] || null; h.rows = null; renderPage(); };
    ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("drag"); }));
    drop.addEventListener("drop", (e) => { const f = e.dataTransfer.files[0]; if (f) { h.file = f; h.rows = null; renderPage(); } });
    $("#hseProcess").onclick = () => {
      h.processing = true; renderPage();
      const done = (rows) => { h.rows = rows && rows.length ? rows : JSON.parse(JSON.stringify(D.hseRows)); h.processing = false; renderPage(); };
      if (h.file && /\.csv$/i.test(h.file.name)) {
        const fr = new FileReader();
        fr.onload = () => setTimeout(() => done(parseCsv(String(fr.result))), 500);
        fr.onerror = () => done(null);
        fr.readAsText(h.file);
      } else {
        // .xlsx dibaca di tahap teknis (library SheetJS / backend). Sementara: data contoh.
        setTimeout(() => done(null), 700);
      }
    };
    $$("[data-row]").forEach((sel) => { sel.onchange = () => { h.rows[+sel.dataset.row].status = sel.value; renderPage(); }; });
    const save = $("#hseSave");
    if (save) save.onclick = () => {
      const hk = h.rows.find((r) => /housekeeping/i.test(P(r.aspect)));
      const r = rec();
      if (hk && ["Good", "Fair", "Poor"].includes(hk.status)) { r.kpi.housekeeping = hk.status; r.sources.hse = "Housekeeping " + hk.status; }
      state.tasks.find((x) => x.page === "hse").done = true;
      EW.toast(t("hse.savedMsg"));
      location.hash = "dashboard";
    };
  };

  /* ---------- Fiber Waste ---------- */
  RENDER["fiber-waste"] = () => {
    const f = state.fiberForm;
    const rate = f.input > 0 ? (f.waste / f.input) * 100 : 0;
    const st = fiberStatus(rate);
    const opts = t("fiber.binOpts");
    return `
    <section class="grid-2">
      <div class="panel stack">
        <p class="row-h"><span class="step-n">1</span>${esc(t("fiber.upload"))}</p>
        <label class="drop" for="fiberFile"><b>${esc(t("hse.drop"))}</b><span class="caption">${esc(t("fiber.cols"))}</span></label>
        <input type="file" id="fiberFile" accept=".csv,.xlsx" class="sr-only">
        <p class="muted-note">${esc(t("common.soon"))}: ${esc(t("hse.template"))}</p>
      </div>
      <form class="panel stack" id="fiberForm" novalidate>
        <p class="row-h"><span class="step-n">2</span>${esc(t("fiber.manual"))} · ${esc(areaObj(state.area).name)} · ${esc(shiftObj(state.shift).label)}</p>
        <div class="form-grid">
          <div class="field"><label for="fWaste">${esc(t("fiber.waste"))}</label><input class="input" id="fWaste" type="number" inputmode="decimal" min="0" step="0.1" value="${f.waste}"></div>
          <div class="field"><label for="fInput">${esc(t("fiber.input"))}</label><input class="input" id="fInput" type="number" inputmode="decimal" min="0" step="1" value="${f.input}"></div>
          <div class="field"><label for="fKind">${esc(t("fiber.kind"))}</label><input class="input" id="fKind" value="${esc(f.kind)}"></div>
          <div class="field"><label for="fBin">${esc(t("fiber.bin"))}</label><select class="select" id="fBin">${opts.map((o, i) => `<option value="${i}" ${i === f.bin ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>
        </div>
        <div class="calc">
          <div><span>${esc(t("fiber.waste"))}</span><b id="cWaste">${fmt(f.waste, 1)} kg</b></div>
          <div><span>${esc(t("fiber.rate"))}</span><b id="cRate" class="t-${st}">${fmt(rate, 2)}%</b><small>${esc(t("fiber.formula"))}</small></div>
          <div><span>${esc(t("fiber.bin"))}</span><b id="cBin" style="font-size:1rem">${esc(opts[f.bin])}</b></div>
        </div>
        <p class="row-h"><span class="step-n">3</span><button class="btn btn-primary" type="submit">${esc(t("fiber.save"))}</button></p>
      </form>
    </section>
    <section class="grid-3-2">
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("fiber.table"))}</h3>${sampleFlag()}</div>
        <div class="scroll-x"><table class="table">
          <thead><tr><th>${esc(t("fiber.area"))}</th><th>${esc(t("fiber.shiftCol"))}</th><th>${esc(t("fiber.data"))}</th><th>${esc(t("fiber.rate"))}</th><th>${esc(t("fiber.status"))}</th></tr></thead>
          <tbody>${state.fiberRows.map((r) => {
            const pr = (r.waste / r.input) * 100; const s2 = fiberStatus(pr);
            return `<tr><td><b>${esc(r.area)}</b></td><td>${esc(r.shift)}</td><td>${fmt(r.waste, 0)} kg · ${esc(P(r.kind))}</td>
              <td class="t-${s2}" style="font-weight:600">${fmt(pr, 2)}%</td><td>${chip(s2 === "ok" ? "ok" : s2, t("fiber.recorded"), true)}</td></tr>`;
          }).join("")}</tbody>
        </table></div>
      </div>
      <div class="panel">
        <div class="panel-h"><h3>${esc(t("fiber.trend"))}</h3></div>
        <div id="fiberChart"></div>
        <div class="legend"><span><i style="border-color:var(--brand)"></i>${esc(t("dash.legendFiber"))}</span>
          <span><i style="border-color:var(--warn);border-top-style:dashed"></i>${fmt(C.thresholds.fiberLossWarn, 1)}%</span></div>
      </div>
    </section>`;
  };
  AFTER["fiber-waste"] = () => {
    $("#fiberChart").innerHTML = EW.lineChart({
      label: t("fiber.trend"), h: 200, labels: D.trend7.labels,
      series: [{ values: D.trend7.fiberLoss, color: "var(--brand)", area: true }],
      refs: [{ value: C.thresholds.fiberLossWarn, color: "var(--warn)" }],
      yMin: 1, yMax: 3, fmt: (v) => fmt(v, 1) + "%",
    });
    const f = state.fiberForm;
    const live = () => {
      f.waste = parseFloat($("#fWaste").value) || 0;
      f.input = parseFloat($("#fInput").value) || 0;
      f.kind = $("#fKind").value;
      f.bin = +$("#fBin").value;
      const rate = f.input > 0 ? (f.waste / f.input) * 100 : 0;
      $("#cWaste").textContent = fmt(f.waste, 1) + " kg";
      $("#cRate").textContent = fmt(rate, 2) + "%";
      $("#cRate").className = "t-" + fiberStatus(rate);
      $("#cBin").textContent = t("fiber.binOpts")[f.bin];
    };
    ["fWaste", "fInput", "fKind", "fBin"].forEach((id) => $("#" + id).addEventListener("input", live));
    $("#fiberFile").onchange = () => EW.toast(t("common.soon") + " · " + t("fiber.upload"));
    $("#fiberForm").onsubmit = (e) => {
      e.preventDefault();
      live();
      if (!(f.waste > 0 && f.input > 0)) { EW.toast(t("fiber.invalid")); return; }
      const name = areaObj(state.area).name;
      const sh = state.shift.toUpperCase();
      const row = { area: name, shift: sh, waste: f.waste, input: f.input, kind: { id: f.kind, en: f.kind }, bin: { id: t("fiber.binOpts")[f.bin], en: t("fiber.binOpts")[f.bin] } };
      const i = state.fiberRows.findIndex((r) => r.area === name && r.shift === sh);
      if (i >= 0) state.fiberRows[i] = row; else state.fiberRows.unshift(row);
      const r = rec();
      r.kpi.fiberKg = f.waste;
      r.kpi.fiberLoss = Math.round((f.waste / f.input) * 1000) / 10;
      r.sources.fiber = `${fmt(f.waste, 0)} kg · ${t("fiber.binOpts")[f.bin].toLowerCase()}`;
      state.tasks.find((x) => x.page === "fiber-waste").done = true;
      EW.toast(t("fiber.saved"));
      renderPage();
    };
  };

  /* =======================================================
     INIT
     ======================================================= */
  document.addEventListener("ew:lang", () => {
    if (!$("#stage").hidden) {
      renderStageSteps(C.flow.steps.indexOf(state.stage));
      if (state.stage === "select") renderSelect();
      if (state.stage === "loading") $$("[data-check]").forEach((li) => { li.lastChild.textContent = t("loading." + li.dataset.check); });
    } else { renderSidebar(); renderPage(); }
    if (!$("#welcome").hidden) $("#welBody").innerHTML = t("welcome.body", { area: esc(areaObj(state.area).name), shift: esc(shiftObj(state.shift).label) });
    if (!$("#tour").hidden) placeTour();
  });
  document.addEventListener("ew:theme", () => { if ($("#stage").hidden) renderPage(); });
  document.addEventListener("DOMContentLoaded", runLoading);
})();
