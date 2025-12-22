const $ = (sel, el=document) => el.querySelector(sel);

export function toast(msg, desc="", type="ok") {
  const host = $("#toasts");
  if (!host) return;

  const el = document.createElement("div");
  el.className = "toast" + (type === "err" ? " err" : "");
  el.innerHTML = `
    <div class="tag"></div>
    <div class="t">
      <b>${escapeHtml(msg)}</b>
      ${desc ? `<span>${escapeHtml(desc)}</span>` : ``}
    </div>
    <button class="x" aria-label="close">✕</button>
  `;

  el.querySelector(".x").onclick = () => el.remove();
  host.appendChild(el);

  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => { el.classList.remove("show"); setTimeout(()=>el.remove(), 200); }, 4000);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
}
