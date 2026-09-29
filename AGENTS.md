# AGENTS.md

## Project Overview
This repository contains **Taskflow**, a full-stack, secure, lightning-fast Todo application built with Vanilla HTML, CSS, JavaScript, and Node.js serverless backend functions configured for Netlify deployment.

---

## Setup & Local Development Options

### Option 1: Full-Stack Netlify Local Server (Recommended)
Run the application with Netlify serverless API functions enabled locally:
```bash
npx netlify-cli dev
```
This serves the frontend at `http://localhost:8888` and mounts serverless API endpoints at `http://localhost:8888/api/todos`.

### Option 2: Standalone Static Mode
Open `index.html` directly in a browser or run Python's static HTTP server:
```bash
python3 -m http.server 8000
```
In static mode, the application gracefully adapts using an offline `localStorage` fallback adapter.

---

## Architecture & Security Verification

### 1. Serverless API Functions
- Endpoint: `/api/todos` (redirected to `netlify/functions/todos.js` via `netlify.toml`).
- Supports `GET`, `POST`, `PATCH`, and `DELETE` HTTP methods.
- Built-in in-memory rate limiting (max 60 requests/min per IP address).

### 2. HTTP Security Headers
Configured in `netlify.toml`:
- `Content-Security-Policy`: Restricts inline scripts/styles to trusted origins (`'self'`).
- `X-Frame-Options: DENY`: Prevents clickjacking attacks.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Testing & Verification Checklist

When modifying or verifying the application, execute these checks:

### 1. Functionality Checklist
- **Task Creation**: Add tasks with priority (`low`, `medium`, `high`), category (`General`, `Work`, `Personal`, `Dev`), and due date.
- **Filtering & Search**:
  - Filter by status (`All`, `Active`, `Completed`).
  - Filter by category (`General`, `Work`, `Personal`, `Dev`).
  - Search by task title.
- **Task Completion & Updating**: Toggle completion checkbox; verify badge state and remaining task counter.
- **Task Deletion & Clear Completed**: Delete individual items or batch clear all finished items.
- **Data Export**: Click "Export JSON" in the footer and confirm JSON download.

### 2. Security Checklist
- Attempt submitting HTML/script tags (e.g. `<script>alert('xss')</script>`) in task title to confirm HTML escaping and sanitization.
- Send rapid sequential requests to `/api/todos` to verify HTTP `429 Too Many Requests` rate limiting response.
