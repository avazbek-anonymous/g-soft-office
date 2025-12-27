import { state } from "../core/state.js";
import { apiFetch } from "../core/api.js";
import { t } from "../core/i18n.js";
import * as TOAST from "../ui/toast.js";

/* =========================================================
   Projects — Pipeline Kanban + modal + go-to tasks
   GSOFT-BASE-v1:d91e2932409a
========================================================= */

const $ = (sel, el = document) => el.querySelector(sel);

function tr(key, fallback) {
  const v = t(key);
  if (!v || v === key) return fallback;
  return v;
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function notify(msg, type = "info") {
  try {
    if (TOAST.toast) return TOAST.toast(msg, type);
    if (TOAST.showToast) return TOAST.showToast(msg, type);
  } catch {}
  console[type === "error" ? "error" : "log"](msg);
}

function ensureModalHost() {
  let el = document.getElementById("modalHost");
  if (!el) {
    el = document.createElement("div");
    el.id = "modalHost";
    document.body.appendChild(el);
  }
  return el;
}

function getMe() {
  return state.me || state.user || state.session?.user || {};
}
function getRole() {
  const me = getMe();
  const r = (me.role || me.role_code || me.type || me.position || me.access || "").toString().toLowerCase();
  const rn = Number(me.role_id || me.roleId || me.role);
  if (!r && Number.isFinite(rn)) {
    if (rn === 1) return "admin";
    if (rn === 2) return "pm";
    if (rn === 3) return "fin";
  }
  return r;
}
const isAdmin = () => getRole() === "admin";
const isPM = () => getRole() === "pm";
const canCreateProject = () => isAdmin() || isPM();
const canDragProject = () => isAdmin() || isPM();
const canEditProject = () => isAdmin() || isPM();

function getField(o, ...keys) {
  for (const k of keys) {
    if (o && o[k] !== undefined && o[k] !== null && String(o[k]).trim() !== "") return o[k];
  }
  return null;
}

async function apiFirst(paths, options = {}) {
  let lastErr = null;
  for (const p of paths) {
    try { return await apiFetch(p, options); }
    catch (e) { lastErr = e; }
  }
  throw lastErr;
}
async function apiTry(paths, methods, options = {}) {
  let lastErr = null;
  for (const p of paths) {
    for (const method of methods) {
      try {
        const opts = { ...options, method };
        if (String(method).toUpperCase() === "GET") delete opts.body;
        return await apiFetch(p, opts);
      } catch (e) { lastErr = e; }
    }
  }
  throw lastErr;
}

const apiUsersList = (params) => apiFirst(
  [`/users${params ? "?" + params : ""}`, `/users/list${params ? "?" + params : ""}`, `/dict/users${params ? "?" + params : ""}`],
  { silent: true }
);
const apiClientsList = (params) => apiFirst(
  [`/clients${params ? "?" + params : ""}`, `/clients/list${params ? "?" + params : ""}`],
  { silent: true }
);
const apiProjectsList = (params) => apiFirst(
  [`/projects${params ? "?" + params : ""}`, `/projects/list${params ? "?" + params : ""}`],
  { silent: true }
);
const apiProjectGet = (id) => apiFirst([`/projects/${id}`, `/project/${id}`], { silent: true });
const apiProjectCreate = (body) => apiFirst([`/projects`, `/project`], { method: "POST", body });
const apiProjectUpdate = (id, body) => apiTry([`/projects/${id}`, `/project/${id}`], ["PATCH", "PUT", "POST"], { body });

const nowSec = () => Math.floor(Date.now() / 1000);

function toDateInputValue(v) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return String(v);
  const n = Number(v);
  if (Number.isFinite(n) && n > 0) {
    const d = new Date(n * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}
function fmtDate(v) {
  const s = toDateInputValue(v);
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}

function normProjectStatus(raw) {
  const s = String(raw || "").trim().toUpperCase();
  if (!s) return "YANGI";
  const map = {
    YANGI: "YANGI",
    NEW: "YANGI",
    TZ_BERILDI: "TZ_BERILDI",
    TAKLIF_BERILDI: "TAKLIF_BERILDI",
    PROCESS: "PROCESS",
    IN_PROGRESS: "PROCESS",
    OUTSOURCE: "OUTSOURCE",
    KEYINROQ: "KEYINROQ",
    LATER: "KEYINROQ",
    BAJARILDI: "BAJARILDI",
    DONE: "BAJARILDI",
    OTMENA: "OTMENA",
    CANCELED: "OTMENA",
    CANCELLED: "OTMENA",
  };
  return map[s] || s;
}

const PROJECT_COLS = [
  { key: "YANGI",          title: "Yangi" },
  { key: "TZ_BERILDI",     title: "Tz berildi" },
  { key: "TAKLIF_BERILDI", title: "Taklif berildi" },
  { key: "PROCESS",        title: "Process" },
  { key: "OUTSOURCE",      title: "Outsource" },
  { key: "KEYINROQ",       title: "Keyinroq" },
  { key: "BAJARILDI",      title: "Bajarildi" },
  { key: "OTMENA",         title: "Otmena" },
];

let __draggingProjectId = null;

export async function renderProjects(view) {
  ensureModalHost().innerHTML = "";
  __draggingProjectId = null;

  const ctx = { users: [], clients: [], projects: [] };

  view.innerHTML = `
    <div class="card prj">
      <div class="hd">
        <div style="display:flex; gap:10px; align-items:baseline; flex-wrap:wrap">
          <b>${t("projects")}</b>
          <span class="muted">${tr("projectsSub", "Kanban • drag • Info • O‘tish")}</span>
        </div>

        <div class="row" style="gap:8px; flex-wrap:wrap; justify-content:flex-end">
          ${canCreateProject() ? `<button class="btn primary" id="btnAdd">＋ ${tr("addProject", "Loyiha")}</button>` : ``}
          <button class="btn" id="btnReload">⟲</button>
        </div>
      </div>

      <div class="bd">
        <div class="prj-boardWrap" id="board"></div>
      </div>
    </div>

    <style>
      .prj .row{display:flex; align-items:center}
      .prj-boardWrap{
        margin-top:4px;
        display:flex;
        gap:12px;
        overflow-x:auto;
        overflow-y:hidden;
        height: calc(100vh - 210px);
        padding-bottom:10px;
      }
      .prj-boardWrap::-webkit-scrollbar{height:10px}
      .prj-boardWrap::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12); border-radius:999px}
      body[data-theme="light"] .prj-boardWrap::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12)}
      .prj-col{
        flex:0 0 340px;
        min-width:340px;
        height:100%;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.03);
        border-radius:16px;
        overflow:hidden;
        display:flex;
        flex-direction:column;
      }
      body[data-theme="light"] .prj-col{border-color:rgba(0,0,0,.10); background:rgba(0,0,0,.02)}
      .prj-colHead{
        padding:10px;
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        border-bottom:1px solid rgba(255,255,255,.08);
      }
      body[data-theme="light"] .prj-colHead{border-bottom-color:rgba(0,0,0,.08)}
      .prj-colTitle{font-weight:900; line-height:1.1}
      .prj-colCount{opacity:.7; font-size:12px}
      .prj-colBody{
        flex:1;
        min-height:0;
        padding:10px;
        display:flex;
        flex-direction:column;
        gap:10px;
        overflow:auto;
      }
      .prj-colBody.dropHint{
        outline:2px dashed rgba(34,197,94,.55);
        outline-offset:-6px;
        background:rgba(34,197,94,.06);
      }
      body[data-theme="light"] .prj-colBody.dropHint{
        outline:2px dashed rgba(14,165,233,.55);
        background:rgba(14,165,233,.06);
      }
      .prj-card{
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.18);
        border-radius:14px;
        padding:10px;
        transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
        user-select:none;
      }
      body[data-theme="light"] .prj-card{background:rgba(255,255,255,.88); border-color:rgba(0,0,0,.10)}
      .prj-card.dragging{opacity:.45; transform:scale(.98)}
      .prj-name{font-weight:1000; line-height:1.15}
      .prj-meta{margin-top:6px; display:flex; flex-wrap:wrap; gap:6px}
      .chip{
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding:3px 8px;
        border-radius:999px;
        font-size:12px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.04);
        opacity:.92;
      }
      body[data-theme="light"] .chip{border-color:rgba(0,0,0,.10); background:rgba(0,0,0,.04)}
      .prj-actions{margin-top:10px; display:flex; justify-content:flex-end; gap:8px}
      /* modal */
      .mback{
        position:fixed; inset:0;
        background:rgba(0,0,0,.55);
        backdrop-filter: blur(10px);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
        z-index:9999;
      }
      .mwin{
        width:min(980px, 100%);
        max-height:calc(100vh - 36px);
        overflow:auto;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.14);
        background: rgba(12,14,18,.98);
        box-shadow:0 26px 60px rgba(0,0,0,.45);
      }
      body[data-theme="light"] .mwin{background: rgba(255,255,255,.98); border-color:rgba(0,0,0,.12); box-shadow:0 26px 60px rgba(0,0,0,.18)}
      .mhd{
        padding:12px 14px;
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        border-bottom:1px solid rgba(255,255,255,.10);
      }
      body[data-theme="light"] .mhd{border-bottom-color:rgba(0,0,0,.10)}
      .mttl{font-weight:1000; font-size:18px; line-height:1.2}
      .mclose{cursor:pointer; opacity:.8; font-weight:900; padding:6px 10px; border-radius:12px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06)}
      body[data-theme="light"] .mclose{border-color:rgba(0,0,0,.12); background:rgba(0,0,0,.04)}
      .mbd{padding:14px}
      .mgrid{display:grid; grid-template-columns:1fr 1fr; gap:10px}
      @media(max-width:920px){ .mgrid{grid-template-columns:1fr} }
      .mrow{margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end}
      .mnote{opacity:.75; font-size:12px; margin-top:6px}
      .mwide{grid-column:1/-1}
    </style>
  `;

  const els = { board: $("#board", view), btnReload: $("#btnReload", view), btnAdd: $("#btnAdd", view) };

  async function loadDicts() {
    try {
      const [uRes, cRes] = await Promise.all([apiUsersList("limit=5000"), apiClientsList("limit=5000")]);
      ctx.users = Array.isArray(uRes) ? uRes : (uRes?.items || uRes?.data || uRes?.users || []);
      ctx.clients = Array.isArray(cRes) ? cRes : (cRes?.items || cRes?.data || cRes?.clients || []);
    } catch {
      ctx.users = [];
      ctx.clients = [];
    }
  }

  async function loadProjects() {
    try {
      const res = await apiProjectsList("limit=5000");
      const items = Array.isArray(res) ? res : (res?.items || res?.data || res?.projects || []);
      ctx.projects = (items || []).map(p => ({ ...p, status: normProjectStatus(getField(p, "status")) }));
    } catch {
      ctx.projects = [];
      notify(tr("loadProjectsFailed", "Loyihalar yuklanmadi"), "error");
    }
  }

  function userNameById(id) {
    const u = ctx.users.find(x => String(x.id) === String(id));
    return u ? (u.ism || u.name || u.full_name || u.fullName || "") : "";
  }
  function clientNameById(id) {
    const c = ctx.clients.find(x => String(x.id) === String(id));
    return c ? (c.name || c.company || c.company_name || c.title || "") : "";
  }

  function renderBoard() {
    const by = {};
    PROJECT_COLS.forEach(c => by[c.key] = []);
    for (const p of ctx.projects) {
      const st = normProjectStatus(getField(p, "status"));
      (by[st] ||= []).push(p);
    }

    els.board.innerHTML = PROJECT_COLS.map(c => {
      const cnt = (by[c.key] || []).length;
      return `
        <div class="prj-col">
          <div class="prj-colHead">
            <div class="prj-colTitle">${esc(c.title)}</div>
            <div class="prj-colCount">${cnt}</div>
          </div>
          <div class="prj-colBody" data-drop="${esc(c.key)}"></div>
        </div>
      `;
    }).join("");

    PROJECT_COLS.forEach(c => {
      const body = els.board.querySelector(`.prj-colBody[data-drop="${c.key}"]`);
      const list = [...(by[c.key] || [])].sort((a,b)=>{
        const ad = toDateInputValue(getField(a, "deadline", "due_date", "dueDate"));
        const bd = toDateInputValue(getField(b, "deadline", "due_date", "dueDate"));
        if (ad && bd) return ad.localeCompare(bd);
        if (ad && !bd) return -1;
        if (!ad && bd) return 1;
        return String(getField(a, "name", "title") || "").localeCompare(String(getField(b, "name", "title") || ""));
      });
      body.innerHTML = list.map(renderProjectCard).join("");
    });

    bindBoardEvents();
  }

  function renderProjectCard(p) {
    const id = String(p.id);
    const name = String(getField(p, "name", "title", "project_name") || ("#" + id));
    const owner = String(getField(p, "owner_name", "owner") || "");
    const product = String(getField(p, "product", "service", "product_type") || "");
    const pmId = String(getField(p, "pm_id", "pmId", "otv_pm_id", "otvId") || "");
    const pmName = pmId ? (p.pm_name || userNameById(pmId)) : "";
    const ddl = toDateInputValue(getField(p, "deadline", "due_date", "dueDate"));
    const clientId = String(getField(p, "client_id", "clientId") || "");
    const clientName = clientId ? (p.client_name || clientNameById(clientId)) : "";

    const chips = [];
    if (clientName) chips.push(`<span class="chip">🏷 ${esc(clientName)}</span>`);
    if (owner) chips.push(`<span class="chip">👤 ${esc(owner)}</span>`);
    if (product) chips.push(`<span class="chip">📦 ${esc(product)}</span>`);
    if (pmName) chips.push(`<span class="chip">🧭 ${esc(pmName)}</span>`);
    if (ddl) chips.push(`<span class="chip">⏳ ${esc(fmtDate(ddl))}</span>`);
    if (isAdmin()) {
      const amount = String(getField(p, "amount", "sum", "price") || "").trim();
      if (amount) chips.push(`<span class="chip">💰 ${esc(amount)}</span>`);
    }

    return `
      <div class="prj-card" data-id="${esc(id)}" ${canDragProject() ? `draggable="true"` : ""}>
        <div class="prj-name">${esc(name)}</div>
        <div class="prj-meta">${chips.join("")}</div>
        <div class="prj-actions">
          <button class="btn" data-info="${esc(id)}">${tr("info", "Info")}</button>
          <button class="btn primary" data-go="${esc(id)}">${tr("go", "O‘tish")}</button>
        </div>
      </div>
    `;
  }

  async function saveProjectChanges(projectId, patch) {
    try {
      const res = await apiProjectUpdate(projectId, patch);
      const updated = res?.project || res?.item || res?.data || res;
      if (updated && updated.id) {
        const idx = ctx.projects.findIndex(x => String(x.id) === String(updated.id));
        if (idx >= 0) ctx.projects[idx] = { ...ctx.projects[idx], ...updated, status: normProjectStatus(getField(updated, "status")) };
      } else await loadProjects();
      renderBoard();
      return true;
    } catch {
      notify(tr("saveFailed", "Saqlashda xatolik"), "error");
      await loadProjects();
      renderBoard();
      return false;
    }
  }

  async function moveProject(projectId, toStatus) {
    const to = normProjectStatus(toStatus);
    await saveProjectChanges(projectId, { status: to, updated_at: nowSec(), updatedAt: nowSec() });
  }

  function bindBoardEvents() {
    // actions
    els.board.querySelectorAll("[data-go]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-go");
        location.hash = `#/tasks?projectId=${encodeURIComponent(id)}`;
      });
    });

    els.board.querySelectorAll("[data-info]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-info");
        await openProjectModal(id);
      });
    });

    // drag
    els.board.querySelectorAll(".prj-card").forEach(card => {
      const id = card.getAttribute("data-id");
      if (card.getAttribute("draggable") === "true") {
        card.addEventListener("dragstart", (e) => {
          __draggingProjectId = id;
          card.classList.add("dragging");
          try {
            e.dataTransfer.setData("text/plain", id);
            e.dataTransfer.effectAllowed = "move";
          } catch {}
        });
        card.addEventListener("dragend", () => {
          card.classList.remove("dragging");
          __draggingProjectId = null;
        });
      }
    });

    els.board.querySelectorAll(".prj-colBody").forEach(col => {
      const to = col.getAttribute("data-drop");
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("dropHint"); });
      col.addEventListener("dragleave", () => col.classList.remove("dropHint"));
      col.addEventListener("drop", async (e) => {
        e.preventDefault();
        col.classList.remove("dropHint");
        if (!canDragProject()) return;
        const id = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || __draggingProjectId;
        if (!id) return;
        await moveProject(id, to);
      });
    });
  }

  async function openProjectModal(projectId) {
    const host = ensureModalHost();
    const id = String(projectId);
    let p = ctx.projects.find(x => String(x.id) === id);

    try {
      const res = await apiProjectGet(id);
      const fresh = res?.project || res?.item || res?.data || res;
      if (fresh && fresh.id) {
        const idx = ctx.projects.findIndex(x => String(x.id) === String(fresh.id));
        if (idx >= 0) ctx.projects[idx] = { ...ctx.projects[idx], ...fresh, status: normProjectStatus(getField(fresh, "status")) };
        p = ctx.projects.find(x => String(x.id) === id);
      }
    } catch {}

    if (!p) return;

    const editable = canEditProject();
    const name = String(getField(p, "name", "title", "project_name") || "");
    const owner = String(getField(p, "owner_name", "owner") || "");
    const phone = String(getField(p, "owner_phone", "phone", "tel") || "");
    const sphere = String(getField(p, "sphere", "biznes", "industry") || "");
    const source = String(getField(p, "source", "source_id", "sourceId") || "");
    const city = String(getField(p, "city", "city_id", "cityId") || "");
    const comment = String(getField(p, "comment", "note") || "");
    const product = String(getField(p, "product", "service", "product_type") || "");
    const pmId = String(getField(p, "pm_id", "pmId", "otv_pm_id") || "");
    const ddl = toDateInputValue(getField(p, "deadline", "due_date", "dueDate"));
    const clientId = String(getField(p, "client_id", "clientId") || "");
    const amount = String(getField(p, "amount", "sum", "price") || "");

    host.innerHTML = `
      <div class="mback" id="mback">
        <div class="mwin" role="dialog" aria-modal="true">
          <div class="mhd">
            <div>
              <div class="mttl">${esc(name || ("#" + id))}</div>
              <div class="mnote">${tr("editInModal", "Info oynasida tahrirlash")}</div>
            </div>
            <div class="mclose" id="mclose">✕</div>
          </div>

          <div class="mbd">
            <div class="mgrid">
              <div class="field">
                <div class="label">${tr("projectName", "Loyiha nomi")}</div>
                <input class="input" id="mName" value="${esc(name)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("deadline", "Deadline")}</div>
                <input type="date" class="input" id="mDeadline" value="${esc(ddl)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("client", "Klient")}</div>
                <select class="input" id="mClient" ${editable ? "" : "disabled"}>
                  <option value="">${esc(tr("noClient", "Bog‘lanmagan"))}</option>
                  ${ctx.clients.map(c => `<option value="${esc(String(c.id))}">${esc(c.name || c.company || c.company_name || c.title || ("#" + c.id))}</option>`).join("")}
                </select>
              </div>

              <div class="field">
                <div class="label">${tr("owner", "Vlaidelец")}</div>
                <input class="input" id="mOwner" value="${esc(owner)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("phone", "Telefon")}</div>
                <input class="input" id="mPhone" value="${esc(phone)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("sphere", "Sfera")}</div>
                <input class="input" id="mSphere" value="${esc(sphere)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("source", "Manba")}</div>
                <input class="input" id="mSource" value="${esc(source)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("city", "Shahar")}</div>
                <input class="input" id="mCity" value="${esc(city)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("product", "Mahsulot/xizmat")}</div>
                <input class="input" id="mProduct" value="${esc(product)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("pm", "PM (otv)")}</div>
                <select class="input" id="mPM" ${editable ? "" : "disabled"}>
                  <option value="">-</option>
                  ${ctx.users.map(u => `<option value="${esc(String(u.id))}">${esc(u.ism || u.name || ("#" + u.id))}</option>`).join("")}
                </select>
              </div>

              ${isAdmin() ? `
                <div class="field">
                  <div class="label">${tr("amount", "Summa (faqat admin)")}</div>
                  <input class="input" id="mAmount" value="${esc(amount)}" ${editable ? "" : "disabled"} />
                </div>
              ` : ``}

              <div class="field mwide">
                <div class="label">${tr("comment", "Komment")}</div>
                <textarea class="input" id="mComment" rows="4" ${editable ? "" : "disabled"}>${esc(comment)}</textarea>
              </div>
            </div>

            <div class="mrow">
              <button class="btn" id="mGo">${tr("go", "O‘tish")}</button>
              <button class="btn primary" id="mSave" ${editable ? "" : "disabled"}>${t("save")}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    $("#mClient", host).value = clientId || "";
    $("#mPM", host).value = pmId || "";

    const close = () => { host.innerHTML = ""; };
    $("#mclose", host).addEventListener("click", close);
    $("#mback", host).addEventListener("click", (e) => { if (e.target.id === "mback") close(); });

    $("#mGo", host).addEventListener("click", () => {
      location.hash = `#/tasks?projectId=${encodeURIComponent(id)}`;
      close();
    });

    $("#mSave", host).addEventListener("click", async () => {
      const patch = {
        name: $("#mName", host).value.trim(),
        title: $("#mName", host).value.trim(),
        deadline: $("#mDeadline", host).value,
        due_date: $("#mDeadline", host).value,
        client_id: $("#mClient", host).value.trim(),
        clientId: $("#mClient", host).value.trim(),
        owner_name: $("#mOwner", host).value.trim(),
        owner: $("#mOwner", host).value.trim(),
        owner_phone: $("#mPhone", host).value.trim(),
        phone: $("#mPhone", host).value.trim(),
        sphere: $("#mSphere", host).value.trim(),
        source: $("#mSource", host).value.trim(),
        city: $("#mCity", host).value.trim(),
        product: $("#mProduct", host).value.trim(),
        service: $("#mProduct", host).value.trim(),
        pm_id: $("#mPM", host).value.trim(),
        pmId: $("#mPM", host).value.trim(),
        comment: $("#mComment", host).value.trim(),
        note: $("#mComment", host).value.trim(),
        updated_at: nowSec(),
        updatedAt: nowSec(),
      };
      if (isAdmin()) {
        const a = ($("#mAmount", host)?.value || "").trim();
        patch.amount = a;
        patch.sum = a;
      }
      await saveProjectChanges(id, patch);
      close();
    });
  }

  async function openCreateProject() {
    const host = ensureModalHost();
    const me = getMe();

    host.innerHTML = `
      <div class="mback" id="cback">
        <div class="mwin">
          <div class="mhd">
            <div>
              <div class="mttl">${tr("newProject", "Yangi loyiha")}</div>
              <div class="mnote">${tr("fillFields", "Maydonlarni to‘ldiring")}</div>
            </div>
            <div class="mclose" id="cclose">✕</div>
          </div>

          <div class="mbd">
            <div class="mgrid">
              <div class="field">
                <div class="label">${tr("projectName", "Loyiha nomi")}</div>
                <input class="input" id="cName" />
              </div>
              <div class="field">
                <div class="label">${tr("deadline", "Deadline")}</div>
                <input type="date" class="input" id="cDeadline" />
              </div>

              <div class="field">
                <div class="label">${tr("client", "Klient")}</div>
                <select class="input" id="cClient">
                  <option value="">${esc(tr("noClient", "Bog‘lanmagan"))}</option>
                  ${ctx.clients.map(c => `<option value="${esc(String(c.id))}">${esc(c.name || c.company || c.company_name || c.title || ("#" + c.id))}</option>`).join("")}
                </select>
              </div>

              <div class="field">
                <div class="label">${tr("pm", "PM (otv)")}</div>
                <select class="input" id="cPM">
                  <option value="${esc(String(me.id || ""))}">${esc(me.ism || me.name || "Me")}</option>
                  ${ctx.users.map(u => `<option value="${esc(String(u.id))}">${esc(u.ism || u.name || ("#" + u.id))}</option>`).join("")}
                </select>
              </div>

              <div class="field">
                <div class="label">${tr("owner", "Vlaidelец")}</div>
                <input class="input" id="cOwner" />
              </div>

              <div class="field">
                <div class="label">${tr("phone", "Telefon")}</div>
                <input class="input" id="cPhone" />
              </div>

              <div class="field">
                <div class="label">${tr("product", "Mahsulot/xizmat")}</div>
                <input class="input" id="cProduct" placeholder="Fin model / System / TZ / ..." />
              </div>

              ${isAdmin() ? `
                <div class="field">
                  <div class="label">${tr("amount", "Summa (faqat admin)")}</div>
                  <input class="input" id="cAmount" />
                </div>
              ` : ``}

              <div class="field mwide">
                <div class="label">${tr("comment", "Komment")}</div>
                <textarea class="input" id="cComment" rows="3"></textarea>
              </div>
            </div>

            <div class="mrow">
              <button class="btn" id="cCancel">${t("cancel")}</button>
              <button class="btn primary" id="cCreate">${tr("create", "Yaratish")}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => { host.innerHTML = ""; };
    $("#cclose", host).addEventListener("click", close);
    $("#cCancel", host).addEventListener("click", close);
    $("#cback", host).addEventListener("click", (e) => { if (e.target.id === "cback") close(); });

    $("#cCreate", host).addEventListener("click", async () => {
      const name = $("#cName", host).value.trim();
      if (!name) {
        notify(tr("needName", "Nomi kerak"), "error");
        return;
      }

      const body = {
        name,
        title: name,
        status: "YANGI",
        deadline: $("#cDeadline", host).value,
        due_date: $("#cDeadline", host).value,
        client_id: $("#cClient", host).value.trim(),
        clientId: $("#cClient", host).value.trim(),
        pm_id: $("#cPM", host).value.trim(),
        pmId: $("#cPM", host).value.trim(),
        owner_name: $("#cOwner", host).value.trim(),
        owner: $("#cOwner", host).value.trim(),
        owner_phone: $("#cPhone", host).value.trim(),
        phone: $("#cPhone", host).value.trim(),
        product: $("#cProduct", host).value.trim(),
        service: $("#cProduct", host).value.trim(),
        comment: $("#cComment", host).value.trim(),
        note: $("#cComment", host).value.trim(),
        created_at: nowSec(),
        createdAt: nowSec(),
        updated_at: nowSec(),
        updatedAt: nowSec(),
      };
      if (isAdmin()) {
        const a = ($("#cAmount", host)?.value || "").trim();
        body.amount = a;
        body.sum = a;
      }

      try {
        await apiProjectCreate(body);
        close();
        await loadProjects();
        renderBoard();
        notify(tr("created", "Yaratildi"), "success");
      } catch {
        notify(tr("createFailed", "Yaratib bo‘lmadi"), "error");
      }
    });
  }

  els.btnReload.addEventListener("click", async () => {
    await loadDicts();
    await loadProjects();
    renderBoard();
  });

  if (els.btnAdd) els.btnAdd.addEventListener("click", openCreateProject);

  await loadDicts();
  await loadProjects();
  renderBoard();
}
