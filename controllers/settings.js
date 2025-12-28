import { i18n } from "./i18n.js";
import { api } from "./api.js";
import { loadTpl } from "./viewLoader.js";
import { hasPerm } from "./rbac.js";
import { appShell } from "./appShell.js";

const EP = {
  dicts: "/settings/dicts",
  items: (dict, includeDeleted) =>
    `/settings/dict-items?dict=${encodeURIComponent(dict)}&include_deleted=${includeDeleted ? 1 : 0}`,
  item: (id) => `/settings/dict-items/${encodeURIComponent(id)}`,
  create: "/settings/dict-items",
  update: (id) => `/settings/dict-items/${encodeURIComponent(id)}`,
};

function qsEscape(s) {
  return encodeURIComponent(String(s ?? ""));
}

function setText(root, sel, text) {
  const el = root.querySelector(sel);
  if (el) el.textContent = text ?? "";
}

function setHtml(root, sel, html) {
  const el = root.querySelector(sel);
  if (el) el.innerHTML = html ?? "";
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
  el.textContent = msg;
}

function safeT(key, fallback) {
  const v = i18n.t(key);
  return !v || v === key ? fallback : v;
}

function normMeDicts(dicts) {
  // expected: [{key,title,description?}]
  if (Array.isArray(dicts)) return dicts;
  return [];
}

function fallbackDicts() {
  // only as UI fallback if backend not ready
  return [
    { key: "cities", title: "Cities" },
    { key: "sources", title: "Sources" },
    { key: "spheres", title: "Spheres" },
    { key: "task_statuses", title: "Task statuses" },
    { key: "project_statuses", title: "Project statuses" },
    { key: "lead_statuses", title: "Lead statuses" },
    { key: "project_types", title: "Project types" },
  ];
}

function renderDictList(dicts, activeKey, q) {
  const query = (q || "").trim().toLowerCase();
  const list = dicts
    .filter((d) => {
      if (!query) return true;
      return (
        String(d.key || "").toLowerCase().includes(query) ||
        String(d.title || "").toLowerCase().includes(query)
      );
    })
    .map((d) => {
      const active = d.key === activeKey ? "active" : "";
      return `
        <a class="dictItem ${active}" href="#/settings/view?dict=${qsEscape(d.key)}" data-dict="${qsEscape(d.key)}">
          <div class="dictKey">${escapeHtml(d.key)}</div>
          <div class="dictTitle muted">${escapeHtml(d.title || d.key)}</div>
        </a>
      `;
    })
    .join("");

  return list || `<div class="muted" style="padding:10px">${safeT("common.noData", "No data")}</div>`;
}

function renderItemsTable(items, opts) {
  const { canEdit, canArchive, canRestore } = opts;

  if (!Array.isArray(items) || items.length === 0) {
    return `<div class="muted">${safeT("common.noData", "No data")}</div>`;
  }

  const rows = items
    .map((it) => {
      const id = it.id;
      const name = it.name ?? it.title ?? it.value ?? it.key ?? `#${id}`;
      const color = it.color ?? "";
      const sort = it.sort ?? "";
      const active = (it.active ?? 1) ? "✓" : "";
      const deleted = (it.is_deleted ?? 0) ? "archived" : "";

      const editBtn =
        canEdit && !(it.is_deleted ?? 0)
          ? `<a class="btn ghost sm" href="#/settings/edit?dict=${qsEscape(it.dict || "")}&id=${qsEscape(id)}">${safeT(
              "common.edit",
              "Edit"
            )}</a>`
          : "";

      const archiveBtn =
        canArchive && !(it.is_deleted ?? 0)
          ? `<button class="btn ghost sm" type="button" data-act="archive" data-id="${qsEscape(
              id
            )}">${safeT("common.archive", "Archive")}</button>`
          : "";

      const restoreBtn =
        canRestore && (it.is_deleted ?? 0)
          ? `<button class="btn ghost sm" type="button" data-act="restore" data-id="${qsEscape(
              id
            )}">${safeT("common.restore", "Restore")}</button>`
          : "";

      const nameLink = canEdit
        ? `<a class="link" href="#/settings/edit?dict=${qsEscape(it.dict || "")}&id=${qsEscape(id)}">${escapeHtml(
            name
          )}</a>`
        : `<span>${escapeHtml(name)}</span>`;

      return `
        <tr class="${deleted}">
          <td style="width:40%">${nameLink}</td>
          <td style="width:16%"><span class="muted">${escapeHtml(color)}</span></td>
          <td style="width:12%"><span class="muted">${escapeHtml(sort)}</span></td>
          <td style="width:10%"><span class="muted">${active}</span></td>
          <td style="width:22%">
            <div class="row" style="gap:6px;justify-content:flex-end;flex-wrap:wrap">
              ${editBtn}${archiveBtn}${restoreBtn}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div class="techTableWrap">
      <table class="techTable">
        <thead>
          <tr>
            <th>${safeT("common.name", "Name")}</th>
            <th>${safeT("common.color", "Color")}</th>
            <th>${safeT("common.sort", "Sort")}</th>
            <th>${safeT("common.active", "Active")}</th>
            <th style="text-align:right">${safeT("common.actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fetchDictsSafe() {
  try {
    const r = await api.get(EP.dicts);
    // expected: {ok:true, dicts:[...]} or direct [...]
    const dicts = normMeDicts(r?.dicts ?? r);
    return dicts.length ? dicts : fallbackDicts();
  } catch (_) {
    return fallbackDicts();
  }
}

async function fetchItemsSafe(dictKey, includeDeleted) {
  const r = await api.get(EP.items(dictKey, includeDeleted));
  const items = Array.isArray(r?.items) ? r.items : Array.isArray(r) ? r : [];
  // attach dict for routes
  return items.map((x) => ({ ...x, dict: x.dict ?? dictKey }));
}

function getDictKey(ctx) {
  return (ctx.query?.dict || "").trim();
}

function getItemId(ctx) {
  return (ctx.query?.id || "").trim();
}

function bindDictSidebar(root, dicts, activeKey) {
  const input = root.querySelector("#dictSearch");
  const listEl = root.querySelector("#dictList");

  const render = () => {
    const q = input?.value || "";
    listEl.innerHTML = renderDictList(dicts, activeKey, q);
    i18n.apply(listEl);
  };

  input?.addEventListener("input", render);
  render();
}

function bindBackToIndex(root) {
  const a = root.querySelector('[data-act="backIndex"]');
  a?.addEventListener("click", () => {
    window.location.hash = "#/settings";
  });
}

function bindFormCommon(root, initial) {
  root.querySelector("#fName").value = initial.name ?? "";
  root.querySelector("#fColor").value = initial.color ?? "";
  root.querySelector("#fSort").value = initial.sort ?? 0;
  root.querySelector("#fActive").checked = (initial.active ?? 1) ? true : false;
  root.querySelector("#fDefault").checked = (initial.is_default ?? 0) ? true : false;

  // project_types only
  const ftWrap = root.querySelector("#finalTypeWrap");
  const ft = root.querySelector("#fFinalType");
  const dictKey = root.getAttribute("data-dict") || "";

  if (dictKey === "project_types") {
    ftWrap.style.display = "";
    ft.value = initial.final_type ?? "";
  } else {
    ftWrap.style.display = "none";
    ft.value = "";
  }
}

function readForm(root) {
  const name = root.querySelector("#fName").value.trim();
  const color = root.querySelector("#fColor").value.trim();
  const sort = Number(root.querySelector("#fSort").value || 0);
  const active = root.querySelector("#fActive").checked ? 1 : 0;
  const is_default = root.querySelector("#fDefault").checked ? 1 : 0;
  const final_type = (root.querySelector("#finalTypeWrap").style.display !== "none")
    ? (root.querySelector("#fFinalType").value || "").trim()
    : null;

  return { name, color, sort, active, is_default, final_type };
}

/* =========================
   PAGES
========================= */

export const pages = {
  index: {
    async load(ctx) {
      const tpl = await loadTpl("./view/settings/index.html");
      const dicts = await fetchDictsSafe();
      return { tpl, dicts };
    },
    calc(ctx, data) {
      return data;
    },
    render(ctx, vm) {
      return vm.tpl;
    },
    mount(ctx, vm) {
      const root = ctx.outlet;
      setError(root, null);

      setText(root, '[data-slot="title"]', i18n.t("nav.settings"));
      setText(root, '[data-slot="subtitle"]', safeT("settings.subtitle", "Dictionaries"));

      // actions empty here
      setHtml(root, '[data-slot="actions"]', "");

      // dict sidebar
      bindDictSidebar(root, vm.dicts, "");

      // right pane
      setHtml(
        root,
        '[data-slot="content"]',
        `<div class="muted">${safeT("settings.pickDict", "Select a dictionary on the left")}</div>`
      );

      appShell.markActiveNav();
    },
  },

  view: {
    async load(ctx) {
      const tpl = await loadTpl("./view/settings/view.html");
      const dicts = await fetchDictsSafe();
      const dictKey = getDictKey(ctx);

      // by default do not include deleted
      const includeDeleted = ctx.query?.archived === "1";
      let items = [];
      let err = "";

      if (!dictKey) {
        err = safeT("settings.noDict", "Dictionary is not selected");
      } else {
        try {
          items = await fetchItemsSafe(dictKey, includeDeleted);
        } catch (e) {
          err = String(e?.message || e);
        }
      }

      return { tpl, dicts, dictKey, includeDeleted, items, err };
    },

    calc(ctx, data) {
      const dictTitle =
        data.dicts.find((d) => d.key === data.dictKey)?.title || data.dictKey || i18n.t("nav.settings");

      const canCreate = hasPerm("settings.create");
      const canEdit = hasPerm("settings.edit");
      const canArchive = hasPerm("settings.archive");
      const canRestore = hasPerm("settings.restore");

      return { ...data, dictTitle, canCreate, canEdit, canArchive, canRestore };
    },

    render(ctx, vm) {
      return vm.tpl;
    },

    mount(ctx, vm) {
      const root = ctx.outlet;
      setError(root, vm.err || null);

      setText(root, '[data-slot="title"]', vm.dictTitle || i18n.t("nav.settings"));
      setText(root, '[data-slot="subtitle"]', safeT("settings.items", "Items"));

      // actions
      const addBtn = vm.canCreate && vm.dictKey
        ? `<a class="btn" href="#/settings/new?dict=${qsEscape(vm.dictKey)}">+ ${safeT("common.new", "New")}</a>`
        : "";

      setHtml(
        root,
        '[data-slot="actions"]',
        `<a class="btn ghost" href="#/settings">${safeT("common.back", "Back")}</a>${addBtn}`
      );

      // dict sidebar highlight + search
      bindDictSidebar(root, vm.dicts, vm.dictKey);

      // archived toggle
      const chk = root.querySelector("#showArchived");
      chk.checked = !!vm.includeDeleted;
      chk.addEventListener("change", () => {
        const arch = chk.checked ? "1" : "0";
        window.location.hash = `#/settings/view?dict=${qsEscape(vm.dictKey)}&archived=${arch}`;
      });

      // table
      const html = renderItemsTable(vm.items, {
        canEdit: vm.canEdit,
        canArchive: vm.canArchive,
        canRestore: vm.canRestore,
      });

      setHtml(root, '[data-slot="content"]', html);
      i18n.apply(root);

      // archive/restore actions
      root.querySelector(".techTableWrap")?.addEventListener("click", async (e) => {
        const btn = e.target?.closest("button[data-act][data-id]");
        if (!btn) return;

        const act = btn.getAttribute("data-act");
        const id = btn.getAttribute("data-id");
        if (!id) return;

        try {
          setError(root, null);
          btn.disabled = true;

          if (act === "archive") {
            await api.patch(EP.update(id), { is_deleted: 1 });
          } else if (act === "restore") {
            await api.patch(EP.update(id), { is_deleted: 0 });
          }

          // refresh current view
          window.location.hash = window.location.hash;
        } catch (err) {
          setError(root, String(err?.message || err));
        } finally {
          btn.disabled = false;
        }
      });

      appShell.markActiveNav();
    },
  },

  new: {
    async load(ctx) {
      const tpl = await loadTpl("./view/settings/new.html");
      const dicts = await fetchDictsSafe();
      const dictKey = getDictKey(ctx);

      return { tpl, dicts, dictKey };
    },

    calc(ctx, data) {
      const dictTitle =
        data.dicts.find((d) => d.key === data.dictKey)?.title || data.dictKey || i18n.t("nav.settings");
      const canCreate = hasPerm("settings.create");
      return { ...data, dictTitle, canCreate };
    },

    render(ctx, vm) {
      return vm.tpl;
    },

    mount(ctx, vm) {
      const root = ctx.outlet;
      setError(root, null);

      if (!vm.canCreate) {
        setError(root, safeT("common.noAccess", "No access"));
      }

      setText(root, '[data-slot="title"]', `${i18n.t("nav.settings")} · ${safeT("common.new", "New")}`);
      setText(root, '[data-slot="subtitle"]', vm.dictTitle || "");

      setHtml(
        root,
        '[data-slot="actions"]',
        `<a class="btn ghost" href="#/settings/view?dict=${qsEscape(vm.dictKey)}">${safeT("common.back", "Back")}</a>`
      );

      bindDictSidebar(root, vm.dicts, vm.dictKey);

      // bind form
      root.setAttribute("data-dict", vm.dictKey || "");
      bindFormCommon(root, { active: 1, sort: 0, is_default: 0 });

      const form = root.querySelector("#settingsForm");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!vm.canCreate) return;

        try {
          setError(root, null);

          const payload = readForm(root);
          if (!payload.name) {
            setError(root, safeT("common.requiredName", "Name is required"));
            return;
          }

          await api.post(EP.create, { dict: vm.dictKey, ...payload });

          window.location.hash = `#/settings/view?dict=${qsEscape(vm.dictKey)}`;
        } catch (err) {
          setError(root, String(err?.message || err));
        }
      });

      appShell.markActiveNav();
    },
  },

  edit: {
    async load(ctx) {
      const tpl = await loadTpl("./view/settings/edit.html");
      const dicts = await fetchDictsSafe();
      const dictKey = getDictKey(ctx);
      const id = getItemId(ctx);

      let item = null;
      let err = "";

      if (!dictKey || !id) {
        err = safeT("common.notFound", "Not found");
      } else {
        try {
          const r = await api.get(EP.item(id));
          item = r?.item ?? r;
          if (item && !item.dict) item.dict = dictKey;
        } catch (e) {
          err = String(e?.message || e);
        }
      }

      return { tpl, dicts, dictKey, id, item, err };
    },

    calc(ctx, data) {
      const dictTitle =
        data.dicts.find((d) => d.key === data.dictKey)?.title || data.dictKey || i18n.t("nav.settings");
      const canEdit = hasPerm("settings.edit");
      return { ...data, dictTitle, canEdit };
    },

    render(ctx, vm) {
      return vm.tpl;
    },

    mount(ctx, vm) {
      const root = ctx.outlet;
      setError(root, vm.err || null);

      if (!vm.canEdit) {
        setError(root, safeT("common.noAccess", "No access"));
      }

      setText(root, '[data-slot="title"]', `${i18n.t("nav.settings")} · ${safeT("common.edit", "Edit")}`);
      setText(root, '[data-slot="subtitle"]', vm.dictTitle || "");

      setHtml(
        root,
        '[data-slot="actions"]',
        `<a class="btn ghost" href="#/settings/view?dict=${qsEscape(vm.dictKey)}">${safeT("common.back", "Back")}</a>`
      );

      bindDictSidebar(root, vm.dicts, vm.dictKey);

      root.setAttribute("data-dict", vm.dictKey || "");
      bindFormCommon(root, vm.item || {});

      const form = root.querySelector("#settingsForm");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!vm.canEdit) return;

        try {
          setError(root, null);

          const payload = readForm(root);
          if (!payload.name) {
            setError(root, safeT("common.requiredName", "Name is required"));
            return;
          }

          await api.patch(EP.update(vm.id), { dict: vm.dictKey, ...payload });

          window.location.hash = `#/settings/view?dict=${qsEscape(vm.dictKey)}`;
        } catch (err) {
          setError(root, String(err?.message || err));
        }
      });

      appShell.markActiveNav();
    },
  },
};
