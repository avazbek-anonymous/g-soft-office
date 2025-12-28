// controllers/i18n.js
// G-SOFT 2 — single i18n controller (ru/uz/en)

const LS_KEY = "gsoft_lang";
const LANG_ORDER = ["ru", "uz", "en"];

// ====== DICTIONARIES (ALL KEYS) ======
const dict = {
  ru: {
    // App
    "app.name": "G-SOFT",

    // Nav (sidebar)
    "nav.main": "Главная",
    "nav.tasks": "Задачи",
    "nav.projects": "Проекты",
    "nav.courses": "Курсы",
    "nav.course_catalog": "Каталог курсов",
    "nav.clients": "Клиенты",
    "nav.settings": "Настройки",
    "nav.users": "Пользователи",
    "nav.roles": "Роли",

    // Auth
    "auth.login.title": "Вход",
    "auth.login.login": "Логин",
    "auth.login.password": "Пароль",
    "auth.login.submit": "Войти",
    "auth.login.error": "Неверный логин или пароль",
    "auth.logout": "Выход",

    // Header roles
    "header.role.admin": "Администратор",
    "header.role.pm": "Проектный менеджер",
    "header.role.fin": "Мол. агент",

    // Common UI
    "common.loading": "Загрузка…",
    "common.error": "Ошибка",
    "common.search": "Поиск",
    "common.back": "Назад",
    "common.cancel": "Отмена",
    "common.close": "Закрыть",
    "common.apply": "Применить",
    "common.clear": "Сброс",
    "common.refresh": "Обновить",

    // Common actions
    "common.actions": "Действия",
    "common.save": "Сохранить",
    "common.new": "Новый",
    "common.create": "Создать",
    "common.edit": "Редактировать",
    "common.view": "Просмотр",
    "common.archive": "Архивировать",
    "common.restore": "Восстановить",
    "common.delete": "Удалить", // не использовать в UI, только если надо как текст
    "common.noData": "Нет данных",
    "common.noAccess": "Нет доступа",
    "common.comingSoon": "Скоро появится",

    // Common fields
    "common.id": "ID",
    "common.code": "Код",
    "common.name": "Название",
    "common.title": "Заголовок",
    "common.description": "Описание",
    "common.comment": "Комментарий",
    "common.status": "Статус",
    "common.type": "Тип",
    "common.active": "Активно",
    "common.default": "По умолчанию",
    "common.color": "Цвет",
    "common.sort": "Сортировка",
    "common.created_at": "Создано",
    "common.updated_at": "Обновлено",
    "common.archived": "Архив",
    "common.is_deleted": "Архивировано",

    // Common validation/messages
    "common.required": "Обязательное поле",
    "common.requiredName": "Поле “Название” обязательно",
    "common.notFound": "Не найдено",
    "msg.saved": "Сохранено",
    "msg.archived": "Архивировано",
    "msg.restored": "Восстановлено",

    // Filters
    "filter.title": "Фильтры",
    "filter.by_user": "По пользователю",
    "filter.by_project": "По проекту",
    "filter.by_client": "По клиенту",
    "filter.by_status": "По статусу",
    "filter.by_type": "По типу",
    "filter.by_date": "По дате",
    "filter.from": "С",
    "filter.to": "По",
    "filter.only_active": "Только активные",
    "filter.include_archived": "Показывать архив",

    // Settings
    "settings.title": "Настройки",
    "settings.dicts": "Справочники",
    "settings.items": "Элементы",
    "settings.showArchived": "Показать архив",
    "settings.finalType": "Итоговый тип",
    "settings.subtitle": "Управление справочниками",
    "settings.pickDict": "Выберите справочник слева",
    "settings.noDict": "Справочник не выбран",

    // Roles
    "roles.title": "Роли",
    "roles.permissions": "Разрешения",
    "roles.save": "Сохранить",
    "roles.role_key": "Ключ роли",
    "roles.role_name": "Название роли",

    // Users
    "users.title": "Пользователи",
    "users.role": "Роль",
    "users.status": "Статус",
    "users.save": "Сохранить",
    "users.login": "Логин",
    "users.password": "Пароль",
    "users.full_name": "ФИО",
    "users.phone": "Телефон",

    // Clients
    "clients.title": "Клиенты",
    "clients.company_name": "Компания",
    "clients.full_name": "Контактное лицо",
    "clients.phone1": "Телефон 1",
    "clients.phone2": "Телефон 2",
    "clients.city_id": "Город",
    "clients.source_id": "Источник",
    "clients.sphere": "Сфера",
    "clients.comment": "Комментарий",

    // Course Catalog
    "course_catalog.title": "Каталог курсов",
    "course_catalog.course_name": "Название курса",
    "course_catalog.price": "Цена",
    "course_catalog.currency": "Валюта",
    "course_catalog.active": "Активно",

    // Courses
    "courses.title": "Курсы",
    "courses.name": "Название (группа/поток)",
    "courses.catalog_id": "Курс (из каталога)",
    "courses.start_at": "Дата старта",
    "courses.end_at": "Дата окончания",
    "courses.active": "Активно",
    "courses.enrollment_status": "Статус обучения",
    "courses.price": "Цена",
    "courses.paid": "Оплачено",
    "courses.note": "Примечание",

    // Projects
    "projects.title": "Проекты",
    "projects.name": "Название проекта",
    "projects.client_id": "Клиент",
    "projects.project_status_id": "Статус проекта",
    "projects.project_type_id": "Тип проекта",
    "projects.owner_user_id": "Ответственный",
    "projects.start_at": "Дата начала",
    "projects.end_at": "Дата окончания",
    "projects.comment": "Комментарий",

    // Tasks
    "tasks.title": "Задачи",
    "tasks.title_field": "Задача",
    "tasks.description": "Описание",
    "tasks.project_id": "Проект",
    "tasks.status_id": "Статус задачи",
    "tasks.assignee_user_id": "Исполнитель",
    "tasks.due_at": "Срок",
    "tasks.priority": "Приоритет",
    "tasks.comment": "Комментарий",

    // Kanban
    "kanban.title": "Канбан",
    "kanban.count": "Кол-во",
    "kanban.empty": "Пусто",
    "kanban.drag_hint": "Перетащите карточку",

    // Dict titles
    "dict.cities": "Города",
    "dict.sources": "Источники",
    "dict.spheres": "Сферы",
    "dict.task_statuses": "Статусы задач",
    "dict.project_statuses": "Статусы проектов",
    "dict.lead_statuses": "Статусы лидов",
    "dict.project_types": "Типы проектов"
  },

  uz: {
    // App
    "app.name": "G-SOFT",

    // Nav
    "nav.main": "Asosiy",
    "nav.tasks": "Vazifalar",
    "nav.projects": "Loyihalar",
    "nav.courses": "Kurslar",
    "nav.course_catalog": "Kurs katalogi",
    "nav.clients": "Mijozlar",
    "nav.settings": "Sozlamalar",
    "nav.users": "Foydalanuvchilar",
    "nav.roles": "Rollar",

    // Auth
    "auth.login.title": "Kirish",
    "auth.login.login": "Login",
    "auth.login.password": "Parol",
    "auth.login.submit": "Kirish",
    "auth.login.error": "Login yoki parol xato",
    "auth.logout": "Chiqish",

    // Header roles
    "header.role.admin": "Admin",
    "header.role.pm": "PM",
    "header.role.fin": "Moliya agenti",

    // Common UI
    "common.loading": "Yuklanmoqda…",
    "common.error": "Xatolik",
    "common.search": "Qidiruv",
    "common.back": "Orqaga",
    "common.cancel": "Bekor qilish",
    "common.close": "Yopish",
    "common.apply": "Qo‘llash",
    "common.clear": "Tozalash",
    "common.refresh": "Yangilash",

    // Common actions
    "common.actions": "Amallar",
    "common.save": "Saqlash",
    "common.new": "Yangi",
    "common.create": "Yaratish",
    "common.edit": "Tahrirlash",
    "common.view": "Ko‘rish",
    "common.archive": "Arxivlash",
    "common.restore": "Tiklash",
    "common.delete": "O‘chirish",
    "common.noData": "Ma'lumot yo‘q",
    "common.noAccess": "Ruxsat yo‘q",
    "common.comingSoon": "Tez kunda",

    // Common fields
    "common.id": "ID",
    "common.code": "Kod",
    "common.name": "Nomi",
    "common.title": "Sarlavha",
    "common.description": "Tavsif",
    "common.comment": "Izoh",
    "common.status": "Status",
    "common.type": "Turi",
    "common.active": "Faol",
    "common.default": "Standart",
    "common.color": "Rang",
    "common.sort": "Tartib",
    "common.created_at": "Yaratilgan",
    "common.updated_at": "Yangilangan",
    "common.archived": "Arxiv",
    "common.is_deleted": "Arxivlangan",

    // Common validation/messages
    "common.required": "Majburiy maydon",
    "common.requiredName": "“Nomi” maydoni majburiy",
    "common.notFound": "Topilmadi",
    "msg.saved": "Saqlanди",
    "msg.archived": "Arxivlandi",
    "msg.restored": "Tiklandi",

    // Filters
    "filter.title": "Filtrlar",
    "filter.by_user": "Foydalanuvchi bo‘yicha",
    "filter.by_project": "Loyiha bo‘yicha",
    "filter.by_client": "Mijoz bo‘yicha",
    "filter.by_status": "Status bo‘yicha",
    "filter.by_type": "Tur bo‘yicha",
    "filter.by_date": "Sana bo‘yicha",
    "filter.from": "Dan",
    "filter.to": "Gacha",
    "filter.only_active": "Faqat faol",
    "filter.include_archived": "Arxivni ko‘rsatish",

    // Settings
    "settings.title": "Sozlamalar",
    "settings.dicts": "Lug‘atlar",
    "settings.items": "Elementlar",
    "settings.showArchived": "Arxivni ko‘rsatish",
    "settings.finalType": "Yakuniy turi",
    "settings.subtitle": "Lug‘atlarni boshqarish",
    "settings.pickDict": "Chapdan lug‘at tanlang",
    "settings.noDict": "Lug‘at tanlanmagan",

    // Roles
    "roles.title": "Rollar",
    "roles.permissions": "Ruxsatlar",
    "roles.save": "Saqlash",
    "roles.role_key": "Rol kaliti",
    "roles.role_name": "Rol nomi",

    // Users
    "users.title": "Foydalanuvchilar",
    "users.role": "Rol",
    "users.status": "Holat",
    "users.save": "Saqlash",
    "users.login": "Login",
    "users.password": "Parol",
    "users.full_name": "F.I.Sh",
    "users.phone": "Telefon",

    // Clients
    "clients.title": "Mijozlar",
    "clients.company_name": "Kompaniya",
    "clients.full_name": "Kontakt shaxs",
    "clients.phone1": "Telefon 1",
    "clients.phone2": "Telefon 2",
    "clients.city_id": "Shahar",
    "clients.source_id": "Manba",
    "clients.sphere": "Soha",
    "clients.comment": "Izoh",

    // Course Catalog
    "course_catalog.title": "Kurs katalogi",
    "course_catalog.course_name": "Kurs nomi",
    "course_catalog.price": "Narx",
    "course_catalog.currency": "Valyuta",
    "course_catalog.active": "Faol",

    // Courses
    "courses.title": "Kurslar",
    "courses.name": "Nomi (guruh/oqim)",
    "courses.catalog_id": "Kurs (katalogdan)",
    "courses.start_at": "Boshlanish sanasi",
    "courses.end_at": "Tugash sanasi",
    "courses.active": "Faol",
    "courses.enrollment_status": "O‘qish statusi",
    "courses.price": "Narx",
    "courses.paid": "To‘langan",
    "courses.note": "Izoh",

    // Projects
    "projects.title": "Loyihalar",
    "projects.name": "Loyiha nomi",
    "projects.client_id": "Mijoz",
    "projects.project_status_id": "Loyiha statusi",
    "projects.project_type_id": "Loyiha turi",
    "projects.owner_user_id": "Mas’ul",
    "projects.start_at": "Boshlanish",
    "projects.end_at": "Tugash",
    "projects.comment": "Izoh",

    // Tasks
    "tasks.title": "Vazifalar",
    "tasks.title_field": "Vazifa",
    "tasks.description": "Tavsif",
    "tasks.project_id": "Loyiha",
    "tasks.status_id": "Vazifa statusi",
    "tasks.assignee_user_id": "Ijrochi",
    "tasks.due_at": "Muddat",
    "tasks.priority": "Ustuvorlik",
    "tasks.comment": "Izoh",

    // Kanban
    "kanban.title": "Kanban",
    "kanban.count": "Soni",
    "kanban.empty": "Bo‘sh",
    "kanban.drag_hint": "Kartani tortib o‘tkazing",

    // Dict titles
    "dict.cities": "Shaharlar",
    "dict.sources": "Manbalar",
    "dict.spheres": "Sohalar",
    "dict.task_statuses": "Vazifa statuslari",
    "dict.project_statuses": "Loyiha statuslari",
    "dict.lead_statuses": "Lead statuslari",
    "dict.project_types": "Loyiha turlari"
  },

  en: {
    // App
    "app.name": "G-SOFT",

    // Nav
    "nav.main": "Main",
    "nav.tasks": "Tasks",
    "nav.projects": "Projects",
    "nav.courses": "Courses",
    "nav.course_catalog": "Course Catalog",
    "nav.clients": "Clients",
    "nav.settings": "Settings",
    "nav.users": "Users",
    "nav.roles": "Roles",

    // Auth
    "auth.login.title": "Login",
    "auth.login.login": "Login",
    "auth.login.password": "Password",
    "auth.login.submit": "Sign in",
    "auth.login.error": "Invalid login or password",
    "auth.logout": "Logout",

    // Header roles
    "header.role.admin": "Admin",
    "header.role.pm": "Project Manager",
    "header.role.fin": "Finance Agent",

    // Common UI
    "common.loading": "Loading…",
    "common.error": "Error",
    "common.search": "Search",
    "common.back": "Back",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.apply": "Apply",
    "common.clear": "Clear",
    "common.refresh": "Refresh",

    // Common actions
    "common.actions": "Actions",
    "common.save": "Save",
    "common.new": "New",
    "common.create": "Create",
    "common.edit": "Edit",
    "common.view": "View",
    "common.archive": "Archive",
    "common.restore": "Restore",
    "common.delete": "Delete",
    "common.noData": "No data",
    "common.noAccess": "No access",
    "common.comingSoon": "Coming soon",

    // Common fields
    "common.id": "ID",
    "common.code": "Code",
    "common.name": "Name",
    "common.title": "Title",
    "common.description": "Description",
    "common.comment": "Comment",
    "common.status": "Status",
    "common.type": "Type",
    "common.active": "Active",
    "common.default": "Default",
    "common.color": "Color",
    "common.sort": "Sort",
    "common.created_at": "Created",
    "common.updated_at": "Updated",
    "common.archived": "Archived",
    "common.is_deleted": "Archived",

    // Common validation/messages
    "common.required": "Required field",
    "common.requiredName": "Name is required",
    "common.notFound": "Not found",
    "msg.saved": "Saved",
    "msg.archived": "Archived",
    "msg.restored": "Restored",

    // Filters
    "filter.title": "Filters",
    "filter.by_user": "By user",
    "filter.by_project": "By project",
    "filter.by_client": "By client",
    "filter.by_status": "By status",
    "filter.by_type": "By type",
    "filter.by_date": "By date",
    "filter.from": "From",
    "filter.to": "To",
    "filter.only_active": "Only active",
    "filter.include_archived": "Show archived",

    // Settings
    "settings.title": "Settings",
    "settings.dicts": "Dictionaries",
    "settings.items": "Items",
    "settings.showArchived": "Show archived",
    "settings.finalType": "Final type",
    "settings.subtitle": "Manage dictionaries",
    "settings.pickDict": "Select a dictionary on the left",
    "settings.noDict": "Dictionary is not selected",

    // Roles
    "roles.title": "Roles",
    "roles.permissions": "Permissions",
    "roles.save": "Save",
    "roles.role_key": "Role key",
    "roles.role_name": "Role name",

    // Users
    "users.title": "Users",
    "users.role": "Role",
    "users.status": "Status",
    "users.save": "Save",
    "users.login": "Login",
    "users.password": "Password",
    "users.full_name": "Full name",
    "users.phone": "Phone",

    // Clients
    "clients.title": "Clients",
    "clients.company_name": "Company",
    "clients.full_name": "Contact person",
    "clients.phone1": "Phone 1",
    "clients.phone2": "Phone 2",
    "clients.city_id": "City",
    "clients.source_id": "Source",
    "clients.sphere": "Sphere",
    "clients.comment": "Comment",

    // Course Catalog
    "course_catalog.title": "Course Catalog",
    "course_catalog.course_name": "Course name",
    "course_catalog.price": "Price",
    "course_catalog.currency": "Currency",
    "course_catalog.active": "Active",

    // Courses
    "courses.title": "Courses",
    "courses.name": "Name (group/cohort)",
    "courses.catalog_id": "Catalog course",
    "courses.start_at": "Start date",
    "courses.end_at": "End date",
    "courses.active": "Active",
    "courses.enrollment_status": "Enrollment status",
    "courses.price": "Price",
    "courses.paid": "Paid",
    "courses.note": "Note",

    // Projects
    "projects.title": "Projects",
    "projects.name": "Project name",
    "projects.client_id": "Client",
    "projects.project_status_id": "Project status",
    "projects.project_type_id": "Project type",
    "projects.owner_user_id": "Owner",
    "projects.start_at": "Start",
    "projects.end_at": "End",
    "projects.comment": "Comment",

    // Tasks
    "tasks.title": "Tasks",
    "tasks.title_field": "Task",
    "tasks.description": "Description",
    "tasks.project_id": "Project",
    "tasks.status_id": "Task status",
    "tasks.assignee_user_id": "Assignee",
    "tasks.due_at": "Due date",
    "tasks.priority": "Priority",
    "tasks.comment": "Comment",

    // Kanban
    "kanban.title": "Kanban",
    "kanban.count": "Count",
    "kanban.empty": "Empty",
    "kanban.drag_hint": "Drag the card",

    // Dict titles
    "dict.cities": "Cities",
    "dict.sources": "Sources",
    "dict.spheres": "Spheres",
    "dict.task_statuses": "Task statuses",
    "dict.project_statuses": "Project statuses",
    "dict.lead_statuses": "Lead statuses",
    "dict.project_types": "Project types"
  }
};

// ====== HELPERS ======
function isSupportedLang(lang) {
  return LANG_ORDER.includes(lang);
}

function getStoredLang() {
  try {
    const v = localStorage.getItem(LS_KEY);
    return isSupportedLang(v) ? v : null;
  } catch {
    return null;
  }
}

function storeLang(lang) {
  try {
    localStorage.setItem(LS_KEY, lang);
  } catch {}
}

function format(str, vars) {
  if (!vars) return str;
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

// ====== i18n API ======
let _lang = getStoredLang() || "ru";

function t(key, vars) {
  const table = dict[_lang] || {};
  const raw = table[key] ?? dict["ru"]?.[key] ?? key;
  return format(raw, vars);
}

/**
 * Apply translations inside root:
 * - data-i18n="key" -> textContent
 * - data-i18n-html="key" -> innerHTML (use carefully)
 * - data-i18n-placeholder="key" -> placeholder
 * - data-i18n-title="key" -> title attribute
 * - data-i18n-value="key" -> value (for buttons/inputs)
 */
function apply(root = document) {
  const scope = root || document;

  scope.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key);
  });

  scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (!key) return;
    el.innerHTML = t(key);
  });

  scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    el.setAttribute("placeholder", t(key));
  });

  scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (!key) return;
    el.setAttribute("title", t(key));
  });

  scope.querySelectorAll("[data-i18n-value]").forEach((el) => {
    const key = el.getAttribute("data-i18n-value");
    if (!key) return;
    el.value = t(key);
  });
}

function setLang(lang) {
  if (!isSupportedLang(lang)) lang = "ru";
  _lang = lang;
  storeLang(lang);

  if (!window.APP) window.APP = {};
  window.APP.lang = lang;

  apply(document);
}

function syncFromUser(user) {
  const u = user || window.APP?.user;
  const uLang = (u?.lang || "").toLowerCase();
  if (isSupportedLang(uLang) && uLang !== _lang) {
    setLang(uLang);
    return;
  }
  if (!window.APP) window.APP = {};
  window.APP.lang = _lang;
}

export const i18n = {
  LANG_ORDER,
  get lang() {
    return _lang;
  },
  t,
  apply,
  setLang,
  syncFromUser
};
