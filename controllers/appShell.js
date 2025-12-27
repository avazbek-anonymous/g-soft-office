import { i18n } from "./i18n.js";
import { router } from "./router.js";
import { api } from "./api.js";

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** ✅ Robust role resolver (fix "admin not detected") */
function getRoleKey(user) {
  const v =
    user?.role_key ??
    user?.roleKey ??
    user?.role?.key ??
    user?.role?.role_key ??
    user?.role?.name ??
    user?.role ??
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

function canSeeNav(item, user) {
  const rk = getRoleKey(user).toLowerCase();
  if (rk === "admin") return true;

  // TZ: pm/fin — скрыть users/roles/settings если не разрешены
  if (["/users", "/roles", "/settings"].includes(item.path)) return false;

  return true;
}

function iconSvg(name) {
  // Inline icons with currentColor (no colors in JS)
  const common = `fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  switch (name) {
    case "home":
      return `<svg class="navIcon" viewBox="0 0 24 24" ${common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>`;
    case "kanban":
      return `<svg class="navIcon" viewBox="0 0 24 24" ${common}><path d="M4 4h7v16H4z"/><path d="M13 4h7v10h-7z"/></svg>`;
    case "folder":
      return `<svg class="navIcon" viewBox="0 0 24 24" ${common}><path d="M3 6h7l2 2h9v12H3z"/></svg>`;
    case "cap":
      return `<svg class="navIcon" viewBox="0 0 24 24" ${common}><path d="M2 8l10-4 10 4-10 4z"/><path d="M6 10v6c0 2 12 2 12 0v-6"/></svg>`;
    case "book":
      return `<svg class="navIcon" viewBox="0 0 24 24" ${common}><path d="M4 5h10a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3V5z"/><path d="M17 21V8"/></svg>`;
    case "users":
      return `<svg class="navIcon" viewBox="0 0 24 24" ${common}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="3"/><path d="M22 21v-2a3 3 0 0 0-2.5-3"/><path d="M17.5 3.5a3 3 0 0 1 0 6"/></svg>`;
    case "settings":
      return `<svg class="navIcon" viewBox="0 0 24 24" ${common}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.2-2-3.4-2.3.6a7.6 7.6 0 0 0-1.7-1L15 6h-6l-.5 2a7.6 7.6 0 0 0-1.7 1L4 8.4 2 11.8 4 13a7.9 7.9 0 0 0 .1 1L2 15.2 4 18.6l2.3-.6a7.6 7.6 0 0 0 1.7 1L9 22h6l.5-2a7.6 7.6 0 0 0 1.7-1l2.3.6 2-3.4z"/></svg>`;
    default:
      return `<svg class="navIcon" viewBox="0 0 24 24" ${common}><path d="M4 12h16"/><path d="M12 4v16"/></svg>`;
  }
}

function navConfig() {
  return [
    { path: "/main", key: "nav.main", icon: "home" },
    { path: "/tasks", key: "nav.tasks", icon: "kanban" },
    { path: "/projects", key: "nav.projects", icon: "folder" },
    { path: "/courses", key: "nav.courses", icon: "cap" },
    { path: "/course_catalog", key: "nav.course_catalog", icon: "book" },
    { path: "/clients", key: "nav.clients", icon: "folder" },
    { path: "/settings", key: "nav.settings", icon: "settings" },
    { path: "/users", key: "nav.users", icon: "users" },
    { path: "/roles", key: "nav.roles", icon: "users" },
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

  // already rendered?
  if (root.querySelector(".shell")) {
    window.APP.outlet = document.getElementById("routeOutlet");
    refreshText();
    markActiveNav();
    return;
  }

  const rk = getRoleKey(user);
  const uName = user?.full_name || user?.name || user?.login || `#${user?.id ?? ""}`;

  const navItems = navConfig()
    .filter((it) => canSeeNav(it, user))
    .map((it) => {
      return `
        <a class="navItem" href="#${it.path}" data-nav="${it.path}">
          ${iconSvg(it.icon)}
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
            <div class="brandSub muted">Moliya Agentligi</div>
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
          <div class="t2" id="hdrSubtitle">Avazbek tizim ustida ishalayapti hali</div>
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
    } catch (_) {
      // ignore
    }
    window.APP.user = null;
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

/** ✅ Active menu + header title based on BASE PATH
 *  Example: "#/tasks/view?id=1" -> basePath "/tasks"
 */
function markActiveNav() {
  const root = document.getElementById("app");
  const nav = root?.querySelector("#sidebarNav");
  if (!nav) return;

  const hash = window.location.hash || "";
  const fullPath = hash.startsWith("#/") ? hash.slice(1).split("?")[0] : "/main";

  // basePath = "/tasks" for "/tasks/view"
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
