import { i18n } from "./i18n.js";

const routes = new Map();
let started = false;
let currentRoute = null;
let onNeedShell = null;

function parseHash() {
  const h = window.location.hash || "";
  if (!h.startsWith("#/")) return { path: "/main" };
  const raw = h.slice(1); // "/main"
  const [path] = raw.split("?");
  return { path: path || "/main" };
}

function setDocumentTitle(titleKey) {
  const appName = i18n.t("app.name");
  const page = titleKey ? i18n.t(titleKey) : "";
  document.title = page ? `${appName} — ${page}` : appName;
}

async function loadController(def) {
  const mod = await def.controllerPath();
  // convention: module exports "controller"
  return mod.controller;
}

async function render() {
  const { path } = parseHash();
  const def = routes.get(path) || routes.get("/main");

  if (!def) return;

  // auth guard
  const user = window.APP?.user || null;
  if (def.requiresAuth && !user) {
    go("#/login");
    return;
  }

  // shell switch
  if (def.shell) {
    onNeedShell && onNeedShell();
  } else {
    // if route is no-shell → wipe app container (login page)
    const root = document.getElementById("app");
    root.innerHTML = "";
    window.APP.outlet = null;
  }

  setDocumentTitle(def.titleKey);

  const ctx = {
    path,
    user: window.APP?.user || null,
    lang: window.APP?.lang || "ru",
    titleKey: def.titleKey,
    outlet: window.APP.outlet || document.getElementById("app"),
  };

  const controller = await loadController(def);

  const data = controller.load ? await controller.load(ctx) : null;
  const vm = controller.calc ? controller.calc(ctx, data) : data;
  const html = controller.render ? controller.render(ctx, vm) : "";

  ctx.outlet.innerHTML = html;
  i18n.apply(ctx.outlet);

  if (controller.mount) controller.mount(ctx, vm);

  currentRoute = { def, ctx };
}

function start(opts = {}) {
  if (started) return;
  started = true;
  onNeedShell = opts.onNeedShell || null;

  window.addEventListener("hashchange", () => render());
  // initial route
  if (!window.location.hash) {
    window.location.hash = opts.defaultRoute || "#/main";
    return;
  }
  render();
}

function register(list) {
  list.forEach((r) => routes.set(r.path, r));
}

function go(hash) {
  if (!hash.startsWith("#/")) {
    window.location.hash = `#${hash.startsWith("/") ? hash : `/${hash}`}`;
    return;
  }
  window.location.hash = hash;
}

function refresh() {
  if (!started) return;
  render();
}

/** Helper: Stage 1 placeholders */
function placeholders(items) {
  return items.map((it) => ({
    path: it.path,
    requiresAuth: true,
    shell: true,
    titleKey: it.titleKey,
    controllerPath: () => import("./_shared/placeholder.js"),
    _placeholderTitleKey: it.titleKey,
  }));
}

export const router = { start, register, go, refresh, placeholders };
