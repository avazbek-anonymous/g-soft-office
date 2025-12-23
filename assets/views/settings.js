import { state } from "../core/state.js";
import { t } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";
import { applyTheme } from "../ui/theme.js";

const $ = (sel, el=document) => el.querySelector(sel);

const DICTS = [
  { key:"cities",   labelKey:"cities" },
  { key:"sources",  labelKey:"sources" },
  { key:"services", labelKey:"services" },
  { key:"spheres",  labelKey:"spheres" },
];

// icons
const I_EDIT = "<img src=\"/assets/icons/edit.svg\" alt=\"\" />";
const I_TRASH = "<img src=\"/assets/icons/delete.svg\" alt=\"\" />";
const I_RESTORE = "↺";

export async function renderSettings(view) {
  view.innerHTML = `
    <div class="card set">
      <div class="hd">
        <b>${t("settings")}</b>
        <span class="muted">${t("dictionaries")} · ${t("uiSettings")}</span>
      </div>

      <div class="bd">
        <div class="set-tabs">
          <button class="set-tab" data-tab="dict">${t("dictionaries")}</button>
          <button class="set-tab" data-tab="ui">${t("uiSettings")}</button>
          <div class="sp"></div>
          <button class="btn" id="btnDictReload">⟲ ${t("reload")}</button>
        </div>

        <div id="tabDict" class="set-panel"></div>
        <div id="tabUI" class="set-panel"></div>
      </div>
    </div>

    <div id="modalHost"></div>

    <style>
      .set-tabs{display:flex; gap:8px; align-items:center; margin:6px 0 14px}
      .set-tab{border:1px solid rgba(255,255,255,.12); background:transparent; padding:8px 12px; border-radius:12px; cursor:pointer}
      body[data-theme="light"] .set-tab{border-color: rgba(0,0,0,.12)}
      .set-tab.active{background:rgba(34,197,94,.12); border-color: rgba(34,197,94,.45)}
      .set-tabs .sp{flex:1}

      .set-panel{display:none}
      .set-panel.active{display:block}

      .set-grid{display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:12px; align-items:stretch}
      .set-card{border:1px solid rgba(255,255,255,.10); border-radius:16px; overflow:hidden}
      body[data-theme="light"] .set-card{border-color: rgba(0,0,0,.10)}
      .set-card .h{display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; background:rgba(255,255,255,.02)}
      body[data-theme="light"] .set-card .h{background:rgba(0,0,0,.02)}
      .set-card .b{padding:12px 14px}

      .badge{display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,.12); opacity:.85}
      body[data-theme="light"] .badge{border-color: rgba(0,0,0,.12)}
      .badge.on{background:rgba(34,197,94,.14); border-color:rgba(34,197,94,.35)}
      .badge.off{background:rgba(148,163,184,.10)}

      .row2{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
      .right{margin-left:auto; display:flex; gap:8px; align-items:center; flex-wrap:wrap}

      /* Icon buttons */
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
      .m{width:min(860px, calc(100vw - 24px)); background:var(--bg, #0b1020); border:1px solid rgba(255,255,255,.12); border-radius:16px; overflow:hidden}
      body[data-theme="light"] .m{background:#fff; border-color: rgba(0,0,0,.12)}
      .mh{display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08)}
      body[data-theme="light"] .mh{border-bottom-color: rgba(0,0,0,.08)}
      .mbo{padding:14px}
      .grid2{display:grid; grid-template-columns:1fr 1fr; gap:10px}
      @media (max-width: 900px){ .grid2{grid-template-columns:1fr} }
    </style>
  `;

  const tabDict = $("#tabDict", view);
  const tabUI = $("#tabUI", view);

  // ensure dict cache
  await preloadDict(true);

  const setTab = (tab) => {
    view.querySelectorAll(".set-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    tabDict.classList.toggle("active", tab === "dict");
    tabUI.classList.toggle("active", tab === "ui");
    localStorage.setItem("settings_tab", tab);
  };

  view.querySelectorAll(".set-tab").forEach(btn => btn.onclick = () => setTab(btn.dataset.tab));
  setTab(localStorage.getItem("settings_tab") || "dict");

  $("#btnDictReload", view).onclick = async () => {
    await preloadDict(true);
    toast(t("saved"));
    renderSettings(view);
  };

  renderDictTab(tabDict);
  renderUiTab(tabUI);
}

/* =========================
   Dictionaries tab
========================= */
function renderDictTab(host) {
  host.innerHTML = `
    <div class="set-grid">
      ${DICTS.map(d => dictCardHtml(d.key, d.labelKey)).join("")}
    </div>

    <style>
      /* each dict card becomes a column with internal scroll */
      .dict-card{
        display:flex;
        flex-direction:column;
        height: clamp(380px, calc(100vh - 260px), 760px);
        min-height: 340px;
      }
      .dict-body{
        flex:1;
        overflow:hidden;
      }
      .dict-scroll{
        height:100%;
        overflow:auto;
        padding-right:6px;
      }

      .dict-scroll::-webkit-scrollbar{width:10px}
      .dict-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12); border-radius:999px}
      body[data-theme="light"] .dict-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12)}

      .dict-list{display:grid; gap:8px; margin-top:12px}
      .dict-row{
        display:flex; align-items:center; gap:10px;
        padding:10px 10px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:14px;
        background: rgba(255,255,255,.02);
      }
      body[data-theme="light"] .dict-row{
        border-color: rgba(0,0,0,.10);
        background: rgba(0,0,0,.02);
      }
      .dict-row.off{opacity:.55}
      .dict-name{font-weight:600}
      .dict-sp{flex:1}
      .dict-actions{display:flex; gap:8px; flex-wrap:wrap}
      .dict-empty{padding:10px; border:1px dashed rgba(255,255,255,.12); border-radius:14px; opacity:.75}
      body[data-theme="light"] .dict-empty{border-color: rgba(0,0,0,.12)}
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
    </style>
  `;

  // add
  host.querySelectorAll("[data-add]").forEach(btn => {
    btn.onclick = () => openDictAdd(btn.dataset.add, async () => {
      await preloadDict(true);
      renderDictTab(host);
    });
  });

  // actions (edit/toggle)
  host.onclick = async (e) => {
    const actBtn = e.target.closest("button[data-act]");
    if (!actBtn) return;

    const dictKey = actBtn.dataset.dict;
    const id = Number(actBtn.dataset.id);
    const act = actBtn.dataset.act;

    const items = state.dict[dictKey] || [];
    const item = items.find(x => Number(x.id) === id);
    if (!item) return;

    if (act === "edit") {
      openDictEdit(dictKey, item, async () => {
        await preloadDict(true);
        renderDictTab(host);
      });
      return;
    }

    if (act === "toggle") {
      const nextActive = item.active === 0 ? 1 : 0;
      await apiFetch(`/dict/${dictKey}/${id}`, { method:"PATCH", body:{ active: nextActive } });
      await preloadDict(true);
      toast(t("saved"));
      renderDictTab(host);
      return;
    }
  };
}

function dictCardHtml(dictKey, labelKey) {
  const items = (state.dict[dictKey] || []).slice()
    .sort((a,b) => (b.active||0) - (a.active||0) || String(a.name).localeCompare(String(b.name)));

  const activeCount = items.filter(x => x.active !== 0).length;

  return `
    <div class="set-card dict-card">
      <div class="h">
        <div>
          <b>${t(labelKey)}</b>
          <div class="muted">${activeCount}/${items.length}</div>
        </div>
        <div class="right">
          <button class="btn primary" data-add="${dictKey}">＋}</button>
          <span class="badge ${activeCount ? "on" : "off"}">${items.length}</span>
        </div>
      </div>

      <div class="b dict-body">
        <div class="dict-scroll">
          <div class="dict-list">
            ${
              items.length
                ? items.map(x => {
                    const isOff = x.active === 0;
                    const toggleTitle = isOff ? (t("restore") || "Enable") : (t("delete") || "Disable");
                    return `
                      <div class="dict-row ${isOff ? "off" : ""}">
                        <div>
                          <div class="dict-name">${esc(x.name)}</div>
                          <div class="muted" style="font-size:12px">ID: ${esc(x.id)}</div>
                        </div>
                        <div class="dict-sp"></div>
                        <div class="dict-actions">
                          <button class="btn icon" data-act="edit" data-dict="${dictKey}" data-id="${x.id}" title="${esc(t("edit") || "Edit")}">
                            <span class="ico">${I_EDIT}</span>
                          </button>
                          <button class="btn icon ${isOff ? "" : "danger"}"
                                  data-act="toggle" data-dict="${dictKey}" data-id="${x.id}"
                                  title="${esc(toggleTitle)}">
                            <span class="ico">${isOff ? I_RESTORE : I_TRASH}</span>
                          </button>
                        </div>
                      </div>
                    `;
                  }).join("")
                : `<div class="dict-empty">${t("notFound")}</div>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

/* =========================
   Add/Edit modals
========================= */
function openDictAdd(dictKey, onDone) {
  openNameModal({
    title: `${t("newItem")} — ${t(dictKey)}`,
    defaultValue: "",
    onSave: async (name) => {
      await apiFetch(`/dict/${dictKey}`, { method:"POST", body:{ name } });
      await preloadDict(true);
      toast(t("saved"));
      onDone?.();
    }
  });
}

function openDictEdit(dictKey, item, onDone) {
  openNameModal({
    title: `${t("edit")} — ${t(dictKey)}`,
    defaultValue: item.name || "",
    onSave: async (name) => {
      await apiFetch(`/dict/${dictKey}/${item.id}`, { method:"PATCH", body:{ name } });
      await preloadDict(true);
      toast(t("saved"));
      onDone?.();
    }
  });
}

/* =========================
   UI tab
========================= */
function renderUiTab(host) {
  host.innerHTML = `
    <div class="set-card">
      <div class="h">
        <div>
          <b>${t("uiSettings")}</b>
          <div class="muted">Theme · Colors · Font</div>
        </div>
        <span class="badge">${(state.ui.lang || "ru").toUpperCase()}</span>
      </div>

      <div class="b">
        <div class="grid2">
          <div class="field">
            <div class="label">Font</div>
            <input class="input" id="uiFont" value="${esc(state.ui.font || "")}" />
          </div>

          <div class="field">
            <div class="label">Theme</div>
            <select class="input" id="uiTheme">
              <option value="dark" ${state.ui.theme === "dark" ? "selected" : ""}>Dark</option>
              <option value="light" ${state.ui.theme === "light" ? "selected" : ""}>Light</option>
            </select>
          </div>
        </div>

        <div class="grid2" style="margin-top:10px">
          <div class="field">
            <div class="label">Primary (Light)</div>
            <input class="input" id="uiLP" value="${esc(state.ui.light?.primary || "")}" />
          </div>
          <div class="field">
            <div class="label">Background (Light)</div>
            <input class="input" id="uiLB" value="${esc(state.ui.light?.bg || "")}" />
          </div>
        </div>

        <div class="grid2" style="margin-top:10px">
          <div class="field">
            <div class="label">Primary (Dark)</div>
            <input class="input" id="uiDP" value="${esc(state.ui.dark?.primary || "")}" />
          </div>
          <div class="field">
            <div class="label">Background (Dark)</div>
            <input class="input" id="uiDB" value="${esc(state.ui.dark?.bg || "")}" />
          </div>
        </div>

        <div class="row2" style="justify-content:flex-end; margin-top:12px">
          <button class="btn primary" id="uiSave">${t("save")}</button>
        </div>
      </div>
    </div>
  `;

  $("#uiSave").onclick = async () => {
    state.ui.font = $("#uiFont").value.trim() || state.ui.font;
    state.ui.theme = $("#uiTheme").value;
    state.ui.light = state.ui.light || {};
    state.ui.dark = state.ui.dark || {};
    state.ui.light.primary = $("#uiLP").value.trim();
    state.ui.light.bg = $("#uiLB").value.trim();
    state.ui.dark.primary = $("#uiDP").value.trim();
    state.ui.dark.bg = $("#uiDB").value.trim();

    await apiFetch("/ui/me", { method:"POST", body: state.ui, loadingTitle: t("savingTitle"), loadingText: t("savingText") });
    applyTheme(state.ui.theme);
    toast(t("saved"));
  };
}

/* =========================
   Modal helpers
========================= */
function openNameModal({ title, defaultValue, onSave }) {
  const host = $("#modalHost");
  host.innerHTML = `
    <div class="mb">
      <div class="m" style="width:min(520px, calc(100vw - 24px))">
        <div class="mh">
          <b>${esc(title)}</b>
          <button class="btn" id="nClose">✕</button>
        </div>
        <div class="mbo">
          <div class="field">
            <div class="label">${t("name")}</div>
            <input class="input" id="nVal" value="${esc(defaultValue || "")}" />
          </div>
          <div class="row2" style="justify-content:flex-end; margin-top:12px">
            <button class="btn" id="nCancel">${t("cancel")}</button>
            <button class="btn primary" id="nSave">${t("save")}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const close = () => host.innerHTML = "";
  $("#nClose").onclick = close;
  $("#nCancel").onclick = close;
  host.querySelector(".mb").onclick = (e) => { if (e.target.classList.contains("mb")) close(); };

  $("#nSave").onclick = async () => {
    const name = $("#nVal").value.trim();
    if (!name) return toast(t("error"), "Name is empty", "err");
    close();
    await onSave?.(name);
  };
}

/* =========================
   Data loaders
========================= */
async function preloadDict(force=false) {
  if (state.cacheReady && !force) return;

  const [cities, sources, services, spheres] = await Promise.all([
    apiFetch("/dict/cities",   { silent:true }).catch(() => ({items:[]})),
    apiFetch("/dict/sources",  { silent:true }).catch(() => ({items:[]})),
    apiFetch("/dict/services", { silent:true }).catch(() => ({items:[]})),
    apiFetch("/dict/spheres",  { silent:true }).catch(() => ({items:[]})),
  ]);

  state.dict.cities   = cities.items || [];
  state.dict.sources  = sources.items || [];
  state.dict.services = services.items || [];
  state.dict.spheres  = spheres.items || [];
  state.cacheReady = true;
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
