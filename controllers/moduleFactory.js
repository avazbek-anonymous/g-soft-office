import { i18n } from "./i18n.js";
import { loadTpl } from "./viewLoader.js";
import { appShell } from "./appShell.js";

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

        setError(root, null);

        // Title/subtitle
        setSlot(root, '[data-slot="title"]', i18n.t(vm.navTitleKey));
        setSlot(root, '[data-slot="subtitle"]', `${vm.moduleName} · ${vm.pageName}`);

        // Default content placeholder
        setHtml(
          root,
          '[data-slot="content"]',
          `<div class="muted">${i18n.t("common.comingSoon")}</div>`
        );

        // Optional actions
        const actions = root.querySelector('[data-slot="actions"]');
        if (actions) {
          const base = `#/${vm.moduleName}`;
          actions.innerHTML = `
            <a class="btn ghost" href="${base}">${i18n.t("nav." + vm.moduleName) || i18n.t(vm.navTitleKey)}</a>
            <a class="btn" href="${base}/new">+ new</a>
          `;
        }

        // Refresh active nav highlight
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
