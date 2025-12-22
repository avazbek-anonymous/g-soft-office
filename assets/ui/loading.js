const $ = (sel, el=document) => el.querySelector(sel);

let counter = 0;

export function showLoading(title, text) {
  counter++;
  const el = $("#loading");
  const t = $("#loadingTitle");
  const d = $("#loadingText");
  if (!el || !t || !d) return;

  if (title) t.textContent = title;
  if (text) d.textContent = text;

  el.classList.add("show");
  el.setAttribute("aria-hidden", "false");
}

export function hideLoading() {
  counter = Math.max(0, counter - 1);
  if (counter !== 0) return;

  const el = $("#loading");
  if (!el) return;
  el.classList.remove("show");
  el.setAttribute("aria-hidden", "true");
}

export function setLoadingText(title, text) {
  const t = $("#loadingTitle");
  const d = $("#loadingText");
  if (t && title) t.textContent = title;
  if (d && text) d.textContent = text;
}

export function resetLoading() {
  counter = 0;
  const el = $("#loading");
  if (!el) return;
  el.classList.remove("show");
  el.setAttribute("aria-hidden", "true");
}
