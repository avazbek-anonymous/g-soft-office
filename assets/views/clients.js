import { state } from "../core/state.js";
import { t } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";

const $ = (sel, el=document) => el.querySelector(sel);

export async function renderClients(view) {
  view.innerHTML = `
    <div class="card cl">
      <div class="hd">
        <b>${t("clientsBase")}</b>
        <span class="muted">${t("clients")}</span>
      </div>
      <div class="bd">
        <div class="cl-top">
          <button class="btn primary" id="btnAdd">＋ ${t("newClient")}</button>
          <button class="btn" id="btnReload">⟲ ${t("reload")}</button>

          <button class="btn" id="btnToggleActive"></button>

          <div class="field cl-search">
            <input class="input" id="q" placeholder="${t("search")}..." />
          </div>
        </div>

        <div class="cl-tablewrap" id="tblWrap"></div>
      </div>
    </div>

    <div id="modalHost"></div>

    <style>
      .cl-top{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
      .cl-search{margin-left:auto; min-width:280px; max-width:380px}
      @media(max-width:920px){ .cl-search{min-width:160px} }

      .cl-tablewrap{margin-top:12px; overflow:auto; border-radius:14px; border:1px solid rgba(255,255,255,.10)}
      body[data-theme="light"] .cl-tablewrap{border-color: rgba(0,0,0,.10)}
      table.cl-t{width:100%; border-collapse:collapse; min-width:980px}
      .cl-t th,.cl-t td{padding:12px; border-bottom:1px solid rgba(255,255,255,.08); text-align:left; vertical-align:middle}
      body[data-theme="light"] .cl-t th, body[data-theme="light"] .cl-t td{border-bottom-color: rgba(0,0,0,.08)}
      .cl-t thead th{font-size:12px; opacity:.75; position:sticky; top:0; background:rgba(10,14,25,.85); backdrop-filter: blur(10px)}
      body[data-theme="light"] .cl-t thead th{background:rgba(255,255,255,.85)}
      .cl-actions{display:flex; gap:8px; flex-wrap:wrap}
      .badge{display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,.12); opacity:.85}
      body[data-theme="light"] .badge{border-color: rgba(0,0,0,.12)}
      .badge.on{background:rgba(34,197,94,.14); border-color:rgba(34,197,94,.35)}
      .badge.off{background:rgba(148,163,184,.10)}

      /* Modal */
      .mb{position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:9999}
      .m{width:min(860px, calc(100vw - 24px)); background:var(--bg, #0b1020); border:1px solid rgba(255,255,255,.12); border-radius:16px; overflow:hidden}
      body[data-theme="light"] .m{background:#fff; border-color: rgba(0,0,0,.12)}
      .mh{display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08)}
      body[data-theme="light"] .mh{border-bottom-color: rgba(0,0,0,.08)}
      .mbo{padding:14px}
      .grid2{display:grid; grid-template-columns:1fr 1fr; gap:10px}
      @media (max-width: 900px){ .grid2{grid-template-columns:1fr} }
    </style>
  `;

  await preloadDict();
  let onlyActive = true;

  const renderToggle = () => {
    $("#btnToggleActive", view).textContent = onlyActive ? t("onlyActive") : t("showAll");
  };

  const loadAndRender = async () => {
    const q = $("#q", view).value.trim();
    const data = await apiFetch(`/clients?q=${encodeURIComponent(q)}&only_active=${onlyActive ? "1" : "0"}`);
    const items = data.items || data.clients || [];
    $("#tblWrap", view).innerHTML = tableHtml(items);
  };

  $("#btnAdd", view).onclick = () => openClientModal({
    mode:"create",
    onSaved: async () => { toast(t("saved")); await loadAndRender(); }
  });

  $("#btnReload", view).onclick = loadAndRender;

  $("#btnToggleActive", view).onclick = async () => {
    onlyActive = !onlyActive;
    renderToggle();
    await loadAndRender();
  };

  $("#q", view).oninput = debounce(loadAndRender, 250);

  // table actions
  $("#tblWrap", view).onclick = async (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    const id = Number(btn.dataset.id);
    const row = btn.closest("tr");
    const itemJson = row?.dataset?.item;
    const item = itemJson ? JSON.parse(itemJson) : null;

    if (act === "edit" && item) {
      openClientModal({
        mode:"edit",
        client:item,
        onSaved: async () => { toast(t("saved")); await loadAndRender(); }
      });
    }

    if (act === "del" && item) {
      confirmModal({
        title: t("confirmDeleteClient"),
        text: item.name || "",
        okText: t("yes"),
        cancelText: t("no"),
        onOk: async () => {
          // backend: try /clients/:id/delete; if not exists -> PATCH active=0
          try {
            await apiFetch(`/clients/${id}/delete`, { method:"POST" });
          } catch {
            await apiFetch(`/clients/${id}`, { method:"PATCH", body:{ active:false } });
          }
          toast(t("saved"));
          await loadAndRender();
        }
      });
    }
  };

  renderToggle();
  await loadAndRender();
}

/* ========= HTML ========= */
function tableHtml(items) {
  if (!items.length) return `<div class="muted" style="padding:14px">${t("notFound")}</div>`;

  const cityName = (id) => (state.dict.cities || []).find(x => Number(x.id) === Number(id))?.name || "";
  const sourceName = (id) => (state.dict.sources || []).find(x => Number(x.id) === Number(id))?.name || "";

  return `
    <table class="cl-t">
      <thead>
        <tr>
          <th>ID</th>
          <th>${t("clientName")}</th>
          <th>${t("phone")}</th>
          <th>${t("telegram")}</th>
          <th>${t("city")}</th>
          <th>${t("source")}</th>
          <th>${t("notes")}</th>
          <th>${t("active")}</th>
          <th>${t("actions")}</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(c => {
          const active = c.active !== 0 && c.is_deleted !== 1;
          return `
            <tr data-item='${escapeAttrJson(c)}' style="${active ? "" : "opacity:.55"}">
              <td>${esc(c.id)}</td>
              <td><b>${esc(c.name || "")}</b></td>
              <td>${esc(c.phone || "")}</td>
              <td>${esc(c.telegram || "")}</td>
              <td>${esc(cityName(c.city_id))}</td>
              <td>${esc(sourceName(c.source_id))}</td>
              <td class="muted">${esc((c.notes || "").slice(0, 60))}</td>
              <td>${active ? `<span class="badge on">${t("active")}</span>` : `<span class="badge off">${t("inactive")}</span>`}</td>
              <td>
                <div class="cl-actions">
                  <button class="btn" data-act="edit" data-id="${c.id}">${t("edit")}</button>
                  <button class="btn danger" data-act="del" data-id="${c.id}">${t("delete")}</button>
                </div>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

/* ========= Modal ========= */
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
              <div class="label">${t("clientName")}</div>
              <input class="input" id="mName" value="${esc(client?.name || "")}" />
            </div>
            <div class="field">
              <div class="label">${t("phone")}</div>
              <input class="input" id="mPhone" value="${esc(client?.phone || "")}" />
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("telegram")}</div>
              <input class="input" id="mTg" value="${esc(client?.telegram || "")}" />
            </div>
            <div class="field">
              <div class="label">${t("city")}</div>
              <select class="input" id="mCity">
                <option value="">—</option>
                ${cities.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="grid2" style="margin-top:10px">
            <div class="field">
              <div class="label">${t("source")}</div>
              <select class="input" id="mSource">
                <option value="">—</option>
                ${sources.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <div class="label">${t("notes")}</div>
              <input class="input" id="mNotes" value="${esc(client?.notes || "")}" />
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

  // set defaults
  $("#mCity").value = client?.city_id ?? "";
  $("#mSource").value = client?.source_id ?? "";

  $("#mSave").onclick = async () => {
    const name = $("#mName").value.trim();
    if (!name) return toast(t("error"), "name required", "err");

    const payload = {
      name,
      phone: $("#mPhone").value.trim(),
      telegram: $("#mTg").value.trim(),
      city_id: $("#mCity").value ? Number($("#mCity").value) : null,
      source_id: $("#mSource").value ? Number($("#mSource").value) : null,
      notes: $("#mNotes").value.trim(),
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

/* ========= Confirm ========= */
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

/* ========= Dict preload ========= */
async function preloadDict() {
  if (state.dictReady) return;
  const [cities, sources] = await Promise.all([
    apiFetch("/dict/cities", { silent:true }).catch(() => ({items:[]})),
    apiFetch("/dict/sources", { silent:true }).catch(() => ({items:[]})),
  ]);
  state.dict.cities = cities.items || [];
  state.dict.sources = sources.items || [];
  state.dictReady = true;
}

/* ========= Helpers ========= */
function debounce(fn, ms=250) { let tmr=null; return (...a)=>{ clearTimeout(tmr); tmr=setTimeout(()=>fn(...a), ms); }; }
function esc(v){ return String(v ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }
function escapeAttrJson(obj){ return esc(JSON.stringify(obj)); }
