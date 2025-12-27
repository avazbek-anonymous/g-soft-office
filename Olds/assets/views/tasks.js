import { state } from "../core/state.js";
import { apiFetch } from "../core/api.js";
import { t } from "../core/i18n.js";
import * as TOAST from "../ui/toast.js";

/* =========================================================
   Tasks — Kanban + modal + timer
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

function debounce(fn, ms = 250) {
  let tt = null;
  return (...a) => {
    clearTimeout(tt);
    tt = setTimeout(() => fn(...a), ms);
  };
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

function parseHashQuery() {
  const h = location.hash || "";
  const q = h.split("?")[1] || "";
  const obj = {};
  q.split("&").forEach((p) => {
    if (!p) return;
    const [k, v] = p.split("=");
    obj[decodeURIComponent(k)] = decodeURIComponent(v || "");
  });
  return obj;
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

const canSeeUserFilter = () => isAdmin();
const canSeeAssignee = () => isAdmin() || isPM();
const canCreateTask = () => isAdmin() || isPM() || getRole() === "fin";
const canEditAnyTask = () => isAdmin() || isPM();

function getField(o, ...keys) {
  for (const k of keys) {
    if (o && o[k] !== undefined && o[k] !== null && String(o[k]).trim() !== "") return o[k];
  }
  return null;
}

function normTaskStatus(raw) {
  const s = String(raw || "").trim().toUpperCase();
  if (!s) return "BOSHLANMAGAN";
  const map = {
    BOSHLANMAGAN: "BOSHLANMAGAN",
    NEW: "BOSHLANMAGAN",
    NOT_STARTED: "BOSHLANMAGAN",

    PAUZA: "PAUZA",
    PAUSE: "PAUZA",
    PAUSED: "PAUZA",

    JARAYONDA: "JARAYONDA",
    IN_PROGRESS: "JARAYONDA",
    PROCESS: "JARAYONDA",

    BAJARILDI: "BAJARILDI",
    DONE: "BAJARILDI",

    OTMENA: "OTMENA",
    CANCELED: "OTMENA",
    CANCELLED: "OTMENA",
  };
  return map[s] || s;
}

const TASK_COLS = [
  { key: "BOSHLANMAGAN", title: "Boshlanmagan", hint: "0 vaqt" },
  { key: "PAUZA",        title: "Pauza",        hint: "to‘xtatilgan" },
  { key: "JARAYONDA",    title: "Jarayonda",    hint: "1 ta vazifa" },
  { key: "BAJARILDI",    title: "Bajarildi",    hint: "✅" },
  { key: "OTMENA",       title: "Otmena",       hint: "❌" },
];

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
const apiProjectsList = (params) => apiFirst(
  [`/projects${params ? "?" + params : ""}`, `/projects/list${params ? "?" + params : ""}`],
  { silent: true }
);
const apiTasksList = (params) => apiFirst(
  [`/tasks${params ? "?" + params : ""}`, `/tasks/list${params ? "?" + params : ""}`],
  { silent: true }
);
const apiTaskGet = (id) => apiFirst([`/tasks/${id}`, `/task/${id}`], { silent: true });
const apiTaskCreate = (body) => apiFirst([`/tasks`, `/task`], { method: "POST", body });
const apiTaskUpdate = (id, body) => apiTry([`/tasks/${id}`, `/task/${id}`], ["PATCH", "PUT", "POST"], { body });

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
function fmtTs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "";
  const d = new Date(n * 1000);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  }).format(d);
}
function baseSpentSec(task) {
  const sec = Number(getField(task, "spent_sec", "spentSec"));
  if (Number.isFinite(sec) && sec >= 0) return sec;
  const min = Number(getField(task, "spent_min", "spentMin"));
  if (Number.isFinite(min) && min >= 0) return Math.round(min * 60);
  return 0;
}
function startedAtSec(task) {
  const st = Number(getField(task, "started_at", "startedAt"));
  return Number.isFinite(st) && st > 0 ? st : 0;
}
function effectiveSpentSec(task) {
  let sec = baseSpentSec(task);
  const st = startedAtSec(task);
  if (normTaskStatus(getField(task, "status")) === "JARAYONDA" && st > 0) sec += Math.max(0, nowSec() - st);
  return sec;
}
function fmtDur(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function isOverdue(task) {
  const d = toDateInputValue(getField(task, "deadline", "due_date", "dueDate"));
  if (!d) return false;
  const end = new Date(d + "T23:59:59");
  return end.getTime() < Date.now();
}

function deriveTitle(task) {
  const title = String(getField(task, "title", "name") || "").trim();
  if (title) return title;
  const desc = String(getField(task, "description", "desc", "text") || "").trim().replace(/\s+/g, " ");
  if (!desc) return tr("noTitle", "Nomsiz");
  return desc.split(" ").slice(0, 3).join(" ") + (desc.split(" ").length > 3 ? "…" : "");
}

function taskAssigneeId(task) {
  return String(getField(task, "assignee_id", "assigneeId", "user_id", "userId", "otv_id", "otvId") || "");
}
function taskProjectId(task) {
  const v = getField(task, "project_id", "projectId");
  return v === null ? "" : String(v || "");
}

let __tick = null;
let __draggingTaskId = null;

export async function renderTasks(view) {
  if (__tick) clearInterval(__tick);
  __tick = null;
  __draggingTaskId = null;

  const modalHost = ensureModalHost();
  modalHost.innerHTML = "";

  const q = parseHashQuery();
  const me = getMe();

  const ctx = {
    users: [],
    projects: [],
    tasks: [],
    filter_user_id: canSeeUserFilter() ? (q.userId || "") : String(me.id || ""),
    filter_project_id: (q.projectId !== undefined ? String(q.projectId) : "none"),
    search: "",
    limit: 100,
    offset: 0,
    total: null,
  };

  view.innerHTML = `
    <div class="card tsk">
      <div class="hd">
        <div style="display:flex; gap:10px; align-items:baseline; flex-wrap:wrap">
          <b>${t("tasks")}</b>
          <span class="muted">${tr("tasksSub", "Kanban • drag & timer")}</span>
        </div>
        <div class="row" style="gap:8px; flex-wrap:wrap; justify-content:flex-end">
          ${canCreateTask() ? `<button class="btn primary" id="btnAdd">＋ ${tr("addTask", "Vazifa")}</button>` : ``}
          <button class="btn" id="btnReload">⟲</button>
        </div>
      </div>

      <div class="bd">
        <div class="tsk-filters">
          ${canSeeUserFilter() ? `
            <div class="field">
              <div class="label">${tr("user", "User")}</div>
              <select class="input" id="fUser"></select>
            </div>
          ` : ``}

          <div class="field">
            <div class="label">${t("project")}</div>
            <select class="input" id="fProject"></select>
          </div>

          <div class="field tsk-search">
            <div class="label">${t("search")}</div>
            <input class="input" id="fQ" placeholder="${tr("searchTasksPh", "Vazifa / izoh")}..." />
          </div>

          <div class="sp"></div>
          <button class="btn" id="btnClear">${t("clear")}</button>
        </div>

        <div class="tsk-boardWrap" id="board"></div>
        <div class="tsk-pager" id="pager"></div>
      </div>
    </div>

    <style>
      .tsk .row{display:flex; align-items:center}
      .tsk-filters{
        margin-top:10px;
        display:flex;
        gap:10px;
        align-items:flex-end;
        flex-wrap:wrap;
        padding:10px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:16px;
        background:rgba(255,255,255,.02);
      }
      body[data-theme="light"] .tsk-filters{border-color:rgba(0,0,0,.10); background:rgba(0,0,0,.02)}
      .tsk-filters .sp{flex:1}
      .tsk-search{min-width:260px; max-width:420px}
      @media(max-width:920px){ .tsk-search{min-width:180px; max-width:100%} }

      .tsk-boardWrap{
        margin-top:12px;
        display:flex;
        gap:12px;
        overflow-x:auto;
        overflow-y:hidden;
        height: calc(100vh - 320px);
        padding-bottom:10px;
      }
      @media(max-width:920px){ .tsk-boardWrap{height: calc(100vh - 300px)} }
      .tsk-boardWrap::-webkit-scrollbar{height:10px}
      .tsk-boardWrap::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12); border-radius:999px}
      body[data-theme="light"] .tsk-boardWrap::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12)}

      .tsk-col{
        flex:0 0 330px;
        min-width:330px;
        height:100%;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.03);
        border-radius:16px;
        overflow:hidden;
        display:flex;
        flex-direction:column;
      }
      body[data-theme="light"] .tsk-col{border-color:rgba(0,0,0,.10); background:rgba(0,0,0,.02)}
      .tsk-colHead{
        padding:10px;
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        border-bottom:1px solid rgba(255,255,255,.08);
      }
      body[data-theme="light"] .tsk-colHead{border-bottom-color:rgba(0,0,0,.08)}
      .tsk-colTitle{font-weight:900; line-height:1.1}
      .tsk-colHint{opacity:.7; font-size:12px; margin-top:2px}
      .tsk-colCount{opacity:.7; font-size:12px}
      .tsk-colBody{
        flex:1;
        min-height:0;
        padding:10px;
        display:flex;
        flex-direction:column;
        gap:10px;
        overflow:auto;
      }
      .tsk-colBody.dropHint{
        outline:2px dashed rgba(34,197,94,.55);
        outline-offset:-6px;
        background:rgba(34,197,94,.06);
      }
      body[data-theme="light"] .tsk-colBody.dropHint{
        outline:2px dashed rgba(14,165,233,.55);
        background:rgba(14,165,233,.06);
      }

      .tsk-card{
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.18);
        border-radius:14px;
        padding:10px;
        cursor:pointer;
        transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
        user-select:none;
      }
      body[data-theme="light"] .tsk-card{background:rgba(255,255,255,.85); border-color:rgba(0,0,0,.10)}
      .tsk-card:hover{transform:translateY(-1px); box-shadow:0 10px 24px rgba(0,0,0,.25)}
      body[data-theme="light"] .tsk-card:hover{box-shadow:0 10px 24px rgba(0,0,0,.12)}
      .tsk-card.dragging{opacity:.45; transform:scale(.98)}
      .tsk-title{font-weight:900; line-height:1.15}
      .tsk-meta{margin-top:6px; display:flex; flex-wrap:wrap; gap:6px}
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
      .chip.bad{border-color:rgba(239,68,68,.55); background:rgba(239,68,68,.10)}
      .tsk-foot{margin-top:8px; display:flex; justify-content:space-between; gap:8px; font-size:12px; opacity:.8}
      .tsk-reason{margin-top:8px; font-size:12px; opacity:.85; padding:8px; border-radius:12px; background:rgba(239,68,68,.10); border:1px solid rgba(239,68,68,.25)}
      .tsk-timer{font-variant-numeric:tabular-nums; font-weight:900}

      .tsk-pager{
        margin-top:12px;
        display:flex;
        align-items:center;
        justify-content:flex-end;
        gap:6px;
        flex-wrap:wrap;
      }
      .tsk-pager .pbtn{
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.04);
        padding:6px 10px;
        border-radius:12px;
        cursor:pointer;
        font-weight:800;
        opacity:.9;
      }
      body[data-theme="light"] .tsk-pager .pbtn{border-color:rgba(0,0,0,.12); background:rgba(0,0,0,.04)}
      .tsk-pager .pbtn.active{outline:2px solid rgba(34,197,94,.45)}
      body[data-theme="light"] .tsk-pager .pbtn.active{outline:2px solid rgba(14,165,233,.45)}

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
        width:min(860px, 100%);
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
      .mgrid{
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap:10px;
      }
      @media(max-width:820px){ .mgrid{grid-template-columns:1fr} }
      .mrow{margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end}
      .mstat{display:flex; gap:8px; flex-wrap:wrap; align-items:center}
    </style>
  `;

  const els = {
    board: $("#board", view),
    pager: $("#pager", view),
    fUser: canSeeUserFilter() ? $("#fUser", view) : null,
    fProject: $("#fProject", view),
    fQ: $("#fQ", view),
    btnClear: $("#btnClear", view),
    btnReload: $("#btnReload", view),
    btnAdd: $("#btnAdd", view),
  };

  async function loadDicts() {
    try {
      const [uRes, pRes] = await Promise.all([
        apiUsersList("limit=5000"),
        apiProjectsList("limit=5000"),
      ]);
      ctx.users = Array.isArray(uRes) ? uRes : (uRes?.items || uRes?.data || uRes?.users || []);
      ctx.projects = Array.isArray(pRes) ? pRes : (pRes?.items || pRes?.data || pRes?.projects || []);
    } catch {
      ctx.users = [];
      ctx.projects = [];
      notify(tr("loadFailed", "Yuklashda xatolik"), "error");
    }
  }

  function fillFilters() {
    if (els.fUser) {
      els.fUser.innerHTML = `<option value="">${tr("all", "Barchasi")}</option>` + ctx.users.map(u => {
        const id = String(u.id);
        const name = esc(u.ism || u.name || u.full_name || u.fullName || ("#" + id));
        return `<option value="${esc(id)}">${name}</option>`;
      }).join("");
      els.fUser.value = ctx.filter_user_id || "";
    }

    const noneLabel = tr("noProject", "Без проекта");
    els.fProject.innerHTML = `<option value="none">${esc(noneLabel)}</option>` + ctx.projects.map(p => {
      const id = String(p.id);
      const nm = esc(p.name || p.title || p.project_name || ("#" + id));
      return `<option value="${esc(id)}">${nm}</option>`;
    }).join("");
    els.fProject.value = ctx.filter_project_id ?? "none";

    els.fQ.value = ctx.search || "";
  }

  function buildTasksQuery() {
    const params = new URLSearchParams();
    params.set("limit", String(ctx.limit));
    params.set("offset", String(ctx.offset));

    const pid = ctx.filter_project_id;
    if (pid === "none") params.set("project_id", "");
    else if (pid) params.set("project_id", pid);

    const uid = ctx.filter_user_id;
    if (uid) params.set("user_id", uid);

    if (ctx.search) params.set("q", ctx.search);

    return params.toString();
  }

  async function loadTasks() {
    try {
      const res = await apiTasksList(buildTasksQuery());
      const items = Array.isArray(res) ? res : (res?.items || res?.data || res?.tasks || []);
      ctx.total = Number(res?.total ?? res?.count ?? null);
      ctx.tasks = (items || []).map((x) => ({ ...x, status: normTaskStatus(getField(x, "status")) }));
    } catch {
      ctx.tasks = [];
      ctx.total = null;
      notify(tr("loadTasksFailed", "Vazifalar yuklanmadi"), "error");
    }
  }

  function projectNameById(pid) {
    return String(ctx.projects.find(p => String(p.id) === String(pid))?.name || "");
  }
  function userNameById(uid) {
    const u = ctx.users.find(x => String(x.id) === String(uid));
    return u ? (u.ism || u.name || u.full_name || u.fullName || "") : "";
  }

  function canDrag(task) {
    const st = normTaskStatus(getField(task, "status"));
    if (!["BOSHLANMAGAN", "PAUZA", "JARAYONDA", "BAJARILDI", "OTMENA"].includes(st)) return false;
    if (canEditAnyTask()) return true;
    const myId = String(getMe().id || "");
    return myId && taskAssigneeId(task) === myId;
  }

  function sortTasks(list) {
    return [...list].sort((a, b) => {
      const ad = toDateInputValue(getField(a, "deadline", "due_date", "dueDate"));
      const bd = toDateInputValue(getField(b, "deadline", "due_date", "dueDate"));
      if (ad && bd) return ad.localeCompare(bd);
      if (ad && !bd) return -1;
      if (!ad && bd) return 1;
      const au = Number(getField(a, "updated_at", "updatedAt")) || 0;
      const bu = Number(getField(b, "updated_at", "updatedAt")) || 0;
      return bu - au;
    });
  }

  function renderBoard() {
    const byStatus = {};
    TASK_COLS.forEach(c => byStatus[c.key] = []);
    for (const task of ctx.tasks) {
      const st = normTaskStatus(getField(task, "status"));
      (byStatus[st] ||= []).push(task);
    }

    els.board.innerHTML = TASK_COLS.map(c => {
      const cnt = (byStatus[c.key] || []).length;
      return `
        <div class="tsk-col" data-col="${esc(c.key)}">
          <div class="tsk-colHead">
            <div>
              <div class="tsk-colTitle">${esc(c.title)}</div>
              <div class="tsk-colHint">${esc(c.hint || "")}</div>
            </div>
            <div class="tsk-colCount">${cnt}</div>
          </div>
          <div class="tsk-colBody" data-drop="${esc(c.key)}"></div>
        </div>
      `;
    }).join("");

    TASK_COLS.forEach(c => {
      const body = els.board.querySelector(`.tsk-colBody[data-drop="${c.key}"]`);
      const list = sortTasks(byStatus[c.key] || []);
      body.innerHTML = list.map(renderTaskCard).join("");
    });

    bindBoardEvents();
    startTick();
  }

  function renderTaskCard(task) {
    const id = String(task.id);
    const title = deriveTitle(task);
    const pid = taskProjectId(task);
    const pName = pid ? (task.project_name || projectNameById(pid)) : "";
    const deadline = toDateInputValue(getField(task, "deadline", "due_date", "dueDate"));
    const assId = taskAssigneeId(task);
    const assName = assId ? (task.assignee_name || userNameById(assId)) : "";
    const spent = fmtDur(effectiveSpentSec(task));
    const updated = fmtTs(getField(task, "updated_at", "updatedAt"));
    const st = normTaskStatus(getField(task, "status"));
    const reason = String(getField(task, "cancel_reason", "cancelReason", "sabab") || "").trim();

    const chips = [];
    if (pName) chips.push(`<span class="chip">📌 ${esc(pName)}</span>`);
    if (deadline) chips.push(`<span class="chip ${isOverdue(task) ? "bad" : ""}">⏳ ${esc(fmtDate(deadline))}</span>`);
    if (canSeeAssignee() && assName) chips.push(`<span class="chip">👤 ${esc(assName)}</span>`);

    return `
      <div class="tsk-card" data-id="${esc(id)}" ${canDrag(task) ? `draggable="true"` : ""}>
        <div class="tsk-title">${esc(title)}</div>
        <div class="tsk-meta">${chips.join("")}</div>

        <div class="tsk-foot">
          <div>⏱ <span class="${st === "JARAYONDA" ? "tsk-timer" : ""}" data-timer="${esc(id)}">${esc(spent)}</span></div>
          <div>${updated ? "✎ " + esc(updated) : ""}</div>
        </div>

        ${st === "OTMENA" && reason ? `<div class="tsk-reason"><b>${tr("reason", "Sabab")}:</b> ${esc(reason)}</div>` : ``}
      </div>
    `;
  }

  async function saveTaskChanges(taskId, patch) {
    try {
      const res = await apiTaskUpdate(taskId, patch);
      const updated = res?.task || res?.item || res?.data || res;
      if (updated && updated.id) {
        const idx = ctx.tasks.findIndex(x => String(x.id) === String(updated.id));
        if (idx >= 0) ctx.tasks[idx] = { ...ctx.tasks[idx], ...updated, status: normTaskStatus(getField(updated, "status")) };
      } else {
        await loadTasks();
      }
      renderBoard();
      renderPager();
      return true;
    } catch {
      notify(tr("saveFailed", "Saqlashda xatolik"), "error");
      await loadTasks();
      renderBoard();
      renderPager();
      return false;
    }
  }

  function buildTimePatchForStop(task, finalStatus, extra = {}) {
    const st = startedAtSec(task);
    const base = baseSpentSec(task);
    const add = (st > 0) ? Math.max(0, nowSec() - st) : 0;
    const total = base + add;
    return {
      status: finalStatus,
      started_at: 0,
      startedAt: 0,
      spent_sec: total,
      spentSec: total,
      spent_min: Math.round(total / 60),
      spentMin: Math.round(total / 60),
      updated_at: nowSec(),
      updatedAt: nowSec(),
      ...extra
    };
  }

  async function startTaskForUser(task, userId) {
    const uid = String(userId || "");
    if (!uid) return false;

    // pause other in-progress task for this user (client-side safeguard)
    const other = ctx.tasks.find(x =>
      String(x.id) !== String(task.id) &&
      normTaskStatus(getField(x, "status")) === "JARAYONDA" &&
      taskAssigneeId(x) === uid
    );
    if (other) {
      await saveTaskChanges(other.id, buildTimePatchForStop(other, "PAUZA"));
    }

    const patch = {
      status: "JARAYONDA",
      started_at: nowSec(),
      startedAt: nowSec(),
      assignee_id: uid,
      user_id: uid,
      updated_at: nowSec(),
      updatedAt: nowSec(),
      auto_pause_others: true
    };
    return await saveTaskChanges(task.id, patch);
  }

  async function moveTask(taskId, toStatus) {
    const task = ctx.tasks.find(x => String(x.id) === String(taskId));
    if (!task) return;

    const from = normTaskStatus(getField(task, "status"));
    const to = String(toStatus).toUpperCase();

    const allowed =
      (to === "JARAYONDA" && (from === "BOSHLANMAGAN" || from === "PAUZA")) ||
      (to === "PAUZA" && (from === "JARAYONDA" || from === "BAJARILDI" || from === "OTMENA"));

    if (!allowed) return;

    if (to === "JARAYONDA") {
      const uid = canSeeUserFilter()
        ? (ctx.filter_user_id || taskAssigneeId(task) || String(getMe().id || ""))
        : String(getMe().id || "");
      await startTaskForUser(task, uid);
      return;
    }

    if (to === "PAUZA" && from === "JARAYONDA") {
      await saveTaskChanges(task.id, buildTimePatchForStop(task, "PAUZA"));
      return;
    }

    await saveTaskChanges(task.id, { status: "PAUZA", updated_at: nowSec(), updatedAt: nowSec(), cancel_reason: "" });
  }

  function bindBoardEvents() {
    els.board.querySelectorAll(".tsk-card").forEach(card => {
      const id = card.getAttribute("data-id");

      card.addEventListener("click", () => {
        if (__draggingTaskId) return;
        openTaskModal(id);
      });

      if (card.getAttribute("draggable") === "true") {
        card.addEventListener("dragstart", (e) => {
          __draggingTaskId = id;
          card.classList.add("dragging");
          try {
            e.dataTransfer.setData("text/plain", id);
            e.dataTransfer.effectAllowed = "move";
          } catch {}
        });
        card.addEventListener("dragend", () => {
          card.classList.remove("dragging");
          __draggingTaskId = null;
        });
      }
    });

    els.board.querySelectorAll(".tsk-colBody").forEach(col => {
      const to = col.getAttribute("data-drop");
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("dropHint"); });
      col.addEventListener("dragleave", () => col.classList.remove("dropHint"));
      col.addEventListener("drop", async (e) => {
        e.preventDefault();
        col.classList.remove("dropHint");
        const tid = (e.dataTransfer && e.dataTransfer.getData("text/plain")) || __draggingTaskId;
        if (!tid) return;
        await moveTask(tid, to);
      });
    });
  }

  function startTick() {
    if (__tick) clearInterval(__tick);
    __tick = setInterval(() => {
      ctx.tasks.forEach(task => {
        if (normTaskStatus(getField(task, "status")) !== "JARAYONDA") return;
        const id = String(task.id);
        const el = document.querySelector(`[data-timer="${CSS.escape(id)}"]`);
        if (el) el.textContent = fmtDur(effectiveSpentSec(task));
        const m = document.querySelector(`[data-mtimer="${CSS.escape(id)}"]`);
        if (m) m.textContent = fmtDur(effectiveSpentSec(task));
      });
    }, 1000);
  }

  function renderPager() {
    const total = ctx.total;
    const limit = ctx.limit;
    const offset = ctx.offset;

    const page = Math.floor(offset / limit) + 1;
    const pages = total ? Math.max(1, Math.ceil(total / limit)) : null;

    const btn = (label, off, active = false, disabled = false) => `
      <button class="pbtn ${active ? "active" : ""}" ${disabled ? "disabled" : ""} data-off="${off}">${esc(label)}</button>
    `;

    if (!pages && ctx.tasks.length < limit && offset === 0) {
      els.pager.innerHTML = "";
      return;
    }

    let html = "";
    const prevOff = Math.max(0, offset - limit);
    html += btn("←", prevOff, false, offset === 0);

    if (pages) {
      const start = Math.max(1, page - 2);
      const end = Math.min(pages, page + 2);
      for (let p = start; p <= end; p++) html += btn(String(p), (p - 1) * limit, p === page);
      const nextOff = Math.min((pages - 1) * limit, offset + limit);
      html += btn("→", nextOff, false, page === pages);
    } else {
      html += btn(String(page), offset, true);
      if (ctx.tasks.length === limit) html += btn(tr("next100", "Keyingi 100 →"), offset + limit, false, false);
    }

    els.pager.innerHTML = html;
    els.pager.querySelectorAll(".pbtn").forEach(b => {
      b.addEventListener("click", async () => {
        const off = Number(b.getAttribute("data-off"));
        if (!Number.isFinite(off) || off === ctx.offset) return;
        ctx.offset = off;
        await loadTasks();
        renderBoard();
        renderPager();
      });
    });
  }

  async function openTaskModal(taskId) {
    const host = ensureModalHost();
    const id = String(taskId);
    let task = ctx.tasks.find(x => String(x.id) === id);

    try {
      const res = await apiTaskGet(id);
      const fresh = res?.task || res?.item || res?.data || res;
      if (fresh && fresh.id) {
        const idx = ctx.tasks.findIndex(x => String(x.id) === String(fresh.id));
        if (idx >= 0) ctx.tasks[idx] = { ...ctx.tasks[idx], ...fresh, status: normTaskStatus(getField(fresh, "status")) };
        task = ctx.tasks.find(x => String(x.id) === id);
      }
    } catch {}

    if (!task) return;

    const st = normTaskStatus(getField(task, "status"));
    const pid = taskProjectId(task);
    const pName = pid ? (task.project_name || projectNameById(pid)) : "";
    const deadline = toDateInputValue(getField(task, "deadline", "due_date", "dueDate"));
    const assId = taskAssigneeId(task) || String(getMe().id || "");
    const assName = assId ? (task.assignee_name || userNameById(assId)) : "";
    const reason = String(getField(task, "cancel_reason", "cancelReason", "sabab") || "").trim();

    const editable = true; // UI: allow editing, server validates

    host.innerHTML = `
      <div class="mback" id="mback">
        <div class="mwin" role="dialog" aria-modal="true">
          <div class="mhd">
            <div>
              <div class="mttl">${esc(deriveTitle(task))}</div>
              <div class="muted" style="margin-top:4px">${pName ? "📌 " + esc(pName) : esc(tr("noProjectSmall", "Без проекта"))}</div>
            </div>
            <div class="mclose" id="mclose">✕</div>
          </div>

          <div class="mbd">
            <div class="mgrid">
              <div class="field">
                <div class="label">${tr("taskTitle", "Nomi")}</div>
                <input class="input" id="mTitle" value="${esc(String(getField(task, "title", "name") || ""))}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field">
                <div class="label">${tr("deadline", "Deadline")}</div>
                <input type="date" class="input" id="mDeadline" value="${esc(deadline)}" ${editable ? "" : "disabled"} />
              </div>

              <div class="field" style="grid-column:1/-1">
                <div class="label">${tr("description", "Tavsif")}</div>
                <textarea class="input" id="mDesc" rows="5" ${editable ? "" : "disabled"}>${esc(String(getField(task, "description", "desc", "text") || ""))}</textarea>
              </div>

              <div class="field">
                <div class="label">${t("project")}</div>
                <select class="input" id="mProject">
                  <option value="">${esc(tr("noProject", "Без проекта"))}</option>
                  ${ctx.projects.map(p => `<option value="${esc(String(p.id))}">${esc(p.name || p.title || ("#" + p.id))}</option>`).join("")}
                </select>
              </div>

              <div class="field">
                <div class="label">${tr("assignee", "Otv")}</div>
                ${canSeeAssignee() ? `
                  <select class="input" id="mAssignee">
                    ${ctx.users.map(u => `<option value="${esc(String(u.id))}">${esc(u.ism || u.name || ("#" + u.id))}</option>`).join("")}
                  </select>
                ` : `<div class="input" style="display:flex;align-items:center">${esc(assName || "-")}</div>`}
              </div>

              <div class="field">
                <div class="label">${tr("spentTime", "Potrachennoe")}</div>
                <div class="input" style="display:flex;align-items:center;gap:10px">
                  <span class="tsk-timer" data-mtimer="${esc(id)}">${esc(fmtDur(effectiveSpentSec(task)))}</span>
                  ${st === "JARAYONDA" ? `<span class="chip">${esc(tr("timerRunning", "Jarayonda"))}</span>` : ``}
                </div>
              </div>

              <div class="field">
                <div class="label">${tr("lastChanged", "Oxirgi o'zgarish")}</div>
                <div class="input" style="display:flex;align-items:center">${esc(fmtTs(getField(task, "updated_at", "updatedAt")) || "-")}</div>
              </div>
            </div>

            ${st === "OTMENA" && reason ? `<div class="tsk-reason" style="margin-top:12px"><b>${tr("reason", "Sabab")}:</b> ${esc(reason)}</div>` : ``}

            <div class="mrow">
              <div class="mstat" style="margin-right:auto">
                <span class="chip">${esc(st)}</span>
                ${deadline ? `<span class="chip ${isOverdue(task) ? "bad" : ""}">⏳ ${esc(fmtDate(deadline))}</span>` : ``}
              </div>

              ${renderModalActions(task)}
              <button class="btn primary" id="mSave">${t("save")}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    $("#mProject", host).value = pid || "";
    const mAss = $("#mAssignee", host);
    if (mAss) mAss.value = assId || "";

    const close = () => { host.innerHTML = ""; };
    $("#mclose", host).addEventListener("click", close);
    $("#mback", host).addEventListener("click", (e) => { if (e.target.id === "mback") close(); });

    bindModalActions(task, close);

    $("#mSave", host).addEventListener("click", async () => {
      const title = $("#mTitle", host).value.trim();
      const desc = $("#mDesc", host).value.trim();
      const ddl = $("#mDeadline", host).value;
      const projVal = ($("#mProject", host)?.value || "").trim();
      const asVal = ($("#mAssignee", host)?.value || assId || "").trim();

      const patch = {
        title,
        name: title,
        description: desc,
        desc,
        deadline: ddl,
        due_date: ddl,
        project_id: projVal,
        projectId: projVal,
        assignee_id: asVal,
        assigneeId: asVal,
        user_id: asVal,
        userId: asVal,
        updated_at: nowSec(),
        updatedAt: nowSec(),
      };

      await saveTaskChanges(id, patch);
      close();
    });
  }

  function renderModalActions(task) {
    const st = normTaskStatus(getField(task, "status"));
    const parts = [];

    if (st === "BOSHLANMAGAN" || st === "PAUZA") {
      parts.push(`<button class="btn" id="mStart">${tr("start", "Start")}</button>`);
      parts.push(`<button class="btn warn" id="mCancel">${tr("cancel", "Otmena")}</button>`);
      parts.push(`<button class="btn success" id="mDone">${tr("done", "Bajarildi")}</button>`);
    } else if (st === "JARAYONDA") {
      parts.push(`<button class="btn" id="mPause">${tr("pause", "Pauza")}</button>`);
      parts.push(`<button class="btn warn" id="mCancel">${tr("cancel", "Otmena")}</button>`);
      parts.push(`<button class="btn success" id="mDone">${tr("done", "Bajarildi")}</button>`);
    } else if (st === "BAJARILDI" || st === "OTMENA") {
      if (isAdmin() || isPM()) parts.push(`<button class="btn" id="mReturn">${tr("returnTask", "Vazifani qaytarish")}</button>`);
    }
    return parts.join("");
  }

  function bindModalActions(task, close) {
    const host = ensureModalHost();
    const id = String(task.id);

    const startBtn = $("#mStart", host);
    if (startBtn) startBtn.addEventListener("click", async () => {
      const uid = canSeeUserFilter()
        ? (ctx.filter_user_id || taskAssigneeId(task) || String(getMe().id || ""))
        : String(getMe().id || "");
      await startTaskForUser(task, uid);
      close();
    });

    const pauseBtn = $("#mPause", host);
    if (pauseBtn) pauseBtn.addEventListener("click", async () => {
      const tsk = ctx.tasks.find(x => String(x.id) === id) || task;
      await saveTaskChanges(id, buildTimePatchForStop(tsk, "PAUZA"));
      close();
    });

    const doneBtn = $("#mDone", host);
    if (doneBtn) doneBtn.addEventListener("click", async () => {
      const tsk = ctx.tasks.find(x => String(x.id) === id) || task;
      const st = normTaskStatus(getField(tsk, "status"));
      if (st === "JARAYONDA") await saveTaskChanges(id, buildTimePatchForStop(tsk, "BAJARILDI"));
      else await saveTaskChanges(id, { status: "BAJARILDI", updated_at: nowSec(), updatedAt: nowSec(), cancel_reason: "" });
      close();
    });

    const cancelBtn = $("#mCancel", host);
    if (cancelBtn) cancelBtn.addEventListener("click", async () => {
      const sabab = prompt(tr("cancelReasonPrompt", "Sababini yozing:")) || "";
      const reason = sabab.trim();
      if (!reason) return;
      const tsk = ctx.tasks.find(x => String(x.id) === id) || task;
      const st = normTaskStatus(getField(tsk, "status"));
      if (st === "JARAYONDA") await saveTaskChanges(id, buildTimePatchForStop(tsk, "OTMENA", { cancel_reason: reason, sabab: reason }));
      else await saveTaskChanges(id, { status: "OTMENA", cancel_reason: reason, sabab: reason, updated_at: nowSec(), updatedAt: nowSec() });
      close();
    });

    const retBtn = $("#mReturn", host);
    if (retBtn) retBtn.addEventListener("click", async () => {
      await saveTaskChanges(id, { status: "PAUZA", cancel_reason: "", updated_at: nowSec(), updatedAt: nowSec() });
      close();
    });
  }

  async function openCreateTask() {
    const me = getMe();
    const host = ensureModalHost();

    const defaultAssignee = String(ctx.filter_user_id || me.id || "");
    const defaultProject = (ctx.filter_project_id && ctx.filter_project_id !== "none") ? ctx.filter_project_id : "";

    host.innerHTML = `
      <div class="mback" id="cback">
        <div class="mwin">
          <div class="mhd">
            <div>
              <div class="mttl">${tr("newTask", "Yangi vazifa")}</div>
              <div class="muted" style="margin-top:4px">${tr("fillFields", "Maydonlarni to‘ldiring")}</div>
            </div>
            <div class="mclose" id="cclose">✕</div>
          </div>

          <div class="mbd">
            <div class="mgrid">
              <div class="field">
                <div class="label">${tr("taskTitle", "Nomi")}</div>
                <input class="input" id="cTitle" placeholder="${tr("optional", "ixtiyoriy")}" />
              </div>
              <div class="field">
                <div class="label">${tr("deadline", "Deadline")}</div>
                <input type="date" class="input" id="cDeadline" />
              </div>
              <div class="field" style="grid-column:1/-1">
                <div class="label">${tr("description", "Tavsif")}</div>
                <textarea class="input" id="cDesc" rows="5" placeholder="${tr("descPh", "Vazifa haqida yozing...")}"></textarea>
              </div>
              <div class="field">
                <div class="label">${t("project")}</div>
                <select class="input" id="cProject">
                  <option value="">${esc(tr("noProject", "Без проекта"))}</option>
                  ${ctx.projects.map(p => `<option value="${esc(String(p.id))}">${esc(p.name || p.title || ("#" + p.id))}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <div class="label">${tr("assignee", "Otv")}</div>
                ${canSeeAssignee() ? `
                  <select class="input" id="cAssignee">
                    ${ctx.users.map(u => `<option value="${esc(String(u.id))}">${esc(u.ism || u.name || ("#" + u.id))}</option>`).join("")}
                  </select>
                ` : `<div class="input" style="display:flex;align-items:center">${esc(me.ism || me.name || "")}</div>`}
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

    $("#cProject", host).value = defaultProject;
    const assSel = $("#cAssignee", host);
    if (assSel) assSel.value = defaultAssignee;

    const close = () => { host.innerHTML = ""; };
    $("#cclose", host).addEventListener("click", close);
    $("#cCancel", host).addEventListener("click", close);
    $("#cback", host).addEventListener("click", (e) => { if (e.target.id === "cback") close(); });

    $("#cCreate", host).addEventListener("click", async () => {
      const title = $("#cTitle", host).value.trim();
      const desc = $("#cDesc", host).value.trim();
      const ddl = $("#cDeadline", host).value;
      const pid = ($("#cProject", host).value || "").trim();
      const aid = ($("#cAssignee", host)?.value || String(me.id || "")).trim();

      if (!desc && !title) {
        notify(tr("needDescOrTitle", "Kamida nom yoki tavsif bo‘lsin"), "error");
        return;
      }

      const body = {
        title,
        name: title,
        description: desc,
        desc,
        deadline: ddl,
        due_date: ddl,
        project_id: pid,
        projectId: pid,
        assignee_id: aid,
        assigneeId: aid,
        user_id: aid,
        userId: aid,
        status: "BOSHLANMAGAN",
        spent_sec: 0,
        spent_min: 0,
        created_at: nowSec(),
        createdAt: nowSec(),
        updated_at: nowSec(),
        updatedAt: nowSec(),
      };

      try {
        await apiTaskCreate(body);
        close();
        ctx.offset = 0;
        await loadTasks();
        renderBoard();
        renderPager();
        notify(tr("created", "Yaratildi"), "success");
      } catch {
        notify(tr("createFailed", "Yaratib bo‘lmadi"), "error");
      }
    });
  }

  // filters
  if (els.fUser) {
    els.fUser.addEventListener("change", async () => {
      ctx.filter_user_id = els.fUser.value;
      ctx.offset = 0;
      await loadTasks();
      renderBoard();
      renderPager();
    });
  }
  els.fProject.addEventListener("change", async () => {
    ctx.filter_project_id = els.fProject.value;
    ctx.offset = 0;
    await loadTasks();
    renderBoard();
    renderPager();
  });
  els.fQ.addEventListener("input", debounce(async () => {
    ctx.search = els.fQ.value.trim();
    ctx.offset = 0;
    await loadTasks();
    renderBoard();
    renderPager();
  }, 300));

  els.btnClear.addEventListener("click", async () => {
    ctx.search = "";
    els.fQ.value = "";
    ctx.offset = 0;
    ctx.filter_project_id = "none";
    els.fProject.value = "none";
    if (els.fUser) { ctx.filter_user_id = ""; els.fUser.value = ""; }
    await loadTasks();
    renderBoard();
    renderPager();
  });

  els.btnReload.addEventListener("click", async () => {
    await loadDicts();
    fillFilters();
    await loadTasks();
    renderBoard();
    renderPager();
  });

  if (els.btnAdd) els.btnAdd.addEventListener("click", openCreateTask);

  // init
  await loadDicts();
  fillFilters();
  await loadTasks();
  renderBoard();
  renderPager();
}
