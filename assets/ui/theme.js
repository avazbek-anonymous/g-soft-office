import { state } from "../core/state.js";

export function applyTheme(theme) {
  document.body.dataset.theme = theme;

  const vars = theme === "light" ? state.ui.light : state.ui.dark;

  if (vars?.primary) document.documentElement.style.setProperty("--primary", vars.primary);
  if (theme === "light") document.documentElement.style.setProperty("--bg", vars?.bg || "#f5f7fb");
  if (theme === "dark") document.documentElement.style.setProperty("--bg", vars?.bg || "#070b12");

  if (state.ui.font) {
    document.documentElement.style.setProperty(
      "--font",
      state.ui.font + ", " + getComputedStyle(document.documentElement).getPropertyValue("--font")
    );
  }
}

export function toggleTheme() {
  state.ui.theme = (state.ui.theme === "dark") ? "light" : "dark";
  applyTheme(state.ui.theme);
  return state.ui.theme;
}
