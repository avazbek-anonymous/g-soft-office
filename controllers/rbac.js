export function hasPerm(key) {
  const perms = window.APP?.perms || [];
  if (!key) return true;

  // wildcard admin
  if (perms.includes("*")) return true;

  return perms.includes(key);
}

export function hasAny(keys = []) {
  return keys.some((k) => hasPerm(k));
}
