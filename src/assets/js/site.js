(function () {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("#site-nav");

  function preferredTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function currentTheme() {
    return root.getAttribute("data-theme") || preferredTheme();
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (!toggle) return;
    const next = theme === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    toggle.setAttribute("aria-label", "Switch to " + next + " mode");
    const label = toggle.querySelector("[data-theme-label]");
    if (label) label.textContent = next === "dark" ? "Dark mode" : "Light mode";
  }

  applyTheme(currentTheme());

  if (toggle) {
    toggle.addEventListener("click", function () {
      const next = currentTheme() === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        /* Storage can be blocked. The choice still applies for this view. */
      }
      applyTheme(next);
    });
  }

  root.classList.add("js");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", open ? "false" : "true");
      nav.classList.toggle("is-open", !open);
    });
  }
})();
