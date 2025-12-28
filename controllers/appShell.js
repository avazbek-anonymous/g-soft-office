import { i18n } from "./i18n.js";
import { router } from "./router.js";
import { api } from "./api.js";
import { hasPerm } from "./rbac.js";

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getRoleKey(user) {
  const v =
    user?.role_key ??
    user?.roleKey ??
    user?.role?.key ??
    user?.role?.role_key ??
    user?.role?.name ??
    user?.role ??
    (user?.role_id === 1 ? "admin" : "") ??
    (user?.is_admin ? "admin" : "");

  return (v ?? "").toString();
}

function roleLabel(roleKey) {
  const rk = (roleKey || "").toLowerCase();
  if (rk === "admin") return i18n.t("header.role.admin");
  if (rk === "pm") return i18n.t("header.role.pm");
  if (rk === "fin") return i18n.t("header.role.fin");
  return roleKey || "";
}

/** Menu visibility: module.index permission */
function canSeeNav(item) {
  const user = window.APP?.user || null;
  const rk = getRoleKey(user).toLowerCase();

  // fallback if perms not loaded but admin
  if (rk === "admin" && (window.APP?.perms || []).length === 0) return true;

  const module = item.path.replace("/", "");
  if (module === "main") return hasPerm("main.index");
  return hasPerm(`${module}.index`);
}

/** ✅ Use your /icons/*.svg */
function iconSpan(file, extraClass = "ico navIcon") {
  return `<span class="${extraClass}" style="--ico-url:url('./icons/${file}')"></span>`;
}

function navConfig() {
  return [
    { path: "/main", key: "nav.main", iconFile: "asosiy.svg" },
    { path: "/tasks", key: "nav.tasks", iconFile: "tasks.svg" },
    { path: "/projects", key: "nav.projects", iconFile: "projects.svg" },
    { path: "/courses", key: "nav.courses", iconFile: "cources.svg" }, // именно так у тебя называется файл
    { path: "/course_catalog", key: "nav.course_catalog", iconFile: "catalog.svg" },
    { path: "/clients", key: "nav.clients", iconFile: "clients.svg" },
    { path: "/settings", key: "nav.settings", iconFile: "settings.svg" },
    { path: "/users", key: "nav.users", iconFile: "users.svg" },
    { path: "/roles", key: "nav.roles", iconFile: "roles.svg" },
  ];
}

function renderLangSeg(active) {
  const items = i18n.LANG_ORDER.map((l) => {
    const cls = l === active ? "active" : "";
    return `<button type="button" class="${cls}" data-lang="${l}">${l}</button>`;
  }).join("");
  return `<div class="seg" data-lang-seg>${items}</div>`;
}

function ensure() {
  const root = document.getElementById("app");
  const user = window.APP?.user || null;

  if (root.querySelector(".shell")) {
    window.APP.outlet = document.getElementById("routeOutlet");
    refreshText();
    markActiveNav();
    return;
  }

  const rk = getRoleKey(user);
  const uName = user?.full_name || user?.name || user?.login || `#${user?.id ?? ""}`;

  const navItems = navConfig()
    .filter((it) => canSeeNav(it))
    .map((it) => {
      return `
        <a class="navItem" href="#${it.path}" data-nav="${it.path}">
          ${iconSpan(it.iconFile)}
          <span class="navLabel" data-i18n="${it.key}"></span>
        </a>
      `;
    })
    .join("");

  root.innerHTML = `
    <div class="shell">
      <aside class="sidebar card">
        <div class="brand">
          <div class="brandMark">G</div>
          <div class="col" style="gap:2px;min-width:0">
            <div class="brandName" data-i18n="app.name"></div>
            <div class="brandSub muted">JARVIS UI</div>
          </div>
        </div>

        <nav class="nav" id="sidebarNav">
          ${navItems}
        </nav>

        <div style="margin-top:auto; padding-top:10px; border-top:1px solid var(--stroke2)">
          <button class="btn ghost" id="btnLogout" data-i18n="auth.logout"></button>
        </div>
      </aside>

      <header class="header card">
        <div class="headerTitle">
          <div class="t1" id="hdrTitle">${i18n.t("app.name")}</div>
          <div class="t2" id="hdrSubtitle">${api.API_BASE}</div>
        </div>

        <div class="headerRight">
          ${renderLangSeg(window.APP?.lang || "ru")}

          <div class="userChip">
            <div class="col" style="gap:1px;min-width:0">
              <div class="name" id="hdrUserName">${escapeHtml(uName)}</div>
              <div class="role" id="hdrUserRole">${escapeHtml(roleLabel(rk))}</div>
            </div>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="mainInner">
          <div id="routeOutlet"></div>
        </div>
      </main>
    </div>
  `;

  window.APP.outlet = document.getElementById("routeOutlet");
  i18n.apply(root);

  // Language switch
  const seg = root.querySelector("[data-lang-seg]");
  seg?.addEventListener("click", (e) => {
    const btn = e.target?.closest("button[data-lang]");
    if (!btn) return;
    const lang = btn.getAttribute("data-lang");
    i18n.setLang(lang);

    seg.querySelectorAll("button[data-lang]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lang") === i18n.lang);
    });
  });

  // Logout
  root.querySelector("#btnLogout")?.addEventListener("click", async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (_) {}
    window.APP.user = null;
    window.APP.perms = [];
    router.go("#/login");
  });

  markActiveNav();
}

function refreshText() {
  const root = document.getElementById("app");
  if (!root) return;
  i18n.apply(root);
  markActiveNav();
}

function markActiveNav() {
  const root = document.getElementById("app");
  const nav = root?.querySelector("#sidebarNav");
  if (!nav) return;

  const hash = window.location.hash || "";
  const fullPath = hash.startsWith("#/") ? hash.slice(1).split("?")[0] : "/main";

  const seg = fullPath.split("/").filter(Boolean);
  const basePath = seg.length ? `/${seg[0]}` : "/main";

  nav.querySelectorAll(".navItem").forEach((a) => {
    const p = a.getAttribute("data-nav");
    a.classList.toggle("active", p === basePath);
  });

  const titleKey = guessTitleKeyByPath(basePath);
  const hdrTitle = root.querySelector("#hdrTitle");
  if (hdrTitle) hdrTitle.textContent = titleKey ? i18n.t(titleKey) : i18n.t("app.name");
}

function guessTitleKeyByPath(path) {
  const map = {
    "/main": "nav.main",
    "/tasks": "nav.tasks",
    "/projects": "nav.projects",
    "/courses": "nav.courses",
    "/course_catalog": "nav.course_catalog",
    "/clients": "nav.clients",
    "/settings": "nav.settings",
    "/users": "nav.users",
    "/roles": "nav.roles",
  };
  return map[path] || null;
}

export const appShell = { ensure, refreshText, markActiveNav };
