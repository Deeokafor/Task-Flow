# ⚡ Taskflow - Modern Full-Stack Todo Application

Taskflow is a high-performance, secure, full-stack Todo application designed for seamless deployment on **Netlify**. Powered by standard web technologies (Vanilla HTML, CSS, JavaScript) on the frontend and **Netlify Serverless Functions** on the backend.

---

## ✨ Features

- **⚡ Lightning-Fast Serverless Backend**: Powered by Node.js Netlify Functions (`/api/todos`).
- **🛡️ Enterprise Security**:
  - Content Security Policy (CSP) & strict HTTP headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
  - Server-side & client-side XSS input sanitization.
  - Per-IP Rate Limiting (60 requests/minute) to prevent spam & DDoS abuse.
- **🏷️ Task Priority & Categories**: Assign priority (`High`, `Medium`, `Low`) and categories (`Work`, `Personal`, `Dev`, `General`).
- **📅 Due Dates & Deadlines**: Set task deadlines with clean visual date indicators.
- **🔍 Real-time Search & Multi-Filter**: Instantly search tasks by title and filter by status or category.
- **📁 JSON Data Export**: One-click JSON backup export for all tasks.
- **🌐 Offline & Standalone Fallback**: Works flawlessly even without an active internet connection using a smart `localStorage` adapter.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Dark-mode glassmorphism), Vanilla ES6 JavaScript.
- **Backend**: Netlify Functions (Node.js).
- **Deployment**: Netlify (`netlify.toml`).

---

## 🚀 Local Setup & Running

### 1. Clone the repository
```bash
git clone https://github.com/Deeokafor/Task-Flow-hng-.git
cd Task-Flow-hng-
```

### 2. Run with Netlify CLI (Full-Stack Mode)
```bash
npx netlify-cli dev
```
Open `http://localhost:8888` in your browser.

### 3. Run Standalone (Static Mode)
Double-click `index.html` or start a simple Python server:
```bash
python3 -m http.server 8000
```

---

## ☁️ Netlify Deployment Guide

1. Log into your **Netlify** account.
2. Click **Add new site** > **Import an existing project**.
3. Select **GitHub** and authorize access to `Deeokafor/Task-Flow-hng-`.
4. Netlify will automatically detect `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions`
5. Click **Deploy Site**. Your full-stack app will be live with active serverless functions!

---

## 📄 License
MIT License
