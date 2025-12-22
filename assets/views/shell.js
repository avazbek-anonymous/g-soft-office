import { state } from "../core/state.js";
import { t, cycleLang } from "../core/i18n.js";
import { buildNav, setPageTitle } from "../core/router.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";
import { toggleTheme } from "../ui/theme.js";
import { openDrawer, closeDrawer } from "../ui/drawer.js";
import { LANG_ORDER } from "../config.js";

const $ = (sel, el=document) => el.querySelector(sel);

export function renderShell() {
  const root = $("#root");

  root.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="brand" style="padding: 2px 6px 10px 6px;">
          <div class="logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 14c2.5 2.5 7.5 2.5 10 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M4 10c3.8-5.2 12.2-5.2 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 3v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="brand-title">
            <b>G-SOFT | Management</b>
            <span>ofis.gekto.uz</span>
          </div>
        </div>

        <nav id="nav" class="nav"></nav>

        <div class="card" style="margin-top:auto">
          <div class="hd">
            <b>${escapeHtml(state.user?.ism || "")}</b>
            <span>${escapeHtml(state.user?.role || "")}</span>
          </div>
          <div class="bd">
            <div class="row" style="justify-content:space-between">
              <button class="btn danger" id="btnLogout">⎋ ${t("logout")}</button>
              <button class="btn" id="btnLang">🌐 ${String(state.ui.lang).toUpperCase()}</button>
            </div>
          </div>
        </div>
      </aside>

      <header class="topbar">
        <div class="brand">
          <button class="burger" id="burger" aria-label="menu"><span></span></button>
          <div class="brand-title">
            <b id="pageTitle">G-SOFT</b>
            <span id="pageSub">${t("welcome")}</span>
          </div>
        </div>
        <div class="row">
          <button class="btn" id="themeToggle">${state.ui.theme === "dark" ? "☀" : "☾"}</button>
        </div>
      </header>

      <main class="main">
        <div id="view"></div>
      </main>
    </div>
  `;

  // build navs
  buildNav($("#nav"));
  buildNav($("#navDrawer"));
  setPageTitle();

  // burger -> drawer
  $("#burger").onclick = () => openDrawer();

  // lang cycle
  $("#btnLang").onclick = async () => {
    const newLang = cycleLang(LANG_ORDER);
    toast("Language", newLang.toUpperCase());
    await saveUiSafe();
    renderShell(); // перерисовать тексты + меню
    window.dispatchEvent(new Event("hashchange")); // чтобы перерисовать view
  };

  // drawer lang
  const btnLangDrawer = $("#btnLangDrawer");
  if (btnLangDrawer) {
    btnLangDrawer.textContent = "🌐 " + String(state.ui.lang).toUpperCase();
    btnLangDrawer.onclick = async () => {
      const newLang = cycleLang(LANG_ORDER);
      toast("Language", newLang.toUpperCase());
      await saveUiSafe();
      renderShell();
      window.dispatchEvent(new Event("hashchange"));
      closeDrawer();
    };
  }

  // theme toggle
  $("#themeToggle").onclick = async () => {
    const th = toggleTheme();
    toast("Theme", th);
    await saveUiSafe();
    renderShell();
    window.dispatchEvent(new Event("hashchange"));
  };

  // drawer theme
  const themeDrawer = $("#themeToggleDrawer");
  if (themeDrawer) {
    themeDrawer.textContent = state.ui.theme === "dark" ? "☀" : "☾";
    themeDrawer.onclick = async () => {
      const th = toggleTheme();
      toast("Theme", th);
      await saveUiSafe();
      renderShell();
      window.dispatchEvent(new Event("hashchange"));
      closeDrawer();
    };
  }

  // logout
  $("#btnLogout").onclick = async () => {
    try { await apiFetch("/auth/logout", { method:"POST" }); } catch {}
    location.hash = "#/login";
    location.reload();
  };
}

async function saveUiSafe() {
  try {
    if (state.user) {
      await apiFetch("/ui/me", {
        method:"POST",
        body: state.ui,
        loadingTitle: t("savingTitle"),
        loadingText: t("savingText"),
      });
    } else {
      localStorage.setItem("ui_prelogin", JSON.stringify({ lang: state.ui.lang, theme: state.ui.theme }));
    }
  } catch {}
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
