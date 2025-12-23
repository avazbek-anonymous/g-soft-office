export const API_BASE = "https://api.ofis.gekto.uz";
export const DEFAULT_ROUTE = "#/main"; // первая страница после логина

export const LANG_ORDER = ["ru", "uz", "en"];

export const MODULES = ["main","tasks","projects","courses","clients","settings","users"];

export const ROUTES = [
  { key:"main",     hash:"#/main",     icon:"🏠", requiresAuth:true },
  { key:"tasks",    hash:"#/tasks",    icon:"🧩", requiresAuth:true },
  { key:"projects", hash:"#/projects", icon:"📌", requiresAuth:true },
  { key:"courses",  hash:"#/courses",  icon:"🎓", requiresAuth:true },
  { key:"clients",  hash:"#/clients",  icon:"🗂️", requiresAuth:true },
  { key:"settings", hash:"#/settings", icon:"⚙️", requiresAuth:true },
  { key:"users",    hash:"#/users",    icon:"👥", requiresAuth:true, adminOnly:true },
  { key:"login",    hash:"#/login",    icon:"",  requiresAuth:false },
];
