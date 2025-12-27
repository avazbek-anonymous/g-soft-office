export const state = {
  user: null,
  ui: {
    lang: "ru",
    theme: "dark",
    light: { primary: "#16a34a", bg: "#ffffff" },
    dark:  { primary: "#22c55e", bg: "#070b12" },
    font: "Inter",
  },
  dict: { cities: [], sources: [], services: [] },
  cacheReady: false,
};

export function setUser(user) {
  state.user = user;
}
