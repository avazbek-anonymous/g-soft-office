import { t } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";

const $ = (sel, el=document) => el.querySelector(sel);

const MODULES = ["main","tasks","projects","courses","clients","settings","users"];

export async function renderUsers(view) {
  view.innerHTML = `
    <div class="card">
      <div class="hd">
        <b>${t("users")}</b>
        <span class="muted">${t("adminOnly")}</span>
      </div>
      <div class="bd">
        <div class="tabs">
          <button class="tab" data-tab="users">${t("usersTab")}</button>
          <button class="tab" data-tab="roles">${t("rolesTab")}</button>
        </div>

        <div id="tabUsers" class="tabpanel"></div>
        <div id="tabRoles" class="tabpanel"></div>
      </div>
    </div>

    <div id="modalHost"></div>

    <style>
      .tabs{display:flex; gap:8px; margin:8px 0 14px}
      .tab{border:1px solid rgba(255,255,255,.12); background:transparent; padding:8px 10px; border-radius:10px; cursor:pointer}
      body[data-theme="light"] .tab{border-color: rgba(0,0,0,.12)}
      .tab.active{background:rgba(34,197,94,.12); border-color: rgba(34,197,94,.45)}
      .tabpanel{display:none}
      .tabpanel.active{display:block}
      .pill{display:inline-flex; align-items:center; gap:6px; padding:3px 8px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,.12)}
      body[data-theme="light"] .pill{border-color: rgba(0,0,0,.12)}
      .grid2{display:grid; grid-template-columns: 1fr 1fr; gap:10px}
      .grid3{display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:10px}
      @media (max-width: 900px){ .grid2,.grid3{grid-template-columns:1fr} }
      .modal-backdrop{position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:9999}
      .modal{width:min(920px, calc(100vw - 24px)); background:var(--bg, #0b1020); border:1px solid rgba(255,255,255,.12); border-radius:16px; overflow:hidden}
      body[data-theme="light"] .modal{background:#fff; border-color: rgba(0,0,0,.12)}
      .modal-head{display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08)}
      body[data-theme="light"] .modal-head{border-bottom-color: rgba(0,0,0,.08)}
      .modal-body{padding:14px}
      .checkgrid{display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:8px; margin-top:10px}
      .check{display:flex; gap:10px; align-items:center; padding:10px; border:1px solid rgba(255,255,255,.10); border-radius:12px}
      body[data-theme="light"] .check{border-color: rgba(0,0,0,.10)}
    </style>
  `;

  const tabUsersEl = $("#tabUsers", view);
  const tabRolesEl = $("#tabRoles", view);

  // state
  let roles = [];
  let users = [];

  const setTab = (tab) => {
    view.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    tabUsersEl.classList.toggle("active", tab === "users");
    tabRolesEl.classList.toggle("active", tab === "roles");
    localStorage.setItem("admin_users_tab", tab);
  };

  view.querySelectorAll(".tab").forEach(btn => {
    btn.onclick = () => setTab(btn.dataset.tab);
  });

  // initial tab
  setTab(localStorage.getItem("admin_users_tab") || "users");

  // load data
  roles = await loadRoles();
  users = await loadUsers(false, "");

  // render tabs
  renderUsersTab(tabUsersEl, {
    roles,
    getUsers: () => users,
    reloadUsers: async (includeDeleted, q) => {
      users = await loadUsers(includeDeleted, q);
      renderUsersTab(tabUsersEl, { roles, getUsers: () => users, reloadUsers: arguments.callee });
    },
    onRoleChanged: async () => { roles = await loadRoles(); renderRolesTab(tabRolesEl, roles); },
  });

  renderRolesTab(tabRolesEl, roles);
}

/* =========================
   Users tab
========================= */
function renderUsersTab(host, ctx) {
  const roles = ctx.roles;

  host.innerHTML = `
    <div class="row" style="gap:10px; align-items:center;">
      <button class="btn primary" id="btnUserAdd">＋ ${t("createUser")}</button>
      <button class="btn" id="btnUsersReload">⟲ ${t("reload")}</button>

      <label class="pill" style="cursor:pointer;">
        <input type="checkbox" id="chkDeleted" style="margin:0 6px 0 0" />
        ${t("includeDeleted")}
      </label>

      <div class="field" style="margin-left:auto; min-width:240px">
        <input class="input" id="uSearch" placeholder="${t("search")}..." />
      </div>
    </div>

    <div id="usersTable" style="margin-top:12px"></div>
  `;

  const users = ctx.getUsers();
  const table = $("#usersTable", host);
  table.innerHTML = usersTableHtml(users, roles);

  $("#btnUsersReload", host).onclick = async () => {
    const includeDeleted = $("#chkDeleted", host).checked;
    const q = $("#uSearch", host).value.trim();
    await ctx.reloadUsers(includeDeleted, q);
  };

  $("#uSearch", host).oninput = debounce(async (e) => {
    const includeDeleted = $("#chkDeleted", host).checked;
    const q = e.target.value.trim();
    await ctx.reloadUsers(includeDeleted, q);
  }, 250);

  $("#chkDeleted", host).onchange = async () => {
    const includeDeleted = $("#chkDeleted", host).checked;
    const q = $("#uSearch", host).value.trim();
    await ctx.reloadUsers(includeDeleted, q);
  };

  $("#btnUserAdd", host).onclick = () => openUserModal({
    mode: "create",
    roles,
    onSaved: async () => {
      toast(t("userCreated"));
      const includeDeleted = $("#chkDeleted", host).checked;
      const q = $("#uSearch", host).value.trim();
      await ctx.reloadUsers(includeDeleted, q);
    }
  });

  // actions from table (event delegation)
  table.onclick = (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    const id = Number(btn.dataset.id);
    const user = users.find(u => Number(u.id) === id);
    if (!user) return;

    if (act === "edit") {
      openUserModal({
        mode: "edit",
        roles,
        user,
        onSaved: async () => {
          toast(t("userUpdated"));
          const includeDeleted = $("#chkDeleted", host).checked;
          const q = $("#uSearch", host).value.trim();
          await ctx.reloadUsers(includeDeleted, q);
        }
      });
    }

    if (act === "reset") {
      openResetPasswordModal({
        user,
        onSaved: async () => {
          toast(t("saved"));
        }
      });
    }

    if (act === "delete") {
      confirmModal({
        title: t("confirmDeleteUser"),
        text: `${escapeHtml(user.ism || "")} (${escapeHtml(user.login || "")})`,
        okText: t("yes"),
        cancelText: t("no"),
        onOk: async () => {
          await apiFetch(`/users/${user.id}/delete`, { method: "POST" });
          toast(t("saved"));
          const includeDeleted = $("#chkDeleted", host).checked;
          const q = $("#uSearch", host).value.trim();
          await ctx.reloadUsers(includeDeleted, q);
        }
      });
    }
  };
}

function usersTableHtml(users, roles) {
  if (!users?.length) return `<div class="muted">${t("notFound")}</div>`;

  const roleName = (code) => roles.find(r => r.code === code)?.name || code;

  return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>${t("login")}</th>
          <th>${t("name")}</th>
          <th>${t("role")}</th>
          <th>${t("active")}</th>
          <th>${t("createdAt")}</th>
          <th>${t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr style="${u.is_deleted ? "opacity:.55" : ""}">
            <td>${escapeHtml(u.id)}</td>
            <td>${escapeHtml(u.login)}</td>
            <td>${escapeHtml(u.ism)}</td>
            <td>${escapeHtml(roleName(u.role))}</td>
            <td>${u.active ? `<span class="pill">${t("active")}</span>` : `<span class="pill">${t("inactive")}</span>`}</td>
            <td>${formatTs(u.created_at)}</td>
            <td class="row" style="gap:6px">
              <button class="btn" data-act="edit" data-id="${u.id}">${t("edit")}</button>
              <button class="btn" data-act="reset" data-id="${u.id}">${t("resetPass")}</button>
              <button class="btn danger" data-act="delete" data-id="${u.id}">${t("delete")}</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* =========================
   Roles tab
========================= */
function renderRolesTab(host, roles) {
  host.innerHTML = `
    <div class="row" style="gap:10px; align-items:center;">
      <button class="btn primary" id="btnRoleAdd">＋ ${t("createRole")}</button>
      <button class="btn" id="btnRolesReload">⟲ ${t("reload")}</button>

      <div class="field" style="margin-left:auto; min-width:240px">
        <input class="input" id="rSearch" placeholder="${t("search")}..." />
      </div>
    </div>

    <div id="rolesList" style="margin-top:12px; display:grid; gap:12px"></div>
  `;

  const list = $("#rolesList", host);
  const renderList = (q="") => {
    const qq = q.trim().toLowerCase();
    const filtered = roles.filter(r =>
      String(r.code||"").toLowerCase().includes(qq) ||
      String(r.name||"").toLowerCase().includes(qq)
    );
    list.innerHTML = filtered.length
      ? filtered.map(r => roleCardHtml(r)).join("")
      : `<div class="muted">${t("notFound")}</div>`;
  };

  $("#rSearch", host).oninput = (e) => renderList(e.target.value);
  renderList("");

  $("#btnRolesReload", host).onclick = async () => {
    const fresh = await loadRoles();
    renderRolesTab(host, fresh);
    toast(t("saved"));
  };

  $("#btnRoleAdd", host).onclick = () => openRoleModal({
    mode: "create",
    onSaved: async () => {
      toast(t("roleCreated"));
      const fresh = await loadRoles();
      renderRolesTab(host, fresh);
    }
  });

  // delegation: checkbox change + save
  list.onchange = (e) => {
    const chk = e.target.closest("input[data-role][data-mod]");
    if (!chk) return;

    const code = chk.dataset.role;
    const mod = chk.dataset.mod;

    // mark dirty
    const saveBtn = list.querySelector(`button[data-save="${code}"]`);
    if (saveBtn) saveBtn.dataset.dirty = "1";
  };

  list.onclick = async (e) => {
    const btnSave = e.target.closest("button[data-save]");
    if (btnSave) {
      const code = btnSave.dataset.save;
      const visibility = {};
      for (const mod of MODULES) {
        const chk = list.querySelector(`input[data-role="${code}"][data-mod="${mod}"]`);
        visibility[mod] = !!chk?.checked;
      }
      await apiFetch(`/roles/${code}/visibility`, { method:"PUT", body: { visibility } });
      btnSave.dataset.dirty = "0";
      toast(t("visibilitySaved"));
      return;
    }
  };
}

function roleCardHtml(role) {
  const vis = role.visibility || {};
  const sys = role.is_system ? `<span class="pill">${t("systemRole")}</span>` : `<span class="pill">${t("customRole")}</span>`;

  return `
    <div class="card">
      <div class="hd">
        <b>${escapeHtml(role.name || role.code)}</b>
        <span class="muted">${escapeHtml(role.code)} · ${sys}</span>
      </div>
      <div class="bd">
        <div class="checkgrid">
          ${MODULES.map(mod => `
            <label class="check">
              <input type="checkbox"
                     data-role="${escapeHtml(role.code)}"
                     data-mod="${escapeHtml(mod)}"
                     ${vis[mod] ? "checked" : ""} />
              <span>${escapeHtml(t(mod))}</span>
            </label>
          `).join("")}
        </div>

        <div class="row" style="justify-content:flex-end; margin-top:12px">
          <button class="btn primary" data-save="${escapeHtml(role.code)}">${t("saveVisibility")}</button>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   Modals
========================= */
function openUserModal({ mode, user, roles, onSaved }) {
  const isEdit = mode === "edit";
  const host = $("#modalHost");
  const roleOptions = roles.map(r => `<option value="${escapeHtml(r.code)}">${escapeHtml(r.name)} (${escapeHtml(r.code)})</option>`).join("");

  host.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-head">
          <b>${isEdit ? t("editUser") : t("createUser")}</b>
          <button class="btn" id="mClose">✕</button>
        </div>
        <div class="modal-body">
          <div class="grid2">
            <div class="field">
              <div class="label">${t("name")}</div>
              <input class="input" id="mIsm" value="${escapeHtml(user?.ism || "")}" />
            </div>
            <div class="field">
              <div class="label">${t("login")}</div>
              <input class="input" id="mLogin" value="${escapeHtml(user?.login || "")}" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("role")}</div>
              <select class="input" id="mRole">${roleOptions}</select>
            </div>
            <label class="check" style="margin-top:22px">
              <input type="checkbox" id="mActive" ${user?.active === 0 ? "" : "checked"} />
              <span>${t("active")}</span>
            </label>
          </div>

          ${isEdit ? "" : `
            <div class="field" style="margin-top:10px">
              <div class="label">${t("password")}</div>
              <input class="input" id="mPass" type="password" placeholder="${t("passwordHint")}" />
            </div>
          `}

          <div class="row" style="justify-content:flex-end; margin-top:14px">
            <button class="btn" id="mCancel">${t("cancel")}</button>
            <button class="btn primary" id="mSave">${t("save")}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const close = () => host.innerHTML = "";
  $("#mClose").onclick = close;
  $("#mCancel").onclick = close;
  host.querySelector(".modal-backdrop").onclick = (e) => { if (e.target.classList.contains("modal-backdrop")) close(); };

  $("#mRole").value = user?.role || "fin";

  $("#mSave").onclick = async () => {
    const ism = $("#mIsm").value.trim();
    const login = $("#mLogin").value.trim();
    const role = $("#mRole").value;
    const active = $("#mActive").checked;

    if (!ism || !login) return toast(t("error"), "ism/login required", "err");

    if (!isEdit) {
      const password = $("#mPass").value;
      if (!password || password.length < 6) return toast(t("error"), t("passwordHint"), "err");

      await apiFetch("/users", {
        method:"POST",
        body: { ism, login, password, role, active }
      });
    } else {
      await apiFetch(`/users/${user.id}`, {
        method:"PATCH",
        body: { ism, login, role, active }
      });
    }

    close();
    await onSaved?.();
  };
}

function openResetPasswordModal({ user, onSaved }) {
  const host = $("#modalHost");

  host.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-head">
          <b>${t("resetPass")} — ${escapeHtml(user.login || "")}</b>
          <button class="btn" id="pClose">✕</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <div class="label">${t("passwordNew")}</div>
            <input class="input" id="pNew" type="password" placeholder="${t("passwordHint")}" />
          </div>

          <div class="row" style="justify-content:flex-end; margin-top:14px">
            <button class="btn" id="pCancel">${t("cancel")}</button>
            <button class="btn primary" id="pSave">${t("save")}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const close = () => host.innerHTML = "";
  $("#pClose").onclick = close;
  $("#pCancel").onclick = close;
  host.querySelector(".modal-backdrop").onclick = (e) => { if (e.target.classList.contains("modal-backdrop")) close(); };

  $("#pSave").onclick = async () => {
    const password = $("#pNew").value;
    if (!password || password.length < 6) return toast(t("error"), t("passwordHint"), "err");
    await apiFetch(`/users/${user.id}/reset-password`, { method:"POST", body:{ password } });
    close();
    await onSaved?.();
  };
}

function openRoleModal({ mode, onSaved }) {
  const isCreate = mode === "create";
  const host = $("#modalHost");

  host.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-head">
          <b>${t("createRole")}</b>
          <button class="btn" id="rClose">✕</button>
        </div>
        <div class="modal-body">
          <div class="grid2">
            <div class="field">
              <div class="label">${t("roleCode")}</div>
              <input class="input" id="rCode" placeholder="sales, operator, academy_sales..." />
            </div>
            <div class="field">
              <div class="label">${t("roleName")}</div>
              <input class="input" id="rName" placeholder="Sales (CRM)" />
            </div>
          </div>

          <div class="h2" style="margin-top:12px">${t("rolesTab")}</div>
          <div class="checkgrid">
            ${MODULES.map(mod => `
              <label class="check">
                <input type="checkbox" data-mod="${escapeHtml(mod)}" ${mod === "main" ? "checked" : ""} />
                <span>${escapeHtml(t(mod))}</span>
              </label>
            `).join("")}
          </div>

          <div class="row" style="justify-content:flex-end; margin-top:14px">
            <button class="btn" id="rCancel">${t("cancel")}</button>
            <button class="btn primary" id="rSave">${t("save")}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const close = () => host.innerHTML = "";
  $("#rClose").onclick = close;
  $("#rCancel").onclick = close;
  host.querySelector(".modal-backdrop").onclick = (e) => { if (e.target.classList.contains("modal-backdrop")) close(); };

  $("#rSave").onclick = async () => {
    const code = $("#rCode").value.trim().toLowerCase();
    const name = $("#rName").value.trim();
    if (!code || !name) return toast(t("error"), "code/name required", "err");

    const visibility = {};
    host.querySelectorAll("input[data-mod]").forEach(chk => {
      visibility[chk.dataset.mod] = chk.checked;
    });

    await apiFetch("/roles", { method:"POST", body:{ code, name, visibility } });

    close();
    await onSaved?.();
  };
}

function confirmModal({ title, text, okText, cancelText, onOk }) {
  const host = $("#modalHost");
  host.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal" style="width:min(560px, calc(100vw - 24px))">
        <div class="modal-head">
          <b>${escapeHtml(title)}</b>
          <button class="btn" id="cClose">✕</button>
        </div>
        <div class="modal-body">
          <div class="muted">${escapeHtml(text || "")}</div>
          <div class="row" style="justify-content:flex-end; margin-top:14px">
            <button class="btn" id="cCancel">${escapeHtml(cancelText || t("cancel"))}</button>
            <button class="btn danger" id="cOk">${escapeHtml(okText || t("yes"))}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const close = () => host.innerHTML = "";
  $("#cClose").onclick = close;
  $("#cCancel").onclick = close;
  host.querySelector(".modal-backdrop").onclick = (e) => { if (e.target.classList.contains("modal-backdrop")) close(); };

  $("#cOk").onclick = async () => {
    close();
    await onOk?.();
  };
}

/* =========================
   API loaders
========================= */
async function loadRoles() {
  const data = await apiFetch("/roles", { loadingTitle:"Roles", loadingText:"Loading..." });
  const roles = data.roles || [];
  // normalize vis
  for (const r of roles) {
    r.visibility = r.visibility || {};
    for (const mod of MODULES) {
      if (typeof r.visibility[mod] !== "boolean") r.visibility[mod] = !!r.visibility[mod];
    }
  }
  return roles;
}

async function loadUsers(includeDeleted=false, q="") {
  const params = new URLSearchParams();
  if (includeDeleted) params.set("include_deleted", "1");
  if (q) params.set("q", q);
  const data = await apiFetch(`/users${params.toString() ? "?" + params.toString() : ""}`, {
    loadingTitle:"Users", loadingText:"Loading..."
  });
  return data.users || [];
}

/* =========================
   Helpers
========================= */
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}

function formatTs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "";
  const d = new Date(n * 1000);
  return new Intl.DateTimeFormat(undefined, { year:"numeric", month:"2-digit", day:"2-digit" }).format(d);
}

function debounce(fn, ms=250) {
  let tmr = null;
  return (...args) => {
    clearTimeout(tmr);
    tmr = setTimeout(() => fn(...args), ms);
  };
}
