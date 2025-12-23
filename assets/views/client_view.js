import { state } from "../core/state.js";
import { t } from "../core/i18n.js";
import { apiFetch } from "../core/api.js";
import { toast } from "../ui/toast.js";

const $ = (sel, el = document) => el.querySelector(sel);

export async function renderClientView(view, params = {}) {
  const id = getClientId(params);
  if (!id) {
    view.innerHTML = `<div class="card"><div class="bd">${t("notFound")}</div></div>`;
    return;
  }

  view.innerHTML = `
    <div class="card cv">
      <div class="hd cv-hd">
        <div class="cv-left">
          <button class="btn" id="back">← ${t("back") || "Back"}</button>
          <div class="cv-title">
            <b id="title">${t("loading") || "Loading..."}</b>
            <div class="muted" id="subtitle"></div>
          </div>
        </div>
        <div class="cv-right">
          <span class="badge" id="badge"></span>
        </div>
      </div>

      <div class="bd">
        <div class="cv-grid" id="info"></div>

        <div class="cv-sections">

          <div class="cv-sec">
            <div class="cv-sec-h">
              <b>${t("projects")}</b>
              <span class="muted" id="pCount"></span>
            </div>
            <div id="projects"></div>
          </div>

          <div class="cv-sec">
            <div class="cv-sec-h">
              <b>${t("tasks")}</b>
              <span class="muted" id="tCount"></span>
            </div>
            <div id="tasks"></div>
          </div>

          <div class="cv-sec">
            <div class="cv-sec-h">
              <b>${t("courses")}</b>
              <span class="muted" id="cCount"></span>
            </div>
            <div id="courses"></div>
          </div>

        </div>
      </div>
    </div>

    <style>
      .cv-hd{display:flex; align-items:center; justify-content:space-between; gap:10px}
      .cv-left{display:flex; align-items:center; gap:12px; min-width:0}
      .cv-title{display:flex; flex-direction:column; min-width:0}
      .cv-title b{white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
      .cv-title .muted{font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}

      .cv-grid{
        display:grid;
        grid-template-columns: repeat(3, minmax(0,1fr));
        gap:10px;
      }
      @media(max-width: 1100px){ .cv-grid{grid-template-columns: repeat(2, minmax(0,1fr));} }
      @media(max-width: 820px){ .cv-grid{grid-template-columns: 1fr;} }

      .kv{
        padding:12px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:16px;
        background: rgba(255,255,255,.02);
      }
      body[data-theme="light"] .kv{
        border-color: rgba(0,0,0,.10);
        background: rgba(0,0,0,.02);
      }
      .kv .k{font-size:12px; opacity:.7; margin-bottom:6px}
      .kv .v{font-weight:600; word-break:break-word}
      .kv .v.muted{font-weight:500}

      .cv-sections{margin-top:14px; display:grid; gap:14px}
      .cv-sec{
        border:1px solid rgba(255,255,255,.10);
        border-radius:16px;
        overflow:hidden;
      }
      body[data-theme="light"] .cv-sec{border-color: rgba(0,0,0,.10)}
      .cv-sec-h{
        padding:12px 14px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        border-bottom:1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.02);
      }
      body[data-theme="light"] .cv-sec-h{border-bottom-color: rgba(0,0,0,.08)}
      .cv-sec > div:last-child{padding:12px 14px}

      .list{display:grid; gap:10px}
      .row{
        display:flex; align-items:flex-start; gap:10px;
        padding:12px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:14px;
        background: rgba(255,255,255,.02);
      }
      body[data-theme="light"] .row{
        border-color: rgba(0,0,0,.10);
        background: rgba(0,0,0,.02);
      }
      .row .sp{flex:1; min-width:0}
      .row b{display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
      .row .meta{font-size:12px; color:var(--muted); margin-top:4px}
      .row .right{display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end}

      .badge{display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px; font-size:12px; border:1px solid rgba(255,255,255,.12); opacity:.9}
      body[data-theme="light"] .badge{border-color: rgba(0,0,0,.12)}
      .b-ok{background:rgba(34,197,94,.14); border-color:rgba(34,197,94,.35)}
      .b-warn{background:rgba(245,158,11,.14); border-color:rgba(245,158,11,.35)}
      .b-danger{background:rgba(239,68,68,.14); border-color:rgba(239,68,68,.35)}
      .b-off{background:rgba(148,163,184,.10)}
      .empty{padding:10px; border:1px dashed rgba(255,255,255,.12); border-radius:14px; opacity:.75}
      body[data-theme="light"] .empty{border-color: rgba(0,0,0,.12)}

      .link{color:inherit; text-decoration:none}
      .link:hover{text-decoration:underline}
    </style>
  `;

  $("#back", view).onclick = () => {
    // назад в список клиентов
    location.hash = "#/clients";
  };

  try {
    await preloadDictForClientView();

    const client = await apiFetch(`/clients/${id}`).then(r => r.client || r.item || r);
    if (!client) throw new Error("Client not found");

    // Заголовок
    $("#title", view).textContent = client.company_name || client.full_name || `${t("client") || "Client"} #${id}`;
    $("#subtitle", view).textContent = [client.code, getCityName(client), getSourceName(client)].filter(Boolean).join(" • ");

    // Badge
    const del = Number(client.is_deleted) === 1;
    const badge = $("#badge", view);
    badge.className = "badge " + (del ? "b-danger" : "b-ok");
    badge.textContent = del ? (t("deleted") || "Deleted") : (t("active") || "Active");

    // Карточка данных
    $("#info", view).innerHTML = infoGridHtml(client);

    // Проекты
    const projects = await apiFetch(`/projects?client_id=${id}&status=all`).then(r => r.projects || r.items || []);
    $("#pCount", view).textContent = projects?.length ? `${projects.length}` : "";

    $("#projects", view).innerHTML = projects?.length
      ? `<div class="list">${projects.map(projectRowHtml).join("")}</div>`
      : `<div class="empty">${t("notFound")}</div>`;

    // Задачи по проектам (deal_id = project.id)
    let allTasks = [];
    if (projects?.length) {
      const chunks = [];
      for (const p of projects) {
        try {
          const td = await apiFetch(`/tasks?deal_id=${p.id}&status=all`).then(r => r.tasks || r.items || []);
          chunks.push({ project: p, tasks: td });
          allTasks = allTasks.concat(td.map(x => ({ ...x, _project: p })));
        } catch {
          // не валим всю страницу из-за одной ошибки
        }
      }

      $("#tCount", view).textContent = allTasks.length ? `${allTasks.length}` : "";

      $("#tasks", view).innerHTML = allTasks.length
        ? tasksBlockHtml(chunks)
        : `<div class="empty">${t("notFound")}</div>`;
    } else {
      $("#tasks", view).innerHTML = `<div class="empty">${t("notFound")}</div>`;
    }

    // Курсы: совпадение по телефонам клиента с course_leads.phone1/phone2
    const leads = await loadMatchedCourseLeads(client);
    $("#cCount", view).textContent = leads.length ? `${leads.length}` : "";

    $("#courses", view).innerHTML = leads.length
      ? `<div class="list">${leads.map(courseRowHtml).join("")}</div>`
      : `<div class="empty">${t("notFound")}</div>`;

  } catch (e) {
    toast(t("error"), e?.message || String(e), "err");
    view.innerHTML = `<div class="card"><div class="bd">${t("error")}: ${esc(e?.message || String(e))}</div></div>`;
  }
}

/* ================= Helpers ================= */

function getClientId(params) {
  if (params?.id) return Number(params.id);
  // fallback: #/clients/123
  const h = location.hash || "";
  const m = h.match(/#\/clients\/(\d+)/);
  return m ? Number(m[1]) : 0;
}

async function preloadDictForClientView() {
  state.dict = state.dict || {};
  const needCities = !Array.isArray(state.dict.cities);
  const needSources = !Array.isArray(state.dict.sources);
  if (!needCities && !needSources) return;

  const [cities, sources] = await Promise.all([
    apiFetch("/dict/cities", { silent: true }).catch(() => ({ items: [] })),
    apiFetch("/dict/sources", { silent: true }).catch(() => ({ items: [] })),
  ]);
  state.dict.cities = cities.items || [];
  state.dict.sources = sources.items || [];
}

function getCityName(c) {
  return c.city_name || (state.dict.cities || []).find(x => Number(x.id) === Number(c.city_id))?.name || "";
}
function getSourceName(c) {
  return c.source_name || (state.dict.sources || []).find(x => Number(x.id) === Number(c.source_id))?.name || "";
}

function infoGridHtml(c) {
  const fields = [
    ["clientCode", c.code],
    ["companyName", c.company_name],
    ["fullName", c.full_name],
    ["phone1", c.phone1],
    ["phone2", c.phone2],
    ["city", getCityName(c)],
    ["source", getSourceName(c)],
    ["sphere", c.sphere],
    ["comment", c.comment],
    ["createdAt", formatTs(c.created_at)],
    ["updatedAt", formatTs(c.updated_at)],
  ];

  return fields.map(([k, v]) => `
    <div class="kv">
      <div class="k">${t(k) || k}</div>
      <div class="v ${!v ? "muted" : ""}">${esc(v || "—")}</div>
    </div>
  `).join("");
}

function projectRowHtml(p) {
  const st = String(p.status || "").toLowerCase();
  const badgeClass =
    st === "done" ? "b-ok" :
    st === "active" ? "b-warn" :
    st === "cancel" ? "b-danger" : "b-off";

  const title = `${p.code ? p.code + " • " : ""}${p.title || ""}`.trim();

  return `
    <div class="row">
      <div class="sp">
        <b>${esc(title || "—")}</b>
        <div class="meta">
          ${(p.pm_name ? esc(p.pm_name) : "")}
          ${p.budget != null && p.budget !== "" ? ` • ${esc(p.budget)}` : ""}
        </div>
      </div>
      <div class="right">
        <span class="badge ${badgeClass}">${esc(st || "—")}</span>
        <a class="btn link" href="#/projects/${p.id}">${t("open") || "Open"}</a>
      </div>
    </div>
  `;
}

function tasksBlockHtml(chunks) {
  // показываем: по каждому проекту 3-5 последних задач
  return `<div class="list">${
    chunks.map(({ project, tasks }) => {
      const last = (tasks || []).slice().sort((a,b) => (b.updated_at||0) - (a.updated_at||0)).slice(0, 5);
      return `
        <div class="row">
          <div class="sp">
            <b>${esc((project.code ? project.code + " • " : "") + (project.title || ""))}</b>
            <div class="meta">${t("tasks")}: ${tasks?.length || 0}</div>
            <div class="meta" style="margin-top:8px">
              ${last.length ? last.map(taskMiniHtml).join("<br/>") : `<span class="muted">${t("notFound")}</span>`}
            </div>
          </div>
          <div class="right">
            <a class="btn link" href="#/tasks?deal_id=${project.id}">${t("open") || "Open"}</a>
          </div>
        </div>
      `;
    }).join("")
  }</div>`;
}

function taskMiniHtml(tk) {
  const st = String(tk.status || "").toLowerCase();
  return `• <b>${esc(tk.code || "")}</b> ${esc(tk.title || "")} <span class="muted">(${esc(st)})</span>`;
}

async function loadMatchedCourseLeads(client) {
  const p1 = normalizePhone(client.phone1);
  const p2 = normalizePhone(client.phone2);

  if (!p1 && !p2) return [];

  const queries = [];
  if (p1) queries.push(apiFetch(`/courses?q=${encodeURIComponent(client.phone1)}&status=all`).catch(() => null));
  if (p2 && p2 !== p1) queries.push(apiFetch(`/courses?q=${encodeURIComponent(client.phone2)}&status=all`).catch(() => null));

  const results = await Promise.all(queries);
  const raw = [];
  for (const r of results) {
    const arr = (r?.leads || r?.items || []);
    raw.push(...arr);
  }

  // фильтрация точнее по цифрам телефонов
  const uniq = new Map();
  for (const l of raw) {
    const lp1 = normalizePhone(l.phone1);
    const lp2 = normalizePhone(l.phone2);
    const ok = (p1 && (lp1 === p1 || lp2 === p1)) || (p2 && (lp1 === p2 || lp2 === p2));
    if (!ok) continue;
    uniq.set(l.id, l);
  }
  return Array.from(uniq.values()).sort((a,b) => (b.created_at||0) - (a.created_at||0));
}

function courseRowHtml(l) {
  const st = String(l.status || "new").toLowerCase();
  // покупка условно: paid/study/done
  const badgeClass =
    st === "done" ? "b-ok" :
    st === "study" ? "b-warn" :
    st === "paid" ? "b-ok" :
    st === "lost" ? "b-danger" : "b-off";

  const title = `${l.code ? l.code + " • " : ""}${l.full_name || ""}`.trim();

  return `
    <div class="row">
      <div class="sp">
        <b>${esc(title || "—")}</b>
        <div class="meta">
          ${esc(l.phone1 || "")}${l.phone2 ? ` • ${esc(l.phone2)}` : ""}
          ${l.company ? ` • ${esc(l.company)}` : ""}
        </div>
        <div class="meta">${formatTs(l.created_at)}</div>
      </div>
      <div class="right">
        <span class="badge ${badgeClass}">${esc(st)}</span>
        <a class="btn link" href="#/courses/${l.id}">${t("open") || "Open"}</a>
      </div>
    </div>
  `;
}

function normalizePhone(v) {
  const s = String(v || "");
  const d = s.replace(/\D+/g, "");
  return d || "";
}

function formatTs(ts){
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "";
  const d = new Date(n * 1000);
  return new Intl.DateTimeFormat(undefined, { year:"numeric", month:"2-digit", day:"2-digit" }).format(d);
}
function esc(v){ return String(v ?? "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m])); }
