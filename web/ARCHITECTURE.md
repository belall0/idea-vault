# IdeaVault Web Architecture

Welcome to the IdeaVault frontend architecture documentation. This document is designed to help developers quickly understand our application structure, core concepts, conventions, and development workflows.

## Overview

IdeaVault uses a **Simplified Feature-Sliced Design (FSD)** architecture. Traditional FSD uses 6 layers, but we use a pragmatic 4-layer approach to reduce cognitive load and boilerplate while retaining the benefits of modularity, co-location, and strict dependency flow.

Our core tech stack includes:

- **Framework**: React (via Vite)
- **Routing**: TanStack Router (File-based)
- **Data Fetching & State**: TanStack Query (React Query) + Axios
- **Styling & UI**: Tailwind CSS + shadcn/ui
- **Forms & Validation**: React Hook Form + Zod

---

## The 4-Layer Architecture

Our codebase is organized into four distinct layers. The golden rule of FSD is the **Dependency Rule**: _A layer can only import from layers below it._

`app` → `pages` → `features` → `shared`

### 1. Shared Layer (`src/shared/`)

**The Foundation.** Contains highly reusable, domain-agnostic primitives.

- **UI Components:** Generic components like `Button`, `Card`, `Input` (mostly shadcn/ui).
- **API Client:** The base Axios instance (`api-client.ts`) and interceptors.
- **Config:** Global configurations like `query-client.ts`.
- **Lib/Hooks:** Generic utilities (`utils.ts`) and custom hooks (`use-mobile.ts`).
- **Rule:** Cannot import from _any_ other layer.

### 2. Features Layer (`src/features/`)

**The Business Logic.** Contains domain-specific modules (slices) like `auth/` and `ideas/`.

- Everything related to a specific domain lives here: API calls, types, schemas, and feature-specific UI components.
- We use **flat feature folders** (no internal `ui/`, `api/`, `model/` subdirectories).
- **Rule:** Can import from `shared`, but _not_ from `pages` or `app`.

### 3. Pages Layer (`src/pages/`)

**The Assemblers.** Contains components that represent full views/screens.

- Pages compose features and shared components to build a complete view.
- E.g., `HomePage.tsx`, `IdeaDetailPage.tsx`.
- **Rule:** Can import from `features` and `shared`. Cannot import from `app` or other pages.

### 4. App Layer (`src/app/`)

**The Bootstrap.** The entry point of the application.

- Global setup: `main.tsx`, `router.ts`, `index.css`.
- Global providers: Composed in `providers/index.tsx`.
- Global layouts: `RootLayout.tsx`, `AuthenticatedLayout.tsx`, etc.
- **Rule:** Can import from any layer. No layer should import from `app`.

> **Note on Routing (`src/routes/`):** We use TanStack Router with **Flat File-based Routing**. Path hierarchies are represented using dot-separated filenames directly within the root `src/routes/` directory (e.g., `ideas.$ideaid.edit.tsx`), keeping the folder structure completely flat. Route files must remain **thin wrappers**. They only handle routing configuration (paths, loaders, auth guards) and delegate UI rendering directly to components in the `pages/` layer.

---

## Directory Structure

```text
src/
├── app/                  # App initialization, layouts, and providers
│   ├── layouts/          # Root, Authenticated, Guest layouts, Sidebar
│   ├── providers/        # Composed React context providers
│   ├── index.css         # Global Tailwind styles
│   ├── main.tsx          # React DOM render entry
│   └── router.ts         # TanStack Router instance creation
├── features/             # Domain-specific slices
│   ├── auth/             # Auth feature (login, register, context, schemas)
│   └── ideas/            # Ideas feature (CRUD, API, schemas, cards, forms)
├── pages/                # Page-level components
│   ├── HomePage.tsx
│   ├── IdeaDetailPage.tsx
│   └── ...
├── routes/               # TanStack Router definitions (Thin wrappers, flat file-based)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── _auth.tsx
│   ├── _auth.login.tsx
│   ├── _auth.register.tsx
│   ├── _protected.tsx
│   ├── _protected.profile.tsx
│   ├── ideas.index.tsx
│   ├── ideas.new.tsx
│   ├── ideas.$ideaid.index.tsx
│   └── ideas.$ideaid.edit.tsx
└── shared/               # Domain-agnostic reusable code
    ├── api/              # Base Axios client
    ├── config/           # React Query setup
    ├── hooks/            # Generic hooks
    ├── lib/              # Utility functions
    ├── types/            # Global types
    └── ui/               # shadcn/ui components
```

---

## Core Concepts & Conventions

### 1. Feature-Prefixed Filenames

To make tab navigation in your IDE easier, generic files within a feature must be prefixed with the feature name.

- **Do:** `features/ideas/ideas-api.ts`, `features/auth/auth-schemas.ts`
- **Don't:** `features/ideas/api.ts`, `features/auth/schemas.ts`

### 2. No Barrels in Features

We avoid `index.ts` barrel files inside features to prevent circular dependency issues and keep imports explicit. Import directly from the required file:

```typescript
import { createIdea } from "@/features/ideas/ideas-api";
```

### 3. Thin Route Files

Route files (`src/routes/**`) should **never** contain UI markup or complex business logic.

- Use them for data loading (`loader`), authentication checks (`beforeLoad`), and SEO (`head`).
- Return a component from the `pages/` layer.

### 4. State Management

- **Server State:** Handled entirely by React Query (`useQuery`, `useMutation`). API calls are defined in `features/<domain>/<domain>-api.ts`.
- **Global App State:** We keep this minimal. Currently, only Authentication uses React Context (`AuthContext`).
- **Local State:** React `useState` where appropriate within components.

### 5. UI Components (shadcn/ui)

We use shadcn/ui for our component library. When you run `npx shadcn add <component>`, it is configured (via `components.json`) to install components directly into `src/shared/ui/`.

---

## Development Workflows

### Adding a New Page

1. **Create the Route:** Use the TanStack router CLI or create a file in `src/routes/` using dot-separated notation for nested paths (e.g., `src/routes/settings.tsx` or `src/routes/settings.details.tsx`).
2. **Create the Page Component:** Create `src/pages/SettingsPage.tsx`.
3. **Link Them:** Import and render `SettingsPage` inside your route file.

### Adding a New Feature

1. Create a new folder under `src/features/` (e.g., `src/features/comments/`).
2. Define the types/schemas: `comments-types.ts`, `comments-schemas.ts`.
3. Define the API calls: `comments-api.ts`.
4. Create the UI components: `CommentList.tsx`, `CommentForm.tsx`.
5. Compose these components in the appropriate `pages/` layer component.

### Working with Forms

We standardize on **React Hook Form** paired with **Zod** for validation.

1. Define your Zod schema in the feature's schema file (`<feature>-schemas.ts`).
2. Export the inferred TypeScript type from Zod.
3. Use the `Field`, `FieldLabel`, `FieldError` components from `shared/ui/field` to build accessible forms quickly.

---

## Getting Started

To spin up the development environment:

```bash
npm install
npm run dev
```

To run type checking and build for production:

```bash
npm run build
```
