// /assets/js/lang.js
// Simple i18n for G-SOFT (uz/ru/en)
// Usage:
//  - put data-i18n="key" on elements (uses textContent)
//  - or data-i18n-attr="placeholder:title:aria-label" with data-i18n-key="key_for_first_attr" etc (optional)
// API exposed: window.GSOFT_LANG = { t, setLang, getLang, apply, dict }

(() => {
  "use strict";

  const LS_KEY = "gsoft_lang";
  const ORDER = ["ru", "uz", "en"]; // as in your baseline preference
  const DEFAULT_LANG = "uz";

  // ---------------------------
  // Dictionary
  // ---------------------------
  const dict = {
    uz: {
      // general
      loading: "Yuklanmoqda...",
      ok: "OK",
      cancel: "Bekor",
      save: "Saqlash",
      create: "Yaratish",
      add: "Qo‘shish",
      edit: "Tahrir",
      delete: "O‘chirish",
      deleted: "O‘chirildi",
      saved: "Saqlandi",
      created: "Yaratildi",
      retry: "Qayta urinish",
      error: "Xatolik",
      empty: "Bo‘sh",
      all: "Hammasi",
      hide: "Yashirish",
      show: "Ko‘rsatish",
      optional: "ixtiyoriy",
      search: "Qidirish",
      search_placeholder: "Matn...",
      comment: "Izoh",
      note: "Izoh",
      active: "Active",
      yes: "Ha",
      no: "Yo‘q",
      price: "Narx",
      currency: "Valyuta",
      sort: "Sort",
      color: "Rang",
      name: "Nomi",
      title: "Sarlavha",
      description: "Izoh",
      status: "Status",
      type: "Turi",
      phone: "Telefon",
      phone2: "Telefon 2",
      password: "Parol",
      pass_hint: "Tahrirda bo‘sh qoldirsang o‘zgarmaydi",
      confirm_title: "Tasdiqlash",
      delete_confirm: "Haqiqatan o‘chirasizmi?",
      forbidden: "Ruxsat yo‘q",
      coming_soon: "Tez kunda",

      // app/header/sidebar
      app_subtitle: "Boshqaruv tizimi",
      sidebar_hint: "Menyu ustiga olib borsangiz ochiladi",
      menu_profile: "Profil",
      menu_interface: "Interfeys",
      ui_lang: "Til",
      ui_theme: "Rejim",
      ui_eye: "Ko‘z himoyasi",
      me_user: "Foydalanuvchi",
      me_role: "Rol",
      me_time: "Vaqt",
      logout: "Chiqish",

      // menu
      menu_main: "Asosiy",
      menu_tasks: "Vazifalar",
      menu_projects: "Loyihalar",
      menu_courses: "Kurslar",
      menu_clients: "Klientlar",
      menu_settings: "Sozlamalar",
      menu_users: "Foydalanuvchilar",

      // login
      login_subtitle: "Kirish",
      login_title: "Tizimga kirish",
      login_hint: "Login va parolingizni kiriting",
      login_login: "Login",
      login_password: "Parol",
      login_btn: "Kirish",
      login_remember_ui: "Brauzerda eslab qolish",
      login_server_hint: "API: /api",

      // main
      main_overdue: "Muddati o‘tgan",
      main_today: "Bugungi",
      main_in_progress: "Jarayondagi",
      main_in_progress_hint: "Faqat bitta vazifa Jarayonda bo‘lishi mumkin",

      // tasks/projects/courses fields
      new_task: "Yangi vazifa",
      new_project: "Yangi loyiha",
      new_lead: "Yangi lead",
      project: "Loyiha",
      projects: "Loyihalar",
      task: "Vazifa",
      client: "Klient",
      company: "Kompaniya",
      lead: "Lead",
      course: "Kurs",
      course_leads: "Kurs leadlari",
      assignee: "Mas'ul",
      deadline: "Deadline",
      deadline_hint: "Epoch seconds (ixtiyoriy)",
      spent: "Sarflangan",
      project_id: "Project ID",
      assignee_id: "Assignee ID",
      desc_required: "Izoh majburiy",

      pm: "PM",
      meeting: "Uchrashuv",
      service: "Xizmat",
      show_done: "Done/Canceled",
      show_canceled: "Canceled",

      // status labels (generic)
      st_new: "Yangi",
      st_pause: "Pauza",
      st_in_progress: "Jarayonda",
      st_done: "Yakunlangan",
      st_canceled: "Bekor qilingan",
      st_later: "Keyin",
      st_tz: "TZ berilgan",
      st_offer: "Offer berilgan",
      st_need_call: "Qo‘ng‘iroq kerak",
      st_thinking: "O‘ylayapti",
      st_enrolled: "Yozildi",
      st_studying: "O‘qiyapti",

      // actions
      to_pause: "Pauza",
      to_in_progress: "Jarayonda",
      to_done: "Done",
      to_cancel: "Bekor",
      to_later: "Keyin",
      cancel_reason: "Bekor qilish sababi",
      paid_amount_required: "Paid amount kiriting",
      paid: "Paid",
      agreed: "Kelishilgan",
      start_date: "Start sana",

      // settings
      settings_hint: "Siz bu yerda theme va spravochniklarni boshqarasiz",
      theme: "Theme",
      theme_json: "Theme JSON",
      dicts: "Spravochniklar",
      dicts_hint: "Qo‘shish/tahrirlash/o‘chirish — soft",
      cities: "Shaharlar",
      sources: "Manbalar",
      spheres: "Soha",
      service_types: "Xizmat turlari",
      course_types: "Kurs turlari",
      final_type: "Final type",
      final_type_hint: "Faqat statuslar uchun",
      name_required: "Nomi majburiy",
    },

    ru: {
      // general
      loading: "Загрузка...",
      ok: "OK",
      cancel: "Отмена",
      save: "Сохранить",
      create: "Создать",
      add: "Добавить",
      edit: "Редактировать",
      delete: "Удалить",
      deleted: "Удалено",
      saved: "Сохранено",
      created: "Создано",
      retry: "Повторить",
      error: "Ошибка",
      empty: "Пусто",
      all: "Все",
      hide: "Скрыть",
      show: "Показать",
      optional: "необязательно",
      search: "Поиск",
      search_placeholder: "Текст...",
      comment: "Комментарий",
      note: "Примечание",
      active: "Активно",
      yes: "Да",
      no: "Нет",
      price: "Цена",
      currency: "Валюта",
      sort: "Сортировка",
      color: "Цвет",
      name: "Название",
      title: "Заголовок",
      description: "Описание",
      status: "Статус",
      type: "Тип",
      phone: "Телефон",
      phone2: "Телефон 2",
      password: "Пароль",
      pass_hint: "В редактировании оставьте пустым — не изменится",
      confirm_title: "Подтверждение",
      delete_confirm: "Вы действительно хотите удалить?",
      forbidden: "Нет доступа",
      coming_soon: "Скоро",

      // app/header/sidebar
      app_subtitle: "Система управления",
      sidebar_hint: "Наведите на меню — откроется",
      menu_profile: "Профиль",
      menu_interface: "Интерфейс",
      ui_lang: "Язык",
      ui_theme: "Тема",
      ui_eye: "Защита глаз",
      me_user: "Пользователь",
      me_role: "Роль",
      me_time: "Время",
      logout: "Выйти",

      // menu
      menu_main: "Главная",
      menu_tasks: "Задачи",
      menu_projects: "Проекты",
      menu_courses: "Курсы",
      menu_clients: "Клиенты",
      menu_settings: "Настройки",
      menu_users: "Пользователи",

      // login
      login_subtitle: "Вход",
      login_title: "Вход в систему",
      login_hint: "Введите логин и пароль",
      login_login: "Логин",
      login_password: "Пароль",
      login_btn: "Войти",
      login_remember_ui: "Запомнить в браузере",
      login_server_hint: "API: /api",

      // main
      main_overdue: "Просроченные",
      main_today: "Сегодня",
      main_in_progress: "В процессе",
      main_in_progress_hint: "Только одна задача может быть «В процессе»",

      // tasks/projects/courses fields
      new_task: "Новая задача",
      new_project: "Новый проект",
      new_lead: "Новый лид",
      project: "Проект",
      projects: "Проекты",
      task: "Задача",
      client: "Клиент",
      company: "Компания",
      lead: "Лид",
      course: "Курс",
      course_leads: "Лиды курсов",
      assignee: "Ответственный",
      deadline: "Дедлайн",
      deadline_hint: "Epoch seconds (необязательно)",
      spent: "Потрачено",
      project_id: "Project ID",
      assignee_id: "Assignee ID",
      desc_required: "Описание обязательно",

      pm: "PM",
      meeting: "Встреча",
      service: "Услуга",
      show_done: "Done/Canceled",
      show_canceled: "Canceled",

      // status labels
      st_new: "Новый",
      st_pause: "Пауза",
      st_in_progress: "В процессе",
      st_done: "Завершено",
      st_canceled: "Отменено",
      st_later: "Позже",
      st_tz: "ТЗ выдано",
      st_offer: "Оффер выдан",
      st_need_call: "Нужно позвонить",
      st_thinking: "Думает",
      st_enrolled: "Записан",
      st_studying: "Учится",

      // actions
      to_pause: "Пауза",
      to_in_progress: "В процессе",
      to_done: "Done",
      to_cancel: "Отмена",
      to_later: "Позже",
      cancel_reason: "Причина отмены",
      paid_amount_required: "Введите сумму оплаты",
      paid: "Оплачено",
      agreed: "Согласовано",
      start_date: "Дата старта",

      // settings
      settings_hint: "Здесь вы управляете темой и справочниками",
      theme: "Тема",
      theme_json: "JSON темы",
      dicts: "Справочники",
      dicts_hint: "Добавление/редактирование/удаление — soft",
      cities: "Города",
      sources: "Источники",
      spheres: "Сферы",
      service_types: "Типы услуг",
      course_types: "Типы курсов",
      final_type: "Final type",
      final_type_hint: "Только для статусов",
      name_required: "Название обязательно",
    },

    en: {
      // general
      loading: "Loading...",
      ok: "OK",
      cancel: "Cancel",
      save: "Save",
      create: "Create",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      deleted: "Deleted",
      saved: "Saved",
      created: "Created",
      retry: "Retry",
      error: "Error",
      empty: "Empty",
      all: "All",
      hide: "Hide",
      show: "Show",
      optional: "optional",
      search: "Search",
      search_placeholder: "Text...",
      comment: "Comment",
      note: "Note",
      active: "Active",
      yes: "Yes",
      no: "No",
      price: "Price",
      currency: "Currency",
      sort: "Sort",
      color: "Color",
      name: "Name",
      title: "Title",
      description: "Description",
      status: "Status",
      type: "Type",
      phone: "Phone",
      phone2: "Phone 2",
      password: "Password",
      pass_hint: "In edit: leave empty to keep unchanged",
      confirm_title: "Confirm",
      delete_confirm: "Are you sure you want to delete?",
      forbidden: "No access",
      coming_soon: "Coming soon",

      // app/header/sidebar
      app_subtitle: "Management system",
      sidebar_hint: "Hover menu to expand",
      menu_profile: "Profile",
      menu_interface: "Interface",
      ui_lang: "Language",
      ui_theme: "Theme",
      ui_eye: "Eye protection",
      me_user: "User",
      me_role: "Role",
      me_time: "Time",
      logout: "Logout",

      // menu
      menu_main: "Main",
      menu_tasks: "Tasks",
      menu_projects: "Projects",
      menu_courses: "Courses",
      menu_clients: "Clients",
      menu_settings: "Settings",
      menu_users: "Users",

      // login
      login_subtitle: "Login",
      login_title: "Sign in",
      login_hint: "Enter your login and password",
      login_login: "Login",
      login_password: "Password",
      login_btn: "Sign in",
      login_remember_ui: "Remember in browser",
      login_server_hint: "API: /api",

      // main
      main_overdue: "Overdue",
      main_today: "Today",
      main_in_progress: "In progress",
      main_in_progress_hint: "Only one task can be In progress",

      // tasks/projects/courses fields
      new_task: "New task",
      new_project: "New project",
      new_lead: "New lead",
      project: "Project",
      projects: "Projects",
      task: "Task",
      client: "Client",
      company: "Company",
      lead: "Lead",
      course: "Course",
      course_leads: "Course leads",
      assignee: "Assignee",
      deadline: "Deadline",
      deadline_hint: "Epoch seconds (optional)",
      spent: "Spent",
      project_id: "Project ID",
      assignee_id: "Assignee ID",
      desc_required: "Description required",

      pm: "PM",
      meeting: "Meeting",
      service: "Service",
      show_done: "Done/Canceled",
      show_canceled: "Canceled",

      // status labels
      st_new: "New",
      st_pause: "Pause",
      st_in_progress: "In progress",
      st_done: "Done",
      st_canceled: "Canceled",
      st_later: "Later",
      st_tz: "TZ given",
      st_offer: "Offer given",
      st_need_call: "Need call",
      st_thinking: "Thinking",
      st_enrolled: "Enrolled",
      st_studying: "Studying",

      // actions
      to_pause: "Pause",
      to_in_progress: "In progress",
      to_done: "Done",
      to_cancel: "Cancel",
      to_later: "Later",
      cancel_reason: "Cancel reason",
      paid_amount_required: "Enter paid amount",
      paid: "Paid",
      agreed: "Agreed",
      start_date: "Start date",

      // settings
      settings_hint: "Manage theme and dictionaries here",
      theme: "Theme",
      theme_json: "Theme JSON",
      dicts: "Dictionaries",
      dicts_hint: "Add/edit/delete — soft",
      cities: "Cities",
      sources: "Sources",
      spheres: "Spheres",
      service_types: "Service types",
      course_types: "Course types",
      final_type: "Final type",
      final_type_hint: "For statuses only",
      name_required: "Name is required",
    },
  };

  // ---------------------------
  // Core
  // ---------------------------
  function normalizeLang(lang) {
    lang = String(lang || "").toLowerCase().trim();
    if (dict[lang]) return lang;
    // accept like "ru-RU"
    const base = lang.split("-")[0];
    if (dict[base]) return base;
    return DEFAULT_LANG;
  }

  function getLang() {
    const htmlLang = document.documentElement.getAttribute("data-lang");
    if (htmlLang) return normalizeLang(htmlLang);
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return normalizeLang(saved);
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    lang = normalizeLang(lang);
    localStorage.setItem(LS_KEY, lang);
    document.documentElement.setAttribute("data-lang", lang);
    apply(document);
  }

  function t(key) {
    const lang = getLang();
    const pack = dict[lang] || {};
    if (pack[key] != null) return pack[key];

    // fallback order (ru -> uz -> en) as you use
    for (const l of ORDER) {
      const p = dict[l] || {};
      if (p[key] != null) return p[key];
    }
    // final fallback: key itself
    return key;
  }

  function apply(root = document) {
    const lang = getLang();
    document.documentElement.setAttribute("lang", lang);

    // text nodes
    const nodes = root.querySelectorAll("[data-i18n]");
    nodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    // attribute translation (optional)
    // Example:
    // <input data-i18n-attr="placeholder:title" data-i18n-placeholder="search_placeholder" data-i18n-title="search" />
    const attrNodes = root.querySelectorAll("[data-i18n-attr]");
    attrNodes.forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr") || "";
      const attrs = spec.split(":").map((x) => x.trim()).filter(Boolean);
      attrs.forEach((attr) => {
        const k = el.getAttribute(`data-i18n-${attr}`);
        if (k) el.setAttribute(attr, t(k));
      });
    });

    // mark active lang buttons
    root.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang-btn") === lang);
    });
  }

  // init on load
  setLang(getLang());

  window.GSOFT_LANG = { t, setLang, getLang, apply, dict };
})();
