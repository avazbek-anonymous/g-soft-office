import { i18n } from "./i18n.js";

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

async function render() {
  const { path, query } = parseHash();
  const def = routes.get(path) || routes.get("/main");
  if (!def) return;

  // auth guard (UI)
  const user = window.APP?.user || null;
  if (def.requiresAuth && !user) {
    go("#/login");
    return;
  }

  // shell/no-shell
  if (def.shell) {
    onNeedShell && onNeedShell();
  } else {
    const root = document.getElementById("app");
    root.innerHTML = "";
    window.APP.outlet = null;
  }

  setDocumentTitle(def.titleKey);

  const ctx = {
    path,
    query,
    user: window.APP?.user || null,
    lang: window.APP?.lang || "ru",
    titleKey: def.titleKey,
    outlet: window.APP.outlet || document.getElementById("app"),
  };

  // handler must return "page" object: {load, calc, render, mount}
  const page = def.handler ? await def.handler(ctx) : null;
  if (!page) {
    ctx.outlet.innerHTML = `<div class="card" style="padding:14px">No page</div>`;
    return;
  }

  const data = page.load ? await page.load(ctx) : null;
  const vm = page.calc ? page.calc(ctx, data) : data;
  const html = page.render ? page.render(ctx, vm) : "";

  ctx.outlet.innerHTML = html;
  i18n.apply(ctx.outlet);

  if (page.mount) page.mount(ctx, vm);

  currentRoute = { def, ctx };
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
