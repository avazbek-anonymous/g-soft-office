import { state } from "../core/state.js";
import { t } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";
import { applyTheme } from "../ui/theme.js";

export async function renderSettings(view) {
  view.innerHTML = `
    <div class="grid" style="grid-template-columns: 1fr; gap:16px">
      <div class="card">
        <div class="hd"><b>${t("settings")}</b><span class="muted">${t("dictionaries")} + ${t("uiSettings")}</span></div>
        <div class="bd">
          <div class="row">
            <button class="btn" id="btnLoadDict">⟲ ${t("reload")} dict</button>
            <span class="muted" id="dictStatus"></span>
          </div>

          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px; margin-top:14px">
            ${dictCard("cities", t("cities"), state.dict.cities)}
            ${dictCard("sources", t("sources"), state.dict.sources)}
            ${dictCard("services", t("services"), state.dict.services)}
          </div>

          <div class="hr"></div>

          <div class="h2">${t("uiSettings")}</div>

          <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px; margin-top:10px">
            ${uiField("font", "Font", state.ui.font)}
            ${uiField("light.primary", "Light primary", state.ui.light?.primary)}
            ${uiField("light.bg", "Light bg", state.ui.light?.bg)}
            ${uiField("dark.primary", "Dark primary", state.ui.dark?.primary)}
            ${uiField("dark.bg", "Dark bg", state.ui.dark?.bg)}
          </div>

          <div class="row" style="margin-top:14px; justify-content:flex-end">
            <button class="btn primary" id="btnSaveUi">${t("save")}</button>
          </div>
        </div>
      </div>

      <div id="modalHost"></div>
    </div>
  `;

  // reload dict
  document.getElementById("btnLoadDict").onclick = async () => {
    await preloadDict(true);
    toast("OK", "dict reloaded");
    renderSettings(view);
  };

  // ui save
  document.getElementById("btnSaveUi").onclick = async () => {
    readUiInputs();
    await apiFetch("/ui/me", {
      method:"POST",
      body: state.ui,
      loadingTitle: t("savingTitle"),
      loadingText: t("savingText"),
    });
    applyTheme(state.ui.theme);
    toast(t("saved"));
  };

  // dict modals
  view.querySelectorAll("[data-dict-open]").forEach(btn => {
    btn.onclick = () => openDictModal(btn.getAttribute("data-dict-open"));
  });
  view.querySelectorAll("[data-dict-add]").forEach(btn => {
    btn.onclick = () => openAddModal(btn.getAttribute("data-dict-add"));
  });
}

function uiField(key, label, value) {
  return `
    <div class="field">
      <div class="label">${escapeHtml(label)}</div>
      <input class="input" data-ui="${escapeHtml(key)}" value="${escapeHtml(value ?? "")}" />
    </div>
  `;
}

function readUiInputs() {
  document.querySelectorAll("[data-ui]").forEach(inp => {
    const k = inp.getAttribute("data-ui");
    const v = inp.value;
    setDeep(state.ui, k, v);
  });
}

function dictCard(code, title, items) {
  return `
    <div class="card">
      <div class="hd"><b>${escapeHtml(title)}</b><span class="muted">${(items?.length||0)} items</span></div>
      <div class="bd">
        <div class="row">
          <button class="btn" data-dict-open="${code}">${t("open")}</button>
          <button class="btn primary" data-dict-add="${code}">＋ ${t("add")}</button>
        </div>
      </div>
    </div>
  `;
}

async function preloadDict(force=false) {
  if (state.cacheReady && !force) return;

  const [cities, sources, services] = await Promise.all([
    apiFetch("/dict/cities",   { silent:true }).catch(() => ({items:[]})),
    apiFetch("/dict/sources",  { silent:true }).catch(() => ({items:[]})),
    apiFetch("/dict/services", { silent:true }).catch(() => ({items:[]})),
  ]);

  state.dict.cities   = cities.items || [];
  state.dict.sources  = sources.items || [];
  state.dict.services = services.items || [];
  state.cacheReady = true;
}

function openDictModal(dictKey) {
  const items = state.dict[dictKey] || [];
  const host = document.getElementById("modalHost");

  host.innerHTML = `
    <div class="modal-backdrop open"></div>
    <div class="modal open">
      <div class="modal-head">
        <b>${escapeHtml(t(dictKey))}</b>
        <button class="btn" id="mClose">${t("close")}</button>
      </div>
      <div class="modal-body">
        <div class="field">
          <div class="label">${t("search")}</div>
          <input id="mSearch" class="input" placeholder="${t("search")}..." />
        </div>
        <div id="mList" style="margin-top:10px"></div>
      </div>
    </div>
  `;

  const close = () => host.innerHTML = "";
  host.querySelector(".modal-backdrop").onclick = close;
  document.getElementById("mClose").onclick = close;

  const renderList = (q="") => {
    const qq = q.trim().toLowerCase();
    const filtered = items.filter(x => String(x.name||"").toLowerCase().includes(qq));
    document.getElementById("mList").innerHTML = filtered.length
      ? `<div class="list">
           ${filtered.map(x => `<div class="list-item"><span>${escapeHtml(x.name||"")}</span></div>`).join("")}
         </div>`
      : `<div class="muted">${t("notFound")}</div>`;
  };

  document.getElementById("mSearch").oninput = (e) => renderList(e.target.value);
  renderList("");
}

function openAddModal(dictKey) {
  const host = document.getElementById("modalHost");
  host.innerHTML = `
    <div class="modal-backdrop open"></div>
    <div class="modal open">
      <div class="modal-head">
        <b>${t("newItem")} — ${escapeHtml(t(dictKey))}</b>
        <button class="btn" id="aClose">${t("close")}</button>
      </div>
      <div class="modal-body">
        <div class="field">
          <div class="label">${t("name")}</div>
          <input id="aName" class="input" />
        </div>
        <div class="row" style="justify-content:flex-end; margin-top:12px">
          <button class="btn" id="aCancel">${t("cancel")}</button>
          <button class="btn primary" id="aSave">${t("save")}</button>
        </div>
      </div>
    </div>
  `;

  const close = () => host.innerHTML = "";
  host.querySelector(".modal-backdrop").onclick = close;
  document.getElementById("aClose").onclick = close;
  document.getElementById("aCancel").onclick = close;

  document.getElementById("aSave").onclick = async () => {
    const name = document.getElementById("aName").value.trim();
    if (!name) return toast(t("error"), "Name is empty", "err");

    // предполагаемый эндпоинт (если у тебя другой — скажешь, подправлю)
    await apiFetch(`/dict/${dictKey}`, { method:"POST", body:{ name } });

    // reload cache
    state.cacheReady = false;
    await preloadDict(true);
    toast(t("saved"));
    close();
  };
}

function setDeep(obj, path, value) {
  const parts = String(path).split(".");
  let cur = obj;
  for (let i=0;i<parts.length-1;i++){
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length-1]] = value;
}

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
