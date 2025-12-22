import { API_BASE } from "../config.js";
import { showLoading, hideLoading } from "../ui/loading.js";
import { toast } from "../ui/toast.js";
import { setUser } from "./state.js";
import { t } from "./i18n.js";

export async function apiFetch(path, opts = {}) {
  const options = {
    method: opts.method || "GET",
    credentials: "include",
    headers: opts.headers || {},
    body: opts.body,
  };

  // JSON by default if body is object
  if (opts.json !== false) {
    if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(opts.body);
    }
  }

  const title = opts.loadingTitle || t("loadingTitle");
  const text = opts.loadingText || t("loadingText");

  if (opts.loading !== false) showLoading(title, text);

  try {
    const res = await fetch(API_BASE + path, options);

    let data = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      const txt = await res.text().catch(() => "");
      data = txt ? { ok: res.ok, text: txt } : { ok: res.ok };
    }

    if (res.status === 401) {
      setUser(null);
      if (location.hash !== "#/login") location.hash = "#/login";
      return data;
    }

    if (!res.ok || data?.ok === false) {
      const errMsg = data?.error || ("HTTP " + res.status);
      throw new Error(errMsg);
    }

    return data;
  } catch (e) {
    if (!opts.silent) toast(t("error"), e.message || String(e), "err");
    throw e;
  } finally {
    if (opts.loading !== false) hideLoading();
  }
}
