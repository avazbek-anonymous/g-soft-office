import { t } from "../core/i18n.js";

export function renderProjects(view) {
  view.innerHTML = `
    <div class="card">
      <div class="hd"><b>${t("projects")}</b><span class="muted">${t("soon")}</span></div>
      <div class="bd">
        <div class="muted">Pipeline + project info modal — keyingi bosqichda.</div>
      </div>
    </div>
  `;
}
