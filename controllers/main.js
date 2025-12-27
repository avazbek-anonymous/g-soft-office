import { i18n } from "./i18n.js";
import { loadTpl } from "./viewLoader.js";
import { appShell } from "./appShell.js";

export const pages = {
  index: {
    async load() {
      const tpl = await loadTpl("./view/main/index.html");
      return { tpl };
    },
    calc(ctx, d) {
      const u = ctx.user || {};
      return {
        ...d,
        name: u.full_name || u.name || u.login || `#${u.id ?? ""}`,
        role: u.role_key || u.roleKey || u.role?.name || u.role || "",
      };
    },
    render(ctx, vm) {
      return vm.tpl;
    },
    mount(ctx, vm) {
      const root = ctx.outlet;
      root.querySelector('[data-slot="title"]').textContent = i18n.t("nav.main");
      root.querySelector('[data-slot="subtitle"]').textContent = i18n.t("main.welcome");
      root.querySelector('[data-slot="content"]').innerHTML = `
        <div class="card" style="padding:12px; box-shadow:none;">
          <div class="caps" style="font-size:12px;letter-spacing:.10em">${escapeHtml(vm.name)}</div>
          <div class="muted" style="margin-top:4px">${escapeHtml(vm.role)}</div>
        </div>
      `;
      appShell.markActiveNav();
    },
  },
};

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
