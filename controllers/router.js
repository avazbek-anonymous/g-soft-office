// controllers/router.js
import { i18n } from "./i18n.js";

const routes = new Map();
let started = false;
let currentRoute = null;
let onNeedShell = null;

// events: beforeRender, afterRender, error
const listeners = {
  beforeRender: [],
  afterRender: [],
  error: [],
};

function emit(type, payload) {
  (listeners[type] || []).forEach((fn) => {
    try { fn(payload); } catch (_) {}
  });
}

function on(type, fn) {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(fn);
  return () => {
    const arr = listeners[type];
    const idx = arr.indexOf(fn);
    if (idx >= 0) arr.splice(idx, 1);
  };
}

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

function hasPerm(permKey) {
  if (!permKey) return true;
  const perms = window.APP?.perms || [];
  if (!Array.isArray(perms)) return false;
  if (perms.includes("*")) return true;
  return perms.includes(permKey);
}

async function fetchViewHtml(viewUrl) {
  // html файлы твоего фронта. Без кэша, чтобы сразу видеть обновления.
  const res = await fetch(viewUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`View load failed: ${res.status} ${viewUrl}`);
  return await res.text();
}

function getOutlet(def) {
  // outlet задаётся appShell-ом (pageHost), иначе рендерим в #app
  return window.APP.outlet || document.getElementById("app");
}

function clearShellIfNeeded(def) {
  if (!def.shell) {
    const root = document.getElementById("app");
    if (root) root.innerHTML = "";
    window.APP.outlet = null;
  } else {
    onNeedShell && onNeedShell();
  }
}

function renderError(outlet, msg) {
  const safe = String(msg || "Error");
  outlet.innerHTML = `<div class="card" style="padding:14px;border:1px solid var(--border);background:var(--panel)">${safe}</div>`;
  i18n.apply(outlet);
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

  // RBAC guard (UI)
  if (def.requiresAuth && def.permKey && !hasPerm(def.permKey)) {
    // если нет прав — кидаем на main
    go("#/main");
    return;
  }

  // shell/no-shell
  clearShellIfNeeded(def);

  const outlet = getOutlet(def);
  if (!outlet) return;

  setDocumentTitle(def.titleKey);

  const ctx = {
    path,
    query,
    user: window.APP?.user || null,
    perms: window.APP?.perms || [],
    lang: window.APP?.lang || "ru",
    titleKey: def.titleKey,
    outlet,
    route: def,
  };

  emit("beforeRender", { def, ctx });

  try {
    // handler must return "page" object: {load, calc, render, mount}
    // или можно вернуть сразу module с этими функциями (export {load,calc,render,mount})
    const page = def.handler ? await def.handler(ctx) : null;
    if (!page) {
      outlet.innerHTML = `<div class="card" style="padding:14px">No page</div>`;
      i18n.apply(outlet);
      currentRoute = { def, ctx };
      emit("afterRender", { def, ctx });
      return;
    }

    // 1) если указан viewUrl — сначала загружаем HTML в outlet
    if (def.viewUrl) {
      const htmlView = await fetchViewHtml(def.viewUrl);
      outlet.innerHTML = htmlView;
      i18n.apply(outlet);
    }

    // 2) load/calc
    const data = page.load ? await page.load(ctx) : null;
    const vm = page.calc ? page.calc(ctx, data) : data;

    // 3) render:
    // - если render вернул строку с HTML (не пустую) — заменим outlet
    // - если render ничего не вернул / вернул "" — считаем что он обновил DOM поверх viewUrl
    let html = "";
    if (page.render) html = page.render(ctx, vm);

    if (typeof html === "string" && html.trim()) {
      outlet.innerHTML = html;
      i18n.apply(outlet);
    } else {
      // если def.viewUrl не было — и render пустой, то покажем "No content"
      if (!def.viewUrl) {
        outlet.innerHTML = `<div class="card" style="padding:14px">No content</div>`;
        i18n.apply(outlet);
      }
    }

    // 4) mount listeners
    if (page.mount) page.mount(ctx, vm);

    currentRoute = { def, ctx };
    emit("afterRender", { def, ctx });
  } catch (e) {
    emit("error", { def, ctx, error: e });
    renderError(outlet, e?.message || "Render error");
    currentRoute = { def, ctx };
  }
}

function start(opts = {}) {
  if (started) return;
  started = true;
  onNeedShell = opts.onNeedShell || null;

  window.addEventListener("hashchange", () => render());

  // если ты меняешь язык и кидаешь событие — обновляем текущую страницу
  window.addEventListener("gsoft:lang", () => refresh());

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

export const router = { start, register, go, refresh, on };
