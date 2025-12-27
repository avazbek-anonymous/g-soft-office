import { router } from "./router.js";

const API_BASE = "https://api.ofis.gekto.uz";

function safeJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function toast(message, type = "danger", title = "") {
  const host = document.getElementById("toastHost");
  if (!host) return;

  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `
    <div class="t1">${title || type}</div>
    <div class="t2">${message}</div>
  `;
  host.appendChild(el);

  // auto-remove
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    el.style.transition = "opacity 200ms ease, transform 200ms ease";
  }, 2600);

  setTimeout(() => el.remove(), 3100);
}

async function request(method, path, body) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);

  // Session expired / invalid
  if (res.status === 401) {
    // Source of truth — backend, but UI guard here
    router.go("#/login");
    throw new Error("Unauthorized");
  }

  const text = await res.text();
  const data = text ? (safeJson(text) ?? text) : null;

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.error || data.message)) ||
      (typeof data === "string" && data) ||
      `HTTP ${res.status}`;

    // show toast for non-401
    toast(msg, "danger", "error");
    throw new Error(msg);
  }

  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  del: (path) => request("DELETE", path),

  toast,
  API_BASE,
};
