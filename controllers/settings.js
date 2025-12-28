// controllers/settings.js
// Settings (dict_items)
// Pages: view/settings/{index,new,edit,view}.html
// Worker routes used:
//   GET   /dict/:key/all
//   POST  /dict/:key
//   PATCH /dict-items/:id

import { api } from "./api.js";
import { t } from "./i18n.js";

// optional (если у тебя есть applyI18n)
import * as i18n from "./i18n.js";
const applyI18n = i18n.applyI18n || ((root) => {
  // fallback: минимальный apply по data-i18n / data-i18n-ph
  if (!root) return;
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (k) el.textContent = t(k);
  });
  root.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    const k = el.getAttribute("data-i18n-ph");
    if (k) el.setAttribute("placeholder", t(k));
  });
});

const LS_DICT = "gsoft.settings.dict";
const LS_ARCH = "gsoft.settings.include_deleted";

// ---------- helpers ----------
function getHashPath() {
  return (location.hash.split("?")[0] || "").replace("#", "");
}
function getPage() {
  // "#/settings/edit" => ["settings","edit"]
  const parts = getHashPath().split("/").filter(Boolean);
  return parts[1] || "index";
}
function getQS() {
  const h = location.hash || "";
  const i = h.indexOf("?");
  return new URLSearchParams(i >= 0 ? h.slice(i + 1) : "");
}
function getDictKey(qs) {
  return qs.get("dict") || localStorage.getItem(LS_DICT) || "";
}
function setDictKey(v) {
  if (v) localStorage.setItem(LS_DICT, v);
}
function getIncludeDeleted(qs) {
  if (qs.has("include_deleted")) return qs.get("include_deleted") === "1";
  return localStorage.getItem(LS_ARCH) === "1";
}
function setIncludeDeleted(v) {
  localStorage.setItem(LS_ARCH, v ? "1" : "0");
}
function nav(hash) {
  location.hash = hash;
}
function navIndex(dict, includeDeleted) {
  const q = new URLSearchParams();
  if (dict) q.set("dict", dict);
  if (includeDeleted) q.set("include_deleted", "1");
  nav(`#/settings?${q.toString()}`);
}
function navNew(dict, includeDeleted) {
  const q = new URLSearchParams();
  if (dict) q.set("dict", dict);
  if (includeDeleted) q.set("include_deleted", "1");
  nav(`#/settings/new?${q.toString()}`);
}
function navEdit(dict, id, includeDeleted) {
  const q = new URLSearchParams();
  if (dict) q.set("dict", dict);
  q.set("id", String(id));
  if (includeDeleted) q.set("include_deleted", "1");
  nav(`#/settings/edit?${q.toString()}`);
}
function navView(dict, id, includeDeleted) {
  const q = new URLSearchParams();
  if (dict) q.set("dict", dict);
  q.set("id", String(id));
  if (includeDeleted) q.set("include_deleted", "1");
  nav(`#/settings/view?${q.toString()}`);
}
function setErr(el, msg) {
  if (!el) return;
  el.style.display = msg ? "" : "none";
  el.textContent = msg ? String(msg) : "";
}
function esc(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getDictsFromRegister() {
  // ожидаем: window.REGISTER.dicts = [{ key:"cities", title_i18n:"settings.dict.cities" }, ...]
  const reg = window.REGISTER || window.APP?.REGISTER || null;
  const dicts = reg?.dicts;
  if (Array.isArray(dicts) && dicts.length) return dicts;

  // fallback (если register ещё не подключён) — можно убрать если хочешь строго без хардкода
  return [
    { key: "cities", title_i18n: "settings.dict.cities" },
    { key: "sources", title_i18n: "settings.dict.sources" },
    { key: "spheres", title_i18n: "settings.dict.spheres" },
    { key: "task_statuses", title_i18n: "settings.dict.task_statuses" },
    { key: "project_statuses", title_i18n: "settings.dict.project_statuses" },
    { key: "lead_statuses", title_i18n: "settings.dict.lead_statuses" },
    { key: "project_types", title_i18n: "settings.dict.project_types" },
  ];
}

// ---------- contract load/calc/render/mount ----------
export async function load(ctx = {}) {
  const qs = getQS();
  const page = getPage();

  const dicts = getDictsFromRegister();
  let dict = getDictKey(qs);
  if (!dict && dicts.length) dict = dicts[0].key;

  const includeDeleted = getIncludeDeleted(qs);
  const id = Number(qs.get("id") || 0);

  let items = [];
  if (dict) {
    const r = await api.get(`/dict/${encodeURIComponent(dict)}/all`);
    items = r.items || [];
  }

  return { page, qs, dicts, dict, includeDeleted, id, items };
}

export function calc(ctx = {}, data) {
  const { page, dict, includeDeleted, id, dicts } = data;
  let items = Array.isArray(data.items) ? data.items : [];

  // includeDeleted=0 => убираем is_deleted=1
  if (!includeDeleted) items = items.filter((x) => !x.is_deleted);

  const item = id ? (data.items || []).find((x) => Number(x.id) === Number(id)) : null;

  const dictMeta = dicts.find((d) => d.key === dict) || null;

  return {
    page,
    dict,
    includeDeleted,
    id,
    dictMeta,
    items,
    item,
  };
}

export function render(ctx = {}, vm) {
  // Мы НЕ возвращаем HTML строку, потому что view/*.html уже загружает router.
  // Тут только заполняем placeholders.
  const page = vm.page;

  if (page === "index") return renderIndex(vm);
  if (page === "new") return renderNew(vm);
  if (page === "edit") return renderEdit(vm);
  if (page === "view") return renderView(vm);
}

export function mount(ctx = {}, vm) {
  // навешиваем listeners
  const page = vm.page;

  if (page === "index") return mountIndex(vm);
  if (page === "new") return mountNew(vm);
  if (page === "edit") return mountEdit(vm);
  if (page === "view") return mountView(vm);
}

// удобный wrapper (если твой router просто вызывает controller.init())
export async function init(ctx = {}) {
  const data = await load(ctx);
  const vm = calc(ctx, data);
  // применяем i18n к текущей странице
  applyI18n(document);
  render(ctx, vm);
  await mount(ctx, vm);
  return vm;
}

// также кладём в window на всякий случай
window.controllers = window.controllers || {};
window.controllers.settings = { load, calc, render, mount, init };

// ---------- page: index ----------
function renderIndex(vm) {
  const root = document.getElementById("settingsIndex");
  if (!root) return;

  const dictListEl = document.getElementById("stDictList");
  const dictPill = document.getElementById("stDictKeyPill");
  const itemsBody = document.getElementById("stItemsBody");
  const noDataEl = document.getElementById("stNoData");
  const countEl = document.getElementById("stCount");

  // dict list
  dictListEl.innerHTML = "";
  for (const d of vm.dictMeta ? vm.dictMeta ? vm.dictMeta && [] : [] : []) {} // no-op (чтобы линтер не ругался)

  const dicts = getDictsFromRegister();
  for (const d of dicts) {
    const el = document.createElement("div");
    el.className = "st-dict" + (d.key === vm.dict ? " active" : "");
    el.innerHTML = `
      <div>
        <div>${t(d.title_i18n || d.titleKey || d.key)}</div>
        <small>${d.key}</small>
      </div>
    `;
    el.onclick = () => {
      setDictKey(d.key);
      navIndex(d.key, vm.includeDeleted);
    };
    dictListEl.appendChild(el);
  }

  dictPill.textContent = vm.dict || "";

  // rows
  itemsBody.innerHTML = "";
  const items = vm.items || [];
  if (countEl) countEl.textContent = String(items.length);

  if (!items.length) {
    noDataEl.style.display = "";
    return;
  }
  noDataEl.style.display = "none";

  for (const it of items) {
    const tr = document.createElement("tr");
    const swatch = `<span class="st-swatch" style="background:${esc(it.color || "")}"></span>`;
    tr.innerHTML = `
      <td>
        <a href="javascript:void(0)" class="st-link" style="color:rgba(0,229,255,.9);text-decoration:none">
          ${esc(it.name || "")}
        </a>
      </td>
      <td>${swatch} <span style="color:var(--muted)">${esc(it.color || "")}</span></td>
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

    tr.querySelector(".st-link")?.addEventListener("click", () => navView(vm.dict, it.id, vm.includeDeleted));
    tr.querySelector('[data-act="edit"]')?.addEventListener("click", () => navEdit(vm.dict, it.id, vm.includeDeleted));
    tr.querySelector('[data-act="view"]')?.addEventListener("click", () => navView(vm.dict, it.id, vm.includeDeleted));

    tr.querySelector('[data-act="archive"]')?.addEventListener("click", async () => {
      await api.patch(`/dict-items/${it.id}`, { is_deleted: 1 });
      navIndex(vm.dict, vm.includeDeleted);
    });

    tr.querySelector('[data-act="restore"]')?.addEventListener("click", async () => {
      await api.patch(`/dict-items/${it.id}`, { is_deleted: 0 });
      navIndex(vm.dict, vm.includeDeleted);
    });

    itemsBody.appendChild(tr);
  }
}

function mountIndex(vm) {
  const root = document.getElementById("settingsIndex");
  if (!root) return;

  const searchEl = document.getElementById("stSearch");
  const archivedEl = document.getElementById("stShowArchived");
  const newBtn = document.getElementById("stNewBtn");

  if (archivedEl) archivedEl.checked = !!vm.includeDeleted;

  if (newBtn) newBtn.onclick = () => navNew(vm.dict, vm.includeDeleted);

  if (archivedEl) {
    archivedEl.onchange = () => {
      setIncludeDeleted(archivedEl.checked);
      navIndex(vm.dict, archivedEl.checked);
    };
  }

  // search (на клиенте фильтруем текущий tbody)
  if (searchEl) {
    searchEl.oninput = () => {
      const q = String(searchEl.value || "").toLowerCase().trim();
      const rows = root.querySelectorAll("#stItemsBody tr");
      rows.forEach((tr) => {
        const name = (tr.querySelector("td")?.textContent || "").toLowerCase();
        tr.style.display = !q || name.includes(q) ? "" : "none";
      });
    };
  }
}

// ---------- page: new ----------
function renderNew(vm) {
  const root = document.getElementById("settingsNew");
  if (!root) return;

  const title = document.getElementById("sfDictTitle");
  title.textContent = vm.dictMeta ? `${t(vm.dictMeta.title_i18n || vm.dictMeta.key)} · ${vm.dict}` : vm.dict;

  const finalRow = document.getElementById("sfFinalTypeRow");
  if (finalRow) finalRow.style.display = vm.dict === "project_types" ? "" : "none";
}

function mountNew(vm) {
  const root = document.getElementById("settingsNew");
  if (!root) return;

  const errEl = document.getElementById("sfError");
  const form = document.getElementById("sfForm");
  const backBtn = document.getElementById("sfBackBtn");
  const cancelBtn = document.getElementById("sfCancelBtn");

  backBtn.onclick = () => navIndex(vm.dict, vm.includeDeleted);
  cancelBtn.onclick = () => navIndex(vm.dict, vm.includeDeleted);

  form.onsubmit = async (e) => {
    e.preventDefault();
    setErr(errEl, "");

    const name = String(document.getElementById("sfName")?.value || "").trim();
    if (!name) return setErr(errEl, t("common.requiredName") || "name required");

    const payload = {
      name,
      color: String(document.getElementById("sfColor")?.value || "").trim() || null,
      sort: Number(document.getElementById("sfSort")?.value || 0),
      active: document.getElementById("sfActive")?.checked ? 1 : 0,
      is_default: document.getElementById("sfDefault")?.checked ? 1 : 0,
    };

    if (vm.dict === "project_types") {
      const ft = String(document.getElementById("sfFinalType")?.value || "").trim();
      payload.final_type = ft || null;
    }

    try {
      await api.post(`/dict/${encodeURIComponent(vm.dict)}`, payload);
      navIndex(vm.dict, vm.includeDeleted);
    } catch (e2) {
      setErr(errEl, e2?.message || "save error");
    }
  };
}

// ---------- page: edit ----------
function renderEdit(vm) {
  const root = document.getElementById("settingsEdit");
  if (!root) return;

  const errEl = document.getElementById("sfError");
  if (!vm.item) {
    setErr(errEl, "Item not found");
    return;
  }

  document.getElementById("sfDictTitle").textContent =
    (vm.dictMeta ? `${t(vm.dictMeta.title_i18n || vm.dictMeta.key)} · ` : "") + `${vm.dict} · #${vm.id}`;

  document.getElementById("sfName").value = vm.item.name || "";
  document.getElementById("sfColor").value = vm.item.color || "";
  document.getElementById("sfSort").value = Number(vm.item.sort || 0);
  document.getElementById("sfActive").checked = !!vm.item.active;
  document.getElementById("sfDefault").checked = !!vm.item.is_default;

  const finalRow = document.getElementById("sfFinalTypeRow");
  if (finalRow) finalRow.style.display = vm.dict === "project_types" ? "" : "none";
  if (vm.dict === "project_types") {
    document.getElementById("sfFinalType").value = vm.item.final_type || "";
  }
}

function mountEdit(vm) {
  const root = document.getElementById("settingsEdit");
  if (!root) return;

  const errEl = document.getElementById("sfError");
  const form = document.getElementById("sfForm");
  const backBtn = document.getElementById("sfBackBtn");
  const cancelBtn = document.getElementById("sfCancelBtn");

  backBtn.onclick = () => navIndex(vm.dict, vm.includeDeleted);
  cancelBtn.onclick = () => navIndex(vm.dict, vm.includeDeleted);

  form.onsubmit = async (e) => {
    e.preventDefault();
    setErr(errEl, "");

    const name = String(document.getElementById("sfName")?.value || "").trim();
    if (!name) return setErr(errEl, t("common.requiredName") || "name required");

    const payload = {
      name,
      color: String(document.getElementById("sfColor")?.value || "").trim() || null,
      sort: Number(document.getElementById("sfSort")?.value || 0),
      active: document.getElementById("sfActive")?.checked ? 1 : 0,
      is_default: document.getElementById("sfDefault")?.checked ? 1 : 0,
    };

    if (vm.dict === "project_types") {
      const ft = String(document.getElementById("sfFinalType")?.value || "").trim();
      payload.final_type = ft || null;
    }

    try {
      await api.patch(`/dict-items/${vm.id}`, payload);
      navIndex(vm.dict, vm.includeDeleted);
    } catch (e2) {
      setErr(errEl, e2?.message || "save error");
    }
  };
}

// ---------- page: view ----------
function renderView(vm) {
  const root = document.getElementById("settingsView");
  if (!root) return;

  const errEl = document.getElementById("svError");
  if (!vm.item) {
    setErr(errEl, "Item not found");
    return;
  }

  document.getElementById("svDictTitle").textContent =
    (vm.dictMeta ? `${t(vm.dictMeta.title_i18n || vm.dictMeta.key)} · ` : "") + `${vm.dict} · #${vm.id}`;

  document.getElementById("svName").textContent = vm.item.name || "";
  document.getElementById("svColor").style.background = vm.item.color || "transparent";
  document.getElementById("svColorTxt").textContent = vm.item.color || "";
  document.getElementById("svSort").textContent = String(Number(vm.item.sort || 0));
  document.getElementById("svActive").textContent = vm.item.active ? "1" : "0";
  document.getElementById("svDefault").textContent = vm.item.is_default ? "1" : "0";

  const finalRow = document.getElementById("svFinalTypeRow");
  if (finalRow) finalRow.style.display = vm.dict === "project_types" ? "" : "none";
  if (vm.dict === "project_types") {
    document.getElementById("svFinalType").textContent = vm.item.final_type || "";
  }
}

function mountView(vm) {
  const root = document.getElementById("settingsView");
  if (!root) return;

  document.getElementById("svBackBtn").onclick = () => navIndex(vm.dict, vm.includeDeleted);
  document.getElementById("svEditBtn").onclick = () => navEdit(vm.dict, vm.id, vm.includeDeleted);
}
