<h1 align="center">React Ant Design Admin Boilerplate</h1>

<p align="center" markdown=1>
  <i>A mock-first React admin starter with Ant Design, Tailwind CSS, styled-components, and Vite — no backend required for the happy path.</i>
</p>

<!-- Replace hero images with your own GitHub user-asset when ready -->
<p align="center">
 <a href="https://github.com/joaoflaviosantos/react-antd-admin-boilerplate">
  <img src="https://github.com/user-attachments/assets/6011f496-4987-47b4-b27c-147d410059b3" alt="Stylized admin dashboard window with sidebar and content panels. The React atom logo floating next to it." width="35%" height="auto">
  </a>
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
  <a href="https://ant.design">
    <img src="https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" alt="Ant Design">
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </a>
  <a href="https://styled-components.com">
    <img src="https://img.shields.io/badge/styled--components-DB7093?style=for-the-badge&logo=styledcomponents&logoColor=white" alt="styled-components">
  </a>
  <a href="https://zustand.docs.pmnd.rs">
    <img src="https://img.shields.io/badge/Zustand-443F38?style=for-the-badge&logo=zustand&logoColor=white" alt="Zustand">
  </a>
  <a href="https://tanstack.com/query">
    <img src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query">
  </a>
</p>

<p align="center">
  <a href="https://github.com/joaoflaviosantos/react-antd-admin-boilerplate/actions/workflows/ci.yml">
    <img src="https://github.com/joaoflaviosantos/react-antd-admin-boilerplate/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
</p>

<p align="center">
  <strong>Live demo:</strong> <a href="https://react-antd-admin-boilerplate.vercel.app">https://react-antd-admin-boilerplate.vercel.app</a>
</p>

## 🔍 Project Overview

This **React** admin boilerplate is mock-first: an Axios in-memory adapter powers login, RBAC, and CRUD without a backend on the happy path. The stack combines **Ant Design 5**, **Tailwind CSS 3**, **styled-components**, **Zustand**, **TanStack Query**, and **React Router** (history mode) on **Vite**.

The dashboard shell includes sidebar navigation, theme switching (light/dark), i18n (pt-BR and en-US), permission-driven routes and menus, a **403** page for unauthorized deep links, mock user management, and a read-only roles view. Smoke tests run with **Vitest** and **GitHub Actions** on every push.

UI patterns were refined via copy-by-slice extraction from [Slash Admin](https://github.com/d3george/slash-admin).

## 🌟 Key Features

A **solid foundation for admin UI development**, with a practical stack and a clear structure:

- 🏛️ **Dashboard layout:** Sidebar, header, settings drawer, breadcrumb, and authenticated routing.
- 🎨 **Theme switching:** Light/dark mode with persisted preferences and Ant Design token integration.
- 🌍 **i18n:** pt-BR and en-US for login, chrome, management screens, and error pages.
- 🔐 **RBAC:** Permission tree drives dynamic routes and menu filtering; viewer vs admin roles.
- 🚫 **403 handling:** Unauthorized deep links under `/management` show a clear forbidden page.
- 👥 **Mock user CRUD:** Paginated list, create/edit modals, deactivate — gated by permissions.
- 🏷️ **Roles list:** Read-only view of roles and their permission labels.
- 🧪 **Vitest smoke tests:** Login, RBAC, CRUD, and 403 enforced at the mock adapter layer.
- ✅ **CI:** GitHub Actions runs lint, build, and tests on every push.
- 🚀 **Vercel-ready:** `vercel.ts` SPA rewrite for the history router; mock adapter in production demo builds.

## 🎯 Project Goals

- [x] Mock Axios adapter with login, session persistence, and seed data.
- [x] AuthGuard and protected dashboard routes.
- [x] Dashboard shell with theme, layout settings, and i18n.
- [x] Workbench overview as the authenticated homepage.
- [x] Localized 404 and 403 error pages.
- [x] Permission-driven routes, menu, and breadcrumb.
- [x] Mock user CRUD and read-only roles screen.
- [x] Vitest smoke tests (login, RBAC, mutations, 403).
- [x] GitHub Actions CI (lint, build, test).
- [x] README and Vercel SPA configuration (`vercel.ts`).

## 📋 Prerequisites

Before you begin, ensure you have the following:

- [Node.js](https://nodejs.org) **20** or newer.
- [pnpm](https://pnpm.io) **8.15.4** (see `packageManager` in `package.json`).

## 🚀 Running the Project

From the **repository root**:

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
| `pnpm test`     | Vitest (mock adapter smoke tests)         |

## 🧪 Running Tests

From the repository root:

```bash
pnpm test
```

Tests exercise the **mock Axios adapter** (not a live API on port 8000): admin/viewer login, permission trees, user CRUD, and 403 enforcement for viewer mutations. CI runs the same suite on every push (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

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

Copy [`.env.example`](.env.example) to `.env` before running locally.

The mock adapter runs in **dev**, **Vitest**, and **production demo builds** when `VITE_USE_MOCK` is not `false`. Do not point the demo at `localhost:8000`.

**Seed reload:** create/edit/deactivate users persist in the in-memory store for the current browser session. A **full page reload** resets the store to the JSON seed (two users: admin and viewer).

No `mockServiceWorker.js` or MSW — the demo uses the same Axios adapter as local dev.

## 🌐 Deploy to Vercel {#deploy-to-vercel}

1. Import this repository in [Vercel](https://vercel.com).
2. Set environment variables for production:
   - `VITE_USE_MOCK=true`
   - `VITE_APP_HOMEPAGE=/workbench/overview`
   - Leave `VITE_APP_BASE_API` empty.
3. Deploy. [`vercel.ts`](vercel.ts) rewrites all routes to `index.html` for the SPA history router.
4. Replace the demo URL at the top of this README with your production URL.

## 📎 Project Links

| Resource | Description |
| -------- | ----------- |
| [`.env.example`](.env.example) | Environment variable template |
| [`vercel.ts`](vercel.ts) | Vercel SPA rewrite configuration |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | GitHub Actions CI workflow |
| [LICENSE](LICENSE) | MIT license |

## 🌐 Reference Projects

- [Slash Admin](https://github.com/d3george/slash-admin) — UI patterns refined via copy-by-slice extraction

## Source available

This repository is a **personal starter** shared as a gift. Clone it, fork it, or copy it into **your** project and adapt it there — that is what the [MIT license](LICENSE) is for.

It is not a community project. I am not looking for pull requests, feature requests, or a contributor community. If you want to change something, do it in your own copy. Happy coding!
