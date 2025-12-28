// controllers/settings.js
// Settings module (dict_items)
// Pages: index / new / edit / view
// API: /settings/dicts, /settings/dict-items, /settings/dict-items/:id

import { api } from "./api.js";
import { t, applyI18n } from "./i18n.js"; // если у тебя applyI18n называется иначе — поменяй тут

const LS_DICT = "gsoft.settings.dict";
const LS_ARCH = "gsoft.settings.include_deleted";

let _dictsCache = null;

function qsFromHash() {
  const h = location.hash || "";
  const i = h.indexOf("?");
  const q = i >= 0 ? h.slice(i + 1) : "";
  return new URLSearchParams(q);
}

function getPageFromHash() {
  const p = (location.hash.split("?")[0] || "").replace("#", "");
  // "#/settings/edit" -> ["", "settings", "edit"]
  const parts = p.split("/").filter(Boolean);
  const page = parts[1] || "index";
  return page; // index | new | edit | view
}

function getDictKey(qs) {
  return qs.get("dict") || localStorage.getItem(LS_DICT) || "";
}

function setDictKey(dict) {
  if (dict) localStorage.setItem(LS_DICT, dict);
}

function getIncludeDeleted(qs) {
  if (qs.has("include_deleted")) return qs.get("include_deleted") === "1";
  return localStorage.getItem(LS_ARCH) === "1";
}

function setIncludeDeleted(v) {
  localStorage.setItem(LS_ARCH, v ? "1" : "0");
}

function setErr(el, msg) {
  if (!el) return;
  el.style.display = msg ? "" : "none";
  el.textContent = msg ? String(msg) : "";
}

function navToIndex(dict, includeDeleted) {
  const q = new URLSearchParams();
  if (dict) q.set("dict", dict);
  if (includeDeleted) q.set("include_deleted", "1");
  location.hash = `#/settings?${q.toString()}`;
}

function navToNew(dict, includeDeleted) {
  const q = new URLSearchParams();
  if (dict) q.set("dict", dict);
  if (includeDeleted) q.set("include_deleted", "1");
  location.hash = `#/settings/new?${q.toString()}`;
}

function navToEdit(dict, id, includeDeleted) {
  const q = new URLSearchParams();
  if (dict) q.set("dict", dict);
  q.set("id", String(id));
  if (includeDeleted) q.set("include_deleted", "1");
  location.hash = `#/settings/edit?${q.toString()}`;
}

function navToView(dict, id, includeDeleted) {
  const q = new URLSearchParams();
  if (dict) q.set("dict", dict);
  q.set("id", String(id));
  if (includeDeleted) q.set("include_deleted", "1");
  location.hash = `#/settings/view?${q.toString()}`;
}

async function loadDicts() {
  if (_dictsCache) return _dictsCache;
  const r = await api.get("/settings/dicts");
  _dictsCache = r.dicts || [];
  return _dictsCache;
}

async function loadItems(dict, includeDeleted) {
  const q = new URLSearchParams();
  q.set("dict", dict);
  q.set("include_deleted", includeDeleted ? "1" : "0");
  const r = await api.get(`/settings/dict-items?${q.toString()}`);
  return r.items || [];
}

/* ========================= INDEX ========================= */
async function mountIndex() {
  const root = document.getElementById("settingsIndex");
  if (!root) return;

  // i18n apply for this fragment (если у тебя другой метод — просто убери строку)
  try { applyI18n(root); } catch {}

  const qs = qsFromHash();
  const errEl = document.getElementById("stError");
  const dictListEl = document.getElementById("stDictList");
  const dictEmptyEl = document.getElementById("stDictEmpty");
  const itemsBody = document.getElementById("stItemsBody");
  const noDataEl = document.getElementById("stNoData");
  const dictPill = document.getElementById("stDictKeyPill");
  const countEl = document.getElementById("stCount");

  const searchEl = document.getElementById("stSearch");
  const archivedEl = document.getElementById("stShowArchived");
  const newBtn = document.getElementById("stNewBtn");

  setErr(errEl, "");

  const dicts = await loadDicts();
  let dict = getDictKey(qs);
  if (!dict && dicts.length) dict = dicts[0].key;

  const includeDeleted = getIncludeDeleted(qs);

  if (archivedEl) archivedEl.checked = includeDeleted;

  // render dict list
  dictListEl.innerHTML = "";
  if (!dicts.length) {
    dictEmptyEl.style.display = "";
  } else {
    dictEmptyEl.style.display = "none";
    for (const d of dicts) {
      const el = document.createElement("div");
      el.className = "st-dict" + (d.key === dict ? " active" : "");
      el.innerHTML = `
        <div>
          <div>${t(d.title_i18n || d.key)}</div>
          <small>${d.key}</small>
        </div>
      `;
      el.addEventListener("click", () => {
        setDictKey(d.key);
        navToIndex(d.key, includeDeleted);
      });
      dictListEl.appendChild(el);
    }
  }

  if (!dict) {
    dictPill.textContent = "";
    itemsBody.innerHTML = "";
    noDataEl.style.display = "";
    if (countEl) countEl.textContent = "";
    return;
  }

  setDictKey(dict);
  dictPill.textContent = dict;

  let items = [];
  try {
    items = await loadItems(dict, includeDeleted);
  } catch (e) {
    setErr(errEl, e?.message || "Load error");
    return;
  }

  // UI events
  if (newBtn) {
    newBtn.onclick = () => navToNew(dict, includeDeleted);
  }
  if (archivedEl) {
    archivedEl.onchange = () => {
      setIncludeDeleted(archivedEl.checked);
      navToIndex(dict, archivedEl.checked);
    };
  }

  function renderRows() {
    const q = String(searchEl?.value || "").toLowerCase().trim();
    const filtered = items.filter(it => {
      if (!q) return true;
      return String(it.name || "").toLowerCase().includes(q);
    });

    if (countEl) countEl.textContent = `${filtered.length}`;
    itemsBody.innerHTML = "";

    if (!filtered.length) {
      noDataEl.style.display = "";
      return;
    }
    noDataEl.style.display = "none";

    for (const it of filtered) {
      const tr = document.createElement("tr");

      const swatch = `<span class="st-swatch" style="background:${it.color || "transparent"}"></span>`;

      tr.innerHTML = `
        <td>
          <a href="javascript:void(0)" class="st-link" style="color:rgba(0,229,255,.9);text-decoration:none">
            ${escapeHtml(it.name || "")}
          </a>
        </td>
        <td>${swatch} <span style="color:var(--muted)">${escapeHtml(it.color || "")}</span></td>
        <td>${Number(it.sort || 0)}</td>
        <td>${it.active ? "1" : "0"}</td>
        <td>${it.is_default ? "1" : "0"}</td>
        <td>
          <div class="st-rowActions">
            <button class="st-a" data-act="edit">${t("common.edit")}</button>
            <button class="st-a" data-act="view">${t("common.view")}</button>
            ${
              it.is_deleted
                ? `<button class="st-a" data-act="restore">${t("common.restore")}</button>`
                : `<button class="st-a danger" data-act="archive">${t("common.archive")}</button>`
            }
          </div>
        </td>
      `;

      // name click -> view
      tr.querySelector(".st-link")?.addEventListener("click", () => navToView(dict, it.id, includeDeleted));

      tr.querySelector('[data-act="edit"]')?.addEventListener("click", () => navToEdit(dict, it.id, includeDeleted));
      tr.querySelector('[data-act="view"]')?.addEventListener("click", () => navToView(dict, it.id, includeDeleted));

      tr.querySelector('[data-act="archive"]')?.addEventListener("click", async () => {
        await api.patch(`/settings/dict-items/${it.id}`, { is_deleted: 1 });
        items = await loadItems(dict, includeDeleted);
        renderRows();
      });

      tr.querySelector('[data-act="restore"]')?.addEventListener("click", async () => {
        await api.patch(`/settings/dict-items/${it.id}`, { is_deleted: 0 });
        items = await loadItems(dict, includeDeleted);
        renderRows();
      });

      itemsBody.appendChild(tr);
    }
  }

  if (searchEl) {
    searchEl.oninput = () => renderRows();
  }

  renderRows();
}

/* ========================= NEW / EDIT form shared ========================= */
function showFinalTypeIfNeeded(dictKey, rowEl) {
  if (!rowEl) return;
  rowEl.style.display = dictKey === "project_types" ? "" : "none";
}

async function mountNew() {
  const root = document.getElementById("settingsNew");
  if (!root) return;

  try { applyI18n(root); } catch {}

  const qs = qsFromHash();
  const dict = getDictKey(qs);
  const includeDeleted = getIncludeDeleted(qs);

  const errEl = document.getElementById("sfError");
  const dictTitleEl = document.getElementById("sfDictTitle");
  const backBtn = document.getElementById("sfBackBtn");
  const cancelBtn = document.getElementById("sfCancelBtn");
  const form = document.getElementById("sfForm");

  const nameEl = document.getElementById("sfName");
  const colorEl = document.getElementById("sfColor");
  const sortEl = document.getElementById("sfSort");
  const activeEl = document.getElementById("sfActive");
  const defEl = document.getElementById("sfDefault");
  const finalTypeRow = document.getElementById("sfFinalTypeRow");
  const finalTypeEl = document.getElementById("sfFinalType");

  setErr(errEl, "");

  const dicts = await loadDicts();
  const d = dicts.find(x => x.key === dict);
  dictTitleEl.textContent = d ? `${t(d.title_i18n || d.key)} · ${dict}` : dict;

  showFinalTypeIfNeeded(dict, finalTypeRow);

  backBtn.onclick = () => navToIndex(dict, includeDeleted);
  cancelBtn.onclick = () => navToIndex(dict, includeDeleted);

  form.onsubmit = async (e) => {
    e.preventDefault();
    setErr(errEl, "");

    const payload = {
      dict_key: dict,
      name: String(nameEl.value || "").trim(),
      color: String(colorEl.value || "").trim(),
      sort: Number(sortEl.value || 0),
      active: activeEl.checked ? 1 : 0,
      is_default: defEl.checked ? 1 : 0,
    };
    if (!payload.name) {
      setErr(errEl, t("common.requiredName") || "Name required");
      return;
    }
    if (dict === "project_types") {
      payload.final_type = String(finalTypeEl.value || "").trim() || null;
    }

    try {
      await api.post("/settings/dict-items", payload);
      navToIndex(dict, includeDeleted);
    } catch (e2) {
      setErr(errEl, e2?.message || "Save error");
    }
  };
}

async function mountEdit() {
  const root = document.getElementById("settingsEdit");
  if (!root) return;

  try { applyI18n(root); } catch {}

  const qs = qsFromHash();
  const dict = getDictKey(qs);
  const includeDeleted = getIncludeDeleted(qs);
  const id = Number(qs.get("id") || 0);

  const errEl = document.getElementById("sfError");
  const dictTitleEl = document.getElementById("sfDictTitle");
  const backBtn = document.getElementById("sfBackBtn");
  const cancelBtn = document.getElementById("sfCancelBtn");
  const form = document.getElementById("sfForm");

  const nameEl = document.getElementById("sfName");
  const colorEl = document.getElementById("sfColor");
  const sortEl = document.getElementById("sfSort");
  const activeEl = document.getElementById("sfActive");
  const defEl = document.getElementById("sfDefault");
  const finalTypeRow = document.getElementById("sfFinalTypeRow");
  const finalTypeEl = document.getElementById("sfFinalType");

  setErr(errEl, "");

  const dicts = await loadDicts();
  const d = dicts.find(x => x.key === dict);
  dictTitleEl.textContent = d ? `${t(d.title_i18n || d.key)} · ${dict} · #${id}` : `${dict} · #${id}`;

  showFinalTypeIfNeeded(dict, finalTypeRow);

  backBtn.onclick = () => navToIndex(dict, includeDeleted);
  cancelBtn.onclick = () => navToIndex(dict, includeDeleted);

  if (!id) {
    setErr(errEl, "Missing id");
    return;
  }

  let item;
  try {
    const r = await api.get(`/settings/dict-items/${id}`);
    item = r.item;
  } catch (e) {
    setErr(errEl, e?.message || "Load error");
    return;
  }

  // fill
  nameEl.value = item?.name || "";
  colorEl.value = item?.color || "";
  sortEl.value = Number(item?.sort || 0);
  activeEl.checked = !!item?.active;
  defEl.checked = !!item?.is_default;
  if (dict === "project_types") finalTypeEl.value = item?.final_type || "";

  form.onsubmit = async (e) => {
    e.preventDefault();
    setErr(errEl, "");

    const payload = {
      name: String(nameEl.value || "").trim(),
      color: String(colorEl.value || "").trim(),
      sort: Number(sortEl.value || 0),
      active: activeEl.checked ? 1 : 0,
      is_default: defEl.checked ? 1 : 0,
    };
    if (!payload.name) {
      setErr(errEl, t("common.requiredName") || "Name required");
      return;
    }
    if (dict === "project_types") {
      payload.final_type = String(finalTypeEl.value || "").trim() || null;
    }

    try {
      await api.patch(`/settings/dict-items/${id}`, payload);
      navToIndex(dict, includeDeleted);
    } catch (e2) {
      setErr(errEl, e2?.message || "Save error");
    }
  };
}

/* ========================= VIEW ========================= */
async function mountView() {
  const root = document.getElementById("settingsView");
  if (!root) return;

  try { applyI18n(root); } catch {}

  const qs = qsFromHash();
  const dict = getDictKey(qs);
  const includeDeleted = getIncludeDeleted(qs);
  const id = Number(qs.get("id") || 0);

  const errEl = document.getElementById("svError");
  const dictTitleEl = document.getElementById("svDictTitle");
  const backBtn = document.getElementById("svBackBtn");
  const editBtn = document.getElementById("svEditBtn");

  const nameEl = document.getElementById("svName");
  const colorEl = document.getElementById("svColor");
  const colorTxtEl = document.getElementById("svColorTxt");
  const sortEl = document.getElementById("svSort");
  const activeEl = document.getElementById("svActive");
  const defEl = document.getElementById("svDefault");
  const finalTypeRow = document.getElementById("svFinalTypeRow");
  const finalTypeEl = document.getElementById("svFinalType");

  setErr(errEl, "");

  const dicts = await loadDicts();
  const d = dicts.find(x => x.key === dict);
  dictTitleEl.textContent = d ? `${t(d.title_i18n || d.key)} · ${dict} · #${id}` : `${dict} · #${id}`;

  backBtn.onclick = () => navToIndex(dict, includeDeleted);
  editBtn.onclick = () => navToEdit(dict, id, includeDeleted);

  if (!id) {
    setErr(errEl, "Missing id");
    return;
  }

  let item;
  try {
    const r = await api.get(`/settings/dict-items/${id}`);
    item = r.item;
  } catch (e) {
    setErr(errEl, e?.message || "Load error");
    return;
  }

  nameEl.textContent = item?.name || "";
  colorEl.style.background = item?.color || "transparent";
  colorTxtEl.textContent = item?.color || "";
  sortEl.textContent = String(Number(item?.sort || 0));
  activeEl.textContent = item?.active ? "1" : "0";
  defEl.textContent = item?.is_default ? "1" : "0";

  if (dict === "project_types") {
    finalTypeRow.style.display = "";
    finalTypeEl.textContent = item?.final_type || "";
  } else {
    finalTypeRow.style.display = "none";
  }
}

/* ========================= PUBLIC INIT =========================
  Роутер должен вызывать initSettings() после подгрузки HTML страницы.
  Например:
    if (module==="settings") import("./controllers/settings.js").then(m=>m.initSettings())
*/
export async function initSettings() {
  const page = getPageFromHash();
  if (page === "new") return mountNew();
  if (page === "edit") return mountEdit();
  if (page === "view") return mountView();
  return mountIndex();
}

// для удобства — если хочешь, можешь дергать window.GSOFT_SETTINGS_INIT()
window.GSOFT_SETTINGS_INIT = initSettings;

/* ========================= helpers ========================= */
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
