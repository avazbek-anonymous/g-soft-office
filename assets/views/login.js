import { state, setUser } from "../core/state.js";
import { t, cycleLang } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";
import { applyTheme, toggleTheme } from "../ui/theme.js";
import { LANG_ORDER, DEFAULT_ROUTE } from "../config.js";

const $ = (sel, el=document) => el.querySelector(sel);

export function renderLogin(onSuccess) {
  const root = $("#root");

  root.innerHTML = `
    <div class="auth">
      <div class="auth-card">
        <div class="auth-head">
          <div class="brand">
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
          <div class="row">
            <button class="btn" id="btnLangLogin">🌐 ${String(state.ui.lang).toUpperCase()}</button>
            <button class="btn" id="themeToggleLogin">${state.ui.theme === "dark" ? "☀" : "☾"}</button>
          </div>
        </div>

        <div class="h1" style="margin-top:16px">${t("loginTitle")}</div>

        <form id="loginForm" class="grid" style="gap:12px; margin-top:12px">
          <div class="field">
            <div class="label">${t("login")}</div>
            <input id="login" class="input" autocomplete="username" />
          </div>
          <div class="field">
            <div class="label">${t("password")}</div>
            <input id="password" class="input" type="password" autocomplete="current-password" />
          </div>
          <button class="btn primary" type="submit">${t("signIn")}</button>
        </form>
      </div>
    </div>
  `;

  $("#btnLangLogin").onclick = () => {
    const newLang = cycleLang(LANG_ORDER);
    localStorage.setItem("ui_prelogin", JSON.stringify({ lang: newLang, theme: state.ui.theme }));
    renderLogin(onSuccess);
  };

  $("#themeToggleLogin").onclick = () => {
    toggleTheme();
    localStorage.setItem("ui_prelogin", JSON.stringify({ lang: state.ui.lang, theme: state.ui.theme }));
    renderLogin(onSuccess);
  };

  $("#loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const login = $("#login").value.trim();
    const password = $("#password").value;

    try {
      await apiFetch("/auth/login", {
        method:"POST",
        body: { login, password },
        loadingTitle: "Auth",
        loadingText: "Signing in..."
      });

      const me = await apiFetch("/auth/me", { loadingTitle:"Auth", loadingText:"Checking session..." });
      setUser(me.user);

      // load UI settings (global + user)
      await onSuccess?.();
      toast("OK", t("welcome"));
      if (!location.hash || location.hash === "#/login") location.hash = DEFAULT_ROUTE;
    } catch (err) {
      toast(t("error"), err.message || "Login failed", "err");
    }
  };
}
