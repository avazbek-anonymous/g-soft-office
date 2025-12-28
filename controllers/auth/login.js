import { i18n } from "../i18n.js";
import { api } from "../api.js";
import { router } from "../router.js";

async function load() {
  // Page is HTML (view), controller mounts logic
  const res = await fetch("./view/login.html", { cache: "no-store" });
  return { tpl: await res.text() };
}

function calc(ctx, data) {
  return { ...data };
}

function render(ctx, vm) {
  return vm.tpl;
}

function mount(ctx) {
  // language seg active
  const seg = ctx.outlet.querySelector("[data-lang-seg]");
  seg?.querySelectorAll("button[data-lang]").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-lang") === i18n.lang);
  });

  seg?.addEventListener("click", (e) => {
    const btn = e.target?.closest("button[data-lang]");
    if (!btn) return;
    const lang = btn.getAttribute("data-lang");
    i18n.setLang(lang);
    seg.querySelectorAll("button[data-lang]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-lang") === i18n.lang);
    });
  });

  const form = ctx.outlet.querySelector("#loginForm");
  const loginEl = ctx.outlet.querySelector("#loginInput");
  const passEl = ctx.outlet.querySelector("#passwordInput");
  const err = ctx.outlet.querySelector("#loginError");
  const btn = ctx.outlet.querySelector("#loginBtn");

  function showError(msg) {
    err.textContent = msg || i18n.t("auth.login.error");
    err.classList.add("show");
  }
  function hideError() {
    err.classList.remove("show");
    err.textContent = "";
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const login = (loginEl?.value || "").trim();
    const password = (passEl?.value || "").trim();

    if (!login || !password) {
      showError(i18n.t("auth.login.error"));
      return;
    }

    btn.disabled = true;

    try {
      await api.post("/auth/login", body);

const me = await api.get("/me");

// ✅ FIX: /me returns { ok, user, perms }
const user = me?.user ?? me;
const perms = me?.perms ?? me?.permissions ?? [];

window.APP.user = user;
window.APP.perms = perms;

i18n.syncFromUser(user);
router.go("#/main");

    } catch (ex) {
      showError(ex?.message || i18n.t("auth.login.error"));
    } finally {
      btn.disabled = false;
    }
  });
}

export const controller = { load, calc, render, mount };
