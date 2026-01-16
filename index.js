/* =========================================================
   G-SOFT Front (single file)
   Fix pack: Header/Menu/Mobile/Design/3 Lang/Theme/Eye
   ========================================================= */
(() => {
  "use strict";

  const API_BASE = "https://api.ofis.gekto.uz";
  const DEFAULT_ROUTE = "/main";
  const LANGS = ["ru", "uz", "en"];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
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
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function fmtDuration(sec) {
    sec = Math.max(0, Number(sec) || 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h <= 0 ? `${m}m` : `${h}h ${m}m`;
  }

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
  };

  const DICT = {
    ru: {
      edit: "Редактировать",
      full_name: "ФИО",
      phone: "Телефон",
      role: "Роль",
      active: "Активен",
      last_login: "Последний вход",
      created_at: "Создан",
      updated_at: "Обновлён",
      new_password: "Новый пароль",
      reset_password: "Сбросить пароль",
      activate: "Активировать",
      deactivate: "Деактивировать",
      users_total: "Всего",
      only_active: "Только активные",
      all_users: "Все пользователи",
      user_create: "Создать пользователя",
      user_created: "Пользователь создан",
      password_changed: "Пароль обновлён",
      user_updated: "Пользователь обновлён",
      user_deactivated: "Пользователь деактивирован",
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
      create: "Создать",
      open: "Открыть",
      search: "Поиск…",
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
      menu: "Меню",
      touch_drag_hint: "На телефоне: удерживай и перетаскивай карточку",
      // ===== ADD: Settings i18n =====
settings_title:"Настройки",
settings_theme:"Системный дизайн",
settings_theme_desc:"Тёмная/светлая тема, цвета и защита глаз",
settings_edit:"Изменить",
settings_saved_apply:"Сохранено и применено",

settings_cities:"Города",
settings_spheres:"Сферы",
settings_sources:"Источники",
settings_service_types:"Типы услуг",
settings_course_types:"Типы курсов",

field_name:"Название",
field_name_ru:"Название (RU)",
field_name_uz:"Название (UZ)",
field_name_en:"Название (EN)",
field_sort:"Сортировка",
field_active:"Активный",
field_start_date:"Дата старта",
field_price:"Сумма",
field_currency:"Валюта",

theme_dark_block:"Тёмная тема",
theme_light_block:"Светлая тема",
theme_bg:"Фон",
theme_text:"Текст",
theme_accent:"Кнопки/Акцент",
theme_eye_tint:"Жёлтый оттенок (eye)",
theme_eye_power:"Сила eye",

btn_add:"Добавить",
btn_update:"Обновить",
// ===== Clients =====
clients_title:"Клиенты",
clients_companies:"Компании",
clients_leads:"Лиды",
clients_search:"Поиск...",
clients_create_company:"Добавить компанию",
clients_create_lead:"Добавить лид",

client_type:"Тип",
client_company:"Компания",
client_lead:"Лид",
client_company_name:"Название компании",
client_full_name:"ФИО",
client_phone1:"Телефон",
client_phone2:"Доп. телефон",
client_city:"Город",
client_source:"Источник",
client_sphere:"Сфера",
client_comment:"Комментарий",
client_tg_group:"Ссылка на группу",
client_link_company:"Связанная компания",

clients_open:"Открыть",
clients_edit:"Изменить",
clients_delete_confirm:"Подтвердить удаление?",
clients_deleted:"Удалено",

clients_card_projects:"Проекты",
clients_card_course_leads:"Курсовые лиды",
clients_go_group:"Перейти в группу",
clients_no_projects:"Проектов нет",
clients_no_course_leads:"Курсовых лидов нет",
service_type: "Тип услуги",
pm_label: "PM",
open_tasks: "Открыть задачи",
filter_project: "Проект",
filter_project_all: "Все",


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
      create: "Yaratish",
      open: "Ochish",
      search: "Qidiruv…",
      edit: "Tahrirlash",
      full_name: "F.I.Sh",
      phone: "Telefon",
      role: "Rol",
      active: "Faol",
      last_login: "So‘nggi kirish",
      created_at: "Yaratilgan",
      updated_at: "Yangilangan",
      new_password: "Yangi parol",
      reset_password: "Parolni yangilash",
      activate: "Faollashtirish",
      deactivate: "Faolsizlantirish",
      users_total: "Jami",
      only_active: "Faqat faol",
      all_users: "Barchasi",
      user_create: "Foydalanuvchi yaratish",
      user_created: "Foydalanuvchi yaratildi",
      password_changed: "Parol yangilandi",
      user_updated: "Foydalanuvchi yangilandi",
      user_deactivated: "Foydalanuvchi faolsizlantirildi",
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
      menu: "Menyu",
      touch_drag_hint: "Telefonda: kartani bosib ushlab ko‘chiring",
      settings_title:"Sozlamalar",
settings_theme:"Tizim dizayni",
settings_theme_desc:"Qorong‘i/yorug‘ tema, ranglar va eye himoya",
settings_edit:"Tahrirlash",
settings_saved_apply:"Saqlanib qo‘llandi",

settings_cities:"Shaharlar",
settings_spheres:"Soha",
settings_sources:"Manbalar",
settings_service_types:"Xizmat turlari",
settings_course_types:"Kurs turlari",

field_name:"Nomi",
field_name_ru:"Nomi (RU)",
field_name_uz:"Nomi (UZ)",
field_name_en:"Nomi (EN)",
field_sort:"Saralash",
field_active:"Faol",
field_start_date:"Boshlanish sanasi",
field_price:"Summa",
field_currency:"Valyuta",

theme_dark_block:"Qorong‘i tema",
theme_light_block:"Yorug‘ tema",
theme_bg:"Fon",
theme_text:"Matn",
theme_accent:"Tugma/Accent",
theme_eye_tint:"Sariq tus (eye)",
theme_eye_power:"Eye kuchi",

btn_add:"Qo‘shish",
btn_update:"Yangilash",
// ===== Clients =====
clients_title:"Mijozlar",
clients_companies:"Kompaniyalar",
clients_leads:"Leadlar",
clients_search:"Qidiruv...",
clients_create_company:"Kompaniya qo‘shish",
clients_create_lead:"Lead qo‘shish",

client_type:"Turi",
client_company:"Kompaniya",
client_lead:"Lead",
client_company_name:"Kompaniya nomi",
client_full_name:"F.I.O",
client_phone1:"Telefon",
client_phone2:"Qo‘shimcha tel",
client_city:"Shahar",
client_source:"Manba",
client_sphere:"Soha",
client_comment:"Izoh",
client_tg_group:"Guruh link",
client_link_company:"Bog‘langan kompaniya",

clients_open:"Ochish",
clients_edit:"Tahrirlash",
clients_delete_confirm:"O‘chirishni tasdiqlaysizmi?",
clients_deleted:"O‘chirildi",

clients_card_projects:"Loyihalar",
clients_card_course_leads:"Kurs leadlari",
clients_go_group:"Guruhga o‘tish",
clients_no_projects:"Loyihalar yo‘q",
clients_no_course_leads:"Kurs leadlari yo‘q",
service_type: "Xizmat turi",
pm_label: "PM",
open_tasks: "Vazifalarni ochish",
filter_project: "Loyiha",
filter_project_all: "Barchasi",

    },
    en: {
      app_name: "G-SOFT",
      login_title: "Sign in",
      login_hint: "Enter login and password",
      login: "Login",
      password: "Password",
      edit: "Edit",
      full_name: "Full name",
      phone: "Phone",
      role: "Role",
      active: "Active",
      last_login: "Last login",
      created_at: "Created",
      updated_at: "Updated",
      new_password: "New password",
      reset_password: "Reset password",
      activate: "Activate",
      deactivate: "Deactivate",
      users_total: "Total",
      only_active: "Only active",
      all_users: "All users",
      user_create: "Create user",
      user_created: "User created",
      password_changed: "Password updated",
      user_updated: "User updated",
      user_deactivated: "User deactivated",
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
      create: "Create",
      open: "Open",
      search: "Search…",
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
      menu: "Menu",
      touch_drag_hint: "On phone: press & drag the card",
      settings_title:"Settings",
settings_theme:"System design",
settings_theme_desc:"Dark/light theme, colors and eye protection",
settings_edit:"Edit",
settings_saved_apply:"Saved & applied",

settings_cities:"Cities",
settings_spheres:"Spheres",
settings_sources:"Sources",
settings_service_types:"Service types",
settings_course_types:"Course types",

field_name:"Name",
field_name_ru:"Name (RU)",
field_name_uz:"Name (UZ)",
field_name_en:"Name (EN)",
field_sort:"Sort",
field_active:"Active",
field_start_date:"Start date",
field_price:"Amount",
field_currency:"Currency",

theme_dark_block:"Dark theme",
theme_light_block:"Light theme",
theme_bg:"Background",
theme_text:"Text",
theme_accent:"Buttons/Accent",
theme_eye_tint:"Eye tint",
theme_eye_power:"Eye strength",

btn_add:"Add",
btn_update:"Update",
// ===== Clients =====
clients_title:"Clients",
clients_companies:"Companies",
clients_leads:"Leads",
clients_search:"Search...",
clients_create_company:"Add company",
clients_create_lead:"Add lead",

client_type:"Type",
client_company:"Company",
client_lead:"Lead",
client_company_name:"Company name",
client_full_name:"Full name",
client_phone1:"Phone",
client_phone2:"Extra phone",
client_city:"City",
client_source:"Source",
client_sphere:"Sphere",
client_comment:"Comment",
client_tg_group:"Group link",
client_link_company:"Linked company",

clients_open:"Open",
clients_edit:"Edit",
clients_delete_confirm:"Confirm delete?",
clients_deleted:"Deleted",

clients_card_projects:"Projects",
clients_card_course_leads:"Course leads",
clients_go_group:"Open group",
clients_no_projects:"No projects",
clients_no_course_leads:"No course leads",
service_type: "Service type",
pm_label: "PM",
open_tasks: "Open tasks",
filter_project: "Project",
filter_project_all: "All",

    }
  };

  function detectLang() {
    const saved = LS.get("gsoft_lang", "");
    if (saved && LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("ru")) return "ru";
    if (nav.startsWith("uz")) return "uz";
    if (nav.startsWith("en")) return "en";
    return "ru";
  } 

  const App = {
    state: {
      user: null,
      lang: detectLang(),
      theme: {
        mode: (LS.get("gsoft_theme", "dark") === "light" ? "light" : "dark"),
        eye: (LS.get("gsoft_eye", "0") === "1")
      },
      ui: {
        sidebarOpen: false
      },
      current: {
        path: DEFAULT_ROUTE,
        query: {}
      },
      cache: {
        users: null,
        projects: null
      },
      themeCfg: null,
    },
    mount() {
      return $("#app") || document.body;
    }
  };

  function t(key) {
    const lang = App.state.lang;
    return (DICT[lang] && DICT[lang][key]) || (DICT.ru && DICT.ru[key]) || key;
  }

  const ICONS = {
  burger: `<svg viewBox="0 0 24 24" class="ico"><path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z"/></svg>`,

  // меню
  home: `<img src="./icons/asosiy.svg" class="ico" alt="">`,
  tasks: `<img src="./icons/tasks.svg" class="ico" alt="">`,
  projects: `<img src="./icons/projects.svg" class="ico" alt="">`,
  courses: `<img src="./icons/courses.svg" class="ico" alt="">`,
  clients: `<img src="./icons/clients.svg" class="ico" alt="">`,
  settings: `<img src="./icons/settings.svg" class="ico" alt="">`,
  users: `<img src="./icons/users.svg" class="ico" alt="">`,

  // темы/защита глаз
  sun: `<img src="./icons/light.svg" class="ico" alt="">`,
  moon: `<img src="./icons/dark.svg" class="ico" alt="">`,
  eye: `<img src="./icons/eye.svg" class="ico" alt="">`,

  // действия
  edit: `<img src="./icons/edit.svg" class="ico" alt="">`,
  trash: `<img src="./icons/delete.svg" class="ico" alt="">`,

  // оставляем как было (у тебя их в списке иконок нет)
  plus: `<svg viewBox="0 0 24 24" class="ico"><path d="M11 5h2v14h-2zM5 11h14v2H5z"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" class="ico"><path d="M12 3a9 9 0 0 0 0 18h1a2 2 0 0 0 2-2c0-1.1-.9-2-2-2h-1a3 3 0 0 1 0-6h6a4 4 0 0 0 0-8h-6z"/></svg>`,
  };


  const Toast = {
    host: null,
    ensure() {
      if (this.host) return;
      this.host = el("div", {
        class: "toastHost",
        "aria-live": "polite",
        role: "status"
      });
      document.body.appendChild(this.host);
    },
    show(msg, type = "ok") {
      this.ensure();
      const item = el("div", {
        class: `toast ${type}`
      }, String(msg || ""));
      this.host.appendChild(item);
      setTimeout(() => item.classList.add("show"), 10);
      setTimeout(() => {
        item.classList.remove("show");
        setTimeout(() => item.remove(), 250);
      }, 2300);
    }
  };

  const Modal = {
    overlay: null,
    esc: null,
    open(title, bodyEl, actions = []) {
      this.close();
      this.overlay = el("div", {
        class: "modalOverlay",
        role: "dialog",
        "aria-modal": "true"
      });
      const head = el("div", {
          class: "modalHead"
        },
        el("div", {
          class: "modalTitle"
        }, title || ""),
        el("button", {
          class: "iconBtn",
          type: "button",
          title: t("close"),
          onClick: () => this.close()
        }, "✕")
      );
      const body = el("div", {
        class: "modalBody"
      }, bodyEl);
      const foot = el("div", {
        class: "modalFoot"
      });
      for (const a of actions) {
        foot.appendChild(el("button", {
          class: `btn ${a.kind||""}`,
          type: "button",
          onClick: a.onClick
        }, a.label));
      }
      const card = el("div", {
        class: "modalCard"
      }, head, body, (actions.length ? foot : el("div")));
      this.overlay.appendChild(card);
      this.overlay.addEventListener("mousedown", (e) => {
        if (e.target === this.overlay) this.close();
      });
      this.esc = (e) => {
        if (e.key === "Escape") this.close();
      };
      document.addEventListener("keydown", this.esc);
      document.body.appendChild(this.overlay);
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        const f = this.overlay.querySelector("button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])");
        if (f) f.focus();
      }, 0);
    },
    close() {
      if (this.esc) document.removeEventListener("keydown", this.esc);
      this.esc = null;
      if (this.overlay) this.overlay.remove();
      this.overlay = null;
      document.body.style.overflow = "";
    },
    confirm(title, text) {
      return new Promise((resolve) => {
        const body = el("div", {
          class: "vcol gap10"
        }, el("div", {
          class: "muted"
        }, text || ""));
        this.open(title, body, [{
            label: t("no"),
            kind: "ghost",
            onClick: () => {
              this.close();
              resolve(false);
            }
          },
          {
            label: t("yes"),
            kind: "danger",
            onClick: () => {
              this.close();
              resolve(true);
            }
          }
        ]);
      });
    },
    prompt(title, hint) {
      return new Promise((resolve) => {
        const inp = el("textarea", {
          rows: 4,
          placeholder: hint || ""
        });
        const body = el("div", {
          class: "vcol gap10"
        }, el("div", {
          class: "muted"
        }, hint || ""), inp);
        this.open(title, body, [{
            label: t("cancel"),
            kind: "ghost",
            onClick: () => {
              this.close();
              resolve("");
            }
          },
          {
            label: t("confirm"),
            kind: "danger",
            onClick: () => {
              const v = (inp.value || "").trim();
              if (!v) return;
              this.close();
              resolve(v);
            }
          }
        ]);
        setTimeout(() => inp.focus(), 0);
      });
    }
  };

  async function apiFetch(path, opts = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const res = await fetch(url, {
      method: opts.method || "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(opts.headers || {})
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined
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
  // ===== AUTH / MAIN =====
  me: () => apiFetch("/api/auth/me"),
  login: (login, password) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: { login, password },
    }),
  logout: () =>
    apiFetch("/api/auth/logout", {
      method: "POST",
    }),
  main: () => apiFetch("/api/main"),

  // ===== TRY LISTS (non-blocking) =====
  usersTryList: async () => {
    try {
      const r = await apiFetch("/api/users");
      return r.data || [];
    } catch {
      return null;
    }
  },
  projectsTryList: async () => {
    try {
      const r = await apiFetch("/api/projects");
      return r.data || [];
    } catch {
      return null;
    }
  },

  // ===== TASKS =====
  tasks: {
    list: (q = {}) => {
      const sp = new URLSearchParams();
      if (q.assignee_user_id) sp.set("assignee_user_id", q.assignee_user_id);
      if (q.project_id) sp.set("project_id", q.project_id); // ✅ ВАЖНО по ТЗ
      const s = sp.toString();
      return apiFetch(`/api/tasks${s ? "?" + s : ""}`);
    },

    get: (id) => apiFetch(`/api/tasks/${id}`),
    create: (body) =>
      apiFetch("/api/tasks", {
        method: "POST",
        body,
      }),
    update: (id, body) =>
      apiFetch(`/api/tasks/${id}`, {
        method: "PUT",
        body,
      }),
    move: (id, status, extra = {}) =>
      apiFetch(`/api/tasks/${id}/move`, {
        method: "POST",
        body: { status, ...extra },
      }),
    del: (id) =>
      apiFetch(`/api/tasks/${id}/delete`, {
        method: "POST",
      }),
  },

    // ===== PROJECTS =====
  projects: {
  list: (q = {}) => {
    const sp = new URLSearchParams();
    if (q.q) sp.set("q", q.q);
    if (q.pm_user_id) sp.set("pm_user_id", q.pm_user_id);
    if (q.service_type_id) sp.set("service_type_id", q.service_type_id);
    if (q.client_id) sp.set("client_id", q.client_id);
    const s = sp.toString();
    return apiFetch(`/api/projects${s ? "?" + s : ""}`);
  },
  get: (id) => apiFetch(`/api/projects/${id}`),
  create: (body) => apiFetch("/api/projects", { method: "POST", body }),
  update: (id, body) => apiFetch(`/api/projects/${id}`, { method: "PUT", body }),
  move: (id, status, extra = {}) =>
    apiFetch(`/api/projects/${id}/move`, { method: "POST", body: { status, ...extra } }),
  del: (id) => apiFetch(`/api/projects/${id}/delete`, { method: "POST" }),
  },



  // ===== USERS (admin) =====
  users: {
    list: () => apiFetch("/api/users"),
    create: (body) =>
      apiFetch("/api/users", {
        method: "POST",
        body,
      }),
    update: (id, body) =>
      apiFetch(`/api/users/${id}`, {
        method: "PUT",
        body,
      }),
    resetPassword: (id, new_password) =>
      apiFetch(`/api/users/${id}/reset_password`, {
        method: "POST",
        body: { new_password },
      }),
    deactivate: (id) =>
      apiFetch(`/api/users/${id}/delete`, {
        method: "POST",
      }),
  },

  // ===== SETTINGS (admin) =====
  // endpoints must exist in backend:
  // GET  /api/settings/theme
  // PUT  /api/settings/theme   { value: {...} }
  // GET  /api/settings/{kind}
  // POST /api/settings/{kind}
  // PUT  /api/settings/{kind}/{id}
  // POST /api/settings/{kind}/{id}/delete
  settings: {
    themeGet: () => apiFetch("/api/settings/theme"),
    themeSet: (value) =>
      apiFetch("/api/settings/theme", {
        method: "PUT",
        body: { value },
      }),

    dictList: (kind) => apiFetch(`/api/settings/${kind}`),
    dictCreate: (kind, body) =>
      apiFetch(`/api/settings/${kind}`, {
        method: "POST",
        body,
      }),
    dictUpdate: (kind, id, body) =>
      apiFetch(`/api/settings/${kind}/${id}`, {
        method: "PUT",
        body,
      }),
    dictDelete: (kind, id) =>
      apiFetch(`/api/settings/${kind}/${id}/delete`, {
        method: "POST",
      }),
  },
  clients: {
  list: (type, q="") => {
    const sp = new URLSearchParams();
    if(type) sp.set("type", type);      // "company" | "lead"
    if(q) sp.set("q", q);
    const s = sp.toString();
    return apiFetch(`/api/clients${s ? "?" + s : ""}`);
  },
  get: (id) => apiFetch(`/api/clients/${id}`),
  create: (body) => apiFetch("/api/clients", { method:"POST", body }),
  update: (id, body) => apiFetch(`/api/clients/${id}`, { method:"PUT", body }),
  del: (id) => apiFetch(`/api/clients/${id}/delete`, { method:"POST" }),
},

};


  function hexToRgb(hex){
  const h=String(hex||"").trim().replace("#","");
  if(h.length===3){
    const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
    return {r,g,b};
  }
  if(h.length!==6) return null;
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  return {r,g,b};
}
function clamp01(x){ x=Number(x); if(!isFinite(x)) return 0; return Math.max(0,Math.min(1,x)); }
function blendBg(hex, dir){ // dir: + => lighten, - => darken
  const rgb=hexToRgb(hex); if(!rgb) return null;
  const k = dir>0 ? 24 : -24;
  const r=Math.max(0,Math.min(255,rgb.r+k));
  const g=Math.max(0,Math.min(255,rgb.g+k));
  const b=Math.max(0,Math.min(255,rgb.b+k));
  const toHex=(n)=>n.toString(16).padStart(2,"0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function defaultThemeCfg(){
  return {
    dark:{ bg:"#06110f", text:"#ffffff", accent:"#FFD05A" },
    light:{ bg:"#f6f7fb", text:"#0a0a0a", accent:"#003A2F" },
    eye:{ tint:"#FFD05A", strength:0.12 }
  };
}
function normalizeThemeCfg(v){
  const base=defaultThemeCfg();
  if(!v || typeof v!=="object") return base;
  const out=JSON.parse(JSON.stringify(base));
  for(const mode of ["dark","light"]){
    if(v[mode] && typeof v[mode]==="object"){
      if(v[mode].bg) out[mode].bg=String(v[mode].bg);
      if(v[mode].text) out[mode].text=String(v[mode].text);
      if(v[mode].accent) out[mode].accent=String(v[mode].accent);
    }
  }
  if(v.eye && typeof v.eye==="object"){
    if(v.eye.tint) out.eye.tint=String(v.eye.tint);
    if(v.eye.strength!=null) out.eye.strength=clamp01(v.eye.strength);
  }
  return out;
}

function injectThemeExtras(){
  if($("#gsoftThemeExtras")) return;
  const css=`
:root{color-scheme:dark;}
[data-theme="light"]{color-scheme:light;}
select{color-scheme:inherit;}
select option{background:var(--bg2); color:var(--text);}
body::before{
  content:"";
  position:fixed; inset:0;
  pointer-events:none;
  z-index:9990;
  background: rgba(var(--eyeTint,255,208,90), var(--eyeAlpha,0.10));
  opacity:0;
  transition: opacity .18s ease;
}
[data-eye="1"] body::before{opacity:1;}
  `.trim();
  document.head.appendChild(el("style",{id:"gsoftThemeExtras"},css));
}

function applyTheme(){
  injectThemeExtras();

  const root=document.documentElement;
  root.dataset.theme=App.state.theme.mode;
  root.dataset.eye=App.state.theme.eye?"1":"0";

  // берем cfg из памяти, иначе дефолт
  const cfg = normalizeThemeCfg(App.state.themeCfg);

  const mode = App.state.theme.mode;
  const m = cfg[mode] || cfg.dark;

  // bg + bg2
  const bg = m.bg || (mode==="light"?"#f6f7fb":"#06110f");
  const bg2 = blendBg(bg, mode==="light"?+1:-1) || bg;

  root.style.setProperty("--bg", bg);
  root.style.setProperty("--bg2", bg2);

  // text (делаем RGBA как раньше)
  const trgb = hexToRgb(m.text||"#ffffff") || {r:255,g:255,b:255};
  root.style.setProperty("--text", `rgba(${trgb.r},${trgb.g},${trgb.b},.90)`);
  root.style.setProperty("--muted", `rgba(${trgb.r},${trgb.g},${trgb.b},.65)`);
  root.style.setProperty("--muted2", `rgba(${trgb.r},${trgb.g},${trgb.b},.45)`);

  // accent
  root.style.setProperty("--accent", m.accent || (mode==="light"?"#003A2F":"#FFD05A"));

  // eye tint
  const eyeRgb = hexToRgb(cfg.eye?.tint || "#FFD05A") || {r:255,g:208,b:90};
  root.style.setProperty("--eyeTint", `${eyeRgb.r},${eyeRgb.g},${eyeRgb.b}`);
  root.style.setProperty("--eyeAlpha", String(clamp01(cfg.eye?.strength ?? 0.12)));
}


  function parseHash() {
    const h = window.location.hash || "";
    if (!h.startsWith("#/")) return {
      path: DEFAULT_ROUTE,
      query: {}
    };
    const raw = h.slice(1);
    const [pathPart, queryPart] = raw.split("?");
    const query = {};
    if (queryPart)
      for (const [k, v] of new URLSearchParams(queryPart).entries()) query[k] = v;
    return {
      path: pathPart || DEFAULT_ROUTE,
      query
    };
  }

  function setHash(path, query = {}) {
    const sp = new URLSearchParams(query);
    const q = sp.toString();
    window.location.hash = `#${path}${q?"?"+q:""}`;
  }

  function taskStatusLabel(s) {
    if (s === "new") return t("t_new");
    if (s === "pause") return t("t_pause");
    if (s === "in_progress") return t("t_in_progress");
    if (s === "done") return t("t_done");
    if (s === "canceled") return t("t_canceled");
    return s || "—";
  }

  function statusDotColor(status) {
    if (status === "new") return "var(--accent)";
    if (status === "pause") return "rgba(255,255,255,.55)";
    if (status === "in_progress") return "var(--accent2)";
    if (status === "done") return "var(--ok)";
    if (status === "canceled") return "var(--danger)";
    return "rgba(255,255,255,.55)";
  }

  function injectStyles() {
  if ($("#gsoftStyles")) return;

  const css = `
:root{
  --bg:#06110f; --bg2:#081a16;
  --card:rgba(255,255,255,.06); --card2:rgba(255,255,255,.08);
  --stroke:rgba(255,255,255,.10);
  --text:rgba(255,255,255,.90); --muted:rgba(255,255,255,.65); --muted2:rgba(255,255,255,.45);
  --accent:#FFD05A; --accent2:#0fd1a7; --danger:#ff4d4d; --ok:#25d366;
  --shadow:0 18px 50px rgba(0,0,0,.45);
  --radius2:24px; --blur:18px;
  --focus:0 0 0 3px rgba(255,208,90,.25);
  --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace;
  --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif;
  --icon: invert(1);
}
[data-theme="light"]{
  --bg:#f6f7fb; --bg2:#ffffff;
  --card:rgba(10,10,10,.05); --card2:rgba(10,10,10,.07);
  --stroke:rgba(10,10,10,.10);
  --text:rgba(10,10,10,.88); --muted:rgba(10,10,10,.62); --muted2:rgba(10,10,10,.45);
  --shadow:0 18px 50px rgba(0,0,0,.12);
  --focus:0 0 0 3px rgba(0,58,47,.16);
  --icon: none;
}
[data-eye="1"]{
  --card:rgba(255,255,255,.045); --card2:rgba(255,255,255,.065);
  --stroke:rgba(255,255,255,.085);
  --text:rgba(255,255,255,.86); --muted:rgba(255,255,255,.62); --muted2:rgba(255,255,255,.48);
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0; font-family:var(--sans); color:var(--text);
  background:
    radial-gradient(1100px 600px at 18% -10%, rgba(15,209,167,.22), transparent 55%),
    radial-gradient(900px 520px at 110% 25%, rgba(255,208,90,.14), transparent 50%),
    linear-gradient(180deg, var(--bg), var(--bg2));
}
button,input,select,textarea{font:inherit;color:inherit}
input,select,textarea{
  background:rgba(255,255,255,.05);
  border:1px solid var(--stroke);
  border-radius:12px;
  padding:10px 12px;
  outline:none;
}
[data-theme="light"] input,[data-theme="light"] select,[data-theme="light"] textarea{background:rgba(10,10,10,.03)}
input:focus,select:focus,textarea:focus,button:focus{box-shadow:var(--focus)}
.muted{color:var(--muted)} .muted2{color:var(--muted2)}
#app{min-height:100vh}
.wrap{min-height:100vh;display:flex}
.sidebar{
  width:80px; padding:14px 10px;
  border-right:1px solid var(--stroke);
  background:rgba(0,0,0,.06); backdrop-filter: blur(var(--blur));
  position:sticky; top:0; height:100vh;
  transition: width .18s ease;
  z-index:30;
}
.sidebar:hover{width:280px}
.sidebar.open{width:280px}
.brand{display:flex;align-items:center;gap:10px;padding:10px 10px 14px;margin-bottom:10px}
.logo{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,rgba(255,208,90,.9),rgba(15,209,167,.75));box-shadow:0 12px 25px rgba(0,0,0,.25)}
.brandName{font-weight:800;letter-spacing:.6px}
.nav{display:flex;flex-direction:column;gap:6px;padding:0 6px}
.nav a{
display:flex;
align-items:center;
gap:12px;
padding:10px 12px;
border-radius:14px;
border:1px solid transparent;
color:var(--muted);
text-decoration:none;
}
.nav a .txt{white-space:nowrap;opacity:0;transform:translateX(-6px);transition:.18s ease}
.sidebar:hover .nav a .txt,.sidebar.open .nav a .txt{opacity:1;transform:translateX(0)}
.nav a.active{background:var(--card);border-color:var(--stroke);color:var(--text)}
.nav a:hover{background:var(--card2);color:var(--text)}
.topLeft .iconBtn .icoWrap .ico {
  width:18px!important;
  height:18px!important;
  filter: none!important;
}
.ico{
  width:25px;
  height:25px;
  fill:currentColor;
  filter:var(--icon);
}
.icoWrap{display:inline-flex;align-items:center;justify-content:center}
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.topbar{
  position:sticky;top:0;z-index:20;
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;border-bottom:1px solid var(--stroke);
  background:rgba(0,0,0,.05);backdrop-filter: blur(var(--blur));
}
.topLeft{display:flex;align-items:center;gap:10px;min-width:0}
.pageTitle{font-weight:800;letter-spacing:.4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.topRight{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.iconBtn{
  border:1px solid var(--stroke); background:var(--card);
  padding:8px 10px; border-radius:12px; cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:8px
}
.iconBtn:hover{background:var(--card2)}
.pill{border:1px solid var(--stroke);background:var(--card);padding:8px 10px;border-radius:999px;font-size:12px;color:var(--muted);display:flex;align-items:center;gap:8px}
.seg{display:flex;border:1px solid var(--stroke);border-radius:999px;overflow:hidden;background:var(--card)}
.seg button{border:0;background:transparent;padding:8px 10px;cursor:pointer;color:var(--muted)}
.seg button.active{background:var(--card2);color:var(--text)}
.content{padding:16px}
.card{background:var(--card);border:1px solid var(--stroke);border-radius:24px;box-shadow:var(--shadow);backdrop-filter: blur(var(--blur))}
.cardPad{padding:14px}
.btn{border:1px solid var(--stroke);background:var(--card);padding:10px 12px;border-radius:12px;cursor:pointer}
.btn:hover{background:var(--card2)}
.btn.primary{border-color:rgba(255,208,90,.35)}
.btn.danger{border-color:rgba(255,77,77,.35)}
.btn.ghost{background:transparent}
.vcol{display:flex;flex-direction:column}
.hrow{display:flex;flex-direction:row}
.gap8{gap:8px}.gap10{gap:10px}.gap12{gap:12px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:980px){.grid2{grid-template-columns:1fr}}
.toastHost{position:fixed;right:14px;bottom:14px;display:flex;flex-direction:column;gap:10px;z-index:9999}
.toast{opacity:0;transform:translateY(10px);transition:.22s ease;padding:10px 12px;border-radius:14px;background:rgba(0,0,0,.65);border:1px solid rgba(255,255,255,.18);color:#fff}
.toast.ok{border-color:rgba(37,211,102,.35)} .toast.bad{border-color:rgba(255,77,77,.35)} .toast.show{opacity:1;transform:translateY(0)}
.modalOverlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:18px;z-index:9998}
.modalCard{width:min(860px,96vw);max-height:92vh;overflow:auto;background:var(--bg2);border:1px solid var(--stroke);border-radius:22px;box-shadow:var(--shadow)}
.modalHead{padding:14px 14px 10px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--stroke)}
.modalTitle{font-weight:900;letter-spacing:.3px}
.modalBody{padding:14px}
.modalFoot{padding:12px 14px 14px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid var(--stroke)}
.sideOverlay{display:none}
@media (max-width:900px){
  .sidebar{position:fixed;left:-290px;top:0;height:100vh;width:280px;transition:left .18s ease}
  .sidebar:hover{width:280px} .sidebar.open{left:0}
  .sideOverlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:25}
  .sideOverlay.hidden{display:none}
}
.kanbanWrap{display:flex;gap:12px;overflow:auto;padding-bottom:8px}
.kcol{min-width:320px;max-width:340px}
.khead{display:flex;justify-content:space-between;align-items:center;padding:10px 12px}
.khead .ttl{font-weight:900}
.klist{padding:10px;display:flex;flex-direction:column;gap:10px;min-height:60px}
.kcard{padding:10px;border:1px solid var(--stroke);border-radius:16px;background:rgba(255,255,255,.05);cursor:grab;user-select:none;touch-action:none}
.kmeta{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;color:var(--muted);font-size:12px}
.badge{font-size:12px;padding:4px 8px;border-radius:999px;border:1px solid var(--stroke);background:var(--card)}
.dot{width:8px;height:8px;border-radius:999px;display:inline-block;margin-right:6px}
@media (max-width:900px){
  .kanbanWrap{flex-direction:column;overflow:visible}
  .kcol{min-width:auto;max-width:none}
}
/* ===== FIX PACK (desktop) ===== */

/* Sidebar brand text hidden when collapsed */
.brand .brandText{
  opacity:0;
  transform:translateX(-6px);
  transition:.18s ease;
  pointer-events:none;
}
.sidebar:hover .brandText,
.sidebar.open .brandText{
  opacity:1;
  transform:translateX(0);
  pointer-events:auto;
}

/* Content should fill full height */
.wrap{min-height:100vh}
.main{min-height:100vh}
.content{flex:1; overflow:auto}

/* Kanban should fill width nicely (no пустоты справа) */
.kanbanWrap{
  --cols:7;
  display:grid;
  grid-template-columns:repeat(var(--cols), minmax(290px, 1fr));
  gap:12px;
  align-items:stretch;
  overflow:auto;
  padding-bottom:12px;
  padding-top:15px;
}
.kcol{min-width:260px; max-width:none}
.klist{min-height:80px}

/* Keep mobile as is */
@media (max-width:900px){
  .kanbanWrap{display:flex; flex-direction:column; overflow:visible}
  .kcol{min-width:auto}
}

/* Card actions + dragging visuals */
.kcard.dragging{opacity:.55}
.kcardActions{display:flex; gap:8px; justify-content:flex-end; margin-top:10px}
.btn.mini{padding:6px 10px; border-radius:10px; font-size:12px}

/* ===== USERS ===== */
.uToolbar{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
.uList{display:flex; flex-direction:column; gap:10px}
.uCard{padding:12px; border:1px solid var(--stroke); border-radius:18px; background:rgba(255,255,255,.05)}
.uRow{display:grid; grid-template-columns:70px 1.4fr 1fr 1fr 120px 140px auto; gap:10px; align-items:center}
.uId{font-family:var(--mono); color:var(--muted2); font-size:12px}
.uName{font-weight:900}
.uMeta{color:var(--muted); font-size:12px}
.uActions{display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap}
.badge.ok{border-color:rgba(37,211,102,.35)}
.badge.off{border-color:rgba(255,77,77,.35)}
@media (max-width:1100px){
  .uRow{grid-template-columns:70px 1.2fr 1fr 120px auto}
  .uHideLg{display:none}
}
@media (max-width:720px){
  .uRow{display:flex; flex-direction:column; align-items:flex-start}
  .uActions{width:100%; justify-content:flex-start}
}

/* === FIX: native SELECT dark dropdown === */
select{
  background: rgba(255,255,255,.06);
  color: var(--text);
  border: 1px solid var(--stroke);
  border-radius: 14px;
  padding: 10px 12px;
  outline: none;
  color-scheme: dark;
}
select:focus{
  border-color: rgba(255,208,90,.55);
  box-shadow: 0 0 0 3px rgba(255,208,90,.12);
}
select option{
  background: #0f1714;
  color: #e7f1ea;
}

/* === FIX: move header actions into sidebar on mobile === */
.sidebar{ display:flex; flex-direction:column; }
.nav{ flex:1 1 auto; padding-bottom:10px; }
.sideActionsSlot{
  margin-top:auto;
  padding:12px 10px 12px;
  border-top:1px solid var(--stroke);
}
@media (min-width:901px){
  .sideActionsSlot{ display:none; }
}
.hdrActions.inSidebar{
  display:flex;
  flex-direction:column;
  gap:10px;
  width:100%;
}
.hdrActions.inSidebar .seg{ width:100%; }
.hdrActions.inSidebar .pill{ width:100%; justify-content:center; }
.hdrActions.inSidebar .iconBtn{ width:100%; justify-content:center; }
.hdrActions.inSidebar .hdrRow{
  display:flex;
  gap:10px;
  width:100%;
}
.hdrActions.inSidebar .hdrRow .iconBtn{
  width:100%;
}

/* ==========================================================
   ✅ KANBAN DnD UPGRADE PACK (ТОЛЬКО ДОБАВКИ, НЕ ЛОМАЕМ СТАРОЕ)
   - drop target на всю высоту
   - подсветка
   - анимация
   - мышь + touch (визуал + ховер)
   ========================================================== */

/* drop-zone реально "высокая" даже если карточек мало */
.kanbanWrap .kcol{
  display:flex;
  flex-direction:column;
  align-self:stretch;
}
.kanbanWrap .khead{flex:0 0 auto}
.kanbanWrap .klist{
  flex:1 1 auto;
  /* главное: зона дропа высокая */
  min-height:max(160px, calc(100vh - 260px));
  transition: background .12s ease, outline-color .12s ease, box-shadow .12s ease, transform .12s ease;
}

/* подсветка / ховер */
.kanbanWrap .klist.drop,
.kanbanWrap .klist.dropHover,
.kanbanWrap .klist[data-drop].dropHover{
  outline:2px dashed rgba(255,208,90,.55);
  outline-offset:2px;
  background:rgba(255,208,90,.06);
  box-shadow: inset 0 0 0 1px rgba(255,208,90,.14);
  animation: gsoftDropPulse .55s ease-in-out infinite alternate;
}

@keyframes gsoftDropPulse{
  from{ box-shadow: inset 0 0 0 1px rgba(255,208,90,.10); }
  to{ box-shadow: inset 0 0 0 1px rgba(255,208,90,.22), 0 0 0 3px rgba(255,208,90,.06); }
}

/* плавность и ощущение "живого" drag */
.kanbanWrap .kcard{
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, opacity .12s ease;
}
.kanbanWrap .kcard:hover{box-shadow:0 12px 28px rgba(0,0,0,.25)}
.kanbanWrap .kcard.dragging{
  opacity:.55;
  transform: scale(.985);
}

/* на телефоне: не заставляем канбан быть высоким "как десктоп" */
@media (max-width:900px){
  .kanbanWrap .klist{
    min-height:140px;
  }
}
`.trim();

  document.head.appendChild(el("style", { id: "gsoftStyles" }, css));

  // ✅ подсветка drop-зоны для мыши (HTML5 Drag&Drop)
  if (!window.__gsoftDnDHoverInit) {
    window.__gsoftDnDHoverInit = 1;

    let last = null;
    const clear = () => {
      if (!last) return;
      last.classList.remove("dropHover", "drop");
      last = null;
    };

    const pickList = (x, y) => {
      const elAt = document.elementFromPoint(x, y);
      if (!elAt) return null;
      // поддержим и .klist, и [data-drop]
      return elAt.closest?.(".klist") || elAt.closest?.("[data-drop]") || null;
    };

    document.addEventListener("dragover", (e) => {
      const list = pickList(e.clientX, e.clientY);
      if (list && list.classList) {
        if (last !== list) {
          clear();
          last = list;
          last.classList.add("dropHover");
        }
      } else {
        clear();
      }
    }, true);

    document.addEventListener("dragleave", () => {
      // leave иногда срабатывает "ложно", поэтому чистим мягко
      // (реально зачистка произойдёт на drop/dragend)
    }, true);

    document.addEventListener("drop", clear, true);
    document.addEventListener("dragend", clear, true);
    document.addEventListener("dragstart", () => clear(), true);
    document.addEventListener("pointerup", clear, true);
    window.addEventListener("blur", clear, true);
  }
}



  function allowedRoutesByRole(role) {
    const all = [{
        path: "/main",
        key: "route_main",
        icon: "home",
        roles: ["admin", "rop", "pm", "fin", "sale"]
      },
      {
        path: "/tasks",
        key: "route_tasks",
        icon: "tasks",
        roles: ["admin", "rop", "pm", "fin", "sale"]
      },
      {
        path: "/projects",
        key: "route_projects",
        icon: "projects",
        roles: ["admin", "rop", "pm", "fin"]
      },
      {
        path: "/courses",
        key: "route_courses",
        icon: "courses",
        roles: ["admin", "rop", "sale"]
      },
      {
        path: "/clients",
        key: "route_clients",
        icon: "clients",
        roles: ["admin", "rop", "sale", "pm"]
      },
      {
        path: "/settings",
        key: "route_settings",
        icon: "settings",
        roles: ["admin"]
      },
      {
        path: "/users",
        key: "route_users",
        icon: "users",
        roles: ["admin"]
      },
    ];
    return all.filter(r => r.roles.includes(role));
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

  App.setSidebar = function (open) {
    App.state.ui.sidebarOpen = !!open;
    const sb = $("#sidebar");
    const ov = $(".sideOverlay");
    if (!sb || !ov) return;
    sb.classList.toggle("open", App.state.ui.sidebarOpen);
    if (window.matchMedia("(max-width: 900px)").matches) ov.classList.toggle("hidden", !App.state.ui.sidebarOpen);
    else ov.classList.add("hidden");
  };

  App.refreshActiveNav = function () {
    const path = App.state.current.path;
    $$("#nav a").forEach(a => a.classList.toggle("active", a.getAttribute("data-path") === path));
  };
  App.refreshPageTitle = function () {
    const h = $("#pageTitle");
    if (h) h.textContent = pageTitleByPath(App.state.current.path);
  };
  App.refreshTexts = function () {
    const cur = {
      ...App.state.current
    };
    App.renderShell();
    App.state.current = cur;
    App.routeNow();
  };

  App.renderShell = function () {
  const mount = App.mount();
  mount.innerHTML = "";

  const role = App.state.user.role;
  const routes = allowedRoutesByRole(role);

  const sideOverlay = el("div", {
    class: "sideOverlay hidden",
    onClick: () => App.setSidebar(false)
  });

  // --- SIDEBAR ---
  const sideActionsSlot = el("div", { class: "sideActionsSlot", id: "sideActionsSlot" });

  const sidebar = el("aside", { class: "sidebar", id: "sidebar" },
    el("div", { class: "brand" },
      el("div", { class: "vcol brandText", style: "min-width:0" },
        el("div", { class: "brandName" }, t("app_name")),
        el("div", {
          class: "muted2",
          style: "font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap"
        }, "Task and Project Management System")
      )
    ),

    el("nav", { class: "nav", id: "nav" },
      routes.map(r => el("a", {
        href: `#${r.path}`,
        "data-path": r.path,
        onClick: () => App.setSidebar(false)
      },
        el("span", { class: "icoWrap", html: ICONS[r.icon] }),
        el("span", { class: "txt" }, t(r.key))
      ))
    ),

    // slot in bottom of sidebar (mobile will receive actions here)
    sideActionsSlot
  );

  // --- TOPBAR LEFT ---
  const burgerBtn = el("button", {
    class: "iconBtn",
    type: "button",
    title: t("menu"),
    onClick: () => App.setSidebar(!App.state.ui.sidebarOpen)
  }, el("span", { class: "icoWrap", html: ICONS.burger }));

  // --- ACTIONS (LANG/THEME/EYE/USER/LOGOUT) ---
  const langSeg = el("div", { class: "seg", title: "Language" },
    ...LANGS.map(lng => el("button", {
      type: "button",
      class: (App.state.lang === lng) ? "active" : "",
      onClick: () => {
        App.state.lang = lng;
        LS.set("gsoft_lang", lng);
        App.refreshTexts();
      }
    }, lng.toUpperCase()))
  );

  const themeBtn = el("button", {
    class: "iconBtn",
    type: "button",
    title: (App.state.theme.mode === "dark" ? t("theme_dark") : t("theme_light")),
    onClick: () => {
      App.state.theme.mode = (App.state.theme.mode === "dark") ? "light" : "dark";
      LS.set("gsoft_theme", App.state.theme.mode);
      applyTheme();
    }
  }, el("span", { class: "icoWrap", html: (App.state.theme.mode === "dark") ? ICONS.moon : ICONS.sun }));

  const eyeBtn = el("button", {
    class: "iconBtn",
    type: "button",
    title: t("eye"),
    onClick: () => {
      App.state.theme.eye = !App.state.theme.eye;
      LS.set("gsoft_eye", App.state.theme.eye ? "1" : "0");
      applyTheme();
    }
  }, el("span", { class: "icoWrap", html: ICONS.eye }));

  // icons row (looks nice both desktop and mobile)
  const iconsRow = el("div", { class: "hdrRow" }, themeBtn, eyeBtn);

  const userPill = el("div", { class: "pill" },
    //el("span", { class: "muted2", style: "font-family:var(--mono); font-size:11px" }, App.state.user.role),
    el("span", {}, App.state.user.full_name || App.state.user.login)
  );

  const logoutBtn = el("button", {
    class: "iconBtn",
    type: "button",
    title: t("sign_out"),
    onClick: async () => { try { await API.logout(); } catch {} location.href = "/login"; }
  }, t("sign_out"));

  // actions container (we will move it)
  const actions = el("div", { class: "topRight hdrActions", id: "hdrActions" },
    langSeg, iconsRow, userPill, logoutBtn
  );

  // host in header (desktop keeps it here)
  const actionsHost = el("div", { class: "hdrActionsHost", id: "hdrActionsHost" }, actions);

  const topbar = el("header", { class: "topbar" },
    el("div", { class: "topLeft" },
      burgerBtn,
      el("div", { class: "pageTitle", id: "pageTitle" }, t("app_name"))
    ),
    actionsHost
  );

  const main = el("main", { class: "main" },
    topbar,
    el("div", { class: "content", id: "content" })
  );

  mount.append(
    sideOverlay,
    el("div", { class: "wrap" }, sidebar, main)
  );

  // --- reflow actions: move to sidebar on mobile ---
  App.reflowHeaderActions = function () {
    const isMobile = window.matchMedia("(max-width:900px)").matches;
    const a = $("#hdrActions");
    const host = $("#hdrActionsHost");
    const slot = $("#sideActionsSlot");
    if (!a || !host || !slot) return;

    if (isMobile) {
      a.classList.add("inSidebar");
      slot.appendChild(a);
    } else {
      a.classList.remove("inSidebar");
      host.appendChild(a);
    }
  };

  // run once after render
  App.reflowHeaderActions();

  App.refreshActiveNav();
  App.refreshPageTitle();
};


  App.renderLogin = function () {
    const mount = App.mount();
    mount.innerHTML = "";
    const root = el("div", {
        class: "content",
        style: "min-height:100vh; display:flex; align-items:center; justify-content:center;"
      },
      el("div", {
          class: "card",
          style: "width:min(480px, 96vw);"
        },
        el("div", {
            class: "cardPad vcol gap12"
          },
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              style: "font-weight:900; font-size:20px"
            }, t("login_title")),
            el("div", {
              class: "muted"
            }, t("login_hint"))
          ),
          el("div", {
              class: "vcol gap10"
            },
            el("label", {
                class: "vcol gap8"
              },
              el("span", {
                class: "muted2",
                style: "font-size:12px"
              }, t("login")),
              el("input", {
                id: "loginInp",
                placeholder: "login",
                autocomplete: "username"
              })
            ),
            el("label", {
                class: "vcol gap8"
              },
              el("span", {
                class: "muted2",
                style: "font-size:12px"
              }, t("password")),
              el("input", {
                id: "passInp",
                type: "password",
                placeholder: "••••••••",
                autocomplete: "current-password"
              })
            )
          ),
          el("div", {
              class: "hrow gap10",
              style: "justify-content:space-between; align-items:center; flex-wrap:wrap"
            },
            el("div", {
                class: "seg"
              },
              ...LANGS.map(lng => el("button", {
                type: "button",
                class: (App.state.lang === lng) ? "active" : "",
                onClick: () => {
                  App.state.lang = lng;
                  LS.set("gsoft_lang", lng);
                  App.renderLogin();
                }
              }, lng.toUpperCase()))
            ),
            el("div", {
                class: "hrow gap8"
              },
              el("button", {
                  class: "iconBtn",
                  type: "button",
                  title: (App.state.theme.mode === "dark" ? t("theme_dark") : t("theme_light")),
                  onClick: () => {
                    App.state.theme.mode = (App.state.theme.mode === "dark") ? "light" : "dark";
                    LS.set("gsoft_theme", App.state.theme.mode);
                    applyTheme();
                  }
                },
                el("span", {
                  class: "icoWrap",
                  html: (App.state.theme.mode === "dark") ? ICONS.moon : ICONS.sun
                })
              ),
              el("button", {
                  class: "iconBtn",
                  type: "button",
                  title: t("eye"),
                  onClick: () => {
                    App.state.theme.eye = !App.state.theme.eye;
                    LS.set("gsoft_eye", App.state.theme.eye ? "1" : "0");
                    applyTheme();
                  }
                },
                el("span", {
                  class: "icoWrap",
                  html: ICONS.eye
                })
              ),
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
              if (!login || !password) return Toast.show(`${t("toast_error")}: ${t("login_hint")}`, "bad");
              btn.disabled = true;
              btn.textContent = t("signing_in");
              try{ await API.login(login,password); location.href="/"; }
              catch (e) {
                Toast.show(e.message || "Login failed", "bad");
                btn.disabled = false;
                btn.textContent = t("sign_in");
              }
            }
          }, t("sign_in"))
        )
      )
    );
    mount.appendChild(root);
  };

  App.bindRouting = function () {
  window.addEventListener("hashchange", () => App.routeNow());
  window.addEventListener("resize", () => {
    App.setSidebar(false);
    if (App.reflowHeaderActions) App.reflowHeaderActions();
  });
};


    App.routeNow = function () {
    const { path, query } = parseHash();
    App.state.current = { path, query };

    App.refreshActiveNav();
    App.refreshPageTitle();

    const host = $("#content");
    if (!host) return;
    host.innerHTML = "";

    if (path === "/main") return App.renderMain(host);
    if (path === "/tasks") return App.renderTasks(host);
    if (path === "/users") return App.renderUsers(host);
    if (path === "/settings") return App.renderSettings(host);
    if (path === "/courses") return App.renderCourses(host);
    if (path === "/clients") return App.renderClients(host);
    if (path === "/projects") return App.renderProjects(host);

    return App.renderStub(host);
  };


  App.renderStub = function (host) {
    host.appendChild(el("div", {
        class: "card cardPad vcol gap10"
      },
      el("div", {
        style: "font-weight:900"
      }, pageTitleByPath(App.state.current.path)),
      el("div", {
        class: "muted"
      }, t("coming_soon"))
    ));
  };

  App.renderMain = async function (host) {
    host.appendChild(el("div", {
      class: "muted"
    }, t("loading")));
    try {
      const r = await API.main();
      const data = r.data || {};
      host.innerHTML = "";
      const box = (title, rows) => {
        return el("div", {
            class: "card"
          },
          el("div", {
              class: "khead"
            },
            el("div", {
              class: "ttl"
            }, title),
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, String((rows || []).length))
          ),
          el("div", {
              class: "cardPad vcol gap10"
            },
            (rows && rows.length) ? rows.map(x => el("div", {
                class: "kcard",
                onClick: () => setHash("/tasks", {
                  open: x.id
                })
              },
              el("div", {
                style: "font-weight:800"
              }, x.title || `#${x.id}`),
              el("div", {
                class: "muted",
                style: "margin-top:6px; white-space:pre-wrap"
              }, (x.description || "").slice(0, 180)),
              el("div", {
                  class: "kmeta"
                },
                el("span", {
                  class: "badge"
                }, `${t("status")}: ${taskStatusLabel(x.status)}`),
                el("span", {
                  class: "badge"
                }, `${t("deadline")}: ${fmtDate(x.deadline_at)}`)
              )
            )) : el("div", {
              class: "muted"
            }, t("no_data"))
          )
        );
      };
      const grid = el("div", {
          class: "grid2"
        },
        box(t("t_in_progress"), data.in_progress ? [data.in_progress] : []),
        box("Today", data.today || [])
      );
      const below = el("div", {
          class: "card cardPad vcol gap10",
          style: "margin-top:12px"
        },
        el("div", {
          style: "font-weight:900"
        }, "Overdue"),
        (data.overdue && data.overdue.length) ? el("div", {
            class: "vcol gap10"
          },
          data.overdue.map(x => el("div", {
              class: "kcard",
              onClick: () => setHash("/tasks", {
                open: x.id
              })
            },
            el("div", {
              style: "font-weight:800"
            }, x.title || `#${x.id}`),
            el("div", {
              class: "muted",
              style: "margin-top:6px; white-space:pre-wrap"
            }, (x.description || "").slice(0, 180)),
            el("div", {
                class: "kmeta"
              },
              el("span", {
                class: "badge"
              }, `${t("status")}: ${taskStatusLabel(x.status)}`),
              el("span", {
                class: "badge"
              }, `${t("deadline")}: ${fmtDate(x.deadline_at)}`)
            )
          ))
        ) : el("div", {
          class: "muted"
        }, t("no_data"))
      );
      host.append(grid, below);
    } catch (e) {
      host.innerHTML = "";
      host.appendChild(el("div", {
          class: "card cardPad vcol gap10"
        },
        el("div", {
          style: "font-weight:900"
        }, t("toast_error")),
        el("div", {
          class: "muted"
        }, e.message || "Error")
      ));
    }
  };

  function bindTouchDrag(cardEl, onDrop) {
  // поддержка: Pointer Events (touch + pen + мышь)
  let dragging = false;
  let started = false;
  let startX = 0, startY = 0;
  let dx = 0, dy = 0;
  let ghost = null;
  let pointerId = null;
  let lastList = null;

  const getCardId = () => {
    // у тебя на карточках стоит data-id
    const raw =
      (cardEl && cardEl.dataset && (cardEl.dataset.id || cardEl.dataset.taskId || cardEl.dataset.projectId || cardEl.dataset.courseId)) ||
      cardEl.getAttribute?.("data-id") ||
      null;

    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : raw; // в норме будет number
  };

  const clearHover = () => {
    if (lastList) {
      lastList.classList.remove("dropHover", "drop");
      lastList = null;
    }
  };

  const pickListAt = (x, y) => {
    const elAt = document.elementFromPoint(x, y);
    if (!elAt) return null;
    return elAt.closest?.(".klist") || elAt.closest?.("[data-drop]") || null;
  };

  const makeGhost = () => {
    const r = cardEl.getBoundingClientRect();
    ghost = cardEl.cloneNode(true);
    ghost.classList.add("drag-ghost");
    ghost.style.position = "fixed";
    ghost.style.left = r.left + "px";
    ghost.style.top = r.top + "px";
    ghost.style.width = r.width + "px";
    ghost.style.zIndex = 9999;
    ghost.style.pointerEvents = "none";
    ghost.style.transform = "translate(0px,0px)";
    ghost.style.opacity = "0.92";
    ghost.style.boxShadow = "0 18px 50px rgba(0,0,0,.45)";
    document.body.appendChild(ghost);
  };

  const moveGhost = (x, y) => {
    if (!ghost) return;
    ghost.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onDown = (e) => {
    // только touch/pen — мышь пусть работает через native drag
    if (e.pointerType === "mouse") return;

    pointerId = e.pointerId;
    started = true;
    dragging = false;
    dx = dy = 0;
    startX = e.clientX;
    startY = e.clientY;

    try { cardEl.setPointerCapture(pointerId); } catch {}

    // запретим скролл страницы пока держим карточку
    e.preventDefault();
  };

  const onMove = (e) => {
    if (!started) return;
    if (pointerId != null && e.pointerId !== pointerId) return;

    dx = e.clientX - startX;
    dy = e.clientY - startY;

    // порог начала перетаскивания
    if (!dragging) {
      if (Math.hypot(dx, dy) < 6) return;
      dragging = true;
      cardEl.classList.add("dragging");
      makeGhost();
    }

    e.preventDefault();
    moveGhost(dx, dy);

    // подсветка колонки под пальцем
    const list = pickListAt(e.clientX, e.clientY);
    if (list && list.classList) {
      if (lastList !== list) {
        clearHover();
        lastList = list;
        lastList.classList.add("dropHover");
      }
    } else {
      clearHover();
    }
  };

  const finish = (e) => {
    if (!started) return;
    if (pointerId != null && e.pointerId !== pointerId) return;

    try { cardEl.releasePointerCapture(pointerId); } catch {}

    started = false;

    const clientX = e.clientX;
    const clientY = e.clientY;

    // cleanup визуала
    if (ghost) ghost.remove();
    ghost = null;

    // если реально перетаскивали — делаем drop
    if (dragging) {
      const target = lastList || pickListAt(clientX, clientY);

      // здесь ожидается, что у drop-зоны есть data-drop (как у тебя)
      // если drop-зона это .klist — бери статус из dataset:
      const status = target?.dataset?.drop || target?.getAttribute?.("data-drop") || null;

      if (status) {
        const id = getCardId();

        // ✅ FIX: если обработчик ждёт (id, status) — передаём так
        // ✅ иначе оставляем старое поведение (status)
        if (typeof onDrop === "function") {
          if (onDrop.length >= 2) onDrop(id, status);
          else onDrop(status);
        }
      }
    }

    dragging = false;
    pointerId = null;
    cardEl.classList.remove("dragging");
    clearHover();
  };

  cardEl.addEventListener("pointerdown", onDown, { passive: false });
  cardEl.addEventListener("pointermove", onMove, { passive: false });
  cardEl.addEventListener("pointerup", finish, { passive: false });
  cardEl.addEventListener("pointercancel", finish, { passive: false });
}




  App.renderTasks = async function (host) {
    const role = App.state.user.role; 
    const isAdmin = role === "admin";
    const isRop = role === "rop";

    const toolbar = el("div", {
      class: "card cardPad vcol gap12"
    });
    const qRow = el("div", {
      class: "hrow gap10",
      style: "flex-wrap:wrap; align-items:center"
    });
    const hint = el("div", {
      class: "muted2",
      style: "font-size:12px"
    }, t("touch_drag_hint"));
    const searchInp = el("input", {
      placeholder: t("search"),
      style: "min-width:220px; flex:1"
    });

    let usersSel = null;
    if (isAdmin) {
      usersSel = el("select", {
        style: "min-width:220px"
      }, el("option", {
        value: ""
      }, `${t("assignee")}: —`));
      qRow.append(usersSel);
    }
    qRow.append(searchInp);

    const createBtn = el("button", {
      class: "btn primary",
      type: "button"
    }, t("create"));
    qRow.append(createBtn);

    toolbar.append(
      el("div", {
          class: "hrow gap10",
          style: "justify-content:space-between; align-items:flex-start; flex-wrap:wrap"
        },
        el("div", {
          class: "vcol gap8"
        }, el("div", {
          style: "font-weight:900"
        }, t("route_tasks")), hint),
        el("div", {
            class: "hrow gap10",
            style: "align-items:center; flex-wrap:wrap"
          },
          el("span", {
            class: "pill"
          }, `${t("me")}: ${App.state.user.full_name||App.state.user.login}`)
        )
      ),
      qRow
    );

    const board = el("div", {
      class: "kanbanWrap",
      id: "taskBoard",
      style: "--cols:5"
    });
    host.append(toolbar, board);


    if (!App.state.cache.users) {
      const list = await API.usersTryList();
      App.state.cache.users = list || [];

      // dropdown сверху только у admin — поэтому проверяем
      if (usersSel) {
        for (const u of App.state.cache.users) {
          usersSel.appendChild(el("option", {
            value: String(u.id)
          }, `${u.full_name} (${u.role})`));
        }
      }
    }


    if (!App.state.cache.projects) {
      const pr = await API.projectsTryList();
      App.state.cache.projects = pr || [];
    }

    // ✅ Project filter (по ТЗ)
let projectSel = null;
const qpid0 = (App.state.current.query && App.state.current.query.project_id)
  ? String(App.state.current.query.project_id)
  : "";

if (Array.isArray(App.state.cache.projects) && App.state.cache.projects.length) {
  projectSel = el("select", { class: "sel" });
  projectSel.appendChild(el("option", { value: "" }, `${t("filter_project")}: ${t("filter_project_all")}`));

  for (const p of App.state.cache.projects) {
    const title = (p.company_name || p.client_company_name || `#${p.id}`);
    const svc = (p.service_name_uz || p.service_name_ru || p.service_name_en || "");
    projectSel.appendChild(el("option", { value: String(p.id) }, svc ? `${title} — ${svc}` : title));
  }

  projectSel.value = qpid0;
  qRow.appendChild(projectSel);

  // меняем hash → Tasks перерендерится сам
  projectSel.addEventListener("change", () => {
  const sp = new URLSearchParams(window.location.hash.split("?")[1] || "");
  if (projectSel.value) sp.set("project_id", projectSel.value);
  else sp.delete("project_id");

  // одноразовые флаги нельзя тянуть дальше, иначе будет мусор
  sp.delete("open_create");
  sp.delete("open");

  const qs = sp.toString();
  window.location.hash = qs ? `#/tasks?${qs}` : "#/tasks";
});

}


    const cols = [{
        key: "new",
        label: t("t_new")
      },
      {
        key: "pause",
        label: t("t_pause")
      },
      {
        key: "in_progress",
        label: t("t_in_progress")
      },
      {
        key: "done",
        label: t("t_done")
      },
      {
        key: "canceled",
        label: t("t_canceled")
      },
    ];

    const colEls = {};
    board.innerHTML = "";
    for (const c of cols) {
      const col = el("div", {
          class: "card kcol",
          "data-status": c.key
        },
        el("div", {
            class: "khead"
          },
          el("div", {
            class: "ttl"
          }, c.label),
          el("div", {
            class: "muted2",
            style: "font-size:12px"
          }, "0")
        ),
        el("div", {
          class: "klist",
          "data-drop": c.key
        })
      );
      board.appendChild(col);
      colEls[c.key] = col;
    }

    let all = [];
    const openId = App.state.current.query && App.state.current.query.open ? Number(App.state.current.query.open) : null;

    const refreshCounts = () => {
      for (const c of cols) {
        const list = colEls[c.key].querySelector(".klist");
        colEls[c.key].querySelector(".khead .muted2").textContent = String(list.children.length);
      }
    };

    const canEdit = (row) => (row.created_by === App.state.user.id) || isAdmin || isRop;
    const canStart = (row) => (row.assignee_user_id === App.state.user.id) || isAdmin || isRop;

    async function doMove(id, status, extra = {}) {
      try {
        await API.tasks.move(id, status, extra);
        Toast.show(t("toast_saved"), "ok");
        await load();
      } catch (e) {
        Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
      }
    }

    function render() {
      for (const c of cols) colEls[c.key].querySelector(".klist").innerHTML = "";
      const q = (searchInp.value || "").trim().toLowerCase();
      const filtered = all.filter(x => {
        if (!q) return true;
        const s = `${x.title||""} ${x.description||""} ${x.assignee_name||""} ${x.project_company_name||""}`.toLowerCase();
        return s.includes(q);
      });

      for (const x of filtered) {
        const dot = el("span", {
          class: "dot",
          style: `background:${statusDotColor(x.status)}`
        });
        const head = el("div", {
            class: "hrow gap8",
            style: "align-items:center; justify-content:space-between"
          },
          el("div", {
            style: "font-weight:900; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap"
          }, dot, x.title || `#${x.id}`),
          el("div", {
            class: "muted2",
            style: "font-size:12px; font-family:var(--mono)"
          }, `#${x.id}`)
        );
        const body = el("div", {
          class: "muted",
          style: "margin-top:6px; white-space:pre-wrap"
        }, (x.description || "").slice(0, 180));
        const meta = el("div", {
            class: "kmeta"
          },
          el("span", {
            class: "badge"
          }, `${t("assignee")}: ${x.assignee_name||"—"}`),
          x.project_company_name ? el("span", {
            class: "badge"
          }, `${t("project")}: ${x.project_company_name}`) : null,
          x.deadline_at ? el("span", {
            class: "badge"
          }, `${t("deadline")}: ${fmtDate(x.deadline_at)}`) : null,
          el("span", {
            class: "badge"
          }, `${t("spent")}: ${fmtDuration(x.spent_seconds)}`)
        );

        const openBtn = el("button", {
          class: "btn ghost mini",
          type: "button",
          onClick: (e) => {
            e.stopPropagation();
            openTaskView(x.id);
          }
        }, t("open"));

        const actionsRow = el("div", {
          class: "kcardActions"
        }, openBtn);

        const card = el("div", {
          class: "kcard",
          draggable: "true",
          "data-id": String(x.id),

          onDragstart: (e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(x.id));
            card.classList.add("dragging");
          },
          onDragend: () => card.classList.remove("dragging")
        }, head, body, meta, actionsRow);


        bindTouchDrag(card, async (id, targetStatus) => {
          const row = all.find(z => z.id === id);
          if (!row || row.status === targetStatus) return;
          if (targetStatus === "canceled") {
            const reason = await Modal.prompt(t("reason"), t("need_reason"));
            if (!reason) return;
            await doMove(id, targetStatus, {
              cancel_reason: reason
            });
            return;
          }
          await doMove(id, targetStatus);
        });

        const list = colEls[x.status] ?.querySelector(".klist");
        if (list) list.appendChild(card);
      }
      refreshCounts();
    }

    async function load() {
      try {
        const assignee_user_id = isAdmin ? (usersSel?.value || "") : "";

const project_id =
  (projectSel && projectSel.value) ? projectSel.value :
  ((App.state.current.query && App.state.current.query.project_id) ? String(App.state.current.query.project_id) : "");

const r = await API.tasks.list({
  assignee_user_id: assignee_user_id ? Number(assignee_user_id) : null,
  project_id: project_id ? Number(project_id) : null, // ✅ ВАЖНО по ТЗ
});

        all = (r.data || []).slice();
        render();
        if (openId) openTask(openId);

// one-time: открыть создание задачи из Projects (#/tasks?project_id=..&open_create=1)
const q = (App.state.current && App.state.current.query) ? App.state.current.query : {};
if (String(q.open_create || "") === "1") {
  openTaskCreate({ project_id: q.project_id ? Number(q.project_id) : null });

  // убрать флаг, чтобы модалка не открывалась снова при refresh
  try {
    const sp = new URLSearchParams(window.location.hash.split("?")[1] || "");
    sp.delete("open_create");
    const qs2 = sp.toString();
    window.location.hash = qs2 ? `#/tasks?${qs2}` : "#/tasks";
  } catch {}
}

      } catch (e) {
        Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
      }
    }

    for (const c of cols) {
      const drop = colEls[c.key].querySelector(".klist");
      drop.addEventListener("dragover", (e) => e.preventDefault());
      drop.addEventListener("drop", async (e) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData("text/plain"));
        if (!id) return;
        const row = all.find(x => x.id === id);
        if (!row || row.status === c.key) return;
        if (c.key === "canceled") {
          const reason = await Modal.prompt(t("reason"), t("need_reason"));
          if (!reason) return;
          await doMove(id, c.key, {
            cancel_reason: reason
          });
          return;
        }
        await doMove(id, c.key);
      });
    }

    async function openTaskView(id) {
      try {
        const r = await API.tasks.get(id);
        const x = r.data;

        const view = el("div", {
            class: "vcol gap10"
          },
          el("div", {
              class: "grid2"
            },
            el("div", {
                class: "vcol gap8"
              },
              el("div", {
                class: "muted2",
                style: "font-size:12px"
              }, t("status")),
              el("div", {
                style: "font-weight:900"
              }, taskStatusLabel(x.status))
            ),
            el("div", {
                class: "vcol gap8"
              },
              el("div", {
                class: "muted2",
                style: "font-size:12px"
              }, t("spent")),
              el("div", {
                style: "font-weight:900"
              }, fmtDuration(x.spent_seconds))
            )
          ),
          el("div", {
              class: "grid2"
            },
            el("div", {
                class: "vcol gap8"
              },
              el("div", {
                class: "muted2",
                style: "font-size:12px"
              }, t("assignee")),
              el("div", {}, x.assignee_name || "—")
            ),
            el("div", {
                class: "vcol gap8"
              },
              el("div", {
                class: "muted2",
                style: "font-size:12px"
              }, t("deadline")),
              el("div", {}, fmtDate(x.deadline_at))
            )
          ),
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("project")),
            el("div", {}, x.project_company_name || "—")
          ),
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("title")),
            el("div", {
              style: "font-weight:900"
            }, x.title || `#${x.id}`)
          ),
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("description")),
            el("div", {
              class: "muted",
              style: "white-space:pre-wrap"
            }, x.description || "—")
          ),
          el("div", {
            class: "muted2",
            style: "font-size:12px"
          }, `Updated: ${fmtDate(x.updated_at)}`)
        );

        const role = App.state.user.role;
        const isAdmin = role === "admin";
        const isRop = role === "rop";
        const canEdit = (x.created_by === App.state.user.id) || isAdmin || isRop;
        const canStart = (x.assignee_user_id === App.state.user.id) || isAdmin || isRop;

        const actions = [];

        // ✎ Edit
        if (canEdit) {
          actions.push({
            label: "✎ " + (DICT[App.state.lang] ?.edit || "Edit"),
            kind: "primary",
            onClick: () => {
              Modal.close();
              openTaskEdit(x.id);
            }
          });
        }

        // Status actions
        const doMove = async (status, extra = {}) => {
          try {
            await API.tasks.move(x.id, status, extra);
            Toast.show(t("toast_saved"), "ok");
            Modal.close();
            await load();
          } catch (e) {
            Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
          }
        };

        if (canStart && x.status !== "in_progress" && x.status !== "done" && x.status !== "canceled") {
          actions.push({
            label: t("action_start"),
            kind: "ghost",
            onClick: () => doMove("in_progress")
          });
        }
        if (x.status === "in_progress") {
          actions.push({
            label: t("action_pause"),
            kind: "ghost",
            onClick: () => doMove("pause")
          });
        }
        if (x.status !== "done" && x.status !== "canceled") {
          actions.push({
            label: t("action_done"),
            kind: "ghost",
            onClick: () => doMove("done")
          });
          actions.push({
            label: t("action_cancel"),
            kind: "danger",
            onClick: async () => {
              const reason = await Modal.prompt(t("reason"), t("need_reason"));
              if (!reason) return;
              await doMove("canceled", {
                cancel_reason: reason
              });
            }
          });
        }

        actions.push({
          label: t("close"),
          kind: "ghost",
          onClick: () => Modal.close()
        });

        Modal.open(`${t("open")} #${x.id}`, view, actions);
      } catch (e) {
        Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
      }
    }

    async function openTaskEdit(id) {
  try {
    const r = await API.tasks.get(id);
    const x = r.data;

    const role = App.state.user.role;
    const isAdmin = role === "admin";
    const isRop = role === "rop";
    const canEdit = (x.created_by === App.state.user.id) || isAdmin || isRop;
    if (!canEdit) return openTaskView(id);

    const titleInp = el("input", {
      class: "input",
      value: x.title || "",
      placeholder: t("title")
    });

    const descInp = el("textarea", {
      class: "input",
      rows: 6,
      placeholder: t("description")
    }, x.description || "");

    const deadlineInp = el("input", {
      class: "input",
      type: "datetime-local"
    });

    if (x.deadline_at) {
      const d = new Date(x.deadline_at * 1000);
      const pad = (n) => String(n).padStart(2, "0");
      deadlineInp.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    const projectSel = el("select", { class: "sel" }, el("option", { value: "" }, "—"));
    for (const p of (App.state.cache.projects || [])) {
      projectSel.appendChild(el("option", {
        value: String(p.id),
        selected: p.id === x.project_id
      }, p.company_name ? `#${p.id} · ${p.company_name}` : `#${p.id}`));
    }

    let assigneeSel = null;
    if (isAdmin) {
      assigneeSel = el("select", { class: "sel" },
        ...(App.state.cache.users || []).map(u => el("option", {
          value: String(u.id),
          selected: u.id === x.assignee_user_id
        }, `${u.full_name} (${u.role})`))
      );
    }

    const form = el("div", { class: "vcol gap10" },
      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("assignee")),
          isAdmin ? assigneeSel : el("div", {}, x.assignee_name || "—")
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("deadline")),
          deadlineInp
        )
      ),
      el("div", { class: "vcol gap8" },
        el("div", { class: "muted2", style: "font-size:12px" }, t("project")),
        projectSel
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

    Modal.open("✎ " + (DICT[App.state.lang]?.edit || "Edit"), form, [
      { label: t("cancel"), kind: "ghost", onClick: () => Modal.close() },
      {
        label: t("save"),
        kind: "primary",
        onClick: async () => {
          try {
            const deadline_at = deadlineInp.value ? Math.floor(new Date(deadlineInp.value).getTime() / 1000) : null;

            const body = {
              title: (titleInp.value || "").trim() || null,
              description: (descInp.value || "").trim(),
              deadline_at,
              project_id: projectSel.value ? Number(projectSel.value) : null,
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
      },
      {
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
      }
    ]);

    setTimeout(() => descInp.focus(), 0);
  } catch (e) {
    Toast.show(`${t("toast_error")}: ${e.message || "error"}`, "bad");
  }
}



    function openTaskCreate(preset = {}) {
      const titleInp = el("input", { class: "input", placeholder: t("title") });
      const descInp = el("textarea", { class: "input", rows: 5, placeholder: t("description") });
      const deadlineInp = el("input", { class: "input", type: "datetime-local" });

      const projSel = el("select", { class: "sel" }, el("option", { value: "" }, "—"));
      for (const p of (App.state.cache.projects || [])) {
        projSel.appendChild(el("option", { value: String(p.id) },
          p.company_name ? `#${p.id} · ${p.company_name}` : `#${p.id}`
        ));
      }

      if (preset && preset.project_id) projSel.value = String(preset.project_id);
      // если фильтр сверху выбран — пусть тоже подставляется
      if (!projSel.value && projectSel && projectSel.value) projSel.value = String(projectSel.value);

      let assigneeSel = el("select", { class: "sel" });

      const usersForSelect = (App.state.cache.users && App.state.cache.users.length)
      ? App.state.cache.users
      : [{ id: App.state.user.id, full_name: (App.state.user.full_name || App.state.user.login), role: App.state.user.role }];

      for (const u of usersForSelect) {
        assigneeSel.appendChild(el("option", {
          value: String(u.id),
          selected: (preset && preset.assignee_user_id)
          ? (u.id === preset.assignee_user_id)
          : (u.id === App.state.user.id)
        }, `${u.full_name}${u.role ? ` (${u.role})` : ""}`));
      }


      const body = el("div", { class: "vcol gap10" },
      el("div", { class: "grid2" },
      el("div", { class: "vcol gap8" },
        el("div", { class: "muted2", style: "font-size:12px" }, t("assignee")),
        el("div", {}, assigneeSel)
      ),
      el("div", { class: "vcol gap8" },
        el("div", { class: "muted2", style: "font-size:12px" }, t("deadline")),
        deadlineInp
      )
    ),
    el("div", { class: "vcol gap8" },
      el("div", { class: "muted2", style: "font-size:12px" }, t("project")),
      projSel
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
    {
      label: t("create"),
      kind: "primary",
      onClick: async () => {
        try {
          const payload = {
            title: (titleInp.value || "").trim() || null,
            description: (descInp.value || "").trim(),
            assignee_user_id: assigneeSel ? Number(assigneeSel.value) : App.state.user.id,
            project_id: projSel.value ? Number(projSel.value) : null,
            deadline_at: deadlineInp.value ? Math.floor(new Date(deadlineInp.value).getTime() / 1000) : null,
          };

          if (!payload.title) return Toast.show(`${t("toast_error")}: ${t("title")}`, "bad");
          if (!payload.description) return Toast.show(`${t("toast_error")}: ${t("description")}`, "bad");

          await API.tasks.create(payload);
          Toast.show(t("toast_saved"), "ok");
          Modal.close();
          await load();
        } catch (e) {
          Toast.show(`${t("toast_error")}: ${e.message || "error"}`, "bad");
        }
      }
    }
  ]);

  setTimeout(() => descInp.focus(), 0);
}

createBtn.addEventListener("click", () => {
  openTaskCreate({ project_id: (projectSel && projectSel.value) ? Number(projectSel.value) : null });
});


    searchInp.addEventListener("input", () => render());
    if (usersSel) usersSel.addEventListener("change", () => load());

    await load();
  };

  App.renderUsers = async function (host) {
    const role = App.state.user.role;
    if (role !== "admin") {
      host.innerHTML = "";
      host.appendChild(el("div", {
          class: "card cardPad vcol gap10"
        },
        el("div", {
          style: "font-weight:900"
        }, "Forbidden"),
        el("div", {
          class: "muted"
        }, "Only admin")
      ));
      return;
    }

    const top = el("div", {
        class: "card cardPad vcol gap12"
      },
      el("div", {
        style: "font-weight:900"
      }, t("route_users")),
      el("div", {
          class: "uToolbar"
        },
        el("input", {
          id: "uSearch",
          placeholder: t("search"),
          style: "min-width:240px; flex:1"
        }),
        el("div", {
            class: "seg",
            title: "Filter"
          },
          el("button", {
            type: "button",
            id: "uOnlyActiveBtn",
            class: "active"
          }, t("only_active")),
          el("button", {
            type: "button",
            id: "uAllBtn"
          }, t("all_users"))
        ),
        el("button", {
          class: "btn primary",
          type: "button",
          id: "uCreateBtn"
        }, t("user_create"))
      )
    );

    const listWrap = el("div", {
        class: "card cardPad vcol gap10"
      },
      el("div", {
        class: "muted2",
        id: "uCount",
        style: "font-size:12px"
      }, ""),
      el("div", {
        class: "uList",
        id: "uList"
      }, el("div", {
        class: "muted"
      }, t("loading")))
    );

    host.append(top, listWrap);

    const searchInp = $("#uSearch", host);
    const onlyActiveBtn = $("#uOnlyActiveBtn", host);
    const allBtn = $("#uAllBtn", host);
    const createBtn = $("#uCreateBtn", host);
    const uList = $("#uList", host);
    const uCount = $("#uCount", host);

    let onlyActive = true;
    let all = [];

    const ROLES = ["admin", "pm", "fin", "sale", "rop"];

    function fmtTs(ts) {
      if (!ts) return "—";
      try {
        return fmtDate(ts);
      } catch {
        return "—";
      }
    }

    function render() {
      const q = (searchInp.value || "").trim().toLowerCase();
      const rows = all.filter(u => {
        if (onlyActive && !Number(u.is_active)) return false;
        if (!q) return true;
        const s = `${u.id} ${u.full_name||""} ${u.login||""} ${u.phone||""} ${u.role||""}`.toLowerCase();
        return s.includes(q);
      });

      uCount.textContent = `${t("users_total")}: ${rows.length}`;

      uList.innerHTML = "";
      if (!rows.length) {
        uList.appendChild(el("div", {
          class: "muted"
        }, t("no_data")));
        return;
      }

      for (const u of rows) {
        const activeBadge = Number(u.is_active) ?
          el("span", {
            class: "badge ok"
          }, "ON") :
          el("span", {
            class: "badge off"
          }, "OFF");

        const actions = el("div", {
            class: "uActions hdrActions"
          },
          el("button", {
            class: "btn mini ghost",
            type: "button",
            onClick: () => openUserView(u)
          }, t("open")),
          el("button", {
            class: "btn mini ghost",
            type: "button",
            onClick: () => openUserEdit(u)
          }, "✎ " + t("edit")),
          el("button", {
            class: "btn mini ghost",
            type: "button",
            onClick: () => openResetPassword(u)
          }, t("reset_password")),
          Number(u.is_active) ?
          el("button", {
            class: "btn mini danger",
            type: "button",
            onClick: () => deactivateUser(u)
          }, t("deactivate")) :
          el("button", {
            class: "btn mini primary",
            type: "button",
            onClick: () => activateUser(u)
          }, t("activate"))
        );

        const row = el("div", {
            class: "uCard"
          },
          el("div", {
              class: "uRow"
            },
            el("div", {
              class: "uId"
            }, `#${u.id}`),
            el("div", {
                class: "vcol gap8"
              },
              el("div", {
                class: "uName"
              }, u.full_name || "—"),
              el("div", {
                class: "uMeta"
              }, `${t("role")}: ${u.role}  •  ${t("login")}: ${u.login}`)
            ),
            el("div", {
                class: "vcol gap8 uHideLg"
              },
              el("div", {
                class: "muted2",
                style: "font-size:12px"
              }, t("phone")),
              el("div", {}, u.phone || "—")
            ),
            el("div", {
                class: "vcol gap8 uHideLg"
              },
              el("div", {
                class: "muted2",
                style: "font-size:12px"
              }, t("last_login")),
              el("div", {}, fmtTs(u.last_login_at))
            ),
            el("div", {
              class: "hrow gap8",
              style: "align-items:center"
            }, activeBadge, el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("active"))),
            el("div", {
                class: "vcol gap8 uHideLg"
              },
              el("div", {
                class: "muted2",
                style: "font-size:12px"
              }, t("created_at")),
              el("div", {}, fmtTs(u.created_at))
            ),
            actions
          )
        );

        uList.appendChild(row);
      }
    }

    async function load() {
      try {
        const r = await API.users.list();
        all = (r.data || []).slice();
        App.state.cache.users = all; // чтобы tasks-admin фильтр всегда был актуальным
        render();
      } catch (e) {
        uList.innerHTML = "";
        uList.appendChild(el("div", {
          class: "muted"
        }, `${t("toast_error")}: ${e.message||"error"}`));
      }
    }

    function openUserView(u) {
      const body = el("div", {
          class: "vcol gap10"
        },
        el("div", {
            class: "grid2"
          },
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("full_name")),
            el("div", {
              style: "font-weight:900"
            }, u.full_name || "—")
          ),
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("role")),
            el("div", {
              style: "font-weight:900"
            }, u.role)
          )
        ),
        el("div", {
            class: "grid2"
          },
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("login")),
            el("div", {}, u.login)
          ),
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("phone")),
            el("div", {}, u.phone || "—")
          )
        ),
        el("div", {
            class: "grid2"
          },
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("created_at")),
            el("div", {}, fmtTs(u.created_at))
          ),
          el("div", {
              class: "vcol gap8"
            },
            el("div", {
              class: "muted2",
              style: "font-size:12px"
            }, t("last_login")),
            el("div", {}, fmtTs(u.last_login_at))
          )
        ),
        el("div", {
          class: "muted2",
          style: "font-size:12px"
        }, `${t("updated_at")}: ${fmtTs(u.updated_at)}`)
      );

      Modal.open(`${t("open")} #${u.id}`, body, [{
          label: "✎ " + t("edit"),
          kind: "primary",
          onClick: () => {
            Modal.close();
            openUserEdit(u);
          }
        },
        {
          label: t("reset_password"),
          kind: "ghost",
          onClick: () => {
            Modal.close();
            openResetPassword(u);
          }
        },
        {
          label: t("close"),
          kind: "ghost",
          onClick: () => Modal.close()
        }
      ]);
    }

    function openUserEdit(u) {
      const fullName = el("input", {
        value: u.full_name || "",
        placeholder: t("full_name")
      });
      const phone = el("input", {
        value: u.phone || "",
        placeholder: t("phone")
      });
      const login = el("input", {
        value: u.login || "",
        placeholder: t("login")
      });

      const roleSel = el("select", {});
      for (const rr of ROLES) {
        roleSel.appendChild(el("option", {
          value: rr,
          selected: rr === u.role
        }, rr));
      }

      const activeSel = el("select", {});
      activeSel.appendChild(el("option", {
        value: "1",
        selected: Number(u.is_active) === 1
      }, "ON"));
      activeSel.appendChild(el("option", {
        value: "0",
        selected: Number(u.is_active) === 0
      }, "OFF"));

      const form = el("div", {
          class: "vcol gap10"
        },
        el("div", {
            class: "grid2"
          },
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("full_name")),
            fullName
          ),
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("phone")),
            phone
          )
        ),
        el("div", {
            class: "grid2"
          },
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("login")),
            login
          ),
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("role")),
            roleSel
          )
        ),
        el("div", {
            class: "grid2"
          },
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("active")),
            activeSel
          ),
          el("div", {})
        )
      );

      Modal.open("✎ " + t("edit"), form, [{
          label: t("cancel"),
          kind: "ghost",
          onClick: () => Modal.close()
        },
        {
          label: t("save"),
          kind: "primary",
          onClick: async () => {
            try {
              await API.users.update(u.id, {
                full_name: (fullName.value || "").trim() || null,
                phone: (phone.value || "").trim() || null,
                login: (login.value || "").trim() || null,
                role: roleSel.value,
                is_active: Number(activeSel.value) ? 1 : 0
              });
              Toast.show(t("user_updated"), "ok");
              Modal.close();
              await load();
            } catch (e) {
              Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
            }
          }
        }
      ]);
    }

    function openResetPassword(u) {
      const pass = el("input", {
        type: "password",
        placeholder: t("new_password")
      });
      const body = el("div", {
          class: "vcol gap10"
        },
        el("div", {
          class: "muted"
        }, `${u.full_name || u.login} (#${u.id})`),
        el("label", {
            class: "vcol gap8"
          },
          el("span", {
            class: "muted2",
            style: "font-size:12px"
          }, t("new_password")),
          pass
        )
      );

      Modal.open(t("reset_password"), body, [{
          label: t("cancel"),
          kind: "ghost",
          onClick: () => Modal.close()
        },
        {
          label: t("confirm"),
          kind: "primary",
          onClick: async () => {
            const np = (pass.value || "").trim();
            if (!np) return;
            try {
              await API.users.resetPassword(u.id, np);
              Toast.show(t("password_changed"), "ok");
              Modal.close();
            } catch (e) {
              Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
            }
          }
        }
      ]);

      setTimeout(() => pass.focus(), 0);
    }

    async function deactivateUser(u) {
      const ok = await Modal.confirm(t("confirm"), `${t("deactivate")} #${u.id}?`);
      if (!ok) return;
      try {
        await API.users.deactivate(u.id);
        Toast.show(t("user_deactivated"), "ok");
        await load();
      } catch (e) {
        Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
      }
    }

    async function activateUser(u) {
      try {
        await API.users.update(u.id, {
          is_active: 1
        });
        Toast.show(t("user_updated"), "ok");
        await load();
      } catch (e) {
        Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
      }
    }

    function openCreate() {
      const fullName = el("input", {
        placeholder: t("full_name")
      });
      const phone = el("input", {
        placeholder: t("phone")
      });
      const login = el("input", {
        placeholder: t("login")
      });
      const pass = el("input", {
        type: "password",
        placeholder: t("new_password")
      });

      const roleSel = el("select", {});
      for (const rr of ROLES) {
        roleSel.appendChild(el("option", {
          value: rr
        }, rr));
      }

      const form = el("div", {
          class: "vcol gap10"
        },
        el("div", {
            class: "grid2"
          },
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("full_name")),
            fullName
          ),
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("phone")),
            phone
          )
        ),
        el("div", {
            class: "grid2"
          },
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("login")),
            login
          ),
          el("label", {
              class: "vcol gap8"
            },
            el("span", {
              class: "muted2",
              style: "font-size:12px"
            }, t("role")),
            roleSel
          )
        ),
        el("label", {
            class: "vcol gap8"
          },
          el("span", {
            class: "muted2",
            style: "font-size:12px"
          }, t("new_password")),
          pass
        )
      );

      Modal.open(t("user_create"), form, [{
          label: t("cancel"),
          kind: "ghost",
          onClick: () => Modal.close()
        },
        {
          label: t("create"),
          kind: "primary",
          onClick: async () => {
            const payload = {
              full_name: (fullName.value || "").trim(),
              phone: (phone.value || "").trim() || null,
              login: (login.value || "").trim(),
              role: roleSel.value,
              new_password: (pass.value || "").trim()
            };
            if (!payload.full_name || !payload.login || !payload.new_password) return;
            try {
              await API.users.create(payload);
              Toast.show(t("user_created"), "ok");
              Modal.close();
              await load();
            } catch (e) {
              Toast.show(`${t("toast_error")}: ${e.message||"error"}`, "bad");
            }
          }
        }
      ]);

      setTimeout(() => fullName.focus(), 0);
    }

    onlyActiveBtn.addEventListener("click", () => {
      onlyActive = true;
      onlyActiveBtn.classList.add("active");
      allBtn.classList.remove("active");
      render();
    });
    allBtn.addEventListener("click", () => {
      onlyActive = false;
      allBtn.classList.add("active");
      onlyActiveBtn.classList.remove("active");
      render();
    });
    searchInp.addEventListener("input", () => render());
    createBtn.addEventListener("click", () => openCreate());

    await load();
  };


  

    function isLoginPage(){
    const p = ((location.pathname || "/").replace(/\/+$/,"")) || "/";
    return (
      p === "/login" ||
      p === "/login.html" ||
      p.endsWith("/login/index.html")
    );
  }

  function injectSettingsStyles(){
  if($("#gsoftSettingsStyles")) return;
  const css=`
.setGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:980px){.setGrid{grid-template-columns:1fr}}
.rowLine{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--stroke);border-radius:16px;background:rgba(255,255,255,.04)}
.rowLine:hover{background:rgba(255,255,255,.06)}
.rowMain{min-width:0}
.rowTitle{font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rowSub{color:var(--muted);font-size:12px;margin-top:4px;display:flex;flex-wrap:wrap;gap:8px}
.rowActions{display:flex;gap:8px;flex:0 0 auto}
.miniIcon{padding:8px 10px;border-radius:12px}
.scrollBox{max-height:420px;overflow:auto;padding-right:6px}
@media (max-width:900px){.scrollBox{max-height:none}}
  `.trim();
  document.head.appendChild(el("style",{id:"gsoftSettingsStyles"},css));
}

function dateToSec(dateStr){
  if(!dateStr) return null;
  const d=new Date(`${dateStr}T00:00:00`);
  return Math.floor(d.getTime()/1000);
}
function secToDateInput(sec){
  if(!sec) return "";
  const d=new Date(sec*1000);
  const yyyy=d.getFullYear();
  const mm=String(d.getMonth()+1).padStart(2,"0");
  const dd=String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}
function langLabel3(row){
  const k=`name_${App.state.lang}`;
  return row?.[k] || row?.name_uz || row?.name_ru || row?.name_en || `#${row?.id||""}`;
}

async function tryLoadThemeFromServer(){
  try{
    const r=await API.settings.themeGet(); // admin-only, но мы ловим ошибки
    const v=r?.data?.value || null;
    App.state.themeCfg = normalizeThemeCfg(v);
    applyTheme();
  }catch{}
}

App.renderSettings = async function(host){
  injectSettingsStyles();

  if((App.state.user?.role||"")!=="admin"){
    host.appendChild(el("div",{class:"card cardPad vcol gap10"},
      el("div",{style:"font-weight:900"}, t("toast_error")),
      el("div",{class:"muted"},"Only admin")
    ));
    return;
  }

  const state={
    themeCfg: normalizeThemeCfg(App.state.themeCfg),
    cities:[], spheres:[], sources:[], service_types:[], course_types:[]
  };

  const loadAll = async ()=>{
    const [themeR,citiesR,spheresR,sourcesR,serviceR,courseR] = await Promise.all([
      API.settings.themeGet(),
      API.settings.dictList("cities"),
      API.settings.dictList("spheres"),
      API.settings.dictList("sources"),
      API.settings.dictList("service_types"),
      API.settings.dictList("course_types"),
    ]);
    state.themeCfg = normalizeThemeCfg(themeR?.data?.value || null);
    state.cities = citiesR?.data || [];
    state.spheres = spheresR?.data || [];
    state.sources = sourcesR?.data || [];
    state.service_types = serviceR?.data || [];
    state.course_types = courseR?.data || [];
    App.state.themeCfg = state.themeCfg;
    applyTheme();
  };

  const openThemeModal = ()=>{
    const cfg = JSON.parse(JSON.stringify(state.themeCfg));

    const mkColor = (label, value, on)=>{
      const inp=el("input",{type:"color",value:value||"#000000",onInput:(e)=>on(e.target.value)});
      return el("div",{class:"hrow gap10",style:"align-items:center; justify-content:space-between"},
        el("div",{class:"muted2",style:"font-size:12px"},label),
        inp
      );
    };
    const mkRange = (label, value, on)=>{
      const inp=el("input",{type:"range",min:"0",max:"1",step:"0.01",value:String(value??0.12),onInput:(e)=>on(Number(e.target.value))});
      const val=el("div",{class:"muted2",style:"font-family:var(--mono); font-size:12px"}, String(value??0.12));
      inp.addEventListener("input",()=>val.textContent=String(inp.value));
      return el("div",{class:"vcol gap8"},
        el("div",{class:"hrow",style:"justify-content:space-between; align-items:center"},
          el("div",{class:"muted2",style:"font-size:12px"},label),
          val
        ),
        inp
      );
    };

    const body=el("div",{class:"vcol gap12"},
      el("div",{class:"card cardPad vcol gap12"},
        el("div",{style:"font-weight:900"}, t("theme_dark_block")),
        mkColor(t("theme_bg"), cfg.dark.bg, v=>cfg.dark.bg=v),
        mkColor(t("theme_text"), cfg.dark.text, v=>cfg.dark.text=v),
        mkColor(t("theme_accent"), cfg.dark.accent, v=>cfg.dark.accent=v),
      ),
      el("div",{class:"card cardPad vcol gap12"},
        el("div",{style:"font-weight:900"}, t("theme_light_block")),
        mkColor(t("theme_bg"), cfg.light.bg, v=>cfg.light.bg=v),
        mkColor(t("theme_text"), cfg.light.text, v=>cfg.light.text=v),
        mkColor(t("theme_accent"), cfg.light.accent, v=>cfg.light.accent=v),
      ),
      el("div",{class:"card cardPad vcol gap12"},
        el("div",{style:"font-weight:900"}, "Eye"),
        mkColor(t("theme_eye_tint"), cfg.eye.tint, v=>cfg.eye.tint=v),
        mkRange(t("theme_eye_power"), cfg.eye.strength, v=>cfg.eye.strength=v),
      )
    );

    Modal.open(t("settings_theme"), body, [
      {label:t("cancel"),kind:"ghost",onClick:()=>Modal.close()},
      {label:t("save"),kind:"primary",onClick:async()=>{
        try{
          await API.settings.themeSet(cfg);
          state.themeCfg = normalizeThemeCfg(cfg);
          App.state.themeCfg = state.themeCfg;
          applyTheme();
          Toast.show(t("settings_saved_apply"),"ok");
          Modal.close();
          render();
        }catch(e){
          Toast.show(`${t("toast_error")}: ${e.message||"error"}`,"bad");
        }
      }},
    ]);
  };

  const openDictModal = (kind, is3lang, item)=>{
    const isEdit=!!item;
    const title = `${t(isEdit?"btn_update":"btn_add")}: ${kind}`;

    const sortInp=el("input",{type:"number",value:String(item?.sort ?? 1000),placeholder:"1000"});
    const activeInp=el("input",{type:"checkbox"});
    activeInp.checked = item ? (Number(item.is_active)!==0) : true;

    const fields=[];
    if(is3lang){
      const ru=el("input",{value:item?.name_ru||"",placeholder:"RU"});
      const uz=el("input",{value:item?.name_uz||"",placeholder:"UZ"});
      const en=el("input",{value:item?.name_en||"",placeholder:"EN"});
      fields.push(
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_name_ru")), ru),
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_name_uz")), uz),
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_name_en")), en),
      );

      const body=el("div",{class:"vcol gap12"},
        ...fields,
        el("div",{class:"grid2"},
          el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_sort")), sortInp),
          el("label",{class:"hrow gap10",style:"align-items:center; justify-content:space-between"},
            el("span",{class:"muted2",style:"font-size:12px"},t("field_active")), activeInp
          )
        )
      );

      Modal.open(title, body, [
        {label:t("cancel"),kind:"ghost",onClick:()=>Modal.close()},
        {label:t("save"),kind:"primary",onClick:async()=>{
          const payload={
            name_ru:(ru.value||"").trim(),
            name_uz:(uz.value||"").trim(),
            name_en:(en.value||"").trim(),
            sort:Number(sortInp.value||1000),
            is_active: activeInp.checked ? 1 : 0,
          };
          if(!payload.name_ru||!payload.name_uz||!payload.name_en){
            Toast.show(`${t("toast_error")}: ${t("field_name")}`,"bad"); return;
          }
          try{
            if(isEdit) await API.settings.dictUpdate(kind,item.id,payload);
            else await API.settings.dictCreate(kind,payload);
            Toast.show(t("toast_saved"),"ok");
            Modal.close();
            await reload();
          }catch(e){
            Toast.show(`${t("toast_error")}: ${e.message||"error"}`,"bad");
          }
        }},
      ]);
      return;
    }

    // course_types (one language)
    const nameInp=el("input",{value:item?.name||"",placeholder:t("field_name")});
    const dateInp=el("input",{type:"date",value:secToDateInput(item?.start_date)});
    const priceInp=el("input",{type:"number",value:String(item?.price ?? 0),placeholder:"0"});
    const curSel=el("select",{},
      el("option",{value:"UZS"},"UZS"),
      el("option",{value:"USD"},"USD")
    );
    curSel.value = item?.currency || "UZS";

    const body=el("div",{class:"vcol gap12"},
      el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_name")), nameInp),
      el("div",{class:"grid2"},
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_start_date")), dateInp),
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_currency")), curSel),
      ),
      el("div",{class:"grid2"},
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_price")), priceInp),
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("field_sort")), sortInp),
      ),
      el("label",{class:"hrow gap10",style:"align-items:center; justify-content:space-between"},
        el("span",{class:"muted2",style:"font-size:12px"},t("field_active")), activeInp
      )
    );

    Modal.open(title, body, [
      {label:t("cancel"),kind:"ghost",onClick:()=>Modal.close()},
      {label:t("save"),kind:"primary",onClick:async()=>{
        const payload={
          name:(nameInp.value||"").trim(),
          start_date: dateToSec(dateInp.value),
          price:Number(priceInp.value||0),
          currency:String(curSel.value||"UZS"),
          sort:Number(sortInp.value||1000),
          is_active: activeInp.checked ? 1 : 0,
        };
        if(!payload.name){ Toast.show(`${t("toast_error")}: ${t("field_name")}`,"bad"); return; }
        try{
          if(isEdit) await API.settings.dictUpdate(kind,item.id,payload);
          else await API.settings.dictCreate(kind,payload);
          Toast.show(t("toast_saved"),"ok");
          Modal.close();
          await reload();
        }catch(e){
          Toast.show(`${t("toast_error")}: ${e.message||"error"}`,"bad");
        }
      }},
    ]);
  };

  const dictCard = (titleKey, kind, list, is3lang)=>{
    const head=el("div",{class:"khead"},
      el("div",{class:"ttl"}, t(titleKey)),
      el("div",{class:"hrow gap8",style:"align-items:center"},
        el("div",{class:"muted2",style:"font-size:12px"}, String(list.length)),
        el("button",{class:"iconBtn",type:"button",title:t("create"),onClick:()=>openDictModal(kind,is3lang,null)},
          el("span",{class:"icoWrap",html:ICONS.plus})
        )
      )
    );

    const rows = list.length ? list.map(item=>{
      const title = is3lang ? langLabel3(item) : (item.name || `#${item.id}`);
      const sub = is3lang
        ? `RU: ${item.name_ru || "—"} • UZ: ${item.name_uz || "—"} • EN: ${item.name_en || "—"}`
        : `${t("field_start_date")}: ${item.start_date?fmtDate(item.start_date).split(",")[0]:"—"} • ${t("field_price")}: ${item.price||0} ${item.currency||"UZS"}`;

      return el("div",{class:"rowLine"},
        el("div",{class:"rowMain"},
          el("div",{class:"rowTitle"}, title),
          el("div",{class:"rowSub"}, sub, ` • sort:${item.sort ?? 1000}`, ` • ${Number(item.is_active)!==0 ? "active" : "off"}`)
        ),
        el("div",{class:"rowActions"},
          el("button",{class:"iconBtn miniIcon",type:"button",title:t("settings_edit"),onClick:()=>openDictModal(kind,is3lang,item)},
            el("span",{class:"icoWrap",html:ICONS.edit})
          ),
          el("button",{class:"iconBtn miniIcon",type:"button",title:t("delete"),onClick:async()=>{
            const ok=await Modal.confirm(t("delete"), `${t(titleKey)}: ${title}`);
            if(!ok) return;
            try{
              await API.settings.dictDelete(kind,item.id);
              Toast.show(t("toast_deleted"),"ok");
              await reload();
            }catch(e){
              Toast.show(`${t("toast_error")}: ${e.message||"error"}`,"bad");
            }
          }},
            el("span",{class:"icoWrap",html:ICONS.trash})
          )
        )
      );
    }) : el("div",{class:"muted"}, t("no_data"));

    return el("div",{class:"card"},
      head,
      el("div",{class:"cardPad"}, el("div",{class:"scrollBox vcol gap10"}, rows))
    );
  };

  const render = ()=>{
    host.innerHTML="";
    const top=el("div",{class:"card cardPad vcol gap10"},
      el("div",{style:"display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"},
        el("div",{style:"font-weight:900;font-size:18px"}, t("settings_title")),
        el("button",{class:"btn",type:"button",onClick:openThemeModal},
          el("span",{class:"icoWrap",html:ICONS.palette}), " ", t("settings_theme")
        )
      ),
      el("div",{class:"muted"}, t("settings_theme_desc"))
    );

    const grid=el("div",{class:"setGrid"},
      dictCard("settings_cities","cities",state.cities,true),
      dictCard("settings_spheres","spheres",state.spheres,true),
      dictCard("settings_sources","sources",state.sources,true),
      dictCard("settings_service_types","service_types",state.service_types,true),
      dictCard("settings_course_types","course_types",state.course_types,false),
      el("div") // чтобы сетка ровно выглядела
    );

    host.append(top, grid);
  };

  const reload = async ()=>{
    host.innerHTML="";
    host.appendChild(el("div",{class:"muted"}, t("loading")));
    try{
      await loadAll();
      render();
    }catch(e){
      host.innerHTML="";
      host.appendChild(el("div",{class:"card cardPad vcol gap10"},
        el("div",{style:"font-weight:900"}, t("toast_error")),
        el("div",{class:"muted"}, e.message||"Error")
      ));
    }
  };

  await reload();
};

function injectClientsStyles(){
  if($("#gsoftClientsStyles")) return;
  const css=`
.cliTop{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.tabs{display:flex;gap:8px;flex-wrap:wrap}
.tabBtn{border:1px solid var(--stroke);background:rgba(255,255,255,.04);color:var(--text);padding:10px 12px;border-radius:14px;cursor:pointer}
.tabBtn.active{border-color:rgba(255,208,90,.55);box-shadow:0 0 0 3px rgba(255,208,90,.12)}
.cliFilters{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.cliFilters .input{min-width:220px}
@media (max-width:700px){.cliFilters .input{min-width:0;flex:1}}

.cliList{display:flex;flex-direction:column;gap:10px}
.cliRow{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;padding:10px 12px;border:1px solid var(--stroke);border-radius:16px;background:rgba(255,255,255,.04)}
.cliRow:hover{background:rgba(255,255,255,.06)}
.cliMain{min-width:0}
.cliTitle{font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cliSub{color:var(--muted);font-size:12px;margin-top:4px;display:flex;flex-wrap:wrap;gap:8px}
.cliActions{display:flex;gap:8px;flex:0 0 auto}
.cliActions .iconBtn{padding:8px 10px;border-radius:12px}

.cliCardGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:980px){.cliCardGrid{grid-template-columns:1fr}}
.smallList{display:flex;flex-direction:column;gap:10px}
.smallItem{border:1px solid var(--stroke);border-radius:14px;padding:10px 12px;background:rgba(255,255,255,.04)}
.smallItem .t{font-weight:800}
.smallItem .s{margin-top:4px;color:var(--muted);font-size:12px;display:flex;gap:10px;flex-wrap:wrap}
.linkBtn{display:inline-flex;align-items:center;gap:8px}
  `.trim();
  document.head.appendChild(el("style",{id:"gsoftClientsStyles"},css));
}

function dictLabel(list,id){
  if(!id) return "—";
  const row=(list||[]).find(x=>Number(x.id)===Number(id));
  if(!row) return `#${id}`;
  const key=`name_${App.state.lang}`;
  return row[key] || row.name_uz || row.name_ru || row.name_en || `#${id}`;
}

/* =========================
   ===== Projects ==========
   ========================= */

App.renderProjects = async function (host) {
  // ---- styles (local) ----
  if (!document.getElementById("projStyles")) {
    const st = document.createElement("style");
    st.id = "projStyles";
    st.textContent = `
      .pCardTitle{font-weight:900;line-height:1.1}
      .pLine{font-size:12px;color:var(--muted);margin-top:6px;display:flex;gap:8px;flex-wrap:wrap}
      .pLine b{color:var(--text);font-weight:700}
      .pActions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}
      .btn.mini{padding:8px 10px;border-radius:12px;font-size:12px}
      .sel option, select option{background:rgba(6,26,20,.98);color:var(--text)}
    `;
    document.head.appendChild(st);
  }

  const role = App.state.user.role;
  const isAdmin = role === "admin";
  const isRop = role === "rop";
  const isPm = role === "pm";
  const canCreate = isAdmin || isRop || isPm;

  const lang = App.state.lang || "ru";
  const tr = (o) => (o && (o[lang] || o.ru || o.uz || o.en)) || "";

  // ✅ PROJECT STATUSES by TZ
  const statusCols = [
    { key: "new",         label: { ru: "Новый",          uz: "Yangi",          en: "New" } },
    { key: "tz_given",    label: { ru: "ТЗ выдано",      uz: "Tz berildi",     en: "TZ given" } },
    { key: "offer_given", label: { ru: "Предложение",    uz: "Taklif berildi", en: "Offer given" } },
    { key: "in_progress", label: { ru: "В процессе",     uz: "Jarayonda",      en: "In progress" } },
    { key: "later",       label: { ru: "Позже",          uz: "Keyinroq",       en: "Later" } },
    { key: "done",        label: { ru: "Завершено",      uz: "Bajarildi",      en: "Done" } },
    { key: "canceled",    label: { ru: "Отмена",         uz: "Otmen",          en: "Canceled" } },
  ];

  // helpers
  const nameByLang = (x) => x ? (x[`name_${App.state.lang}`] || x.name_uz || x.name_ru || x.name_en || "") : "";

  const toLocalInput = (tsSec) => {
    if (!tsSec) return "";
    const d = new Date(tsSec * 1000);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const fromLocalInput = (s) => {
    if (!s) return null;
    const ms = new Date(s).getTime();
    if (!Number.isFinite(ms)) return null;
    return Math.floor(ms / 1000);
  };

  const fmtAmount = (amount, currency) => {
    if (amount == null || amount === "") return "—";
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    const cur = currency || "UZS";
    return `${n.toLocaleString(undefined)} ${cur}`;
  };

  // ---- load refs ----
  const [svcRes, pmListRaw, companiesRes] = await Promise.all([
    API.settings.dictList("service_types").catch(() => ({ data: [] })),
    (isAdmin || isRop) ? API.usersTryList().catch(() => []) : Promise.resolve([]),
    API.clients.list("company", "").catch(() => ({ data: [] })),
  ]);

  const serviceTypes = (svcRes && svcRes.data) ? svcRes.data : [];
  const pmList = Array.isArray(pmListRaw) ? pmListRaw.filter(u => u.role === "pm" && Number(u.is_active) === 1) : [];
  let companies = (companiesRes && companiesRes.data) ? companiesRes.data : [];

  const companyById = (id) => companies.find(x => String(x.id) === String(id));
  const serviceById = (id) => serviceTypes.find(x => String(x.id) === String(id));
  const pmById = (id) => pmList.find(x => String(x.id) === String(id));

  // ---- toolbar ----
  const qInp = el("input", { class: "input", placeholder: t("search") || "Search..." });

  const pmSel = (isAdmin || isRop)
    ? el("select", { class: "sel" },
        el("option", { value: "" }, "—"),
        ...pmList.map(u => el("option", { value: String(u.id) }, u.full_name))
      )
    : null;

  const svcSelFilter = el("select", { class: "sel" },
    el("option", { value: "" }, "—"),
    ...serviceTypes.filter(x => Number(x.is_active) === 1).map(s =>
      el("option", { value: String(s.id) }, nameByLang(s) || `#${s.id}`)
    )
  );

  const createBtn = el("button", { class: "btn primary", type: "button", disabled: !canCreate }, t("create") || "Create");
  createBtn.onclick = () => openCreate({});

  const row = el("div", { class: "hrow gap10", style: "flex-wrap:wrap;justify-content:space-between" },
    el("div", { class: "hrow gap10", style: "flex:1;min-width:260px;flex-wrap:wrap" },
      qInp,
      (pmSel ? el("div", { style: "min-width:220px" }, pmSel) : null),
      el("div", { style: "min-width:220px" }, svcSelFilter),
    ),
    createBtn
  );

  const toolbar = el("div", { class: "card cardPad vcol gap10" }, row);

  const board = el("div", { class: "kanbanWrap", id: "projectBoard" });
  host.innerHTML = "";
  host.append(toolbar, board);

  // columns DOM
  const colEls = {};
  for (const c of statusCols) {
    const countEl = el("div", { class: "muted2", style: "font-size:12px" }, "0");

    const list = el("div", { class: "klist", "data-drop": c.key });

    // mouse DnD highlight
    list.addEventListener("dragover", (e) => { e.preventDefault(); list.classList.add("drop"); });
    list.addEventListener("dragenter", () => list.classList.add("drop"));
    list.addEventListener("dragleave", () => list.classList.remove("drop"));
    list.addEventListener("drop", async (e) => {
      e.preventDefault();
      list.classList.remove("drop");
      const id = Number(e.dataTransfer.getData("text/plain"));
      if (!id) return;
      await doMove(id, c.key);
    });

    const col = el("div", { class: "card kcol" },
      el("div", { class: "khead" },
        el("div", { class: "ttl" }, tr(c.label)),
        countEl
      ),
      list
    );

    board.appendChild(col);
    colEls[c.key] = { col, list, countEl };
  }

  // data
  let all = [];

  const askCancelReason = () => new Promise((resolve) => {
    const inp = el("textarea", { class: "input", style: "min-height:110px", placeholder: t("reason") || "Reason..." });
    Modal.open(tr({ ru: "Причина отмены", uz: "Bekor qilish sababi", en: "Cancel reason" }),
      el("div", { class: "vcol gap10" },
        el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Укажи причину отмены:", uz: "Sababni yozing:", en: "Provide a reason:" })),
        inp
      ),
      [
        { label: t("cancel") || "Cancel", kind: "ghost", onClick: () => { Modal.close(); resolve(null); } },
        { label: t("save") || "Save", kind: "primary", onClick: () => {
            const v = (inp.value || "").trim();
            if (!v) { Toast.show(tr({ru:"Причина обязательна",uz:"Sabab majburiy",en:"Reason required"}), "bad"); return; }
            Modal.close(); resolve(v);
          }
        }
      ]
    );
  });

  const doMove = async (id, status) => {
    try {
      let extra = {};
      if (status === "canceled") {
        const reason = await askCancelReason();
        if (!reason) return;
        extra.cancel_reason = reason;
      }
      await API.projects.move(id, status, extra);

      // ✅ ускорение: не грузим заново с сервера, обновляем локально
      const row = all.find(x => Number(x.id) === Number(id));
      if (row) {
        row.status = status;
        if (status === "canceled") row.cancel_reason = extra.cancel_reason || row.cancel_reason;
      }

      render();
      Toast.show(t("toast_saved") || "Saved", "ok");
    } catch (e) {
      Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
    }
  };

  const openTasks = (pid) => {
    setHash("/tasks", { project_id: String(pid) });
  };

  const canEditRow = (p) => {
    if (isAdmin || isRop) return true;
    if (isPm && Number(p.pm_user_id) === Number(App.state.user.id)) return true;
    return false;
  };

  const cardFor = (p) => {
    const st = p.status || "new";
    const company = p.company_name || "";
    const svc = p.service_name_uz || p.service_name_ru || p.service_name_en || "";

    const title = el("div", { class: "pCardTitle" },
      el("div", {}, company || `#${p.id}`),
      el("div", { class: "muted2", style: "font-size:12px;margin-top:2px" }, svc || "—")
    );

    let bodyParts = [title];

    // ✅ DONE: only 2 lines (company + service)
    if (st === "done") {
      // no extra lines
    }
    // ✅ CANCELED: 3 lines (company + service + reason)
    else if (st === "canceled") {
      bodyParts.push(
        el("div", { class: "muted2", style: "font-size:12px;margin-top:6px;white-space:pre-wrap" },
          (p.cancel_reason || tr({ru:"Причина не указана",uz:"Sabab ko'rsatilmagan",en:"No reason"}))
        )
      );
    }
    else {
      // meeting time only for new + tz_given
      if ((st === "new" || st === "tz_given") && p.meeting_at) {
        bodyParts.push(el("div", { class: "pLine" }, "🕒 ", el("b", {}, fmtDate(p.meeting_at))));
      }
      if (p.deadline_at) {
        bodyParts.push(el("div", { class: "pLine" }, "⏳ ", el("b", {}, fmtDate(p.deadline_at))));
      }
      if (isAdmin && p.amount != null) {
        bodyParts.push(el("div", { class: "pLine" }, "💰 ", el("b", {}, fmtAmount(p.amount, p.currency))));
      }
      if (p.pm_name) {
        bodyParts.push(el("div", { class: "pLine" }, "👤 ", el("b", {}, p.pm_name)));
      }
    }

    const btnTasks = el("button", { class: "btn ghost mini", type: "button", onClick: (e) => { e.stopPropagation(); openTasks(p.id); } }, t("open_tasks") || "Tasks");
    const btnOpen  = el("button", { class: "btn mini", type: "button", onClick: (e) => { e.stopPropagation(); openView(p.id); } }, t("open") || "Open");

    const actions = el("div", { class: "pActions" }, btnTasks, btnOpen);

    const card = el("div", {
      class: "kcard",
      draggable: true,
      "data-id": String(p.id),
      onDragstart: (e) => {
        e.dataTransfer.setData("text/plain", String(p.id));
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("dragging");
      },
      onDragend: () => card.classList.remove("dragging"),
    }, ...bodyParts, actions);

    // ✅ touch drag support
    bindTouchDrag(card, doMove);

    return { st, card };
  };

  const render = () => {
    // clear
    for (const c of statusCols) {
      colEls[c.key].list.innerHTML = "";
    }

    // group + render
    const counts = {};
    for (const c of statusCols) counts[c.key] = 0;

    for (const p of all) {
      const obj = cardFor(p);
      const key = obj.st;
      if (!colEls[key]) continue;
      colEls[key].list.appendChild(obj.card);
      counts[key]++;
    }

    for (const c of statusCols) {
      colEls[c.key].countEl.textContent = String(counts[c.key] || 0);
    }
  };

  let loadTimer = null;
  const load = async () => {
    const q = String(qInp.value || "").trim();
    const pm_user_id = pmSel ? (pmSel.value ? Number(pmSel.value) : null) : null;
    const service_type_id = svcSelFilter.value ? Number(svcSelFilter.value) : null;

    const r = await API.projects.list({ q, pm_user_id, service_type_id }).catch(() => ({ data: [] }));
    all = (r && r.data) ? r.data : [];
    render();
  };

  // debounce search
  qInp.addEventListener("input", () => {
    clearTimeout(loadTimer);
    loadTimer = setTimeout(load, 250);
  });
  if (pmSel) pmSel.addEventListener("change", load);
  svcSelFilter.addEventListener("change", load);

  // ---- MODALS ----

  function openCreateCompany(onDoneSelect) {
    (async () => {
      const [citiesRes, sourcesRes, spheresRes] = await Promise.all([
        API.settings.dictList("cities").catch(() => ({ data: [] })),
        API.settings.dictList("sources").catch(() => ({ data: [] })),
        API.settings.dictList("spheres").catch(() => ({ data: [] })),
      ]);

      const cities  = (citiesRes && citiesRes.data) ? citiesRes.data : [];
      const sources = (sourcesRes && sourcesRes.data) ? sourcesRes.data : [];
      const spheres = (spheresRes && spheresRes.data) ? spheresRes.data : [];

      const companyName = el("input", { class: "input", placeholder: t("client_company_name") });
      const fullName    = el("input", { class: "input", placeholder: t("client_full_name") });
      const phone1      = el("input", { class: "input", placeholder: t("client_phone1"), inputmode: "tel" });
      const phone2      = el("input", { class: "input", placeholder: t("client_phone2"), inputmode: "tel" });

      const citySel = el("select", { class: "sel" },
        el("option", { value: "" }, "—"),
        ...cities.filter(x => Number(x.is_active) === 1).map(x =>
          el("option", { value: String(x.id) }, (x[`name_${App.state.lang}`] || x.name_uz || x.name_ru || x.name_en || `#${x.id}`))
        )
      );

      const sourceSel = el("select", { class: "sel" },
        el("option", { value: "" }, "—"),
        ...sources.filter(x => Number(x.is_active) === 1).map(x =>
          el("option", { value: String(x.id) }, (x[`name_${App.state.lang}`] || x.name_uz || x.name_ru || x.name_en || `#${x.id}`))
        )
      );

      const sphereSel = el("select", { class: "sel" },
        el("option", { value: "" }, "—"),
        ...spheres.filter(x => Number(x.is_active) === 1).map(x =>
          el("option", { value: String(x.id) }, (x[`name_${App.state.lang}`] || x.name_uz || x.name_ru || x.name_en || `#${x.id}`))
        )
      );

      const comment = el("textarea", { class: "input", style: "min-height:90px", placeholder: t("comment") });

      const body = el("div", { class: "vcol gap12" },
        el("div", { class: "grid2" },
          el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, t("client_company_name")), companyName),
          el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, t("client_full_name")), fullName),
        ),
        el("div", { class: "grid2" },
          el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, t("client_phone1")), phone1),
          el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, t("client_phone2")), phone2),
        ),
        el("div", { class: "grid3" },
          el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style:"font-size:12px" }, t("city")), citySel),
          el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style:"font-size:12px" }, t("source")), sourceSel),
          el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style:"font-size:12px" }, t("sphere")), sphereSel),
        ),
        el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style:"font-size:12px" }, t("comment")), comment),
      );

      Modal.open(t("clients_create_company") || "Create company", body, [
        { label: t("cancel") || "Cancel", kind: "ghost", onClick: () => Modal.close() },
        { label: t("save") || "Save", kind: "primary", onClick: async () => {
            try {
              const payload = {
                type: "company",
                company_name: (companyName.value || "").trim(),
                full_name: (fullName.value || "").trim(),
                phone1: (phone1.value || "").trim(),
                phone2: (phone2.value || "").trim() || null,
                city_id: citySel.value ? Number(citySel.value) : null,
                source_id: sourceSel.value ? Number(sourceSel.value) : null,
                sphere_id: sphereSel.value ? Number(sphereSel.value) : null,
                comment: (comment.value || "").trim() || null,
              };
              const res = await API.clients.create(payload);
              Modal.close();
              Toast.show(t("toast_saved") || "Saved", "ok");

              const newId =
                (res && res.data && (res.data.id || res.data.client_id)) ? (res.data.id || res.data.client_id) :
                (res && res.id) ? res.id : null;

              if (onDoneSelect) onDoneSelect(newId);
            } catch (e) {
              Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
            }
          }
        }
      ]);
    })();
  }

  const openCreate = async (prefill = {}) => {
    const canPickPm = isAdmin || isRop;

    const companySel = el("select", { class: "sel" },
      el("option", { value: "" }, "—"),
      ...companies.map(c => el("option", { value: String(c.id) }, (c.company_name || c.full_name || `#${c.id}`)))
    );

    const svcSel = el("select", { class: "sel" },
      el("option", { value: "" }, "—"),
      ...serviceTypes.filter(x => Number(x.is_active) === 1).map(s =>
        el("option", { value: String(s.id) }, nameByLang(s) || `#${s.id}`)
      )
    );

    // --- PM picker: PM list + "Other" => show all users ---
if (!App.state.cache.users) {
  const list = await API.usersTryList();
  App.state.cache.users = list || [];
}
const allUsers = App.state.cache.users || [];
const pmUsers = allUsers.filter(u => u.role === "pm");

const otherLabel =
  (App.state.lang === "uz") ? "Boshqa" :
  (App.state.lang === "en") ? "Another" :
  "Другой";

const pmSel = el("select", { class: "sel" });
pmSel.appendChild(el("option", { value: "" }, "—"));
for (const u of pmUsers) {
  pmSel.appendChild(el("option", { value: String(u.id) }, `${u.full_name} (${u.role})`));
}
pmSel.appendChild(el("option", { value: "__other__" }, otherLabel));

const pmAnySel = el("select", { class: "sel", style: "display:none" });
pmAnySel.appendChild(el("option", { value: "" }, "—"));
for (const u of allUsers) {
  pmAnySel.appendChild(el("option", { value: String(u.id) }, `${u.full_name} (${u.role})`));
}

// default: ставим текущего пользователя (чтобы не "обязательность руками")
const presetId = Number(App.state.user?.id || 0);
const presetIsPm = pmUsers.some(u => Number(u.id) === presetId);
if (presetId && !presetIsPm) {
  pmSel.value = "__other__";
  pmAnySel.style.display = "";
  pmAnySel.value = String(presetId);
} else if (presetId) {
  pmSel.value = String(presetId);
}

pmSel.addEventListener("change", () => {
  if (pmSel.value === "__other__") {
    pmAnySel.style.display = "";
    if (!pmAnySel.value && presetId) pmAnySel.value = String(presetId);
  } else {
    pmAnySel.style.display = "none";
  }
});


    const meetInp = el("input", { class: "input", type: "datetime-local" });
    const dlInp = el("input", { class: "input", type: "datetime-local" });

    const amountInp = el("input", { class: "input", inputmode: "decimal", placeholder: "0", disabled: !isAdmin });
    const curSel = el("select", { class: "sel", disabled: !isAdmin },
      el("option", { value: "UZS" }, "UZS"),
      el("option", { value: "USD" }, "USD")
    );

    const commentInp = el("textarea", { class: "input", style: "min-height:90px" });

    // owner info (readonly)
    const ownerBox = el("div", { class: "card cardPad vcol gap6", style: "background:rgba(255,255,255,.03)" },
      el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Владелец (из компании)",uz:"Ega (kompaniyadan)",en:"Owner (from company)"})),
      el("div", { style: "font-weight:800" }, "—"),
      el("div", { class: "muted2" }, "—")
    );

    const syncOwner = () => {
      const c = companyById(companySel.value);
      const name = c ? (c.full_name || "—") : "—";
      const ph = c ? (c.phone1 || "") : "";
      const ph2 = c ? (c.phone2 || "") : "";
      ownerBox.children[1].textContent = name;
      ownerBox.children[2].textContent = (ph || ph2) ? [ph, ph2].filter(Boolean).join(" • ") : "—";
    };

    companySel.addEventListener("change", syncOwner);

    // ✅ "+ company" — important fix: reopen create modal with selected company
    const addCompanyBtn = el("button", { class: "btn ghost mini", type: "button" }, "+");
    addCompanyBtn.onclick = () => {
      // save draft
      const draft = {
        service_type_id: svcSel.value,
        pm_user_id: pmSel.value,
        meeting_at: meetInp.value,
        deadline_at: dlInp.value,
        amount: amountInp.value,
        currency: curSel.value,
        comment: commentInp.value,
      };
      openCreateCompany(async (newId) => {
        // refresh companies
        const fresh = await API.clients.list("company", "").catch(() => ({ data: [] }));
        companies = (fresh && fresh.data) ? fresh.data : companies;

        // reopen modal with newId selected
        openCreate({
          client_id: newId,
          ...draft
        });
      });
    };

    // apply prefill
    if (prefill.client_id) companySel.value = String(prefill.client_id);
    if (prefill.service_type_id) svcSel.value = String(prefill.service_type_id);
    if (prefill.pm_user_id) pmSel.value = String(prefill.pm_user_id);
    if (prefill.meeting_at) meetInp.value = prefill.meeting_at;
    if (prefill.deadline_at) dlInp.value = prefill.deadline_at;
    if (prefill.amount != null) amountInp.value = String(prefill.amount || "");
    if (prefill.currency) curSel.value = String(prefill.currency || "UZS");
    if (prefill.comment) commentInp.value = String(prefill.comment || "");

    syncOwner();

    const form = el("div", { class: "vcol gap12" },
      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("client_company") || "Company"),
          el("div", { class: "hrow gap8" }, companySel, addCompanyBtn)
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("service_type") || "Service"),
          svcSel
        ),
      ),
      ownerBox,
      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Время встречи",uz:"Uchrashuv vaqti",en:"Meeting time"})),
          meetInp
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("deadline") || "Deadline"),
          dlInp
        ),
      ),
      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Сумма (только Admin)",uz:"Summа (faqat Admin)",en:"Amount (Admin only)"})),
          amountInp
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Валюта",uz:"Valyuta",en:"Currency"})),
          curSel
        ),
      ),
      el("div", { class: "vcol gap8" },
        el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Ответственный PM",uz:"Mas'ul PM",en:"Responsible PM"})),
        pmSel, pmAnySel
      ),
      el("div", { class: "vcol gap8" },
        el("div", { class: "muted2", style: "font-size:12px" }, t("comment") || "Comment"),
        commentInp
      ),
    );

    Modal.open(t("create") || "Create", form, [
      { label: t("cancel") || "Cancel", kind: "ghost", onClick: () => Modal.close() },
      { label: t("save") || "Save", kind: "primary", onClick: async () => {
          try {
            const payload = {
              client_id: companySel.value ? Number(companySel.value) : null,
              service_type_id: svcSel.value ? Number(svcSel.value) : null,
              pm_user_id: (pmSel.value === "__other__" ? Number(pmAnySel.value || 0) : Number(pmSel.value || 0)),
              meeting_at: fromLocalInput(meetInp.value),
              deadline_at: fromLocalInput(dlInp.value),
              amount: isAdmin ? (amountInp.value ? Number(amountInp.value) : null) : null,
              currency: isAdmin ? (curSel.value || "UZS") : "UZS",
              comment: (commentInp.value || "").trim() || null
            };

            if (!payload.client_id || !payload.service_type_id || !payload.pm_user_id) {
              Toast.show(tr({ru:"Заполни Company/Service/PM",uz:"Company/Service/PM ni to'ldiring",en:"Fill Company/Service/PM"}), "bad");
              return;
            }

            const res = await API.projects.create(payload);
            const newId = (res && res.data && res.data.id) ? res.data.id : null;

            // ✅ локально добавляем, не полный reload
            if (newId) {
              const full = await API.projects.get(newId).catch(() => null);
              if (full && full.data) all.unshift(full.data);
              else all.unshift({ ...payload, id: newId, status: "new" });
            }
            Modal.close();
            render();
            Toast.show(t("toast_saved") || "Saved", "ok");
          } catch (e) {
            Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
          }
        }
      }
    ]);
  };

  const openEdit = async (id) => {
    const r = await API.projects.get(id).catch(() => null);
    const p = r ? (r.data || r) : null;
    if (!p) return;

    if (!canEditRow(p)) {
      Toast.show(t("toast_error") || "No access", "bad");
      return;
    }

    const companySel = el("select", { class: "sel" },
      el("option", { value: "" }, "—"),
      ...companies.map(c => el("option", { value: String(c.id) }, (c.company_name || c.full_name || `#${c.id}`)))
    );
    companySel.value = String(p.client_id || "");

    const svcSel = el("select", { class: "sel" },
      el("option", { value: "" }, "—"),
      ...serviceTypes.filter(x => Number(x.is_active) === 1).map(s =>
        el("option", { value: String(s.id) }, nameByLang(s) || `#${s.id}`)
      )
    );
    svcSel.value = String(p.service_type_id || "");

    if (!App.state.cache.users) {
  const list = await API.usersTryList();
  App.state.cache.users = list || [];
}
const allUsers = App.state.cache.users || [];
const pmUsers = allUsers.filter(u => u.role === "pm");

const otherLabel =
  (App.state.lang === "uz") ? "Boshqa" :
  (App.state.lang === "en") ? "Another" :
  "Другой";

const pmSel = el("select", { class: "sel" });
pmSel.appendChild(el("option", { value: "" }, "—"));
for (const u of pmUsers) {
  pmSel.appendChild(el("option", { value: String(u.id) }, `${u.full_name} (${u.role})`));
}
pmSel.appendChild(el("option", { value: "__other__" }, otherLabel));

const pmAnySel = el("select", { class: "sel", style: "display:none" });
pmAnySel.appendChild(el("option", { value: "" }, "—"));
for (const u of allUsers) {
  pmAnySel.appendChild(el("option", { value: String(u.id) }, `${u.full_name} (${u.role})`));
}

// preset: текущий pm_user_id проекта
const presetId = Number(project.pm_user_id || 0); // ⚠️ project = твой объект проекта в edit
const presetIsPm = pmUsers.some(u => Number(u.id) === presetId);
if (presetId && !presetIsPm) {
  pmSel.value = "__other__";
  pmAnySel.style.display = "";
  pmAnySel.value = String(presetId);
} else if (presetId) {
  pmSel.value = String(presetId);
}

pmSel.addEventListener("change", () => {
  if (pmSel.value === "__other__") {
    pmAnySel.style.display = "";
    if (!pmAnySel.value && presetId) pmAnySel.value = String(presetId);
  } else {
    pmAnySel.style.display = "none";
  }
});

    pmSel.value = String(p.pm_user_id || App.state.user.id);

    const meetInp = el("input", { class: "input", type: "datetime-local", value: toLocalInput(p.meeting_at) });
    const dlInp   = el("input", { class: "input", type: "datetime-local", value: toLocalInput(p.deadline_at) });

    const amountInp = el("input", { class: "input", inputmode: "decimal", value: (p.amount != null ? String(p.amount) : ""), disabled: !isAdmin });
    const curSel = el("select", { class: "sel", disabled: !isAdmin },
      el("option", { value: "UZS" }, "UZS"),
      el("option", { value: "USD" }, "USD")
    );
    curSel.value = String(p.currency || "UZS");

    const commentInp = el("textarea", { class: "input", style: "min-height:90px" });
    commentInp.value = p.comment || "";

    const ownerBox = el("div", { class: "card cardPad vcol gap6", style: "background:rgba(255,255,255,.03)" },
      el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Владелец (из компании)",uz:"Ega (kompaniyadan)",en:"Owner (from company)"})),
      el("div", { style: "font-weight:800" }, p.owner_full_name || "—"),
      el("div", { class: "muted2" }, [p.owner_phone1, p.owner_phone2].filter(Boolean).join(" • ") || "—")
    );

    const form = el("div", { class: "vcol gap12" },
      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, t("client_company") || "Company"), companySel),
        el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, t("service_type") || "Service"), svcSel),
      ),
      ownerBox,
      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Время встречи",uz:"Uchrashuv vaqti",en:"Meeting time"})), meetInp),
        el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, t("deadline") || "Deadline"), dlInp),
      ),
      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Сумма (только Admin)",uz:"Summа (faqat Admin)",en:"Amount (Admin only)"})), amountInp),
        el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Валюта",uz:"Valyuta",en:"Currency"})), curSel),
      ),
      el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"Ответственный PM",uz:"Mas'ul PM",en:"Responsible PM"})), pmSel, pmAnySel),
      el("div", { class: "vcol gap8" }, el("div", { class: "muted2", style: "font-size:12px" }, t("comment") || "Comment"), commentInp),
    );

    Modal.open(t("edit") || "Edit", form, [
      { label: t("cancel") || "Cancel", kind: "ghost", onClick: () => Modal.close() },
      { label: t("save") || "Save", kind: "primary", onClick: async () => {
          try {
            const payload = {
              client_id: companySel.value ? Number(companySel.value) : null,
              service_type_id: svcSel.value ? Number(svcSel.value) : null,
              pm_user_id: (pmSel.value === "__other__" ? Number(pmAnySel.value || 0) : Number(pmSel.value || 0)),
              meeting_at: fromLocalInput(meetInp.value),
              deadline_at: fromLocalInput(dlInp.value),
              amount: isAdmin ? (amountInp.value ? Number(amountInp.value) : null) : null,
              currency: isAdmin ? (curSel.value || "UZS") : (p.currency || "UZS"),
              comment: (commentInp.value || "").trim() || null
            };
            await API.projects.update(id, payload);

            // ✅ local update
            const row = all.find(x => Number(x.id) === Number(id));
            if (row) Object.assign(row, payload);

            Modal.close();
            render();
            Toast.show(t("toast_saved") || "Saved", "ok");
          } catch (e) {
            Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
          }
        }
      }
    ]);
  };

  const openView = async (id) => {
    const r = await API.projects.get(id).catch(() => null);
    const p = r ? (r.data || r) : null;
    if (!p) { Toast.show(t("toast_error") || "Error", "bad"); return; }

    const canEdit = canEditRow(p);

    const company = p.company_name || "";
    const svc = p.service_name_uz || p.service_name_ru || p.service_name_en || "";

    const head = el("div", { class: "vcol gap8" },
      el("div", { style: "font-weight:900;font-size:18px" }, company || `#${p.id}`),
      el("div", { class: "muted2" }, svc || "—")
    );

    const owner = el("div", { class: "card cardPad vcol gap6", style: "background:rgba(255,255,255,.03)" },
      el("div", { class: "muted2", style: "font-size:12px" }, tr({ru:"ФИО и телефон владельца (из компании)",uz:"Ega FIO va telefon",en:"Owner name & phone"})),
      el("div", { style: "font-weight:800" }, p.owner_full_name || "—"),
      el("div", { class: "muted2" }, [p.owner_phone1, p.owner_phone2].filter(Boolean).join(" • ") || "—")
    );

    const lines = el("div", { class: "vcol gap8" },
      el("div", { class: "pLine" }, tr({ru:"Статус:",uz:"Status:",en:"Status:"}), el("b", {}, tr(statusCols.find(x=>x.key===p.status)?.label || {}))),
      p.meeting_at ? el("div", { class: "pLine" }, tr({ru:"Встреча:",uz:"Uchrashuv:",en:"Meeting:"}), el("b", {}, fmtDate(p.meeting_at))) : null,
      p.deadline_at ? el("div", { class: "pLine" }, tr({ru:"Дедлайн:",uz:"Deadline:",en:"Deadline:"}), el("b", {}, fmtDate(p.deadline_at))) : null,
      (isAdmin && p.amount != null) ? el("div", { class: "pLine" }, tr({ru:"Сумма:",uz:"Summa:",en:"Amount:"}), el("b", {}, fmtAmount(p.amount, p.currency))) : null,
      p.pm_name ? el("div", { class: "pLine" }, "PM:", el("b", {}, p.pm_name)) : null,
      (p.status === "canceled") ? el("div", { class: "pLine" }, tr({ru:"Причина отмены:",uz:"Bekor sababi:",en:"Cancel reason:"}), el("b", {}, p.cancel_reason || "—")) : null,
      p.comment ? el("div", { class: "muted2", style: "white-space:pre-wrap;margin-top:6px" }, p.comment) : null,
    );

    const body = el("div", { class: "vcol gap12" }, head, owner, lines);

    Modal.open(t("open") || "Open", body, [
      { label: t("open_tasks") || "Tasks", kind: "ghost", onClick: () => { Modal.close(); openTasks(p.id); } },
      ...(canEdit ? [{ label: t("edit") || "Edit", kind: "primary", onClick: () => { Modal.close(); openEdit(p.id); } }] : []),
    ]);
  };

  // initial load
  await load();
};


App.renderCourses = async function (host) {
  // ---- styles (local) ----
  if (!document.getElementById("courseStyles")) {
    const st = document.createElement("style");
    st.id = "courseStyles";
    st.textContent = `
      .cLine{font-size:12px;color:var(--muted);margin-top:6px;display:flex;gap:8px;flex-wrap:wrap}
      .cLine b{color:var(--text);font-weight:700}
      .cActions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}
      .btn.mini{padding:8px 10px;border-radius:12px;font-size:12px}
      .sel option, select option{background:rgba(6,26,20,.98);color:var(--text)}
      .cSug{border:1px solid var(--stroke);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.04)}
      .cSug .it{display:block;width:100%;text-align:left;padding:10px 12px;background:transparent;border:0;border-bottom:1px solid var(--stroke);cursor:pointer}
      .cSug .it:last-child{border-bottom:0}
      .cSug .it:hover{background:rgba(255,208,90,.07)}
      .cChip{display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--stroke);border-radius:999px;background:rgba(255,255,255,.04);font-size:12px}
    `;
    document.head.appendChild(st);
  }

  const role = App.state.user?.role || "";
  const isAdmin = role === "admin";
  const isRop = role === "rop";
  const isSale = role === "sale";
  if (!(isAdmin || isRop || isSale)) {
    host.appendChild(el("div", { class: "card cardPad vcol gap10" },
      el("div", { style: "font-weight:900" }, t("route_courses")),
      el("div", { class: "muted" }, "No access")
    ));
    return;
  }

  const lang = App.state.lang || "ru";
  const tr = (o) => (o && (o[lang] || o.ru || o.uz || o.en)) || "";

  const statusCols = [
    { key: "new",       label: { ru: "Новый",            uz: "Yangi",                 en: "New" } },
    { key: "need_call", label: { ru: "Нужно звонить",    uz: "Qo‘ng‘iroq kerak",      en: "Need call" } },
    { key: "thinking",  label: { ru: "Думает",           uz: "O‘ylab ko‘rmoqda",      en: "Thinking" } },
    { key: "enrolled",  label: { ru: "Записан",          uz: "Kursga yozildi",        en: "Enrolled" } },
    { key: "studying",  label: { ru: "Учится",           uz: "O‘qishda",              en: "Studying" } },
    { key: "canceled",  label: { ru: "Отмена",           uz: "Otmen",                 en: "Canceled" } },
  ];

  const fmtMoney = (amount, currency) => {
    if (amount == null || amount === "") return "—";
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    const cur = currency || "UZS";
    return `${n.toLocaleString(undefined)} ${cur}`;
  };

  const toDateInput = (tsSec) => {
    if (!tsSec) return "";
    const d = new Date(Number(tsSec) * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  const fmtDateOnly = (tsSec) => {
    if (!tsSec) return "—";
    const d = new Date(Number(tsSec) * 1000);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  // ---- load refs ----
  const [ctRes, companiesRes, leadsRes] = await Promise.all([
    API.settings.dictList("course_types").catch(() => ({ data: [] })),
    API.clients.list("company", "").catch(() => ({ data: [] })),
    API.clients.list("lead", "").catch(() => ({ data: [] })),
  ]);

  const courseTypes = (ctRes && ctRes.data) ? ctRes.data : [];
  const companies = (companiesRes && companiesRes.data) ? companiesRes.data : [];
  const leads = (leadsRes && leadsRes.data) ? leadsRes.data : [];

  const ctById = new Map(courseTypes.map(x => [Number(x.id), x]));
  const companyLabel = (c) => (c && (c.company_name || c.full_name || `#${c.id}`)) || "";
  const leadLabel = (l) => {
    if (!l) return "";
    const fio = l.full_name || `#${l.id}`;
    const ph = l.phone1 ? ` • ${l.phone1}` : "";
    return `${fio}${ph}`;
  };

  // ---- toolbar ----
  const qInp = el("input", { class: "input", placeholder: t("search") || "Search..." });

  const companySel = el("select", { class: "sel" },
    el("option", { value: "" }, "—"),
    ...companies.filter(x => Number(x.is_active) === 1).map(c =>
      el("option", { value: String(c.id) }, companyLabel(c))
    )
  );

  const typeSel = el("select", { class: "sel" },
    el("option", { value: "" }, "—"),
    ...courseTypes.filter(x => Number(x.is_active) === 1).map(ct =>
      el("option", { value: String(ct.id) }, ct.name || `#${ct.id}`)
    )
  );

  const createBtn = el("button", { class: "btn primary", type: "button" }, t("create") || "Create");
  createBtn.onclick = () => openCreate();

  const row = el("div", { class: "hrow gap10", style: "flex-wrap:wrap;justify-content:space-between" },
    el("div", { class: "hrow gap10", style: "flex:1;min-width:260px;flex-wrap:wrap" },
      qInp,
      el("div", { style: "min-width:220px" }, companySel),
      el("div", { style: "min-width:220px" }, typeSel),
    ),
    createBtn
  );

  const toolbar = el("div", { class: "card cardPad vcol gap10" }, row);
  const board = el("div", { class: "kanbanWrap", id: "courseBoard" });
  host.innerHTML = "";
  host.append(toolbar, board);

  // ---- columns DOM ----
  const colEls = {};
  for (const c of statusCols) {
    const countEl = el("div", { class: "muted2", style: "font-size:12px" }, "0");
    const list = el("div", { class: "klist", "data-drop": c.key });

    list.addEventListener("dragover", (e) => { e.preventDefault(); list.classList.add("drop"); });
    list.addEventListener("dragenter", () => list.classList.add("drop"));
    list.addEventListener("dragleave", () => list.classList.remove("drop"));
    list.addEventListener("drop", async (e) => {
      e.preventDefault();
      list.classList.remove("drop");
      const id = Number(e.dataTransfer.getData("text/plain"));
      if (!id) return;
      await doMove(id, c.key);
    });

    const col = el("div", { class: "card kcol" },
      el("div", { class: "khead" },
        el("div", { class: "ttl" }, tr(c.label)),
        countEl
      ),
      list
    );

    board.appendChild(col);
    colEls[c.key] = { col, list, countEl };
  }

  // ---- data ----
  let raw = [];

  const filterRows = () => {
    const q = String(qInp.value || "").trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(x => {
      const s = `${x.lead_full_name || ""} ${x.lead_phone1 || ""} ${x.company_name || ""} ${x.course_type_name || ""}`.toLowerCase();
      return s.includes(q);
    });
  };

  const askCancelReason = () => new Promise((resolve) => {
    const inp = el("textarea", { class: "input", style: "min-height:110px", placeholder: t("reason") || "Reason..." });
    Modal.open(tr({ ru: "Причина отмены", uz: "Bekor qilish sababi", en: "Cancel reason" }),
      el("div", { class: "vcol gap10" },
        el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Укажи причину отмены:", uz: "Sababni yozing:", en: "Provide a reason:" })),
        inp
      ),
      [
        { label: t("cancel") || "Cancel", kind: "ghost", onClick: () => { Modal.close(); resolve(null); } },
        { label: t("save") || "Save", kind: "primary", onClick: () => {
            const v = (inp.value || "").trim();
            if (!v) { Toast.show(tr({ ru: "Причина обязательна", uz: "Sabab majburiy", en: "Reason required" }), "bad"); return; }
            Modal.close(); resolve(v);
          }
        }
      ]
    );
  });

  const askPaidAmount = (titleObj) => new Promise((resolve) => {
    const inp = el("input", { class: "input", type: "number", step: "0.01", placeholder: "0" });
    Modal.open(tr(titleObj),
      el("div", { class: "vcol gap10" },
        el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Укажи сумму оплаты:", uz: "To‘lov summasini kiriting:", en: "Enter paid amount:" })),
        inp
      ),
      [
        { label: t("cancel") || "Cancel", kind: "ghost", onClick: () => { Modal.close(); resolve(null); } },
        { label: t("save") || "Save", kind: "primary", onClick: () => {
            const v = (inp.value || "").trim();
            const n = Number(v);
            if (!v || !Number.isFinite(n)) { Toast.show(tr({ ru: "Сумма обязательна", uz: "Summa majburiy", en: "Amount required" }), "bad"); return; }
            Modal.close(); resolve(n);
          }
        }
      ]
    );
  });

  const doMove = async (id, status) => {
    try {
      const cur = raw.find(x => Number(x.id) === Number(id));
      if (cur && String(cur.status) === String(status)) return;

      let extra = {};
      if (status === "canceled") {
        const reason = await askCancelReason();
        if (!reason) return;
        extra.cancel_reason = reason;
      }
      if (status === "enrolled" || status === "studying") {
        const paid = await askPaidAmount({ ru: "Оплата", uz: "To‘lov", en: "Payment" });
        if (paid == null) return;
        extra.paid_amount = paid;
      }

      await apiFetch(`/api/course_leads/${id}/move`, {
        method: "POST",
        body: { status, ...extra },
      });

      await load();
      Toast.show(t("toast_saved") || "Saved", "ok");
    } catch (e) {
      Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
    }
  };

  const cardFor = (x) => {
    const st = x.status || "new";

    const leadName = x.lead_full_name || `#${x.lead_client_id || x.id}`;
    const phone = x.lead_phone1 || "";
    const company = x.company_name || "";
    const courseName = x.course_type_name || "";

    const lines = [];

    if (st === "studying") {
      lines.push(el("div", { style: "font-weight:900" }, leadName));
    } else if (st === "canceled") {
      lines.push(el("div", { style: "font-weight:900" }, leadName));
      if (x.cancel_reason) lines.push(el("div", { class: "muted2", style: "font-size:12px" }, x.cancel_reason));
    } else {
      lines.push(el("div", { style: "font-weight:900" }, leadName));
      const meta = [];
      if (phone) meta.push(el("span", {}, phone));
      if (company) meta.push(el("span", {}, company));
      if (courseName) meta.push(el("span", {}, courseName));
      if (meta.length) lines.push(el("div", { class: "cLine" }, ...meta));

      const nums = [];
      if (x.course_start_date) nums.push(el("span", {}, `${tr({ ru: "Старт", uz: "Start", en: "Start" })}: `, el("b", {}, fmtDateOnly(x.course_start_date))));
      if (x.agreed_amount != null) nums.push(el("span", {}, `${tr({ ru: "Дог.", uz: "Kel.", en: "Agreed" })}: `, el("b", {}, fmtMoney(x.agreed_amount, x.currency))));
      if (x.paid_amount != null) nums.push(el("span", {}, `${tr({ ru: "Опл.", uz: "To‘lov", en: "Paid" })}: `, el("b", {}, fmtMoney(x.paid_amount, x.currency))));
      if (nums.length) lines.push(el("div", { class: "cLine" }, ...nums));
    }

    const btnOpen = el("button", { class: "btn mini", type: "button", onClick: (e) => { e.stopPropagation(); openView(x.id); } }, t("open") || "Open");
    const actions = el("div", { class: "cActions" }, btnOpen);

    const card = el("div", {
      class: "kcard",
      draggable: true,
      "data-id": String(x.id),
      onDragstart: (e) => {
        e.dataTransfer.setData("text/plain", String(x.id));
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("dragging");
      },
      onDragend: () => card.classList.remove("dragging"),
    }, ...lines, actions);

    bindTouchDrag(card, (status) => doMove(x.id, status));

    return { st, card };
  };

  const render = () => {
    for (const c of statusCols) colEls[c.key].list.innerHTML = "";

    const counts = {};
    for (const c of statusCols) counts[c.key] = 0;

    const rows = filterRows();
    for (const x of rows) {
      const obj = cardFor(x);
      if (!colEls[obj.st]) continue;
      colEls[obj.st].list.appendChild(obj.card);
      counts[obj.st]++;
    }
    for (const c of statusCols) colEls[c.key].countEl.textContent = String(counts[c.key] || 0);
  };

  let loadTimer = null;
  const load = async () => {
    const company_id = companySel.value ? Number(companySel.value) : null;
    const course_type_id = typeSel.value ? Number(typeSel.value) : null;

    const sp = new URLSearchParams();
    if (company_id) sp.set("company_id", String(company_id));
    if (course_type_id) sp.set("course_type_id", String(course_type_id));
    const qs = sp.toString();

    const r = await apiFetch(`/api/course_leads${qs ? "?" + qs : ""}`).catch(() => ({ data: [] }));
    raw = (r && r.data) ? r.data : [];
    render();
  };

  qInp.addEventListener("input", () => {
    clearTimeout(loadTimer);
    loadTimer = setTimeout(render, 150);
  });
  companySel.addEventListener("change", load);
  typeSel.addEventListener("change", load);

  // ---- MODALS ----
  function openCreate() {
    let selectedLead = null;

    const fioInp = el("input", { class: "input", placeholder: tr({ ru: "ФИО (поиск)", uz: "FIO (qidiruv)", en: "Full name (search)" }) });
    const phoneInp = el("input", { class: "input", placeholder: tr({ ru: "Телефон (поиск)", uz: "Telefon (qidiruv)", en: "Phone (search)" }) });

    const sug = el("div", { class: "cSug", style: "display:none" });
    const pickChip = el("div", { class: "cChip", style: "display:none" });

    const company2 = el("select", { class: "sel" },
      el("option", { value: "" }, "—"),
      ...companies.filter(x => Number(x.is_active) === 1).map(c =>
        el("option", { value: String(c.id) }, companyLabel(c))
      )
    );

    const type2 = el("select", { class: "sel" },
      el("option", { value: "" }, "—"),
      ...courseTypes.filter(x => Number(x.is_active) === 1).map(ct =>
        el("option", { value: String(ct.id) }, ct.name || `#${ct.id}`)
      )
    );

    const priceInp = el("input", { class: "input", disabled: true, placeholder: "—" });
    const startInp = el("input", { class: "input", type: "date", disabled: true });

    const agreedInp = el("input", { class: "input", type: "number", step: "0.01", placeholder: "0" });
    const paidInp = el("input", { class: "input", type: "number", step: "0.01", placeholder: "0" });
    const commentInp = el("textarea", { class: "input", rows: 4, placeholder: t("comment") || "Comment..." });

    const refreshCourseSnapshot = () => {
      const id = type2.value ? Number(type2.value) : null;
      const ct = id ? ctById.get(id) : null;
      if (!ct) { priceInp.value = ""; startInp.value = ""; return; }
      priceInp.value = fmtMoney(ct.price || 0, ct.currency || "UZS");
      startInp.value = toDateInput(ct.start_date);
    };

    const renderSuggest = () => {
      const q1 = String(fioInp.value || "").trim().toLowerCase();
      const q2 = String(phoneInp.value || "").trim().toLowerCase();
      const q = (q1 || q2);
      if (!q) { sug.style.display = "none"; sug.innerHTML = ""; return; }

      const items = leads
        .filter(l => Number(l.is_active) === 1)
        .filter(l => (`${l.full_name || ""} ${l.phone1 || ""}`.toLowerCase()).includes(q))
        .slice(0, 8);

      sug.innerHTML = "";
      if (!items.length) { sug.style.display = "none"; return; }

      for (const l of items) {
        sug.appendChild(el("button", { class: "it", type: "button", onClick: () => {
          selectedLead = l;
          fioInp.value = l.full_name || "";
          phoneInp.value = l.phone1 || "";
          sug.style.display = "none";
          pickChip.style.display = "";
          pickChip.innerHTML = "";
          pickChip.appendChild(el("div", {}, tr({ ru: "Выбран:", uz: "Tanlandi:", en: "Selected:" }), " ", el("b", {}, leadLabel(l))));
        } }, leadLabel(l)));
      }
      sug.style.display = "";
    };

    fioInp.addEventListener("input", renderSuggest);
    phoneInp.addEventListener("input", renderSuggest);
    type2.addEventListener("change", refreshCourseSnapshot);
    refreshCourseSnapshot();

    const body = el("div", { class: "vcol gap10" },
      el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Создание лида по курсу (статус всегда: Новый)", uz: "Kurs lead yaratish (status doim: Yangi)", en: "Create course lead (status is always: New)" })),

      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Лид", uz: "Lead", en: "Lead" })),
          fioInp,
          phoneInp,
          sug,
          pickChip
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("client_company") || tr({ ru: "Компания", uz: "Kompaniya", en: "Company" })),
          company2
        ),
      ),

      el("div", { class: "vcol gap8" },
        el("div", { class: "muted2", style: "font-size:12px" }, t("course_types") || tr({ ru: "Тип курса", uz: "Kurs turi", en: "Course type" })),
        type2
      ),

      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Сумма курса", uz: "Kurs summasi", en: "Course price" })),
          priceInp
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Дата старта", uz: "Boshlanish sanasi", en: "Start date" })),
          startInp
        ),
      ),

      el("div", { class: "grid2" },
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Договоренность", uz: "Kelishuv", en: "Agreed" })),
          agreedInp
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Оплата", uz: "To‘lov", en: "Paid" })),
          paidInp
        ),
      ),

      el("div", { class: "vcol gap8" },
        el("div", { class: "muted2", style: "font-size:12px" }, t("comment") || "Comment"),
        commentInp
      )
    );

    Modal.open(t("route_courses"), body, [
      { label: t("cancel") || "Cancel", kind: "ghost", onClick: () => Modal.close() },
      { label: t("save") || "Save", kind: "primary", onClick: async () => {
          try {
            if (!selectedLead || !selectedLead.id) { Toast.show(tr({ ru: "Выбери лида", uz: "Lead tanlang", en: "Select lead" }), "bad"); return; }
            const course_type_id = type2.value ? Number(type2.value) : null;
            if (!course_type_id) { Toast.show(tr({ ru: "Выбери тип курса", uz: "Kurs turini tanlang", en: "Select course type" }), "bad"); return; }

            const agreed_amount = (agreedInp.value || "").trim() === "" ? null : Number(agreedInp.value);
            const paid_amount = (paidInp.value || "").trim() === "" ? null : Number(paidInp.value);
            if (agreed_amount != null && !Number.isFinite(agreed_amount)) { Toast.show(tr({ ru: "Неверная договоренность", uz: "Kelishuv noto‘g‘ri", en: "Invalid agreed amount" }), "bad"); return; }
            if (paid_amount != null && !Number.isFinite(paid_amount)) { Toast.show(tr({ ru: "Неверная оплата", uz: "To‘lov noto‘g‘ri", en: "Invalid paid amount" }), "bad"); return; }

            const body = {
              lead_client_id: Number(selectedLead.id),
              company_id: company2.value ? Number(company2.value) : null,
              course_type_id,
              agreed_amount,
              paid_amount,
              comment: (commentInp.value || "").trim() || null,
            };

            const r = await apiFetch("/api/course_leads", { method: "POST", body });
            const newId = r?.data?.id;
            Modal.close();
            await load();
            if (newId) openView(newId);
            Toast.show(t("toast_saved") || "Saved", "ok");
          } catch (e) {
            Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
          }
        }
      }
    ]);
  }

  async function openView(id) {
    try {
      const r = await apiFetch(`/api/course_leads/${id}`);
      const x = r?.data;
      if (!x) return;

      const body = el("div", { class: "vcol gap10" },
        el("div", { class: "cChip" },
          el("b", {}, `#${x.id}`),
          el("span", {}, tr(statusCols.find(s => s.key === x.status)?.label || { ru: x.status, uz: x.status, en: x.status }))
        ),
        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Лид", uz: "Lead", en: "Lead" })),
          el("div", {}, el("b", {}, x.lead_full_name || "—"), x.lead_phone1 ? el("span", { class: "muted2", style: "margin-left:10px" }, x.lead_phone1) : null)
        ),
        x.company_name ? el("div", { class: "vcol gap6" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("client_company") || tr({ ru: "Компания", uz: "Kompaniya", en: "Company" })),
          el("div", {}, x.company_name)
        ) : null,

        el("div", { class: "grid2" },
          el("div", { class: "vcol gap6" },
            el("div", { class: "muted2", style: "font-size:12px" }, t("course_types") || tr({ ru: "Тип курса", uz: "Kurs turi", en: "Course type" })),
            el("div", {}, x.course_type_name || "—")
          ),
          el("div", { class: "vcol gap6" },
            el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Дата старта", uz: "Boshlanish sanasi", en: "Start date" })),
            el("div", {}, fmtDateOnly(x.course_start_date))
          ),
        ),

        el("div", { class: "grid2" },
          el("div", { class: "vcol gap6" },
            el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Сумма курса", uz: "Kurs summasi", en: "Course price" })),
            el("div", {}, fmtMoney(x.course_price, x.currency))
          ),
          el("div", { class: "vcol gap6" },
            el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Договоренность", uz: "Kelishuv", en: "Agreed" })),
            el("div", {}, x.agreed_amount != null ? fmtMoney(x.agreed_amount, x.currency) : "—")
          ),
        ),

        el("div", { class: "vcol gap6" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Оплата", uz: "To‘lov", en: "Paid" })),
          el("div", {}, x.paid_amount != null ? fmtMoney(x.paid_amount, x.currency) : "—")
        ),

        x.comment ? el("div", { class: "vcol gap6" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("comment") || "Comment"),
          el("div", {}, x.comment)
        ) : null,

        x.cancel_reason ? el("div", { class: "vcol gap6" },
          el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Причина отмены", uz: "Bekor qilish sababi", en: "Cancel reason" })),
          el("div", {}, x.cancel_reason)
        ) : null,
      );

      Modal.open(t("route_courses"), body, [
        { label: t("close") || "Close", kind: "ghost", onClick: () => Modal.close() },
        { label: t("edit") || "Edit", kind: "primary", onClick: () => { Modal.close(); openEdit(id); } },
      ]);
    } catch (e) {
      Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
    }
  }

  async function openEdit(id) {
    try {
      const r = await apiFetch(`/api/course_leads/${id}`);
      const x = r?.data;
      if (!x) return;

      const company2 = el("select", { class: "sel" },
        el("option", { value: "" }, "—"),
        ...companies.filter(c => Number(c.is_active) === 1).map(c =>
          el("option", { value: String(c.id), selected: (Number(x.company_id) === Number(c.id)) ? "selected" : null }, companyLabel(c))
        )
      );

      const type2 = el("select", { class: "sel" },
        el("option", { value: "" }, "—"),
        ...courseTypes.filter(ct => Number(ct.is_active) === 1).map(ct =>
          el("option", { value: String(ct.id), selected: (Number(x.course_type_id) === Number(ct.id)) ? "selected" : null }, ct.name || `#${ct.id}`)
        )
      );

      const priceInp = el("input", { class: "input", disabled: true });
      const startInp = el("input", { class: "input", type: "date", disabled: true });

      const agreedInp = el("input", { class: "input", type: "number", step: "0.01", value: (x.agreed_amount == null ? "" : String(x.agreed_amount)) });
      const paidInp = el("input", { class: "input", type: "number", step: "0.01", value: (x.paid_amount == null ? "" : String(x.paid_amount)) });
      const commentInp = el("textarea", { class: "input", rows: 4 }, x.comment || "");

      const refreshCourseSnapshot = () => {
        const ct = type2.value ? ctById.get(Number(type2.value)) : null;
        if (!ct) { priceInp.value = ""; startInp.value = ""; return; }
        priceInp.value = fmtMoney(ct.price || 0, ct.currency || "UZS");
        startInp.value = toDateInput(ct.start_date);
      };
      type2.addEventListener("change", refreshCourseSnapshot);
      refreshCourseSnapshot();

      const body = el("div", { class: "vcol gap10" },
        el("div", { class: "cChip" }, el("b", {}, `#${x.id}`), el("span", {}, x.lead_full_name || "—")),

        el("div", { class: "grid2" },
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, t("client_company") || tr({ ru: "Компания", uz: "Kompaniya", en: "Company" })),
            company2
          ),
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, t("course_types") || tr({ ru: "Тип курса", uz: "Kurs turi", en: "Course type" })),
            type2
          )
        ),

        el("div", { class: "grid2" },
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Сумма курса", uz: "Kurs summasi", en: "Course price" })),
            priceInp
          ),
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Дата старта", uz: "Boshlanish sanasi", en: "Start date" })),
            startInp
          ),
        ),

        el("div", { class: "grid2" },
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Договоренность", uz: "Kelishuv", en: "Agreed" })),
            agreedInp
          ),
          el("div", { class: "vcol gap8" },
            el("div", { class: "muted2", style: "font-size:12px" }, tr({ ru: "Оплата", uz: "To‘lov", en: "Paid" })),
            paidInp
          ),
        ),

        el("div", { class: "vcol gap8" },
          el("div", { class: "muted2", style: "font-size:12px" }, t("comment") || "Comment"),
          commentInp
        ),
      );

      Modal.open(t("route_courses"), body, [
        { label: t("cancel") || "Cancel", kind: "ghost", onClick: () => Modal.close() },
        { label: t("save") || "Save", kind: "primary", onClick: async () => {
            try {
              const agreed_amount = (agreedInp.value || "").trim() === "" ? null : Number(agreedInp.value);
              const paid_amount = (paidInp.value || "").trim() === "" ? null : Number(paidInp.value);
              if (agreed_amount != null && !Number.isFinite(agreed_amount)) { Toast.show(tr({ ru: "Неверная договоренность", uz: "Kelishuv noto‘g‘ri", en: "Invalid agreed amount" }), "bad"); return; }
              if (paid_amount != null && !Number.isFinite(paid_amount)) { Toast.show(tr({ ru: "Неверная оплата", uz: "To‘lov noto‘g‘ri", en: "Invalid paid amount" }), "bad"); return; }

              const body = {
                company_id: company2.value ? Number(company2.value) : null,
                course_type_id: type2.value ? Number(type2.value) : null,
                agreed_amount,
                paid_amount,
                comment: (commentInp.value || "").trim() || null,
              };

              await apiFetch(`/api/course_leads/${id}`, { method: "PUT", body });
              Modal.close();
              await load();
              Toast.show(t("toast_saved") || "Saved", "ok");
            } catch (e) {
              Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
            }
          }
        }
      ]);
    } catch (e) {
      Toast.show(`${t("toast_error") || "Error"}: ${e.message || "error"}`, "bad");
    }
  }

  // ---- init ----
  await load();

  const openId = App.state.current?.query?.open ? Number(App.state.current.query.open) : null;
  if (openId) openView(openId);
}


async function loadDictCacheIfAny(){
  // cache from admin device (optional)
  const raw = LS.get("gsoft_dict_cache");
  if(!raw) return {cities:[],sources:[],spheres:[]};
  try{
    const obj=JSON.parse(raw);
    return {
      cities: obj.dict_cities || [],
      sources: obj.dict_sources || [],
      spheres: obj.dict_spheres || [],
    };
  }catch{
    return {cities:[],sources:[],spheres:[]};
  }
}

async function refreshDictCacheAdmin(){
  if((App.state.user?.role||"")!=="admin") return null;
  try{
    // admin-only endpoint exists in backend
    const r = await apiFetch("/api/settings/all");
    const data = r.data || {};
    LS.set("gsoft_dict_cache", JSON.stringify(data));
    return {
      cities: data.dict_cities || [],
      sources: data.dict_sources || [],
      spheres: data.dict_spheres || [],
    };
  }catch{
    return null;
  }
}

App.renderClients = async function(host){
  injectClientsStyles();

  // fin has no access in backend — show friendly card
  if((App.state.user?.role||"")==="fin"){
    host.appendChild(el("div",{class:"card cardPad vcol gap10"},
      el("div",{style:"font-weight:900"}, t("toast_error")),
      el("div",{class:"muted"},"No access")
    ));
    return;
  }

  const state = {
    tab: "company",       // company | lead
    q: "",
    list: [],
    companies: [],
    refs: await loadDictCacheIfAny(),
  };

  // if admin — refresh dict cache now
  const fresh = await refreshDictCacheAdmin();
  if(fresh) state.refs=fresh;

  const canCreateCompany = ["admin","rop","sale","pm"].includes(App.state.user.role);
  const canCreateLead    = ["admin","rop","sale"].includes(App.state.user.role); // backend: pm forbidden for lead

  const loadCompaniesForSelect = async ()=>{
    try{
      const r = await API.clients.list("company","");
      state.companies = r.data || [];
    }catch{
      state.companies = [];
    }
  };

  const loadList = async ()=>{
    host.innerHTML="";
    host.appendChild(el("div",{class:"muted"}, t("loading")));
    try{
      const r = await API.clients.list(state.tab, state.q);
      state.list = r.data || [];
      render();
    }catch(e){
      host.innerHTML="";
      host.appendChild(el("div",{class:"card cardPad vcol gap10"},
        el("div",{style:"font-weight:900"}, t("toast_error")),
        el("div",{class:"muted"}, e.message||"Error")
      ));
    }
  };

  const openUpsertModal = async (type, row=null)=>{
    const isEdit=!!row;
    const title = isEdit ? `${t("clients_edit")} • ${type}` : (type==="company" ? t("clients_create_company") : t("clients_create_lead"));

    // fields
    const companyNameInp = el("input",{class:"input",value:row?.company_name||"",placeholder:t("client_company_name")});
    const fullNameInp    = el("input",{class:"input",value:row?.full_name||"",placeholder:t("client_full_name")});
    const phone1Inp      = el("input",{class:"input",value:row?.phone1||"",placeholder:t("client_phone1"),inputmode:"tel"});
    const phone2Inp      = el("input",{class:"input",value:row?.phone2||"",placeholder:t("client_phone2"),inputmode:"tel"});
    const commentInp     = el("textarea",{class:"input",style:"min-height:84px",value:row?.comment||"",placeholder:t("client_comment")});
    const tgInp          = el("input",{class:"input",value:row?.tg_group_link||"",placeholder:t("client_tg_group")});

    // selects (optional: if dicts empty - still ok)
    const citySel   = el("select",{class:"input"});
    const sourceSel = el("select",{class:"input"});
    const sphereSel = el("select",{class:"input"});

    const fillSel = (sel, list, cur)=>{
      sel.appendChild(el("option",{value:""},"—"));
      (list||[]).forEach(it=>{
        const label = (it[`name_${App.state.lang}`] || it.name_uz || it.name_ru || it.name_en || `#${it.id}`);
        sel.appendChild(el("option",{value:String(it.id)}, label));
      });
      sel.value = cur ? String(cur) : "";
    };
    fillSel(citySel, state.refs.cities, row?.city_id);
    fillSel(sourceSel, state.refs.sources, row?.source_id);
    fillSel(sphereSel, state.refs.spheres, row?.sphere_id);

    // lead => choose company_id (optional)
    if(type==="lead" && !state.companies.length) await loadCompaniesForSelect();
    const companySel = el("select",{class:"input"});
    companySel.appendChild(el("option",{value:""},"—"));
    state.companies.forEach(c=>{
      companySel.appendChild(el("option",{value:String(c.id)}, c.company_name || (`#${c.id}`)));
    });
    companySel.value = row?.company_id ? String(row.company_id) : "";

    // layout
    const body = el("div",{class:"vcol gap12"},
      (type==="company"
        ? el("label",{class:"vcol gap8"},
            el("span",{class:"muted2",style:"font-size:12px"}, t("client_company_name")),
            companyNameInp
          )
        : el("div",{class:"vcol gap8"},
            el("span",{class:"muted2",style:"font-size:12px"}, t("client_link_company")),
            companySel
          )
      ),

      el("div",{class:"grid2"},
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("client_full_name")), fullNameInp),
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("client_phone1")), phone1Inp),
      ),
      el("div",{class:"grid2"},
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("client_phone2")), phone2Inp),
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("client_tg_group")), tgInp),
      ),
      el("div",{class:"grid2"},
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("client_city")), citySel),
        el("label",{class:"vcol gap8"}, el("span",{class:"muted2",style:"font-size:12px"},t("client_source")), sourceSel),
      ),
      el("label",{class:"vcol gap8"},
        el("span",{class:"muted2",style:"font-size:12px"},t("client_sphere")),
        sphereSel
      ),
      el("label",{class:"vcol gap8"},
        el("span",{class:"muted2",style:"font-size:12px"},t("client_comment")),
        commentInp
      ),
    );

    Modal.open(title, body, [
      {label:t("cancel"),kind:"ghost",onClick:()=>Modal.close()},
      {label:t("save"),kind:"primary",onClick:async()=>{
        const payload={
          type,
          company_name: (type==="company") ? (companyNameInp.value||"").trim() : null,
          full_name: (fullNameInp.value||"").trim(),
          phone1: (phone1Inp.value||"").trim(),
          phone2: (phone2Inp.value||"").trim() || null,
          city_id: citySel.value ? Number(citySel.value) : null,
          source_id: sourceSel.value ? Number(sourceSel.value) : null,
          sphere_id: sphereSel.value ? Number(sphereSel.value) : null,
          comment: (commentInp.value||"").trim() || null,
          tg_group_link: (tgInp.value||"").trim() || null,
          company_id: (type==="lead" && companySel.value) ? Number(companySel.value) : null,
        };

        // minimal validation per UX
        if(type==="company" && !payload.company_name){
          Toast.show(`${t("toast_error")}: ${t("client_company_name")}`,"bad"); return;
        }
        if(!payload.full_name || !payload.phone1){
          Toast.show(`${t("toast_error")}: ${t("client_full_name")} / ${t("client_phone1")}`,"bad"); return;
        }

        try{
          if(isEdit){
            // backend ignores unknown fields; update only allowed fields
            const upd={
              company_name: payload.company_name,
              full_name: payload.full_name,
              phone1: payload.phone1,
              phone2: payload.phone2,
              city_id: payload.city_id,
              source_id: payload.source_id,
              sphere_id: payload.sphere_id,
              comment: payload.comment,
              tg_group_link: payload.tg_group_link,
              company_id: payload.company_id,
            };
            await API.clients.update(row.id, upd);
          }else{
            await API.clients.create(payload);
          }
          Toast.show(t("toast_saved"),"ok");
          Modal.close();
          await loadList();
        }catch(e){
          Toast.show(`${t("toast_error")}: ${e.message||"error"}`,"bad");
        }
      }},
    ]);
  };

  const openCard = async (id)=>{
    try{
      const r = await API.clients.get(id);
      const data = r.data || {};
      const c = data.client;

      const head = el("div",{class:"vcol gap8"},
        el("div",{style:"display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"},
          el("div",{style:"font-weight:900;font-size:18px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"},
            c.type==="company" ? (c.company_name||`#${c.id}`) : (c.full_name||`#${c.id}`)
          ),
          el("div",{class:"hrow gap8"},
            (c.tg_group_link ? el("a",{class:"btn linkBtn",href:c.tg_group_link,target:"_blank",rel:"noopener"},
              t("clients_go_group")
            ) : null),
            el("button",{class:"btn",type:"button",onClick:()=>openUpsertModal(c.type,c)}, t("clients_edit")),
          )
        ),
        el("div",{class:"muted"},
          `${t("client_full_name")}: ${c.full_name||"—"} • ${t("client_phone1")}: ${c.phone1||"—"}`
        ),
        el("div",{class:"muted2",style:"font-size:12px"},
          `${t("client_city")}: ${dictLabel(state.refs.cities,c.city_id)} • ${t("client_source")}: ${dictLabel(state.refs.sources,c.source_id)} • ${t("client_sphere")}: ${dictLabel(state.refs.spheres,c.sphere_id)}`
        ),
        c.comment ? el("div",{class:"muted2",style:"font-size:12px"}, c.comment) : null
      );

      const projList = (data.projects||[]);
      const clList   = (data.course_leads||[]);

      const projectsBox = el("div",{class:"card cardPad vcol gap10"},
        el("div",{style:"font-weight:900"}, t("clients_card_projects")),
        projList.length
          ? el("div",{class:"smallList"}, projList.map(p=>el("div",{class:"smallItem"},
              el("div",{class:"t"}, p.company_name || c.company_name || `#${p.id}`),
              el("div",{class:"s"},
                `#${p.id}`,
                p.service_name_uz || p.service_name_ru || p.service_name_en || "",
                `PM: ${p.pm_full_name || ""}`,
                (p.deadline_at ? `DL: ${fmtDate(p.deadline_at)}` : "")
              ),
              el("div",{style:"margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"},
                el("button",{class:"btn",type:"button",onClick:()=>{
                  // пока Projects этап не завершён — просто переходим туда
                  location.hash="#/projects";
                  Toast.show("Projects → (filter later)", "ok");
                }}, t("clients_open"))
              )
          )))
          : el("div",{class:"muted"}, t("clients_no_projects"))
      );

      const leadsBox = el("div",{class:"card cardPad vcol gap10"},
        el("div",{style:"font-weight:900"}, t("clients_card_course_leads")),
        clList.length
          ? el("div",{class:"smallList"}, clList.map(x=>el("div",{class:"smallItem"},
              el("div",{class:"t"}, x.lead_full_name || `#${x.id}`),
              el("div",{class:"s"},
                `#${x.id}`,
                `${x.course_type_name||""}`,
                `${x.status||""}`,
                (x.agreed_amount!=null ? `Agreed: ${x.agreed_amount}` : ""),
                (x.paid_amount!=null ? `Paid: ${x.paid_amount}` : "")
              ),
              el("div",{style:"margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"},
                el("button",{class:"btn",type:"button",onClick:()=>{
                  Modal.close(); // закрыть карточку компании
                  setHash("/courses", {
                    open: String(x.id),           // открыть конкретный курс
                    company_id: String(c.id || "")// (опционально) фильтр по компании
                  });
                }}, t("clients_open"))
              )
          )))
          : el("div",{class:"muted"}, t("clients_no_course_leads"))
      );

      const body = el("div",{class:"vcol gap12"}, head,
        (c.type==="company" ? el("div",{class:"cliCardGrid"}, projectsBox, leadsBox) : null)
      );

      Modal.open(t("clients_open"), body, [
        {label:t("close"),kind:"ghost",onClick:()=>Modal.close()},
      ]);
    }catch(e){
      Toast.show(`${t("toast_error")}: ${e.message||"error"}`,"bad");
    }
  };

  const render = ()=>{
    host.innerHTML="";

    const tabs = el("div",{class:"tabs"},
      el("button",{class:`tabBtn ${state.tab==="company"?"active":""}`,type:"button",onClick:async()=>{state.tab="company";await loadList();}}, t("clients_companies")),
      el("button",{class:`tabBtn ${state.tab==="lead"?"active":""}`,type:"button",onClick:async()=>{state.tab="lead";await loadList();}}, t("clients_leads")),
    );

    const qInp = el("input",{class:"input",value:state.q,placeholder:t("clients_search")});
    qInp.addEventListener("keydown",(e)=>{ if(e.key==="Enter") loadList(); });

    const createBtn = (state.tab==="company")
      ? el("button",{class:"btn",type:"button",disabled:!canCreateCompany,onClick:()=>openUpsertModal("company",null)}, t("clients_create_company"))
      : el("button",{class:"btn",type:"button",disabled:!canCreateLead,onClick:()=>openUpsertModal("lead",null)}, t("clients_create_lead"));

    const top = el("div",{class:"card cardPad vcol gap10"},
      el("div",{class:"cliTop"},
        el("div",{style:"font-weight:900;font-size:18px"}, t("clients_title")),
        tabs
      ),
      el("div",{class:"cliFilters"},
        qInp,
        el("button",{class:"btn",type:"button",onClick:()=>{state.q=qInp.value||""; loadList();}}, t("search")||"Search"),
        createBtn
      )
    );

    const list = state.list.length
      ? el("div",{class:"cliList"}, state.list.map(row=>{
          const title = (row.type==="company")
            ? (row.company_name || `#${row.id}`)
            : (row.full_name || `#${row.id}`);

          const subParts = [
            `${t("client_full_name")}: ${row.full_name||"—"}`,
            `${t("client_phone1")}: ${row.phone1||"—"}`,
            row.phone2 ? `${t("client_phone2")}: ${row.phone2}` : "",
            `${t("client_city")}: ${dictLabel(state.refs.cities,row.city_id)}`,
            `${t("client_source")}: ${dictLabel(state.refs.sources,row.source_id)}`,
            `${t("client_sphere")}: ${dictLabel(state.refs.spheres,row.sphere_id)}`,
          ].filter(Boolean);

          return el("div",{class:"cliRow"},
            el("div",{class:"cliMain"},
              el("div",{class:"cliTitle"}, title),
              el("div",{class:"cliSub"}, ...subParts.map(s=>el("span",{},s)))
            ),
            el("div",{class:"cliActions"},
              el("button",{class:"iconBtn",type:"button",title:t("clients_open"),onClick:()=>openCard(row.id)},
                el("span",{class:"icoWrap",html:ICONS.eye || ICONS.open || ICONS.edit})
              ),
              el("button",{class:"iconBtn",type:"button",title:t("clients_edit"),onClick:()=>openUpsertModal(row.type,row)},
                el("span",{class:"icoWrap",html:ICONS.edit})
              ),
              el("button",{class:"iconBtn",type:"button",title:t("delete"),onClick:async()=>{
                const ok = await Modal.confirm(t("delete"), t("clients_delete_confirm"));
                if(!ok) return;
                try{
                  await API.clients.del(row.id);
                  Toast.show(t("clients_deleted"),"ok");
                  await loadList();
                }catch(e){
                  Toast.show(`${t("toast_error")}: ${e.message||"error"}`,"bad");
                }
              }},
                el("span",{class:"icoWrap",html:ICONS.trash})
              )
            )
          );
        }))
      : el("div",{class:"card cardPad muted"}, t("no_data"));

    host.append(top, el("div",{class:"card cardPad"}, list));
  };

  await loadList();
};


  async function start(){
    injectStyles();
    applyTheme();

    if (isLoginPage()){
      App.renderLogin();
      return;
    }

    try{
      const me = await API.me();
      App.state.user = me.data.user;

      await tryLoadThemeFromServer(); // theme from backend (admin)
      applyTheme();

      App.renderShell();
      App.bindRouting();

      if(!location.hash || !location.hash.startsWith("#/")) setHash(DEFAULT_ROUTE);
      else App.routeNow();
    } catch(e){
      location.href = "/login";
    }
  }

  window.GSOFT = App;
  start();
})();
