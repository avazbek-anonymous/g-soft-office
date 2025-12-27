import { i18n } from "./i18n.js";
import { api } from "./api.js";
import { router } from "./router.js";
import { appShell } from "./appShell.js";

// Global app state (small, explicit)
window.APP = window.APP || {
  user: null,
  lang: null,
  outlet: null,
};

function renderBoot() {
  const root = document.getElementById("app");
  root.innerHTML = `
    <div class="authWrap">
      <div class="authPanel card">
        <div class="row" style="justify-content:space-between">
          <div class="row" style="gap:10px">
            <div class="brandMark">G</div>
            <div class="col" style="gap:2px">
              <div class="brandName caps">G-SOFT</div>
              <div class="brandSub">boot…</div>
            </div>
          </div>
          <div class="muted caps" style="font-size:12px;letter-spacing:.10em">JARVIS UI</div>
        </div>
      </div>
    </div>
  `;
}

async function initAuth() {
  try {
    const me = await api.get("/me");
    window.APP.user = me;

    // Sync language: if user.lang exists and local not set — take user.lang.
    i18n.syncFromUser(me);

    // Ensure shell exists for protected routes
    return { ok: true };
  } catch (e) {
    // api.get already redirects on 401 (guard), but we normalize:
    window.APP.user = null;
    return { ok: false };
  }
}

function registerRoutes() {
  router.register([
    {
      path: "/login",
      requiresAuth: false,
      shell: false,
      titleKey: "auth.login.title",
      controllerPath: () => import("./auth/login.js"),
    },
    {
      path: "/main",
      requiresAuth: true,
      shell: true,
      titleKey: "nav.main",
      controllerPath: () => import("./main/index.js"),
    },

    // Stage 1 placeholders (visible by RBAC in sidebar)
    ...router.placeholders([
      { path: "/tasks", titleKey: "nav.tasks" },
      { path: "/projects", titleKey: "nav.projects" },
      { path: "/courses", titleKey: "nav.courses" },
      { path: "/course_catalog", titleKey: "nav.course_catalog" },
      { path: "/clients", titleKey: "nav.clients" },
      { path: "/settings", titleKey: "nav.settings" },
      { path: "/users", titleKey: "nav.users" },
      { path: "/roles", titleKey: "nav.roles" },
    ]),
  ]);
}

async function boot() {
  renderBoot();

  // i18n first (localStorage)
  i18n.init();

  registerRoutes();

  // On language change → rerender current route + shell labels
  i18n.onChange(() => {
    appShell.refreshText();
    router.refresh();
  });

  // Guard check /me once on start
  await initAuth();

  // Start router (it will decide whether shell is needed)
  router.start({
    defaultRoute: "#/main",
    onNeedShell: () => appShell.ensure(),
  });
}

boot();
