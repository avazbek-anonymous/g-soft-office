import { t } from "../core/i18n.js";

export function renderCourses(view) {
  view.innerHTML = `
    <div class="card">
      <div class="hd"><b>${t("courses")}</b><span class="muted">${t("soon")}</span></div>
      <div class="bd">
        <div class="muted">Leads + enrollments — keyingi bosqichda.</div>
      </div>
    </div>
  `;
}
