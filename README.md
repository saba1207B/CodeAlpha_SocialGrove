# Social Grove 🌿

> **A gentle, mindful corner of the internet for ideas worth keeping.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2e7d32?style=for-the-badge&logo=github)](https://saba1207b.github.io/CodeAlpha_SocialGrove/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)

---

## 🌟 Overview

**Social Grove** is a serene, intentional social platform designed as an antidote to noisy algorithmic feeds. Built with warmth, craftsmanship, and mindfulness in mind, it provides spaces for quiet reflections, studio journals, craft logs, and meaningful dialogue between kindred creators.

### 🔗 Live Preview
Experience the interactive live web application directly on GitHub Pages:
👉 **[https://saba1207b.github.io/CodeAlpha_SocialGrove/](https://saba1207b.github.io/CodeAlpha_SocialGrove/)**

---

## ✨ Features

- **🌿 Mindful Social Feed**: Chronological, serene feed centered around thoughtful short-form notes and reflections.
- **💬 Conversational Threads**: In-line thoughtful replies allowing nuanced discussions without algorithmic amplification.
- **👥 Circles & Community**: Discover artisans, writers, botanists, and photographers; add them to your intimate circle.
- **🔖 Personal Sanctuary / Bookmarks**: Save notes, inspirations, and ideas to revisit at your own pace.
- **🧭 Explore & Discover**: Browse trending themes like `#slowliving`, `#madebyhand`, `#smalljoys`, and `#mindfulness`.
- **📸 Media Attachments**: Attach photos to notes with built-in preview and client-side processing.
- **🎨 Warm Aesthetic & Modern UI**: Built with carefully curated earth tones, terracotta and sage accents, subtle micro-animations, and fluid typography.
- **💾 Interactive Client & Offline Mode**: Seamless `localStorage` persistence that enables live note authoring, bookmarking, commenting, and profile customization on static hosts like GitHub Pages.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + Custom Design Tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Routing**: [Wouter](https://github.com/molefrog/wouter)

### Backend (Full-Stack Mode)
- **Runtime**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **API**: [tRPC 11](https://trpc.io/) for end-to-end type safety
- **Database & ORM**: [MySQL](https://www.mysql.com/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v20+ recommended)
- `pnpm` (or `npm`)

### Installation
```bash
# Clone repository
git clone https://github.com/saba1207B/CodeAlpha_SocialGrove.git
cd CodeAlpha_SocialGrove

# Install dependencies
pnpm install
```

### Running Locally
```bash
# Start development server
npm run dev
```
Open your browser to `http://localhost:3000` (or the URL printed in the terminal).

### Type Checking & Testing
```bash
# TypeScript verification
npm run check

# Run tests
npm run test
```

### Production Build
```bash
# Build client and server bundles
npm run build
```

---

## 🚢 Deployment

The repository includes automated GitHub Actions deployment to **GitHub Pages** on every push to `main` via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

To view the live deployment:
**[https://saba1207b.github.io/CodeAlpha_SocialGrove/](https://saba1207b.github.io/CodeAlpha_SocialGrove/)**

---

## 📄 License
MIT License © 2026 Social Grove
