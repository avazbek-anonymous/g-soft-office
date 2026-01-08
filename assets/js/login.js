// /assets/js/login.js
// G-SOFT login flow (Cloudflare Workers API)
// - POST {login,password} -> /auth/login (cookie gsoft_session set by server)
// - redirect to index.html on success
// - if already logged in -> redirect

(() => {
  "use strict";

  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  function pickInput(selectors) {
    for (const s of selectors) {
      const el = $(s);
      if (el) return el;
    }
    return null;
  }

  function getApiBase() {
    // priority:
    // 1) window.API_BASE
    // 2) <meta name="api-base" content="/api">
    // 3) default "/api"
    const w = (window.API_BASE || "").toString().trim();
    if (w) return w.replace(/\/+$/, "");

    const meta = document.querySelector('meta[name="api-base"]');
    const m = meta?.getAttribute("content")?.trim();
    if (m) return m.replace(/\/+$/, "");

    return "/api";
  }

  const API = getApiBase();

  async function apiFetch(path, opts = {}) {
    const url = path.startsWith("http") ? path : `${API}${path}`;
    const headers = new Headers(opts.headers || {});
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    const res = await fetch(url, {
      method: opts.method || "GET",
      credentials: "include",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    let data = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }
    } else {
      // optional text
      try {
        data = await res.text();
      } catch (_) {
        data = null;
      }
    }

    if (!res.ok) {
      const msg =
        (data && typeof data === "object" && (data.error || data.message)) ||
        (typeof data === "string" && data) ||
        `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  function setError(errEl, msg) {
    if (!errEl) return;
    errEl.hidden = !msg;
    errEl.textContent = msg || "";
  }

  function setLoading(btn, isLoading) {
    if (!btn) return;
    btn.disabled = !!isLoading;
    btn.classList.toggle("is-loading", !!isLoading);
    if (btn.dataset.txt == null) btn.dataset.txt = btn.textContent || "";
    btn.textContent = isLoading ? "..." : btn.dataset.txt;
  }

  function nextUrl() {
    const u = new URL(location.href);
    const next = u.searchParams.get("next");
    if (next && next.startsWith("/")) return next;
    return "/index.html";
  }

  async function precheck() {
    try {
      await apiFetch("/auth/me");
      location.href = nextUrl();
    } catch (_) {
      // not logged in — ok
    }
  }

  function bind() {
    const form = $("#loginForm") || document.querySelector("form");
    const loginInput =
      pickInput(["#login", "#username", 'input[name="login"]', 'input[name="username"]']) ||
      pickInput(['input[type="text"]']);

    const passInput =
      pickInput(["#password", 'input[name="password"]', 'input[type="password"]']) || null;

    const btn = $("#loginBtn") || (form ? form.querySelector('button[type="submit"]') : null);
    const errEl = $("#loginError") || $("[data-login-error]");

    // optional "show password" toggle: element with [data-pass-toggle]
    const toggle = $("[data-pass-toggle]");
    if (toggle && passInput) {
      toggle.addEventListener("click", () => {
        const isPass = passInput.type === "password";
        passInput.type = isPass ? "text" : "password";
        toggle.classList.toggle("is-on", isPass);
      });
    }

    if (!form || !loginInput || !passInput) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setError(errEl, "");

      const login = (loginInput.value || "").trim();
      const password = (passInput.value || "").trim();

      if (!login || !password) {
        setError(errEl, "Login va parol majburiy");
        return;
      }

      setLoading(btn, true);
      try {
        await apiFetch("/auth/login", { method: "POST", body: { login, password } });
        location.href = nextUrl();
      } catch (err) {
        // friendly errors
        if (err.status === 401) setError(errEl, "Login yoki parol xato");
        else setError(errEl, String(err.message || err));
      } finally {
        setLoading(btn, false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await precheck();
    bind();
  });
})();
