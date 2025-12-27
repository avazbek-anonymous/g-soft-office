const tplCache = new Map();

export async function loadTpl(path) {
  if (tplCache.has(path)) return tplCache.get(path);

  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Template not found: ${path}`);

  const html = await res.text();
  tplCache.set(path, html);
  return html;
}
