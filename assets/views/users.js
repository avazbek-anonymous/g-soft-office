import { t } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";

const $ = (sel, el=document) => el.querySelector(sel);

const MODULES = ["main","tasks","projects","courses","clients","settings","users"];

export async function renderUsers(view) {
  view.innerHTML = `
    <div class="card uadm">
      <div class="hd">
        <b>${t("users")}</b>
        <span class="muted">${t("adminOnly")}</span>
      </div>
      <div class="bd">

        <div class="uadm-tabs">
          <button class="uadm-tab" data-tab="users">${t("usersTab")}</button>
          <button class="uadm-tab" data-tab="roles">${t("rolesTab")}</button>
          <div class="uadm-spacer"></div>
          <div class="field uadm-search">
            <input class="input" id="uadmSearch" placeholder="${t("search")}..." />
          </div>
        </div>

        <div id="tabUsers" class="uadm-panel"></div>
        <div id="tabRoles" class="uadm-panel"></div>
      </div>
    </div>

    <div id="modalHost"></div>

    <style>
      .uadm-tabs{display:flex; gap:8px; align-items:center; margin:6px 0 14px}
      .uadm-tab{border:1px solid rgba(255,255,255,.12); background:transparent; padding:8px 12px; border-radius:12px; cursor:pointer}
      body[data-theme="light"] .uadm-tab{border-color: rgba(0,0,0,.12)}
      .uadm-tab.active{background:rgba(34,197,94,.12); border-color: rgba(34,197,94,.45)}
      .uadm-spacer{flex:1}
      .uadm-search{min-width:260px; max-width:360px}
      @media (max-width: 920px){ .uadm-search{min-width:160px} }

      .uadm-panel{display:none}
      .uadm-panel.active{display:block}

      .uadm-toolbar{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
      .uadm-toolbar .field{min-width:240px}

      .uadm-tablewrap{margin-top:12px; overflow:auto; border-radius:14px; border:1px solid rgba(255,255,255,.10)}
      body[data-theme="light"] .uadm-tablewrap{border-color: rgba(0,0,0,.10)}
      .uadm-table{width:100%; border-collapse:collapse; min-width:760px}
      .uadm-table th, .uadm-table td{padding:12px 12px; border-bottom:1px solid rgba(255,255,255,.08); text-align:left; vertical-align:middle}
      body[data-theme="light"] .uadm-table th, body[data-theme="light"] .uadm-table td{border-bottom-color: rgba(0,0,0,.08)}
      .uadm-table thead th{font-size:12px; opacity:.75; position:sticky; top:0; background:rgba(10,14,25,.85); backdrop-filter: blur(10px)}
      body[data-theme="light"] .uadm-table thead th{background:rgba(255,255,255,.85)}
      .uadm-actions{display:flex; gap:8px; flex-wrap:wrap}
      .uadm-muted{opacity:.6}
      .uadm-badge{display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,.12)}
      body[data-theme="light"] .uadm-badge{border-color: rgba(0,0,0,.12)}
      .uadm-badge.on{background:rgba(34,197,94,.14); border-color:rgba(34,197,94,.35)}
      .uadm-badge.off{background:rgba(148,163,184,.10)}
      .uadm-toggle{border:1px solid rgba(255,255,255,.12); border-radius:999px; padding:8px 12px; background:transparent; cursor:pointer}
      body[data-theme="light"] .uadm-toggle{border-color: rgba(0,0,0,.12)}
      .uadm-toggle.on{background:rgba(34,197,94,.14); border-color:rgba(34,197,94,.35)}

      /* Roles list (accordion) */
      .rolelist{display:grid; gap:12px; margin-top:12px}
      .rolecard{border:1px solid rgba(255,255,255,.10); border-radius:16px; overflow:hidden}
      body[data-theme="light"] .rolecard{border-color: rgba(0,0,0,.10)}
      .rolehead{display:flex; gap:10px; align-items:center; padding:12px 14px; background:rgba(255,255,255,.02)}
      body[data-theme="light"] .rolehead{background:rgba(0,0,0,.02)}
      .rolehead b{font-size:14px}
      .rolehead .meta{font-size:12px; opacity:.7}
      .rolehead .grow{flex:1}
      .rolehead .right{display:flex; gap:8px; align-items:center; flex-wrap:wrap; justify-content:flex-end}
      .roledetails{display:none; padding:12px 14px; border-top:1px solid rgba(255,255,255,.08)}
      body[data-theme="light"] .roledetails{border-top-color: rgba(0,0,0,.08)}
      .rolecard.open .roledetails{display:block}

      .chips{display:flex; flex-wrap:wrap; gap:8px; margin-top:10px}
      .chip{border:1px solid rgba(255,255,255,.12); background:transparent; border-radius:999px; padding:8px 12px; cursor:pointer; font-size:13px}
      body[data-theme="light"] .chip{border-color: rgba(0,0,0,.12)}
      .chip.on{background:rgba(34,197,94,.14); border-color:rgba(34,197,94,.35)}
      .chip.off{background:rgba(148,163,184,.10)}
      .roletools{display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:12px}
      .roletools .sp{flex:1}

      /* Modal */
      .mb{position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:9999}
      .m{width:min(760px, calc(100vw - 24px)); background:var(--bg, #0b1020); border:1px solid rgba(255,255,255,.12); border-radius:16px; overflow:hidden}
      body[data-theme="light"] .m{background:#fff; border-color: rgba(0,0,0,.12)}
      .mh{display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08)}
      body[data-theme="light"] .mh{border-bottom-color: rgba(0,0,0,.08)}
      .mbo{padding:14px}
      .grid2{display:grid; grid-template-columns:1fr 1fr; gap:10px}
      @media (max-width: 900px){ .grid2{grid-template-columns:1fr} }
    </style>
  `;

  const tabUsers = $("#tabUsers", view);
  const tabRoles = $("#tabRoles", view);
  const search = $("#uadmSearch", view);

  let roles = await loadRoles();
  let users = await loadUsers(false, "");

  // tabs
  const setTab = (tab) => {
    view.querySelectorAll(".uadm-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    tabUsers.classList.toggle("active", tab === "users");
    tabRoles.classList.toggle("active", tab === "roles");
    localStorage.setItem("uadm_tab", tab);
    // re-render active with current search
    const q = search.value.trim();
    if (tab === "users") renderUsersTab(tabUsers, users, roles, q);
    else renderRolesTab(tabRoles, roles, q);
  };

  view.querySelectorAll(".uadm-tab").forEach(btn => btn.onclick = () => setTab(btn.dataset.tab));
  setTab(localStorage.getItem("uadm_tab") || "users");

  // global search affects current tab
  search.oninput = debounce(() => {
    const tab = localStorage.getItem("uadm_tab") || "users";
    const q = search.value.trim();
    if (tab === "users") renderUsersTab(tabUsers, users, roles, q);
    else renderRolesTab(tabRoles, roles, q);
  }, 200);

  /* ========= Actions (Users tab) ========= */
  tabUsers.addEventListener("click", async (e) => {
    const act = e.target.closest("[data-uact]")?.dataset.uact;
    if (!act) return;

    if (act === "reload") {
      const includeDeleted = tabUsers.dataset.deleted === "1";
      users = await loadUsers(includeDeleted, search.value.trim());
      renderUsersTab(tabUsers, users, roles, search.value.trim());
      return;
    }

    if (act === "toggleDeleted") {
      const now = tabUsers.dataset.deleted === "1";
      tabUsers.dataset.deleted = now ? "0" : "1";
      users = await loadUsers(!now, search.value.trim());
      renderUsersTab(tabUsers, users, roles, search.value.trim());
      return;
    }

    if (act === "create") {
      openUserModal({
        roles,
        mode: "create",
        onSaved: async () => {
          users = await loadUsers(tabUsers.dataset.deleted === "1", search.value.trim());
          toast(t("userCreated"));
          renderUsersTab(tabUsers, users, roles, search.value.trim());
        }
      });
      return;
    }

    const id = Number(e.target.closest("[data-id]")?.dataset.id);
    if (!id) return;
    const user = users.find(u => Number(u.id) === id);
    if (!user) return;

    if (act === "edit") {
      openUserModal({
        roles, mode:"edit", user,
        onSaved: async () => {
          users = await loadUsers(tabUsers.dataset.deleted === "1", search.value.trim());
          toast(t("userUpdated"));
          renderUsersTab(tabUsers, users, roles, search.value.trim());
        }
      });
    }

    if (act === "reset") {
      openResetModal({
        user,
        onSaved: async () => toast(t("saved"))
      });
    }

    if (act === "delete") {
      confirmModal({
        title: t("confirmDeleteUser"),
        text: `${user.ism} (${user.login})`,
        okText: t("yes"),
        cancelText: t("no"),
        onOk: async () => {
          await apiFetch(`/users/${user.id}/delete`, { method:"POST" });
          users = await loadUsers(tabUsers.dataset.deleted === "1", search.value.trim());
          toast(t("saved"));
          renderUsersTab(tabUsers, users, roles, search.value.trim());
        }
      });
    }
  });

  /* ========= Actions (Roles tab) ========= */
  tabRoles.addEventListener("click", async (e) => {
    const act = e.target.closest("[data-ract]")?.dataset.ract;
    if (!act) return;

    if (act === "reload") {
      roles = await loadRoles();
      renderRolesTab(tabRoles, roles, search.value.trim());
      toast(t("saved"));
      return;
    }

    if (act === "collapseAll") {
      tabRoles.querySelectorAll(".rolecard").forEach(c => c.classList.remove("open"));
      return;
    }

    if (act === "createRole") {
      openRoleModal({
        onSaved: async () => {
          roles = await loadRoles();
          renderRolesTab(tabRoles, roles, search.value.trim());
          toast(t("roleCreated"));
        }
      });
      return;
    }

    // open/close card
    if (act === "toggleOpen") {
      const card = e.target.closest(".rolecard");
      card.classList.toggle("open");
      return;
    }

    // chip toggle
    if (act === "chip") {
      const chip = e.target.closest(".chip");
      const code = chip.dataset.role;
      const mod = chip.dataset.mod;
      const on = chip.classList.contains("on");
      setChip(chip, !on);
      markRoleDirty(tabRoles, code, true);
      updateRoleEnabledCount(tabRoles, code);
      return;
    }

    // select all/none
    if (act === "all" || act === "none") {
      const code = e.target.closest("[data-role]")?.dataset.role;
      if (!code) return;
      const on = act === "all";
      tabRoles.querySelectorAll(`.chip[data-role="${cssEscape(code)}"]`).forEach(ch => setChip(ch, on));
      markRoleDirty(tabRoles, code, true);
      updateRoleEnabledCount(tabRoles, code);
      return;
    }

    // save role visibility
    if (act === "save") {
      const code = e.target.closest("[data-role]")?.dataset.role;
      if (!code) return;

      const visibility = {};
      MODULES.forEach(mod => {
        const ch = tabRoles.querySelector(`.chip[data-role="${cssEscape(code)}"][data-mod="${cssEscape(mod)}"]`);
        visibility[mod] = ch?.classList.contains("on") ? true : false;
      });

      await apiFetch(`/roles/${code}/visibility`, { method:"PUT", body:{ visibility } });
      markRoleDirty(tabRoles, code, false);
      toast(t("visibilitySaved"));
      return;
    }
  });

  // initial renders
  renderUsersTab(tabUsers, users, roles, "");
  renderRolesTab(tabRoles, roles, "");
}

/* ===================== USERS UI ===================== */
function renderUsersTab(host, users, roles, q) {
  const includeDeleted = host.dataset.deleted === "1";
  host.innerHTML = `
    <div class="uadm-toolbar">
      <button class="btn primary" data-uact="create">＋ ${t("createUser")}</button>
      <button class="btn" data-uact="reload">⟲ ${t("reload")}</button>
      <button class="uadm-toggle ${includeDeleted ? "on" : ""}" data-uact="toggleDeleted">
        ${includeDeleted ? t("hideDeleted") : t("showDeleted")}
      </button>
    </div>

    <div class="uadm-tablewrap">
      ${usersTableHtml(filterUsers(users, q), roles)}
    </div>
  `;
}

function usersTableHtml(users, roles) {
  const roleName = (code) => roles.find(r => r.code === code)?.name || code;

  if (!users.length) return `<div class="muted" style="padding:14px">${t("notFound")}</div>`;

  return `
    <table class="uadm-table">
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
            <td>${esc(u.id)}</td>
            <td>${esc(u.login)}</td>
            <td>${esc(u.ism)}</td>
            <td>
              <span class="uadm-badge">${esc(roleName(u.role))}</span>
              <span class="uadm-muted" style="display:none">${esc(u.role)}</span>
            </td>
            <td>
              ${u.active ? `<span class="uadm-badge on">${t("active")}</span>` : `<span class="uadm-badge off">${t("inactive")}</span>`}
            </td>
            <td>${formatTs(u.created_at)}</td>
            <td>
              <div class="uadm-actions">
                <button class="btn" data-uact="edit" data-id="${u.id}">${t("edit")}</button>
                <button class="btn" data-uact="reset" data-id="${u.id}">${t("resetPass")}</button>
                <button class="btn danger" data-uact="delete" data-id="${u.id}">${t("delete")}</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function filterUsers(users, q) {
  const qq = (q || "").trim().toLowerCase();
  if (!qq) return users;
  return users.filter(u =>
    String(u.ism||"").toLowerCase().includes(qq) ||
    String(u.login||"").toLowerCase().includes(qq) ||
    String(u.role||"").toLowerCase().includes(qq)
  );
}

/* ===================== ROLES UI ===================== */
function renderRolesTab(host, roles, q) {
  const qq = (q || "").trim().toLowerCase();
  const filtered = !qq ? roles : roles.filter(r =>
    String(r.code||"").toLowerCase().includes(qq) ||
    String(r.name||"").toLowerCase().includes(qq)
  );

  host.innerHTML = `
    <div class="uadm-toolbar">
      <button class="btn primary" data-ract="createRole">＋ ${t("createRole")}</button>
      <button class="btn" data-ract="reload">⟲ ${t("reload")}</button>
      <button class="btn" data-ract="collapseAll">▾ ${t("collapseAll")}</button>
    </div>

    <div class="rolelist">
      ${filtered.length ? filtered.map(roleCardHtml).join("") : `<div class="muted">${t("notFound")}</div>`}
    </div>
  `;

  // after render update counts and dirty labels
  filtered.forEach(r => updateRoleEnabledCount(host, r.code));
}

function roleCardHtml(role) {
  const vis = normalizeVis(role.visibility || {});
  const enabledCount = MODULES.filter(m => vis[m]).length;
  const sysTag = role.is_system ? `<span class="uadm-badge">${t("systemRole")}</span>` : `<span class="uadm-badge">${t("customRole")}</span>`;

  return `
    <div class="rolecard" data-role="${esc(role.code)}">
      <div class="rolehead">
        <div>
          <b>${esc(role.name || role.code)}</b>
          <div class="meta">${esc(role.code)} · ${sysTag}</div>
        </div>

        <div class="grow"></div>

        <span class="uadm-badge off" data-count="${esc(role.code)}">${t("modulesEnabled")}: ${enabledCount}/${MODULES.length}</span>
        <span class="uadm-badge off" data-dirty="${esc(role.code)}" style="display:none">${t("unsaved")}</span>

        <div class="right">
          <button class="btn" data-ract="toggleOpen">▾ ${t("expand")}</button>
          <button class="btn primary" data-ract="save" data-role="${esc(role.code)}">${t("saveVisibility")}</button>
        </div>
      </div>

      <div class="roledetails">
        <div class="chips">
          ${MODULES.map(mod => `
            <button class="chip ${vis[mod] ? "on" : "off"}"
                    data-ract="chip"
                    data-role="${esc(role.code)}"
                    data-mod="${esc(mod)}"
                    aria-pressed="${vis[mod] ? "true" : "false"}">
              ${esc(t(mod))}
            </button>
          `).join("")}
        </div>

        <div class="roletools">
          <button class="btn" data-ract="all" data-role="${esc(role.code)}">${t("selectAll")}</button>
          <button class="btn" data-ract="none" data-role="${esc(role.code)}">${t("selectNone")}</button>
          <div class="sp"></div>
          <span class="muted">${esc(role.code)}</span>
        </div>
      </div>
    </div>
  `;
}

/* ===================== MODALS ===================== */
function openUserModal({ mode, user, roles, onSaved }) {
  const isEdit = mode === "edit";
  const host = $("#modalHost");

  const roleOptions = roles
    .map(r => `<option value="${esc(r.code)}">${esc(r.name)} (${esc(r.code)})</option>`)
    .join("");

  host.innerHTML = `
    <div class="mb">
      <div class="m">
        <div class="mh">
          <b>${isEdit ? t("editUser") : t("createUser")}</b>
          <button class="btn" id="mClose">✕</button>
        </div>
        <div class="mbo">
          <div class="grid2">
            <div class="field">
              <div class="label">${t("name")}</div>
              <input class="input" id="mIsm" value="${esc(user?.ism || "")}" />
            </div>
            <div class="field">
              <div class="label">${t("login")}</div>
              <input class="input" id="mLogin" value="${esc(user?.login || "")}" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("role")}</div>
              <select class="input" id="mRole">${roleOptions}</select>
            </div>
            <div>
              <div class="label">${t("active")}</div>
              <button class="uadm-toggle ${user?.active === 0 ? "" : "on"}" id="mActive">${user?.active === 0 ? t("inactive") : t("active")}</button>
            </div>
          </div>

          ${isEdit ? "" : `
            <div class="field" style="margin-top:10px">
              <div class="label">${t("password")}</div>
              <input class="input" id="mPass" type="password" placeholder="${t("passwordHint")}" />
            </div>
          `}

          <div class="uadm-toolbar" style="justify-content:flex-end; margin-top:14px">
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
  host.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  $("#mRole").value = user?.role || "fin";

  let active = !(user?.active === 0);
  $("#mActive").onclick = () => {
    active = !active;
    const btn = $("#mActive");
    btn.classList.toggle("on", active);
    btn.textContent = active ? t("active") : t("inactive");
  };

  $("#mSave").onclick = async () => {
    const ism = $("#mIsm").value.trim();
    const login = $("#mLogin").value.trim();
    const role = $("#mRole").value;

    if (!ism || !login) return toast(t("error"), "name/login required", "err");

    if (!isEdit) {
      const password = $("#mPass").value;
      if (!password || password.length < 6) return toast(t("error"), t("passwordHint"), "err");
      await apiFetch("/users", { method:"POST", body:{ ism, login, password, role, active } });
    } else {
      await apiFetch(`/users/${user.id}`, { method:"PATCH", body:{ ism, login, role, active } });
    }

    close();
    await onSaved?.();
  };
}

function openResetModal({ user, onSaved }) {
  const host = $("#modalHost");
  host.innerHTML = `
    <div class="mb">
      <div class="m" style="width:min(520px, calc(100vw - 24px))">
        <div class="mh">
          <b>${t("resetPass")} — ${esc(user.login || "")}</b>
          <button class="btn" id="pClose">✕</button>
        </div>
        <div class="mbo">
          <div class="field">
            <div class="label">${t("passwordNew")}</div>
            <input class="input" id="pNew" type="password" placeholder="${t("passwordHint")}" />
          </div>
          <div class="uadm-toolbar" style="justify-content:flex-end; margin-top:14px">
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
  host.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  $("#pSave").onclick = async () => {
    const password = $("#pNew").value;
    if (!password || password.length < 6) return toast(t("error"), t("passwordHint"), "err");
    await apiFetch(`/users/${user.id}/reset-password`, { method:"POST", body:{ password } });
    close();
    await onSaved?.();
  };
}

function openRoleModal({ onSaved }) {
  const host = $("#modalHost");
  // default vis: only main+tasks on
  const vis = {};
  MODULES.forEach(m => vis[m] = (m === "main" || m === "tasks"));

  host.innerHTML = `
    <div class="mb">
      <div class="m">
        <div class="mh">
          <b>${t("createRole")}</b>
          <button class="btn" id="rClose">✕</button>
        </div>
        <div class="mbo">
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

          <div class="chips" id="rChips">
            ${MODULES.map(mod => `
              <button class="chip ${vis[mod] ? "on" : "off"}"
                      data-mod="${esc(mod)}"
                      aria-pressed="${vis[mod] ? "true" : "false"}">
                ${esc(t(mod))}
              </button>
            `).join("")}
          </div>

          <div class="roletools">
            <button class="btn" id="rAll">${t("selectAll")}</button>
            <button class="btn" id="rNone">${t("selectNone")}</button>
            <div class="sp"></div>
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
  host.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  const chipsHost = $("#rChips");
  chipsHost.onclick = (e) => {
    const chip = e.target.closest("button[data-mod]");
    if (!chip) return;
    const on = chip.classList.contains("on");
    setChip(chip, !on);
  };

  $("#rAll").onclick = () => chipsHost.querySelectorAll("button[data-mod]").forEach(ch => setChip(ch, true));
  $("#rNone").onclick = () => chipsHost.querySelectorAll("button[data-mod]").forEach(ch => setChip(ch, false));

  $("#rSave").onclick = async () => {
    const code = $("#rCode").value.trim().toLowerCase();
    const name = $("#rName").value.trim();
    if (!code || !name) return toast(t("error"), "code/name required", "err");

    const visibility = {};
    chipsHost.querySelectorAll("button[data-mod]").forEach(ch => {
      visibility[ch.dataset.mod] = ch.classList.contains("on");
    });

    // safer compatibility: create role THEN set visibility
    await apiFetch("/roles", { method:"POST", body:{ code, name } });
    await apiFetch(`/roles/${code}/visibility`, { method:"PUT", body:{ visibility } });

    close();
    await onSaved?.();
  };
}

function confirmModal({ title, text, okText, cancelText, onOk }) {
  const host = $("#modalHost");
  host.innerHTML = `
    <div class="mb">
      <div class="m" style="width:min(520px, calc(100vw - 24px))">
        <div class="mh">
          <b>${esc(title)}</b>
          <button class="btn" id="cClose">✕</button>
        </div>
        <div class="mbo">
          <div class="muted">${esc(text || "")}</div>
          <div class="uadm-toolbar" style="justify-content:flex-end; margin-top:14px">
            <button class="btn" id="cCancel">${esc(cancelText || t("cancel"))}</button>
            <button class="btn danger" id="cOk">${esc(okText || t("yes"))}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const close = () => host.innerHTML = "";
  $("#cClose").onclick = close;
  $("#cCancel").onclick = close;
  host.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  $("#cOk").onclick = async () => { close(); await onOk?.(); };
}

/* ===================== API ===================== */
async function loadRoles() {
  const data = await apiFetch("/roles", { loadingTitle:"Roles", loadingText:"Loading..." });
  const roles = data.roles || [];
  roles.forEach(r => r.visibility = normalizeVis(r.visibility || {}));
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

/* ===================== Helpers ===================== */
function normalizeVis(vis) {
  const out = {};
  MODULES.forEach(m => out[m] = !!vis[m]);
  return out;
}

function setChip(btn, on) {
  btn.classList.toggle("on", on);
  btn.classList.toggle("off", !on);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
}

function markRoleDirty(host, code, dirty) {
  const badge = host.querySelector(`[data-dirty="${cssEscape(code)}"]`);
  if (!badge) return;
  badge.style.display = dirty ? "inline-flex" : "none";
}

function updateRoleEnabledCount(host, code) {
  const countEl = host.querySelector(`[data-count="${cssEscape(code)}"]`);
  if (!countEl) return;
  const chips = host.querySelectorAll(`.chip[data-role="${cssEscape(code)}"]`);
  let on = 0;
  chips.forEach(ch => { if (ch.classList.contains("on")) on++; });
  countEl.textContent = `${t("modulesEnabled")}: ${on}/${MODULES.length}`;
}

function formatTs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "";
  const d = new Date(n * 1000);
  return new Intl.DateTimeFormat(undefined, { year:"numeric", month:"2-digit", day:"2-digit" }).format(d);
}

function debounce(fn, ms=250) {
  let tmr = null;
  return (...args) => { clearTimeout(tmr); tmr = setTimeout(() => fn(...args), ms); };
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}

function cssEscape(v) {
  return String(v ?? "").replace(/"/g, '\\"');
}
