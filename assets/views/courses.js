import { state } from "../core/state.js";
import { apiFetch } from "../core/api.js";
import { t } from "../core/i18n.js";
import * as TOAST from "../ui/toast.js";

/* =========================
   Utils
========================= */
const $ = (sel, el = document) => el.querySelector(sel);

function ensureModalHost() {
  let el = document.getElementById("modalHost");
  if (!el) {
    el = document.createElement("div");
    el.id = "modalHost";
    document.body.appendChild(el);
  }
  return el;
}

const tr = (key, fallback) => {
  const v = t(key);
  if (!v || v === key) return fallback;
  return v;
};

const notify = (msg, type = "info") => {
  try {
    if (TOAST.toast) return TOAST.toast(msg, type);
    if (TOAST.showToast) return TOAST.showToast(msg, type);
    if (TOAST.default) return TOAST.default(msg, type);
  } catch {}
  console[type === "error" ? "error" : "log"](msg);
};

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[m]));
}

function debounce(fn, ms = 250) {
  let tt = null;
  return (...a) => {
    clearTimeout(tt);
    tt = setTimeout(() => fn(...a), ms);
  };
}

function formatTs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "";
  const d = new Date(n * 1000);
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function pick(dictArr, id, field = "name") {
  const x = (dictArr || []).find((z) => Number(z.id) === Number(id));
  return x ? x[field] : "";
}

function errText(e, fallback = "") {
  if (!e) return fallback;
  if (typeof e === "string") return e;
  if (e?.message) return e.message;
  if (e?.error) return e.error;
  try { return JSON.stringify(e); } catch {}
  return fallback || String(e);
}

/* =========================
   i18n auto rerender (same idea)
========================= */
function getLangToken() {
  const htmlLang = document.documentElement?.getAttribute?.("lang") || "";
  const bodyLang = document.body?.getAttribute?.("data-lang") || "";
  const bodyLang2 = document.body?.getAttribute?.("lang") || "";
  let sample = "";
  try { sample = t("courses"); } catch {}
  return `${htmlLang}|${bodyLang}|${bodyLang2}|${sample}`;
}

function bindLangAutoRerender(view, rerender) {
  try { if (view.__crsLangCleanup) view.__crsLangCleanup(); } catch {}
  if (!view || typeof rerender !== "function") return;

  let last = getLangToken();
  let scheduled = false;

  const safeRerender = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      if (!document.body.contains(view)) return;
      const now = getLangToken();
      if (now === last) return;
      last = now;
      rerender();
    }, 0);
  };

  const events = [
    "gsoft:lang",
    "gsoft:language",
    "gsoft:langChanged",
    "i18n:change",
    "i18n:changed",
    "languagechange",
  ];
  events.forEach((ev) => window.addEventListener(ev, safeRerender));

  const obs = new MutationObserver(() => safeRerender());
  try {
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-lang", "lang"] });
  } catch {}

  const iv = setInterval(() => {
    if (!document.body.contains(view)) { try { clearInterval(iv); } catch {} return; }
    const now = getLangToken();
    if (now !== last) {
      last = now;
      rerender();
    }
  }, 900);

  view.__crsLangCleanup = () => {
    try { clearInterval(iv); } catch {}
    events.forEach((ev) => window.removeEventListener(ev, safeRerender));
    try { obs.disconnect(); } catch {}
  };
}

/* =========================
   Statuses
========================= */
const LEAD_STATUSES = ["new", "contacted", "planned", "paid", "studying", "finished", "canceled"];
const ENROLL_STATUSES = ["planned", "paid", "studying", "finished", "canceled"];

function normLeadStatus(st) {
  const s = String(st || "").trim().toLowerCase() || "new";
  if (s === "lost") return "canceled"; // в worker есть "lost", но в UI нет колонки
  if (LEAD_STATUSES.includes(s)) return s;
  return "new";
}

function leadStatusLabel(st) {
  const s = normLeadStatus(st);
  if (s === "new") return tr("statusNew", "new");
  if (s === "contacted") return tr("statusContacted", "contacted");
  if (s === "planned") return tr("statusPlanned", "planned");
  if (s === "paid") return tr("statusPaid", "paid");
  if (s === "studying") return tr("statusStudying", "studying");
  if (s === "finished") return tr("statusFinished", "finished");
  if (s === "canceled") return tr("statusCanceled", "canceled");
  return s;
}

/* =========================
   API — align with Worker
   (важно: без GET /courses/:id)
========================= */
const apiLeadsList = (params) =>
  apiFetch(`/courses${params ? "?" + params : ""}`, { silent: true });

const apiLeadCreate = (body) =>
  apiFetch(`/courses`, { method: "POST", body });

const apiLeadUpdate = (id, body) =>
  apiFetch(`/courses/${id}`, { method: "PATCH", body });

const apiLeadDelete = (id) =>
  apiFetch(`/courses/${id}/delete`, { method: "POST", body: {} });

const apiEnrollList = (leadId) =>
  apiFetch(`/courses/${leadId}/enrollments`, { silent: true });

const apiEnrollCreate = (leadId, body) =>
  apiFetch(`/courses/${leadId}/enrollments`, { method: "POST", body });

const apiEnrollUpdate = (id, body) =>
  apiFetch(`/courses/enrollments/${id}`, { method: "PATCH", body });

const apiCatalogList = () =>
  apiFetch(`/courses/catalog`, { silent: true });

const apiCatalogCreate = (body) =>
  apiFetch(`/courses/catalog`, { method: "POST", body });

const apiCatalogUpdate = (id, body) =>
  apiFetch(`/courses/catalog/${id}`, { method: "PATCH", body });

const apiCatalogToggle = (id) =>
  apiFetch(`/courses/catalog/${id}/toggle`, { method: "POST", body: {} });

/* =========================
   Dict preload + companies
========================= */
async function preloadDict() {
  state.dict = state.dict || {};
  const needCities = !Array.isArray(state.dict.cities);
  const needSources = !Array.isArray(state.dict.sources);
  if (!needCities && !needSources) return;

  const [cities, sources] = await Promise.all([
    apiFetch("/dict/cities", { silent: true }).catch(() => ({ items: [] })),
    apiFetch("/dict/sources", { silent: true }).catch(() => ({ items: [] })),
  ]);

  state.dict.cities = cities.items || [];
  state.dict.sources = sources.items || [];
}

const apiClientsList = (params) =>
  apiFetch(`/clients${params ? "?" + params : ""}`, { silent: true });

async function ensureClientCompanies(force = false) {
  state.dict = state.dict || {};
  if (!force && Array.isArray(state.dict.client_companies) && state.dict.client_companies.length) {
    return state.dict.client_companies;
  }

  try {
    const r = await apiClientsList("limit=2000");
    const list = r.clients || r.items || r.rows || [];
    const set = new Set();
    for (const c of list) {
      const name = (c.company_name || c.company || c.name || c.title || "").toString().trim();
      if (name) set.add(name);
    }
    state.dict.client_companies = Array.from(set).sort((a, b) => a.localeCompare(b));
  } catch {
    state.dict.client_companies = [];
  }
  return state.dict.client_companies;
}

function fillSelect(sel, arr, allowEmpty = true) {
  const options = (arr || [])
    .slice()
    .filter((x) => x.active !== 0)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    .map((x) => `<option value="${x.id}">${esc(x.name)}</option>`)
    .join("");
  sel.innerHTML = `${allowEmpty ? `<option value="">—</option>` : ""}${options}`;
}

function fillStatusSelect(sel, allowEmpty = false) {
  const opts = LEAD_STATUSES.map((s) => [s, leadStatusLabel(s)]);
  sel.innerHTML =
    `${allowEmpty ? `<option value="">${tr("all", "All")}</option>` : ""}` +
    opts.map(([v, lbl]) => `<option value="${esc(v)}">${esc(lbl)}</option>`).join("");
}

/* =========================
   Page
========================= */
export async function renderCourses(view) {
  bindLangAutoRerender(view, () => renderCourses(view));

  view.innerHTML = `
    <div class="card crs">
      <div class="hd">
        <b>${t("courses")}</b>
        <span class="muted">${tr("coursesLeads", "Leads")}</span>
      </div>
      <div class="bd">
        <div class="crs-tabs">
          <div class="seg" id="seg">
            <button class="seg-btn active" data-tab="leads">${tr("leads", "Leads")}</button>
            <button class="seg-btn" data-tab="catalog">${tr("catalog", "Catalog")}</button>
          </div>
        </div>
        <div id="tabHost"></div>
      </div>
    </div>

    <style>
      .crs-tabs{display:flex; align-items:center; justify-content:space-between; margin-bottom:10px}
      .seg{display:inline-flex; gap:6px; padding:6px; border-radius:14px; border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.02)}
      body[data-theme="light"] .seg{border-color:rgba(0,0,0,.10); background:rgba(0,0,0,.02)}
      .seg-btn{
        border:1px solid transparent;
        background:transparent;
        color:inherit;
        padding:8px 12px;
        border-radius:12px;
        cursor:pointer;
        opacity:.85;
        font-weight:600;
        font-size:13px;
      }
      .seg-btn.active{
        opacity:1;
        border-color:rgba(34,197,94,.35);
        background:rgba(34,197,94,.10);
      }

      .crs-top{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
      .crs-search{margin-left:auto; min-width:280px; max-width:420px}
      @media(max-width:920px){ .crs-search{min-width:180px} }

      .crs-filters{
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
      body[data-theme="light"] .crs-filters{border-color:rgba(0,0,0,.10); background:rgba(0,0,0,.02)}
      .crs-sp{flex:1}

      /* ===== Leads Kanban ===== */
      .crs-boardWrap{
        margin-top:12px;
        display:flex;
        gap:12px;
        overflow-x:auto;
        overflow-y:hidden;
        height: calc(100vh - 320px);
        padding-bottom:10px;
      }
      @media(max-width:920px){ .crs-boardWrap{height: calc(100vh - 280px)} }
      .crs-boardWrap::-webkit-scrollbar{height:10px}
      .crs-boardWrap::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12); border-radius:999px}
      body[data-theme="light"] .crs-boardWrap::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12)}

      .crs-col{
        flex:0 0 310px;
        min-width:310px;
        height:100%;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.03);
        border-radius:16px;
        overflow:hidden;
        display:flex;
        flex-direction:column;
      }
      body[data-theme="light"] .crs-col{border-color:rgba(0,0,0,.10); background:rgba(0,0,0,.02)}
      .crs-colHead{
        padding:10px 10px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        border-bottom:1px solid rgba(255,255,255,.08);
        font-weight:900;
      }
      body[data-theme="light"] .crs-colHead{border-bottom-color:rgba(0,0,0,.08)}
      .crs-colBody{
        flex:1;
        min-height:0;
        padding:10px;
        display:flex;
        flex-direction:column;
        gap:10px;
        overflow:auto;
      }
      .crs-colBody.dropHint{
        outline:2px dashed rgba(34,197,94,.55);
        outline-offset:-6px;
        background:rgba(34,197,94,.06);
      }

      .crs-card{
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.18);
        border-radius:14px;
        padding:10px;
        cursor:pointer;
        transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
        user-select:none;
      }
      body[data-theme="light"] .crs-card{background:rgba(0,0,0,.03); border-color:rgba(0,0,0,.10)}
      .crs-card:hover{transform: translateY(-2px); box-shadow:0 14px 40px rgba(0,0,0,.18)}
      .crs-card.dragging{opacity:.55; transform: rotate(1deg) scale(.99)}
      .crs-card.is-del{opacity:.55; cursor:default}

      .crs-cardTop{display:flex; align-items:flex-start; justify-content:space-between; gap:10px}
      .crs-title{font-weight:900; line-height:1.2}
      .crs-sub{margin-top:4px; opacity:.75; font-size:12px}
      .crs-meta{margin-top:8px; display:flex; gap:6px; flex-wrap:wrap; align-items:center}
      .crs-chip{
        display:inline-flex; align-items:center; gap:6px;
        padding:4px 8px; border-radius:999px;
        font-size:12px; border:1px solid rgba(255,255,255,.12); opacity:.92;
      }
      body[data-theme="light"] .crs-chip{border-color:rgba(0,0,0,.12)}

      .crs-actions{display:flex; flex-wrap:nowrap; gap:8px; justify-content:flex-end}
      .btn.icon{
        width:36px; height:36px;
        padding:0;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border-radius:12px;
      }
      .btn.icon .ico img{
        width:20px; height:20px; display:block;
        opacity:.95;
        filter: invert(1);
      }
      .btn.icon.danger{border-color: rgba(239,68,68,.35); background: rgba(239,68,68,.12)}
      body[data-theme="light"] .btn.icon .ico img{filter:none}

      /* table wrap */
      .crs-tablewrap{
        margin-top:12px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.10);
        overflow:auto;
        max-height: calc(100vh - 320px);
      }
      body[data-theme="light"] .crs-tablewrap{border-color:rgba(0,0,0,.10)}
      table.crs-t{width:100%; border-collapse:collapse; min-width:980px}
      .crs-t th,.crs-t td{padding:12px; border-bottom:1px solid rgba(255,255,255,.08); text-align:left; vertical-align:middle}
      body[data-theme="light"] .crs-t th, body[data-theme="light"] .crs-t td{border-bottom-color:rgba(0,0,0,.08)}
      .crs-t thead th{
        font-size:12px; opacity:.75;
        position:sticky; top:0; z-index:2;
        background:rgba(10,14,25,.85);
        backdrop-filter: blur(10px);
      }
      body[data-theme="light"] .crs-t thead th{background:rgba(255,255,255,.85)}

      .badge{
        display:inline-flex; align-items:center; gap:6px;
        padding:4px 10px; border-radius:999px;
        font-size:12px; border:1px solid rgba(255,255,255,.12);
        opacity:.9;
      }
      body[data-theme="light"] .badge{border-color:rgba(0,0,0,.12)}
      .badge.del{background:rgba(239,68,68,.14); border-color:rgba(239,68,68,.35)}
      .badge.st{background:rgba(59,130,246,.10); border-color:rgba(59,130,246,.25)}
      .badge.ok{background:rgba(34,197,94,.10); border-color:rgba(34,197,94,.25)}

      /* Modal */
      .mb{position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:9999}
      .m{width:min(980px, calc(100vw - 24px)); background:var(--bg, #0b1020); border:1px solid rgba(255,255,255,.12); border-radius:16px; overflow:hidden}
      body[data-theme="light"] .m{background:#fff; border-color: rgba(0,0,0,.12)}
      .mh{display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08)}
      body[data-theme="light"] .mh{border-bottom-color: rgba(0,0,0,.08)}
      .mbo{padding:14px}
      .grid2{display:grid; grid-template-columns:1fr 1fr; gap:10px}
      @media (max-width: 900px){ .grid2{grid-template-columns:1fr} }
      textarea.input{min-height:90px; resize:vertical}
      .sec{margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,.08)}
      body[data-theme="light"] .sec{border-top-color:rgba(0,0,0,.08)}
      .row{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
      .row.right{justify-content:flex-end}
      .mini{font-size:12px; opacity:.75}
      .k{opacity:.7; font-size:12px}
    </style>
  `;

  ensureModalHost().innerHTML = "";
  await preloadDict();

  const host = $("#tabHost", view);
  const seg = $("#seg", view);

  const ctx = {
    tab: "leads",
    includeDeleted: false,
    leadsCache: [],
    catalogCache: [],
  };

  seg.onclick = async (e) => {
    const b = e.target.closest("button[data-tab]");
    if (!b) return;
    const tab = b.dataset.tab;
    if (tab === ctx.tab) return;
    ctx.tab = tab;
    seg.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("active", x.dataset.tab === tab));
    await renderTab(ctx, host);
  };

  await renderTab(ctx, host);
}

async function renderTab(ctx, host) {
  if (ctx.tab === "catalog") return renderCatalogTab(ctx, host);
  return renderLeadsTab(ctx, host);
}

/* =========================
   Leads Tab (Kanban)
========================= */
let draggingLeadId = null;

async function renderLeadsTab(ctx, host) {
  host.innerHTML = `
    <div class="crs-top">
      <button class="btn primary" id="btnAdd">＋</button>
      <button class="btn" id="btnReload">⟲</button>
      <button class="btn" id="btnDeleted"></button>

      <div class="field crs-search">
        <input class="input" id="q" placeholder="${tr("searchPlaceholderCourses", "Name / phone / company")}..." />
      </div>
    </div>

    <div class="crs-filters">
      <div class="field">
        <div class="label">${tr("status", "Status")}</div>
        <select class="input" id="status"></select>
      </div>

      <div class="field">
        <div class="label">${t("city")}</div>
        <select class="input" id="city"></select>
      </div>

      <div class="field">
        <div class="label">${t("source")}</div>
        <select class="input" id="source"></select>
      </div>

      <div class="crs-sp"></div>
      <button class="btn" id="btnClear">${t("clear")}</button>
    </div>

    <div class="crs-boardWrap" id="board"></div>
  `;

  const citySel = $("#city", host);
  const sourceSel = $("#source", host);
  const statusSel = $("#status", host);

  fillSelect(citySel, state.dict.cities || [], true);
  fillSelect(sourceSel, state.dict.sources || [], true);
  fillStatusSelect(statusSel, true);

  const refreshDeletedBtn = () => {
    $("#btnDeleted", host).textContent = ctx.includeDeleted ? t("hideDeleted") : t("showDeleted");
  };

  const loadAndRender = async () => {
    const q = ($("#q", host).value || "").trim();
    const city_id = citySel.value || "";
    const source_id = sourceSel.value || "";
    const status = statusSel.value || "";

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (ctx.includeDeleted) params.set("include_deleted", "1");
    if (city_id) params.set("city_id", city_id);
    if (source_id) params.set("source_id", source_id);
    if (status) params.set("status", status);

    try {
      const data = await apiLeadsList(params.toString());
      const list = data.items || data.leads || data.rows || data.courses || [];
      ctx.leadsCache = Array.isArray(list) ? list : [];
    } catch (e) {
      ctx.leadsCache = [];
      notify(`${tr("failedToLoad", "Failed to load")}: ${errText(e, "")}`, "error");
    }

    const board = $("#board", host);
    board.innerHTML = leadsBoardHtml(ctx, ctx.leadsCache);

    bindLeadsBoard({
      ctx,
      host,
      board,
      onReload: loadAndRender,
    });
  };

  $("#btnAdd", host).onclick = () =>
    openLeadModal({ ctx, mode: "create", lead: null, onSaved: loadAndRender });

  $("#btnReload", host).onclick = loadAndRender;

  $("#btnDeleted", host).onclick = async () => {
    ctx.includeDeleted = !ctx.includeDeleted;
    refreshDeletedBtn();
    await loadAndRender();
  };

  $("#btnClear", host).onclick = async () => {
    $("#q", host).value = "";
    citySel.value = "";
    sourceSel.value = "";
    statusSel.value = "";
    await loadAndRender();
  };

  $("#q", host).oninput = debounce(loadAndRender, 250);
  citySel.onchange = loadAndRender;
  sourceSel.onchange = loadAndRender;
  statusSel.onchange = loadAndRender;

  refreshDeletedBtn();
  await loadAndRender();
}

function leadsBoardHtml(ctx, items) {
  const cities = state.dict.cities || [];
  const sources = state.dict.sources || [];

  const phoneText = (x) => {
    const p1 = (x.phone1 || x.phone || "").trim();
    const p2 = (x.phone2 || "").trim();
    if (p1 && p2) return `${p1} / ${p2}`;
    return p1 || p2 || "";
  };

  const cols = LEAD_STATUSES.map((key) => ({
    key,
    title: leadStatusLabel(key),
  }));

  const by = {};
  cols.forEach((c) => (by[c.key] = []));
  (items || []).forEach((x) => {
    const st = normLeadStatus(x.status);
    (by[st] || by["new"]).push(x);
  });

  cols.forEach((c) => {
    by[c.key] = (by[c.key] || [])
      .slice()
      .sort((a, b) => (Number(b.created_at || 0) - Number(a.created_at || 0)));
  });

  const cardHtml = (x) => {
    const del = Number(x.is_deleted) === 1;
    const cityName = x.city_name || pick(cities, x.city_id) || "";
    const srcName = x.source_name || pick(sources, x.source_id) || "";
    const phones = phoneText(x);

    return `
      <div class="crs-card ${del ? "is-del" : ""}" draggable="${del ? "false" : "true"}"
        data-id="${esc(x.id)}" data-status="${esc(normLeadStatus(x.status))}">
        <div class="crs-cardTop">
          <div style="min-width:0">
            <div class="crs-title">${esc(x.full_name || "")}</div>
            <div class="crs-sub">
              ${x.company ? esc(x.company) : ""}
              ${x.code ? (x.company ? " • " : "") + esc(x.code) : ""}
              ${del ? ` • <span class="badge del">${t("deleted")}</span>` : ""}
            </div>
          </div>

          <div class="crs-actions" style="gap:6px">
            <button class="btn icon" data-act="edit" data-id="${esc(x.id)}" title="${esc(t("edit"))}">
              <span class="ico"><img src="/assets/icons/edit.svg" alt="" /></span>
            </button>
            ${del ? "" : `
              <button class="btn icon danger" data-act="del" data-id="${esc(x.id)}" title="${esc(t("delete"))}">
                <span class="ico"><img src="/assets/icons/delete.svg" alt="" /></span>
              </button>
            `}
          </div>
        </div>

        <div class="crs-meta">
          ${phones ? `<span class="crs-chip">📞 ${esc(phones)}</span>` : ""}
          ${cityName ? `<span class="crs-chip">📍 ${esc(cityName)}</span>` : ""}
          ${srcName ? `<span class="crs-chip">🔎 ${esc(srcName)}</span>` : ""}
          ${x.created_at ? `<span class="crs-chip">🕒 ${esc(formatTs(x.created_at))}</span>` : ""}
        </div>
      </div>
    `;
  };

  return cols.map((c) => `
    <div class="crs-col" data-status="${esc(c.key)}">
      <div class="crs-colHead">
        <div>${esc(c.title)}</div>
        <small class="muted">${esc(String((by[c.key] || []).length))}</small>
      </div>
      <div class="crs-colBody" data-drop="${esc(c.key)}">
        ${(by[c.key] || []).map(cardHtml).join("")}
      </div>
    </div>
  `).join("");
}

function bindLeadsBoard({ ctx, board, onReload }) {
  if (!board) return;

  board.onclick = async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (btn) {
      e.stopPropagation();
      const act = btn.dataset.act;
      const id = Number(btn.dataset.id);
      if (!id) return;
      const lead = (ctx.leadsCache || []).find((x) => Number(x.id) === id);

      if (act === "edit") {
        // pencil => VIEW modal, but editable fields
        if (!lead) return notify(tr("failedToLoad", "Failed to load"), "error");
        return openLeadModal({ ctx, mode: "edit", lead, onSaved: onReload });
      }

      if (act === "del") {
        return deleteLead({ id, onDone: onReload });
      }
      return;
    }

    const card = e.target.closest(".crs-card");
    if (!card) return;
    const id = Number(card.dataset.id);
    if (!id) return;

    const lead = (ctx.leadsCache || []).find((x) => Number(x.id) === id);
    if (!lead) return notify(tr("failedToLoad", "Failed to load"), "error");

    // card click => view
    return openLeadModal({ ctx, mode: "view", lead, onSaved: onReload });
  };

  // drag & drop
  board.querySelectorAll(".crs-card[draggable='true']").forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      draggingLeadId = card.dataset.id;
      card.classList.add("dragging");
      try {
        e.dataTransfer.setData("text/plain", String(card.dataset.id));
        e.dataTransfer.effectAllowed = "move";
      } catch {}
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggingLeadId = null;
    });
  });

  board.querySelectorAll(".crs-colBody").forEach((colBody) => {
    colBody.addEventListener("dragover", (e) => {
      e.preventDefault();
      colBody.classList.add("dropHint");
    });
    colBody.addEventListener("dragleave", () => colBody.classList.remove("dropHint"));
    colBody.addEventListener("drop", async (e) => {
      e.preventDefault();
      colBody.classList.remove("dropHint");

      const id = Number((() => {
        try { return e.dataTransfer.getData("text/plain"); } catch { return ""; }
      })() || draggingLeadId);

      if (!id) return;

      const targetStatus = colBody.getAttribute("data-drop") || "new";
      const lead = (ctx.leadsCache || []).find((x) => Number(x.id) === Number(id));
      if (!lead) return;
      if (Number(lead.is_deleted) === 1) return;

      const current = normLeadStatus(lead.status);
      if (current === targetStatus) return;

      try {
        await apiLeadUpdate(id, { status: targetStatus });
        notify(tr("saved", "Saved"), "success");
        await onReload?.();
      } catch (e2) {
        notify(`${tr("saveFailed", "Save failed")}: ${errText(e2, "")}`, "error");
        await onReload?.();
      }
    });
  });
}

/* =========================
   Lead Modal (view/edit/create) + enrollments
========================= */
async function openLeadModal({ ctx, mode, lead, onSaved }) {
  const modalHost = ensureModalHost();

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const cities = (state.dict.cities || []).filter((x) => x.active !== 0);
  const sources = (state.dict.sources || []).filter((x) => x.active !== 0);
  const companies = await ensureClientCompanies();

  const data = isCreate ? {} : (lead || {});
  const del = Number(data.is_deleted) === 1;

  const cityName = data.city_name || pick(state.dict.cities, data.city_id) || "—";
  const srcName = data.source_name || pick(state.dict.sources, data.source_id) || "—";
  const phonesView = [data.phone1 || data.phone || "", data.phone2 || ""].filter(Boolean).join(" / ") || "—";

  const title =
    isCreate ? tr("addLead", "Add lead")
    : (isEdit ? tr("editLead", "Edit lead") : tr("viewLead", "Lead"));

  modalHost.innerHTML = `
    <div class="mb">
      <div class="m">
        <div class="mh">
          <div style="min-width:0">
            <b>${esc(isCreate ? title : (data.full_name || title))}</b>
            <div class="mini muted">
              ${!isCreate ? esc(data.code || "") : ""}
              ${!isCreate ? ` • <span class="badge st">${esc(leadStatusLabel(data.status))}</span>` : ""}
              ${del ? ` • <span class="badge del">${t("deleted")}</span>` : ""}
            </div>
          </div>
          <div class="row">
            ${isView ? `<button class="btn" id="vToEdit">${t("edit")}</button>` : ""}
            <button class="btn" id="mClose">✕</button>
          </div>
        </div>

        <div class="mbo">
          <div class="grid2">
            <div class="field">
              <div class="label">${t("fullName")}</div>
              <input class="input" id="mFull" value="${esc(data.full_name || "")}" ${isView ? "disabled" : ""} />
            </div>

            <div class="field">
              <div class="label">${tr("company", "Company")}</div>
              <input class="input" id="mCompany" list="crsCompanyList" value="${esc(data.company || "")}" ${isView ? "disabled" : ""} />
              <datalist id="crsCompanyList">
                ${(companies || []).slice(0, 2000).map((nm) => `<option value="${esc(nm)}"></option>`).join("")}
              </datalist>
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${tr("phone1", "Phone 1")}</div>
              <input class="input" id="mP1" value="${esc(data.phone1 || data.phone || "")}" ${isView ? "disabled" : ""} />
            </div>
            <div class="field">
              <div class="label">${tr("phone2", "Phone 2")}</div>
              <input class="input" id="mP2" value="${esc(data.phone2 || "")}" ${isView ? "disabled" : ""} />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("city")}</div>
              <select class="input" id="mCity" ${isView ? "disabled" : ""}>
                <option value="">—</option>
                ${cities.sort((a,b)=>String(a.name).localeCompare(String(b.name)))
                  .map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
              </select>
            </div>

            <div class="field">
              <div class="label">${t("source")}</div>
              <select class="input" id="mSource" ${isView ? "disabled" : ""}>
                <option value="">—</option>
                ${sources.sort((a,b)=>String(a.name).localeCompare(String(b.name)))
                  .map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${tr("status", "Status")}</div>
              <select class="input" id="mStatus" ${isView || isCreate ? "disabled" : ""}></select>
              ${isCreate ? `<div class="mini muted" style="margin-top:6px">${tr("statusAlwaysNew", "New lead will be created with status: new")}</div>` : ""}
            </div>

            <div class="field">
              <div class="label">${tr("comment", "Comment")}</div>
              <textarea class="input" id="mComment" ${isView ? "disabled" : ""}>${esc(data.comment || "")}</textarea>
            </div>
          </div>

          ${!isCreate ? `
            <div class="sec">
              <div class="row" style="justify-content:space-between">
                <b>${tr("leadInfo", "Info")}</b>
                <div class="row">
                  <span class="mini muted">${t("createdAt")}: ${esc(formatTs(data.created_at) || "—")}</span>
                </div>
              </div>
              <div class="mini muted" style="margin-top:6px">
                ${tr("phone", "Phone")}: ${esc(phonesView)} •
                ${t("city")}: ${esc(cityName)} •
                ${t("source")}: ${esc(srcName)}
              </div>
            </div>

            <div class="sec">
              <div class="row" style="justify-content:space-between">
                <b>${tr("enrollments", "Enrollments")}</b>
                <div class="row">
                  <button class="btn" id="btnFindClient">${tr("openClient", "Open client")}</button>
                  <button class="btn primary" id="btnMakeClient">${tr("createClient", "Create client")}</button>
                  <button class="btn" id="btnAddEnroll">＋ ${tr("addEnrollment", "Add")}</button>
                </div>
              </div>
              <div id="enrollWrap" style="margin-top:10px">
                <div class="muted">${tr("loading", "Loading...")}</div>
              </div>
            </div>
          ` : ""}

          <div class="row right" style="margin-top:14px">
            <button class="btn" id="mCancel">${t("cancel")}</button>
            ${(!isView && !del) ? `<button class="btn primary" id="mSave">${t("save")}</button>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;

  const close = () => (modalHost.innerHTML = "");
  $("#mClose", modalHost).onclick = close;
  $("#mCancel", modalHost).onclick = close;
  modalHost.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  // fill selects
  $("#mCity", modalHost).value = data.city_id ?? "";
  $("#mSource", modalHost).value = data.source_id ?? "";
  fillStatusSelect($("#mStatus", modalHost), false);
  $("#mStatus", modalHost).value = normLeadStatus(data.status || "new");

  if (isCreate) $("#mStatus", modalHost).value = "new";

  // view => switch to edit (reopen)
  if (isView) {
    $("#vToEdit", modalHost).onclick = () => {
      close();
      openLeadModal({ ctx, mode: "edit", lead: data, onSaved });
    };
  }

  // Client link actions
  if (!isCreate) {
    $("#btnFindClient", modalHost).onclick = async () => {
      const q = String(data.phone1 || data.phone || "").trim();
      if (!q) return notify(tr("noPhone", "No phone"), "error");
      try {
        const r = await apiFetch(`/clients?q=${encodeURIComponent(q)}`, { silent: true });
        const list = r.clients || r.items || [];
        if (!list.length) return notify(tr("clientNotFound", "Client not found"), "error");
        location.hash = `#/clients/${list[0].id}`;
        close();
      } catch (e) {
        notify(`${tr("clientNotFound", "Client not found")}: ${errText(e, "")}`, "error");
      }
    };

    $("#btnMakeClient", modalHost).onclick = async () => {
      try {
        await apiFetch(`/clients`, {
          method: "POST",
          body: {
            company_name: data.company || data.full_name || "Client",
            full_name: data.full_name || null,
            phone1: data.phone1 || data.phone || null,
            phone2: data.phone2 || null,
            city_id: data.city_id ?? null,
            source_id: data.source_id ?? null,
            sphere: null,
            comment: data.comment || null,
          },
        });
        notify(tr("saved", "Saved"), "success");
      } catch (e) {
        notify(`${tr("saveFailed", "Save failed")}: ${errText(e, "")}`, "error");
      }
    };
  }

  // enrollments
  const renderEnrollments = async () => {
    const wrap = $("#enrollWrap", modalHost);
    if (!wrap) return;

    try {
      const res = await apiEnrollList(Number(data.id));
      const items = res.items || res.rows || res.enrollments || [];
      wrap.innerHTML = enrollmentsHtml(items);

      wrap.onclick = async (e) => {
        const b = e.target.closest("button[data-eact]");
        if (!b) return;
        const eact = b.dataset.eact;
        const eid = Number(b.dataset.id);
        const row = (items || []).find((x) => Number(x.id) === eid);
        if (!row) return;

        if (eact === "edit") {
          return openEnrollModal({
            leadId: Number(data.id),
            mode: "edit",
            row,
            onSaved: renderEnrollments,
          });
        }
      };
    } catch (e) {
      wrap.innerHTML = `<div class="muted">${tr("enrollmentsSoon", "Enrollments — keyingi bosqichda.")}</div>`;
    }
  };

  if (!isCreate) {
    $("#btnAddEnroll", modalHost).onclick = () =>
      openEnrollModal({ leadId: Number(data.id), mode: "create", row: null, onSaved: renderEnrollments });

    await renderEnrollments();
  }

  // Save lead
  const btnSave = $("#mSave", modalHost);
  if (btnSave) {
    btnSave.onclick = async () => {
      const full_name = $("#mFull", modalHost).value.trim();
      if (!full_name) return notify(tr("requiredName", "Full name is required"), "error");

      const payload = {
        full_name,
        phone1: $("#mP1", modalHost).value.trim() || null,
        phone2: $("#mP2", modalHost).value.trim() || null,
        city_id: $("#mCity", modalHost).value ? Number($("#mCity", modalHost).value) : null,
        source_id: $("#mSource", modalHost).value ? Number($("#mSource", modalHost).value) : null,
        company: $("#mCompany", modalHost).value.trim() || null,
        comment: $("#mComment", modalHost).value.trim() || null,
        status: isCreate ? "new" : normLeadStatus($("#mStatus", modalHost).value || "new"),
      };

      try {
        if (isCreate) {
          await apiLeadCreate(payload);
        } else {
          await apiLeadUpdate(Number(data.id), payload);
        }

        close();
        notify(tr("saved", "Saved"), "success");
        await onSaved?.();
      } catch (e) {
        notify(`${tr("saveFailed", "Save failed")}: ${errText(e, "")}`, "error");
      }
    };
  }
}

function enrollmentsHtml(items) {
  if (!items?.length) return `<div class="muted">${tr("noEnrollments", "No enrollments yet")}</div>`;

  return `
    <div class="crs-tablewrap" style="max-height:320px">
      <table class="crs-t" style="min-width:980px">
        <thead>
          <tr>
            <th>${tr("course", "Course")}</th>
            <th>${tr("status", "Status")}</th>
            <th>${tr("price", "Price")}</th>
            <th>${tr("paid", "Paid")}</th>
            <th>${tr("note", "Note")}</th>
            <th>${t("createdAt")}</th>
            <th style="text-align:right">${t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          ${(items || []).map((x) => `
            <tr>
              <td><b>${esc(x.course_name || x.course || x.course_title || ("#" + (x.course_id || "")))}</b></td>
              <td><span class="badge st">${esc(x.status || "")}</span></td>
              <td>${esc(x.price ?? x.price_default ?? "")} ${esc(x.currency || x.currency_default || "")}</td>
              <td>${esc(x.paid ?? "")}</td>
              <td class="muted">${esc((x.note || "").slice(0, 80))}</td>
              <td>${formatTs(x.created_at)}</td>
              <td>
                <div class="crs-actions">
                  <button class="btn icon" data-eact="edit" data-id="${x.id}" title="${esc(t("edit"))}">
                    <span class="ico"><img src="/assets/icons/edit.svg" alt="" /></span>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function openEnrollModal({ leadId, mode, row, onSaved }) {
  const modalHost = ensureModalHost();
  const isEdit = mode === "edit";

  let catalog = [];
  try {
    const c = await apiCatalogList();
    catalog = c.items || c.courses || c.rows || [];
  } catch {}

  // nested modal layer
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="mb">
      <div class="m" style="width:min(820px, calc(100vw - 24px))">
        <div class="mh">
          <b>${isEdit ? tr("editEnrollment", "Edit enrollment") : tr("addEnrollment", "Add enrollment")}</b>
          <button class="btn" id="eClose">✕</button>
        </div>
        <div class="mbo">

          <div class="grid2">
            <div class="field">
              <div class="label">${tr("course", "Course")}</div>
              <select class="input" id="eCourse" ${isEdit ? "disabled" : ""}>
                <option value="">—</option>
                ${catalog.map((x) => `<option value="${x.id}">${esc(x.name || x.title || ("#" + x.id))}</option>`).join("")}
              </select>
              ${!catalog.length ? `<div class="mini muted" style="margin-top:6px">${tr("catalogMissing", "Catalog is empty / not configured yet")}</div>` : ""}
            </div>

            <div class="field">
              <div class="label">${tr("status", "Status")}</div>
              <select class="input" id="eStatus">
                ${ENROLL_STATUSES.map((s) => `<option value="${s}">${esc(s)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${tr("price", "Price")}</div>
              <input class="input" id="ePrice" placeholder="0" />
            </div>
            <div class="field">
              <div class="label">${tr("paid", "Paid")}</div>
              <input class="input" id="ePaid" placeholder="0" />
            </div>
          </div>

          <div class="field" style="margin-top:10px">
            <div class="label">${tr("note", "Note")}</div>
            <textarea class="input" id="eNote"></textarea>
          </div>

          <div class="row right" style="margin-top:14px">
            <button class="btn" id="eCancel">${t("cancel")}</button>
            <button class="btn primary" id="eSave">${t("save")}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  modalHost.appendChild(wrap);

  const close = () => wrap.remove();
  $("#eClose", wrap).onclick = close;
  $("#eCancel", wrap).onclick = close;
  wrap.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  if (isEdit && row) {
    $("#eCourse", wrap).value = row.course_id ?? "";
    $("#eStatus", wrap).value = row.status ?? "planned";
    $("#eNote", wrap).value = row.note ?? "";
    $("#ePrice", wrap).value = row.price ?? "";
    $("#ePaid", wrap).value = row.paid ?? "";
  }

  $("#eSave", wrap).onclick = async () => {
    const status = String($("#eStatus", wrap).value || "").trim() || "planned";
    const note = $("#eNote", wrap).value.trim() || null;

    const priceRaw = $("#ePrice", wrap).value.trim();
    const paidRaw = $("#ePaid", wrap).value.trim();

    const price = priceRaw === "" ? null : Number(priceRaw);
    const paid = paidRaw === "" ? null : Number(paidRaw);

    try {
      if (isEdit && row) {
        await apiEnrollUpdate(Number(row.id), { status, note, price, paid });
      } else {
        const course_id = $("#eCourse", wrap).value ? Number($("#eCourse", wrap).value) : null;
        if (!course_id) return notify(tr("pickCourse", "Pick a course"), "error");
        await apiEnrollCreate(leadId, { course_id, status, note, price, paid });
      }

      close();
      notify(tr("saved", "Saved"), "success");
      await onSaved?.();
    } catch (e) {
      notify(`${tr("saveFailed", "Save failed")}: ${errText(e, "")}`, "error");
    }
  };
}

/* =========================
   Delete Lead
========================= */
function deleteLead({ id, onDone }) {
  const modalHost = ensureModalHost();

  confirmModal({
    modalHost,
    title: tr("confirmDelete", "Delete?"),
    text: tr("confirmDeleteLeadText", "Delete this lead"),
    okText: t("yes"),
    cancelText: t("no"),
    onOk: async () => {
      try {
        await apiLeadDelete(id);
        notify(tr("saved", "Saved"), "success");
        await onDone?.();
      } catch (e) {
        notify(`${tr("deleteFailed", "Delete failed")}: ${errText(e, "")}`, "error");
      }
    },
  });
}

/* =========================
   Catalog Tab
========================= */
async function renderCatalogTab(ctx, host) {
  host.innerHTML = `
    <div class="crs-top">
      <button class="btn primary" id="btnAddCourse">＋</button>
      <button class="btn" id="btnReloadCourse">⟲</button>
      <div class="field crs-search">
        <input class="input" id="cq" placeholder="${tr("search", "Search")}..." />
      </div>
    </div>

    <div class="crs-tablewrap" id="cwrap"></div>
  `;

  let cache = [];

  const loadAndRender = async () => {
    const q = ($("#cq", host).value || "").trim().toLowerCase();

    try {
      const data = await apiCatalogList();
      const list = data.items || data.courses || data.rows || [];
      cache = Array.isArray(list) ? list : [];

      const filtered = q
        ? cache.filter((x) => String(x.name || x.title || "").toLowerCase().includes(q))
        : cache;

      $("#cwrap", host).innerHTML = catalogTableHtml(filtered);
    } catch (e) {
      $("#cwrap", host).innerHTML = `<div class="muted" style="padding:14px">${tr("failedToLoad", "Failed to load")}: ${esc(errText(e, ""))}</div>`;
    }
  };

  $("#btnAddCourse", host).onclick = () =>
    openCourseModal({ mode: "create", row: null, onSaved: loadAndRender });

  $("#btnReloadCourse", host).onclick = loadAndRender;
  $("#cq", host).oninput = debounce(loadAndRender, 250);

  $("#cwrap", host).onclick = (e) => {
    const btn = e.target.closest("button[data-cact]");
    const trRow = e.target.closest("tr[data-rowid]");
    const rowId = Number(trRow?.dataset?.rowid || "");

    if (btn) {
      e.stopPropagation();
      const act = btn.dataset.cact;
      const id = Number(btn.dataset.id);
      const row = cache.find((x) => Number(x.id) === id);
      if (!row) return;

      if (act === "edit") return openCourseModal({ mode: "edit", row, onSaved: loadAndRender });
      if (act === "toggle") return toggleCourseActive(row, loadAndRender);
      return;
    }

    // click row => view
    if (rowId) {
      const row = cache.find((x) => Number(x.id) === rowId);
      if (!row) return;
      return openCourseModal({ mode: "view", row, onSaved: loadAndRender });
    }
  };

  await loadAndRender();
}

function catalogTableHtml(items) {
  if (!items?.length) return `<div class="muted" style="padding:14px">${t("notFound")}</div>`;
  return `
    <table class="crs-t">
      <thead>
        <tr>
          <th>ID</th>
          <th>${tr("name", "Name")}</th>
          <th>${tr("price", "Price")}</th>
          <th>${tr("currency", "Currency")}</th>
          <th>${tr("active", "Active")}</th>
          <th style="text-align:right">${t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((x) => `
          <tr data-rowid="${esc(x.id)}" style="cursor:pointer">
            <td>${esc(x.id)}</td>
            <td><b>${esc(x.name || x.title || "")}</b></td>
            <td>${esc(x.price ?? "")}</td>
            <td>${esc(x.currency ?? "USD")}</td>
            <td>${Number(x.active) ? `<span class="badge ok">${tr("yes", "Yes")}</span>` : `<span class="badge">${tr("no", "No")}</span>`}</td>
            <td>
              <div class="crs-actions">
                <button class="btn icon" data-cact="edit" data-id="${esc(x.id)}" title="${esc(t("edit"))}">
                  <span class="ico"><img src="/assets/icons/edit.svg" alt="" /></span>
                </button>
                <button class="btn icon" data-cact="toggle" data-id="${esc(x.id)}" title="${esc(tr("toggleActive", "Toggle active"))}">
                  <span class="ico"><img src="/assets/icons/show.svg" alt="" /></span>
                </button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function toggleCourseActive(row, onSaved) {
  const modalHost = ensureModalHost();
  confirmModal({
    modalHost,
    title: tr("confirm", "Confirm"),
    text: `${tr("toggleActive", "Toggle active")}: ${row.name || row.title || ""}`,
    okText: t("yes"),
    cancelText: t("no"),
    onOk: async () => {
      try {
        await apiCatalogToggle(Number(row.id));
        notify(tr("saved", "Saved"), "success");
        await onSaved?.();
      } catch (e) {
        notify(`${tr("saveFailed", "Save failed")}: ${errText(e, "")}`, "error");
      }
    },
  });
}

function openCourseModal({ mode, row, onSaved }) {
  const modalHost = ensureModalHost();
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const data = isCreate ? {} : (row || {});
  const title =
    isCreate ? tr("addCourse", "Add course")
    : (isEdit ? tr("editCourse", "Edit course") : tr("viewCourse", "Course"));

  modalHost.innerHTML = `
    <div class="mb">
      <div class="m" style="width:min(820px, calc(100vw - 24px))">
        <div class="mh">
          <b>${esc(isCreate ? title : (data.name || title))}</b>
          <div class="row">
            ${isView ? `<button class="btn" id="cToEdit">${t("edit")}</button>` : ""}
            <button class="btn" id="cClose">✕</button>
          </div>
        </div>
        <div class="mbo">
          <div class="grid2">
            <div class="field">
              <div class="label">${tr("name", "Name")}</div>
              <input class="input" id="cName" value="${esc(data.name || "")}" ${isView ? "disabled" : ""} />
            </div>
            <div class="field">
              <div class="label">${tr("price", "Price")}</div>
              <input class="input" id="cPrice" value="${esc(data.price ?? "")}" ${isView ? "disabled" : ""} />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${tr("currency", "Currency")}</div>
              <input class="input" id="cCur" value="${esc(data.currency ?? "USD")}" ${isView ? "disabled" : ""} />
            </div>
            <div class="field">
              <div class="label">${tr("active", "Active")}</div>
              <select class="input" id="cActive" ${isView ? "disabled" : ""}>
                <option value="1">${tr("yes", "Yes")}</option>
                <option value="0">${tr("no", "No")}</option>
              </select>
            </div>
          </div>

          <div class="row right" style="margin-top:14px">
            <button class="btn" id="cCancel">${t("cancel")}</button>
            ${!isView ? `<button class="btn primary" id="cSave">${t("save")}</button>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;

  const close = () => (modalHost.innerHTML = "");
  $("#cClose", modalHost).onclick = close;
  $("#cCancel", modalHost).onclick = close;
  modalHost.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  $("#cActive", modalHost).value = String(Number(data.active) ? 1 : 0);

  if (isView) {
    $("#cToEdit", modalHost).onclick = () => {
      close();
      openCourseModal({ mode: "edit", row: data, onSaved });
    };
  }

  const btnSave = $("#cSave", modalHost);
  if (btnSave) {
    btnSave.onclick = async () => {
      const name = $("#cName", modalHost).value.trim();
      if (!name) return notify(tr("requiredName", "Name is required"), "error");

      const priceRaw = $("#cPrice", modalHost).value.trim();
      const price = priceRaw === "" ? 0 : Number(priceRaw);
      if (!Number.isFinite(price) || price < 0) return notify(tr("invalidPrice", "Invalid price"), "error");

      const currency = $("#cCur", modalHost).value.trim() || "USD";
      const active = $("#cActive", modalHost).value === "1" ? 1 : 0;

      try {
        if (isCreate) {
          await apiCatalogCreate({ name, price, currency, active });
        } else {
          await apiCatalogUpdate(Number(data.id), { name, price, currency, active });
        }
        close();
        notify(tr("saved", "Saved"), "success");
        await onSaved?.();
      } catch (e) {
        notify(`${tr("saveFailed", "Save failed")}: ${errText(e, "")}`, "error");
      }
    };
  }
}

/* =========================
   Confirm modal (reuse)
========================= */
function confirmModal({ modalHost, title, text, okText, cancelText, onOk }) {
  modalHost.innerHTML = `
    <div class="mb">
      <div class="m" style="width:min(520px, calc(100vw - 24px))">
        <div class="mh">
          <b>${esc(title)}</b>
          <button class="btn" id="xClose">✕</button>
        </div>
        <div class="mbo">
          <div class="muted">${esc(text || "")}</div>
          <div class="row right" style="margin-top:14px">
            <button class="btn" id="xCancel">${esc(cancelText || t("cancel"))}</button>
            <button class="btn danger" id="xOk">${esc(okText || t("yes"))}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const close = () => (modalHost.innerHTML = "");
  $("#xClose", modalHost).onclick = close;
  $("#xCancel", modalHost).onclick = close;
  modalHost.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };
  $("#xOk", modalHost).onclick = async () => { close(); await onOk?.(); };
}
