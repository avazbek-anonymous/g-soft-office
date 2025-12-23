import { state, setUser } from "./core/state.js";
import { apiFetch } from "./core/api.js";
import { t } from "./core/i18n.js";
import { applyTheme } from "./ui/theme.js";
import { initDrawer, closeDrawer } from "./ui/drawer.js";
import { buildNav, getRouteByHash, setPageTitle, canSeeModule } from "./core/router.js";

import { renderLogin } from "./views/login.js";
import { renderShell } from "./views/shell.js";
import { renderMain } from "./views/main.js";
import { renderTasks } from "./views/tasks.js";
import { renderProjects } from "./views/projects.js";
import { renderCourses } from "./views/courses.js";
import { renderClients } from "./views/clients.js";
import { renderSettings } from "./views/settings.js";
import { renderUsers } from "./views/users.js";
import { renderClientView } from "./views/client_view.js";


const $ = (sel, el=document) => el.querySelector(sel);

initDrawer();

window.addEventListener("hashchange", () => {
  render().finally(() => closeDrawer());
});

boot();

async function boot() {
  // prelogin ui (lang/theme)
  try {
    const pre = JSON.parse(localStorage.getItem("ui_prelogin") || "null");
    if (pre?.lang) state.ui.lang = pre.lang;
    if (pre?.theme) state.ui.theme = pre.theme;
  } catch {}

  applyTheme(state.ui.theme);

  try {
    const me = await apiFetch("/auth/me", { loadingTitle:"Auth", loadingText:"Checking session..." });
    setUser(me.user);

    await loadUiSettings();
    applyTheme(state.ui.theme);

    await preloadCache(false);

    if (!location.hash || location.hash === "#/login") location.hash = "#/tasks";
    await render();
  } catch {
    setUser(null);
    if (!location.hash) location.hash = "#/login";
    await render();
  }
}

async function loadUiSettings() {
  // merge global + user (user overrides)
  let global = null, user = null;

  try {
    if (state.user?.role === "admin") {
      const g = await apiFetch("/ui/global", { loadingTitle:"UI", loadingText:"Global settings..." });
      global = g.settings;
    }
  } catch {}

  try {
    const u = await apiFetch("/ui/me", { loadingTitle:"UI", loadingText:"User settings..." });
    user = u.settings;
  } catch {}

  const base = Object.assign({}, state.ui, global || {});
  state.ui = Object.assign(base, user || {});
}

async function preloadCache(force=false) {
  if (state.cacheReady && !force) return;

  const [cities, sources, services, spheres] = await Promise.all([
    apiFetch("/dict/cities",   { silent:true }).catch(() => ({ items: [] })),
    apiFetch("/dict/sources",  { silent:true }).catch(() => ({ items: [] })),
    apiFetch("/dict/services", { silent:true }).catch(() => ({ items: [] })),
    apiFetch("/dict/spheres",  { silent:true }).catch(() => ({ items: [] })),
  ]);

  state.dict.cities = cities.items || [];
  state.dict.sources = sources.items || [];
  state.dict.services = services.items || [];
  state.dict.spheres = spheres.items || [];
}

async function render() {
  let route = getRouteByHash();

  // detail route: #/clients/123
  const mClient = (location.hash || "").match(/^#\/clients\/(\d+)/);
  if (mClient) {
    const clientId = Number(mClient[1]);
    if (route && route.key === "clients") route = { ...route, clientId };
    else route = { key: "clients", clientId }; // fallback, если getRouteByHash не понял
  }


  if (!state.user || !route || route.key === "login") {
    renderLogin(async () => {
      await loadUiSettings();
      applyTheme(state.ui.theme);
      await preloadCache(false);
      render(); // после логина
    });
    return;
  }

  // guards (admin + visibility)
  if (route.adminOnly && state.user.role !== "admin") {
    renderShell();
    setPageTitle();
    $("#view").innerHTML = `<div class="card"><div class="hd"><b>${t("accessDenied")}</b></div></div>`;
    return;
  }
  if (!canSeeModule(route.key)) {
    renderShell();
    setPageTitle();
    $("#view").innerHTML = `<div class="card"><div class="hd"><b>${t("accessDenied")}</b></div></div>`;
    return;
  }

  renderShell();
  setPageTitle();
  buildNav($("#nav"));
  buildNav($("#navDrawer"));

  const view = $("#view");

  switch (route.key) {
    case "main":     return renderMain(view);
    case "tasks":    return renderTasks(view);
    case "projects": return renderProjects(view);
    case "courses":  return renderCourses(view);
    case "settings": return renderSettings(view);
    case "users":    return renderUsers(view);
    case "clients": 
    if (route.clientId) 
      return renderClientView(view, { id: route.clientId });
    return renderClients(view);
    default:
      view.innerHTML = `<div class="card"><div class="hd"><b>${t("notFound")}</b></div></div>`;
    }
}
