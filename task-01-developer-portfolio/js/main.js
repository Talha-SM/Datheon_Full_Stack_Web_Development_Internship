
"use strict";

/* =========================================
   PORTFOLIO INTERACTIONS
   Mobile Menu + Scroll Reveal + Navigation
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menu-toggle");
  const navigation = document.getElementById("primary-nav");
  const navLinks = navigation?.querySelectorAll('a[href^="#"]');

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* ===== MOBILE MENU ===== */

  function setMenuState(isOpen) {
    if (!menuButton || !navigation) return;

    navigation.classList.toggle("is-open", isOpen);

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuButton.setAttribute(
      "aria-label",
      isOpen
        ? "Close navigation menu"
        : "Open navigation menu"
    );

    menuButton.classList.toggle("is-active", isOpen);
  }

  menuButton?.addEventListener("click", () => {
    const isOpen =
      menuButton.getAttribute("aria-expanded") === "true";

    setMenuState(!isOpen);
  });

  // Close menu after selecting a navigation link.
  navLinks?.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  // Close when clicking outside the navigation.
  document.addEventListener("pointerdown", (event) => {
    if (!navigation || !menuButton) return;

    const isOpen =
      menuButton.getAttribute("aria-expanded") === "true";

    if (
      isOpen &&
      !navigation.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      setMenuState(false);
    }
  });

  // Escape key support.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const isOpen =
      menuButton?.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      setMenuState(false);
      menuButton.focus();
    }
  });

  // Reset mobile menu when switching to desktop.
  const desktopBreakpoint = window.matchMedia(
    "(min-width: 851px)"
  );

  desktopBreakpoint.addEventListener("change", (event) => {
    if (event.matches) {
      setMenuState(false);
    }
  });

  /* ===== SCROLL REVEAL ===== */

  const revealElements = document.querySelectorAll(
    ".section-header, .about-grid, .skill-card, " +
    ".project-card, .internship-card, " +
    ".education-card, .contact-content"
  );

  if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
  ) {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealElements.forEach((element) => {
      element.classList.add("reveal-ready");
      observer.observe(element);
    });
  }

  /* ===== ACTIVE NAVIGATION ===== */

  const observedSections = document.querySelectorAll(
    "main section[id]"
  );

  if ("IntersectionObserver" in window && navigation) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const sectionId = entry.target.id;

          navLinks?.forEach((link) => {
            const isActive =
              link.getAttribute("href") === `#${sectionId}`;

            link.classList.toggle("active", isActive);

            if (isActive) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0
      }
    );

    observedSections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* ===== BACK TO TOP ===== */

  const backToTop = document.querySelector(".back-to-top");

  backToTop?.addEventListener("click", (event) => {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "instant" : "smooth"
    });
  });
});
