
"use strict";

/* =========================================
   PORTFOLIO THEME CONTROLLER
   Dark / Light Theme + Reveal Animation
========================================= */

(() => {
  const root = document.documentElement;
  const toggleButton = document.getElementById("theme-toggle");
  const themeIcon = toggleButton?.querySelector(".theme-icon");

  const STORAGE_KEY = "talha-portfolio-theme";

  const systemTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let isTransitioning = false;

  // Safely access browser storage.
  function readSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved === "dark" || saved === "light"
        ? saved
        : null;
    } catch {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme still works when storage is unavailable.
    }
  }

  function getPreferredTheme() {
    return readSavedTheme() ||
      (systemTheme.matches ? "dark" : "light");
  }

  // Apply colors and synchronize accessible controls.
  function applyTheme(theme) {
    root.dataset.theme = theme;

    if (!toggleButton) return;

    const isDark = theme === "dark";

    toggleButton.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme"
    );

    toggleButton.setAttribute(
      "aria-pressed",
      String(!isDark)
    );

    toggleButton.title = isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀" : "☾";
    }
  }

  // Set initial theme.
  applyTheme(getPreferredTheme());

  async function changeTheme() {
    if (isTransitioning) return;

    const currentTheme = root.dataset.theme || "dark";
    const nextTheme = currentTheme === "dark"
      ? "light"
      : "dark";

    const supportsViewTransitions =
      typeof document.startViewTransition === "function";

    if (!supportsViewTransitions || reducedMotion.matches) {
      applyTheme(nextTheme);
      saveTheme(nextTheme);
      return;
    }

    isTransitioning = true;

    // Center the animation on the theme button.
    const rect = toggleButton.getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Radius required to cover the entire viewport.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    try {
      const transition = document.startViewTransition(() => {
        applyTheme(nextTheme);
      });

      await transition.ready;

      const animation = root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 750,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)"
        }
      );

      await animation.finished;
    } catch (error) {
      // Fallback if the View Transition fails.
      applyTheme(nextTheme);
    } finally {
      saveTheme(nextTheme);
      isTransitioning = false;
    }
  }

  toggleButton?.addEventListener("click", changeTheme);

  // Follow system preference only if user has not
  // explicitly saved a preference.
  systemTheme.addEventListener("change", (event) => {
    if (!readSavedTheme() && !isTransitioning) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
})();
