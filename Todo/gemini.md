# 🚀 Velitox: Project Architecture & AI Guide

Velitox is a premium, high-performance productivity suite built with React 19 and Vite. This document serves as a guide for AI agents and developers to understand the codebase and maintain the "Premium" design standards.

## 🛠 Tech Stack
- **Core:** React 19, Vite 8
- **Styling:** Tailwind CSS 3 (Custom design system in `tailwind.config.js`)
- **Backend:** Firebase (Auth, Firestore)
- **Data Viz:** Chart.js + React Chartjs 2
- **FX:** tsParticles (Background), GSAP (Animations)
- **Icons:** Lucide React

## 📁 Project Structure (React)
```text
/
├── src/
│   ├── components/
│   │   ├── layout/       # Sidebar, Header, Global Layout
│   │   ├── auth/         # Authentication screens
│   │   └── views/        # Main App Views (Dashboard, Tasks, etc.)
│   ├── context/          # Auth and Global State Providers
│   ├── firebase.js       # Firebase initialization & instance
│   ├── App.jsx           # Root component & Routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Theme variables & base styles
├── public/               # Static assets & SEO images
└── tailwind.config.js    # Design system tokens
```

## ✨ Design Standards
1.  **Glassmorphism**: Always use `bg-app-card` with `backdrop-blur` for containers.
2.  **Theming**: Use the custom `app-*` colors (e.g., `bg-app-body`, `text-app-main`) defined in the Tailwind config. Never hardcode hex values like `#ffffff` if a theme variable exists.
3.  **Animations**: Every view should have the `animate-slide-in` class or GSAP entrance animations.
4.  **Consistency**: Ensure the brand logo (`layers` icon) is used in all brand touchpoints.

## 🧠 Development Guidelines
- **Component Logic**: Keep views in `src/components/views`. If a view becomes complex, split it into smaller components in `src/components/layout` or a local subfolder.
- **State Management**: Use `AuthContext` for user and global preferences (like currency).
- **Responsiveness**: Always test on mobile widths. The sidebar becomes a bottom nav and the header gets a brand logo.

---
*Last updated: May 2, 2026*
