import { state } from "../core/state.js";
import { t } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";

const $ = (sel, el = document) => el.querySelector(sel);

export async function renderClients(view) {
  view.innerHTML = `
    <div class="card clx">
      <div class="hd">
        <b>${t("clientsBase")}</b>
        <span class="muted">${t("clients")}</span>
      </div>
      <div class="bd">

        <div class="clx-top">
          <button class="btn primary" id="btnAdd">＋ ${t("newClient")}</button>
          <button class="btn" id="btnReload">⟲ ${t("reload")}</button>
          <button class="btn" id="btnDeleted"></button>

          <div class="field clx-search">
            <input class="input" id="q" placeholder="${t("search")}..." />
          </div>
        </div>

        <div class="clx-filters">
          <div class="muted" style="font-size:12px">${t("filters")}</div>

          <div class="field">
            <div class="label">${t("city")}</div>
            <select class="input" id="city">
              <option value="">—</option>
            </select>
          </div>

          <div class="field">
            <div class="label">${t("source")}</div>
            <select class="input" id="source">
              <option value="">—</option>
            </select>
          </div>

          <div class="clx-sp"></div>

          <button class="btn" id="btnClear">${t("clear")}</button>
        </div>

        <!-- scroll only here -->
        <div class="clx-tablewrap" id="wrap"></div>
      </div>
    </div>

    <div id="modalHost"></div>

    <style>
      .clx-top{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
      .clx-search{margin-left:auto; min-width:280px; max-width:380px}
      @media(max-width:920px){ .clx-search{min-width:160px} }

      .btn.icon .ico img{
      width:20px;
      height:20px;
      display:block;
      opacity:.95;
      filter: invert(1);
      }
      .btn.icon.danger .ico img{
      filter: drop-shadow(0 0 0 rgba(0,0,0,0)) invert(1);
      }


      .clx-filters{
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
      body[data-theme="light"] .clx-filters{
        border-color: rgba(0,0,0,.10);
        background: rgba(0,0,0,.02);
      }
      .clx-sp{flex:1}

      /* ✅ scroll ONLY for list */
      .clx-tablewrap{
        margin-top:12px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.10);
        overflow:auto;
        max-height: calc(100vh - 320px); /* adjust if needed */
      }
      @media(max-width:920px){
        .clx-tablewrap{max-height: calc(100vh - 280px);}
      }
      body[data-theme="light"] .clx-tablewrap{border-color: rgba(0,0,0,.10)}

      .clx-tablewrap::-webkit-scrollbar{height:10px;width:10px}
      .clx-tablewrap::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12); border-radius:999px}
      body[data-theme="light"] .clx-tablewrap::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12)}

      table.clx-t{width:100%; border-collapse:collapse; min-width:1180px}
      .clx-t th,.clx-t td{padding:12px; border-bottom:1px solid rgba(255,255,255,.08); text-align:left; vertical-align:middle}
      body[data-theme="light"] .clx-t th, body[data-theme="light"] .clx-t td{border-bottom-color: rgba(0,0,0,.08)}

      .clx-t thead th{
        font-size:12px;
        opacity:.75;
        position:sticky;
        top:0;
        z-index:2;
        background:rgba(10,14,25,.85);
        backdrop-filter: blur(10px);
      }
      body[data-theme="light"] .clx-t thead th{background:rgba(255,255,255,.85)}

      .clx-actions{display:contents; gap:8px; flex-wrap:wrap; justify-content:flex-end}

      .badge{display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,.12); opacity:.85}
      body[data-theme="light"] .badge{border-color: rgba(0,0,0,.12)}
      .badge.del{background:rgba(239,68,68,.14); border-color:rgba(239,68,68,.35)}

      /* ✅ icon buttons like in settings */
      .btn.icon{
        width:36px; height:36px;
        padding:0;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border-radius:12px;
      }
      .btn.icon .ico{font-size:16px; line-height:1}
      .btn.icon.danger{border-color: rgba(239,68,68,.35); background: rgba(239,68,68,.12)}
      body[data-theme="light"] .btn.icon.danger{background: rgba(239,68,68,.10)}

      /* Modal */
      .mb{position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:9999}
      .m{width:min(920px, calc(100vw - 24px)); background:var(--bg, #0b1020); border:1px solid rgba(255,255,255,.12); border-radius:16px; overflow:hidden}
      body[data-theme="light"] .m{background:#fff; border-color: rgba(0,0,0,.12)}
      .mh{display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08)}
      body[data-theme="light"] .mh{border-bottom-color: rgba(0,0,0,.08)}
      .mbo{padding:14px}
      .grid2{display:grid; grid-template-columns:1fr 1fr; gap:10px}
      @media (max-width: 900px){ .grid2{grid-template-columns:1fr} }
      textarea.input{min-height:90px; resize:vertical}

      .link{color:inherit; text-decoration:none}
      .link:hover{text-decoration:underline}
    </style>
  `;

  await preloadDictClients();

  let includeDeleted = false;
  let clientsCache = [];

  const citySel = $("#city", view);
  const sourceSel = $("#source", view);

  // fill selects
  fillSelect(citySel, state.dict.cities || []);
  fillSelect(sourceSel, state.dict.sources || []);

  const refreshDeletedBtn = () => {
    $("#btnDeleted", view).textContent = includeDeleted ? t("hideDeleted") : t("showDeleted");
  };

  const loadAndRender = async () => {
    const q = $("#q", view).value.trim();
    const city_id = citySel.value || "";
    const source_id = sourceSel.value || "";

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (includeDeleted) params.set("include_deleted", "1");
    if (city_id) params.set("city_id", city_id);
    if (source_id) params.set("source_id", source_id);

    const data = await apiFetch(`/clients${params.toString() ? "?" + params.toString() : ""}`);
    const list = data.clients || data.items || [];
    clientsCache = list;
    $("#wrap", view).innerHTML = tableHtml(list);
  };

  // UI events
  $("#btnAdd", view).onclick = () => openClientModal({
    mode: "create",
    onSaved: async () => { toast(t("saved")); await loadAndRender(); }
  });

  $("#btnReload", view).onclick = loadAndRender;

  $("#btnDeleted", view).onclick = async () => {
    includeDeleted = !includeDeleted;
    refreshDeletedBtn();
    await loadAndRender();
  };

  $("#btnClear", view).onclick = async () => {
    $("#q", view).value = "";
    citySel.value = "";
    sourceSel.value = "";
    await loadAndRender();
  };

  $("#q", view).oninput = debounce(loadAndRender, 250);
  citySel.onchange = loadAndRender;
  sourceSel.onchange = loadAndRender;

  // table actions
  $("#wrap", view).onclick = async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;

    const act = btn.dataset.act;
    const id = Number(btn.dataset.id);
    const c = clientsCache.find(x => Number(x.id) === id);
    if (!c) return;

    if (act === "edit") {
      openClientModal({
        mode:"edit",
        client: c,
        onSaved: async () => { toast(t("saved")); await loadAndRender(); }
      });
      return;
    }

    if (act === "del") {
      confirmModal({
        title: t("confirmDeleteClient"),
        text: `${c.company_name || ""}`,
        okText: t("yes"),
        cancelText: t("no"),
        onOk: async () => {
          await apiFetch(`/clients/${id}/delete`, { method:"POST" });
          toast(t("saved"));
          await loadAndRender();
        }
      });
      return;
    }
  };

  refreshDeletedBtn();
  await loadAndRender();
}

/* =========================
   Table
========================= */
function tableHtml(items) {
  if (!items?.length) return `<div class="muted" style="padding:14px">${t("notFound")}</div>`;

  const cityName = (row) => row.city_name || (state.dict.cities || []).find(x => Number(x.id) === Number(row.city_id))?.name || "";
  const sourceName = (row) => row.source_name || (state.dict.sources || []).find(x => Number(x.id) === Number(row.source_id))?.name || "";

  return `
    <table class="clx-t">
      <thead>
        <tr>
          <th>${t("companyName")}</th>
          <th>${t("fullName")}</th>
          <th>${t("phone1")}</th>
          <th>${t("phone2")}</th>
          <th>${t("city")}</th>
          <th>${t("source")}</th>
          <th>${t("sphere")}</th>
          <th>${t("comment")}</th>
          <th>${t("createdAt")}</th>
          <th style="text-align:right">${t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(c => {
          const del = Number(c.is_deleted) === 1;
          return `
            <tr style="${del ? "opacity:.55" : ""}">
              <td>
                <a class="link" href="#/clients/${c.id}">
                  <b>${esc(c.company_name || "")}</b>
                </a>
                ${del ? ` <span class="badge del">${t("deleted")}</span>` : ""}
              </td>
              <td>${esc(c.full_name || "")}</td>
              <td>${esc(c.phone1 || "")}</td>
              <td>${esc(c.phone2 || "")}</td>
              <td>${esc(cityName(c))}</td>
              <td>${esc(sourceName(c))}</td>
              <td>${esc(c.sphere || "")}</td>
              <td class="muted">${esc((c.comment || "").slice(0, 60))}</td>
              <td>${formatTs(c.created_at)}</td>
              <td>
                <div class="clx-actions">
                  <button class="btn icon" data-act="edit" data-id="${c.id}" title="${esc(t("edit"))}">
                    <span class="ico"><img src="/assets/icons/edit.svg" alt="" /></span>
                  </button>
                  ${del ? "" : `
                    <button class="btn icon danger" data-act="del" data-id="${c.id}" title="${esc(t("delete"))}">
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
   Modal
========================= */
function openClientModal({ mode, client, onSaved }) {
  const isEdit = mode === "edit";
  const host = $("#modalHost");

  const cities = state.dict.cities || [];
  const sources = state.dict.sources || [];

  host.innerHTML = `
    <div class="mb">
      <div class="m">
        <div class="mh">
          <b>${isEdit ? t("editClient") : t("newClient")}</b>
          <button class="btn" id="mClose">✕</button>
        </div>
        <div class="mbo">

          <div class="grid2">
            <div class="field">
              <div class="label">${t("companyName")}</div>
              <input class="input" id="mCompany" value="${esc(client?.company_name || "")}" />
            </div>
            <div class="field">
              <div class="label">${t("fullName")}</div>
              <input class="input" id="mFull" value="${esc(client?.full_name || "")}" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("phone1")}</div>
              <input class="input" id="mP1" value="${esc(client?.phone1 || "")}" />
            </div>
            <div class="field">
              <div class="label">${t("phone2")}</div>
              <input class="input" id="mP2" value="${esc(client?.phone2 || "")}" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("city")}</div>
              <select class="input" id="mCity">
                <option value="">—</option>
                ${cities.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
              </select>
            </div>

            <div class="field">
              <div class="label">${t("source")}</div>
              <select class="input" id="mSource">
                <option value="">—</option>
                ${sources.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("sphere")}</div>
              <select class="input" id="mSphere">
                <option value="">—</option>
                ${(state.dict.spheres || [])
                  .filter(x => x.active !== 0)
                  .sort((a,b) => String(a.name).localeCompare(String(b.name)))
                  .map(x => `<option value="${esc(x.name)}">${esc(x.name)}</option>`)
                  .join("")}
              </select>
            </div>

            <div class="field">
              <div class="label">${t("comment")}</div>
              <textarea class="input" id="mComment">${esc(client?.comment || "")}</textarea>
            </div>
          </div>

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
  host.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  $("#mCity").value = client?.city_id ?? "";
  $("#mSource").value = client?.source_id ?? "";
  $("#mSphere").value = client?.sphere ?? "";

  $("#mSave").onclick = async () => {
    const company_name = $("#mCompany").value.trim();
    if (!company_name) return toast(t("error"), "company_name required", "err");

    const payload = {
      company_name,
      full_name: $("#mFull").value.trim() || null,
      phone1: $("#mP1").value.trim() || null,
      phone2: $("#mP2").value.trim() || null,
      city_id: $("#mCity").value ? Number($("#mCity").value) : null,
      source_id: $("#mSource").value ? Number($("#mSource").value) : null,
      sphere: ($("#mSphere").value || "").trim() || null,
      comment: $("#mComment").value.trim() || null,
    };

    if (!isEdit) {
      await apiFetch("/clients", { method:"POST", body: payload });
    } else {
      await apiFetch(`/clients/${client.id}`, { method:"PATCH", body: payload });
    }

    close();
    await onSaved?.();
  };
}

/* =========================
   Confirm modal
========================= */
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
          <div class="row" style="justify-content:flex-end; margin-top:14px">
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

/* =========================
   Dict preload
========================= */
async function preloadDictClients() {
  state.dict = state.dict || {};
  const needCities = !Array.isArray(state.dict.cities);
  const needSources = !Array.isArray(state.dict.sources);
  const needSpheres = !Array.isArray(state.dict.spheres);

  if (!needCities && !needSources && !needSpheres) return;

  const [cities, sources, spheres] = await Promise.all([
    apiFetch("/dict/cities",   { silent:true }).catch(() => ({ items: [] })),
    apiFetch("/dict/sources",  { silent:true }).catch(() => ({ items: [] })),
    apiFetch("/dict/spheres",  { silent:true }).catch(() => ({ items: [] })),
  ]);

  state.dict.cities = cities.items || [];
  state.dict.sources = sources.items || [];
  state.dict.spheres = spheres.items || [];
}

function fillSelect(sel, arr) {
  const options = arr
    .slice()
    .filter(x => x.active !== 0)
    .sort((a,b) => String(a.name).localeCompare(String(b.name)))
    .map(x => `<option value="${x.id}">${esc(x.name)}</option>`)
    .join("");
  sel.innerHTML = `<option value="">—</option>${options}`;
}

/* =========================
   Helpers
========================= */
function debounce(fn, ms=250) { let tt=null; return (...a)=>{ clearTimeout(tt); tt=setTimeout(()=>fn(...a), ms); }; }
function esc(v){ return String(v ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }
function formatTs(ts){
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "";
  const d = new Date(n * 1000);
  return new Intl.DateTimeFormat(undefined, { year:"numeric", month:"2-digit", day:"2-digit" }).format(d);
}
