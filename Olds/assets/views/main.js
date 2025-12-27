import { state } from "../core/state.js";
import { t } from "../core/i18n.js";

export function renderMain(view) {
  view.innerHTML = `
    <div class="grid" style="grid-template-columns: 1fr; gap:16px">
      <div class="card">
        <div class="hd"><b>${t("main")}</b><span class="muted">${t("soon")}</span></div>
        <div class="bd">
          <div class="h1">${t("welcome")}, ${escapeHtml(state.user?.ism || "")} 👋</div>
          <div class="muted">Dashboard keyingi bosqichda: muddatdan o‘tgan vazifalar, bugungi ustuvorlar, tezkor ko‘rsatkichlar.</div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
