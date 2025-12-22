import { t } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";

export async function renderUsers(view) {
  view.innerHTML = `
    <div class="card">
      <div class="hd">
        <b>${t("users")}</b>
        <span class="muted">${t("adminOnly")}</span>
      </div>
      <div class="bd">
        <div class="row">
          <button class="btn primary" id="btnUsersReload">⟲ ${t("reload")}</button>
          <button class="btn" id="btnUserAdd">＋ ${t("addUser")}</button>
          <div class="field" style="margin-left:auto; min-width:220px">
            <input class="input" id="uSearch" placeholder="${t("search")}..." />
          </div>
        </div>

        <div id="usersTable" style="margin-top:12px"></div>
      </div>
    </div>
  `;

  const load = async () => {
    const box = document.getElementById("usersTable");
    box.innerHTML = `<div class="muted">${t("loadingTitle")}</div>`;

    const data = await apiFetch("/users", { loadingTitle:"Users", loadingText:"Loading..." });
    const users = data.users || [];

    box.innerHTML = tableHtml(users);

    document.getElementById("uSearch").oninput = (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = users.filter(u =>
        String(u.ism||"").toLowerCase().includes(q) ||
        String(u.login||"").toLowerCase().includes(q) ||
        String(u.role||"").toLowerCase().includes(q)
      );
      box.innerHTML = tableHtml(filtered);
    };
  };

  document.getElementById("btnUsersReload").onclick = load;
  document.getElementById("btnUserAdd").onclick = () => toast(t("soon"), "User modal next step");
  await load();
}

function tableHtml(users) {
  if (!users.length) return `<div class="muted">${t("notFound")}</div>`;

  return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>${t("login")}</th>
          <th>${t("name")}</th>
          <th>${t("role")}</th>
          <th>${t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>${escapeHtml(u.id)}</td>
            <td>${escapeHtml(u.login)}</td>
            <td>${escapeHtml(u.ism)}</td>
            <td>${escapeHtml(u.role)}</td>
            <td class="row" style="gap:6px">
              <button class="btn">${t("edit")}</button>
              <button class="btn">${t("resetPass")}</button>
              <button class="btn danger">${t("delete")}</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
