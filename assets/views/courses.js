import { state } from "../core/state.js";
import { apiFetch } from "../core/api.js";
import { t } from "../core/i18n.js";
import * as TOAST from "../ui/toast.js";

const $ = (sel, el = document) => el.querySelector(sel);

const tr = (key, fallback) => {
  const v = t(key);
  if (!v || v === key) return fallback;
  return v;
};

const notify = (msg, type = "info") => {
  try {
    if (TOAST.toast) return TOAST.toast(msg, type);
    if (TOAST.showToast) return TOAST.showToast(msg, type);
    if (TOAST.default) return TOAST.default(msg, type);
  } catch {}
  // fallback
  console[type === "error" ? "error" : "log"](msg);
};

const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const fmtDate = (ts) => {
  if (!ts) return "—";
  // поддержим и секунды, и миллисекунды
  const n = Number(ts);
  const d = new Date(n > 2e12 ? n : n * 1000);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
};

const iconEdit = () =>
  `<img class="ico inv" src="/assets/icons/edit.svg" alt="edit">`;
const iconTrash = () =>
  `<img class="ico inv" src="/assets/icons/delete.svg" alt="delete">`;

const LEAD_STATUS = [
  { v: "new", label: () => tr("new", "New") },
  { v: "contacted", label: () => tr("contacted", "Contacted") },
  { v: "paid", label: () => tr("paid", "Paid") },
  { v: "studying", label: () => tr("studying", "Studying") },
  { v: "finished", label: () => tr("finished", "Finished") },
  { v: "canceled", label: () => tr("canceled", "Canceled") },
  { v: "lost", label: () => tr("lost", "Lost") },
];

const ENR_STATUS = [
  { v: "planned", label: () => tr("planned", "Planned") },
  { v: "paid", label: () => tr("paid", "Paid") },
  { v: "studying", label: () => tr("studying", "Studying") },
  { v: "finished", label: () => tr("finished", "Finished") },
  { v: "canceled", label: () => tr("canceled", "Canceled") },
];

function selectOptions(items, { valueKey = "id", labelKey = "name", empty = true } = {}) {
  const arr = Array.isArray(items) ? items : [];
  return [
    empty ? `<option value="">—</option>` : "",
    ...arr.map((x) => `<option value="${esc(x[valueKey])}">${esc(x[labelKey])}</option>`),
  ].join("");
}

async function ensureDict() {
  if (!state.dict) state.dict = {};
  const needCities = !Array.isArray(state.dict.cities);
  const needSources = !Array.isArray(state.dict.sources);

  const tasks = [];
  if (needCities) tasks.push(apiFetch("/dict/cities", { silent: true }).catch(() => ({ items: [] })));
  else tasks.push(Promise.resolve({ items: state.dict.cities }));

  if (needSources) tasks.push(apiFetch("/dict/sources", { silent: true }).catch(() => ({ items: [] })));
  else tasks.push(Promise.resolve({ items: state.dict.sources }));

  const [cities, sources] = await Promise.all(tasks);
  state.dict.cities = cities.items || state.dict.cities || [];
  state.dict.sources = sources.items || state.dict.sources || [];
}

function openModal(html, { onClose } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "modal";
  wrap.innerHTML = `
    <div class="modal-backdrop" data-act="close"></div>
    <div class="modal-card">
      ${html}
    </div>
  `;
  document.body.appendChild(wrap);

  const close = () => {
    wrap.remove();
    onClose?.();
  };

  wrap.addEventListener("click", (e) => {
    const act = e.target?.dataset?.act;
    if (act === "close") close();
  });

  // esc close
  const onKey = (e) => {
    if (e.key === "Escape") {
      document.removeEventListener("keydown", onKey);
      close();
    }
  };
  document.addEventListener("keydown", onKey);

  return { el: wrap, close };
}

async function apiFirst(paths, opts) {
  let lastErr;
  for (const p of paths) {
    try {
      return await apiFetch(p, opts);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// --------- API wrappers (с fallback’ами) ----------
const apiLeadsList = (params) => apiFirst(
  [
    `/courses/leads?${params}`,
    `/courses?${params}`, // fallback если у тебя так сделано
  ],
  { silent: true }
);

const apiLeadGet = (id) => apiFirst(
  [
    `/courses/leads/${id}`,
    `/courses/${id}`,
  ],
  { silent: true }
);

const apiLeadCreate = (body) => apiFirst(
  [
    `/courses/leads`,
    `/courses`,
  ],
  { method: "POST", body, loadingTitle: tr("courses", "Courses"), loadingText: tr("saving", "Saving...") }
);

const apiLeadUpdate = (id, body) => apiFirst(
  [
    `/courses/leads/${id}`,
    `/courses/${id}`,
  ],
  { method: "PATCH", body, loadingTitle: tr("courses", "Courses"), loadingText: tr("saving", "Saving...") }
);

const apiLeadDelete = (id) => apiFirst(
  [
    `/courses/leads/${id}/delete`,
    `/courses/${id}/delete`,
  ],
  { method: "POST", body: {}, loadingTitle: tr("courses", "Courses"), loadingText: tr("deleting", "Deleting...") }
);

const apiCatalogList = () => apiFirst(
  [
    `/courses/catalog`,
    `/courses/courses`,
  ],
  { silent: true }
);

const apiCatalogCreate = (body) => apiFirst(
  [
    `/courses/catalog`,
    `/courses/courses`,
  ],
  { method: "POST", body, loadingTitle: tr("courses", "Courses"), loadingText: tr("saving", "Saving...") }
);

const apiCatalogUpdate = (id, body) => apiFirst(
  [
    `/courses/catalog/${id}`,
    `/courses/courses/${id}`,
  ],
  { method: "PATCH", body, loadingTitle: tr("courses", "Courses"), loadingText: tr("saving", "Saving...") }
);

const apiCatalogDelete = (id) => apiFirst(
  [
    `/courses/catalog/${id}/delete`,
    `/courses/courses/${id}/delete`,
  ],
  { method: "POST", body: {}, loadingTitle: tr("courses", "Courses"), loadingText: tr("deleting", "Deleting...") }
);

const apiEnrollmentsList = (leadId) => apiFirst(
  [
    `/courses/leads/${leadId}/enrollments`,
    `/courses/${leadId}/enrollments`,
  ],
  { silent: true }
);

const apiEnrollmentCreate = (leadId, body) => apiFirst(
  [
    `/courses/leads/${leadId}/enrollments`,
    `/courses/${leadId}/enrollments`,
  ],
  { method: "POST", body, loadingTitle: tr("courses", "Courses"), loadingText: tr("saving", "Saving...") }
);

const apiEnrollmentUpdate = (enrId, body) => apiFirst(
  [
    `/courses/enrollments/${enrId}`,
  ],
  { method: "PATCH", body, loadingTitle: tr("courses", "Courses"), loadingText: tr("saving", "Saving...") }
);

const apiEnrollmentDelete = (enrId) => apiFirst(
  [
    `/courses/enrollments/${enrId}/delete`,
  ],
  { method: "POST", body: {}, loadingTitle: tr("courses", "Courses"), loadingText: tr("deleting", "Deleting...") }
);

const apiClientsSearch = (q) =>
  apiFetch(`/clients?q=${encodeURIComponent(q)}`, { silent: true }).catch(() => ({ items: [] }));

const apiClientCreate = (body) =>
  apiFetch(`/clients`, { method: "POST", body, loadingTitle: tr("clients", "Clients"), loadingText: tr("saving", "Saving...") });

export async function renderCourses(view) {
  await ensureDict();

  const ctx = {
    tab: "leads", // leads | catalog
    q: "",
    status: "all",
    city_id: "",
    source_id: "",
    include_deleted: false,

    loading: true,
    leads: [],
    catalog: [],
  };

  view.innerHTML = skeleton(ctx);

  // single delegated listeners
  view.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === "tab") {
      ctx.tab = btn.dataset.tab;
      ctx.loading = true;
      view.innerHTML = skeleton(ctx);
      await loadTab(ctx, view);
      return;
    }

    if (act === "reload") {
      ctx.loading = true;
      view.innerHTML = skeleton(ctx);
      await loadTab(ctx, view);
      return;
    }

    if (act === "newLead") return openLeadForm({ ctx, view });
    if (act === "editLead") return openLeadForm({ ctx, view, id: Number(btn.dataset.id) });
    if (act === "viewLead") return openLeadView({ ctx, view, id: Number(btn.dataset.id) });
    if (act === "delLead") return deleteLead({ ctx, view, id: Number(btn.dataset.id) });

    if (act === "newCourse") return openCourseForm({ ctx, view });
    if (act === "editCourse") return openCourseForm({ ctx, view, id: Number(btn.dataset.id) });
    if (act === "delCourse") return deleteCourse({ ctx, view, id: Number(btn.dataset.id) });
  });

  view.addEventListener("input", (e) => {
    const el = e.target;
    if (el?.dataset?.bind === "q") ctx.q = el.value;
  });

  view.addEventListener("change", async (e) => {
    const el = e.target;
    if (!el?.dataset?.bind) return;

    const k = el.dataset.bind;
    if (k === "status") ctx.status = el.value;
    if (k === "city_id") ctx.city_id = el.value;
    if (k === "source_id") ctx.source_id = el.value;
    if (k === "include_deleted") ctx.include_deleted = el.checked;

    // авто-перезагрузка только в leads табе
    if (ctx.tab === "leads") {
      ctx.loading = true;
      view.innerHTML = skeleton(ctx);
      await loadTab(ctx, view);
    }
  });

  // first load
  await loadTab(ctx, view);
}

function skeleton(ctx) {
  return `
    <div class="card">
      <div class="hd">
        <b>${tr("courses", "Courses")}</b>
        <span class="muted">${ctx.tab === "leads" ? tr("leads", "Leads") : tr("catalog", "Catalog")}</span>

        <div class="spacer"></div>

        <div class="tabs">
          <button class="tab ${ctx.tab === "leads" ? "active" : ""}" data-act="tab" data-tab="leads">${tr("leads", "Leads")}</button>
          <button class="tab ${ctx.tab === "catalog" ? "active" : ""}" data-act="tab" data-tab="catalog">${tr("catalog", "Catalog")}</button>
        </div>

        <div class="spacer"></div>

        ${
          ctx.tab === "leads"
            ? `<button class="btn primary" data-act="newLead">+ ${tr("addLead", "Add lead")}</button>`
            : `<button class="btn primary" data-act="newCourse">+ ${tr("addCourse", "Add course")}</button>`
        }
        <button class="btn" data-act="reload">⟳ ${tr("reload", "Reload")}</button>
      </div>

      <div class="bd">
        ${ctx.tab === "leads" ? leadsBlock(ctx) : catalogBlock(ctx)}
      </div>
    </div>
  `;
}

function leadsBlock(ctx) {
  const cities = state.dict?.cities || [];
  const sources = state.dict?.sources || [];

  return `
    <div class="toolbar">
      <div class="filters">
        <div class="field">
          <div class="lbl">${tr("search", "Search")}</div>
          <input class="in" data-bind="q" value="${esc(ctx.q)}" placeholder="${esc(tr("searchPlaceholder", "Name / phone / company..."))}">
        </div>

        <div class="field">
          <div class="lbl">${tr("status", "Status")}</div>
          <select class="in" data-bind="status">
            <option value="all">${tr("all", "All")}</option>
            ${LEAD_STATUS.map((x) => `<option value="${x.v}" ${ctx.status === x.v ? "selected" : ""}>${esc(x.label())}</option>`).join("")}
          </select>
        </div>

        <div class="field">
          <div class="lbl">${tr("city", "City")}</div>
          <select class="in" data-bind="city_id">
            ${selectOptions(cities, { empty: true })}
          </select>
        </div>

        <div class="field">
          <div class="lbl">${tr("source", "Source")}</div>
          <select class="in" data-bind="source_id">
            ${selectOptions(sources, { empty: true })}
          </select>
        </div>

        <label class="chk" style="align-self:end;display:flex;gap:10px;align-items:center;">
          <input type="checkbox" data-bind="include_deleted" ${ctx.include_deleted ? "checked" : ""}>
          <span class="muted">${tr("showDeleted", "Show deleted")}</span>
        </label>
      </div>
    </div>

    ${
      ctx.loading
        ? `<div class="muted">${tr("loading", "Loading...")}</div>`
        : `
          <div class="table-wrap" style="max-height: calc(100vh - 320px); overflow:auto;">
            <table class="table">
              <thead>
                <tr>
                  <th>${tr("code", "Code")}</th>
                  <th>${tr("fullName", "Full name")}</th>
                  <th>${tr("phone", "Phone")}</th>
                  <th>${tr("company", "Company")}</th>
                  <th>${tr("city", "City")}</th>
                  <th>${tr("source", "Source")}</th>
                  <th>${tr("status", "Status")}</th>
                  <th>${tr("created", "Created")}</th>
                  <th style="width:120px">${tr("actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                ${
                  (ctx.leads || []).length
                    ? ctx.leads.map(renderLeadRow).join("")
                    : `<tr><td colspan="9" class="muted">${tr("empty", "No data")}</td></tr>`
                }
              </tbody>
            </table>
          </div>
        `
    }
  `;
}

function renderLeadRow(x) {
  const phone = [x.phone1, x.phone2].filter(Boolean).join(" / ") || "—";
  const st = x.status || "new";
  const badge = `<span class="badge">${esc(st)}</span>`;
  const del = Number(x.is_deleted || 0) === 1;

  return `
    <tr class="${del ? "row-deleted" : ""}">
      <td class="muted">${esc(x.code || "")}</td>
      <td>
        <button class="link" data-act="viewLead" data-id="${esc(x.id)}">${esc(x.full_name || "")}</button>
      </td>
      <td>${esc(phone)}</td>
      <td>${esc(x.company || "")}</td>
      <td class="muted">${esc(x.city_name || "")}</td>
      <td class="muted">${esc(x.source_name || "")}</td>
      <td>${badge}</td>
      <td class="muted">${fmtDate(x.created_at)}</td>
      <td>
        <div class="row-actions">
          <button class="btn icon" data-act="editLead" data-id="${esc(x.id)}" title="${esc(tr("edit", "Edit"))}">${iconEdit()}</button>
          <button class="btn icon danger" data-act="delLead" data-id="${esc(x.id)}" title="${esc(tr("delete", "Delete"))}">${iconTrash()}</button>
        </div>
      </td>
    </tr>
  `;
}

function catalogBlock(ctx) {
  return `
    ${
      ctx.loading
        ? `<div class="muted">${tr("loading", "Loading...")}</div>`
        : `
          <div class="table-wrap" style="max-height: calc(100vh - 260px); overflow:auto;">
            <table class="table">
              <thead>
                <tr>
                  <th>${tr("name", "Name")}</th>
                  <th style="width:140px">${tr("price", "Price")}</th>
                  <th style="width:120px">${tr("active", "Active")}</th>
                  <th style="width:120px">${tr("actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                ${
                  (ctx.catalog || []).length
                    ? ctx.catalog.map((c) => `
                      <tr>
                        <td><b>${esc(c.name || "")}</b><div class="muted">${esc(c.code || "")}</div></td>
                        <td>${esc(c.price ?? 0)} ${esc(c.currency || "")}</td>
                        <td>${Number(c.active || 0) ? `<span class="pill ok">${tr("active", "Active")}</span>` : `<span class="pill">${tr("inactive", "Inactive")}</span>`}</td>
                        <td>
                          <div class="row-actions">
                            <button class="btn icon" data-act="editCourse" data-id="${esc(c.id)}" title="${esc(tr("edit", "Edit"))}">${iconEdit()}</button>
                            <button class="btn icon danger" data-act="delCourse" data-id="${esc(c.id)}" title="${esc(tr("delete", "Delete"))}">${iconTrash()}</button>
                          </div>
                        </td>
                      </tr>
                    `).join("")
                    : `<tr><td colspan="4" class="muted">${tr("empty", "No data")}</td></tr>`
                }
              </tbody>
            </table>
          </div>
        `
    }
  `;
}

async function loadTab(ctx, view) {
  try {
    if (ctx.tab === "leads") {
      const sp = new URLSearchParams();
      if (ctx.q) sp.set("q", ctx.q);
      if (ctx.status && ctx.status !== "all") sp.set("status", ctx.status);
      if (ctx.city_id) sp.set("city_id", ctx.city_id);
      if (ctx.source_id) sp.set("source_id", ctx.source_id);
      if (ctx.include_deleted) sp.set("include_deleted", "1");

      const res = await apiLeadsList(sp.toString());
      ctx.leads = res.items || res.leads || [];
      ctx.loading = false;
      view.innerHTML = skeleton(ctx);

      // выставим выбранные фильтры обратно (селекты)
      const citySel = $('[data-bind="city_id"]', view);
      if (citySel) citySel.value = ctx.city_id || "";
      const srcSel = $('[data-bind="source_id"]', view);
      if (srcSel) srcSel.value = ctx.source_id || "";

      return;
    }

    if (ctx.tab === "catalog") {
      const res = await apiCatalogList();
      ctx.catalog = res.items || res.courses || res.catalog || [];
      ctx.loading = false;
      view.innerHTML = skeleton(ctx);
      return;
    }
  } catch (e) {
    ctx.loading = false;
    view.innerHTML = skeleton(ctx);
    notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
  }
}

// ----------------- Lead forms & view -----------------
async function openLeadForm({ ctx, view, id = null }) {
  await ensureDict();

  let lead = null;
  if (id) {
    try {
      const r = await apiLeadGet(id);
      lead = r.item || r.lead || r.client || r;
    } catch (e) {
      return notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
    }
  }

  const cities = state.dict?.cities || [];
  const sources = state.dict?.sources || [];

  const html = `
    <div class="modal-hd">
      <b>${id ? tr("editLead", "Edit lead") : tr("newLead", "New lead")}</b>
      <button class="btn icon" data-act="close" title="Close">✕</button>
    </div>
    <div class="modal-bd">
      <div class="form-grid">
        <div class="field">
          <div class="lbl">${tr("fullName", "Full name")}</div>
          <input class="in" id="lf_full_name" value="${esc(lead?.full_name || "")}">
        </div>
        <div class="field">
          <div class="lbl">${tr("company", "Company")}</div>
          <input class="in" id="lf_company" value="${esc(lead?.company || "")}">
        </div>

        <div class="field">
          <div class="lbl">${tr("phone1", "Phone 1")}</div>
          <input class="in" id="lf_phone1" value="${esc(lead?.phone1 || "")}" placeholder="+998...">
        </div>
        <div class="field">
          <div class="lbl">${tr("phone2", "Phone 2")}</div>
          <input class="in" id="lf_phone2" value="${esc(lead?.phone2 || "")}" placeholder="+998...">
        </div>

        <div class="field">
          <div class="lbl">${tr("city", "City")}</div>
          <select class="in" id="lf_city_id">
            ${selectOptions(cities)}
          </select>
        </div>
        <div class="field">
          <div class="lbl">${tr("source", "Source")}</div>
          <select class="in" id="lf_source_id">
            ${selectOptions(sources)}
          </select>
        </div>

        <div class="field">
          <div class="lbl">${tr("status", "Status")}</div>
          <select class="in" id="lf_status">
            ${LEAD_STATUS.map((x) => `<option value="${x.v}">${esc(x.label())}</option>`).join("")}
          </select>
        </div>

        <div class="field" style="grid-column:1/-1;">
          <div class="lbl">${tr("comment", "Comment")}</div>
          <textarea class="in" id="lf_comment" rows="4" placeholder="${esc(tr("comment", "Comment"))}">${esc(lead?.comment || "")}</textarea>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row" style="display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn" data-act="close">${tr("cancel", "Cancel")}</button>
        <button class="btn primary" id="lf_save">${tr("save", "Save")}</button>
      </div>
    </div>
  `;

  const m = openModal(html);

  // set initial select values
  $("#lf_city_id", m.el).value = String(lead?.city_id ?? "");
  $("#lf_source_id", m.el).value = String(lead?.source_id ?? "");
  $("#lf_status", m.el).value = String(lead?.status ?? "new");

  $("#lf_save", m.el).addEventListener("click", async () => {
    const body = {
      full_name: $("#lf_full_name", m.el).value.trim(),
      company: $("#lf_company", m.el).value.trim(),
      phone1: $("#lf_phone1", m.el).value.trim(),
      phone2: $("#lf_phone2", m.el).value.trim(),
      city_id: $("#lf_city_id", m.el).value || null,
      source_id: $("#lf_source_id", m.el).value || null,
      status: $("#lf_status", m.el).value || "new",
      comment: $("#lf_comment", m.el).value.trim(),
    };

    if (!body.full_name) return notify(tr("fullNameRequired", "Full name is required"), "error");

    try {
      if (!id) await apiLeadCreate(body);
      else await apiLeadUpdate(id, body);

      notify(tr("saved", "Saved"), "success");
      m.close();
      ctx.loading = true;
      view.innerHTML = skeleton(ctx);
      await loadTab(ctx, view);
    } catch (e) {
      notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
    }
  });
}

async function openLeadView({ ctx, view, id }) {
  try {
    const r = await apiLeadGet(id);
    const lead = r.item || r.lead || r;

    // enrollments + catalog in parallel
    const [enrsRes, catRes] = await Promise.all([
      apiEnrollmentsList(id).catch(() => ({ items: [] })),
      apiCatalogList().catch(() => ({ items: [] })),
    ]);

    const enrollments = enrsRes.items || enrsRes.enrollments || [];
    const catalog = catRes.items || catRes.courses || catRes.catalog || [];

    const phoneText = [lead.phone1, lead.phone2].filter(Boolean).join(" / ") || "—";
    const city = lead.city_name || (state.dict.cities || []).find((c) => String(c.id) === String(lead.city_id))?.name || "";
    const source = lead.source_name || (state.dict.sources || []).find((s) => String(s.id) === String(lead.source_id))?.name || "";

    const html = `
      <div class="modal-hd">
        <div>
          <b>${esc(lead.full_name || "")}</b>
          <div class="muted">${esc(lead.code || "")} • ${esc(lead.company || "")}</div>
        </div>
        <button class="btn icon" data-act="close" title="Close">✕</button>
      </div>

      <div class="modal-bd">
        <div class="card soft">
          <div class="bd">
            <div class="grid-2">
              <div><div class="muted">${tr("phone", "Phone")}</div><div>${esc(phoneText)}</div></div>
              <div><div class="muted">${tr("status", "Status")}</div><div><span class="badge">${esc(lead.status || "new")}</span></div></div>
              <div><div class="muted">${tr("city", "City")}</div><div>${esc(city || "—")}</div></div>
              <div><div class="muted">${tr("source", "Source")}</div><div>${esc(source || "—")}</div></div>
              <div style="grid-column:1/-1;"><div class="muted">${tr("comment", "Comment")}</div><div>${esc(lead.comment || "—")}</div></div>
            </div>
            <div class="row" style="display:flex; gap:10px; justify-content:flex-end; margin-top:12px;">
              <button class="btn" id="lv_open_client">${tr("openClient", "Open client")}</button>
              <button class="btn" id="lv_create_client">+ ${tr("createClient", "Create client")}</button>
              <button class="btn primary" id="lv_edit">${tr("edit", "Edit")}</button>
            </div>
          </div>
        </div>

        <div class="card soft" style="margin-top:12px;">
          <div class="hd"><b>${tr("enrollments", "Enrollments")}</b><span class="muted">${enrollments.length}</span></div>
          <div class="bd">
            ${renderEnrollments(enrollments)}
            <div class="hr"></div>

            <div class="form-grid">
              <div class="field">
                <div class="lbl">${tr("course", "Course")}</div>
                <select class="in" id="en_course_id">
                  <option value="">—</option>
                  ${catalog.map((c) => `<option value="${esc(c.id)}">${esc(c.name)} (${esc(c.price ?? 0)} ${esc(c.currency || "")})</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <div class="lbl">${tr("status", "Status")}</div>
                <select class="in" id="en_status">
                  ${ENR_STATUS.map((x) => `<option value="${x.v}">${esc(x.label())}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <div class="lbl">${tr("price", "Price")}</div>
                <input class="in" id="en_price" type="number" step="0.01" placeholder="0">
              </div>
              <div class="field">
                <div class="lbl">${tr("paidAmount", "Paid")}</div>
                <input class="in" id="en_paid" type="number" step="0.01" placeholder="0">
              </div>
              <div class="field" style="grid-column:1/-1;">
                <div class="lbl">${tr("note", "Note")}</div>
                <input class="in" id="en_note" placeholder="${esc(tr("note", "Note"))}">
              </div>
            </div>

            <div class="row" style="display:flex; justify-content:flex-end; margin-top:10px;">
              <button class="btn primary" id="en_add">+ ${tr("add", "Add")}</button>
            </div>
          </div>
        </div>

        <div class="card soft" style="margin-top:12px;">
          <div class="hd"><b>${tr("linkWithClients", "Link with clients")}</b></div>
          <div class="bd">
            <div class="muted">${tr("clientSearchHint", "Search client by phone / company and open card")}</div>
            <div class="row" style="display:flex; gap:10px; margin-top:10px;">
              <input class="in" id="cl_q" placeholder="${esc(tr("searchPlaceholder", "Name / phone / company..."))}">
              <button class="btn" id="cl_find">${tr("search", "Search")}</button>
            </div>
            <div id="cl_res" style="margin-top:10px;"></div>
          </div>
        </div>
      </div>
    `;

    const m = openModal(html);

    // actions
    $("#lv_edit", m.el).addEventListener("click", async () => {
      m.close();
      await openLeadForm({ ctx, view, id });
    });

    $("#lv_open_client", m.el).addEventListener("click", async () => {
      // пробуем найти по phone1/phone2
      const q = (lead.phone1 || lead.phone2 || lead.company || lead.full_name || "").trim();
      if (!q) return notify(tr("noData", "No data"), "error");
      const res = await apiClientsSearch(q);
      const items = res.items || [];
      if (!items.length) return notify(tr("notFound", "Not found"), "error");
      location.hash = `#/clients/${items[0].id}`;
      m.close();
    });

    $("#lv_create_client", m.el).addEventListener("click", async () => {
      try {
        const body = {
          company_name: lead.company || lead.full_name || "",
          full_name: lead.full_name || "",
          phone1: lead.phone1 || "",
          phone2: lead.phone2 || "",
          city_id: lead.city_id || null,
          source_id: lead.source_id || null,
          sphere: null,
          comment: lead.comment || "",
        };
        const r2 = await apiClientCreate(body);
        const c = r2.client || r2.item || r2;
        if (c?.id) {
          notify(tr("created", "Created"), "success");
          location.hash = `#/clients/${c.id}`;
          m.close();
        } else {
          notify(tr("created", "Created"), "success");
        }
      } catch (e) {
        notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
      }
    });

    // enrollment add
    $("#en_add", m.el).addEventListener("click", async () => {
      const body = {
        course_id: $("#en_course_id", m.el).value || null,
        status: $("#en_status", m.el).value || "planned",
        price_total: Number($("#en_price", m.el).value || 0),
        paid_amount: Number($("#en_paid", m.el).value || 0),
        note: $("#en_note", m.el).value.trim(),
      };
      if (!body.course_id) return notify(tr("courseRequired", "Select course"), "error");

      try {
        await apiEnrollmentCreate(id, body);
        notify(tr("saved", "Saved"), "success");
        // refresh modal by reopening
        m.close();
        await openLeadView({ ctx, view, id });
      } catch (e) {
        notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
      }
    });

    // enrollments edit/delete delegation inside modal
    m.el.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-en-act]");
      if (!b) return;
      const enAct = b.dataset.enAct;
      const enId = Number(b.dataset.enId);
      if (!enId) return;

      if (enAct === "edit") {
        const cur = enrollments.find((x) => Number(x.id) === enId);
        if (!cur) return;

        const fm = openModal(`
          <div class="modal-hd">
            <b>${tr("editEnrollment", "Edit enrollment")}</b>
            <button class="btn icon" data-act="close">✕</button>
          </div>
          <div class="modal-bd">
            <div class="form-grid">
              <div class="field">
                <div class="lbl">${tr("status", "Status")}</div>
                <select class="in" id="e_status">
                  ${ENR_STATUS.map((x) => `<option value="${x.v}">${esc(x.label())}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <div class="lbl">${tr("price", "Price")}</div>
                <input class="in" id="e_price" type="number" step="0.01">
              </div>
              <div class="field">
                <div class="lbl">${tr("paidAmount", "Paid")}</div>
                <input class="in" id="e_paid" type="number" step="0.01">
              </div>
              <div class="field" style="grid-column:1/-1;">
                <div class="lbl">${tr("note", "Note")}</div>
                <input class="in" id="e_note">
              </div>
            </div>
            <div class="row" style="display:flex; gap:10px; justify-content:flex-end; margin-top:12px;">
              <button class="btn" data-act="close">${tr("cancel", "Cancel")}</button>
              <button class="btn primary" id="e_save">${tr("save", "Save")}</button>
            </div>
          </div>
        `);

        $("#e_status", fm.el).value = String(cur.status || "planned");
        $("#e_price", fm.el).value = String(cur.price_total ?? 0);
        $("#e_paid", fm.el).value = String(cur.paid_amount ?? 0);
        $("#e_note", fm.el).value = String(cur.note || "");

        $("#e_save", fm.el).addEventListener("click", async () => {
          const body = {
            status: $("#e_status", fm.el).value,
            price_total: Number($("#e_price", fm.el).value || 0),
            paid_amount: Number($("#e_paid", fm.el).value || 0),
            note: $("#e_note", fm.el).value.trim(),
          };
          try {
            await apiEnrollmentUpdate(enId, body);
            notify(tr("saved", "Saved"), "success");
            fm.close();
            m.close();
            await openLeadView({ ctx, view, id });
          } catch (e) {
            notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
          }
        });

        return;
      }

      if (enAct === "delete") {
        if (!confirm(tr("confirmDelete", "Delete?"))) return;
        try {
          await apiEnrollmentDelete(enId);
          notify(tr("deleted", "Deleted"), "success");
          m.close();
          await openLeadView({ ctx, view, id });
        } catch (e) {
          notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
        }
      }
    });

    // client search in modal
    $("#cl_find", m.el).addEventListener("click", async () => {
      const q = $("#cl_q", m.el).value.trim();
      if (!q) return;

      const res = await apiClientsSearch(q);
      const items = res.items || [];
      const box = $("#cl_res", m.el);

      if (!items.length) {
        box.innerHTML = `<div class="muted">${tr("notFound", "Not found")}</div>`;
        return;
      }

      box.innerHTML = `
        <div class="list">
          ${items.slice(0, 10).map((c) => `
            <div class="list-item">
              <div>
                <b>${esc(c.company_name || "")}</b>
                <div class="muted">${esc(c.full_name || "")} • ${esc(c.phone1 || "")}</div>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn" data-open-client="${esc(c.id)}">${tr("open", "Open")}</button>
              </div>
            </div>
          `).join("")}
        </div>
      `;

      box.querySelectorAll("[data-open-client]").forEach((b) => {
        b.addEventListener("click", () => {
          location.hash = `#/clients/${b.dataset.openClient}`;
          m.close();
        });
      });
    });

  } catch (e) {
    notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
  }
}

function renderEnrollments(items) {
  const arr = Array.isArray(items) ? items : [];
  if (!arr.length) return `<div class="muted">${tr("empty", "No data")}</div>`;

  return `
    <div class="table-wrap" style="max-height: 240px; overflow:auto;">
      <table class="table">
        <thead>
          <tr>
            <th>${tr("course", "Course")}</th>
            <th style="width:120px">${tr("status", "Status")}</th>
            <th style="width:120px">${tr("price", "Price")}</th>
            <th style="width:120px">${tr("paidAmount", "Paid")}</th>
            <th>${tr("note", "Note")}</th>
            <th style="width:110px">${tr("actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          ${arr.map((x) => `
            <tr>
              <td><b>${esc(x.course_name || x.course_title || x.course || "")}</b></td>
              <td><span class="badge">${esc(x.status || "")}</span></td>
              <td>${esc(x.price_total ?? 0)}</td>
              <td>${esc(x.paid_amount ?? 0)}</td>
              <td class="muted">${esc(x.note || "")}</td>
              <td>
                <div class="row-actions">
                  <button class="btn icon" data-en-act="edit" data-en-id="${esc(x.id)}" title="${esc(tr("edit", "Edit"))}">${iconEdit()}</button>
                  <button class="btn icon danger" data-en-act="delete" data-en-id="${esc(x.id)}" title="${esc(tr("delete", "Delete"))}">${iconTrash()}</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function deleteLead({ ctx, view, id }) {
  if (!confirm(tr("confirmDelete", "Delete?"))) return;
  try {
    await apiLeadDelete(id);
    notify(tr("deleted", "Deleted"), "success");
    ctx.loading = true;
    view.innerHTML = skeleton(ctx);
    await loadTab(ctx, view);
  } catch (e) {
    notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
  }
}

// ----------------- Catalog forms -----------------
async function openCourseForm({ ctx, view, id = null }) {
  let course = null;

  if (id) {
    // простая выборка из кеша (у нас уже загружен catalog)
    course = (ctx.catalog || []).find((x) => Number(x.id) === Number(id)) || null;
  }

  const html = `
    <div class="modal-hd">
      <b>${id ? tr("editCourse", "Edit course") : tr("newCourse", "New course")}</b>
      <button class="btn icon" data-act="close">✕</button>
    </div>
    <div class="modal-bd">
      <div class="form-grid">
        <div class="field">
          <div class="lbl">${tr("name", "Name")}</div>
          <input class="in" id="cf_name" value="${esc(course?.name || "")}">
        </div>
        <div class="field">
          <div class="lbl">${tr("price", "Price")}</div>
          <input class="in" id="cf_price" type="number" step="0.01" value="${esc(course?.price ?? 0)}">
        </div>
        <div class="field">
          <div class="lbl">${tr("currency", "Currency")}</div>
          <input class="in" id="cf_currency" value="${esc(course?.currency || "USD")}">
        </div>
        <div class="field" style="align-self:end;">
          <label class="chk" style="display:flex; gap:10px; align-items:center;">
            <input type="checkbox" id="cf_active" ${Number(course?.active ?? 1) ? "checked" : ""}>
            <span>${tr("active", "Active")}</span>
          </label>
        </div>
        <div class="field" style="grid-column:1/-1;">
          <div class="lbl">${tr("comment", "Comment")}</div>
          <input class="in" id="cf_comment" value="${esc(course?.comment || "")}">
        </div>
      </div>

      <div class="row" style="display:flex; gap:10px; justify-content:flex-end; margin-top:12px;">
        <button class="btn" data-act="close">${tr("cancel", "Cancel")}</button>
        <button class="btn primary" id="cf_save">${tr("save", "Save")}</button>
      </div>
    </div>
  `;

  const m = openModal(html);

  $("#cf_save", m.el).addEventListener("click", async () => {
    const body = {
      name: $("#cf_name", m.el).value.trim(),
      price: Number($("#cf_price", m.el).value || 0),
      currency: $("#cf_currency", m.el).value.trim() || "USD",
      active: $("#cf_active", m.el).checked ? 1 : 0,
      comment: $("#cf_comment", m.el).value.trim(),
    };
    if (!body.name) return notify(tr("nameRequired", "Name is required"), "error");

    try {
      if (!id) await apiCatalogCreate(body);
      else await apiCatalogUpdate(id, body);

      notify(tr("saved", "Saved"), "success");
      m.close();
      ctx.loading = true;
      view.innerHTML = skeleton(ctx);
      await loadTab(ctx, view);
    } catch (e) {
      notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
    }
  });
}

async function deleteCourse({ ctx, view, id }) {
  if (!confirm(tr("confirmDelete", "Delete?"))) return;
  try {
    await apiCatalogDelete(id);
    notify(tr("deleted", "Deleted"), "success");
    ctx.loading = true;
    view.innerHTML = skeleton(ctx);
    await loadTab(ctx, view);
  } catch (e) {
    notify(`${tr("error", "Error")}: ${e?.message || e}`, "error");
  }
}
