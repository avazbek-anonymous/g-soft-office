import { i18n } from "./i18n.js";
import { loadTpl } from "./viewLoader.js";
import { appShell } from "./appShell.js";
import { hasPerm } from "./rbac.js";

function setSlot(root, sel, text) {
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
  if (!v || v === key) return fallback;
  return v;
}

function iconSpan(file, extraClass = "ico") {
  return `<span class="${extraClass}" style="--ico-url:url('./icons/${file}')"></span>`;
}

export function makeModulePages(moduleName, navTitleKey) {
  function page(pageName) {
    return {
      async load(ctx) {
        const tpl = await loadTpl(`./view/${moduleName}/${pageName}.html`);
        return { tpl };
      },

      calc(ctx, data) {
        return { ...data, moduleName, navTitleKey, pageName };
      },

      render(ctx, vm) {
        return vm.tpl;
      },

      mount(ctx, vm) {
        const root = ctx.outlet;
        const id = ctx.query?.id;

        setError(root, null);

        setSlot(root, '[data-slot="title"]', i18n.t(vm.navTitleKey));
        setSlot(root, '[data-slot="subtitle"]', `${vm.moduleName} · ${vm.pageName}`);

        setHtml(
          root,
          '[data-slot="content"]',
          `<div class="muted">${safeT("common.comingSoon", "Coming soon")}</div>`
        );

        const actions = root.querySelector('[data-slot="actions"]');
        if (actions) {
          const base = `#/${vm.moduleName}`;

          const canIndex  = hasPerm(`${vm.moduleName}.index`);
          const canView   = hasPerm(`${vm.moduleName}.view`);
          const canNew    = hasPerm(`${vm.moduleName}.new`);
          const canEdit   = hasPerm(`${vm.moduleName}.edit`);
          const canDelete = hasPerm(`${vm.moduleName}.delete`);

          const btnBack = canIndex
            ? `<a class="btn ghost" href="${base}">
                 <span class="btnRow">← ${safeT("common.back", "Back")}</span>
               </a>`
            : "";

          const btnNew = canNew
            ? `<a class="btn" href="${base}/new">
                 <span class="btnRow">+ ${safeT("common.new", "New")}</span>
               </a>`
            : "";

          const btnEdit = canEdit && id
            ? `<a class="btn" href="${base}/edit?id=${encodeURIComponent(id)}">
                 <span class="btnRow">${iconSpan("edit.svg")} ${safeT("common.edit","Edit")}</span>
               </a>`
            : "";

          const btnView = canView && id
            ? `<a class="btn ghost" href="${base}/view?id=${encodeURIComponent(id)}">
                 <span class="btnRow">${safeT("common.view","View")}</span>
               </a>`
            : "";

          const btnArchive = canDelete && id
            ? `<button class="btn ghost" type="button" data-act="archive">
                 <span class="btnRow">${iconSpan("delete.svg")} ${safeT("common.archive","Archive")}</span>
               </button>`
            : "";

          if (vm.pageName === "index") {
            actions.innerHTML = `${btnNew}`;
          } else if (vm.pageName === "view") {
            actions.innerHTML = `${btnBack}${btnEdit}${btnArchive}`;
          } else if (vm.pageName === "new") {
            actions.innerHTML = `${btnBack}`;
          } else if (vm.pageName === "edit") {
            actions.innerHTML = `${btnBack}${btnView}`;
          } else {
            actions.innerHTML = `${btnBack}`;
          }

          actions.onclick = (e) => {
            const b = e.target?.closest("button[data-act]");
            if (!b) return;
            setError(root, safeT("common.notImplemented", "Action is not implemented yet"));
          };
        }

        appShell.markActiveNav();
      },
    };
  }

  return {
    index: page("index"),
    view: page("view"),
    new: page("new"),
    edit: page("edit"),
  };
}
