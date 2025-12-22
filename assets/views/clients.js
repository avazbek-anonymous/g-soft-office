import { t } from "../core/i18n.js";

export function renderClients(view) {
  view.innerHTML = `
    <div class="card">
      <div class="hd"><b>${t("clients")}</b><span class="muted">${t("soon")}</span></div>
      <div class="bd">
        <div class="muted">Clients + deals (CRM) — keyingi bosqichda.</div>
      </div>
    </div>
  `;
}
