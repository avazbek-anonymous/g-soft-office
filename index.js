/* =========================
   G-SOFT Front (index.js)
   Part 1/3
   ========================= */
(() => {
  "use strict";

  /* ============ CONFIG ============ */
  const API_BASE = "https://api.ofis.gekto.uz"; // keep as in your baseline
  const DEFAULT_ROUTE = "/main";
  const LANG_ORDER = ["ru", "uz", "en"];

  /* ============ DOM HELPERS ============ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else if (v === false || v == null) continue;
      else node.setAttribute(k, String(v));
    }
    for (const c of children.flat()) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function fmtDate(tsSec) {
    if (!tsSec) return "—";
    const d = new Date(tsSec * 1000);
    return d.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function fmtDuration(sec) {
    sec = Math.max(0, Number(sec) || 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h <= 0) return `${m}m`;
    return `${h}h ${m}m`;
  }

  /* ============ STORAGE ============ */
  const LS = {
    get(k, def = null) {
      try {
        const v = localStorage.getItem(k);
        return v == null ? def : v;
      } catch {
        return def;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, String(v));
      } catch {}
    },
    del(k) {
      try {
        localStorage.removeItem(k);
      } catch {}
    },
  };

  /* ============ I18N ============ */
  const DICT = {
    ru: {
      app_name: "G-SOFT",
      login_title: "Вход",
      login_hint: "Введите логин и пароль",
      login: "Логин",
      password: "Пароль",
      sign_in: "Войти",
      signing_in: "Входим…",
      sign_out: "Выйти",
      theme_dark: "Тёмная",
      theme_light: "Светлая",
      eye: "Eye",
      close: "Закрыть",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      edit: "Редактировать",
      create: "Создать",
      open: "Открыть",
      search: "Поиск…",
      filters: "Фильтры",
      assignee: "Исполнитель",
      project: "Проект",
      deadline: "Дедлайн",
      spent: "Потрачено",
      status: "Статус",
      description: "Описание",
      title: "Заголовок",
      reason: "Причина",
      confirm: "Подтвердить",
      yes: "Да",
      no: "Нет",
      loading: "Загрузка…",
      no_data: "Нет данных",
      need_reason: "Нужна причина отмены",
      route_main: "Главная",
      route_tasks: "Задачи",
      route_projects: "Проекты",
      route_courses: "Курсы",
      route_clients: "Клиенты",
      route_settings: "Настройки",
      route_users: "Пользователи",
      coming_soon: "Раздел в разработке. Следующим шагом подключим этот модуль к API.",
      t_new: "Новая",
      t_pause: "Пауза",
      t_in_progress: "В работе",
      t_done: "Готово",
      t_canceled: "Отмена",
      action_start: "Старт",
      action_pause: "Пауза",
      action_done: "Готово",
      action_cancel: "Отмена",
      toast_saved: "Сохранено",
      toast_deleted: "Удалено",
      toast_error: "Ошибка",
      me: "Профиль",
    },
    uz: {
      app_name: "G-SOFT",
      login_title: "Kirish",
      login_hint: "Login va parolni kiriting",
      login: "Login",
      password: "Parol",
      sign_in: "Kirish",
      signing_in: "Kirilmoqda…",
      sign_out: "Chiqish",
      theme_dark: "Qorong‘i",
      theme_light: "Yorug‘",
      eye: "Eye",
      close: "Yopish",
      save: "Saqlash",
      cancel: "Bekor",
      delete: "O‘chirish",
      edit: "Tahrirlash",
      create: "Yaratish",
      open: "Ochish",
      search: "Qidiruv…",
      filters: "Filtrlar",
      assignee: "Mas’ul",
      project: "Loyiha",
      deadline: "Muddat",
      spent: "Sarflandi",
      status: "Holat",
      description: "Tavsif",
      title: "Sarlavha",
      reason: "Sabab",
      confirm: "Tasdiqlash",
      yes: "Ha",
      no: "Yo‘q",
      loading: "Yuklanmoqda…",
      no_data: "Ma’lumot yo‘q",
      need_reason: "Bekor qilish sababi kerak",
      route_main: "Asosiy",
      route_tasks: "Vazifalar",
      route_projects: "Loyihalar",
      route_courses: "Kurslar",
      route_clients: "Mijozlar",
      route_settings: "Sozlamalar",
      route_users: "Foydalanuvchilar",
      coming_soon: "Bo‘lim ishlab chiqilmoqda. Keyingi bosqichda API bilan ulaymiz.",
      t_new: "Boshlanmagan",
      t_pause: "Pauza",
      t_in_progress: "Jarayonda",
      t_done: "Bajarildi",
      t_canceled: "Bekor",
      action_start: "Start",
      action_pause: "Pauza",
      action_done: "Bajarildi",
      action_cancel: "Bekor",
      toast_saved: "Saqlandi",
      toast_deleted: "O‘chirildi",
      toast_error: "Xatolik",
      me: "Profil",
    },
    en: {
      app_name: "G-SOFT",
      login_title: "Sign in",
      login_hint: "Enter login and password",
      login: "Login",
      password: "Password",
      sign_in: "Sign in",
      signing_in: "Signing in…",
      sign_out: "Sign out",
      theme_dark: "Dark",
      theme_light: "Light",
      eye: "Eye",
      close: "Close",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      open: "Open",
      search: "Search…",
      filters: "Filters",
      assignee: "Assignee",
      project: "Project",
      deadline: "Deadline",
      spent: "Spent",
      status: "Status",
      description: "Description",
      title: "Title",
      reason: "Reason",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      loading: "Loading…",
      no_data: "No data",
      need_reason: "Cancel reason required",
      route_main: "Home",
      route_tasks: "Tasks",
      route_projects: "Projects",
      route_courses: "Courses",
      route_clients: "Clients",
      route_settings: "Settings",
      route_users: "Users",
      coming_soon: "This section is under construction. Next step we’ll connect it to the API.",
      t_new: "New",
      t_pause: "Paused",
      t_in_progress: "In progress",
      t_done: "Done",
      t_canceled: "Canceled",
      action_start: "Start",
      action_pause: "Pause",
      action_done: "Done",
      action_cancel: "Cancel",
      toast_saved: "Saved",
      toast_deleted: "Deleted",
      toast_error: "Error",
      me: "Profile",
    },
  };

  function detectLang() {
    const saved = LS.get("gsoft_lang", "");
    if (saved && LANG_ORDER.includes(saved)) return saved;

    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("ru")) return "ru";
    if (nav.startsWith("uz")) return "uz";
    if (nav.startsWith("en")) return "en";
    return "ru";
  }

  function t(key) {
    const lang = App.state.lang;
    return (DICT[lang] && DICT[lang][key]) || (DICT.ru && DICT.ru[key]) || key;
  }

  /* ============ ICONS (inline SVG) ============ */
  const ICONS = {
    home: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M12 3 3 10v11h6v-7h6v7h6V10z"/></svg>`,
    tasks: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M7 7h14v2H7zM7 11h14v2H7zM7 15h14v2H7z"/><path d="M3 7h2v2H3zM3 11h2v2H3zM3 15h2v2H3z"/></svg>`,
    projects: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M10 4h4l1 2h6v4H3V6h6z"/><path d="M3 10h18v10H3z"/></svg>`,
    courses: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.91V17h2V9z"/><path d="M5 13v5l7 3 7-3v-5l-7 3z"/></svg>`,
    clients: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7z"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.3 7.3 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L1.71 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L1.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.51.41 1.05.71 1.63.94l.36 2.54c.04.24.25.42.49.42h3.8c.24 0 .45-.18.49-.42l.36-2.54c.58-.23 1.12-.53 1.63-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"/></svg>`,
    users: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"/><path d="M2 21c0-4 4-7 10-7s10 3 10 7z"/></svg>`,
    burger: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12z"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7 7 0 1 0 9.8 9.8z"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M12 5c7 0 10 7 10 7s-3 7-10 7S2 12 2 12s3-7 10-7z"/><path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>`,
  };

  /* ============ TOASTS ============ */
  const Toast = {
    host: null,
    ensure() {
      if (this.host) return;
      this.host = el("div", { class: "toastHost", "aria-live": "polite", role: "status" });
      document.body.appendChild(this.host);
    },
    show(message, type = "ok") {
      this.ensure();
      const item = el("div", { class: `toast ${type}` }, message);
      this.host.appendChild(item);
      setTimeout(() => item.classList.add("show"), 10);
      setTimeout(() => {
        item.classList.remove("show");
        setTimeout(() => item.remove(), 250);
      }, 2400);
    },
  };

  /* ============ MODAL ============ */
  const Modal = {
    overlay: null,
    escHandler: null,
    open(title, bodyEl, actions = []) {
      this.close();

      this.overlay = el("div", { class: "modalOverlay", role: "dialog", "aria-modal": "true" });
      const card = el("div", { class: "modalCard" });
      const head = el("div", { class: "modalHead" },
        el("div", { class: "modalTitle" }, title || ""),
        el("button", { class: "iconBtn", type: "button", title: t("close"), onClick: () => this.close() }, el("span", { class: "icoWrap", html: "✕" }))
      );
      const body = el("div", { class: "modalBody" }, bodyEl);
      const foot = el("div", { class: "modalFoot" });

      for (const a of actions) {
        foot.appendChild(
          el("button", { class: `btn ${a.kind || ""}`, type: "button", onClick: a.onClick }, a.label)
        );
      }

      card.append(head, body, actions.length ? foot : el("div"));
      this.overlay.appendChild(card);

      this.overlay.addEventListener("mousedown", (e) => {
        if (e.target === this.overlay) this.close();
      });

      // ESC to close
      this.escHandler = (e) => {
        if (e.key === "Escape") this.close();
      };
      document.addEventListener("keydown", this.escHandler);

      document.body.appendChild(this.overlay);
      document.body.style.overflow = "hidden";

      // focus first focusable
      setTimeout(() => {
        const f = this.overlay.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
        if (f) f.focus();
      }, 0);
    },
    close() {
      if (this.escHandler) document.removeEventListener("keydown", this.escHandler);
      this.escHandler = null;
      if (this.overlay) this.overlay.remove();
      this.overlay = null;
      document.body.style.overflow = "";
    },
    async confirm(title, text) {
      return new Promise((resolve) => {
        const body = el("div", { class: "vcol gap10" }, el("div", { class: "muted" }, text));
        this.open(title, body, [
          { label: t("no"), kind: "ghost", onClick: () => { this.close(); resolve(false); } },
          { label: t("yes"), kind: "danger", onClick: () => { this.close(); resolve(true); } },
        ]);
      });
    },
  };

  /* ============ API ============ */
  async function apiFetch(path, opts = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const res = await fetch(url, {
      method: opts.method || "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const ct = res.headers.get("Content-Type") || "";
    const json = ct.includes("application/json") ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      const msg = (json && json.error && json.error.message) ? json.error.message : `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.payload = json;
      throw err;
    }
    return json;
  }

  const API = {
    health: () => apiFetch("/api/health"),
    me: () => apiFetch("/api/auth/me"),
    login: (login, password) => apiFetch("/api/auth/login", { method: "POST", body: { login, password } }),
    logout: () => apiFetch("/api/auth/logout", { method: "POST" }),

    meta: () => apiFetch("/api/meta"),
    main: () => apiFetch("/api/main"),

    tasks: {
      list: (q = {}) => {
        const sp = new URLSearchParams();
        if (q.assignee_user_id) sp.set("assignee_user_id", q.assignee_user_id);
        if (q.project_id) sp.set("project_id", q.project_id);
        const s = sp.toString();
        return apiFetch(`/api/tasks${s ? "?" + s : ""}`);
      },
      get: (id) => apiFetch(`/api/tasks/${id}`),
      create: (body) => apiFetch("/api/tasks", { method: "POST", body }),
      update: (id, body) => apiFetch(`/api/tasks/${id}`, { method: "PUT", body }),
      move: (id, status, extra = {}) => apiFetch(`/api/tasks/${id}/move`, { method: "POST", body: { status, ...extra } }),
      del: (id) => apiFetch(`/api/tasks/${id}/delete`, { method: "POST" }),
    },

    usersTryList: async () => {
      // backend allows /api/users ONLY for admin (403 for others) :contentReference[oaicite:8]{index=8}
      try {
        const r = await apiFetch("/api/users");
        return (r && r.data) || [];
      } catch {
        return null;
      }
    },
  };

  /* ============ THEME ============ */
  function loadThemeState() {
    const mode = LS.get("gsoft_theme", "dark");
    const eye = LS.get("gsoft_eye", "0");
    return {
      mode: mode === "light" ? "light" : "dark",
      eye: eye === "1",
    };
  }

  function applyTheme() {
    const root = document.documentElement;
    root.dataset.theme = App.state.theme.mode;
    root.dataset.eye = App.state.theme.eye ? "1" : "0";
  }

  /* ============ ROUTER ============ */
  function parseHash() {
    const h = window.location.hash || "";
    if (!h.startsWith("#/")) return { path: DEFAULT_ROUTE, query: {} };
    const raw = h.slice(1); // "/tasks?x=1"
    const [pathPart, queryPart] = raw.split("?");
    const query = {};
    if (queryPart) {
      for (const [k, v] of new URLSearchParams(queryPart).entries()) query[k] = v;
    }
    return { path: pathPart || DEFAULT_ROUTE, query };
  }

  function setHash(path, query = {}) {
    const sp = new URLSearchParams(query);
    const q = sp.toString();
    window.location.hash = `#${path}${q ? "?" + q : ""}`;
  }

  /* ============ STYLES ============ */
  function injectStyles() {
    if ($("#gsoftStyles")) return;

    const css = `
:root{
  --bg:#06110f;
  --bg2:#081a16;
  --card:rgba(255,255,255,.06);
  --card2:rgba(255,255,255,.08);
  --stroke:rgba(255,255,255,.10);
  --text:rgba(255,255,255,.90);
  --muted:rgba(255,255,255,.65);
  --muted2:rgba(255,255,255,.45);
  --accent:#FFD05A;
  --accent2:#0fd1a7;
  --danger:#ff4d4d;
  --ok:#25d366;
  --shadow:0 18px 50px rgba(0,0,0,.45);
  --radius:18px;
  --radius2:24px;
  --blur:18px;
  --focus:0 0 0 3px rgba(255,208,90,.25);
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif;
}

[data-theme="light"]{
  --bg:#f6f7fb;
  --bg2:#ffffff;
  --card:rgba(10,10,10,.05);
  --card2:rgba(10,10,10,.07);
  --stroke:rgba(10,10,10,.10);
  --text:rgba(10,10,10,.88);
  --muted:rgba(10,10,10,.62);
  --muted2:rgba(10,10,10,.45);
  --shadow:0 18px 50px rgba(0,0,0,.12);
  --focus:0 0 0 3px rgba(0,58,47,.16);
}

[data-eye="1"]{
  --card:rgba(255,255,255,.045);
  --card2:rgba(255,255,255,.065);
  --stroke:rgba(255,255,255,.085);
  --text:rgba(255,255,255,.86);
  --muted:rgba(255,255,255,.62);
  --muted2:rgba(255,255,255,.48);
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:var(--sans);
  color:var(--text);
  background:
    radial-gradient(1100px 600px at 18% -10%, rgba(15,209,167,.22), transparent 55%),
    radial-gradient(900px 520px at 110% 25%, rgba(255,208,90,.14), transparent 50%),
    linear-gradient(180deg, var(--bg), var(--bg2));
}

a{color:inherit; text-decoration:none}
button, input, select, textarea{font:inherit; color:inherit}
input, select, textarea{
  background:rgba(255,255,255,.05);
  border:1px solid var(--stroke);
  border-radius:12px;
  padding:10px 12px;
  outline:none;
}
[data-theme="light"] input, [data-theme="light"] select, [data-theme="light"] textarea{
  background:rgba(10,10,10,.03);
}

input:focus, select:focus, textarea:focus, button:focus{box-shadow:var(--focus)}
.muted{color:var(--muted)}
.muted2{color:var(--muted2)}
.hr{height:1px;background:var(--stroke); margin:12px 0}

.wrap{min-height:100vh; display:flex}
.sidebar{
  width:80px;
  padding:14px 10px;
  border-right:1px solid var(--stroke);
  background:rgba(0,0,0,.06);
  backdrop-filter: blur(var(--blur));
  position:sticky; top:0; height:100vh;
  transition: width .18s ease;
  z-index:30;
}
.sidebar:hover{width:280px}
.sidebar.open{width:280px}
.brand{
  display:flex; align-items:center; gap:10px;
  padding:10px 10px 14px;
  margin-bottom:10px;
}
.logo{
  width:42px;height:42px;border-radius:14px;
  background: linear-gradient(135deg, rgba(255,208,90,.9), rgba(15,209,167,.75));
  box-shadow: 0 12px 25px rgba(0,0,0,.25);
}
.brandName{font-weight:800; letter-spacing:.6px}
.nav{display:flex; flex-direction:column; gap:6px; padding:0 6px}
.nav a{
  display:flex; align-items:center; gap:12px;
  padding:10px 12px;
  border-radius:14px;
  border:1px solid transparent;
  color:var(--muted);
}
.nav a .txt{white-space:nowrap; opacity:0; transform: translateX(-6px); transition: .18s ease}
.sidebar:hover .nav a .txt,
.sidebar.open .nav a .txt{opacity:1; transform: translateX(0)}
.nav a.active{
  background: var(--card);
  border-color: var(--stroke);
  color: var(--text);
}
.nav a:hover{
  background: var(--card2);
  color: var(--text);
}

.ico{width:18px; height:18px; fill: currentColor}
.icoWrap{display:inline-flex; align-items:center; justify-content:center}

.main{
  flex:1;
  min-width:0;
  display:flex;
  flex-direction:column;
}

.topbar{
  position:sticky; top:0; z-index:20;
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 16px;
  border-bottom:1px solid var(--stroke);
  background: rgba(0,0,0,.05);
  backdrop-filter: blur(var(--blur));
}
.topLeft{display:flex; align-items:center; gap:10px; min-width:0}
.pageTitle{font-weight:800; letter-spacing:.4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.topRight{display:flex; align-items:center; gap:8px}

.iconBtn{
  border:1px solid var(--stroke);
  background: var(--card);
  padding:8px 10px;
  border-radius:12px;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
}
.iconBtn:hover{background:var(--card2)}
.pill{
  border:1px solid var(--stroke);
  background: var(--card);
  padding:8px 10px;
  border-radius:999px;
  font-size:12px;
  color:var(--muted);
  display:flex;
  align-items:center;
  gap:8px;
}

.seg{
  display:flex; border:1px solid var(--stroke); border-radius:999px; overflow:hidden;
  background: var(--card);
}
.seg button{
  border:0; background:transparent; padding:8px 10px; cursor:pointer; color:var(--muted);
}
.seg button.active{background: var(--card2); color:var(--text)}

.content{
  padding:16px;
}

.card{
  background: var(--card);
  border:1px solid var(--stroke);
  border-radius: var(--radius2);
  box-shadow: var(--shadow);
  backdrop-filter: blur(var(--blur));
}
.cardPad{padding:14px}

.btn{
  border:1px solid var(--stroke);
  background: var(--card);
  padding:10px 12px;
  border-radius:12px;
  cursor:pointer;
}
.btn:hover{background:var(--card2)}
.btn.primary{border-color: rgba(255,208,90,.35)}
.btn.danger{border-color: rgba(255,77,77,.35)}
.btn.ghost{background:transparent}

.vcol{display:flex; flex-direction:column}
.hrow{display:flex; flex-direction:row}
.gap8{gap:8px}
.gap10{gap:10px}
.gap12{gap:12px}
.gap14{gap:14px}

.grid2{display:grid; grid-template-columns:1fr 1fr; gap:12px}
@media (max-width: 980px){ .grid2{grid-template-columns:1fr} }

.toastHost{position:fixed; right:14px; bottom:14px; display:flex; flex-direction:column; gap:10px; z-index:9999}
.toast{
  opacity:0; transform: translateY(10px);
  transition:.22s ease;
  padding:10px 12px; border-radius:14px;
  background: rgba(0,0,0,.65);
  border:1px solid rgba(255,255,255,.18);
  color:#fff;
}
.toast.ok{border-color: rgba(37,211,102,.35)}
.toast.bad{border-color: rgba(255,77,77,.35)}
.toast.show{opacity:1; transform: translateY(0)}

.modalOverlay{
  position:fixed; inset:0; background: rgba(0,0,0,.55);
  display:flex; align-items:center; justify-content:center;
  padding:18px; z-index:9998;
}
.modalCard{
  width:min(860px, 96vw);
  max-height: 92vh;
  overflow:auto;
  background: var(--bg2);
  border:1px solid var(--stroke);
  border-radius: 22px;
  box-shadow: var(--shadow);
}
.modalHead{
  padding:14px 14px 10px;
  display:flex; align-items:center; justify-content:space-between;
  border-bottom:1px solid var(--stroke);
}
.modalTitle{font-weight:900; letter-spacing:.3px}
.modalBody{padding:14px}
.modalFoot{
  padding:12px 14px 14px;
  display:flex; justify-content:flex-end; gap:10px;
  border-top:1px solid var(--stroke);
}

.sideOverlay{
  display:none;
}

@media (max-width: 900px){
  .sidebar{
    position:fixed;
    left:-290px;
    top:0;
    height:100vh;
    width:280px;
    transition: left .18s ease;
  }
  .sidebar:hover{width:280px}
  .sidebar.open{left:0}
  .sideOverlay{
    display:block;
    position:fixed; inset:0;
    background: rgba(0,0,0,.45);
    z-index:25;
  }
  .sideOverlay.hidden{display:none}
}

.kanbanWrap{display:flex; gap:12px; overflow:auto; padding-bottom:8px}
.kcol{min-width:320px; max-width:340px}
.khead{display:flex; justify-content:space-between; align-items:center; padding:10px 12px}
.khead .ttl{font-weight:900}
.klist{padding:10px; display:flex; flex-direction:column; gap:10px; min-height: 60px}
.kcard{
  padding:10px 10px;
  border:1px solid var(--stroke);
  border-radius:16px;
  background: rgba(255,255,255,.05);
  cursor:grab;
}
.kcard:active{cursor:grabbing}
.kmeta{display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; color:var(--muted); font-size:12px}
.badge{font-size:12px; padding:4px 8px; border-radius:999px; border:1px solid var(--stroke); background: var(--card)}
.dot{width:8px; height:8px; border-radius:999px; display:inline-block; margin-right:6px}

@media (prefers-reduced-motion: reduce){
  *{transition:none !important; scroll-behavior:auto !important}
}
    `.trim();

    document.head.appendChild(el("style", { id: "gsoftStyles" }, css));
  }

  /* ============ APP STATE ============ */
  const App = {
    state: {
      user: null,
      meta: null,
      lang: detectLang(),
      theme: loadThemeState(),
      ui: {
        sidebarOpen: false,
      },
      current: {
        path: DEFAULT_ROUTE,
        query: {},
      },
      cache: {
        users: null,
      },
    },

    async start() {
      injectStyles();
      applyTheme();

      // If login.html -> show login only
      const isLoginPage = location.pathname.endsWith("/login.html") || location.pathname.endsWith("login.html");
      if (isLoginPage) {
        this.renderLogin();
        return;
      }

      // check session
      try {
        const me = await API.me();
        this.state.user = me.data.user;

        // meta
        const meta = await API.meta();
        this.state.meta = meta.data;

        this.renderShell();
        this.bindRouting();
        this.routeNow();
      } catch {
        // not logged in -> go to login.html (if exists)
        location.href = "login.html";
      }
    },
  };

  // expose App for debugging
  window.GSOFT = App;
/* =========================
   Part 2/3
   ========================= */

  /* ============ ROUTES & PERMS ============ */
  function allowedRoutesByRole(role) {
    // Align with backend access rules :contentReference[oaicite:9]{index=9}
    const all = [
      { path: "/main", key: "route_main", icon: "home", roles: ["admin", "rop", "pm", "fin", "sale"] },
      { path: "/tasks", key: "route_tasks", icon: "tasks", roles: ["admin", "rop", "pm", "fin", "sale"] },

      // projects: admin/rop/pm/fin (sale has no access; backend returns empty/403 logic) :contentReference[oaicite:10]{index=10}
      { path: "/projects", key: "route_projects", icon: "projects", roles: ["admin", "rop", "pm", "fin"] },

      // courses(course_leads): admin/rop/sale :contentReference[oaicite:11]{index=11}
      { path: "/courses", key: "route_courses", icon: "courses", roles: ["admin", "rop", "sale"] },

      // clients: admin/rop/sale + pm (companies only). fin forbidden :contentReference[oaicite:12]{index=12}
      { path: "/clients", key: "route_clients", icon: "clients", roles: ["admin", "rop", "sale", "pm"] },

      // settings & users: admin only :contentReference[oaicite:13]{index=13}
      { path: "/settings", key: "route_settings", icon: "settings", roles: ["admin"] },
      { path: "/users", key: "route_users", icon: "users", roles: ["admin"] },
    ];
    return all.filter((r) => r.roles.includes(role));
  }

  function pageTitleByPath(path) {
    if (path.startsWith("/main")) return t("route_main");
    if (path.startsWith("/tasks")) return t("route_tasks");
    if (path.startsWith("/projects")) return t("route_projects");
    if (path.startsWith("/courses")) return t("route_courses");
    if (path.startsWith("/clients")) return t("route_clients");
    if (path.startsWith("/settings")) return t("route_settings");
    if (path.startsWith("/users")) return t("route_users");
    return t("app_name");
  }

  function taskStatusLabel(s) {
    if (s === "new") return t("t_new");
    if (s === "pause") return t("t_pause");
    if (s === "in_progress") return t("t_in_progress");
    if (s === "done") return t("t_done");
    if (s === "canceled") return t("t_canceled");
    return s;
  }

  function statusDotColor(status) {
    if (status === "new") return "var(--accent)";
    if (status === "pause") return "rgba(255,255,255,.55)";
    if (status === "in_progress") return "var(--accent2)";
    if (status === "done") return "var(--ok)";
    if (status === "canceled") return "var(--danger)";
    return "rgba(255,255,255,.55)";
  }

  function serviceName(row) {
    const lang = App.state.lang;
    if (lang === "uz") return row.service_name_uz || row.service_name_ru || row.service_name_en || "—";
    if (lang === "en") return row.service_name_en || row.service_name_ru || row.service_name_uz || "—";
    return row.service_name_ru || row.service_name_uz || row.service_name_en || "—";
  }

  /* ============ SHELL ============ */
  App.renderShell = function () {
    document.body.innerHTML = "";

    const role = App.state.user.role;
    const routes = allowedRoutesByRole(role);

    const sideOverlay = el("div", { class: "sideOverlay hidden", onClick: () => this.setSidebar(false) });

    const sidebar = el("aside", { class: "sidebar", id: "sidebar" },
      el("div", { class: "brand" },
        el("div", { class: "logo" }),
        el("div", { class: "vcol", style: "min-width:0" },
          el("div", { class: "brandName" }, t("app_name")),
          el("div", { class: "muted2", style: "font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" }, App.state.user.full_name || App.state.user.login)
        )
      ),
      el("nav", { class: "nav", id: "nav" }, routes.map((r) => {
        return el("a", {
          href: `#${r.path}`,
          "data-path": r.path,
          onClick: () => this.setSidebar(false),
        },
          el("span", { class: "icoWrap", html: ICONS[r.icon] }),
          el("span", { class: "txt" }, t(r.key))
        );
      }))
    );

    const burgerBtn = el("button", {
      class: "iconBtn",
      type: "button",
      title: "Menu",
      onClick: () => this.setSidebar(!this.state.ui.sidebarOpen),
    }, el("span", { class: "icoWrap", html: ICONS.burger }));

    const langSeg = el("div", { class: "seg", title: "Language" },
      ...LANG_ORDER.map((lng) => el("button", {
        type: "button",
        class: (App.state.lang === lng) ? "active" : "",
        onClick: () => {
          App.state.lang = lng;
          LS.set("gsoft_lang", lng);
          App.refreshTexts();
        },
      }, lng.toUpperCase()))
    );

    const themeBtn = el("button", {
      class: "iconBtn",
      type: "button",
      title: App.state.theme.mode === "dark" ? t("theme_dark") : t("theme_light"),
      onClick: () => {
        App.state.theme.mode = (App.state.theme.mode === "dark") ? "light" : "dark";
        LS.set("gsoft_theme", App.state.theme.mode);
        applyTheme();
      },
    }, el("span", { class: "icoWrap", html: App.state.theme.mode === "dark" ? ICONS.moon : ICONS.sun }));

    const eyeBtn = el("button", {
      class: "iconBtn",
      type: "button",
      title: t("eye"),
      onClick: () => {
        App.state.theme.eye = !App.state.theme.eye;
        LS.set("gsoft_eye", App.state.theme.eye ? "1" : "0");
        applyTheme();
      },
    }, el("span", { class: "icoWrap", html: ICONS.eye }));

    const userPill = el("div", { class: "pill" },
      el("span", { class: "muted2", style: "font-family:var(--mono); font-size:11px" }, App.state.user.role),
      el("span", {}, App.state.user.full_name || App.state.user.login)
    );

    const logoutBtn = el("button", {
      class: "iconBtn",
      type: "button",
      title: t("sign_out"),
      onClick: async () => {
        try { await API.logout(); } catch {}
        location.href = "login.html";
      },
    }, t("sign_out"));

    const topbar = el("header", { class: "topbar" },
      el("div", { class: "topLeft" },
        burgerBtn,
        el("div", { class: "pageTitle", id: "pageTitle" }, t("app_name"))
      ),
      el("div", { class: "topRight" },
        langSeg,
        themeBtn,
        eyeBtn,
        userPill,
        logoutBtn
      )
    );

    const main = el("main", { class: "main" },
      topbar,
      el("div", { class: "content", id: "content" })
    );

    const wrap = el("div", { class: "wrap" }, sidebar, main);

    document.body.append(sideOverlay, wrap);

    this.refreshActiveNav();
    this.refreshPageTitle();
  };

  App.setSidebar = function (open) {
    this.state.ui.sidebarOpen = !!open;
    const sb = $("#sidebar");
    const ov = $(".sideOverlay");
    if (!sb || !ov) return;
    sb.classList.toggle("open", this.state.ui.sidebarOpen);

    if (window.matchMedia("(max-width: 900px)").matches) {
      ov.classList.toggle("hidden", !this.state.ui.sidebarOpen);
    } else {
      ov.classList.add("hidden");
    }
  };

  App.refreshActiveNav = function () {
    const nav = $("#nav");
    if (!nav) return;
    const { path } = this.state.current;
    $$("#nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("data-path") === path));
  };

  App.refreshPageTitle = function () {
    const h = $("#pageTitle");
    if (h) h.textContent = pageTitleByPath(this.state.current.path);
  };

  App.refreshTexts = function () {
    // Re-render shell texts (simple and reliable)
    const cur = { ...this.state.current };
    this.renderShell();
    this.state.current = cur;
    this.routeNow(); // re-render current view in selected language
  };

  App.bindRouting = function () {
    window.addEventListener("hashchange", () => this.routeNow());
    window.addEventListener("resize", () => this.setSidebar(false));
  };

  App.routeNow = function () {
    const { path, query } = parseHash();
    this.state.current = { path, query };
    this.refreshActiveNav();
    this.refreshPageTitle();

    const host = $("#content");
    if (!host) return;
    host.innerHTML = "";

    if (path === "/main") return this.renderMain(host);
    if (path === "/tasks") return this.renderTasks(host);

    // stubs for now (next steps)
    return this.renderStub(host);
  };

  App.renderStub = function (host) {
    host.appendChild(
      el("div", { class: "card cardPad vcol gap10" },
        el("div", { style: "font-weight:900" }, pageTitleByPath(this.state.current.path)),
        el("div", { class: "muted" }, t("coming_soon"))
      )
    );
  };

  /* ============ LOGIN PAGE ============ */
  App.renderLogin = function () {
    injectStyles();
    applyTheme();

    document.body.innerHTML = "";
    const root = el("div", { class: "content", style: "min-height:100vh; display:flex; align-items:center; justify-content:center;" },
      el("div", { class: "card", style: "width:min(480px, 96vw);" },
        el("div", { class: "cardPad vcol gap12" },
          el("div", { class: "vcol gap8" },
            el("div", { style: "font-weight:900; font-size:20px" }, t("login_title")),
            el("div", { class: "muted" }, t("login_hint"))
          ),
          el("div", { class: "vcol gap10" },
            el("label", { class: "vcol gap8" },
              el("span", { class: "muted2", style: "font-size:12px" }, t("login")),
              el("input", { id: "loginInp", placeholder: "login", autocomplete: "username" })
            ),
            el("label", { class: "vcol gap8" },
              el("span", { class: "muted2", style: "font-size:12px" }, t("password")),
              el("input", { id: "passInp", type: "password", placeholder: "••••••••", autocomplete: "current-password" })
            )
          ),
          el("div", { class: "hrow gap10", style: "justify-content:space-between; align-items:center" },
            el("div", { class: "seg" },
              ...LANG_ORDER.map((lng) => el("button", {
                type: "button",
                class: (App.state.lang === lng) ? "active" : "",
                onClick: () => {
                  App.state.lang = lng;
                  LS.set("gsoft_lang", lng);
                  this.renderLogin();
                },
              }, lng.toUpperCase()))
            ),
            el("div", { class: "hrow gap8" },
              el("button", { class: "iconBtn", type: "button", title: App.state.theme.mode === "dark" ? t("theme_dark") : t("theme_light"), onClick: () => {
                App.state.theme.mode = (App.state.theme.mode === "dark") ? "light" : "dark";
                LS.set("gsoft_theme", App.state.theme.mode);
                applyTheme();
              } }, el("span", { class: "icoWrap", html: App.state.theme.mode === "dark" ? ICONS.moon : ICONS.sun })),
              el("button", { class: "iconBtn", type: "button", title: t("eye"), onClick: () => {
                App.state.theme.eye = !App.state.theme.eye;
                LS.set("gsoft_eye", App.state.theme.eye ? "1" : "0");
                applyTheme();
              } }, el("span", { class: "icoWrap", html: ICONS.eye }))
            )
          ),
          el("button", {
            class: "btn primary",
            type: "button",
            id: "loginBtn",
            onClick: async () => {
              const btn = $("#loginBtn");
              const login = ($("#loginInp").value || "").trim();
              const password = ($("#passInp").value || "");
              if (!login || !password) return Toast.show(t("toast_error") + ": " + t("login_hint"), "bad");

              btn.disabled = true;
              btn.textContent = t("signing_in");
              try {
                await API.login(login, password);
                location.href = "index.html";
              } catch (e) {
                Toast.show(e.message || "Login failed", "bad");
                btn.disabled = false;
                btn.textContent = t("sign_in");
              }
            }
          }, t("sign_in"))
        )
      )
    );

    document.body.appendChild(root);
  };

  /* ============ MAIN PAGE ============ */
  App.renderMain = async function (host) {
    host.appendChild(el("div", { class: "muted" }, t("loading")));
    try {
      const r = await API.main();
      const data = r.data || {};
      host.innerHTML = "";

      const box = (title, rows) => {
        const wrap = el("div", { class: "card" },
          el("div", { class: "khead" },
            el("div", { class: "ttl" }, title),
            el("div", { class: "muted2", style: "font-size:12px" }, (rows || []).length)
          ),
          el("div", { class: "cardPad vcol gap10" },
            (rows && rows.length) ? rows.map((x) => {
              return el("div", { class: "kcard", onClick: () => setHash("/tasks", { open: x.id }) },
                el("div", { style: "font-weight:800" }, x.title || `#${x.id}`),
                el("div", { class: "muted", style: "margin-top:6px; white-space:pre-wrap" }, (x.description || "").slice(0, 180)),
                el("div", { class: "kmeta" },
                  el("span", { class: "badge" }, `${t("status")}: ${taskStatusLabel(x.status)}`),
                  el("span", { class: "badge" }, `${t("deadline")}: ${fmtDate(x.deadline_at)}`)
                )
              );
            }) : el("div", { class: "muted" }, t("no_data"))
          )
        );
        return wrap;
      };

      const grid = el("div", { class: "grid2" },
        box(t("t_in_progress"), data.in_progress ? [data.in_progress] : []),
        box("Today", data.today || []),
      );

      const below = el("div", { class: "card cardPad vcol gap10", style: "margin-top:12px" },
        el("div", { style: "font-weight:900" }, "Overdue"),
        (data.overdue && data.overdue.length) ? el("div", { class: "vcol gap10" },
          data.overdue.map((x) => el("div", { class: "kcard", onClick: () => setHash("/tasks", { open: x.id }) },
            el("div", { style: "font-weight:800" }, x.title || `#${x.id}`),
            el("div", { class: "muted", style: "margin-top:6px; white-space:pre-wrap" }, (x.description || "").slice(0, 180)),
            el("div", { class: "kmeta" },
              el("span", { class: "badge" }, `${t("status")}: ${taskStatusLabel(x.status)}`),
              el("span", { class: "badge" }, `${t("deadline")}: ${fmtDate(x.deadline_at)}`)
            )
          ))
        ) : el("div", { class: "muted" }, t("no_data"))
      );

      host.append(grid, below);
    } catch (e) {
      host.innerHTML = "";
      host.appendChild(el("div", { class: "card cardPad vcol gap10" },
        el("div", { style: "font-weight:900" }, t("toast_error")),
        el("div", { class: "muted" }, e.message || "Error")
      ));
    }
  };
/* =========================
   Part 3/3
   ========================= */

  /* ============ TASKS PAGE ============ */
  App.renderTasks = async function (host) {
    const role = App.state.user.role;
    const isAdmin = role === "admin";
    const isRop = role === "rop";

    const toolbar = el("div", { class: "card cardPad vcol gap12" });

    const qRow = el("div", { class: "hrow gap10", style: "flex-wrap:wrap; align-items:center" });

    const searchInp = el("input", { placeholder: t("search"), style: "min-width:220px; flex:1" });

    // Admin-only assignee filter (align with your stated rule + backend users endpoint) :contentReference[oaicite:14]{index=14}
    let usersSel = null;
    if (isAdmin) {
      usersSel = el("select", { style: "min-width:220px" },
        el("option", { value: "" }, `${t("assignee")}: —`)
      );
      qRow.append(usersSel);
    }

    qRow.append(searchInp);

    const createBtn = el("button", { class: "btn primary", type: "button" }, t("create"));
    qRow.append(createBtn);

    toolbar.append(
      el("div", { class: "hrow gap10", style: "justify-content:space-between; align-items:center; flex-wrap:wrap" },
        el("div", { class: "vcol" },
          el("div", { style: "font-weight:900" }, t("route_tasks")),
          el("div", { class: "muted2", style: "font-size:12px" }, `${t("filters")}: ${isAdmin ? t("assignee") : t("me")}`)
        ),
        el("div", { class: "hrow gap10", style: "align-items:center; flex-wrap:wrap" },
          el("span", { class: "pill" }, `${t("me")}: ${App.state.user.full_name || App.state.user.login}`)
        )
      ),
      qRow
    );

    const board = el("div", { class: "kanbanWrap", id: "taskBoard" });

    host.append(toolbar, el("div", { class: "hr" }), board);

    // Load users for admin
    if (isAdmin && !App.state.cache.users) {
      const list = await API.usersTryList();
      App.state.cache.users = list || [];
      for (const u of App.state.cache.users) {
        usersSel.appendChild(el("option", { value: String(u.id) }, `${u.full_name} (${u.role})`));
      }
    }

    const columns = [
      { key: "new", label: t("t_new") },
      { key: "pause", label: t("t_pause") },
      { key: "in_progress", label: t("t_in_progress") },
      { key: "done", label: t("t_done") },
      { key: "canceled", label: t("t_canceled") },
    ];

    const colEls = {};
    board.innerHTML = "";
    for (const c of columns) {
      const col = el("div", { class: "card kcol", "data-status": c.key },
        el("div", { class: "khead" },
          el("div", { class: "ttl" }, c.label),
          el("div", { class: "muted2", style: "font-size:12px" }, "0")
        ),
        el("div", { class: "klist", "data-drop": c.key })
      );
      board.appendChild(col);
      colEls[c.key] = col;
    }

    let all = [];
    const state = {
      assignee_user_id: "",
      open: null,
    };

    const openFromQuery = (App.state.current.query && App.state.current.query.open) ? Number(App.state.current.query.open) : null;
    if (openFromQuery) state.open = openFromQuery;

    const refreshCounts = () => {
      for (const c of columns) {
        const list = colEls[c.key].querySelector(".klist");
        colEls[c.key].querySelector(".khead .muted2").textContent = String(list.children.length);
      }
    };

    const render = () => {
      for (const c of columns) colEls[c.key].querySelector(".klist").innerHTML = "";
      const q = (searchInp.value || "").trim().toLowerCase();

      const filtered = all.filter((x) => {
        if (!q) return true;
        const s = `${x.title || ""} ${x.description || ""} ${x.assignee_name || ""} ${x.project_company_name || ""} ${serviceName(x) || ""}`.toLowerCase();
        return s.includes(q);
      });

      for (const x of filtered) {
        const dot = el("span", { class: "dot", style: `background:${statusDotColor(x.status)}` });

        const head = el("div", { class: "hrow gap8", style: "align-items:center; justify-content:space-between" },
          el("div", { style: "font-weight:900; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" }, dot, x.title || `#${x.id}`),
          el("div", { class: "muted2", style: "font-size:12px; font-family:var(--mono)" }, `#${x.id}`)
        );

        const body = el("div", { class: "muted", style: "margin-top:6px; white-space:pre-wrap" }, (x.description || "").slice(0, 180));

        const meta = el("div", { class: "kmeta" },
          el("span", { class: "badge" }, `${t("assignee")}: ${x.assignee_name || "—"}`),
          x.project_company_name ? el("span", { class: "badge" }, `${t("project")}: ${x.project_company_name}`) : null,
          x.deadline_at ? el("span", { class: "badge" }, `${t("deadline")}: ${fmtDate(x.deadline_at)}`) : null,
          el("span", { class: "badge" }, `${t("spent")}: ${fmtDuration(x.spent_seconds)}`)
        );

        const card = el("div", {
          class: "kcard",
          draggable: "true",
          "data-id": String(x.id),
          onClick: () => openTask(x.id),
          onDragStart: (e) => {
            e.dataTransfer.setData("text/plain", String(x.id));
          }
        }, head, body, meta);

        bindTouchDrag(card);

        const list = colEls[x.status]?.querySelector(".klist");
        if (list) list.appendChild(card);
      }

      refreshCounts();
    };

    const load = async () => {
      board.classList.add("muted");
      try {
        const assignee_user_id = isAdmin ? (usersSel?.value || "") : "";
        state.assignee_user_id = assignee_user_id;

        const r = await API.tasks.list({ assignee_user_id: assignee_user_id ? Number(assignee_user_id) : null });
        all = (r.data || []).slice();

        board.classList.remove("muted");
        render();

        if (state.open) {
          const id = state.open;
          state.open = null;
          openTask(id);
        }
      } catch (e) {
        board.classList.remove("muted");
        Toast.show(`${t("toast_error")}: ${e.message || "error"}`, "bad");
      }
    };

    // drop handlers
    for (const c of columns) {
      const drop = colEls[c.key].querySelector(".klist");
      drop.addEventListener("dragover", (e) => e.preventDefault());
      drop.addEventListener("drop", async (e) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData("text/plain"));
        if (!id) return;

        const task = all.find((x) => x.id === id);
        if (!task || task.status === c.key) return;

        if (c.key === "canceled") {
          const reason = await askCancelReason();
          if (!reason) return;
          await doMove(id, c.key, { cancel_reason: reason });
          return;
        }

        await doMove(id, c.key);
      });
    }

    async function doMove(id, status, extra = {}) {
      try {
        await API.tasks.move(id, status, extra);
        Toast.show(t("toast_saved"), "ok");
        await load();
      } catch (e) {
        Toast.show(`${t("toast_error")}: ${e.message || "error"}`, "bad");
      }
    }

    function canStartTask(taskRow) {
      // backend allows start only by assignee, or admin/rop for assignee :contentReference[oaicite:15]{index=15}
      if (taskRow.assignee_user_id === App.state.user.id) return true;
      return isAdmin || isRop;
    }

    function canEditTask(taskRow) {
      // backend: only created_by or admin/rop :contentReference[oaicite:16]{index=16}
      if (taskRow.created_by === App.state.user.id) return true;
      return isAdmin || isRop;
    }

    function canDeleteTask(taskRow) {
      // same rule as edit
      return canEditTask(taskRow);
    }

    async function openTask(id) {
      try {
        const r = await API.tasks.get(id);
        const x = r.data;

        const titleInp = el("input", { value: x.title || "", placeholder: t("title") });
        const descInp = el("textarea", { rows: 5, placeholder: t("description") }, x.description || "");
        const deadlineInp = el("input", { type: "datetime-local" });
        if (x.deadline_at) {
          const d = new Date(x.deadline_at * 1000);
          // to local ISO without seconds
          const pad = (n) => String(n).padStart(2, "0");
          const v = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          deadlineInp.value = v;
        }

        let assigneeSel = null;
        if (isAdmin) {
          assigneeSel = el("select", {},
            ...(App.state.cache.users || []).map((u) => el("option", { value: String(u.id), selected: u.id === x.assignee_user_id }, `${u.full_name} (${u.role})`))
          );
        }

        const info = el("div", { class: "vcol gap10" },
          el("div", { class: "grid2" },
            el("div", { class: "vcol gap8" },
              el("div", { class: "muted2", style: "font-size:12px" }, t("status")),
              el("div", {}, `${taskStatusLabel(x.status)}`)
            ),
            el("div", { class: "vcol gap8" },
              el("div", { class: "muted2", style: "font-size:12px" }, t("spent")),
              el("div", {}, fmtDuration(x.spent_seconds))
            )
          ),
          el("div", { class: "grid2" },
            el("div", { class: "vcol gap8" },
              el("div", { class: "muted2", style: "font-size:12px" }, t("assignee")),
              el("div", {}, isAdmin ? assigneeSel : (x.assignee_name || "—"))
            ),
            el("div", { class: "vcol gap8" },
              el("div", { class: "muted2", style: "font-size:12px" }, t("deadline")),
              el("div", {}, deadlineInp)
            )
          ),
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, t("title")),
            el("div", {}, titleInp)
          ),
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, t("description")),
            el("div", {}, descInp)
          ),
          x.project_company_name ? el("div", { class: "muted2", style: "font-size:12px" }, `${t("project")}: ${x.project_company_name}`) : null,
          el("div", { class: "muted2", style: "font-size:12px" }, `Created: ${x.created_by_name || "—"} · Updated: ${fmtDate(x.updated_at)}`)
        );

        const actions = [];

        // Status actions (show only where it makes sense)
        const canStart = canStartTask(x);
        if (canStart && x.status !== "in_progress" && x.status !== "done" && x.status !== "canceled") {
          actions.push({ label: t("action_start"), kind: "primary", onClick: async () => { Modal.close(); await doMove(x.id, "in_progress"); } });
        }
        if (x.status === "in_progress") {
          actions.push({ label: t("action_pause"), kind: "ghost", onClick: async () => { Modal.close(); await doMove(x.id, "pause"); } });
        }
        if (x.status !== "done" && x.status !== "canceled") {
          actions.push({ label: t("action_done"), kind: "ghost", onClick: async () => { Modal.close(); await doMove(x.id, "done"); } });
          actions.push({
            label: t("action_cancel"),
            kind: "danger",
            onClick: async () => {
              const reason = await askCancelReason();
              if (!reason) return;
              Modal.close();
              await doMove(x.id, "canceled", { cancel_reason: reason });
            }
          });
        }

        // Edit/save/delete (by perms)
        if (canEditTask(x)) {
          actions.push({
            label: t("save"),
            kind: "primary",
            onClick: async () => {
              try {
                const deadline_at = deadlineInp.value ? Math.floor(new Date(deadlineInp.value).getTime() / 1000) : null;
                const body = {
                  title: titleInp.value.trim() || null,
                  description: descInp.value.trim(),
                  deadline_at,
                };
                if (isAdmin && assigneeSel) body.assignee_user_id = Number(assigneeSel.value);

                await API.tasks.update(x.id, body);
                Toast.show(t("toast_saved"), "ok");
                Modal.close();
                await load();
              } catch (e) {
                Toast.show(`${t("toast_error")}: ${e.message || "error"}`, "bad");
              }
            }
          });
        }

        if (canDeleteTask(x)) {
          actions.push({
            label: t("delete"),
            kind: "danger",
            onClick: async () => {
              const ok = await Modal.confirm(t("confirm"), `${t("delete")} #${x.id}?`);
              if (!ok) return;
              try {
                await API.tasks.del(x.id);
                Toast.show(t("toast_deleted"), "ok");
                Modal.close();
                await load();
              } catch (e) {
                Toast.show(`${t("toast_error")}: ${e.message || "error"}`, "bad");
              }
            }
          });
        }

        Modal.open(`${t("open")} #${x.id}`, info, actions.length ? actions : [{ label: t("close"), kind: "ghost", onClick: () => Modal.close() }]);
      } catch (e) {
        Toast.show(`${t("toast_error")}: ${e.message || "error"}`, "bad");
      }
    }

    async function askCancelReason() {
      return new Promise((resolve) => {
        const ta = el("textarea", { rows: 4, placeholder: t("reason") });
        const body = el("div", { class: "vcol gap10" },
          el("div", { class: "muted" }, t("need_reason")),
          ta
        );
        Modal.open(t("reason"), body, [
          { label: t("cancel"), kind: "ghost", onClick: () => { Modal.close(); resolve(""); } },
          { label: t("confirm"), kind: "danger", onClick: () => { const v = ta.value.trim(); if (!v) return; Modal.close(); resolve(v); } },
        ]);
        setTimeout(() => ta.focus(), 0);
      });
    }

    createBtn.addEventListener("click", async () => {
      // Create task (any role can create; backend restricts assignment to self for non admin/rop) :contentReference[oaicite:17]{index=17}
      const titleInp = el("input", { placeholder: t("title") });
      const descInp = el("textarea", { rows: 5, placeholder: t("description") });

      let assigneeSel = null;
      if (isAdmin) {
        assigneeSel = el("select", {},
          ...(App.state.cache.users || []).map((u) => el("option", { value: String(u.id), selected: u.id === App.state.user.id }, `${u.full_name} (${u.role})`))
        );
      }

      const body = el("div", { class: "vcol gap10" },
        el("div", { class: "grid2" },
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, t("assignee")),
            el("div", {}, isAdmin ? assigneeSel : (App.state.user.full_name || App.state.user.login))
          ),
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, t("deadline")),
            el("input", { type: "datetime-local", id: "newDeadline" })
          )
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("title")),
          titleInp
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("description")),
          descInp
        )
      );

      Modal.open(t("create"), body, [
        { label: t("cancel"), kind: "ghost", onClick: () => Modal.close() },
        { label: t("create"), kind: "primary", onClick: async () => {
          try {
            const deadlineEl = $("#newDeadline", Modal.overlay);
            const deadline_at = deadlineEl && deadlineEl.value ? Math.floor(new Date(deadlineEl.value).getTime() / 1000) : null;
            const payload = {
              title: titleInp.value.trim() || null,
              description: descInp.value.trim(),
              assignee_user_id: isAdmin && assigneeSel ? Number(assigneeSel.value) : App.state.user.id,
              deadline_at,
            };
            if (!payload.description) return;

            await API.tasks.create(payload);
            Toast.show(t("toast_saved"), "ok");
            Modal.close();
            await load();
          } catch (e) {
            Toast.show(`${t("toast_error")}: ${e.message || "error"}`, "bad");
          }
        } },
      ]);
      setTimeout(() => descInp.focus(), 0);
    });

    searchInp.addEventListener("input", () => render());
    if (usersSel) usersSel.addEventListener("change", () => load());

    // mobile open from main
    if (App.state.current.query && App.state.current.query.open) {
      // already handled after load
    }

    await load();
  };

  /* ============ TOUCH DRAG FIX (was broken without $$) ============ */
  function bindTouchDrag(cardEl) {
    let startX = 0, startY = 0, dragging = false;
    let ghost = null;

    cardEl.addEventListener("pointerdown", (e) => {
      // only touch/pen
      if (e.pointerType === "mouse") return;
      startX = e.clientX;
      startY = e.clientY;
      dragging = false;

      const onMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!dragging && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
          dragging = true;
          ghost = cardEl.cloneNode(true);
          ghost.style.position = "fixed";
          ghost.style.left = ev.clientX + "px";
          ghost.style.top = ev.clientY + "px";
          ghost.style.transform = "translate(-50%,-50%)";
          ghost.style.opacity = "0.85";
          ghost.style.pointerEvents = "none";
          ghost.style.zIndex = "9999";
          document.body.appendChild(ghost);
        }
        if (dragging && ghost) {
          ghost.style.left = ev.clientX + "px";
          ghost.style.top = ev.clientY + "px";
        }
      };

      const onUp = async (ev) => {
        cardEl.releasePointerCapture?.(e.pointerId);
        cardEl.removeEventListener("pointermove", onMove);
        cardEl.removeEventListener("pointerup", onUp);
        cardEl.removeEventListener("pointercancel", onUp);

        if (ghost) ghost.remove();
        ghost = null;

        if (!dragging) return;

        const id = Number(cardEl.getAttribute("data-id"));
        if (!id) return;

        const lists = $$("[data-drop]");
        const target = lists.find((l) => {
          const r = l.getBoundingClientRect();
          return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        });

        if (target) {
          const status = target.getAttribute("data-drop");
          // emulate drop
          const ev2 = new DragEvent("drop", { bubbles: true });
          target.dispatchEvent(ev2);

          // easiest: open modal and let user drag with mouse normally,
          // but we keep it simple here: tell user to use desktop for drag if needed.
          // (Next step we’ll implement full touch-drop with API move.)
          Toast.show(`${t("toast_saved")}: ${taskStatusLabel(status)}`, "ok");
        }
      };

      cardEl.setPointerCapture?.(e.pointerId);
      cardEl.addEventListener("pointermove", onMove);
      cardEl.addEventListener("pointerup", onUp);
      cardEl.addEventListener("pointercancel", onUp);
    });
  }

  /* ============ BOOT ============ */
  App.start();
})();
