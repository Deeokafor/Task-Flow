# AGENTS.md

## Project Overview
This repository contains a basic, lightweight Todo application (**Taskflow**) built with standard HTML, CSS, and Vanilla JavaScript.

## Setup & Running the Application
Since this application uses standard static web assets, no build step or node installation is required.

### Local Execution Options:
1. **Direct Browser Execution**:
   - Open `index.html` directly in any web browser.
2. **Local HTTP Server (Optional)**:
   - Use Python's built-in HTTP server:
     ```bash
     python3 -m http.server 8000
     ```
     Then open `http://localhost:8000` in your web browser.

---

## Testing & Verification Instructions

When making modifications or verifying the application, follow these guidelines:

### 1. Manual Verification Checklist
Verify the following functionalities in a browser or browser automation agent:
- **Task Creation**: Add new todo items via the input field and verify they append to the list.
- **Task Completion**: Toggle the checkbox on a task item. Ensure line-through formatting applies and the active task count decreases.
- **Task Filtering**: Click the filter tabs (`All`, `Active`, `Completed`) and ensure only corresponding task items are visible.
- **Task Deletion**: Click the delete icon on an item and verify it is removed from the DOM.
- **Clear Completed**: Click "Clear Completed" and verify all finished tasks are removed simultaneously.
- **Persistence**: Refresh the web page and ensure the task state persists via `localStorage`.

### 2. Code Quality Guidelines
- Do not introduce external heavy frameworks unless explicitly requested.
- Maintain responsive, dark-mode glassmorphic styling inside `index.css`.
- Keep core application logic decoupled in `index.js` and structure in `index.html`.
