"use strict";

const $ = (id) => document.getElementById(id);
const key = "taskflow_tasks_v1";
const categories = ["Work", "Personal", "Study"];
const editor = $("editor");
const confirm = $("confirm");
const form = $("form");
const titleInput = form.elements.namedItem("title");
let tasks = [];
let filter = "all";
let view = "Dashboard";
let dragId;
const overviewView = "Productivity overview";
const dateLabel = (date) => new Date(date + "T00:00:00").toLocaleDateString(undefined, {
  weekday: "short", month: "short", day: "numeric", year: "numeric"
});
const viewCopy = {
  Dashboard: ["Make room for good work.", "A focused view of your priorities and progress."],
  "All Tasks": ["All tasks", "Search, organize and manage your workspace."],
  Today: ["Today", "Nothing scheduled for today."],
  Upcoming: ["Upcoming deadlines", "No upcoming deadlines."],
  Completed: ["Completed history", "No completed tasks yet."],
  [overviewView]: ["Productivity overview", "A snapshot of the tasks in your workspace."]
};
const priorities = ["Low", "Medium", "High"];
let editing = null;
let editorTrigger;
let deleting = null;
let storageIssue = false;

try {
  const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
  if (!Array.isArray(saved) || !saved.every((task) =>
    task && typeof task.id === "string" && typeof task.title === "string" &&
    typeof task.notes === "string" && typeof task.due === "string" &&
    categories.includes(task.category) && typeof task.completed === "boolean" && priorities.includes(task.priority) && Number.isFinite(task.createdAt) && Number.isFinite(task.updatedAt)
  )) throw new Error("Invalid task data");
  tasks = saved;
} catch {
  storageIssue = true;
  $("notice").textContent = "Saved tasks could not be read. Changes will stay in this tab.";
}

function localDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
}

function save(message) {
  try {
    if (storageIssue) throw new Error("Stored data could not be read");
    localStorage.setItem(key, JSON.stringify(tasks));
    $("notice").textContent = message;
  } catch {
    $("notice").textContent = message + " Browser storage is unavailable. Changes may be lost on reload.";
  }
  showToast();
  render();
}

function render() {
  const now = new Date();
  const today = localDate(now);
  $("greeting").textContent = "Good " + (now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening") + ", welcome to TaskFlow.";
  $("late").textContent = tasks.filter(t => !t.completed && t.due && t.due < today).length;
  $("today").textContent = now.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric"
  });
  const completed = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  $("total").textContent = tasks.length;
  $("active").textContent = tasks.length - completed;
  $("done").textContent = completed;
  $("progress").value = progress;
  $("progress").style.setProperty("--completion", progress + "%");
  $("summary").textContent = tasks.length ? completed + " of " + tasks.length + " tasks completed." : "Create a task to start tracking your progress.";
  $("percent").textContent = progress + "%";

  const scheduled = tasks.filter(task => task.due === today);
  const todayDone = scheduled.filter(task => task.completed).length;
  const daily = todayDone + " completed · " + (scheduled.length - todayDone) + " remaining today";
  $("daily-summary").textContent = daily;
  $("greeting").textContent = view === "Today" ? dateLabel(today) + " · " + daily
    : view === "Completed" ? completed + " completed tasks"
    : viewCopy[view]?.[1] ?? tasks.filter(task => task.category === view).length + " tasks in " + view;
  const future = tasks.filter(task => !task.completed && task.due > today)
    .sort((a, b) => a.due.localeCompare(b.due));
  if (view === "Dashboard") {
    fillPreview("priority-preview", tasks.filter(task => !task.completed && task.priority === "High")
      .slice(0, 3).map(task => [task.title, task.category]), "No high-priority tasks.");
    fillPreview("deadline-preview", future.slice(0, 3).map(task => [task.title, dateLabel(task.due)]),
      "No future deadlines.");
  }
  if (view === overviewView) fillPreview("category-stats",
    categories.map(category => [category, tasks.filter(task => task.category === category).length]));
  if (view === "Dashboard" || view === overviewView) return;

  const query = $("search").value.trim().toLowerCase();
  const category = $("category-filter").value;
  const sort = view === "Upcoming" ? "due" : $("sort").value;
  const visible = tasks.filter((task) =>
    (view !== "Today" || task.due === today) &&
    (view !== "Upcoming" || (!task.completed && task.due > today)) &&
    (view !== "Completed" || task.completed) &&
    (!categories.includes(view) || task.category === view) &&
    (filter === "all" || task.completed === (filter === "completed")) &&
    (!category || task.category === category) &&
    (task.title + " " + task.notes).toLowerCase().includes(query)
  );
  const compare = {
    new: (a, b) => b.createdAt - a.createdAt,
    old: (a, b) => a.createdAt - b.createdAt,
    due: (a, b) => (a.due || "9999").localeCompare(b.due || "9999"),
    alpha: (a, b) => a.title.localeCompare(b.title),
    priority: (a, b) => priorities.indexOf(b.priority) - priorities.indexOf(a.priority)
  };
  if (sort !== "manual") visible.sort(compare[sort]);
  $("count").textContent = visible.length + " of " + tasks.length + " shown";
  $("empty-state").hidden = visible.length > 0;
  $("empty-title").textContent = query ? "No matching tasks" : view === "Today" ? "Nothing scheduled"
    : view === "Upcoming" ? "No upcoming deadlines" : view === "Completed" ? "No completed tasks yet"
    : categories.includes(view) ? "No tasks in " + view : tasks.length ? "No tasks match these filters" : "Your workspace is ready";
  $("empty-add").hidden = !!query || ["Completed", "Upcoming"].includes(view) || filter === "completed";
  $("empty").textContent = query ? "Try a different title or description."
    : view === "Completed" ? "Tasks you finish will appear here."
    : view === "Upcoming" ? "Open tasks with a future due date will appear here."
    : "Create a task or adjust the current filters.";

  const rows = visible.map((task, index) => {
    const row = $("row").content.firstElementChild.cloneNode(true);
    row.dataset.id = task.id;
    row.style.setProperty("--delay", Math.min(index, 7) * 22 + "ms");
    row.querySelector(".priority").textContent = task.priority + " priority";
    row.querySelector(".priority").dataset.level = task.priority;
    row.draggable = sort === "manual";
    for (const [selector, offset] of [[".move-up", -1], [".move-down", 1]]) {
      const button = row.querySelector(selector);
      button.hidden = sort !== "manual";
      button.disabled = !visible[index + offset];
      button.addEventListener("click", () => {
        reorder(task.id, visible[index + offset].id);
        focusRow(task.id, selector + ":enabled");
      });
    }
    row.addEventListener("dragstart", event => {
      dragId = task.id;
      event.dataTransfer.setData("text/plain", task.id);
      event.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", () => { dragId = undefined; });
    row.addEventListener("dragover", event => {
      if (sort === "manual" && dragId) event.preventDefault();
    });
    row.addEventListener("drop", event => {
      if (!dragId || sort !== "manual") return;
      event.preventDefault();
      reorder(dragId, task.id);
      dragId = undefined;
    });
    row.classList.toggle("completed", task.completed);
    row.querySelector("h3").textContent = task.title;
    const notes = row.querySelector(".notes");
    notes.textContent = task.notes;
    notes.hidden = !task.notes;
    row.querySelector(".tag").textContent = task.category;
    const due = row.querySelector(".due");
    due.textContent = "No due date";
    if (task.due) {
      const overdue = !task.completed && task.due < today;
      const date = new Date(task.due + "T00:00:00");
      due.textContent = (overdue ? "Overdue · " : task.due === today ? "Due today · " : task.due > today ? "Upcoming · " : "Due · ") + date.toLocaleDateString();
      due.classList.toggle("overdue", overdue);
    }
    const checkbox = row.querySelector(".check");
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Complete " + task.title);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      task.updatedAt = Date.now();
      save(task.completed ? "Task completed." : "Task reopened.");
      focusRow(task.id, ".check");
    });
    const edit = row.querySelector(".edit");
    const remove = row.querySelector(".remove");
    edit.setAttribute("aria-label", "Edit " + task.title);
    remove.setAttribute("aria-label", "Delete " + task.title);
    edit.addEventListener("click", () => openEditor(task));
    remove.addEventListener("click", () => {
      deleting = task.id;
      confirm.returnValue = "";
      $("delete-name").textContent = task.title;
      confirm.showModal();
    });
    return row;
  });
  const items = [];
  let previousDate;
  for (const [index, row] of rows.entries()) {
    if (view === "Upcoming" && visible[index].due !== previousDate) {
      previousDate = visible[index].due;
      const group = document.createElement("li");
      group.className = "date-group";
      group.textContent = dateLabel(previousDate);
      items.push(group);
    }
    items.push(row);
  }
  $("list").replaceChildren(...items);
}

function fillPreview(id, values, empty) {
  $(id).replaceChildren(...(values.length ? values : [[empty, ""]]).map(([name, detail]) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const meta = document.createElement("small");
    label.textContent = name;
    meta.textContent = detail;
    item.append(label, meta);
    return item;
  }));
}

function focusRow(id, control) {
  const row = Array.from($("list").children).find((item) => item.dataset.id === id);
  (row?.querySelector(control) ?? ($("tasks").hidden ? $("add") : $("tasks"))).focus();
}

function openEditor(task) {
  editorTrigger = document.activeElement;
  editing = task?.id ?? null;
  form.reset();
  titleInput.setCustomValidity("");
  $("validation").textContent = "";
  titleInput.removeAttribute("aria-invalid");
  $("editor-title").textContent = task ? "Edit task" : "Create a new task";
  $("editor-subtitle").textContent = task ? "Refine the details of this task." : "Organize your next priority.";
  $("editor-save").textContent = task ? "Save changes" : "Create task";
  for (const name of ["title", "notes", "category", "due", "priority", "completed"]) {
    if (task) form.elements.namedItem(name).value = task[name];
  }
  if (!task && categories.includes(view)) form.elements.namedItem("category").value = view;
  if (!task && view === "Today") form.elements.namedItem("due").value = localDate(new Date());
  editor.showModal();
}

$("empty-add").addEventListener("click", () => openEditor());
$("add").addEventListener("click", () => openEditor());
$("editor-close").addEventListener("click", () => closeDialog(editor));
editor.addEventListener("close", () => {
  if (editorTrigger?.isConnected) editorTrigger.focus();
});
$("cancel").addEventListener("click", () => closeDialog(editor));
titleInput.addEventListener("input", () => { titleInput.setCustomValidity(""); titleInput.removeAttribute("aria-invalid"); $("validation").textContent = ""; });
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (editor.classList.contains("closing")) return;
  const data = new FormData(form);
  const title = data.get("title").trim();
  if (!title) {
    titleInput.setCustomValidity("Enter a task title.");
    $("validation").textContent = "Enter a task title.";
    titleInput.setAttribute("aria-invalid", "true");
    titleInput.focus();
    return;
  }

  const dueInput = form.elements.namedItem("due");
  if (!dueInput.validity.valid) {
    dueInput.reportValidity();
    return;
  }
  const existing = tasks.find((task) => task.id === editing);
  const task = existing ?? {
    id: globalThis.crypto?.randomUUID?.() ?? Date.now() + "-" + Math.random(),
    createdAt: Date.now()
  };
  Object.assign(task, {
    updatedAt: Date.now(), priority: data.get("priority"), completed: data.get("completed") === "true",
    title, notes: data.get("notes").trim(), category: data.get("category"), due: data.get("due")
  });
  if (!existing) tasks.unshift(task);
  closeDialog(editor);
  save(existing ? "Task updated." : "Task added.");
  editor.addEventListener("close", () => focusRow(task.id, existing ? ".edit" : ".check"), { once: true });
});

confirm.addEventListener("close", () => {
  if (confirm.returnValue !== "delete") return;
  const row = [...$("list").children].find(item => item.dataset.id === deleting);
  const id = deleting;
  const finish = () => {
    tasks = tasks.filter(task => task.id !== id);
    save("Task deleted.");
    $("tasks").focus();
  };
  if (!row || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return;
  }
  row.inert = true;
  row.animate([{ opacity: 1 }, { opacity: 0, transform: "translateX(8px)" }], { duration: 150, fill: "forwards" }).finished.then(finish, finish);
});

const filters = [...document.querySelectorAll("[data-filter]")];
for (const button of filters) {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    for (const choice of filters) choice.setAttribute("aria-pressed", String(choice === button));
    render();
  });
}
$("search").addEventListener("input", () => {
  const query = $("search").value;
  if (query.trim() && ["Dashboard", overviewView].includes(view)) {
    navigate("All Tasks", false);
    $("search").value = query;
  }
  render();
});
$("category-filter").addEventListener("change", render);

const themeButton = $("theme");
function setTheme(dark) {
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeButton.setAttribute("aria-pressed", String(dark));

}
let savedTheme;
try { savedTheme = localStorage.getItem("taskflow.theme"); } catch { /* Use system preference. */ }
setTheme(savedTheme === "dark");
function toggleTheme() {
  const dark = document.documentElement.dataset.theme !== "dark";
  setTheme(dark);
  try { localStorage.setItem("taskflow.theme", dark ? "dark" : "light"); } catch { /* Theme still works. */ }
}

let pull;
let suppressClick = false;
let rebound;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
function releaseCord(distance, toggle) {
  themeButton.style.setProperty("--pull", "0px");
  if (!reducedMotion.matches) {
    rebound?.cancel();
    rebound = themeButton.animate([
      { "--pull": distance + "px", offset: 0 },
      { "--pull": "-3px", offset: .64 },
      { "--pull": "0px", offset: 1 }
    ], { duration: 420, easing: "cubic-bezier(.2,.8,.25,1)" });
  }
  if (toggle) toggleTheme();
}
themeButton.addEventListener("pointerdown", event => {
  if (!event.isPrimary || event.button !== 0) return;
  suppressClick = false;
  rebound?.cancel();
  pull = { id: event.pointerId, y: event.clientY, distance: 0, moved: false };
  themeButton.setPointerCapture(event.pointerId);
});
themeButton.addEventListener("pointermove", event => {
  if (pull?.id !== event.pointerId) return;
  const delta = event.clientY - pull.y;
  pull.distance = Math.max(0, Math.min(30, delta));
  pull.moved ||= Math.abs(delta) > 5;
  if (!reducedMotion.matches) themeButton.style.setProperty("--pull", pull.distance + "px");
});
function endPull(event, cancel = false) {
  if (pull?.id !== event.pointerId) return;
  const { distance, moved } = pull;
  pull = null;
  suppressClick = moved || cancel;
  if (suppressClick) releaseCord(distance, !cancel && distance >= 16); else themeButton.style.setProperty("--pull", "0px");
}
themeButton.addEventListener("pointerup", event => endPull(event));
themeButton.addEventListener("pointercancel", event => endPull(event, true));
themeButton.addEventListener("lostpointercapture", event => endPull(event, true));
themeButton.addEventListener("click", event => {
  if (event.detail && suppressClick) {
    suppressClick = false;
    return;
  }
  if (reducedMotion.matches) toggleTheme();
  else {
    releaseCord(12, true);
    rebound.effect.setKeyframes([
      { "--pull": "0px" }, { "--pull": "14px", offset: .29 },
      { "--pull": "-3px", offset: .74 }, { "--pull": "0px" }
    ]);
  }
});

function reorder(id, target) {
  if (id === target) return;
  const from = tasks.findIndex(task => task.id === id);
  const to = tasks.findIndex(task => task.id === target);
  if (from < 0 || to < 0) return;
  tasks.splice(to, 0, tasks.splice(from, 1)[0]);
  save("Task order saved.");
}

let toastTimer;
function showToast() {
  clearTimeout(toastTimer);
  $("notice").classList.remove("show");
  requestAnimationFrame(() => {
    $("notice").classList.add("show");
    toastTimer = setTimeout(() => $("notice").classList.remove("show"), 3200);
  });
}

function closeDialog(dialog, result = "") {
  if (dialog.classList.contains("closing")) return;
  dialog.classList.add("closing");
  setTimeout(() => {
    dialog.close(result);
    dialog.classList.remove("closing");
  }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 160);
}
for (const dialog of [editor, confirm]) {
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeDialog(dialog);
  });
}
confirm.querySelector("form").addEventListener("submit", event => {
  event.preventDefault();
  closeDialog(confirm, event.submitter.value);
});
$("sort").addEventListener("change", render);
let grid = false;
try { grid = localStorage.getItem("taskflow.layout") === "grid"; } catch { /* Default to list. */ }
function applyLayout() {
  $("list").classList.toggle("grid", grid && view !== "Upcoming");
  $("layout").setAttribute("aria-pressed", String(grid));
  $("layout-list").setAttribute("aria-pressed", String(!grid));
}
for (const [id, value] of [["layout", true], ["layout-list", false]]) {
  $(id).addEventListener("click", () => {
    grid = value;
    applyLayout();
    try { localStorage.setItem("taskflow.layout", grid ? "grid" : "list"); } catch { /* Keep the session choice. */ }
  });
}

const sidebar = $("sidebar");
const navToggle = $("nav-toggle");
const mobileNav = matchMedia("(max-width: 820px)");
const navButtons = [...sidebar.querySelectorAll("[data-view]")];
function setNavigation(open) {
  const drawer = mobileNav.matches && open;
  sidebar.inert = mobileNav.matches && !open;
  document.body.classList.toggle("nav-closed", !open);
  document.body.classList.toggle("drawer-open", drawer);
  $("nav-backdrop").hidden = !drawer;
  $("main").inert = drawer;
  document.querySelector(".bar-actions").inert = drawer;
  navToggle.setAttribute("aria-expanded", String(open));
  if (drawer) (sidebar.querySelector("[aria-current=page]") ?? navButtons[0]).focus();
}
function closeDrawer() {
  setNavigation(false);
  navToggle.focus();
}
setNavigation(!mobileNav.matches);
mobileNav.addEventListener("change", () => setNavigation(!mobileNav.matches));
navToggle.addEventListener("click", () => setNavigation(navToggle.getAttribute("aria-expanded") !== "true"));
$("nav-backdrop").addEventListener("click", closeDrawer);
document.addEventListener("keydown", event => {
  if (!document.body.classList.contains("drawer-open")) return;
  if (event.key === "Escape") closeDrawer();
  if (event.key === "Tab") {
    const first = navToggle;
    const last = navButtons.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
function navigate(selected, focus = true) {
  view = selected;
  filter = "all";
  $("search").value = "";
  $("category-filter").value = "";
  for (const choice of filters) choice.setAttribute("aria-pressed", String(choice.dataset.filter === "all"));
  for (const button of navButtons) {
    if (button.dataset.view === selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }
  const dashboard = view === "Dashboard";
  const insights = view === overviewView;
  const management = !dashboard && !insights;
  document.body.dataset.view = view;
  $("overview").hidden = !dashboard;
  $("tasks").hidden = !management;
  document.querySelector(".metrics").hidden = management;
  $("distribution").hidden = !insights;
  document.querySelector(".hero-art").hidden = !dashboard;
  document.querySelector(".hero-note").hidden = true;
  document.querySelector(".segments").hidden = view === "Completed";
  $("category-filter").hidden = categories.includes(view);
  document.querySelector(".tools").hidden = view === "Upcoming";
  $("title").textContent = viewCopy[view]?.[0] ?? view;
  $("breadcrumb").textContent = selected;
  applyLayout();
  render();
  if (focus) $("title").focus();
}
for (const button of navButtons) {
  button.removeAttribute("aria-pressed");
  button.setAttribute("aria-label", button.dataset.view);
  button.title = button.dataset.view;
  button.addEventListener("click", () => {
    if (mobileNav.matches) closeDrawer();
    if (button.dataset.view === "Settings") $("settings").showModal();
    else navigate(button.dataset.view);
  });
}
for (const button of document.querySelectorAll("[data-go]")) {
  button.addEventListener("click", () => navigate(button.dataset.go));
}
$("settings-theme").addEventListener("click", toggleTheme);
if (storageIssue) showToast();
navigate("Dashboard", false);
const header = document.querySelector(".top");
new ResizeObserver(() => {
  document.body.style.setProperty("--header-height", header.offsetHeight + "px");
}).observe(header);
