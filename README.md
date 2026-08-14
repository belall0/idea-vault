# IdeaVault

A full-stack idea management system demonstrating production-grade software engineering across the entire stack — from API security architecture to frontend data-flow patterns.

> **Stack:** NestJS, MongoDB, React, TanStack Router & Query, shadcn/ui, Tailwind CSS v4, pnpm Workspaces.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Development Setup](#development-setup)
- [Important Documentation](#important-documentation)

---

## Project Structure

```
idea-vault/                     # pnpm workspace root
├── .husky/                     # Git hooks (commit-msg validation)
├── docs/                       # Project documentation
├── package.json                # Root scripts: dev:api, dev:web, test:api:e2e
├── pnpm-workspace.yaml         # Declares [api, web] as workspace packages
├── scripts/                    # Automation scripts (validate-commit-msg.js)
│
├── api/                        # NestJS backend
│   ├── src/
│   │   ├── main.ts
│   │   ├── seed.ts
│   │   ├── app/
│   │   ├── app-config/
│   │   ├── auth/
│   │   ├── ideas/
│   │   └── users/
│   ├── test/                   # E2E test suites
│   ├── ARCHITECTURE.md         # Detailed backend architecture doc
│   ├── .env.example
│   ├── nest-cli.json
│   └── tsconfig.json
│
└── web/                        # React + Vite frontend
    ├── src/
    │   ├── app/
    │   ├── features/
    │   ├── pages/
    │   ├── routes/
    │   └── shared/
    ├── ARCHITECTURE.md         # Detailed frontend architecture doc
    ├── components.json         # shadcn/ui configuration
    ├── vite.config.ts
    └── tsconfig.app.json
```

---

## Backend Architecture

```
src/
├── main.ts                 # Bootstrap: Helmet, CORS, prefix, pipes, cookies
├── seed.ts                 # Standalone seed script (ts-node entry)
│
├── app/                    # Root module + global wiring
│   └── app.module.ts       # Composes all feature modules; registers ThrottlerGuard globally
│
├── app-config/             # Typed configuration module
│   ├── app-config.module.ts
│   ├── app-config.service.ts   # Typed getters: .appOptions, .authOptions
│   └── config/
│       └── app-config.ts       # ConfigFactory — maps env vars to typed classes
│
├── users/
│   ├── users.module.ts
│   ├── users.service.ts        # CRUD + duplicate email handling + bootstrap admin
│   ├── schemas/user.schema.ts
│   └── types/
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts      # POST /auth/{register,login,refresh,logout}
│   ├── auth.service.ts         # register, login, refresh, logout orchestration
│   ├── refresh-token.service.ts  # Token lifecycle: create, validate, rotate, revoke
│   ├── strategies/jwt.strategy.ts
│   ├── guards/{jwt,optional-jwt}.guard.ts
│   ├── decorators/get-user.decorator.ts
│   ├── schemas/refresh-token.schema.ts
│   └── types/
│
└── ideas/
    ├── ideas.module.ts
    ├── ideas.controller.ts     # GET /ideas, GET /ideas/me, POST, PUT, DELETE
    ├── ideas.service.ts        # CRUD with userId ownership filter
    ├── schemas/idea.schema.ts
    └── types/dtos/
```

The full backend architecture is documented in [`api/ARCHITECTURE.md`](./api/ARCHITECTURE.md).

---

## Frontend Architecture

The frontend follows a **pragmatic 4-layer Feature-Sliced Design (FSD)** architecture.

```
src/
├── app/
│   ├── layouts/          # RootLayout, AuthenticatedLayout
│   ├── providers/        # Composed React context providers
│   ├── index.css         # Global Tailwind v4 styles + CSS variables
│   ├── main.tsx          # ReactDOM.createRoot entry
│   └── router.ts         # TanStack Router instance
│
├── features/
│   ├── auth/
│   │   ├── auth-context.tsx     # AuthProvider + useAuth hook
│   │   ├── auth-api.ts          # login, register, refresh, logout calls
│   │   ├── auth-schemas.ts      # Zod schemas for login/register forms
│   │   ├── auth-types.ts        # User, AuthContextValue types
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── ideas/
│       ├── ideas-api.ts         # getIdeas, getIdea, createIdea, updateIdea, deleteIdea
│       ├── ideas-queries.ts     # TanStack Query queryKey factory
│       ├── ideas-schemas.ts     # Zod schema + IdeaFormValues type
│       ├── ideas-types.ts       # Idea type
│       ├── IdeaCard.tsx
│       ├── IdeaFormFields.tsx
│       ├── CreateIdeaForm.tsx
│       └── EditIdeaForm.tsx
│
├── pages/
│   ├── HomePage.tsx
│   ├── IdeasListPage.tsx
│   ├── IdeaDetailPage.tsx
│   ├── CreateIdeaPage.tsx
│   ├── EditIdeaPage.tsx
│   ├── ProfilePage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
│
├── routes/               # TanStack Router — thin wrappers only
│   ├── __root.tsx
│   ├── index.tsx
│   ├── _auth.tsx  /  _auth.login.tsx  /  _auth.register.tsx
│   ├── _authenticated.tsx  /  _authenticated.profile.tsx
│   ├── _authenticated.ideas.new.tsx
│   ├── _authenticated.ideas.$ideaid.edit.tsx
│   ├── ideas.index.tsx
│   └── ideas.$ideaid.index.tsx
│
└── shared/
    ├── api/api-client.ts    # Axios instance + module-scope token variable
    ├── config/              # React Query client setup
    ├── hooks/               # Generic hooks (e.g., use-mobile)
    ├── lib/                 # Utility functions
    ├── types/               # Global types (RouterContext)
    └── ui/                  # shadcn/ui components
```

The full frontend architecture is documented in [`web/ARCHITECTURE.md`](./web/ARCHITECTURE.md).

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 22
- **pnpm** ≥ 10 (`npm install -g pnpm`)
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install

```bash
git clone https://github.com/belall0/idea-vault
cd idea-vault
pnpm install
```

### 2. Configure the API

```bash
cp api/.env.example api/.env
```

Edit `api/.env`:

```env
NODE_ENV=development
CREATE_DEFAULT_ADMIN=true
DB_URL=mongodb://localhost:27017/idea-vault
TEST_DB_URL=mongodb://localhost:27017/idea-vault-test
FRONTEND_URL=http://localhost:5173
```

> `CREATE_DEFAULT_ADMIN=true` creates a default user (`belal@gmail.com` / `Idea@2026`) on first boot in non-production environments.

### 3. Configure the frontend

```bash
cp web/.env.example web/.env
```

Edit `web/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Start development servers

```bash
# Terminal 1 — API (port 3000, --watch mode)
pnpm dev:api

# Terminal 2 — Web (port 5173, HMR)
pnpm dev:web
```

### 5. Seed the database (optional)

```bash
cd api

# Add seed data (idempotent — safe to re-run)
pnpm seed

# Wipe collections and re-seed from scratch
pnpm seed:reset
```

### 6. Run e2e tests

```bash
pnpm test:api:e2e
```

Ensure `TEST_DB_URL` points to a **separate** database from `DB_URL` — the test suite drops the entire database in `beforeAll`.

---

## Important Documentation

- [`docs/authentication-design.md`](docs/authentication-design.md) — Token architecture, refresh token rotation, reuse detection, and client session lifecycle.
- [`docs/testing-strategy.md`](docs/testing-strategy.md) — E2E testing approach, framework setup, test coverage, and database side-effect assertions.
- [`docs/engineering-decisions.md`](docs/engineering-decisions.md) — Rationale for key architectural and technical design trade-offs.
- [`docs/commit-conventions.md`](docs/commit-conventions.md) — Git commit message formatting rules and automated validation.

