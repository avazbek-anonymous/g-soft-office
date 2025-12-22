import { state } from "./state.js";

export const T = {
  ru: {
    // nav
    main: "Главная",
    tasks: "Задачи",
    projects: "Проекты",
    courses: "Курсы",
    clients: "Клиенты",
    settings: "Настройки",
    users: "Пользователи",

    // common
    welcome: "Добро пожаловать",
    logout: "Выйти",
    loadingTitle: "Загрузка…",
    loadingText: "Идёт запрос. Пожалуйста, подождите.",
    savingTitle: "Сохранение…",
    savingText: "Секунду…",
    saved: "Сохранено",
    error: "Ошибка",
    accessDenied: "Доступ запрещён",
    notFound: "Страница не найдена",
    reload: "Обновить",
    add: "Добавить",
    save: "Сохранить",
    cancel: "Отмена",
    close: "Закрыть",
    search: "Поиск",

    // login
    loginTitle: "Вход в систему",
    login: "Логин",
    password: "Пароль",
    signIn: "Войти",

    // settings
    dictionaries: "Справочники",
    uiSettings: "Интерфейс",
    cities: "Города",
    sources: "Источники",
    services: "Услуги",
    open: "Открыть",
    newItem: "Новый элемент",
    name: "Название",

    // users
    adminOnly: "Только для администратора",
    role: "Роль",
    actions: "Действия",
    edit: "Редактировать",
    delete: "Удалить",
    resetPass: "Сбросить пароль",
    addUser: "Добавить пользователя",

    // pages notes (можешь потом убрать)
    soon: "Скоро будет готово",
  },

  uz: {
    main: "Asosiy",
    tasks: "Vazifalar",
    projects: "Loyihalar",
    courses: "Kurslar",
    clients: "Mijozlar",
    settings: "Sozlamalar",
    users: "Foydalanuvchilar",

    welcome: "Xush kelibsiz",
    logout: "Chiqish",
    loadingTitle: "Yuklanmoqda…",
    loadingText: "So‘rov bajarilmoqda. Iltimos kuting.",
    savingTitle: "Saqlanmoqda…",
    savingText: "Bir zum…",
    saved: "Saqlandi",
    error: "Xatolik",
    accessDenied: "Kirish taqiqlangan",
    notFound: "Sahifa topilmadi",
    reload: "Yangilash",
    add: "Qo‘shish",
    save: "Saqlash",
    cancel: "Bekor qilish",
    close: "Yopish",
    search: "Qidirish",

    loginTitle: "Tizimga kirish",
    login: "Login",
    password: "Parol",
    signIn: "Kirish",

    dictionaries: "Spravochniklar",
    uiSettings: "Interfeys",
    cities: "Shaharlar",
    sources: "Manbalar",
    services: "Xizmatlar",
    open: "Ochish",
    newItem: "Yangi element",
    name: "Nomi",

    adminOnly: "Faqat admin",
    role: "Rol",
    actions: "Amallar",
    edit: "Tahrirlash",
    delete: "O‘chirish",
    resetPass: "Parolni tiklash",
    addUser: "Foydalanuvchi qo‘shish",

    soon: "Tez orada tayyor bo‘ladi",
  },

  en: {
    main: "Home",
    tasks: "Tasks",
    projects: "Projects",
    courses: "Courses",
    clients: "Clients",
    settings: "Settings",
    users: "Users",

    welcome: "Welcome",
    logout: "Logout",
    loadingTitle: "Loading…",
    loadingText: "Request in progress. Please wait.",
    savingTitle: "Saving…",
    savingText: "One moment…",
    saved: "Saved",
    error: "Error",
    accessDenied: "Access denied",
    notFound: "Page not found",
    reload: "Reload",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    search: "Search",

    loginTitle: "Sign in",
    login: "Login",
    password: "Password",
    signIn: "Sign in",

    dictionaries: "Dictionaries",
    uiSettings: "UI",
    cities: "Cities",
    sources: "Sources",
    services: "Services",
    open: "Open",
    newItem: "New item",
    name: "Name",

    adminOnly: "Admin only",
    role: "Role",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    resetPass: "Reset password",
    addUser: "Add user",

    soon: "Coming soon",
  }
};

export function t(key) {
  const lang = state.ui.lang || "ru";
  return (T[lang] && T[lang][key]) || (T.ru[key]) || key;
}

export function setLang(lang) {
  state.ui.lang = lang;
}

export function cycleLang(order) {
  const list = order || ["ru","uz","en"];
  const i = list.indexOf(state.ui.lang);
  state.ui.lang = list[(i + 1) % list.length];
  return state.ui.lang;
}
