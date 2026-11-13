
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


/* =========================================
   RESPONSIVE 3D PROJECT CARD INTERACTION
   Desktop: Hover
   Touch: Tap
   Keyboard: Focus / Escape
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".flip-card");

  const hoverDevice = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  cards.forEach((card) => {
    const front = card.querySelector(".flip-front-trigger");
    const back = card.querySelector(".flip-card-back");
    const caseStudyLink = card.querySelector(".case-study-btn");

    if (!front || !back) return;

    function setFlipped(flipped) {
      card.classList.toggle("is-flipped", flipped);

      front.setAttribute("aria-expanded", String(flipped));

      // Hide inactive face from keyboard navigation.
      front.inert = flipped;
      back.inert = !flipped;
    }

    // Desktop mouse hover
    card.addEventListener("pointerenter", (event) => {
      if (hoverDevice.matches && event.pointerType === "mouse") {
        setFlipped(true);
      }
    });

    card.addEventListener("pointerleave", (event) => {
      if (hoverDevice.matches && event.pointerType === "mouse") {
        if (!card.contains(document.activeElement)) {
          setFlipped(false);
        }
      }
    });

    // Touchscreen: first tap flips.
    front.addEventListener("click", () => {
      if (!hoverDevice.matches) {
        setFlipped(true);
      }
    });

    // Touchscreen: tap anywhere on back except the CTA.
    back.addEventListener("click", (event) => {
      if (
        !hoverDevice.matches &&
        !event.target.closest(".case-study-btn")
      ) {
        setFlipped(false);
      }
    });

    // Keyboard focus should reveal the back side.
    card.addEventListener("focusin", (event) => {
      if (
        hoverDevice.matches &&
        event.target === front &&
        !card.classList.contains("is-flipped")
      ) {
        setFlipped(true);
        caseStudyLink?.focus({ preventScroll: true });
      }
    });

    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget)) {
        if (!card.matches(":hover")) {
          setFlipped(false);
        }
      }
    });

    // Keyboard shortcut: Escape returns to front.
    card.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        card.classList.contains("is-flipped")
      ) {
        event.preventDefault();
        setFlipped(false);
        front.focus();
      }
    });

    // Do not allow link clicks to trigger card reversal.
    caseStudyLink?.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    setFlipped(false);
  });
});
