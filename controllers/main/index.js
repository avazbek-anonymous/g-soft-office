import { i18n } from "../i18n.js";
import { appShell } from "../appShell.js";

async function load() {
  return {};
}

function calc(ctx) {
  const u = ctx.user || {};
  return {
    name: u.full_name || u.name || u.login || `#${u.id ?? ""}`,
    role: u.role_key || u.role || "",
  };
}

function render(ctx, vm) {
  // Simple “Jarvis panels” placeholder
  return `
    <div class="card" style="padding:14px;">
      <div class="row" style="justify-content:space-between;gap:14px;flex-wrap:wrap">
        <div class="col" style="gap:4px;min-width:260px">
          <div class="caps" style="font-weight:900;font-size:13px;letter-spacing:.12em" data-i18n="nav.main"></div>
          <div class="muted" data-i18n="main.welcome"></div>
        </div>

        <div class="card" style="padding:10px 12px; border:1px solid var(--stroke2); background:rgba(255,255,255,0.03); box-shadow:none;">
          <div class="caps" style="font-size:12px;letter-spacing:.10em">${escapeHtml(vm.name)}</div>
          <div class="muted" style="font-size:12px">${escapeHtml(vm.role)}</div>
        </div>
      </div>

      <div style="margin-top:12px; display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px;">
        <div class="card" style="padding:14px; box-shadow:none;">
          <div class="caps" style="font-weight:800;font-size:12px;letter-spacing:.10em">SYSTEM</div>
          <div class="muted" style="margin-top:6px;">/me ✅ · shell ✅ · i18n ✅ · router ✅</div>
        </div>

        <div class="card" style="padding:14px; box-shadow:none;">
          <div class="caps" style="font-weight:800;font-size:12px;letter-spacing:.10em" data-i18n="common.comingSoon"></div>
          <div class="muted" style="margin-top:6px;">tasks/projects/courses/clients/settings…</div>
        </div>
      </div>
    </div>
  `;
}

function mount() {
  // update active nav + header title
  appShell.markActiveNav();
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const controller = { load, calc, render, mount };
