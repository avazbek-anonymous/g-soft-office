import { state } from "../core/state.js";
import { apiFetch } from "../core/api.js";
import { t } from "../core/i18n.js";
import * as TOAST from "../ui/toast.js";



function ensureModalHost() {
  let el = document.getElementById("modalHost");
  if (!el) {
    el = document.createElement("div");
    el.id = "modalHost";
    document.body.appendChild(el);
  }
  return el;
}


const $ = (sel, el = document) => el.querySelector(sel);

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
function debounce(fn, ms = 250) { let tt = null; return (...a) => { clearTimeout(tt); tt = setTimeout(() => fn(...a), ms); }; }
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

/* =========================
   API (с fallback’ами)
========================= */
async function apiFirst(paths, options = {}) {
  let lastErr = null;
  for (const p of paths) {
    try {
      return await apiFetch(p, options);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

const apiLeadsList = (params) => apiFirst(
  [
    `/courses/leads${params ? "?" + params : ""}`,
    `/courses${params ? "?" + params : ""}`,
  ],
  { silent: true }
);

const apiLeadGet = (id) => apiFirst(
  [
    `/courses/leads/${id}`,
    `/courses/${id}`,
  ],
  { silent: true }
);

const apiLeadCreate = (body) => apiFirst(
  [
    `/courses/leads`,
    `/courses`,
  ],
  { method: "POST", body }
);

const apiLeadUpdate = (id, body) => apiFirst(
  [
    `/courses/leads/${id}`,
    `/courses/${id}`,
  ],
  { method: "PATCH", body }
);

const apiLeadDelete = (id) => apiFirst(
  [
    `/courses/leads/${id}/delete`,
    `/courses/${id}/delete`,
  ],
  { method: "POST", body: {} }
);

// enrollments (если backend уже есть — заработает; если нет — просто покажет “скоро”)
const apiEnrollList = (leadId) => apiFirst(
  [
    `/courses/leads/${leadId}/enrollments`,
    `/courses/${leadId}/enrollments`,
  ],
  { silent: true }
);

const apiEnrollCreate = (leadId, body) => apiFirst(
  [
    `/courses/leads/${leadId}/enrollments`,
    `/courses/${leadId}/enrollments`,
  ],
  { method: "POST", body }
);

const apiEnrollUpdate = (id, body) => apiFirst(
  [
    `/courses/enrollments/${id}`,
    `/course_enrollments/${id}`,
  ],
  { method: "PATCH", body }
);

const apiEnrollDelete = (id) => apiFirst(
  [
    `/courses/enrollments/${id}/delete`,
    `/course_enrollments/${id}/delete`,
  ],
  { method: "POST", body: {} }
);

// catalog (опционально)
const apiCatalogList = () => apiFirst(
  [
    `/courses/catalog`,
    `/courses/courses`,
  ],
  { silent: true }
);

const apiCatalogCreate = (body) => apiFirst(
  [
    `/courses/catalog`,
    `/courses/courses`,
  ],
  { method: "POST", body }
);

const apiCatalogUpdate = (id, body) => apiFirst(
  [
    `/courses/catalog/${id}`,
    `/courses/courses/${id}`,
  ],
  { method: "PATCH", body }
);

const apiCatalogDelete = (id) => apiFirst(
  [
    `/courses/catalog/${id}/delete`,
    `/courses/courses/${id}/delete`,
  ],
  { method: "POST", body: {} }
);

/* =========================
   Page
========================= */
export async function renderCourses(view) {
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

      /* ✅ scroll ONLY for list */
      .crs-tablewrap{
        margin-top:12px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.10);
        overflow:auto;
        max-height: calc(100vh - 320px);
      }
      @media(max-width:920px){ .crs-tablewrap{max-height: calc(100vh - 280px)} }
      body[data-theme="light"] .crs-tablewrap{border-color:rgba(0,0,0,.10)}
      .crs-tablewrap::-webkit-scrollbar{height:10px;width:10px}
      .crs-tablewrap::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12); border-radius:999px}
      body[data-theme="light"] .crs-tablewrap::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12)}

      table.crs-t{width:100%; border-collapse:collapse; min-width:1180px}
      .crs-t th,.crs-t td{padding:12px; border-bottom:1px solid rgba(255,255,255,.08); text-align:left; vertical-align:middle}
      body[data-theme="light"] .crs-t th, body[data-theme="light"] .crs-t td{border-bottom-color:rgba(0,0,0,.08)}
      .crs-t thead th{
        font-size:12px; opacity:.75;
        position:sticky; top:0; z-index:2;
        background:rgba(10,14,25,.85);
        backdrop-filter: blur(10px);
      }
      body[data-theme="light"] .crs-t thead th{background:rgba(255,255,255,.85)}

      .crs-actions{display:flex; flex-wrap:nowrap; gap:8px; justify-content:flex-end}
      .linkbtn{background:none; border:none; padding:0; margin:0; color:inherit; cursor:pointer}
      .linkbtn:hover{text-decoration:underline}

      .badge{
        display:inline-flex; align-items:center; gap:6px;
        padding:4px 10px; border-radius:999px;
        font-size:12px; border:1px solid rgba(255,255,255,.12);
        opacity:.9;
      }
      body[data-theme="light"] .badge{border-color:rgba(0,0,0,.12)}
      .badge.del{background:rgba(239,68,68,.14); border-color:rgba(239,68,68,.35)}
      .badge.st{background:rgba(59,130,246,.10); border-color:rgba(59,130,246,.25)}

      /* icon buttons */
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
      body[data-theme="light"] .btn.icon.danger{background: rgba(239,68,68,.10)}

      /* make selects cleaner (локально) */
      .crs select.input{
        appearance:none;
        background-image: linear-gradient(45deg, transparent 50%, rgba(255,255,255,.55) 50%),
                          linear-gradient(135deg, rgba(255,255,255,.55) 50%, transparent 50%);
        background-position: calc(100% - 18px) 50%, calc(100% - 12px) 50%;
        background-size: 6px 6px, 6px 6px;
        background-repeat:no-repeat;
        padding-right:34px;
      }
      body[data-theme="light"] .crs select.input{
        background-image: linear-gradient(45deg, transparent 50%, rgba(0,0,0,.45) 50%),
                          linear-gradient(135deg, rgba(0,0,0,.45) 50%, transparent 50%);
      }

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
      .kv{display:grid; grid-template-columns:160px 1fr; gap:8px 12px}
      @media(max-width:900px){ .kv{grid-template-columns:1fr} }
      .k{opacity:.7; font-size:12px}
      .v{font-weight:600}
    </style>
  `;

  ensureModalHost().innerHTML = ""; // чтобы чистить старые модалки

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

/* =========================
   Tabs
========================= */
async function renderTab(ctx, host) {
  if (ctx.tab === "catalog") return renderCatalogTab(ctx, host);
  return renderLeadsTab(ctx, host);
}

/* =========================
   Leads Tab
========================= */
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

    <div class="crs-tablewrap" id="wrap"></div>
    <div id="modalHost"></div>
  `;

  const citySel = $("#city", host);
  const sourceSel = $("#source", host);
  const statusSel = $("#status", host);

  fillSelect(citySel, state.dict.cities || [], true);
  fillSelect(sourceSel, state.dict.sources || [], true);
  fillStatusSelect(statusSel);

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

    const data = await apiLeadsList(params.toString());
    const list = data.items || data.leads || data.courses || data.rows || [];
    ctx.leadsCache = list;
    $("#wrap", host).innerHTML = leadsTableHtml(ctx, list);
  };

  $("#btnAdd", host).onclick = () => openLeadForm({ ctx, host, mode: "create", onSaved: loadAndRender });
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

  $("#wrap", host).onclick = async (e) => {
    const btn = e.target.closest("button[data-act]");
    const link = e.target.closest("[data-open]");
    const act = btn?.dataset?.act || null;

    // open view by clicking name
    if (!act && link) {
      const id = Number(link.dataset.open);
      return openLeadView({ ctx, host, id });
    }
    if (!act) return;

    const id = Number(btn.dataset.id);
    if (!id) return;

    if (act === "view") return openLeadView({ ctx, host, id });
    if (act === "edit") return openLeadForm({ ctx, host, mode: "edit", id, onSaved: loadAndRender });
    if (act === "del") return deleteLead({ ctx, host, id, onDone: loadAndRender });
  };

  refreshDeletedBtn();
  await loadAndRender();
}

function leadsTableHtml(ctx, items) {
  if (!items?.length) return `<div class="muted" style="padding:14px">${t("notFound")}</div>`;

  const cities = state.dict.cities || [];
  const sources = state.dict.sources || [];

  const phoneText = (x) => {
    const p1 = (x.phone1 || x.phone || "").trim();
    const p2 = (x.phone2 || "").trim();
    if (p1 && p2) return `${p1} / ${p2}`;
    return p1 || p2 || "";
  };

  const statusPill = (st) => {
    const s = String(st || "").trim() || "new";
    return `<span class="badge st">${esc(s)}</span>`;
  };

  return `
    <table class="crs-t">
      <thead>
        <tr>
          <th>${tr("code", "Code")}</th>
          <th>${t("fullName")}</th>
          <th>${tr("phone", "Phone")}</th>
          <th>${tr("company", "Company")}</th>
          <th>${t("city")}</th>
          <th>${t("source")}</th>
          <th>${tr("status", "Status")}</th>
          <th>${t("createdAt")}</th>
          <th style="text-align:right">${t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((x) => {
          const del = Number(x.is_deleted) === 1;
          const cityName = x.city_name || pick(cities, x.city_id) || "";
          const srcName = x.source_name || pick(sources, x.source_id) || "";
          return `
            <tr style="${del ? "opacity:.55" : ""}">
              <td>${esc(x.code || "")}${del ? ` <span class="badge del">${t("deleted")}</span>` : ""}</td>
              <td>
                <button class="linkbtn" data-open="${x.id}">
                  <b>${esc(x.full_name || "")}</b>
                </button>
                ${x.company ? `<div class="mini muted">${esc(x.company)}</div>` : ""}
              </td>
              <td>${esc(phoneText(x))}</td>
              <td>${esc(x.company || "")}</td>
              <td>${esc(cityName)}</td>
              <td>${esc(srcName)}</td>
              <td>${statusPill(x.status)}</td>
              <td>${formatTs(x.created_at)}</td>
              <td>
                <div class="crs-actions">
                  <button class="btn icon" data-act="edit" data-id="${x.id}" title="${esc(t("edit"))}">
                    <span class="ico"><img src="/assets/icons/edit.svg" alt="" /></span>
                  </button>
                  ${del ? "" : `
                    <button class="btn icon danger" data-act="del" data-id="${x.id}" title="${esc(t("delete"))}">
                      <span class="ico"><img src="/assets/icons/delete.svg" alt="" /></span>
                    </button>
                  `}
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

/* =========================
   Lead Form (create/edit)
========================= */
async function openLeadForm({ ctx, host, mode, id, onSaved }) {
  const isEdit = mode === "edit";
  const modalHost = ensureModalHost();

  let lead = null;
  if (isEdit) {
    try {
      const data = await apiLeadGet(id);
      lead = data.item || data.lead || data.row || data;
    } catch (e) {
      notify(tr("failedToLoad", "Failed to load"), "error");
      return;
    }
  }

  const cities = (state.dict.cities || []).filter((x) => x.active !== 0);
  const sources = (state.dict.sources || []).filter((x) => x.active !== 0);

  modalHost.innerHTML = `
    <div class="mb">
      <div class="m">
        <div class="mh">
          <b>${isEdit ? tr("editLead", "Edit lead") : tr("addLead", "Add lead")}</b>
          <button class="btn" id="mClose">✕</button>
        </div>
        <div class="mbo">

          <div class="grid2">
            <div class="field">
              <div class="label">${t("fullName")}</div>
              <input class="input" id="mFull" value="${esc(lead?.full_name || "")}" />
            </div>
            <div class="field">
              <div class="label">${tr("company", "Company")}</div>
              <input class="input" id="mCompany" value="${esc(lead?.company || "")}" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${tr("phone1", "Phone 1")}</div>
              <input class="input" id="mP1" value="${esc(lead?.phone1 || lead?.phone || "")}" />
            </div>
            <div class="field">
              <div class="label">${tr("phone2", "Phone 2")}</div>
              <input class="input" id="mP2" value="${esc(lead?.phone2 || "")}" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("city")}</div>
              <select class="input" id="mCity">
                <option value="">—</option>
                ${cities.sort((a,b)=>String(a.name).localeCompare(String(b.name)))
                  .map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
              </select>
            </div>

            <div class="field">
              <div class="label">${t("source")}</div>
              <select class="input" id="mSource">
                <option value="">—</option>
                ${sources.sort((a,b)=>String(a.name).localeCompare(String(b.name)))
                  .map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${tr("status", "Status")}</div>
              <select class="input" id="mStatus"></select>
            </div>
            <div class="field">
              <div class="label">${tr("comment", "Comment")}</div>
              <textarea class="input" id="mComment">${esc(lead?.comment || lead?.notes || "")}</textarea>
            </div>
          </div>

          <div class="row right" style="margin-top:14px">
            <button class="btn" id="mCancel">${t("cancel")}</button>
            <button class="btn primary" id="mSave">${t("save")}</button>
          </div>

        </div>
      </div>
    </div>
  `;

  const close = () => (modalHost.innerHTML = "");
  $("#mClose", modalHost).onclick = close;
  $("#mCancel", modalHost).onclick = close;
  modalHost.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  $("#mCity", modalHost).value = lead?.city_id ?? "";
  $("#mSource", modalHost).value = lead?.source_id ?? "";

  const mStatus = $("#mStatus", modalHost);
  fillStatusSelect(mStatus, true);
  mStatus.value = lead?.status ?? "new";

  $("#mSave", modalHost).onclick = async () => {
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
      status: ($("#mStatus", modalHost).value || "new").trim(),
    };

    try {
      if (isEdit) await apiLeadUpdate(id, payload);
      else await apiLeadCreate(payload);
      close();
      notify(tr("saved", "Saved"), "success");
      await onSaved?.();
    } catch (e) {
      notify(tr("saveFailed", "Save failed"), "error");
    }
  };
}

/* =========================
   Lead View + Enrollments
========================= */
async function openLeadView({ ctx, host, id }) {
  const modalHost = ensureModalHost();


  let lead = null;
  try {
    const data = await apiLeadGet(id);
    lead = data.item || data.lead || data.row || data;
  } catch {
    notify(tr("failedToLoad", "Failed to load"), "error");
    return;
  }

  const cityName = lead.city_name || pick(state.dict.cities, lead.city_id) || "—";
  const srcName = lead.source_name || pick(state.dict.sources, lead.source_id) || "—";
  const phones = [lead.phone1 || lead.phone || "", lead.phone2 || ""].filter(Boolean).join(" / ") || "—";

  modalHost.innerHTML = `
    <div class="mb">
      <div class="m">
        <div class="mh">
          <div>
            <b>${esc(lead.full_name || "")}</b>
            <div class="mini muted">${esc(lead.code || "")}</div>
          </div>
          <button class="btn" id="vClose">✕</button>
        </div>

        <div class="mbo">
          <div class="kv">
            <div class="k">${tr("phone", "Phone")}</div><div class="v">${esc(phones)}</div>
            <div class="k">${tr("company", "Company")}</div><div class="v">${esc(lead.company || "—")}</div>
            <div class="k">${t("city")}</div><div class="v">${esc(cityName)}</div>
            <div class="k">${t("source")}</div><div class="v">${esc(srcName)}</div>
            <div class="k">${tr("status", "Status")}</div><div class="v"><span class="badge st">${esc(lead.status || "new")}</span></div>
            <div class="k">${t("createdAt")}</div><div class="v">${esc(formatTs(lead.created_at))}</div>
          </div>

          ${lead.comment ? `
            <div class="sec">
              <div class="k">${tr("comment", "Comment")}</div>
              <div class="v" style="font-weight:500; opacity:.92">${esc(lead.comment)}</div>
            </div>
          ` : ""}

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

        </div>
      </div>
    </div>
  `;

  const close = () => (modalHost.innerHTML = "");
  $("#vClose", modalHost).onclick = close;
  modalHost.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  // link with clients base
  $("#btnFindClient", modalHost).onclick = async () => {
    const q = String(lead.phone1 || lead.phone || "").trim();
    if (!q) return notify(tr("noPhone", "No phone"), "error");
    try {
      const r = await apiFetch(`/clients?q=${encodeURIComponent(q)}`, { silent: true });
      const list = r.clients || r.items || [];
      if (!list.length) return notify(tr("clientNotFound", "Client not found"), "error");
      // open first match
      location.hash = `#/clients/${list[0].id}`;
      close();
    } catch {
      notify(tr("clientNotFound", "Client not found"), "error");
    }
  };

  $("#btnMakeClient", modalHost).onclick = async () => {
    try {
      await apiFetch(`/clients`, {
        method: "POST",
        body: {
          company_name: lead.company || lead.full_name || "Client",
          full_name: lead.full_name || null,
          phone1: lead.phone1 || lead.phone || null,
          phone2: lead.phone2 || null,
          city_id: lead.city_id ?? null,
          source_id: lead.source_id ?? null,
          sphere: null,
          comment: lead.comment || null,
        },
      });
      notify(tr("saved", "Saved"), "success");
    } catch {
      notify(tr("saveFailed", "Save failed"), "error");
    }
  };

  const renderEnrollments = async () => {
    const wrap = $("#enrollWrap", modalHost);
    try {
      const data = await apiEnrollList(id);
      const items = data.items || data.enrollments || data.rows || [];
      wrap.innerHTML = enrollmentsHtml(items);
      wrap.onclick = async (e) => {
        const b = e.target.closest("button[data-eact]");
        if (!b) return;
        const eact = b.dataset.eact;
        const eid = Number(b.dataset.id);
        const row = items.find((x) => Number(x.id) === eid);
        if (!row) return;

        if (eact === "edit") return openEnrollForm({ modalHost, leadId: id, mode: "edit", row, onSaved: renderEnrollments });
        if (eact === "del") return confirmModal({
          modalHost,
          title: tr("confirmDelete", "Delete?"),
          text: tr("confirmDeleteEnrollmentText", "Delete enrollment"),
          okText: t("yes"),
          cancelText: t("no"),
          onOk: async () => { await apiEnrollDelete(eid); notify(tr("saved", "Saved"), "success"); await renderEnrollments(); }
        });
      };
    } catch {
      wrap.innerHTML = `<div class="muted">${tr("enrollmentsSoon", "Enrollments — keyingi bosqichda.")}</div>`;
    }
  };

  $("#btnAddEnroll", modalHost).onclick = () =>
    openEnrollForm({ modalHost, leadId: id, mode: "create", row: null, onSaved: renderEnrollments });

  await renderEnrollments();
};

function enrollmentsHtml(items) {
  if (!items?.length) return `<div class="muted">${tr("noEnrollments", "No enrollments yet")}</div>`;

  return `
    <div class="crs-tablewrap" style="max-height:320px">
      <table class="crs-t" style="min-width:920px">
        <thead>
          <tr>
            <th>${tr("course", "Course")}</th>
            <th>${tr("status", "Status")}</th>
            <th>${tr("note", "Note")}</th>
            <th>${t("createdAt")}</th>
            <th style="text-align:right">${t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((x) => `
            <tr>
              <td><b>${esc(x.course_name || x.course || x.course_title || x.course_id || "")}</b></td>
              <td><span class="badge st">${esc(x.status || "")}</span></td>
              <td class="muted">${esc((x.note || "").slice(0, 80))}</td>
              <td>${formatTs(x.created_at)}</td>
              <td>
                <div class="crs-actions">
                  <button class="btn icon" data-eact="edit" data-id="${x.id}" title="${esc(t("edit"))}">
                    <span class="ico"><img src="/assets/icons/edit.svg" alt="" /></span>
                  </button>
                  <button class="btn icon danger" data-eact="del" data-id="${x.id}" title="${esc(t("delete"))}">
                    <span class="ico"><img src="/assets/icons/delete.svg" alt="" /></span>
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

async function openEnrollForm({ modalHost, leadId, mode, row, onSaved }) {
  const isEdit = mode === "edit";

  // try load catalog for select
  let catalog = [];
  try {
    const c = await apiCatalogList();
    catalog = c.items || c.courses || c.rows || [];
  } catch {}

  // mini modal inside current modal
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="mb">
      <div class="m" style="width:min(720px, calc(100vw - 24px))">
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
                ${catalog.map((x) => `<option value="${x.id}">${esc(x.name || x.title || x.course_name || ("#" + x.id))}</option>`).join("")}
              </select>
              ${!catalog.length ? `<div class="mini muted" style="margin-top:6px">${tr("catalogMissing", "Catalog is empty / not configured yet")}</div>` : ""}
            </div>
            <div class="field">
              <div class="label">${tr("status", "Status")}</div>
              <select class="input" id="eStatus">
                ${["planned","paid","studying","finished","canceled"].map((s) => `<option value="${s}">${esc(s)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="field" style="margin-top:10px">
            <div class="label">${tr("note", "Note")}</div>
            <textarea class="input" id="eNote">${esc(row?.note || "")}</textarea>
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

  if (isEdit) {
    $("#eCourse", wrap).value = row.course_id ?? "";
    $("#eStatus", wrap).value = row.status ?? "planned";
    $("#eNote", wrap).value = row.note ?? "";
  }

  $("#eSave", wrap).onclick = async () => {
    const status = ($("#eStatus", wrap).value || "").trim();
    const note = $("#eNote", wrap).value.trim() || null;

    try {
      if (isEdit) {
        await apiEnrollUpdate(row.id, { status, note });
      } else {
        const course_id = $("#eCourse", wrap).value ? Number($("#eCourse", wrap).value) : null;
        if (!course_id) return notify(tr("pickCourse", "Pick a course"), "error");
        await apiEnrollCreate(leadId, { course_id, status: status || "planned", note });
      }

      close();
      notify(tr("saved", "Saved"), "success");
      await onSaved?.();
    } catch {
      notify(tr("saveFailed", "Save failed"), "error");
    }
  };
}

/* =========================
   Delete Lead
========================= */
function deleteLead({ ctx, host, id, onDone }) {
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
      } catch {
        notify(tr("deleteFailed", "Delete failed"), "error");
      }
    },
  });
}

/* =========================
   Catalog Tab (optional)
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

    <div id="modalHost"></div>
  `;

  let cache = [];

  const loadAndRender = async () => {
    const q = ($("#cq", host).value || "").trim().toLowerCase();

    try {
      const data = await apiCatalogList();
      const list = data.items || data.courses || data.rows || [];
      cache = list;

      const filtered = q
        ? list.filter((x) => String(x.name || x.title || "").toLowerCase().includes(q))
        : list;

      $("#cwrap", host).innerHTML = catalogTableHtml(filtered);
    } catch {
      $("#cwrap", host).innerHTML = `<div class="muted" style="padding:14px">${tr("catalogSoon", "Catalog — keyingi bosqichda.")}</div>`;
    }
  };

  $("#btnAddCourse", host).onclick = () => openCourseForm({ host, mode: "create", row: null, onSaved: loadAndRender });
  $("#btnReloadCourse", host).onclick = loadAndRender;
  $("#cq", host).oninput = debounce(loadAndRender, 250);

  $("#cwrap", host).onclick = (e) => {
    const b = e.target.closest("button[data-cact]");
    if (!b) return;
    const act = b.dataset.cact;
    const id = Number(b.dataset.id);
    const row = cache.find((x) => Number(x.id) === id);
    if (!row) return;

    if (act === "edit") return openCourseForm({ host, mode: "edit", row, onSaved: loadAndRender });
    if (act === "del") return confirmModal({
      modalHost: ensureModalHost(),
      title: tr("confirmDelete", "Delete?"),
      text: esc(row.name || row.title || ""),
      okText: t("yes"),
      cancelText: t("no"),
      onOk: async () => { await apiCatalogDelete(id); notify(tr("saved", "Saved"), "success"); await loadAndRender(); }
    });
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
          <th style="text-align:right">${t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((x) => `
          <tr>
            <td>${esc(x.id)}</td>
            <td><b>${esc(x.name || x.title || "")}</b></td>
            <td>${esc(x.price ?? "")}</td>
            <td>
              <div class="crs-actions">
                <button class="btn icon" data-cact="edit" data-id="${x.id}" title="${esc(t("edit"))}">
                  <span class="ico"><img src="/assets/icons/edit.svg" alt="" /></span>
                </button>
                <button class="btn icon danger" data-cact="del" data-id="${x.id}" title="${esc(t("delete"))}">
                  <span class="ico"><img src="/assets/icons/delete.svg" alt="" /></span>
                </button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openCourseForm({ host, mode, row, onSaved }) {
  const isEdit = mode === "edit";
  const modalHost = $("#modalHost", host);

  modalHost.innerHTML = `
    <div class="mb">
      <div class="m" style="width:min(720px, calc(100vw - 24px))">
        <div class="mh">
          <b>${isEdit ? tr("editCourse", "Edit course") : tr("addCourse", "Add course")}</b>
          <button class="btn" id="cClose">✕</button>
        </div>
        <div class="mbo">

          <div class="grid2">
            <div class="field">
              <div class="label">${tr("name", "Name")}</div>
              <input class="input" id="cName" value="${esc(row?.name || row?.title || "")}" />
            </div>
            <div class="field">
              <div class="label">${tr("price", "Price")}</div>
              <input class="input" id="cPrice" value="${esc(row?.price ?? "")}" />
            </div>
          </div>

          <div class="row right" style="margin-top:14px">
            <button class="btn" id="cCancel">${t("cancel")}</button>
            <button class="btn primary" id="cSave">${t("save")}</button>
          </div>

        </div>
      </div>
    </div>
  `;

  const close = () => (modalHost.innerHTML = "");
  $("#cClose", modalHost).onclick = close;
  $("#cCancel", modalHost).onclick = close;
  modalHost.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  $("#cSave", modalHost).onclick = async () => {
    const name = $("#cName", modalHost).value.trim();
    if (!name) return notify(tr("requiredName", "Name is required"), "error");

    const priceRaw = $("#cPrice", modalHost).value.trim();
    const price = priceRaw === "" ? null : Number(priceRaw);

    try {
      if (isEdit) await apiCatalogUpdate(row.id, { name, price });
      else await apiCatalogCreate({ name, price });
      close();
      notify(tr("saved", "Saved"), "success");
      await onSaved?.();
    } catch {
      notify(tr("saveFailed", "Save failed"), "error");
    }
  };
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

/* =========================
   Dict preload + selects
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
  const opts = [
    ["new", tr("statusNew", "new")],
    ["contacted", tr("statusContacted", "contacted")],
    ["planned", tr("statusPlanned", "planned")],
    ["paid", tr("statusPaid", "paid")],
    ["studying", tr("statusStudying", "studying")],
    ["finished", tr("statusFinished", "finished")],
    ["canceled", tr("statusCanceled", "canceled")],
  ];
  sel.innerHTML =
    `${allowEmpty ? `<option value="">${tr("all", "All")}</option>` : ""}` +
    opts.map(([v, lbl]) => `<option value="${esc(v)}">${esc(lbl)}</option>`).join("");
}
