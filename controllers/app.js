import { i18n } from "./i18n.js";
import { api } from "./api.js";
import { router } from "./router.js";
import { appShell } from "./appShell.js";

window.APP = window.APP || { user: null, lang: null, outlet: null };

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
          <div class="muted caps" style="font-size:12px;letter-spacing:.10em">Moliya Agentligi</div>
        </div>
      </div>
    </div>
  `;
}



async function initAuth() {
  try {
    const me = await api.get("/me");

    // ✅ FIX: /me returns { ok, user, perms }
    const user = me?.user ?? me;
    const perms = me?.perms ?? me?.permissions ?? [];

    window.APP.user = user;
    window.APP.perms = perms;

    i18n.syncFromUser(user);
    return true;
  } catch {
    window.APP.user = null;
    window.APP.perms = [];
    return false;
  }
}



function moduleImportMap() {
  return {
    main: () => import("./main.js"),
    tasks: () => import("./tasks.js"),
    projects: () => import("./projects.js"),
    courses: () => import("./courses.js"),
    course_catalog: () => import("./course_catalog.js"),
    clients: () => import("./clients.js"),
    settings: () => import("./settings.js"),
    users: () => import("./users.js"),
    roles: () => import("./roles.js"),
  };
}

function addModuleRoutes(list, moduleName, navKey) {
  const imp = moduleImportMap()[moduleName];
  const base = `/${moduleName}`;

  list.push(
    { path: base, requiresAuth: true, shell: true, titleKey: navKey,
      handler: async () => (await imp()).pages.index },
    { path: `${base}/view`, requiresAuth: true, shell: true, titleKey: navKey,
      handler: async () => (await imp()).pages.view },
    { path: `${base}/new`, requiresAuth: true, shell: true, titleKey: navKey,
      handler: async () => (await imp()).pages.new },
    { path: `${base}/edit`, requiresAuth: true, shell: true, titleKey: navKey,
      handler: async () => (await imp()).pages.edit },
  );
}

function registerRoutes() {
  const routes = [
    {
      path: "/login",
      requiresAuth: false,
      shell: false,
      titleKey: "auth.login.title",
      handler: async () => (await import("./auth/login.js")).controller,
    },

    {
      path: "/main",
      requiresAuth: true,
      shell: true,
      titleKey: "nav.main",
      handler: async () => (await import("./main.js")).pages.index,
    },
  ];

  addModuleRoutes(routes, "tasks", "nav.tasks");
  addModuleRoutes(routes, "projects", "nav.projects");
  addModuleRoutes(routes, "courses", "nav.courses");
  addModuleRoutes(routes, "course_catalog", "nav.course_catalog");
  addModuleRoutes(routes, "clients", "nav.clients");
  addModuleRoutes(routes, "settings", "nav.settings");
  addModuleRoutes(routes, "users", "nav.users");
  addModuleRoutes(routes, "roles", "nav.roles");

  router.register(routes);
}

async function boot() {
  renderBoot();

  i18n.init();
  registerRoutes();

  i18n.onChange(() => {
    appShell.refreshText();
    router.refresh();
  });

  await initAuth();

  router.start({
    defaultRoute: "#/main",
    onNeedShell: () => appShell.ensure(),
  });
}

boot();
