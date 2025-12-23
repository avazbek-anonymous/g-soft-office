import { ROUTES, DEFAULT_ROUTE } from "../config.js";
import { state } from "./state.js";
import { t } from "./i18n.js";



const $ = (sel, el=document) => el.querySelector(sel);

export function getRouteKey() {
  const hash = location.hash || DEFAULT_ROUTE;
  const r = ROUTES.find(x => x.hash === hash);
  return r ? r.key : "main";
}

export function getRouteByHash() {
  const hash = location.hash || DEFAULT_ROUTE;
  return ROUTES.find(x => x.hash === hash) || null;
}

export function canSeeModule(moduleKey) {
  const vis = state.user?.visibility || null;
  if (!vis) return true; // если backend ещё не отдаёт visibility — ничего не ломаем
  if (typeof vis[moduleKey] === "boolean") return vis[moduleKey];
  return true;
}

export function buildNav(container) {
  if (!container) return;
  container.innerHTML = "";

  const current = location.hash || DEFAULT_ROUTE;

  for (const r of ROUTES) {
    if (r.key === "login") continue;
    if (r.adminOnly && state.user?.role !== "admin") continue;
    if (!canSeeModule(r.key)) continue;

    const a = document.createElement("a");
    a.href = r.hash;
    a.className = "nav-item" + (current === r.hash ? " active" : "");
    a.innerHTML = `<span class="ic">${r.icon || ""}</span><span>${t(r.key)}</span>`;
    container.appendChild(a);
  }
}

export function setPageTitle() {
  const r = getRouteByHash();
  const titleEl = $("#pageTitle");
  const subEl = $("#pageSub");
  if (!titleEl || !subEl) return;

  if (!r || r.key === "login") {
    titleEl.textContent = "G-SOFT";
    subEl.textContent = t("welcome");
    return;
  }
  titleEl.textContent = t(r.key);
  subEl.textContent = t("welcome");
}
