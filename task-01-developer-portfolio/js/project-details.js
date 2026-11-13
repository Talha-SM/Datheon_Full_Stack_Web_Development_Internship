
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const params = new URLSearchParams(location.search);
  const key = params.get("project");
  const project = Object.hasOwn(PROJECTS, key)
    ? PROJECTS[key]
    : null;

  if (!project) {
    document.querySelector("main").innerHTML = `
      <section class="section container">
        <h1>Project not found</h1>
        <a class="btn btn-primary" href="index.html#projects">
          Back to Projects
        </a>
      </section>`;
    return;
  }

  document.title = `${project.title} | Talha Malick`;

  $("case-category").textContent = project.category;
  $("case-title").textContent = project.title;
  $("case-description").textContent = project.description;
  $("case-overview-text").textContent = project.overview;


    /* ===== PROJECT COVER IMAGE ===== */

    const coverImage = document.getElementById("case-cover-image");

    if (coverImage) {
    coverImage.src = project.cover;
    coverImage.alt = `${project.title} dashboard preview`;
    }


  // Populate technology tags
  project.technologies.forEach(tech => {
    const li = document.createElement("li");
    li.textContent = tech;
    $("case-tech").append(li);
  });

  // Populate feature list
  project.features.forEach(feature => {
    const li = document.createElement("li");
    li.textContent = feature;
    $("case-features").append(li);
  });

  const images = project.images;
  const stageImage = $("stage-image");
  const stageTitle = $("stage-title");
  const stageCounter = $("stage-counter");
  const gallery = $("case-gallery");

  const dialog = $("gallery-lightbox");
  const lightboxImage = $("lightbox-image");
  const lightboxCaption = $("lightbox-caption");
  const lightboxCounter = $("lightbox-counter");

  const reduceMotion = matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let current = 0;
  let transitionToken = 0;
  let previousFocus = null;
  const thumbnails = [];

  function updateLightbox() {
    const item = images[current];

    lightboxImage.src = item.src;
    lightboxImage.alt = item.label;
    lightboxCaption.textContent = item.label;
    lightboxCounter.textContent =
      `${current + 1} / ${images.length}`;
  }

  function updateSelection() {
    thumbnails.forEach((button, index) => {
      const selected = index === current;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function selectImage(index) {
    current = (index + images.length) % images.length;
    const item = images[current];
    const token = ++transitionToken;

    stageTitle.textContent = item.label;
    stageCounter.textContent =
      `${String(current + 1).padStart(2, "0")} / ` +
      String(images.length).padStart(2, "0");

    updateSelection();

    const nextImage = new Image();
    nextImage.src = item.src;

    const display = () => {
      if (token !== transitionToken) return;

      stageImage.src = item.src;
      stageImage.alt = item.label;
      stageImage.classList.remove("is-changing");
    };

    if (reduceMotion.matches) {
      display();
    } else {
      stageImage.classList.add("is-changing");


        if (nextImage.complete && nextImage.naturalWidth > 0) {
        display();
        } else {
        nextImage.onload = display;

        nextImage.onerror = () => {
            if (token !== transitionToken) return;

            stageImage.classList.remove("is-changing");
            console.error("Failed to load project image:", item.src);
        };
        }

    }

    if (dialog.open) updateLightbox();
  }

  function moveImage(direction) {
    selectImage(current + direction);
  }

  // Create the thumbnail navigation
  images.forEach((image, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "showcase-thumb";
    button.setAttribute("aria-label", `Show ${image.label}`);

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = "";
    img.loading = "lazy";

    const name = document.createElement("span");
    name.textContent = image.label;

    button.append(img, name);
    button.addEventListener("click", () => selectImage(index));

    gallery.append(button);
    thumbnails.push(button);
  });

  $("stage-prev").addEventListener(
    "click", () => moveImage(-1)
  );

  $("stage-next").addEventListener(
    "click", () => moveImage(1)
  );

  $("stage-expand").addEventListener("click", () => {
    previousFocus = document.activeElement;
    updateLightbox();
    dialog.showModal();
    $("lightbox-close").focus();
  });

  $("lightbox-prev").addEventListener(
    "click", () => moveImage(-1)
  );

  $("lightbox-next").addEventListener(
    "click", () => moveImage(1)
  );

  $("lightbox-close").addEventListener(
    "click", () => dialog.close()
  );

  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveImage(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveImage(-1);
    }
  });

  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    previousFocus?.focus();
  });

  // Related project navigation
  Object.entries(PROJECTS)
    .filter(([id]) => id !== key)
    .forEach(([id, item]) => {
      const link = document.createElement("a");
      link.className = "related-project-link";
      link.href = `project-details.html?project=${encodeURIComponent(id)}`;

      const label = document.createElement("strong");
      label.textContent = item.title;

      const arrow = document.createElement("span");
      arrow.textContent = "↗";
      arrow.setAttribute("aria-hidden", "true");

      link.append(label, arrow);
      $("case-related").append(link);
    });

  selectImage(0);
});
