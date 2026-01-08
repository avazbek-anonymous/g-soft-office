/* G-SOFT Front (Part 1)
   - Login + Shell + Router + Main page
   - All CSS inside JS
   - Works with existing Workers API:
     POST  /api/auth/login {login,password}
     POST  /api/auth/logout
     GET   /api/auth/me
     GET   /api/main
     GET   /api/meta
*/

(() => {
  "use strict";

  // ===== Config =====
  const API_BASE =
    (window.__API_BASE && String(window.__API_BASE)) ||
    "https://api.ofis.gekto.uz"; // как в твоём BASE

  const ROUTES = [
    { path: "/main", title: "Asosiy" },
    { path: "/tasks", title: "Vazifalar" },
    { path: "/projects", title: "Loyihalar" },
    { path: "/courses", title: "Kurslar" }, // = course_leads
    { path: "/clients", title: "Clients" },
    { path: "/settings", title: "Sozlamalar" },
    { path: "/users", title: "Users" },
  ];

  // ===== Styles (minimal + fast) =====
  const STYLES = `
:root{
  --r:18px; --gap:12px;
  --bg:#061a14; --bg2:#0b2b23;
  --card:rgba(255,255,255,.07);
  --line:rgba(255,255,255,.12);
  --text:rgba(255,255,255,.92);
  --muted:rgba(255,255,255,.65);
  --brand:#ffd15c;
  --brand2:rgba(255,209,92,.18);
  --ok:#10b981;
  --bad:#f16262;
  --shadow:0 18px 55px rgba(0,0,0,.35);
  --topbarH:64px;
  --menuBg: rgba(6,26,20,.92);
  --menuBorder: rgba(255,255,255,.14);
  --menuItemHover: rgba(255,255,255,.06);
  --scrollTrack: rgba(255,255,255,.06);
  --scrollThumb: rgba(255,209,92,.55);
  --scrollThumb2: rgba(16,185,129,.35);
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;
  color:var(--text);
  background:
    radial-gradient(1000px 520px at 20% 20%, rgba(255,209,92,.14), transparent 60%),
    radial-gradient(1000px 520px at 85% 35%, rgba(16,185,129,.14), transparent 55%),
    linear-gradient(180deg,var(--bg),var(--bg2));
  overflow:hidden;
}

/* scroll */
*{ scrollbar-width: thin; scrollbar-color: var(--scrollThumb) var(--scrollTrack); scrollbar-gutter: stable; }
::-webkit-scrollbar{ width:12px; height:12px; }
::-webkit-scrollbar-track{ background: var(--scrollTrack); border-radius:999px; }
::-webkit-scrollbar-thumb{
  background: linear-gradient(180deg, var(--scrollThumb), var(--scrollThumb2));
  border-radius:999px; border:3px solid transparent; background-clip: content-box;
}

/* layout */
#app{height:100vh}
.shell{height:100vh;display:flex;min-height:0}
.sidebar{
  width:74px; transition:width .22s ease;
  border-right:1px solid var(--line);
  background:rgba(255,255,255,.05);
  backdrop-filter: blur(12px);
  padding:12px 10px;
  display:flex;flex-direction:column;gap:10px;
  min-height:0;
}
.sidebar:hover{width:260px}

.brand{
  display:flex;align-items:center;gap:10px;
  padding:10px;border-radius:16px;
  background:rgba(255,255,255,.05);
  border:1px solid var(--line);
}
.logo{
  width:38px;height:38px;border-radius:14px;
  display:grid;place-items:center;
  font-weight:1000;color:var(--brand);
  background:var(--brand2);
  border:1px solid rgba(255,255,255,.08);
  flex:0 0 38px;
}
.brandText{
  font-weight:1000; letter-spacing:.2px;
  white-space:nowrap; overflow:hidden;
  opacity:0; transform:translateX(-4px);
  transition:opacity .16s ease, transform .16s ease;
}
.sidebar:hover .brandText{opacity:1; transform:translateX(0)}

.nav{display:flex;flex-direction:column;gap:6px;padding-top:6px;min-height:0;overflow:auto;padding-right:4px}
.nav a{
  display:flex;align-items:center;gap:10px;
  padding:10px;border-radius:16px;
  text-decoration:none;color:var(--text);
  border:1px solid transparent;
}
.nav a:hover{background:rgba(255,255,255,.06);border-color:var(--line)}
.nav a.active{background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.28)}
.ico{width:22px;height:22px;display:grid;place-items:center;flex:0 0 22px}
.txt{
  white-space:nowrap; overflow:hidden;
  opacity:0; transform:translateX(-4px);
  transition:opacity .16s ease, transform .16s ease;
}
.sidebar:hover .txt{opacity:1; transform:translateX(0)}

.main{flex:1;min-width:0;display:flex;flex-direction:column;min-height:0}
.topbar{
  height:var(--topbarH);
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:12px 14px;
  border-bottom:1px solid var(--line);
  background:rgba(255,255,255,.04);
  backdrop-filter: blur(12px);
  flex:0 0 auto;
}
.topbarTitle{font-weight:1000}
.topbarRight{display:flex;align-items:center;gap:10px}
.badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 10px;border-radius:999px;
  border:1px solid var(--line);
  background:rgba(255,255,255,.05);
  color:var(--muted);
  font-size:13px;
}
.btn{
  border:none; cursor:pointer;
  border-radius:14px;
  padding:10px 12px;
  font-weight:800;
  background:rgba(255,255,255,.06);
  border:1px solid var(--line);
  color:var(--text);
}
.btn:hover{background:rgba(255,255,255,.09)}
.btnPrimary{
  background: rgba(255,209,92,.14);
  border-color: rgba(255,209,92,.28);
  color: var(--text);
}
.btnDanger{
  background: rgba(241,98,98,.14);
  border-color: rgba(241,98,98,.28);
}
.content{
  flex:1; min-height:0;
  overflow:auto;
  padding:14px;
}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width: 900px){ .grid2{grid-template-columns:1fr} }

.card{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:20px;
  box-shadow:var(--shadow);
}
.cardHd{padding:14px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px}
.cardHd h3{margin:0;font-size:16px}
.cardBd{padding:14px}
.muted{color:var(--muted)}
.list{display:flex;flex-direction:column;gap:10px}
.item{
  padding:12px;border-radius:16px;
  border:1px solid rgba(255,255,255,.10);
  background:rgba(0,0,0,.12);
}
.itemTop{display:flex;align-items:center;justify-content:space-between;gap:8px}
.itemTitle{font-weight:900}
.itemMeta{color:var(--muted);font-size:12px;margin-top:6px}

/* login */
.center{
  height:100vh;display:grid;place-items:center;padding:14px;
}
.loginCard{
  width:min(520px,100%);
  background:var(--card);
  border:1px solid var(--line);
  border-radius:22px;
  box-shadow:var(--shadow);
  padding:16px;
}
.loginTitle{font-weight:1000;font-size:20px;margin:0 0 8px 0}
.field{display:flex;flex-direction:column;gap:6px;margin-top:10px}
.label{font-size:12px;color:var(--muted);font-weight:800}
.input{
  width:100%;
  padding:12px 12px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(0,0,0,.16);
  color:var(--text);
  outline:none;
}
.input:focus{border-color: rgba(255,209,92,.45)}
.row{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:14px}

/* modal */
.modalOverlay{
  position:fixed; inset:0; z-index:2000;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,.42);
  backdrop-filter: blur(10px);
  padding:14px;
}
.modal{
  width:min(860px, 100%);
  max-height: calc(100vh - 28px);
  overflow:auto;
  background:var(--card);
  border:1px solid var(--line);
  border-radius:22px;
  box-shadow:var(--shadow);
}
.modalHd{
  position:sticky; top:0;
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:14px;
  border-bottom:1px solid var(--line);
  background:rgba(0,0,0,.12);
  backdrop-filter: blur(12px);
}
.modalTitle{font-weight:1000}
.iconBtn{
  width:40px;height:40px;border-radius:14px;
  border:1px solid var(--line);
  background:rgba(255,255,255,.06);
  color:var(--text);
  display:grid;place-items:center;
  cursor:pointer;
}
.iconBtn:hover{background:rgba(255,255,255,.09)}

/* toast */
.toastHost{position:fixed;right:14px;bottom:14px;z-index:3000;display:flex;flex-direction:column;gap:10px}
.toast{
  width:min(420px, calc(100vw - 28px));
  padding:12px 12px;
  border-radius:18px;
  border:1px solid var(--line);
  background:rgba(0,0,0,.28);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow);
}
.toastTitle{font-weight:1000}
.toastText{color:var(--muted);margin-top:4px;font-size:13px}
  `;

  // ===== Helpers =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const h = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (v === null || v === undefined) continue;
      else el.setAttribute(k, String(v));
    }
    for (const c of Array.isArray(children) ? children : [children]) {
      if (c === null || c === undefined) continue;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
  };

  function injectStyles(cssText) {
    const st = document.createElement("style");
    st.textContent = cssText;
    document.head.appendChild(st);
  }

  function fmtDateTime(sec) {
    if (!sec) return "—";
    const d = new Date(Number(sec) * 1000);
    // без локалей чтоб не прыгало: yyyy-mm-dd hh:mm
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function pickTitleFromDesc(desc) {
    const s = String(desc || "").trim();
    if (!s) return "—";
    const words = s.split(/\s+/).slice(0, 3).join(" ");
    return words;
  }

  function secToHMS(total) {
    total = Math.max(0, Number(total) || 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    const pad = (n) => String(n).padStart(2, "0");
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${m}:${pad(s)}`;
  }

  // ===== Toasts =====
  const Toast = {
    host: null,
    ensure() {
      if (this.host) return;
      this.host = h("div", { class: "toastHost" });
      document.body.appendChild(this.host);
    },
    show(title, text, ms = 2600) {
      this.ensure();
      const el = h("div", { class: "toast" }, [
        h("div", { class: "toastTitle" }, title || "Info"),
        h("div", { class: "toastText" }, text || ""),
      ]);
      this.host.appendChild(el);
      setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(6px)";
        el.style.transition = "opacity .18s ease, transform .18s ease";
        setTimeout(() => el.remove(), 220);
      }, ms);
    },
  };

  // ===== Modal =====
  const Modal = {
    overlay: null,
    open(title, contentNode) {
      this.close();
      this.overlay = h("div", { class: "modalOverlay" });
      const modal = h("div", { class: "modal" });
      const hd = h("div", { class: "modalHd" }, [
        h("div", { class: "modalTitle" }, title || ""),
        h("button", { class: "iconBtn", title: "Close", onclick: () => this.close() }, "✕"),
      ]);
      const bd = h("div", { class: "cardBd" }, contentNode);
      modal.appendChild(hd);
      modal.appendChild(bd);
      this.overlay.appendChild(modal);

      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) this.close();
      });

      document.body.appendChild(this.overlay);
      document.body.style.overflow = "hidden";
    },
    close() {
      if (this.overlay) this.overlay.remove();
      this.overlay = null;
      document.body.style.overflow = "";
    },
  };

  // ===== API client =====
  async function apiFetch(path, opts = {}) {
    const url = API_BASE.replace(/\/+$/, "") + path;
    const init = {
      method: opts.method || "GET",
      headers: { ...(opts.headers || {}) },
      credentials: "include",
    };
    if (opts.json !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(opts.json);
    }
    const res = await fetch(url, init);

    let data = null;
    const ct = res.headers.get("Content-Type") || "";
    if (ct.includes("application/json")) {
      try { data = await res.json(); } catch { data = null; }
    } else {
      data = await res.text().catch(() => "");
    }

    if (!res.ok) {
      const msg =
        (data && data.error && data.error.message) ||
        (typeof data === "string" ? data : "") ||
        `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }

  const API = {
    async me() {
      const r = await apiFetch("/api/auth/me");
      return r?.data?.user || null;
    },
    async login(login, password) {
      const r = await apiFetch("/api/auth/login", { method: "POST", json: { login, password } });
      return r?.data || null;
    },
    async logout() {
      await apiFetch("/api/auth/logout", { method: "POST" });
    },
    async meta() {
      const r = await apiFetch("/api/meta");
      return r?.data || null;
    },
    async main() {
      const r = await apiFetch("/api/main");
      return r?.data || { overdue: [], today: [], in_progress: null };
    },
  };

  // ===== Router =====
  function parseHash() {
    const raw = (location.hash || "").trim();
    if (!raw.startsWith("#/")) return { path: "/main", query: {} };
    const s = raw.slice(2); // remove "#/"
    const [pathPart, queryPart] = s.split("?");
    const path = "/" + (pathPart || "main").replace(/^\/+/, "");
    const query = {};
    if (queryPart) {
      for (const kv of queryPart.split("&")) {
        const [k, v] = kv.split("=");
        if (!k) continue;
        query[decodeURIComponent(k)] = decodeURIComponent(v || "");
      }
    }
    return { path, query };
  }
  function setHash(path, query = {}) {
    const qs = Object.keys(query).length
      ? "?" + Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
      : "";
    location.hash = "#/" + path.replace(/^\/+/, "") + qs;
  }

  // ===== App state =====
  const App = {
    root: null,
    state: {
      user: null,
      meta: null,
      route: { path: "/main", query: {} },
    },

    async start() {
      injectStyles(STYLES);
      this.root = document.getElementById("app");
      if (!this.root) throw new Error("#app not found");

      // detect file mode
      const isLoginPage = /login\.html$/i.test(location.pathname);

      // try session
      try {
        const user = await API.me();
        if (user) {
          this.state.user = user;
          if (isLoginPage) {
            location.replace("./index.html#/main");
            return;
          }
          await this.ensureMeta();
          this.renderShell();
          this.bindRouter();
          this.routeTo(parseHash());
          return;
        }
      } catch (e) {
        // ignore; will show login
      }

      // not logged in
      if (!isLoginPage) {
        // allow login inside index.html too
        this.renderLogin();
      } else {
        this.renderLogin();
      }
    },

    bindRouter() {
      window.addEventListener("hashchange", () => this.routeTo(parseHash()));
    },

    async ensureMeta() {
      try {
        this.state.meta = await API.meta();
      } catch {
        this.state.meta = null;
      }
    },

    // ===== Render: Login =====
    renderLogin() {
      this.root.innerHTML = "";
      const savedLogin = localStorage.getItem("gsoft_login") || "";

      const loginInp = h("input", { class: "input", placeholder: "login", value: savedLogin });
      const passInp = h("input", { class: "input", placeholder: "password", type: "password" });

      const btn = h("button", { class: "btn btnPrimary", type: "button" }, "Kirish");

      const form = h("div", { class: "loginCard" }, [
        h("div", { class: "logo", style: "width:44px;height:44px;border-radius:16px" }, "G"),
        h("h1", { class: "loginTitle" }, "G-SOFT"),
        h("div", { class: "muted" }, "Tizimga kirish"),
        h("div", { class: "field" }, [h("div", { class: "label" }, "Login"), loginInp]),
        h("div", { class: "field" }, [h("div", { class: "label" }, "Password"), passInp]),
        h("div", { class: "row" }, [
          h("div", { class: "muted", style: "font-size:12px" }, `API: ${API_BASE}`),
          btn,
        ]),
      ]);

      const wrap = h("div", { class: "center" }, form);
      this.root.appendChild(wrap);

      const doLogin = async () => {
        const login = String(loginInp.value || "").trim();
        const password = String(passInp.value || "");
        if (!login || !password) {
          Toast.show("Xato", "Login va parolni kiriting");
          return;
        }
        btn.disabled = true;
        btn.textContent = "Kutilmoqda...";
        try {
          await API.login(login, password);
          localStorage.setItem("gsoft_login", login);
          location.replace("./index.html#/main");
        } catch (e) {
          Toast.show("Login xato", e.message || "Error");
          btn.disabled = false;
          btn.textContent = "Kirish";
        }
      };

      btn.addEventListener("click", doLogin);
      passInp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doLogin();
      });
    },

    // ===== Render: Shell =====
    renderShell() {
      this.root.innerHTML = "";

      const sidebar = h("div", { class: "sidebar" }, [
        h("div", { class: "brand" }, [
          h("div", { class: "logo" }, "G"),
          h("div", { class: "brandText" }, "G-SOFT"),
        ]),
        this.renderNav(),
      ]);

      const topbarTitle = h("div", { class: "topbarTitle" }, "…");
      const userBadge = h("div", { class: "badge" }, `${this.state.user.full_name} • ${this.state.user.role}`);
      const logoutBtn = h(
        "button",
        {
          class: "btn",
          onclick: async () => {
            try { await API.logout(); } catch {}
            location.replace("./login.html");
          },
        },
        "Chiqish"
      );

      const topbar = h("div", { class: "topbar" }, [
        topbarTitle,
        h("div", { class: "topbarRight" }, [userBadge, logoutBtn]),
      ]);

      const content = h("div", { class: "content", id: "view" }, "");
      const main = h("div", { class: "main" }, [topbar, content]);

      const shell = h("div", { class: "shell" }, [sidebar, main]);
      this.root.appendChild(shell);

      this._ui = { topbarTitle, content };
    },

    renderNav() {
      const nav = h("div", { class: "nav", id: "nav" });
      for (const r of ROUTES) {
        const a = h(
          "a",
          {
            href: `#${r.path}`,
            "data-path": r.path,
          },
          [
            h("div", { class: "ico" }, "•"),
            h("div", { class: "txt" }, r.title),
          ]
        );
        nav.appendChild(a);
      }
      return nav;
    },

    setActiveNav(path) {
      const nav = $("#nav", this.root);
      if (!nav) return;
      for (const a of nav.querySelectorAll("a[data-path]")) {
        const p = a.getAttribute("data-path");
        a.classList.toggle("active", p === path);
      }
    },

    // ===== Route handler =====
    async routeTo(route) {
      this.state.route = route;
      if (!this.state.user) {
        this.renderLogin();
        return;
      }
      // ensure shell exists
      if (!this._ui) this.renderShell();

      const path = route.path || "/main";
      this.setActiveNav(path);

      const title = (ROUTES.find((x) => x.path === path)?.title) || "G-SOFT";
      this._ui.topbarTitle.textContent = title;

      if (path === "/main") return await this.renderMain();
      if (path === "/tasks") return this.renderStub("Vazifalar (keyingi qismda)"); // Part 2
      if (path === "/projects") return this.renderStub("Loyihalar (keyingi qismda)"); // Part 3
      if (path === "/courses") return this.renderStub("Kurslar (keyingi qismda)"); // Part 4
      if (path === "/clients") return this.renderStub("Clients (keyingi qismda)"); // Part 5
      if (path === "/settings") return this.renderStub("Sozlamalar (keyingi qismda)"); // Part 6
      if (path === "/users") return this.renderStub("Users (keyingi qismda)"); // Part 6

      return this.renderStub("Not found");
    },

    renderStub(text) {
      this._ui.content.innerHTML = "";
      this._ui.content.appendChild(
        h("div", { class: "card" }, [
          h("div", { class: "cardHd" }, [h("h3", {}, "Info"), h("div", { class: "muted" }, "…")]),
          h("div", { class: "cardBd" }, [h("div", { class: "muted" }, text)]),
        ])
      );
    },

    // ===== Main page =====
    async renderMain() {
      this._ui.content.innerHTML = "";

      const wrap = h("div", { class: "grid2" });

      const cardOver = h("div", { class: "card" }, [
        h("div", { class: "cardHd" }, [h("h3", {}, "Prosrochennye"), h("div", { class: "muted" }, "deadline")]),
        h("div", { class: "cardBd" }, [h("div", { class: "muted" }, "Yuklanmoqda...")]),
      ]);
      const cardToday = h("div", { class: "card" }, [
        h("div", { class: "cardHd" }, [h("h3", {}, "Bugungi vazifalar"), h("div", { class: "muted" }, "deadline")]),
        h("div", { class: "cardBd" }, [h("div", { class: "muted" }, "Yuklanmoqda...")]),
      ]);

      const cardProg = h("div", { class: "card", style: "grid-column: 1 / -1;" }, [
        h("div", { class: "cardHd" }, [h("h3", {}, "Jarayonda"), h("div", { class: "muted" }, "1 dona")]),
        h("div", { class: "cardBd" }, [h("div", { class: "muted" }, "Yuklanmoqda...")]),
      ]);

      wrap.appendChild(cardOver);
      wrap.appendChild(cardToday);
      wrap.appendChild(cardProg);

      this._ui.content.appendChild(wrap);

      try {
        const data = await API.main();
        this.fillTasksList(cardOver, data.overdue || [], "Prosrochennye yo‘q");
        this.fillTasksList(cardToday, data.today || [], "Bugun vazifa yo‘q");
        this.fillInProgress(cardProg, data.in_progress || null);
      } catch (e) {
        Toast.show("Xato", e.message || "Main load error");
        this.fillTasksList(cardOver, [], "Xato");
        this.fillTasksList(cardToday, [], "Xato");
        this.fillInProgress(cardProg, null);
      }
    },

    fillTasksList(card, rows, emptyText) {
      const bd = card.querySelector(".cardBd");
      bd.innerHTML = "";
      if (!rows || !rows.length) {
        bd.appendChild(h("div", { class: "muted" }, emptyText));
        return;
      }
      const list = h("div", { class: "list" });
      for (const t of rows) {
        const title = t.title ? String(t.title) : pickTitleFromDesc(t.description);
        const meta = [
          t.deadline_at ? `Deadline: ${fmtDateTime(t.deadline_at)}` : "Deadline: —",
          t.project_id ? `Project: #${t.project_id}` : "Project: No PR",
          `Status: ${t.status}`,
        ].join(" • ");
        const item = h("div", { class: "item" }, [
          h("div", { class: "itemTop" }, [
            h("div", { class: "itemTitle" }, title),
            h(
              "button",
              {
                class: "btn",
                onclick: () => {
                  Modal.open("Vazifa", h("div", {}, [
                    h("div", { class: "muted" }, "Task modal (to‘liq) — Part 2 da qilamiz"),
                    h("div", { style: "margin-top:10px" }, `#${t.id}`),
                    h("div", { style: "margin-top:8px" }, meta),
                  ]));
                },
              },
              "Ochish"
            ),
          ]),
          h("div", { class: "itemMeta" }, meta),
        ]);
        list.appendChild(item);
      }
      bd.appendChild(list);
    },

    fillInProgress(card, task) {
      const bd = card.querySelector(".cardBd");
      bd.innerHTML = "";
      if (!task) {
        bd.appendChild(h("div", { class: "muted" }, "Jarayonda vazifa yo‘q"));
        return;
      }
      const title = task.title ? String(task.title) : pickTitleFromDesc(task.description);
      bd.appendChild(
        h("div", { class: "item" }, [
          h("div", { class: "itemTop" }, [
            h("div", { class: "itemTitle" }, `${title} (#${task.id})`),
            h("button", { class: "btn btnPrimary", onclick: () => setHash("/tasks") }, "Tasks →"),
          ]),
          h("div", { class: "itemMeta" }, [
            `Status: ${task.status}`,
            task.deadline_at ? `Deadline: ${fmtDateTime(task.deadline_at)}` : "Deadline: —",
            task.project_id ? `Project: #${task.project_id}` : "Project: No PR",
          ].join(" • ")),
        ])
      );
    },
  };

  // Boot
  document.addEventListener("DOMContentLoaded", () => {
    App.start().catch((e) => {
      console.error(e);
      const root = document.getElementById("app");
      if (root) root.textContent = "Fatal error: " + (e?.message || e);
    });
  });
})();
