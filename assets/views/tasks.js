import { t } from "../core/i18n.js";

export function renderTasks(view) {
  view.innerHTML = `
    <div class="card">
      <div class="hd">
        <b>${t("tasks")}</b>
        <span class="muted">${t("soon")}</span>
      </div>
      <div class="bd">
        <div class="muted">
          Kanban (drag&drop), modal, timer — keyingi bosqichda.
        </div>
      </div>
    </div>
  `;
}
