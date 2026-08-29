<h1 align="center">react-admin-starter</h1>

<p align="center" markdown=1>
  <i>A mock-first React admin starter with shadcn/ui, Tailwind CSS, React Hook Form, Zod, TanStack Table, and Vite — no backend required for the happy path.</i>
</p>

<p align="center">
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://vitejs.dev">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  </a>
  <a href="https://ui.shadcn.com">
    <img src="https://img.shields.io/badge/shadcn%2Fui-000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui">
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </a>
  <a href="https://zustand.docs.pmnd.rs">
    <img src="https://img.shields.io/badge/Zustand-443F38?style=for-the-badge&logo=zustand&logoColor=white" alt="Zustand">
  </a>
  <a href="https://tanstack.com/query">
    <img src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query">
  </a>
  <a href="https://tanstack.com/table">
    <img src="https://img.shields.io/badge/TanStack%20Table-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Table">
  </a>
</p>

## 🔍 Project Overview

This **React** admin starter is mock-first: an Axios in-memory adapter powers login, RBAC, and CRUD without a backend on the happy path. The stack combines **shadcn/ui** (Base UI + Tailwind), **React Hook Form + Zod**, **TanStack Table**, **Zustand**, **TanStack Query**, and **React Router** (history mode) on **Vite**.

The dashboard shell includes sidebar navigation, theme switching (light/dark + color presets), i18n (pt-BR and en-US), permission-driven routes and menus, a **403** page for unauthorized deep links, mock user management, and a read-only roles view. Smoke tests run with **Vitest** and **GitHub Actions** on every push.

## 🌟 Key Features

- 🏛️ **Dashboard layout:** Sidebar, header, settings sheet, breadcrumb, and authenticated routing.
- 🎨 **Theme switching:** Light/dark mode, 8 primary color presets, layout modes — persisted via Zustand.
- 🌍 **i18n:** pt-BR and en-US for login, chrome, management screens, and error pages.
- 🔐 **RBAC:** Permission tree drives dynamic routes and menu filtering; viewer vs admin roles.
- 🚫 **403 handling:** Unauthorized deep links under `/management` show a clear forbidden page.
- 👥 **Mock user CRUD:** Paginated TanStack Table, RHF+Zod modals, deactivate — gated by permissions.
- 🏷️ **Roles list:** Read-only view of roles and nested permissions in a Sheet.
- 🧪 **Vitest tests:** Mock adapter, stores, RBAC, admin components, and Zod schemas.
- ✅ **CI:** GitHub Actions runs lint, build, and tests on every push.
- 🚀 **Vercel-ready:** SPA rewrite for the history router; mock adapter in production demo builds.

## 📋 Prerequisites

- [Node.js](https://nodejs.org) **20** or newer.
- [pnpm](https://pnpm.io) **8.15.4** (see `packageManager` in `package.json`).

## 🚀 Running the Project

```bash
pnpm install
cp .env.example .env   # Windows: copy .env.example .env
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

| Script          | What it does                              |
| --------------- | ----------------------------------------- |
| `pnpm dev`      | Start Vite dev server (port 3001)         |
| `pnpm build`    | Typecheck + production build              |
| `pnpm preview`  | Preview the production build locally      |
| `pnpm lint`     | ESLint on `src/`                          |
| `pnpm format`   | Prettier write                            |
| `pnpm test`     | Vitest (mock adapter + component tests)   |

## 🧪 Running Tests

```bash
pnpm test
```

Tests exercise the **mock Axios adapter**, Zustand stores, RBAC hooks, admin UI components, and Zod validation schemas.

## 🎭 Mock Data and Demo Accounts

| User     | Password    | Access                                            |
| -------- | ----------- | ------------------------------------------------- |
| `admin`  | `admin123`  | Workbench + system management (users CRUD, roles) |
| `viewer` | `viewer123` | Workbench only; management deep links return **403** |

### Environment variables

| Variable            | Default               | Purpose                                       |
| ------------------- | --------------------- | --------------------------------------------- |
| `VITE_USE_MOCK`     | `true`                | `true` = Axios mock adapter; `false` = real API |
| `VITE_APP_BASE_API` | _(empty)_             | API base URL when `VITE_USE_MOCK=false`       |
| `VITE_APP_HOMEPAGE` | `/workbench/overview` | Post-login redirect target                    |

## UI Architecture

```text
Application (pages, layouts)
    ↓
Admin Components (components/admin)
    ↓
UI Components (components/ui — shadcn source-owned)
    ↓
Base UI (@base-ui/react) + Tailwind CSS + CSS variables
```

## Source available

This repository is a **personal starter** shared as a gift. Clone it, fork it, or copy it into **your** project and adapt it there — that is what the [MIT license](LICENSE) is for.

It is not a community project. I am not looking for pull requests, feature requests, or a contributor community. If you want to change something, do it in your own copy. Happy coding!
