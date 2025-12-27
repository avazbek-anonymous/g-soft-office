const LANG_ORDER = ["ru", "uz", "en"];
const LS_KEY = "gsoft_lang";

const dict = {
  ru: {
    "app.name": "G-SOFT",
    "nav.main": "Главная",
    "nav.tasks": "Задачи",
    "nav.projects": "Проекты",
    "nav.courses": "Курсы",
    "nav.course_catalog": "Каталог курсов",
    "nav.clients": "Клиенты",
    "nav.settings": "Настройки",
    "nav.users": "Пользователи",
    "nav.roles": "Роли",

    "auth.login.title": "Вход",
    "auth.login.login": "Логин",
    "auth.login.password": "Пароль",
    "auth.login.submit": "Войти",
    "auth.login.error": "Неверный логин или пароль",
    "auth.logout": "Выйти",

    "header.role.admin": "Админ",
    "header.role.pm": "PM",
    "header.role.fin": "Финансы",

    "main.welcome": "Добро пожаловать в панель управления",
    "common.comingSoon": "Скоро будет",
  },
  uz: {
    "app.name": "G-SOFT",
    "nav.main": "Asosiy",
    "nav.tasks": "Vazifalar",
    "nav.projects": "Loyihalar",
    "nav.courses": "Kurslar",
    "nav.course_catalog": "Kurslar katalogi",
    "nav.clients": "Mijozlar",
    "nav.settings": "Sozlamalar",
    "nav.users": "Foydalanuvchilar",
    "nav.roles": "Rollar",

    "auth.login.title": "Kirish",
    "auth.login.login": "Login",
    "auth.login.password": "Parol",
    "auth.login.submit": "Kirish",
    "auth.login.error": "Login yoki parol noto‘g‘ri",
    "auth.logout": "Chiqish",

    "header.role.admin": "Admin",
    "header.role.pm": "PM",
    "header.role.fin": "Moliya",

    "main.welcome": "Boshqaruv paneliga xush kelibsiz",
    "common.comingSoon": "Tez kunda",
  },
  en: {
    "app.name": "G-SOFT",
    "nav.main": "Home",
    "nav.tasks": "Tasks",
    "nav.projects": "Projects",
    "nav.courses": "Courses",
    "nav.course_catalog": "Course Catalog",
    "nav.clients": "Clients",
    "nav.settings": "Settings",
    "nav.users": "Users",
    "nav.roles": "Roles",

    "auth.login.title": "Sign in",
    "auth.login.login": "Login",
    "auth.login.password": "Password",
    "auth.login.submit": "Sign in",
    "auth.login.error": "Invalid login or password",
    "auth.logout": "Logout",

    "header.role.admin": "Admin",
    "header.role.pm": "PM",
    "header.role.fin": "Finance",

    "main.welcome": "Welcome to the dashboard",
    "common.comingSoon": "Coming soon",
  },
};

function normalizeLang(l) {
  if (!l) return null;
  const x = String(l).toLowerCase();
  if (LANG_ORDER.includes(x)) return x;
  return null;
}

let current = "ru";
const listeners = [];

function t(key) {
  return (dict[current] && dict[current][key]) || (dict.ru && dict.ru[key]) || key;
}

function apply(root = document) {
  // text
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    el.textContent = t(k);
  });

  // placeholder
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const k = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(k));
  });

  // title
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const k = el.getAttribute("data-i18n-title");
    el.setAttribute("title", t(k));
  });
}

function setLang(lang) {
  const nl = normalizeLang(lang) || "ru";
  if (nl === current) return;

  current = nl;
  window.APP = window.APP || {};
  window.APP.lang = current;

  localStorage.setItem(LS_KEY, current);
  listeners.forEach((fn) => fn(current));
}

function init() {
  const saved = normalizeLang(localStorage.getItem(LS_KEY));
  current = saved || "ru";
  window.APP = window.APP || {};
  window.APP.lang = current;
}

function syncFromUser(user) {
  // rule: localStorage wins if already set; otherwise use user.lang
  const saved = normalizeLang(localStorage.getItem(LS_KEY));
  const uLang = normalizeLang(user?.lang);

  if (!saved && uLang) {
    setLang(uLang);
    return;
  }

  // keep saved if exists; still set current accordingly
  if (saved) current = saved;
  window.APP.lang = current;
}

function onChange(fn) {
  listeners.push(fn);
}

export const i18n = { LANG_ORDER, t, apply, setLang, init, syncFromUser, onChange, get lang() { return current; } };
