# To-Do List Application — Browser Version

A web adaptation of the original **Java Swing To-Do List Application**, based on the existing Java source code at:

https://github.com/Riska997/Listjava/tree/main/todoListAPP

## Features

- Add tasks with names
- Edit task names
- Mark tasks as complete or active
- Remove individual tasks
- Clear the entire list after confirmation
- Filter all / active / completed tasks
- Search tasks
- See total, completed, remaining, and completion statistics
- Save tasks to the current browser using `localStorage`
- Restore the five sample tasks for demonstrations
- Responsive desktop and mobile interface

## Files

- `index.html` — Website markup
- `style.css` — Page design
- `app.js` — Task behaviour and browser storage

## Test in IntelliJ IDEA

1. Extract the ZIP file to a folder.
2. Open the folder in IntelliJ IDEA (**File → Open**).
3. Open `index.html` in a browser using **Open In → Browser**, or double-click it to open in Chrome.
4. Test Add, Done (checkbox), Edit, Remove, Clear all, Search and filters.
5. Refresh the page: your tasks should still be there.

## About this implementation

This is a **JavaScript-powered web adaptation** of the Java Swing program. It does **not** execute the Java code in the browser. The original Java desktop project is unchanged.

The sample tasks shown on first visit are demonstration data. Each visitor's changes are local to their own browser and device; they are not shared between visitors. Clearing browser storage will remove their saved tasks.
