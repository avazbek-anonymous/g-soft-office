export const API_BASE = "https://api.ofis.gekto.uz";
export const DEFAULT_ROUTE = "#/main"; // первая страница после логина

export const LANG_ORDER = ["ru", "uz", "en"];

export const MODULES = ["main","tasks","projects","courses","clients","settings","users"];
function icon(name){
  return `<img class="nav-ico" src="/assets/icons/${name}.svg" alt="" />`;
}

export const ROUTES = [
  { key:"main",     hash:"#/main",     icon:"asosiy", requiresAuth:true },
  { key:"tasks",    hash:"#/tasks",    icon:"tasks", requiresAuth:true },
  { key:"projects", hash:"#/projects", icon:"projects", requiresAuth:true },
  { key:"courses",  hash:"#/courses",  icon:"courses", requiresAuth:true },
  { key:"clients",  hash:"#/clients",  icon:"clients", requiresAuth:true },
  { key:"settings", hash:"#/settings", icon:"settings", requiresAuth:true },
  { key:"users",    hash:"#/users",    icon:"users", requiresAuth:true, adminOnly:true },
  { key:"login",    hash:"#/login",    icon:"",  requiresAuth:false },
];
