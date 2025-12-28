// controllers/router.js
import { i18n } from "./i18n.js";
import { hasPerm } from "./rbac.js";

const routes = new Map();
let started = false;
let currentRoute = null;
let onNeedShell = null;

function parseHash() {
  const h = window.location.hash || "";
  if (!h.startsWith("#/")) return { path: "/main", query: {} };

  const raw = h.slice(1); // "/tasks/view?id=1"
  const [pathPart, queryPart] = raw.split("?");
  const query = {};
  if (queryPart) {
    const sp = new URLSearchParams(queryPart);
    for (const [k, v] of sp.entries()) query[k] = v;
  }
  return { path: pathPart || "/main", query };
}

function setDocumentTitle(titleKey) {
  const appName = i18n.t("app.name");
  const page = titleKey ? i18n.t(titleKey) : "";
  document.title = page ? `${appName} — ${page}` : appName;
}

function inferPermKeyByPath(path) {
  // path like "/tasks", "/tasks/view", "/settings/edit"
  const seg = (path || "/main").split("/").filter(Boolean); // ["tasks","view"]
  const mod = seg[0] || "main";
  const sub = seg[1] || "index";

  if (mod === "main") return null;     // main всегда можно
  if (mod === "login") return null;

  if (mod === "settings") {
    if (sub === "new" || sub === "edit") return "settings.edit";
    return "settings.view"; // index/view
  }

  const action =
    sub === "view" ? "view" :
    sub === "new"  ? "new"  :
    sub === "edit" ? "edit" :
    "index";

  return `${mod}.${action}`;
}

function hasAccess(def, path) {
  // если permKey задан явно — используем его, иначе вычисляем по path
  const key = def?.permKey || inferPermKeyByPath(path);
  return hasPerm(key);
}

function clearShellIfNeeded(def) {
  if (def.shell) {
    onNeedShell && onNeedShell();
    return;
  }
  const root = document.getElementById("app");
  if (root) root.innerHTML = "";
  window.APP.outlet = null;
}

function renderError(outlet, msg) {
  const safe = String(msg || "Error");
  outlet.innerHTML = `
    <div class="card" style="padding:14px">
      <div class="caps" style="letter-spacing:.10em;font-size:12px">error</div>
      <div style="margin-top:6px">${safe}</div>
    </div>
  `;
  i18n.apply(outlet);
}

async function render() {
  const { path, query } = parseHash();
  const def = routes.get(path) || routes.get("/main");
  if (!def) return;

  // auth guard
  const user = window.APP?.user || null;
  if (def.requiresAuth && !user) {
    go("#/login");
    return;
  }

  // rbac guard
  if (def.requiresAuth && !hasAccess(def, path)) {
    go("#/main");
    return;
  }

  clearShellIfNeeded(def);

  setDocumentTitle(def.titleKey);

  const outlet = window.APP.outlet || document.getElementById("app");
  if (!outlet) return;

  const ctx = {
    path,
    query,
    user: window.APP?.user || null,
    perms: window.APP?.perms || [],
    lang: i18n.lang || "ru",
    titleKey: def.titleKey,
    outlet,
  };

  try {
    const page = def.handler ? await def.handler(ctx) : null;
    if (!page) {
      outlet.innerHTML = `<div class="card" style="padding:14px">No page</div>`;
      i18n.apply(outlet);
      currentRoute = { def, ctx };
      return;
    }

    const data = page.load ? await page.load(ctx) : null;
    const vm = page.calc ? page.calc(ctx, data) : data;

    const html = page.render ? page.render(ctx, vm) : "";
    outlet.innerHTML = html || `<div class="card" style="padding:14px">No content</div>`;
    i18n.apply(outlet);

    if (page.mount) page.mount(ctx, vm);

    currentRoute = { def, ctx };
  } catch (e) {
    renderError(outlet, e?.message || "Render error");
    currentRoute = { def, ctx };
  }
}

function start(opts = {}) {
  if (started) return;
  started = true;
  onNeedShell = opts.onNeedShell || null;

  window.addEventListener("hashchange", () => render());

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

export const router = { start, register, go, refresh };
