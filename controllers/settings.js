// settings.js
import { i18n } from "./i18n.js";
import { api } from "./api.js";
import { loadTpl } from "./viewLoader.js";
import { appShell } from "./appShell.js";
import { hasPerm } from "./rbac.js";
import { router } from "./router.js";

const LS_DICT = "gsoft.settings.dict";
const LS_ARCH = "gsoft.settings.include_deleted";

function langNow() {
  return i18n.lang || window.APP?.lang || "ru";
}

function safeT(key, fb) {
  const v = i18n.t(key);
  if (v && v !== key) return v;
  if (typeof fb === "string") return fb;

  const L = langNow();
  return (fb && (fb[L] || fb.ru || fb.en)) || key;
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(file) {
  return `<span class="ico" style="--ico-url:url('./icons/${file}')"></span>`;
}

/**
 * ВАЖНО:
 * backend не даёт endpoint "list all dict keys".
 * Поэтому список ключей тут — минимальный.
 * (потом при желании перенесём в register.json, но сейчас — чтобы Settings работал сразу)
 */
function getDicts() {
  // если когда-то добавишь window.REGISTER.dicts — он подхватится
  const reg = window.REGISTER || window.APP?.REGISTER || null;
  if (reg && Array.isArray(reg.dicts) && reg.dicts.length) return reg.dicts;

  return [
    { key: "cities", titleKey: "settings.dict.cities", fallback: { ru: "Города", uz: "Shaharlar", en: "Cities" } },
    { key: "sources", titleKey: "settings.dict.sources", fallback: { ru: "Источники", uz: "Manbalar", en: "Sources" } },
    { key: "spheres", titleKey: "settings.dict.spheres", fallback: { ru: "Сферы", uz: "Soha", en: "Spheres" } },
    { key: "task_statuses", titleKey: "settings.dict.task_statuses", fallback: { ru: "Статусы задач", uz: "Vazifa statuslari", en: "Task statuses" } },
    { key: "project_statuses", titleKey: "settings.dict.project_statuses", fallback: { ru: "Статусы проектов", uz: "Loyiha statuslari", en: "Project statuses" } },
    { key: "lead_statuses", titleKey: "settings.dict.lead_statuses", fallback: { ru: "Статусы лидов", uz: "Lead statuslari", en: "Lead statuses" } },
    { key: "project_types", titleKey: "settings.dict.project_types", fallback: { ru: "Типы проектов", uz: "Loyiha turlari", en: "Project types" } },
  ];
}

function dictTitle(dict) {
  return safeT(dict.titleKey, dict.fallback);
}

function getSelectedDict(ctx) {
  const dicts = getDicts();
  const q = (ctx.query?.dict || "").trim();
  const fromLs = (localStorage.getItem(LS_DICT) || "").trim();
  const key = q || fromLs || (dicts[0]?.key || "");
  return dicts.some((d) => d.key === key) ? key : (dicts[0]?.key || "");
}

function getIncludeDeleted(ctx) {
  const q = ctx.query?.include_deleted;
  if (q === "1") return true;
  if (q === "0") return false;
  return localStorage.getItem(LS_ARCH) === "1";
}

function setIncludeDeleted(v) {
  localStorage.setItem(LS_ARCH, v ? "1" : "0");
}

function setSelectedDict(key) {
  localStorage.setItem(LS_DICT, key);
}

function buildHash(path, q = {}) {
  const sp = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return `#${path}${qs ? `?${qs}` : ""}`;
}

function getActionFromPath(path) {
  // "/settings", "/settings/new", "/settings/edit", "/settings/view"
  const seg = String(path || "/settings").split("/").filter(Boolean);
  return seg[1] || "index";
}

function canViewSettings() {
  return hasPerm("settings.view") || hasPerm("settings.index") || hasPerm("*");
}

function canEditSettings() {
  return hasPerm("settings.edit") || hasPerm("*");
}

function setError(root, msg) {
  const el = root.querySelector('[data-slot="error"]');
  if (!el) return;
  if (!msg) {
    el.classList.remove("show");
    el.textContent = "";
    return;
  }
  el.classList.add("show");
  el.textContent = String(msg);
}

/* =========================
   PAGE: INDEX
========================= */
async function loadIndex(ctx) {
  const tpl = await loadTpl("./view/settings/index.html");
  const dictKey = getSelectedDict(ctx);
  const includeDeleted = getIncludeDeleted(ctx);
  setSelectedDict(dictKey);
  setIncludeDeleted(includeDeleted);

  let items = [];
  if (dictKey) {
    const res = await api.get(`/dict/${encodeURIComponent(dictKey)}/all`);
    items = res?.items || [];
  }

  return { tpl, dictKey, includeDeleted, dicts: getDicts(), items };
}

function calcIndex(ctx, d) {
  const items = Array.isArray(d.items) ? d.items : [];
  const visible = d.includeDeleted ? items : items.filter((x) => !x.is_deleted);
  return {
    ...d,
    items,
    visibleCount: visible.length,
    totalCount: items.length,
  };
}

function renderIndex(ctx, vm) {
  return vm.tpl;
}

function mountIndex(ctx, vm) {
  const root = ctx.outlet;

  root.querySelector('[data-slot="title"]').textContent = i18n.t("nav.settings");
  root.querySelector('[data-slot="subtitle"]').textContent = safeT(
    "settings.subtitle",
    { ru: "Справочники (dict_items)", uz: "Ma’lumotnomalar (dict_items)", en: "Dictionaries (dict_items)" }
  );

  const dicts = vm.dicts || [];
  const dictKey = vm.dictKey || "";
  const canView = canViewSettings();
  const canEdit = canEditSettings();

  const content = root.querySelector('[data-slot="content"]');

  content.innerHTML = `
    <div class="st-grid">
      <div class="card st-left">
        <div class="st-leftHead">
          <div class="caps">${safeT("settings.dicts", { ru: "Справочники", uz: "Ma’lumotnomalar", en: "Dictionaries" })}</div>
        </div>

        <div class="st-dictList" id="stDictList">
          ${
            dicts
              .map((d) => {
                const active = d.key === dictKey ? "active" : "";
                return `
                  <button class="st-dictBtn ${active}" type="button" data-dict="${esc(d.key)}">
                    <div class="st-dictTitle">${esc(dictTitle(d))}</div>
                    <div class="st-dictKey muted">${esc(d.key)}</div>
                  </button>
                `;
              })
              .join("")
          }
        </div>
      </div>

      <div class="card st-right">
        <div class="st-top">
          <div class="row" style="gap:10px;flex-wrap:wrap">
            <div class="st-search">
              <input class="input" id="stSearch" type="text" placeholder="${esc(
                safeT("settings.search", { ru: "Поиск...", uz: "Qidiruv...", en: "Search..." })
              )}">
            </div>

            <label class="st-check">
              <input type="checkbox" id="stArchived" ${vm.includeDeleted ? "checked" : ""}>
              <span>${esc(safeT("settings.showArchived", { ru: "Показывать архив", uz: "Arxivni ko‘rsatish", en: "Show archived" }))}</span>
            </label>
          </div>

          <div class="row" style="gap:8px;align-items:center">
            ${
              canEdit
                ? `<a class="btn" id="stBtnNew" href="${buildHash("/settings/new", { dict: dictKey })}">
                    <span class="btnRow">+ ${esc(safeT("common.new", { ru: "Создать", uz: "Yaratish", en: "New" }))}</span>
                   </a>`
                : ""
            }
          </div>
        </div>

        <div class="st-meta muted">
          ${esc(safeT("settings.count", { ru: "Записей", uz: "Yozuvlar", en: "Items" }))}:
          <b>${vm.visibleCount}</b> / ${vm.totalCount}
        </div>

        <div class="st-tableWrap">
          <table class="st-table">
            <thead>
              <tr>
                <th>${esc(safeT("settings.col.name", { ru: "Название", uz: "Nomi", en: "Name" }))}</th>
                <th class="c">${esc(safeT("settings.col.color", { ru: "Цвет", uz: "Rang", en: "Color" }))}</th>
                <th class="c">${esc(safeT("settings.col.sort", { ru: "Сорт", uz: "Tartib", en: "Sort" }))}</th>
                <th class="c">${esc(safeT("settings.col.active", { ru: "Актив", uz: "Faol", en: "Active" }))}</th>
                <th class="c">${esc(safeT("settings.col.default", { ru: "По умолч.", uz: "Default", en: "Default" }))}</th>
                <th class="c">${esc(safeT("settings.col.state", { ru: "Статус", uz: "Holat", en: "State" }))}</th>
                <th class="c">${esc(safeT("settings.col.actions", { ru: "Действия", uz: "Amallar", en: "Actions" }))}</th>
              </tr>
            </thead>
            <tbody id="stTbody"></tbody>
          </table>

          <div class="st-empty muted" id="stEmpty" style="display:none">
            ${esc(safeT("settings.empty", { ru: "Нет данных", uz: "Ma’lumot yo‘q", en: "No data" }))}
          </div>
        </div>
      </div>
    </div>
  `;

  i18n.apply(root);

  function renderRows() {
    const tb = root.querySelector("#stTbody");
    const empty = root.querySelector("#stEmpty");
    const q = (root.querySelector("#stSearch")?.value || "").trim().toLowerCase();

    let list = Array.isArray(vm.items) ? vm.items.slice() : [];
    if (!vm.includeDeleted) list = list.filter((x) => !x.is_deleted);

    if (q) {
      list = list.filter((x) => String(x.name || "").toLowerCase().includes(q));
    }

    if (!list.length) {
      tb.innerHTML = "";
      empty.style.display = "block";
      return;
    }
    empty.style.display = "none";

    tb.innerHTML = list
      .map((it) => {
        const id = it.id;
        const color = it.color ? String(it.color) : "";
        const active = it.active ? 1 : 0;
        const del = it.is_deleted ? 1 : 0;
        const def = it.is_default ? 1 : 0;

        const stateBadge = del
          ? `<span class="st-badge danger">${esc(safeT("settings.archived", { ru: "Архив", uz: "Arxiv", en: "Archived" }))}</span>`
          : active
            ? `<span class="st-badge ok">${esc(safeT("settings.active", { ru: "Актив", uz: "Faol", en: "Active" }))}</span>`
            : `<span class="st-badge warn">${esc(safeT("settings.inactive", { ru: "Неактив", uz: "Faol emas", en: "Inactive" }))}</span>`;

        const viewHref = buildHash("/settings/view", { dict: dictKey, id });
        const editHref = buildHash("/settings/edit", { dict: dictKey, id });

        const btnEdit = canEdit && !del
          ? `<a class="btn sm ghost" href="${editHref}" title="edit"><span class="btnRow">${icon("edit.svg")}</span></a>`
          : "";

        const btnToggleArchive = canEdit
          ? del
            ? `<button class="btn sm ghost" type="button" data-act="restore" data-id="${id}" title="restore">
                 <span class="btnRow">${esc(safeT("common.restore", { ru: "↩", uz: "↩", en: "↩" }))}</span>
               </button>`
            : `<button class="btn sm ghost" type="button" data-act="archive" data-id="${id}" title="archive">
                 <span class="btnRow">${icon("delete.svg")}</span>
               </button>`
          : "";

        return `
          <tr class="${del ? "isDel" : ""}">
            <td>
              <a class="st-link" href="${viewHref}">${esc(it.name || "")}</a>
              ${it.final_type ? `<div class="muted" style="margin-top:2px;font-size:12px">final_type: ${esc(it.final_type)}</div>` : ""}
            </td>
            <td class="c">
              ${color ? `<span class="st-swatch" style="background:${esc(color)}"></span>` : `<span class="muted">—</span>`}
            </td>
            <td class="c">${Number(it.sort || 0)}</td>
            <td class="c">${active ? "✓" : "—"}</td>
            <td class="c">${def ? "✓" : "—"}</td>
            <td class="c">${stateBadge}</td>
            <td class="c">
              <div class="row" style="gap:6px;justify-content:center">
                ${btnEdit}
                ${btnToggleArchive}
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  // Dict select
  root.querySelector("#stDictList")?.addEventListener("click", (e) => {
    const b = e.target?.closest("button[data-dict]");
    if (!b) return;
    const k = b.getAttribute("data-dict");
    if (!k || k === dictKey) return;

    setSelectedDict(k);
    window.location.hash = buildHash("/settings", { dict: k, include_deleted: vm.includeDeleted ? 1 : 0 });
  });

  // Search
  root.querySelector("#stSearch")?.addEventListener("input", () => renderRows());

  // Show archived toggle
  root.querySelector("#stArchived")?.addEventListener("change", (e) => {
    const v = !!e.target.checked;
    setIncludeDeleted(v);
    window.location.hash = buildHash("/settings", { dict: dictKey, include_deleted: v ? 1 : 0 });
  });

  // Archive/restore actions
  root.querySelector("#stTbody")?.addEventListener("click", async (e) => {
    const btn = e.target?.closest("button[data-act][data-id]");
    if (!btn) return;

    const act = btn.getAttribute("data-act");
    const id = Number(btn.getAttribute("data-id"));
    if (!id) return;

    try {
      if (act === "archive") {
        await api.patch(`/dict-items/${id}`, { is_deleted: 1 });
      } else if (act === "restore") {
        await api.patch(`/dict-items/${id}`, { is_deleted: 0 });
      }
      router.refresh();
    } catch (err) {
      setError(root, err?.message || "error");
    }
  });

  renderRows();
  appShell.markActiveNav();
}

/* =========================
   PAGE: NEW / EDIT / VIEW (FORM)
========================= */
async function loadForm(ctx) {
  const action = getActionFromPath(ctx.path);
  const tpl = await loadTpl(`./view/settings/${action}.html`);

  const dictKey = getSelectedDict(ctx);
  const dicts = getDicts();

  const id = Number(ctx.query?.id || 0);

  let item = null;
  if ((action === "edit" || action === "view") && dictKey && id) {
    const res = await api.get(`/dict/${encodeURIComponent(dictKey)}/all`);
    const items = res?.items || [];
    item = items.find((x) => Number(x.id) === id) || null;
  }

  return { tpl, action, dictKey, dicts, id, item };
}

function calcForm(ctx, d) {
  return d;
}

function renderForm(ctx, vm) {
  return vm.tpl;
}

function mountForm(ctx, vm) {
  const root = ctx.outlet;
  const canEdit = canEditSettings();

  const dicts = vm.dicts || [];
  const dictKey = vm.dictKey || "";
  const dictObj = dicts.find((x) => x.key === dictKey) || null;

  const action = vm.action; // "new" | "edit" | "view"
  const id = vm.id;
  const item = vm.item;

  root.querySelector('[data-slot="title"]').textContent = i18n.t("nav.settings");

  const sub =
    action === "new" ? safeT("settings.sub.new", { ru: "Создание", uz: "Yaratish", en: "Create" }) :
    action === "edit" ? safeT("settings.sub.edit", { ru: "Редактирование", uz: "Tahrirlash", en: "Edit" }) :
    safeT("settings.sub.view", { ru: "Просмотр", uz: "Ko‘rish", en: "View" });

  root.querySelector('[data-slot="subtitle"]').textContent =
    `${sub}${dictObj ? ` · ${dictTitle(dictObj)}` : ""}`;

  const content = root.querySelector('[data-slot="content"]');

  if ((action === "edit" || action === "view") && !item) {
    content.innerHTML = `
      <div class="card" style="padding:12px">
        <div class="muted">${esc(safeT("settings.notFound", { ru: "Запись не найдена", uz: "Topilmadi", en: "Not found" }))}</div>
      </div>
    `;
    i18n.apply(root);
    appShell.markActiveNav();
    return;
  }

  const readonly = action === "view" || !canEdit;

  content.innerHTML = `
    <div class="card st-formCard">
      <form id="stForm" class="st-form">
        <div class="st-formGrid">
          <div class="col" style="gap:6px">
            <label class="st-label">${esc(safeT("settings.field.dict", { ru: "Справочник", uz: "Ma’lumotnoma", en: "Dictionary" }))}</label>
            <select class="input" id="stDictSel" ${action !== "new" ? "disabled" : ""}>
              ${dicts.map((d) => `<option value="${esc(d.key)}" ${d.key === dictKey ? "selected" : ""}>${esc(dictTitle(d))}</option>`).join("")}
            </select>
          </div>

          <div class="col" style="gap:6px">
            <label class="st-label">${esc(safeT("settings.field.name", { ru: "Название", uz: "Nomi", en: "Name" }))} *</label>
            <input class="input" id="stName" type="text" value="${esc(item?.name || "")}" ${readonly ? "disabled" : ""}>
          </div>

          <div class="col" style="gap:6px">
            <label class="st-label">${esc(safeT("settings.field.color", { ru: "Цвет (опц.)", uz: "Rang (ixt.)", en: "Color (opt.)" }))}</label>
            <input class="input" id="stColor" type="text" placeholder="#00E5FF" value="${esc(item?.color || "")}" ${readonly ? "disabled" : ""}>
          </div>

          <div class="col" style="gap:6px">
            <label class="st-label">${esc(safeT("settings.field.sort", { ru: "Сорт", uz: "Tartib", en: "Sort" }))}</label>
            <input class="input" id="stSort" type="number" value="${Number(item?.sort || 0)}" ${readonly ? "disabled" : ""}>
          </div>

          <div class="row" style="gap:16px;align-items:center;flex-wrap:wrap">
            <label class="st-check">
              <input type="checkbox" id="stActive" ${item?.active === 0 ? "" : "checked"} ${readonly ? "disabled" : ""}>
              <span>${esc(safeT("settings.field.active", { ru: "Активный", uz: "Faol", en: "Active" }))}</span>
            </label>

            <label class="st-check">
              <input type="checkbox" id="stDefault" ${item?.is_default ? "checked" : ""} ${readonly ? "disabled" : ""}>
              <span>${esc(safeT("settings.field.default", { ru: "По умолчанию", uz: "Default", en: "Default" }))}</span>
            </label>

            <label class="st-check">
              <input type="checkbox" id="stDeleted" ${item?.is_deleted ? "checked" : ""} ${readonly ? "disabled" : ""}>
              <span>${esc(safeT("settings.field.archived", { ru: "Архив", uz: "Arxiv", en: "Archived" }))}</span>
            </label>
          </div>

          <div class="col" style="gap:6px">
            <label class="st-label">${esc(safeT("settings.field.finalType", { ru: "final_type (для project_types)", uz: "final_type (project_types)", en: "final_type (project_types)" }))}</label>
            <select class="input" id="stFinalType" ${readonly ? "disabled" : ""}>
              <option value="" ${!item?.final_type ? "selected" : ""}>—</option>
              <option value="success" ${item?.final_type === "success" ? "selected" : ""}>success</option>
              <option value="cancel" ${item?.final_type === "cancel" ? "selected" : ""}>cancel</option>
            </select>
          </div>

          <div class="row st-formActions" style="gap:8px;flex-wrap:wrap">
            <a class="btn ghost" href="${buildHash("/settings", { dict: dictKey })}">
              <span class="btnRow">← ${esc(safeT("common.back", { ru: "Назад", uz: "Orqaga", en: "Back" }))}</span>
            </a>

            ${
              action === "view" && canEdit
                ? `<a class="btn" href="${buildHash("/settings/edit", { dict: dictKey, id })}">
                     <span class="btnRow">${icon("edit.svg")} ${esc(safeT("common.edit", { ru: "Редактировать", uz: "Tahrirlash", en: "Edit" }))}</span>
                   </a>`
                : ""
            }

            ${
              !readonly
                ? `<button class="btn" type="submit">
                     <span class="btnRow">${esc(safeT("common.save", { ru: "Сохранить", uz: "Saqlash", en: "Save" }))}</span>
                   </button>`
                : ""
            }
          </div>
        </div>
      </form>
    </div>
  `;

  i18n.apply(root);

  const form = root.querySelector("#stForm");
  const dictSel = root.querySelector("#stDictSel");

  dictSel?.addEventListener("change", (e) => {
    const k = String(e.target.value || "");
    if (!k) return;
    setSelectedDict(k);
    // остаёмся на new, меняем dict
    window.location.hash = buildHash("/settings/new", { dict: k });
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (readonly) return;

    setError(root, null);

    const dk = String(root.querySelector("#stDictSel")?.value || dictKey);
    const name = String(root.querySelector("#stName")?.value || "").trim();
    const color = String(root.querySelector("#stColor")?.value || "").trim();
    const sort = Number(root.querySelector("#stSort")?.value || 0);
    const active = root.querySelector("#stActive")?.checked ? 1 : 0;
    const is_default = root.querySelector("#stDefault")?.checked ? 1 : 0;
    const is_deleted = root.querySelector("#stDeleted")?.checked ? 1 : 0;
    const final_type = String(root.querySelector("#stFinalType")?.value || "").trim();

    if (!name) {
      setError(root, safeT("settings.err.name", { ru: "Название обязательно", uz: "Nomi majburiy", en: "Name is required" }));
      return;
    }

    try {
      if (action === "new") {
        await api.post(`/dict/${encodeURIComponent(dk)}`, {
          name,
          color: color || null,
          sort,
          active,
          is_default,
          final_type: final_type || null,
        });
        setSelectedDict(dk);
        window.location.hash = buildHash("/settings", { dict: dk });
        return;
      }

      if (action === "edit") {
        await api.patch(`/dict-items/${id}`, {
          name,
          color: color || null,
          sort,
          active,
          is_default,
          is_deleted,
          final_type: final_type || null,
        });
        window.location.hash = buildHash("/settings/view", { dict: dk, id });
        return;
      }
    } catch (err) {
      setError(root, err?.message || "error");
    }
  });

  appShell.markActiveNav();
}

/* =========================
   EXPORT PAGES
========================= */
export const pages = {
  index: {
    async load(ctx) {
      if (!canViewSettings()) throw new Error("Forbidden: settings.view");
      return await loadIndex(ctx);
    },
    calc: calcIndex,
    render: renderIndex,
    mount: mountIndex,
  },

  view: {
    async load(ctx) {
      if (!canViewSettings()) throw new Error("Forbidden: settings.view");
      return await loadForm(ctx);
    },
    calc: calcForm,
    render: renderForm,
    mount: mountForm,
  },

  new: {
    async load(ctx) {
      if (!canEditSettings()) throw new Error("Forbidden: settings.edit");
      return await loadForm(ctx);
    },
    calc: calcForm,
    render: renderForm,
    mount: mountForm,
  },

  edit: {
    async load(ctx) {
      if (!canEditSettings()) throw new Error("Forbidden: settings.edit");
      return await loadForm(ctx);
    },
    calc: calcForm,
    render: renderForm,
    mount: mountForm,
  },
};
