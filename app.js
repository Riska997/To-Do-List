/* To-Do List Application - Web Adaptation
   Original Java Swing version: https://github.com/Riska997/Listjava/tree/main/todoListAPP
   This version uses browser localStorage (no login, database, or server needed).
*/
(() => {
  "use strict";

  const STORAGE_KEY = "riska997-todo-website-v1";
  const sampleTasks = [
    { id: "sample-1", text: "Review my Java programming project", completed: true },
    { id: "sample-2", text: "Test the new To-Do List website", completed: false },
    { id: "sample-3", text: "Update my software engineering portfolio", completed: false },
    { id: "sample-4", text: "Publish the website on GitHub Pages", completed: false },
    { id: "sample-5", text: "Share my projects with potential clients", completed: false }
  ];

  const get = (id) => document.getElementById(id);
  const copySamples = () => sampleTasks.map((task) => ({ ...task }));
  const safeTask = (task) => task && typeof task.id === "string" &&
    typeof task.text === "string" && typeof task.completed === "boolean" &&
    task.text.trim().length > 0 && task.text.length <= 160;

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return copySamples();
      const result = JSON.parse(raw);
      return Array.isArray(result) ? result.filter(safeTask) : copySamples();
    } catch {
      return copySamples();
    }
  }

  let tasks = loadTasks();
  let activeFilter = "all";
  let editingId = null;
  let toastTimer;
  let idCounter = 0;

  function generateId() {
    // Works offline, even if the secure-context crypto API is unavailable.
    idCounter += 1;
    return "task-" + Date.now().toString(36) + "-" + idCounter.toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      notify("Browser storage is unavailable. Your changes may not be saved after closing this page.");
    }
  }

  function notify(message) {
    const element = get("notification");
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 3000);
  }

  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function makeAction(label, taskId, action, className = "") {
    const button = element("button", "icon-button " + className, label);
    button.type = "button";
    button.dataset.action = action;
    button.dataset.id = taskId;
    button.setAttribute("aria-label", label + " task");
    return button;
  }

  function render() {
    const complete = tasks.filter((task) => task.completed).length;
    const remaining = tasks.length - complete;
    const rate = tasks.length ? Math.round(complete / tasks.length * 100) : 0;

    get("total-count").textContent = String(tasks.length);
    get("completed-count").textContent = String(complete);
    get("remaining-count").textContent = String(remaining);
    get("completion-rate").textContent = rate + "%";
    get("list-number").textContent = String(tasks.length);
    get("progress-number").textContent = rate + "%";
    get("progress-fill").style.width = rate + "%";
    get("progress-bar").setAttribute("aria-valuenow", String(rate));
    get("progress-message").textContent = tasks.length === 0
      ? "Add your first task to get started."
      : remaining === 0 ? "Amazing work — everything is completed!"
      : complete === 0 ? "You're ready to begin. Take the first step!"
      : complete + " completed, " + remaining + " left. Keep it going!";
    get("clear-all").disabled = tasks.length === 0;

    const search = get("task-search").value.trim().toLocaleLowerCase();
    const shown = tasks.filter((task) =>
      (activeFilter === "all" || (activeFilter === "completed" ? task.completed : !task.completed)) &&
      task.text.toLocaleLowerCase().includes(search)
    );
    const list = get("task-list");
    list.replaceChildren();

    shown.forEach((task) => {
      const item = element("li", "task-item" + (task.completed ? " completed" : ""));
      item.dataset.id = task.id;
      item.append(element("span", "task-number", String(tasks.indexOf(task) + 1).padStart(2, "0")));

      const check = element("input", "task-check");
      check.type = "checkbox";
      check.checked = task.completed;
      check.dataset.action = "toggle";
      check.dataset.id = task.id;
      check.setAttribute("aria-label", (task.completed ? "Mark incomplete: " : "Mark complete: ") + task.text);
      item.append(check);

      const content = element("div", "task-content");
      if (editingId === task.id) {
        const form = element("form", "inline-edit");
        form.dataset.editId = task.id;
        const input = element("input");
        input.type = "text";
        input.name = "editedTask";
        input.value = task.text;
        input.maxLength = 160;
        input.required = true;
        input.setAttribute("aria-label", "Edit task name");
        const save = element("button", "", "Save");
        save.type = "submit";
        const cancel = element("button", "cancel", "Cancel");
        cancel.type = "button";
        cancel.dataset.action = "cancel";
        cancel.dataset.id = task.id;
        form.append(input, save, cancel);
        content.append(form);
      } else {
        content.append(element("div", "task-title", task.text));
        content.append(element("small", "task-caption", task.completed ? "✓ Completed" : "○ To do"));
      }
      item.append(content);
      if (editingId !== task.id) {
        const actions = element("div", "task-actions");
        actions.append(makeAction("Edit", task.id, "edit"), makeAction("Remove", task.id, "remove", "remove"));
        item.append(actions);
      }
      list.append(item);
    });

    get("showing-count").textContent = "Showing " + shown.length + " of " + tasks.length + " tasks";
    const empty = shown.length === 0;
    get("empty-state").hidden = !empty;
    if (empty) {
      get("empty-title").textContent = tasks.length === 0 ? "Your task list is empty" : "No matching tasks";
      get("empty-description").textContent = tasks.length === 0
        ? "Use the form to create your first task."
        : "Try a different filter or search term.";
    }
  }

  get("task-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = get("new-task");
    const text = input.value.trim();
    if (!text) {
      get("form-error").textContent = "Please enter a task name.";
      input.focus();
      return;
    }
    get("form-error").textContent = "";
    tasks.unshift({ id: generateId(), text, completed: false });
    input.value = "";
    editingId = null;
    persist();
    activeFilter = "all";
    get("task-search").value = "";
    updateFilterButtons();
    render();
    notify("Task added successfully.");
    input.focus();
  });

  function updateFilterButtons() {
    document.querySelectorAll("[data-filter]").forEach((button) => {
      const selected = button.dataset.filter === activeFilter;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      editingId = null;
      updateFilterButtons();
      render();
    });
  });

  get("task-search").addEventListener("input", () => {
    editingId = null;
    render();
  });

  get("task-list").addEventListener("change", (event) => {
    const checkbox = event.target.closest('input[data-action="toggle"]');
    if (!checkbox) return;
    const task = tasks.find((item) => item.id === checkbox.dataset.id);
    if (!task) return;
    task.completed = checkbox.checked;
    persist();
    render();
    notify(task.completed ? "Task marked as completed." : "Task marked as active.");
  });

  get("task-list").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { id, action } = button.dataset;
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    if (action === "edit") {
      editingId = id;
      render();
      const input = get("task-list").querySelector('li[data-id="' + CSS.escape(id) + '"] input[name="editedTask"]');
      if (input) { input.focus(); input.select(); }
    } else if (action === "cancel") {
      editingId = null;
      render();
    } else if (action === "remove") {
      if (!window.confirm('Remove "' + task.text + '" from your tasks?')) return;
      tasks = tasks.filter((item) => item.id !== id);
      if (editingId === id) editingId = null;
      persist(); render(); notify("Task removed.");
    }
  });

  get("task-list").addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-edit-id]");
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector('input[name="editedTask"]');
    const text = input.value.trim();
    if (!text) { input.setCustomValidity("Please enter a task name."); input.reportValidity(); return; }
    const task = tasks.find((item) => item.id === form.dataset.editId);
    if (!task) return;
    task.text = text;
    editingId = null;
    persist(); render(); notify("Task updated.");
  });

  get("task-list").addEventListener("input", (event) => {
    if (event.target.matches('input[name="editedTask"]')) event.target.setCustomValidity("");
  });

  get("task-list").addEventListener("keydown", (event) => {
    if (event.key === "Escape" && event.target.matches('input[name="editedTask"]')) {
      editingId = null; render();
    }
  });

  get("clear-all").addEventListener("click", () => {
    if (!tasks.length) return;
    if (!window.confirm("Clear all tasks? This cannot be undone.")) return;
    tasks = [];
    editingId = null;
    persist(); render(); notify("All tasks cleared.");
  });

  get("reset-samples").addEventListener("click", () => {
    if (!window.confirm("Restore the five sample tasks? This will replace your current list in this browser.")) return;
    tasks = copySamples();
    editingId = null; activeFilter = "all";
    get("task-search").value = "";
    updateFilterButtons();
    persist(); render(); notify("Sample tasks restored.");
  });

  render();
})();
