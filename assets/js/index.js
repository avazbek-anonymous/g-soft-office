// /assets/js/index.js
// G-SOFT Front (SPA in index.html) — works with your Workers API (/api/*)
// Requires: lang.js (optional; if missing — fallback texts will show)

(() => {
  "use strict";

  // ---------------------------
  // Config
  // ---------------------------
  const LS = {
    lang: "gsoft_lang",
    theme: "gsoft_theme",
    eye: "gsoft_eye",
    sidebar: "gsoft_sidebar_collapsed",
    apiBase: "gsoft_api_base",
  };

  function computeApiBase() {
    const saved = (localStorage.getItem(LS.apiBase) || "").trim();
    if (saved) return saved.replace(/\/+$/, "");

    // If app is opened on api.* itself
    if (location.hostname.startsWith("api.")) return `${location.origin}/api`;

    // If opened on ofis.gekto.uz => api.ofis.gekto.uz
    if (location.hostname === "ofis.gekto.uz") return `${location.protocol}//api.ofis.gekto.uz/api`;

    // Localhost default (change if needed)
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      return `${location.protocol}//api.ofis.gekto.uz/api`;
    }

    // Generic: api.<host>/api
    return `${location.protocol}//api.${location.hostname}/api`;
  }

  const API_BASE = computeApiBase();

  // ---------------------------
  // Small helpers
  // ---------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  function t(key, fallback) {
    const api = window.GSOFT_LANG;
    if (api && typeof api.t === "function") return api.t(key) ?? fallback ?? key;
    return fallback ?? key;
  }

  function applyI18n(root = document) {
    const api = window.GSOFT_LANG;
    if (api && typeof api.apply === "function") api.apply(root);
  }

  function setLang(lang) {
    localStorage.setItem(LS.lang, lang);
    document.documentElement.setAttribute("data-lang", lang);
    const api = window.GSOFT_LANG;
    if (api && typeof api.setLang === "function") api.setLang(lang);
    applyI18n();
    syncLangButtons();
  }

  function getLang() {
    return (
      document.documentElement.getAttribute("data-lang") ||
      (localStorage.getItem(LS.lang) || "uz").trim() ||
      "uz"
    );
  }

  function setTheme(theme) {
    localStorage.setItem(LS.theme, theme);
    document.documentElement.setAttribute("data-theme", theme);
    syncThemeIcons();
  }

  function getTheme() {
    return (
      document.documentElement.getAttribute("data-theme") ||
      (localStorage.getItem(LS.theme) || "dark")
    );
  }

  function setEye(on) {
    localStorage.setItem(LS.eye, on ? "1" : "0");
    document.documentElement.setAttribute("data-eye", on ? "1" : "0");
  }

  function getEye() {
    return (document.documentElement.getAttribute("data-eye") || localStorage.getItem(LS.eye) || "0") === "1";
  }

  function fmtTashkent(tsSec) {
    if (!tsSec) return "—";
    const lang = getLang();
    const loc = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
    try {
      return new Intl.DateTimeFormat(loc, {
        timeZone: "Asia/Tashkent",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(tsSec * 1000));
    } catch {
      return new Date(tsSec * 1000).toLocaleString();
    }
  }

  function fmtDateOnly(tsSec) {
    if (!tsSec) return "—";
    const lang = getLang();
    const loc = lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ";
    try {
      return new Intl.DateTimeFormat(loc, {
        timeZone: "Asia/Tashkent",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(tsSec * 1000));
    } catch {
      return new Date(tsSec * 1000).toLocaleDateString();
    }
  }

  function fmtHMS(totalSec) {
    totalSec = Math.max(0, Number(totalSec || 0));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.floor(totalSec % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function qsParamInt(url, key) {
    const v = url.searchParams.get(key);
    if (!v) return null;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : null;
  }

  // ---------------------------
  // Toasts
  // ---------------------------
  const toastRoot = $("#toast-root");
  function toast(msg, type = "info", ms = 2600) {
    if (!toastRoot) return;
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    toastRoot.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-show"));
    setTimeout(() => {
      el.classList.remove("is-show");
      setTimeout(() => el.remove(), 240);
    }, ms);
  }

  // ---------------------------
  // Modal / Confirm
  // ---------------------------
  const modalRoot = $("#modalRoot");
  const confirmRoot = $("#confirmRoot");

  function openModal(contentEl, { title } = {}) {
    if (!modalRoot) return;
    modalRoot.hidden = false;
    modalRoot.innerHTML = "";

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });

    const modal = document.createElement("div");
    modal.className = "modal";

    const head = document.createElement("div");
    head.className = "modal__head";
    head.innerHTML = `
      <div class="modal__title">${esc(title || "")}</div>
      <button class="icon-btn" type="button" data-x="1" aria-label="Close">✕</button>
    `;
    head.querySelector('[data-x="1"]').addEventListener("click", closeModal);

    const body = document.createElement("div");
    body.className = "modal__body";
    body.appendChild(contentEl);

    modal.appendChild(head);
    modal.appendChild(body);
    overlay.appendChild(modal);
    modalRoot.appendChild(overlay);

    document.body.classList.add("has-modal");
    applyI18n(modalRoot);
  }

  function closeModal() {
    if (!modalRoot) return;
    modalRoot.hidden = true;
    modalRoot.innerHTML = "";
    document.body.classList.remove("has-modal");
  }

  function confirmDialog({ title, message, okText, cancelText } = {}) {
    return new Promise((resolve) => {
      if (!confirmRoot) return resolve(false);
      confirmRoot.hidden = false;
      confirmRoot.innerHTML = `
        <div class="confirm-overlay">
          <div class="confirm">
            <div class="confirm__title">${esc(title || t("confirm_title", "Tasdiqlash"))}</div>
            <div class="confirm__msg">${esc(message || "")}</div>
            <div class="confirm__actions">
              <button class="btn btn-ghost" type="button" data-cancel="1">${esc(cancelText || t("cancel", "Bekor"))}</button>
              <button class="btn btn-primary" type="button" data-ok="1">${esc(okText || t("ok", "OK"))}</button>
            </div>
          </div>
        </div>
      `;
      const overlay = $(".confirm-overlay", confirmRoot);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) done(false);
      });
      $('[data-cancel="1"]', confirmRoot).addEventListener("click", () => done(false));
      $('[data-ok="1"]', confirmRoot).addEventListener("click", () => done(true));

      function done(val) {
        confirmRoot.hidden = true;
        confirmRoot.innerHTML = "";
        resolve(val);
      }
      applyI18n(confirmRoot);
    });
  }

  // ---------------------------
  // API client
  // ---------------------------
  async function apiFetch(path, { method = "GET", body, headers } = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const init = {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    const res = await fetch(url, init);
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (res.status === 401) {
      // session expired -> login
      location.href = "/login.html";
      return { ok: false, status: 401, data: null };
    }

    if (!res.ok) {
      const msg = json?.error?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return json || { ok: true };
  }

  // ---------------------------
  // UI controls: sidebar / theme / eye / lang / logout
  // ---------------------------
  const sidebar = $("#sidebar");
  const backdrop = $("#backdrop");
  const viewRoot = $("#viewRoot");
  const pageTitle = $("#pageTitle");
  const pageSub = $("#pageSub");

  const meName = $("#meName");
  const meRole = $("#meRole");
  const meNameDesk = $("#meNameDesk");
  const nowTashkent = $("#nowTashkent");

  const logoutBtn = $("#logoutBtn");
  const logoutBtnMobile = $("#logoutBtnMobile");

  const sidebarBurger = $("#sidebarBurger");
  const sidebarCollapse = $("#sidebarCollapse");

  function setSidebarCollapsed(collapsed) {
    localStorage.setItem(LS.sidebar, collapsed ? "1" : "0");
    document.body.classList.toggle("sidebar-collapsed", collapsed);
  }

  function getSidebarCollapsed() {
    return (localStorage.getItem(LS.sidebar) || "0") === "1";
  }

  function openSidebarMobile() {
    document.body.classList.add("sidebar-open");
    if (backdrop) backdrop.hidden = false;
  }
  function closeSidebarMobile() {
    document.body.classList.remove("sidebar-open");
    if (backdrop) backdrop.hidden = true;
  }

  function syncLangButtons() {
    const lang = getLang();
    $$("[data-lang-btn]").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-lang-btn") === lang);
    });
  }

  function syncThemeIcons() {
    // You can swap icons if you want; we just keep it simple
    const theme = getTheme();
    document.documentElement.dataset.theme = theme;
  }

  function bindLangButtons() {
    $$("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang-btn");
        setLang(lang);
      });
    });
  }

  function bindThemeEye() {
    const ids = ["themeToggle", "themeToggleDesk"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", () => {
        setTheme(getTheme() === "dark" ? "light" : "dark");
      });
    });

    const eids = ["eyeToggle", "eyeToggleDesk"];
    eids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", () => {
        setEye(!getEye());
      });
    });
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {}
    location.href = "/login.html";
  }

  function bindSidebar() {
    if (sidebarBurger) sidebarBurger.addEventListener("click", openSidebarMobile);
    if (backdrop) backdrop.addEventListener("click", closeSidebarMobile);
    if (sidebarCollapse) sidebarCollapse.addEventListener("click", () => setSidebarCollapsed(!getSidebarCollapsed()));

    // close on nav click (mobile)
    $$('a.nav__item[href^="#/"]').forEach((a) => {
      a.addEventListener("click", () => closeSidebarMobile());
    });
  }

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (logoutBtnMobile) logoutBtnMobile.addEventListener("click", logout);

  // ---------------------------
  // App state
  // ---------------------------
  const state = {
    me: null,
    meta: null,
    cache: {
      users: null,
      companies: null,
      leads: null,
      serviceTypes: null,
      courseTypes: null,
      dictsLoaded: false,
    },
    currentRoute: null,
  };

  function setMeUI(me) {
    const name = me?.full_name || "—";
    const role = me?.role || "—";
    if (meName) meName.textContent = name;
    if (meRole) meRole.textContent = role;
    if (meNameDesk) meNameDesk.textContent = name;

    // hide role-only menu
    $$("[data-role-only]").forEach((el) => {
      const need = el.getAttribute("data-role-only");
      el.style.display = me?.role === need ? "" : "none";
    });
  }

  function startClock() {
    if (!nowTashkent) return;
    const tick = () => {
      const d = new Date();
      try {
        nowTashkent.textContent = new Intl.DateTimeFormat(getLang() === "ru" ? "ru-RU" : "uz-UZ", {
          timeZone: "Asia/Tashkent",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(d);
      } catch {
        nowTashkent.textContent = d.toLocaleTimeString();
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---------------------------
  // Router
  // ---------------------------
  function parseHash() {
    const raw = (location.hash || "").replace(/^#/, "");
    if (!raw || !raw.startsWith("/")) return { route: "main", q: new URLSearchParams() };
    const [path, query] = raw.split("?");
    const route = (path || "/main").replace(/^\//, "").trim() || "main";
    return { route, q: new URLSearchParams(query || "") };
  }

  function setActiveNav(route) {
    $$("[data-route]").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("data-route") === route);
    });
  }

  function setTitle(route, sub = "") {
    const map = {
      main: t("menu_main", "Asosiy"),
      tasks: t("menu_tasks", "Vazifalar"),
      projects: t("menu_projects", "Loyihalar"),
      courses: t("menu_courses", "Kurslar"),
      clients: t("menu_clients", "Klientlar"),
      settings: t("menu_settings", "Sozlamalar"),
      users: t("menu_users", "Foydalanuvchilar"),
    };
    if (pageTitle) pageTitle.textContent = map[route] || route;
    if (pageSub) pageSub.textContent = sub || "";
  }

  function renderLoading() {
    if (!viewRoot) return;
    viewRoot.innerHTML = `
      <div class="page-loading">
        <div class="spinner"></div>
        <div class="muted">${esc(t("loading", "Yuklanmoqda..."))}</div>
      </div>
    `;
    applyI18n(viewRoot);
  }

  async function navigate() {
    const { route, q } = parseHash();
    state.currentRoute = route;
    setActiveNav(route);
    setTitle(route);

    renderLoading();

    const routes = {
      main: () => renderMain(),
      tasks: () => renderTasks(q),
      projects: () => renderProjects(q),
      courses: () => renderCourses(q),
      clients: () => renderClients(q),
      settings: () => renderSettings(),
      users: () => renderUsers(),
    };

    const fn = routes[route] || routes.main;
    try {
      await fn();
    } catch (e) {
      if (viewRoot) {
        viewRoot.innerHTML = `
          <div class="card">
            <div class="h2">${esc(t("error", "Xatolik"))}</div>
            <div class="muted mt-8">${esc(String(e?.message || e))}</div>
            <div class="mt-12">
              <button class="btn btn-primary" type="button" id="retryBtn">${esc(t("retry", "Qayta urinish"))}</button>
            </div>
          </div>
        `;
        $("#retryBtn")?.addEventListener("click", () => navigate());
        applyI18n(viewRoot);
      }
    }
  }

  window.addEventListener("hashchange", navigate);

  // ---------------------------
  // Data caches (admin-friendly)
  // ---------------------------
  async function ensureMeta() {
    if (state.meta) return state.meta;
    const res = await apiFetch("/meta");
    state.meta = res.data;
    return state.meta;
  }

  async function ensureUsers() {
    if (state.cache.users) return state.cache.users;
    if (state.me?.role !== "admin") return [];
    const res = await apiFetch("/users");
    state.cache.users = res.data || [];
    return state.cache.users;
  }

  async function ensureClients(type) {
    // type: "company" | "lead"
    if (type === "company" && state.cache.companies) return state.cache.companies;
    if (type === "lead" && state.cache.leads) return state.cache.leads;

    const res = await apiFetch(`/clients?type=${encodeURIComponent(type)}`);
    if (type === "company") state.cache.companies = res.data || [];
    if (type === "lead") state.cache.leads = res.data || [];
    return res.data || [];
  }

  async function ensureSettingsAllIfAdmin() {
    if (state.cache.dictsLoaded) return;
    if (state.me?.role !== "admin") return;
    const res = await apiFetch("/settings/all");
    const d = res.data || {};
    state.cache.serviceTypes = d.service_types || [];
    state.cache.courseTypes = d.course_types || [];
    state.cache.dictsLoaded = true;

    // Apply theme vars (optional)
    if (d.theme?.value) applyThemeFromSettings(d.theme.value);
  }

  function applyThemeFromSettings(themeObj) {
    // themeObj example: {mode,eye,dark{bg,text,btn},light{...}}
    if (!themeObj || typeof themeObj !== "object") return;
    const mode = themeObj.mode === "light" ? "light" : "dark";
    setTheme(mode);
    setEye(!!themeObj.eye);

    const palette = themeObj[mode];
    if (!palette) return;

    const styleId = "theme-override";
    let st = document.getElementById(styleId);
    if (!st) {
      st = document.createElement("style");
      st.id = styleId;
      document.head.appendChild(st);
    }
    const bg = palette.bg || "";
    const text = palette.text || "";
    const btn = palette.btn || "";
    st.textContent = `
      html[data-theme="${mode}"]{
        ${bg ? `--bg:${bg};` : ""}
        ${text ? `--text:${text};` : ""}
        ${btn ? `--primary:${btn};` : ""}
      }
    `;
  }

  // ---------------------------
  // Generic UI blocks
  // ---------------------------
  function kanbanSkeleton(columns) {
    return `
      <div class="kanban">
        ${columns
          .map(
            (c) => `
          <section class="kanban-col" data-col="${esc(c.key)}">
            <header class="kanban-col__head">
              <div class="kanban-col__title">${esc(c.title)}</div>
              <div class="kanban-col__count" data-count="${esc(c.key)}">0</div>
            </header>
            <div class="kanban-col__body" data-drop="${esc(c.key)}"></div>
          </section>
        `
          )
          .join("")}
      </div>
    `;
  }

  function bindDnD({ onDropStatus }) {
    $$("[data-drop]").forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("is-over");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
      zone.addEventListener("drop", async (e) => {
        e.preventDefault();
        zone.classList.remove("is-over");
        const status = zone.getAttribute("data-drop");
        const id = Number(e.dataTransfer.getData("text/taskId") || e.dataTransfer.getData("text/plain"));
        if (!id || !status) return;
        await onDropStatus(id, status);
      });
    });
  }

  // ---------------------------
  // MAIN
  // ---------------------------
  async function renderMain() {
    setTitle("main");
    const res = await apiFetch("/main");
    const data = res.data || {};
    const overdue = data.overdue || [];
    const today = data.today || [];
    const inProg = data.in_progress;

    if (!viewRoot) return;

    viewRoot.innerHTML = `
      <div class="grid grid-2">
        <div class="card">
          <div class="h2">${esc(t("main_overdue", "Muddati o‘tgan"))}</div>
          <div class="list mt-12" id="overdueList">
            ${overdue.length ? "" : `<div class="muted">${esc(t("empty", "Bo‘sh"))}</div>`}
          </div>
        </div>

        <div class="card">
          <div class="h2">${esc(t("main_today", "Bugungi"))}</div>
          <div class="list mt-12" id="todayList">
            ${today.length ? "" : `<div class="muted">${esc(t("empty", "Bo‘sh"))}</div>`}
          </div>
        </div>
      </div>

      <div class="card mt-16">
        <div class="row row-between">
          <div>
            <div class="h2">${esc(t("main_in_progress", "Jarayondagi"))}</div>
            <div class="muted small mt-4">${esc(t("main_in_progress_hint", "Faqat bitta vazifa Jarayonda bo‘lishi mumkin"))}</div>
          </div>
        </div>
        <div class="mt-12" id="inProgBox">
          ${
            inProg
              ? `<div class="task-row" data-task-open="${esc(inProg.id)}">
                   <div class="task-row__title">${esc(inProg.title || "")}</div>
                   <div class="task-row__desc">${esc(inProg.description || "")}</div>
                   <div class="task-row__meta">
                     <span class="pill pill--blue">${esc(inProg.status)}</span>
                     <span class="muted small">${esc(fmtDateOnly(inProg.deadline_at))}</span>
                   </div>
                 </div>`
              : `<div class="muted">${esc(t("empty", "Bo‘sh"))}</div>`
          }
        </div>
      </div>
    `;

    const fillList = (rootId, arr) => {
      const root = document.getElementById(rootId);
      if (!root) return;
      root.innerHTML = arr
        .map(
          (x) => `
          <div class="task-row" data-task-open="${esc(x.id)}">
            <div class="task-row__title">${esc(x.title || "")}</div>
            <div class="task-row__desc">${esc(x.description || "")}</div>
            <div class="task-row__meta">
              <span class="pill">${esc(x.status)}</span>
              <span class="muted small">${esc(fmtDateOnly(x.deadline_at))}</span>
            </div>
          </div>
        `
        )
        .join("");
    };

    fillList("overdueList", overdue);
    fillList("todayList", today);

    $$("[data-task-open]").forEach((el) => {
      el.addEventListener("click", () => openTaskModal(Number(el.getAttribute("data-task-open"))));
    });

    applyI18n(viewRoot);
  }

  // ---------------------------
  // TASKS
  // ---------------------------
  const TASK_COLS = [
    { key: "new", title: "New" },
    { key: "pause", title: "Pauza" },
    { key: "in_progress", title: "Jarayonda" },
    { key: "done", title: "Done" },
    { key: "canceled", title: "Canceled" },
  ];

  function taskCardEl(task) {
    const el = document.createElement("div");
    el.className = "kb-card";
    el.draggable = true;
    el.dataset.id = task.id;

    const title = task.title || "";
    const desc = task.description || "";
    const deadline = task.deadline_at ? fmtDateOnly(task.deadline_at) : "—";
    const spent = fmtHMS(task.spent_seconds || 0);

    const projLine =
      task.project_id && (task.project_company_name || task.service_name_uz || task.service_name_ru || task.service_name_en)
        ? `${task.project_company_name || ""}${task.project_company_name && (task.service_name_uz || task.service_name_ru || task.service_name_en) ? " • " : ""}${
            task.service_name_uz || task.service_name_ru || task.service_name_en || ""
          }`
        : "";

    el.innerHTML = `
      <div class="kb-card__top">
        <div class="kb-card__title">${esc(title)}</div>
        <div class="kb-card__badge pill">${esc(task.status)}</div>
      </div>
      <div class="kb-card__desc">${esc(desc)}</div>
      ${projLine ? `<div class="kb-card__meta muted small">${esc(projLine)}</div>` : ""}
      <div class="kb-card__bottom">
        <div class="muted small">⏱ ${esc(spent)}</div>
        <div class="muted small">📅 ${esc(deadline)}</div>
      </div>
      <div class="kb-card__foot">
        <div class="kb-card__who">${esc(task.assignee_name || "")}</div>
      </div>
    `;

    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/taskId", String(task.id));
      e.dataTransfer.setData("text/plain", String(task.id));
    });

    el.addEventListener("click", () => openTaskModal(task.id));
    return el;
  }

  async function renderTasks(q) {
    setTitle("tasks");
    if (!viewRoot) return;

    const isAdmin = state.me?.role === "admin";
    const isRop = state.me?.role === "rop";

    // filters
    const projectId = qsParamInt(new URL(location.href), "project_id") || null;

    viewRoot.innerHTML = `
      <div class="card">
        <div class="row row-between row-wrap">
          <div class="h2">${esc(t("menu_tasks", "Vazifalar"))}</div>
          <div class="row row-gap">
            <button class="btn btn-primary" type="button" id="taskNewBtn">+ ${esc(t("new_task", "Yangi vazifa"))}</button>
          </div>
        </div>

        <div class="filters mt-12">
          <div class="field">
            <label class="label">${esc(t("search", "Qidirish"))}</label>
            <input class="input" id="taskSearch" placeholder="${esc(t("search_placeholder", "Matn..."))}" />
          </div>

          <div class="field">
            <label class="label">${esc(t("project", "Loyiha"))}</label>
            <select class="select" id="taskProjectSelect">
              <option value="">${esc(t("all", "Hammasi"))}</option>
            </select>
          </div>

          ${
            isAdmin || isRop
              ? `<div class="field">
                  <label class="label">${esc(t("assignee", "Mas'ul"))}</label>
                  <select class="select" id="taskUserSelect">
                    <option value="">${esc(t("all", "Hammasi"))}</option>
                  </select>
                </div>`
              : ""
          }

          <div class="field">
            <label class="label">${esc(t("show_done", "Done/Canceled"))}</label>
            <select class="select" id="taskShowDone">
              <option value="0">${esc(t("hide", "Yashirish"))}</option>
              <option value="1">${esc(t("show", "Ko‘rsatish"))}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-16">
        ${kanbanSkeleton(
          TASK_COLS.map((c) => ({
            key: c.key,
            title:
              c.key === "new"
                ? t("st_new", "Yangi")
                : c.key === "pause"
                ? t("st_pause", "Pauza")
                : c.key === "in_progress"
                ? t("st_in_progress", "Jarayonda")
                : c.key === "done"
                ? t("st_done", "Yakunlangan")
                : t("st_canceled", "Bekor qilingan"),
          }))
        )}
      </div>
    `;

    applyI18n(viewRoot);

    // Load projects list for filter (if user has access)
    let projects = [];
    try {
      const pr = await apiFetch("/projects");
      projects = pr.data || [];
    } catch {
      projects = [];
    }
    const projectSelect = $("#taskProjectSelect");
    if (projectSelect) {
      projects.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = String(p.id);
        const label = `${p.company_name || ""}${p.company_name ? " • " : ""}${p.service_name_uz || p.service_name_ru || p.service_name_en || ""}`;
        opt.textContent = label || `#${p.id}`;
        projectSelect.appendChild(opt);
      });
      if (projectId) projectSelect.value = String(projectId);
    }

    // Users list for admin/rop filter
    const userSelect = $("#taskUserSelect");
    if (userSelect && (isAdmin || isRop)) {
      const users = await ensureUsers();
      users.forEach((u) => {
        const opt = document.createElement("option");
        opt.value = String(u.id);
        opt.textContent = `${u.full_name} (${u.role})`;
        userSelect.appendChild(opt);
      });
    }

    const searchEl = $("#taskSearch");
    const showDoneEl = $("#taskShowDone");

    const reload = async () => {
      const project_id = projectSelect?.value ? Number(projectSelect.value) : null;
      const assignee_user_id = userSelect?.value ? Number(userSelect.value) : null;

      const params = new URLSearchParams();
      if (project_id) params.set("project_id", String(project_id));
      if (assignee_user_id) params.set("assignee_user_id", String(assignee_user_id));

      const res = await apiFetch(`/tasks?${params.toString()}`);
      let items = res.data || [];

      // client-side filters
      const q = (searchEl?.value || "").trim().toLowerCase();
      const showDone = (showDoneEl?.value || "0") === "1";
      if (q) {
        items = items.filter((x) => {
          return (
            String(x.title || "").toLowerCase().includes(q) ||
            String(x.description || "").toLowerCase().includes(q) ||
            String(x.assignee_name || "").toLowerCase().includes(q) ||
            String(x.project_company_name || "").toLowerCase().includes(q)
          );
        });
      }
      if (!showDone) {
        items = items.filter((x) => x.status !== "done" && x.status !== "canceled");
      }

      // clear columns
      TASK_COLS.forEach((c) => {
        const body = $(`[data-col="${c.key}"] [data-drop="${c.key}"]`);
        if (body) body.innerHTML = "";
        const cnt = $(`[data-count="${c.key}"]`);
        if (cnt) cnt.textContent = "0";
      });

      // group
      const grouped = new Map();
      TASK_COLS.forEach((c) => grouped.set(c.key, []));
      items.forEach((it) => grouped.get(it.status)?.push(it));

      TASK_COLS.forEach((c) => {
        const arr = grouped.get(c.key) || [];
        const body = $(`[data-drop="${c.key}"]`);
        const cnt = $(`[data-count="${c.key}"]`);
        if (cnt) cnt.textContent = String(arr.length);
        if (body) {
          arr.forEach((task) => body.appendChild(taskCardEl(task)));
        }
      });

      bindDnD({
        onDropStatus: async (id, status) => {
          if (status === "canceled") {
            const reason = prompt(t("cancel_reason", "Bekor qilish sababi") + ":");
            if (!reason) return;
            await apiFetch(`/tasks/${id}/move`, { method: "POST", body: { status, cancel_reason: reason } });
            toast(t("saved", "Saqlandi"), "ok");
            await reload();
            return;
          }
          await apiFetch(`/tasks/${id}/move`, { method: "POST", body: { status } });
          toast(t("saved", "Saqlandi"), "ok");
          await reload();
        },
      });
    };

    // bind filter changes
    projectSelect?.addEventListener("change", reload);
    userSelect?.addEventListener("change", reload);
    showDoneEl?.addEventListener("change", reload);
    searchEl?.addEventListener("input", () => {
      // simple debounce
      clearTimeout(searchEl._t);
      searchEl._t = setTimeout(reload, 250);
    });

    $("#taskNewBtn")?.addEventListener("click", () => openTaskCreateModal({ onSaved: reload }));

    await reload();
  }

  async function openTaskModal(id) {
    const res = await apiFetch(`/tasks/${id}`);
    const task = res.data;
    const isAdmin = state.me?.role === "admin" || state.me?.role === "rop";

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="kv">
        <div class="kv__row"><div class="kv__k">ID</div><div class="kv__v">#${esc(task.id)}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("status", "Status"))}</div><div class="kv__v"><span class="pill">${esc(task.status)}</span></div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("assignee", "Mas'ul"))}</div><div class="kv__v">${esc(task.assignee_name || "")}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("deadline", "Deadline"))}</div><div class="kv__v">${esc(fmtDateOnly(task.deadline_at))}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("spent", "Sarflangan"))}</div><div class="kv__v">${esc(fmtHMS(task.spent_seconds || 0))}</div></div>
      </div>

      <div class="divider mt-12"></div>

      <div class="field mt-12">
        <label class="label">${esc(t("title", "Sarlavha"))}</label>
        <input class="input" id="mTaskTitle" value="${esc(task.title || "")}" />
      </div>

      <div class="field mt-12">
        <label class="label">${esc(t("description", "Izoh"))}</label>
        <textarea class="textarea" id="mTaskDesc">${esc(task.description || "")}</textarea>
      </div>

      <div class="grid grid-2 mt-12">
        <div class="field">
          <label class="label">${esc(t("deadline", "Deadline"))}</label>
          <input class="input" id="mTaskDeadline" placeholder="epoch seconds" value="${esc(task.deadline_at || "")}" />
          <div class="muted small mt-4">${esc(t("deadline_hint", "Epoch seconds (ixtiyoriy)"))}</div>
        </div>
        <div class="field">
          <label class="label">${esc(t("project_id", "Project ID"))}</label>
          <input class="input" id="mTaskProject" placeholder="id" value="${esc(task.project_id || "")}" />
        </div>
      </div>

      ${
        isAdmin
          ? `<div class="field mt-12">
              <label class="label">${esc(t("assignee_id", "Assignee ID"))}</label>
              <input class="input" id="mTaskAssignee" placeholder="id" value="${esc(task.assignee_user_id || "")}" />
            </div>`
          : ""
      }

      <div class="row row-between mt-16 row-wrap">
        <div class="row row-gap">
          <button class="btn btn-ghost" type="button" id="mTaskPause">${esc(t("to_pause", "Pauza"))}</button>
          <button class="btn btn-primary" type="button" id="mTaskStart">${esc(t("to_in_progress", "Jarayonda"))}</button>
          <button class="btn btn-ghost" type="button" id="mTaskDone">${esc(t("to_done", "Done"))}</button>
          <button class="btn btn-danger" type="button" id="mTaskCancel">${esc(t("to_cancel", "Bekor"))}</button>
        </div>
        <div class="row row-gap">
          <button class="btn btn-ghost" type="button" id="mTaskDelete">${esc(t("delete", "O‘chirish"))}</button>
          <button class="btn btn-primary" type="button" id="mTaskSave">${esc(t("save", "Saqlash"))}</button>
        </div>
      </div>
    `;

    openModal(wrap, { title: t("task", "Vazifa") + ` #${id}` });

    const save = async () => {
      const title = $("#mTaskTitle")?.value ?? "";
      const description = $("#mTaskDesc")?.value ?? "";
      const deadline_at = ($("#mTaskDeadline")?.value || "").trim();
      const project_id = ($("#mTaskProject")?.value || "").trim();
      const assignee_user_id = ($("#mTaskAssignee")?.value || "").trim();

      const body = {
        title: title ? title : null,
        description: description,
        deadline_at: deadline_at ? Number(deadline_at) : null,
        project_id: project_id ? Number(project_id) : null,
      };
      if (isAdmin && assignee_user_id) body.assignee_user_id = Number(assignee_user_id);

      await apiFetch(`/tasks/${id}`, { method: "PUT", body });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    };

    $("#mTaskSave")?.addEventListener("click", save);

    $("#mTaskStart")?.addEventListener("click", async () => {
      await apiFetch(`/tasks/${id}/move`, { method: "POST", body: { status: "in_progress" } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mTaskPause")?.addEventListener("click", async () => {
      await apiFetch(`/tasks/${id}/move`, { method: "POST", body: { status: "pause" } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mTaskDone")?.addEventListener("click", async () => {
      await apiFetch(`/tasks/${id}/move`, { method: "POST", body: { status: "done" } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mTaskCancel")?.addEventListener("click", async () => {
      const reason = prompt(t("cancel_reason", "Bekor qilish sababi") + ":");
      if (!reason) return;
      await apiFetch(`/tasks/${id}/move`, { method: "POST", body: { status: "canceled", cancel_reason: reason } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mTaskDelete")?.addEventListener("click", async () => {
      const ok = await confirmDialog({
        title: t("delete", "O‘chirish"),
        message: t("delete_confirm", "Haqiqatan o‘chirasizmi?"),
      });
      if (!ok) return;
      await apiFetch(`/tasks/${id}/delete`, { method: "POST" });
      toast(t("deleted", "O‘chirildi"), "ok");
      closeModal();
      navigate();
    });

    applyI18n(modalRoot);
  }

  async function openTaskCreateModal({ onSaved } = {}) {
    const isAdmin = state.me?.role === "admin" || state.me?.role === "rop";
    let users = [];
    if (isAdmin) users = await ensureUsers();

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="field">
        <label class="label">${esc(t("title", "Sarlavha"))}</label>
        <input class="input" id="cTaskTitle" placeholder="${esc(t("optional", "ixtiyoriy"))}" />
      </div>
      <div class="field mt-12">
        <label class="label">${esc(t("description", "Izoh"))}</label>
        <textarea class="textarea" id="cTaskDesc" placeholder="..."></textarea>
      </div>

      <div class="grid grid-2 mt-12">
        <div class="field">
          <label class="label">${esc(t("deadline", "Deadline"))}</label>
          <input class="input" id="cTaskDeadline" placeholder="epoch seconds (optional)" />
        </div>
        <div class="field">
          <label class="label">${esc(t("project_id", "Project ID"))}</label>
          <input class="input" id="cTaskProject" placeholder="id (optional)" />
        </div>
      </div>

      ${
        isAdmin
          ? `<div class="field mt-12">
              <label class="label">${esc(t("assignee", "Mas'ul"))}</label>
              <select class="select" id="cTaskAssignee">
                ${users
                  .map((u) => `<option value="${esc(u.id)}">${esc(u.full_name)} (${esc(u.role)})</option>`)
                  .join("")}
              </select>
            </div>`
          : ""
      }

      <div class="row row-right mt-16">
        <button class="btn btn-primary" type="button" id="cTaskCreate">${esc(t("create", "Yaratish"))}</button>
      </div>
      <div class="alert alert-error mt-12" id="cTaskErr" hidden></div>
    `;

    openModal(wrap, { title: t("new_task", "Yangi vazifa") });

    $("#cTaskCreate")?.addEventListener("click", async () => {
      const title = ($("#cTaskTitle")?.value || "").trim();
      const description = ($("#cTaskDesc")?.value || "").trim();
      const deadline_at = ($("#cTaskDeadline")?.value || "").trim();
      const project_id = ($("#cTaskProject")?.value || "").trim();
      const assignee_user_id = isAdmin ? Number($("#cTaskAssignee")?.value || 0) : state.me.id;

      const errEl = $("#cTaskErr");
      const fail = (m) => {
        if (!errEl) return;
        errEl.hidden = false;
        errEl.textContent = m;
      };

      if (!description) return fail(t("desc_required", "Izoh majburiy"));

      try {
        await apiFetch("/tasks", {
          method: "POST",
          body: {
            title: title || null,
            description,
            assignee_user_id,
            deadline_at: deadline_at ? Number(deadline_at) : null,
            project_id: project_id ? Number(project_id) : null,
          },
        });
        toast(t("created", "Yaratildi"), "ok");
        closeModal();
        onSaved?.();
      } catch (e) {
        fail(String(e.message || e));
      }
    });

    applyI18n(modalRoot);
  }

  // ---------------------------
  // PROJECTS (kanban)
  // ---------------------------
  const PROJECT_COLS = [
    { key: "new", title: "New" },
    { key: "tz_given", title: "TZ" },
    { key: "offer_given", title: "Offer" },
    { key: "in_progress", title: "In progress" },
    { key: "later", title: "Later" },
    { key: "done", title: "Done" },
    { key: "canceled", title: "Canceled" },
  ];

  function projectCardEl(p) {
    const el = document.createElement("div");
    el.className = "kb-card";
    el.draggable = true;
    el.dataset.id = p.id;

    const svc = p.service_name_uz || p.service_name_ru || p.service_name_en || "";
    const deadline = p.deadline_at ? fmtDateOnly(p.deadline_at) : "—";
    const meeting = p.meeting_at ? fmtDateOnly(p.meeting_at) : "—";
    const amount = p.amount != null ? `${p.amount} ${p.currency || ""}` : "";

    el.innerHTML = `
      <div class="kb-card__top">
        <div class="kb-card__title">${esc(p.company_name || "")}</div>
        <div class="kb-card__badge pill">${esc(p.status)}</div>
      </div>
      <div class="kb-card__desc">${esc(svc)}</div>
      <div class="kb-card__meta muted small">
        ${esc(t("pm", "PM"))}: ${esc(p.pm_name || "")}
      </div>
      <div class="kb-card__bottom">
        <div class="muted small">📍 ${esc(t("meeting", "Uchrashuv"))}: ${esc(meeting)}</div>
        <div class="muted small">📅 ${esc(t("deadline", "Deadline"))}: ${esc(deadline)}</div>
      </div>
      ${amount ? `<div class="kb-card__foot"><div class="pill pill--green">${esc(amount)}</div></div>` : ""}
    `;

    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", String(p.id));
      e.dataTransfer.setData("text/projectId", String(p.id));
    });
    el.addEventListener("click", () => openProjectModal(p.id));
    return el;
  }

  async function renderProjects() {
    setTitle("projects");
    if (!viewRoot) return;

    const role = state.me?.role;
    const canCreate = role === "admin" || role === "rop" || role === "pm";

    viewRoot.innerHTML = `
      <div class="card">
        <div class="row row-between row-wrap">
          <div class="h2">${esc(t("menu_projects", "Loyihalar"))}</div>
          <div class="row row-gap">
            ${canCreate ? `<button class="btn btn-primary" type="button" id="projectNewBtn">+ ${esc(t("new_project", "Yangi loyiha"))}</button>` : ""}
          </div>
        </div>

        <div class="filters mt-12">
          <div class="field">
            <label class="label">${esc(t("search", "Qidirish"))}</label>
            <input class="input" id="prSearch" placeholder="${esc(t("search_placeholder", "Matn..."))}" />
          </div>
          <div class="field">
            <label class="label">${esc(t("show_done", "Done/Canceled"))}</label>
            <select class="select" id="prShowDone">
              <option value="0">${esc(t("hide", "Yashirish"))}</option>
              <option value="1">${esc(t("show", "Ko‘rsatish"))}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-16">
        ${kanbanSkeleton(
          PROJECT_COLS.map((c) => ({
            key: c.key,
            title:
              c.key === "new"
                ? t("st_new", "Yangi")
                : c.key === "tz_given"
                ? t("st_tz", "TZ berilgan")
                : c.key === "offer_given"
                ? t("st_offer", "Offer berilgan")
                : c.key === "in_progress"
                ? t("st_in_progress", "Jarayonda")
                : c.key === "later"
                ? t("st_later", "Keyin")
                : c.key === "done"
                ? t("st_done", "Yakunlangan")
                : t("st_canceled", "Bekor"),
          }))
        )}
      </div>
    `;

    applyI18n(viewRoot);

    const searchEl = $("#prSearch");
    const showDoneEl = $("#prShowDone");

    const reload = async () => {
      const res = await apiFetch("/projects");
      let items = res.data || [];

      const q = (searchEl?.value || "").trim().toLowerCase();
      const showDone = (showDoneEl?.value || "0") === "1";
      if (q) {
        items = items.filter((x) => {
          return (
            String(x.company_name || "").toLowerCase().includes(q) ||
            String(x.pm_name || "").toLowerCase().includes(q) ||
            String(x.service_name_uz || x.service_name_ru || x.service_name_en || "").toLowerCase().includes(q)
          );
        });
      }
      if (!showDone) items = items.filter((x) => x.status !== "done" && x.status !== "canceled");

      PROJECT_COLS.forEach((c) => {
        const body = $(`[data-col="${c.key}"] [data-drop="${c.key}"]`);
        if (body) body.innerHTML = "";
        const cnt = $(`[data-count="${c.key}"]`);
        if (cnt) cnt.textContent = "0";
      });

      const grouped = new Map();
      PROJECT_COLS.forEach((c) => grouped.set(c.key, []));
      items.forEach((it) => grouped.get(it.status)?.push(it));

      PROJECT_COLS.forEach((c) => {
        const arr = grouped.get(c.key) || [];
        const body = $(`[data-drop="${c.key}"]`);
        const cnt = $(`[data-count="${c.key}"]`);
        if (cnt) cnt.textContent = String(arr.length);
        if (body) arr.forEach((p) => body.appendChild(projectCardEl(p)));
      });

      bindDnD({
        onDropStatus: async (id, status) => {
          if (status === "canceled") {
            const reason = prompt(t("cancel_reason", "Bekor qilish sababi") + ":");
            if (!reason) return;
            await apiFetch(`/projects/${id}/move`, { method: "POST", body: { status, cancel_reason: reason } });
            toast(t("saved", "Saqlandi"), "ok");
            await reload();
            return;
          }
          await apiFetch(`/projects/${id}/move`, { method: "POST", body: { status } });
          toast(t("saved", "Saqlandi"), "ok");
          await reload();
        },
      });
    };

    searchEl?.addEventListener("input", () => {
      clearTimeout(searchEl._t);
      searchEl._t = setTimeout(reload, 250);
    });
    showDoneEl?.addEventListener("change", reload);
    $("#projectNewBtn")?.addEventListener("click", () => toast(t("coming_soon", "Tez kunda"), "info"));

    await reload();
  }

  async function openProjectModal(id) {
    const res = await apiFetch(`/projects/${id}`);
    const p = res.data;

    const svc = p.service_name_uz || p.service_name_ru || p.service_name_en || "";

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="kv">
        <div class="kv__row"><div class="kv__k">ID</div><div class="kv__v">#${esc(p.id)}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("status", "Status"))}</div><div class="kv__v"><span class="pill">${esc(p.status)}</span></div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("company", "Kompaniya"))}</div><div class="kv__v">${esc(p.company_name || "")}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("service", "Xizmat"))}</div><div class="kv__v">${esc(svc)}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("pm", "PM"))}</div><div class="kv__v">${esc(p.pm_name || "")}</div></div>
      </div>

      <div class="divider mt-12"></div>

      <div class="grid grid-2 mt-12">
        <div class="field">
          <label class="label">${esc(t("meeting", "Uchrashuv"))}</label>
          <input class="input" id="mPrMeeting" value="${esc(p.meeting_at || "")}" placeholder="epoch seconds" />
        </div>
        <div class="field">
          <label class="label">${esc(t("deadline", "Deadline"))}</label>
          <input class="input" id="mPrDeadline" value="${esc(p.deadline_at || "")}" placeholder="epoch seconds" />
        </div>
      </div>

      <div class="field mt-12">
        <label class="label">${esc(t("comment", "Izoh"))}</label>
        <textarea class="textarea" id="mPrComment">${esc(p.comment || "")}</textarea>
      </div>

      <div class="row row-between mt-16 row-wrap">
        <div class="row row-gap">
          <button class="btn btn-ghost" type="button" id="mPrLater">${esc(t("to_later", "Keyin"))}</button>
          <button class="btn btn-primary" type="button" id="mPrStart">${esc(t("to_in_progress", "Jarayonda"))}</button>
          <button class="btn btn-ghost" type="button" id="mPrDone">${esc(t("to_done", "Done"))}</button>
          <button class="btn btn-danger" type="button" id="mPrCancel">${esc(t("to_cancel", "Bekor"))}</button>
        </div>
        <div class="row row-gap">
          <button class="btn btn-primary" type="button" id="mPrSave">${esc(t("save", "Saqlash"))}</button>
        </div>
      </div>
    `;

    openModal(wrap, { title: t("project", "Loyiha") + ` #${id}` });

    $("#mPrSave")?.addEventListener("click", async () => {
      await apiFetch(`/projects/${id}`, {
        method: "PUT",
        body: {
          meeting_at: ($("#mPrMeeting")?.value || "").trim() ? Number($("#mPrMeeting").value) : null,
          deadline_at: ($("#mPrDeadline")?.value || "").trim() ? Number($("#mPrDeadline").value) : null,
          comment: ($("#mPrComment")?.value || "").trim() || null,
        },
      });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mPrStart")?.addEventListener("click", async () => {
      await apiFetch(`/projects/${id}/move`, { method: "POST", body: { status: "in_progress" } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mPrLater")?.addEventListener("click", async () => {
      await apiFetch(`/projects/${id}/move`, { method: "POST", body: { status: "later" } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mPrDone")?.addEventListener("click", async () => {
      await apiFetch(`/projects/${id}/move`, { method: "POST", body: { status: "done" } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mPrCancel")?.addEventListener("click", async () => {
      const reason = prompt(t("cancel_reason", "Bekor qilish sababi") + ":");
      if (!reason) return;
      await apiFetch(`/projects/${id}/move`, { method: "POST", body: { status: "canceled", cancel_reason: reason } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    applyI18n(modalRoot);
  }

  // ---------------------------
  // COURSES (course_leads kanban) — admin/rop/sale
  // ---------------------------
  const COURSE_COLS = [
    { key: "new", title: "New" },
    { key: "need_call", title: "Need call" },
    { key: "thinking", title: "Thinking" },
    { key: "enrolled", title: "Enrolled" },
    { key: "studying", title: "Studying" },
    { key: "canceled", title: "Canceled" },
  ];

  function courseCardEl(x) {
    const el = document.createElement("div");
    el.className = "kb-card";
    el.draggable = true;
    el.dataset.id = x.id;

    const amount = x.paid_amount != null ? `${x.paid_amount}` : "";
    el.innerHTML = `
      <div class="kb-card__top">
        <div class="kb-card__title">${esc(x.lead_full_name || "")}</div>
        <div class="kb-card__badge pill">${esc(x.status)}</div>
      </div>
      <div class="kb-card__desc">${esc(x.course_type_name || "")}</div>
      <div class="kb-card__meta muted small">${esc(x.company_name || "")}</div>
      ${amount ? `<div class="kb-card__foot"><div class="pill pill--green">${esc(t("paid", "Paid"))}: ${esc(amount)}</div></div>` : ""}
    `;

    el.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", String(x.id));
      e.dataTransfer.setData("text/courseLeadId", String(x.id));
    });
    el.addEventListener("click", () => openCourseLeadModal(x.id));
    return el;
  }

  async function renderCourses() {
    setTitle("courses");
    if (!viewRoot) return;

    const role = state.me?.role;
    if (!(role === "admin" || role === "rop" || role === "sale")) {
      viewRoot.innerHTML = `<div class="card"><div class="h2">${esc(t("forbidden", "Ruxsat yo‘q"))}</div></div>`;
      return;
    }

    // We can load course_types only if admin via /settings/all.
    // If you're sale/rop and need types, easiest is: make admin open settings once OR extend API later.
    await ensureSettingsAllIfAdmin();

    viewRoot.innerHTML = `
      <div class="card">
        <div class="row row-between row-wrap">
          <div class="h2">${esc(t("menu_courses", "Kurslar"))}</div>
          <div class="row row-gap">
            <button class="btn btn-primary" type="button" id="courseNewBtn">+ ${esc(t("new_lead", "Yangi lead"))}</button>
          </div>
        </div>

        <div class="filters mt-12">
          <div class="field">
            <label class="label">${esc(t("search", "Qidirish"))}</label>
            <input class="input" id="crSearch" placeholder="${esc(t("search_placeholder", "Matn..."))}" />
          </div>
          <div class="field">
            <label class="label">${esc(t("show_canceled", "Canceled"))}</label>
            <select class="select" id="crShowCanceled">
              <option value="0">${esc(t("hide", "Yashirish"))}</option>
              <option value="1">${esc(t("show", "Ko‘rsatish"))}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-16">
        ${kanbanSkeleton(
          COURSE_COLS.map((c) => ({
            key: c.key,
            title:
              c.key === "new"
                ? t("st_new", "Yangi")
                : c.key === "need_call"
                ? t("st_need_call", "Qo‘ng‘iroq kerak")
                : c.key === "thinking"
                ? t("st_thinking", "O‘ylayapti")
                : c.key === "enrolled"
                ? t("st_enrolled", "Yozildi")
                : c.key === "studying"
                ? t("st_studying", "O‘qiyapti")
                : t("st_canceled", "Bekor"),
          }))
        )}
      </div>
    `;

    applyI18n(viewRoot);

    const searchEl = $("#crSearch");
    const showCanceledEl = $("#crShowCanceled");

    const reload = async () => {
      const res = await apiFetch("/course_leads");
      let items = res.data || [];

      const q = (searchEl?.value || "").trim().toLowerCase();
      const showCanceled = (showCanceledEl?.value || "0") === "1";
      if (q) {
        items = items.filter((x) => {
          return (
            String(x.lead_full_name || "").toLowerCase().includes(q) ||
            String(x.lead_phone1 || "").toLowerCase().includes(q) ||
            String(x.company_name || "").toLowerCase().includes(q) ||
            String(x.course_type_name || "").toLowerCase().includes(q)
          );
        });
      }
      if (!showCanceled) items = items.filter((x) => x.status !== "canceled");

      COURSE_COLS.forEach((c) => {
        const body = $(`[data-col="${c.key}"] [data-drop="${c.key}"]`);
        if (body) body.innerHTML = "";
        const cnt = $(`[data-count="${c.key}"]`);
        if (cnt) cnt.textContent = "0";
      });

      const grouped = new Map();
      COURSE_COLS.forEach((c) => grouped.set(c.key, []));
      items.forEach((it) => grouped.get(it.status)?.push(it));

      COURSE_COLS.forEach((c) => {
        const arr = grouped.get(c.key) || [];
        const body = $(`[data-drop="${c.key}"]`);
        const cnt = $(`[data-count="${c.key}"]`);
        if (cnt) cnt.textContent = String(arr.length);
        if (body) arr.forEach((x) => body.appendChild(courseCardEl(x)));
      });

      bindDnD({
        onDropStatus: async (id, status) => {
          if (status === "canceled") {
            const reason = prompt(t("cancel_reason", "Bekor qilish sababi") + ":");
            if (!reason) return;
            await apiFetch(`/course_leads/${id}/move`, { method: "POST", body: { status, cancel_reason: reason } });
            toast(t("saved", "Saqlandi"), "ok");
            await reload();
            return;
          }

          // enrolled/studying require paid_amount in API
          if (status === "enrolled" || status === "studying") {
            const paid = prompt(t("paid_amount_required", "Paid amount kiriting") + ":");
            if (!paid) return;
            await apiFetch(`/course_leads/${id}/move`, { method: "POST", body: { status, paid_amount: Number(paid) } });
            toast(t("saved", "Saqlandi"), "ok");
            await reload();
            return;
          }

          await apiFetch(`/course_leads/${id}/move`, { method: "POST", body: { status } });
          toast(t("saved", "Saqlandi"), "ok");
          await reload();
        },
      });
    };

    searchEl?.addEventListener("input", () => {
      clearTimeout(searchEl._t);
      searchEl._t = setTimeout(reload, 250);
    });
    showCanceledEl?.addEventListener("change", reload);
    $("#courseNewBtn")?.addEventListener("click", () => toast(t("coming_soon", "Tez kunda"), "info"));

    await reload();
  }

  async function openCourseLeadModal(id) {
    const res = await apiFetch(`/course_leads/${id}`);
    const x = res.data;

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="kv">
        <div class="kv__row"><div class="kv__k">ID</div><div class="kv__v">#${esc(x.id)}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("status", "Status"))}</div><div class="kv__v"><span class="pill">${esc(x.status)}</span></div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("lead", "Lead"))}</div><div class="kv__v">${esc(x.lead_full_name || "")} (${esc(x.lead_phone1 || "")})</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("company", "Kompaniya"))}</div><div class="kv__v">${esc(x.company_name || "—")}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("course", "Kurs"))}</div><div class="kv__v">${esc(x.course_type_name || "")}</div></div>
      </div>

      <div class="divider mt-12"></div>

      <div class="grid grid-2 mt-12">
        <div class="field">
          <label class="label">${esc(t("agreed", "Kelishilgan"))}</label>
          <input class="input" id="mCrAgreed" value="${esc(x.agreed_amount ?? "")}" />
        </div>
        <div class="field">
          <label class="label">${esc(t("paid", "Paid"))}</label>
          <input class="input" id="mCrPaid" value="${esc(x.paid_amount ?? "")}" />
        </div>
      </div>

      <div class="field mt-12">
        <label class="label">${esc(t("comment", "Izoh"))}</label>
        <textarea class="textarea" id="mCrComment">${esc(x.comment || "")}</textarea>
      </div>

      <div class="row row-between mt-16 row-wrap">
        <div class="row row-gap">
          <button class="btn btn-primary" type="button" id="mCrSave">${esc(t("save", "Saqlash"))}</button>
        </div>
        <div class="row row-gap">
          <button class="btn btn-danger" type="button" id="mCrCancel">${esc(t("to_cancel", "Bekor"))}</button>
          <button class="btn btn-ghost" type="button" id="mCrDelete">${esc(t("delete", "O‘chirish"))}</button>
        </div>
      </div>
    `;

    openModal(wrap, { title: t("lead", "Lead") + ` #${id}` });

    $("#mCrSave")?.addEventListener("click", async () => {
      await apiFetch(`/course_leads/${id}`, {
        method: "PUT",
        body: {
          agreed_amount: ($("#mCrAgreed")?.value || "").trim() ? Number($("#mCrAgreed").value) : null,
          paid_amount: ($("#mCrPaid")?.value || "").trim() ? Number($("#mCrPaid").value) : null,
          comment: ($("#mCrComment")?.value || "").trim() || null,
        },
      });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mCrCancel")?.addEventListener("click", async () => {
      const reason = prompt(t("cancel_reason", "Bekor qilish sababi") + ":");
      if (!reason) return;
      await apiFetch(`/course_leads/${id}/move`, { method: "POST", body: { status: "canceled", cancel_reason: reason } });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mCrDelete")?.addEventListener("click", async () => {
      const ok = await confirmDialog({
        title: t("delete", "O‘chirish"),
        message: t("delete_confirm", "Haqiqatan o‘chirasizmi?"),
      });
      if (!ok) return;
      await apiFetch(`/course_leads/${id}/delete`, { method: "POST" });
      toast(t("deleted", "O‘chirildi"), "ok");
      closeModal();
      navigate();
    });

    applyI18n(modalRoot);
  }

  // ---------------------------
  // CLIENTS
  // ---------------------------
  async function renderClients() {
    setTitle("clients");
    if (!viewRoot) return;

    const role = state.me?.role;
    if (role === "fin") {
      viewRoot.innerHTML = `<div class="card"><div class="h2">${esc(t("forbidden", "Ruxsat yo‘q"))}</div></div>`;
      return;
    }

    viewRoot.innerHTML = `
      <div class="card">
        <div class="row row-between row-wrap">
          <div class="h2">${esc(t("menu_clients", "Klientlar"))}</div>
          <div class="row row-gap">
            <button class="btn btn-primary" type="button" id="clNewBtn">+ ${esc(t("create", "Yaratish"))}</button>
          </div>
        </div>

        <div class="tabs mt-12">
          <button class="tab is-active" type="button" data-tab="company">${esc(t("company", "Kompaniya"))}</button>
          <button class="tab" type="button" data-tab="lead">${esc(t("lead", "Lead"))}</button>
        </div>

        <div class="filters mt-12">
          <div class="field">
            <label class="label">${esc(t("search", "Qidirish"))}</label>
            <input class="input" id="clSearch" placeholder="${esc(t("search_placeholder", "Matn..."))}" />
          </div>
        </div>
      </div>

      <div class="card mt-16">
        <div class="table-wrap">
          <table class="table" id="clTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>${esc(t("name", "Nomi"))}</th>
                <th>${esc(t("phone", "Telefon"))}</th>
                <th>${esc(t("comment", "Izoh"))}</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    `;
    applyI18n(viewRoot);

    let tab = "company";
    const tabBtns = $$("[data-tab]");
    tabBtns.forEach((b) =>
      b.addEventListener("click", async () => {
        tabBtns.forEach((x) => x.classList.toggle("is-active", x === b));
        tab = b.getAttribute("data-tab");
        await reload();
      })
    );

    const searchEl = $("#clSearch");
    const tbody = $("#clTable tbody");

    const reload = async () => {
      const res = await apiFetch(`/clients?type=${encodeURIComponent(tab)}`);
      let rows = res.data || [];
      const q = (searchEl?.value || "").trim().toLowerCase();
      if (q) {
        rows = rows.filter((x) => {
          return (
            String(x.company_name || "").toLowerCase().includes(q) ||
            String(x.full_name || "").toLowerCase().includes(q) ||
            String(x.phone1 || "").toLowerCase().includes(q)
          );
        });
      }
      tbody.innerHTML = rows
        .map((x) => {
          const nm = tab === "company" ? (x.company_name || x.full_name || "") : (x.full_name || "");
          return `
            <tr data-open="${esc(x.id)}">
              <td>#${esc(x.id)}</td>
              <td>${esc(nm)}</td>
              <td>${esc(x.phone1 || "")}</td>
              <td class="muted">${esc(x.comment || "")}</td>
            </tr>
          `;
        })
        .join("");

      $$("tr[data-open]", tbody).forEach((tr) => {
        tr.addEventListener("click", () => openClientModal(Number(tr.getAttribute("data-open"))));
      });
    };

    searchEl?.addEventListener("input", () => {
      clearTimeout(searchEl._t);
      searchEl._t = setTimeout(reload, 250);
    });

    $("#clNewBtn")?.addEventListener("click", () => toast(t("coming_soon", "Tez kunda"), "info"));

    await reload();
  }

  async function openClientModal(id) {
    const res = await apiFetch(`/clients/${id}`);
    const d = res.data;
    const c = d.client;

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="kv">
        <div class="kv__row"><div class="kv__k">ID</div><div class="kv__v">#${esc(c.id)}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("type", "Turi"))}</div><div class="kv__v">${esc(c.type)}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("name", "Nomi"))}</div><div class="kv__v">${esc(c.company_name || c.full_name || "")}</div></div>
        <div class="kv__row"><div class="kv__k">${esc(t("phone", "Telefon"))}</div><div class="kv__v">${esc(c.phone1 || "")}</div></div>
        ${c.phone2 ? `<div class="kv__row"><div class="kv__k">${esc(t("phone2", "Telefon 2"))}</div><div class="kv__v">${esc(c.phone2)}</div></div>` : ""}
      </div>

      <div class="field mt-12">
        <label class="label">${esc(t("comment", "Izoh"))}</label>
        <textarea class="textarea" id="mClComment">${esc(c.comment || "")}</textarea>
      </div>

      <div class="row row-between mt-16 row-wrap">
        <button class="btn btn-primary" type="button" id="mClSave">${esc(t("save", "Saqlash"))}</button>
        <button class="btn btn-danger" type="button" id="mClDelete">${esc(t("delete", "O‘chirish"))}</button>
      </div>

      ${
        c.type === "company"
          ? `
        <div class="divider mt-16"></div>
        <div class="h3">${esc(t("projects", "Loyihalar"))}</div>
        <div class="list mt-8">
          ${(d.projects || [])
            .map((p) => `<div class="mini-row">#${esc(p.id)} • ${esc(p.status)} • ${esc(p.service_name_uz || p.service_name_ru || p.service_name_en || "")}</div>`)
            .join("") || `<div class="muted">${esc(t("empty", "Bo‘sh"))}</div>`}
        </div>

        <div class="divider mt-16"></div>
        <div class="h3">${esc(t("course_leads", "Kurs leadlari"))}</div>
        <div class="list mt-8">
          ${(d.course_leads || [])
            .map((x) => `<div class="mini-row">#${esc(x.id)} • ${esc(x.status)} • ${esc(x.course_type_name || "")} • ${esc(x.lead_full_name || "")}</div>`)
            .join("") || `<div class="muted">${esc(t("empty", "Bo‘sh"))}</div>`}
        </div>
      `
          : ""
      }
    `;

    openModal(wrap, { title: t("client", "Klient") + ` #${id}` });

    $("#mClSave")?.addEventListener("click", async () => {
      await apiFetch(`/clients/${id}`, {
        method: "PUT",
        body: { comment: ($("#mClComment")?.value || "").trim() || null },
      });
      toast(t("saved", "Saqlandi"), "ok");
      closeModal();
      navigate();
    });

    $("#mClDelete")?.addEventListener("click", async () => {
      const ok = await confirmDialog({
        title: t("delete", "O‘chirish"),
        message: t("delete_confirm", "Haqiqatan o‘chirasizmi?"),
      });
      if (!ok) return;
      await apiFetch(`/clients/${id}/delete`, { method: "POST" });
      toast(t("deleted", "O‘chirildi"), "ok");
      closeModal();
      navigate();
    });

    applyI18n(modalRoot);
  }

  // ---------------------------
  // SETTINGS (admin only)
  // ---------------------------
  async function renderSettings() {
    setTitle("settings");
    if (!viewRoot) return;

    if (state.me?.role !== "admin") {
      viewRoot.innerHTML = `<div class="card"><div class="h2">${esc(t("forbidden", "Ruxsat yo‘q"))}</div></div>`;
      return;
    }

    const res = await apiFetch("/settings/all");
    const d = res.data || {};
    const theme = d.theme?.value || {};

    const jsonPretty = JSON.stringify(theme, null, 2);

    viewRoot.innerHTML = `
      <div class="card">
        <div class="h2">${esc(t("menu_settings", "Sozlamalar"))}</div>
        <div class="muted mt-8">${esc(t("settings_hint", "Siz bu yerda theme va spravochniklarni boshqarasiz"))}</div>

        <div class="divider mt-16"></div>

        <div class="h3">${esc(t("theme", "Theme"))}</div>
        <div class="field mt-8">
          <label class="label">${esc(t("theme_json", "Theme JSON"))}</label>
          <textarea class="textarea textarea--mono" id="themeJson">${esc(jsonPretty)}</textarea>
        </div>
        <div class="row row-right mt-12">
          <button class="btn btn-primary" type="button" id="themeSaveBtn">${esc(t("save", "Saqlash"))}</button>
        </div>
      </div>

      <div class="card mt-16">
        <div class="h3">${esc(t("dicts", "Spravochniklar"))}</div>
        <div class="muted small mt-6">${esc(t("dicts_hint", "Qo‘shish/tahrirlash/o‘chirish — soft"))}</div>

        <div class="grid grid-2 mt-12">
          ${dictBlock("cities", t("cities", "Shaharlar"), d.dict_cities || [])}
          ${dictBlock("sources", t("sources", "Manbalar"), d.dict_sources || [])}
          ${dictBlock("spheres", t("spheres", "Soha"), d.dict_spheres || [])}
          ${dictBlock("service_types", t("service_types", "Xizmat turlari"), d.service_types || [])}
        </div>

        <div class="divider mt-16"></div>

        <div class="h3">${esc(t("course_types", "Kurs turlari"))}</div>
        <div class="table-wrap mt-8">
          <table class="table" id="ctTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>${esc(t("name", "Nomi"))}</th>
                <th>${esc(t("start_date", "Start"))}</th>
                <th>${esc(t("price", "Narx"))}</th>
                <th>${esc(t("currency", "Valyuta"))}</th>
                <th>${esc(t("sort", "Sort"))}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${(d.course_types || [])
                .map(
                  (x) => `
                <tr>
                  <td>#${esc(x.id)}</td>
                  <td>${esc(x.name)}</td>
                  <td>${esc(x.start_date ? fmtDateOnly(x.start_date) : "—")}</td>
                  <td>${esc(x.price ?? 0)}</td>
                  <td>${esc(x.currency || "UZS")}</td>
                  <td>${esc(x.sort ?? 1000)}</td>
                  <td class="td-actions">
                    <button class="btn btn-ghost btn-sm" data-ct-edit="${esc(x.id)}">${esc(t("edit", "Tahrir"))}</button>
                    <button class="btn btn-ghost btn-sm" data-ct-del="${esc(x.id)}">${esc(t("delete", "O‘chirish"))}</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="row row-right mt-12">
          <button class="btn btn-primary" type="button" id="ctAddBtn">+ ${esc(t("add", "Qo‘shish"))}</button>
        </div>
      </div>
    `;

    applyI18n(viewRoot);

    $("#themeSaveBtn")?.addEventListener("click", async () => {
      try {
        const txt = $("#themeJson")?.value || "{}";
        const obj = JSON.parse(txt);
        await apiFetch("/settings/theme", { method: "PUT", body: obj });
        toast(t("saved", "Saqlandi"), "ok");
        applyThemeFromSettings(obj);
      } catch (e) {
        toast(String(e.message || e), "err", 3400);
      }
    });

    // dict block handlers
    ["cities", "sources", "spheres", "service_types"].forEach((key) => {
      $$(`[data-dict-add="${key}"]`).forEach((b) =>
        b.addEventListener("click", () => openDictModal({ dict: key, onSaved: () => navigate() }))
      );
      $$(`[data-dict-edit="${key}"]`).forEach((b) =>
        b.addEventListener("click", () => openDictModal({ dict: key, id: Number(b.dataset.id), onSaved: () => navigate() }))
      );
      $$(`[data-dict-del="${key}"]`).forEach((b) =>
        b.addEventListener("click", async () => {
          const id = Number(b.dataset.id);
          const ok = await confirmDialog({ title: t("delete", "O‘chirish"), message: t("delete_confirm", "Haqiqatan o‘chirasizmi?") });
          if (!ok) return;
          await apiFetch(`/settings/${key}/${id}/delete`, { method: "POST" });
          toast(t("deleted", "O‘chirildi"), "ok");
          navigate();
        })
      );
    });

    // course types
    $("#ctAddBtn")?.addEventListener("click", () => openCourseTypeModal({ onSaved: () => navigate() }));
        // course types (edit/delete)
    $$("[data-ct-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-ct-edit"));
        openCourseTypeModal({ id, onSaved: () => navigate() });
      });
    });

    $$("[data-ct-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.getAttribute("data-ct-del"));
        const ok = await confirmDialog({
          title: t("delete", "O‘chirish"),
          message: t("delete_confirm", "Haqiqatan o‘chirasizmi?"),
        });
        if (!ok) return;
        await apiFetch(`/settings/course_types/${id}/delete`, { method: "POST" });
        toast(t("deleted", "O‘chirildi"), "ok");
        navigate();
      });
    });
  }

  function dictBlock(dictKey, title, items) {
    return `
      <div class="card card--inner">
        <div class="row row-between row-wrap">
          <div class="h3">${esc(title)}</div>
          <button class="btn btn-primary btn-sm" type="button" data-dict-add="${esc(dictKey)}">+ ${esc(t("add", "Qo‘shish"))}</button>
        </div>
        <div class="list mt-12">
          ${
            (items || []).length
              ? (items || [])
                  .filter((x) => !x.is_deleted)
                  .sort((a, b) => (a.sort ?? 1000) - (b.sort ?? 1000))
                  .map(
                    (x) => `
                      <div class="mini-row">
                        <div class="mini-row__main">
                          <div class="mini-row__title">${esc(x.name)}</div>
                          <div class="mini-row__sub muted small">#${esc(x.id)} • sort: ${esc(x.sort ?? 1000)} ${x.color ? `• ${esc(x.color)}` : ""}</div>
                        </div>
                        <div class="mini-row__actions">
                          <button class="btn btn-ghost btn-sm" type="button" data-dict-edit="${esc(dictKey)}" data-id="${esc(x.id)}">${esc(t("edit", "Tahrir"))}</button>
                          <button class="btn btn-ghost btn-sm" type="button" data-dict-del="${esc(dictKey)}" data-id="${esc(x.id)}">${esc(t("delete", "O‘chirish"))}</button>
                        </div>
                      </div>
                    `
                  )
                  .join("")
              : `<div class="muted">${esc(t("empty", "Bo‘sh"))}</div>`
          }
        </div>
      </div>
    `;
  }

  function openDictModal({ dict, id = null, onSaved } = {}) {
    const isEdit = !!id;
    const wrap = document.createElement("div");

    wrap.innerHTML = `
      <div class="grid grid-2">
        <div class="field">
          <label class="label">${esc(t("name", "Nomi"))}</label>
          <input class="input" id="dName" />
        </div>
        <div class="field">
          <label class="label">${esc(t("sort", "Sort"))}</label>
          <input class="input" id="dSort" value="1000" />
        </div>
      </div>

      <div class="grid grid-2 mt-12">
        <div class="field">
          <label class="label">${esc(t("color", "Color"))}</label>
          <input class="input" id="dColor" placeholder="#RRGGBB (optional)" />
        </div>
        <div class="field">
          <label class="label">${esc(t("active", "Active"))}</label>
          <select class="select" id="dActive">
            <option value="1">${esc(t("yes", "Ha"))}</option>
            <option value="0">${esc(t("no", "Yo‘q"))}</option>
          </select>
        </div>
      </div>

      <div class="field mt-12">
        <label class="label">${esc(t("final_type", "Final type"))}</label>
        <select class="select" id="dFinalType">
          <option value="">—</option>
          <option value="success">success</option>
          <option value="cancel">cancel</option>
        </select>
        <div class="muted small mt-4">${esc(t("final_type_hint", "Faqat statuslar uchun"))}</div>
      </div>

      <div class="row row-right mt-16">
        <button class="btn btn-primary" type="button" id="dSave">${esc(t("save", "Saqlash"))}</button>
      </div>

      <div class="alert alert-error mt-12" id="dErr" hidden></div>
    `;

    openModal(wrap, { title: isEdit ? t("edit", "Tahrir") : t("add", "Qo‘shish") });

    const errEl = $("#dErr", modalRoot);
    const fail = (m) => {
      if (!errEl) return;
      errEl.hidden = false;
      errEl.textContent = m;
    };

    (async () => {
      if (!isEdit) return;
      try {
        const res = await apiFetch(`/settings/${dict}/${id}`);
        const item = res.data;

        $("#dName", modalRoot).value = item.name || "";
        $("#dSort", modalRoot).value = String(item.sort ?? 1000);
        $("#dColor", modalRoot).value = item.color || "";
        $("#dActive", modalRoot).value = String(item.active ?? 1);
        $("#dFinalType", modalRoot).value = item.final_type || "";
      } catch (e) {
        fail(String(e.message || e));
      }
    })();

    $("#dSave", modalRoot)?.addEventListener("click", async () => {
      try {
        const name = ($("#dName", modalRoot)?.value || "").trim();
        const sort = Number(($("#dSort", modalRoot)?.value || "1000").trim());
        const color = ($("#dColor", modalRoot)?.value || "").trim() || null;
        const active = Number($("#dActive", modalRoot)?.value || "1");
        const final_type = ($("#dFinalType", modalRoot)?.value || "").trim() || null;

        if (!name) return fail(t("name_required", "Nomi majburiy"));

        const body = { name, sort, color, active, final_type };

        if (isEdit) {
          await apiFetch(`/settings/${dict}/${id}`, { method: "PUT", body });
        } else {
          await apiFetch(`/settings/${dict}`, { method: "POST", body });
        }

        toast(t("saved", "Saqlandi"), "ok");
        closeModal();
        onSaved?.();
      } catch (e) {
        fail(String(e.message || e));
      }
    });

    applyI18n(modalRoot);
  }

  function openCourseTypeModal({ id = null, onSaved } = {}) {
    const isEdit = !!id;
    const wrap = document.createElement("div");

    wrap.innerHTML = `
      <div class="grid grid-2">
        <div class="field">
          <label class="label">${esc(t("name", "Nomi"))}</label>
          <input class="input" id="ctName" />
        </div>
        <div class="field">
          <label class="label">${esc(t("start_date", "Start date"))}</label>
          <input class="input" id="ctStart" placeholder="epoch seconds (optional)" />
        </div>
      </div>

      <div class="grid grid-2 mt-12">
        <div class="field">
          <label class="label">${esc(t("price", "Narx"))}</label>
          <input class="input" id="ctPrice" value="0" />
        </div>
        <div class="field">
          <label class="label">${esc(t("currency", "Valyuta"))}</label>
          <input class="input" id="ctCurrency" value="UZS" />
        </div>
      </div>

      <div class="grid grid-2 mt-12">
        <div class="field">
          <label class="label">${esc(t("sort", "Sort"))}</label>
          <input class="input" id="ctSort" value="1000" />
        </div>
        <div class="field">
          <label class="label">${esc(t("active", "Active"))}</label>
          <select class="select" id="ctActive">
            <option value="1">${esc(t("yes", "Ha"))}</option>
            <option value="0">${esc(t("no", "Yo‘q"))}</option>
          </select>
        </div>
      </div>

      <div class="field mt-12">
        <label class="label">${esc(t("note", "Izoh"))}</label>
        <textarea class="textarea" id="ctNote"></textarea>
      </div>

      <div class="row row-right mt-16">
        <button class="btn btn-primary" type="button" id="ctSave">${esc(t("save", "Saqlash"))}</button>
      </div>

      <div class="alert alert-error mt-12" id="ctErr" hidden></div>
    `;

    openModal(wrap, { title: isEdit ? t("edit", "Tahrir") : t("add", "Qo‘shish") });

    const errEl = $("#ctErr", modalRoot);
    const fail = (m) => {
      if (!errEl) return;
      errEl.hidden = false;
      errEl.textContent = m;
    };

    (async () => {
      if (!isEdit) return;
      try {
        const res = await apiFetch(`/settings/course_types/${id}`);
        const x = res.data;

        $("#ctName", modalRoot).value = x.name || "";
        $("#ctStart", modalRoot).value = x.start_date ? String(x.start_date) : "";
        $("#ctPrice", modalRoot).value = String(x.price ?? 0);
        $("#ctCurrency", modalRoot).value = x.currency || "UZS";
        $("#ctSort", modalRoot).value = String(x.sort ?? 1000);
        $("#ctActive", modalRoot).value = String(x.active ?? 1);
        $("#ctNote", modalRoot).value = x.note || "";
      } catch (e) {
        fail(String(e.message || e));
      }
    })();

    $("#ctSave", modalRoot)?.addEventListener("click", async () => {
      try {
        const name = ($("#ctName", modalRoot)?.value || "").trim();
        if (!name) return fail(t("name_required", "Nomi majburiy"));

        const start_date = ($("#ctStart", modalRoot)?.value || "").trim();
        const price = Number(($("#ctPrice", modalRoot)?.value || "0").trim());
        const currency = ($("#ctCurrency", modalRoot)?.value || "UZS").trim();
        const sort = Number(($("#ctSort", modalRoot)?.value || "1000").trim());
        const active = Number($("#ctActive", modalRoot)?.value || "1");
        const note = ($("#ctNote", modalRoot)?.value || "").trim() || null;

        const body = {
          name,
          start_date: start_date ? Number(start_date) : null,
          price,
          currency,
          sort,
          active,
          note,
        };

        if (isEdit) {
          await apiFetch(`/settings/course_types/${id}`, { method: "PUT", body });
        } else {
          await apiFetch(`/settings/course_types`, { method: "POST", body });
        }

        toast(t("saved", "Saqlandi"), "ok");
        closeModal();
        onSaved?.();
      } catch (e) {
        fail(String(e.message || e));
      }
    });

    applyI18n(modalRoot);
  }

  // ---------------------------
  // USERS (admin)
  // ---------------------------
  async function renderUsers() {
    setTitle("users");
    if (!viewRoot) return;

    if (state.me?.role !== "admin") {
      viewRoot.innerHTML = `<div class="card"><div class="h2">${esc(t("forbidden", "Ruxsat yo‘q"))}</div></div>`;
      return;
    }

    const res = await apiFetch("/users");
    const users = res.data || [];

    viewRoot.innerHTML = `
      <div class="card">
        <div class="row row-between row-wrap">
          <div class="h2">${esc(t("menu_users", "Foydalanuvchilar"))}</div>
          <button class="btn btn-primary" type="button" id="uAdd">+ ${esc(t("add", "Qo‘shish"))}</button>
        </div>

        <div class="table-wrap mt-12">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>${esc(t("name", "Nomi"))}</th>
                <th>login</th>
                <th>role</th>
                <th>${esc(t("active", "Active"))}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${users
                .map(
                  (u) => `
                <tr>
                  <td>#${esc(u.id)}</td>
                  <td>${esc(u.full_name || "")}</td>
                  <td>${esc(u.login || "")}</td>
                  <td><span class="pill">${esc(u.role || "")}</span></td>
                  <td>${u.active ? "✅" : "—"}</td>
                  <td class="td-actions">
                    <button class="btn btn-ghost btn-sm" type="button" data-u-edit="${esc(u.id)}">${esc(t("edit", "Tahrir"))}</button>
                    <button class="btn btn-ghost btn-sm" type="button" data-u-del="${esc(u.id)}">${esc(t("delete", "O‘chirish"))}</button>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    applyI18n(viewRoot);

    $("#uAdd")?.addEventListener("click", () => openUserModal({ onSaved: () => navigate() }));

    $$("[data-u-edit]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = Number(b.getAttribute("data-u-edit"));
        openUserModal({ id, onSaved: () => navigate() });
      });
    });

    $$("[data-u-del]").forEach((b) => {
      b.addEventListener("click", async () => {
        const id = Number(b.getAttribute("data-u-del"));
        const ok = await confirmDialog({
          title: t("delete", "O‘chirish"),
          message: t("delete_confirm", "Haqiqatan o‘chirasizmi?"),
        });
        if (!ok) return;
        await apiFetch(`/users/${id}/delete`, { method: "POST" });
        toast(t("deleted", "O‘chirildi"), "ok");
        navigate();
      });
    });
  }

  function openUserModal({ id = null, onSaved } = {}) {
    const isEdit = !!id;
    const wrap = document.createElement("div");

    wrap.innerHTML = `
      <div class="grid grid-2">
        <div class="field">
          <label class="label">full_name</label>
          <input class="input" id="uName" />
        </div>
        <div class="field">
          <label class="label">login</label>
          <input class="input" id="uLogin" />
        </div>
      </div>

      <div class="grid grid-2 mt-12">
        <div class="field">
          <label class="label">role</label>
          <select class="select" id="uRole">
            <option value="admin">admin</option>
            <option value="rop">rop</option>
            <option value="pm">pm</option>
            <option value="fin">fin</option>
            <option value="sale">sale</option>
          </select>
        </div>
        <div class="field">
          <label class="label">${esc(t("active", "Active"))}</label>
          <select class="select" id="uActive">
            <option value="1">${esc(t("yes", "Ha"))}</option>
            <option value="0">${esc(t("no", "Yo‘q"))}</option>
          </select>
        </div>
      </div>

      <div class="field mt-12">
        <label class="label">${esc(t("password", "Parol"))}</label>
        <input class="input" id="uPass" placeholder="${esc(t("optional", "ixtiyoriy"))}" />
        <div class="muted small mt-4">${esc(t("pass_hint", "Tahrirda bo‘sh qoldirsang o‘zgarmaydi"))}</div>
      </div>

      <div class="row row-right mt-16">
        <button class="btn btn-primary" type="button" id="uSave">${esc(t("save", "Saqlash"))}</button>
      </div>

      <div class="alert alert-error mt-12" id="uErr" hidden></div>
    `;

    openModal(wrap, { title: isEdit ? t("edit", "Tahrir") : t("add", "Qo‘shish") });

    const errEl = $("#uErr", modalRoot);
    const fail = (m) => {
      if (!errEl) return;
      errEl.hidden = false;
      errEl.textContent = m;
    };

    (async () => {
      if (!isEdit) return;
      try {
        const res = await apiFetch(`/users/${id}`);
        const u = res.data;
        $("#uName", modalRoot).value = u.full_name || "";
        $("#uLogin", modalRoot).value = u.login || "";
        $("#uRole", modalRoot).value = u.role || "pm";
        $("#uActive", modalRoot).value = String(u.active ?? 1);
      } catch (e) {
        fail(String(e.message || e));
      }
    })();

    $("#uSave", modalRoot)?.addEventListener("click", async () => {
      try {
        const full_name = ($("#uName", modalRoot)?.value || "").trim();
        const login = ($("#uLogin", modalRoot)?.value || "").trim();
        const role = ($("#uRole", modalRoot)?.value || "pm").trim();
        const active = Number($("#uActive", modalRoot)?.value || "1");
        const password = ($("#uPass", modalRoot)?.value || "").trim() || null;

        if (!full_name) return fail(t("name_required", "Nomi majburiy"));
        if (!login) return fail("login required");

        const body = { full_name, login, role, active, password };

        if (isEdit) await apiFetch(`/users/${id}`, { method: "PUT", body });
        else await apiFetch(`/users`, { method: "POST", body });

        toast(t("saved", "Saqlandi"), "ok");
        closeModal();
        onSaved?.();
      } catch (e) {
        fail(String(e.message || e));
      }
    });

    applyI18n(modalRoot);
  }

  // ---------------------------
  // BOOT
  // ---------------------------
  async function boot() {
    // restore UI prefs
    setLang(getLang());
    setTheme(getTheme());
    setEye(getEye());
    setSidebarCollapsed(getSidebarCollapsed());

    bindLangButtons();
    bindThemeEye();
    bindSidebar();
    startClock();

    try {
      const meRes = await apiFetch("/auth/me");
      state.me = meRes.data;
      setMeUI(state.me);
      await ensureSettingsAllIfAdmin();
      applyI18n();
      await navigate();
    } catch (e) {
      location.href = "/login.html";
    }
  }

  // close modal on ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (confirmRoot && !confirmRoot.hidden) return;
      if (modalRoot && !modalRoot.hidden) closeModal();
      closeSidebarMobile();
    }
  });

  boot();
})();
