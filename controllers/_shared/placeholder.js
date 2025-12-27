import { i18n } from "../i18n.js";
import { appShell } from "../appShell.js";

async function load(ctx) {
  return { title: i18n.t(ctx.titleKey || "common.comingSoon") };
}

function calc(ctx, data) {
  return data;
}

function render(ctx, vm) {
  return `
    <div class="card" style="padding:14px;">
      <div class="caps" style="font-weight:900;font-size:13px;letter-spacing:.12em">${escapeHtml(vm.title)}</div>
      <div class="muted" style="margin-top:6px;" data-i18n="common.comingSoon"></div>
    </div>
  `;
}

function mount() {
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
