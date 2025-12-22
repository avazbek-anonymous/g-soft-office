const $ = (sel, el=document) => el.querySelector(sel);

export function openDrawer() {
  const drawer = $("#drawer");
  const back = $("#drawerBackdrop");
  if (!drawer || !back) return;

  back.classList.add("open");
  drawer.style.display = "block";
  drawer.classList.add("open");
}

export function closeDrawer() {
  const drawer = $("#drawer");
  const back = $("#drawerBackdrop");
  if (!drawer || !back) return;

  drawer.classList.remove("open");
  back.classList.remove("open");
}

export function initDrawer() {
  const back = $("#drawerBackdrop");
  const closeBtn = $("#drawerClose");
  back && (back.onclick = closeDrawer);
  closeBtn && (closeBtn.onclick = closeDrawer);

  // avoid flash
  const drawer = $("#drawer");
  if (drawer) drawer.style.display = "none";

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeDrawer();
  });
}
