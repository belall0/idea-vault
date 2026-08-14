# Deployment Guide

This document provides a -guide to IdeaVault's deployment architecture, first-time local machine setup, environment configuration, and execution of automated deployment commands for both backend (Heroku) and frontend (Vercel).

---

## Deployment Architecture Overview

IdeaVault uses a decoupled production hosting architecture:

```
┌──────────────────────────────────────────────────────────────────┐
│                         Production Setup                         │
├────────────────────────────────┬─────────────────────────────────┤
│       Frontend (Web SPA)       │          Backend (API)          │
├────────────────────────────────┼─────────────────────────────────┤
│ Host: Vercel                   │ Host: Heroku                    │
│ Config: `web/vercel.json`      │ Config: `Procfile`              │
│ Target: Production Alias       │ Target: Heroku Git Remote       │
└────────────────────────────────┴─────────────────────────────────┘
```

- **Backend API**: Deployed on **Heroku** via Git integration (`Procfile` runs `pnpm --filter api start:prod`).
- **Frontend SPA**: Deployed on **Vercel** with SPA rewrites enabled via `web/vercel.json`.

---

## First-Time Machine Configuration

Before running deployments from a new machine or environment, complete the one-time authentication and repository linking steps below.

### 1. Prerequisites

Ensure the following tools are installed:

- **Node.js** ≥ 22
- **pnpm** ≥ 10 (`npm install -g pnpm`)
- **Git**
- **Heroku CLI** (`npm install -g heroku` or OS package manager)
- **Vercel CLI** (`npm install -g vercel`)

---

### 2. Heroku Setup (Backend API)

#### Step 1: Log in to Heroku

```bash
heroku login
```

#### Step 2: Add Heroku Git Remote

From the repository root (`idea-vault/`):

```bash
heroku git:remote -a idea-vault
```

---

### 3. Vercel Setup (Frontend Web)

#### Step 1: Log in to Vercel

```bash
vercel login
```

#### Step 2: Link the Web Workspace to Vercel

Navigate to the `web/` directory and link the project:

```bash
cd web
vercel link
```

When prompted:

- **Set up and deploy?**: Choose **Yes** or link to existing project
- **Which scope?**: Select your team/account (e.g., `belal-muhammads-projects`)
- **Link to existing project?**: Select **Yes** and choose `idea-vault`

This creates a local `.vercel/project.json` linking the workspace to the Vercel project.

---

## Deployment Commands

All deployments can be triggered directly from the repository root:

| Command           | Target          | Action                                                                             |
| ----------------- | --------------- | ---------------------------------------------------------------------------------- |
| `pnpm deploy:api` | Heroku          | Pushes current branch (`HEAD:main`) to Heroku git remote and builds the NestJS API |
| `pnpm deploy:web` | Vercel          | Builds and deploys the Vite SPA directly to Vercel production                      |
| `pnpm deploy:all` | Heroku + Vercel | Runs `deploy:api` followed by `deploy:web` sequentially                            |

### Individual Workspace Commands

You can also trigger individual deployments from within sub-directories:

```bash
# Inside web/ directory
cd web
pnpm deploy:prod
```

> [!NOTE]
> `deploy` is a reserved built-in command in `pnpm` (used for isolating workspace packages). Always use `pnpm deploy:all` or explicitly use `pnpm run deploy` to trigger the full deployment pipeline.

---

## Routing & SPA Handling (Vercel)

Single Page Applications (SPAs) that use client-side routers (like TanStack Router) require server rewrites so direct navigation and hard refreshes on non-root paths (e.g. `/ideas`, `/profile`, `/login`) do not result in `404 Not Found`.

This is configured in [`web/vercel.json`](../web/vercel.json):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

---

## Troubleshooting & Verification

### Verify Backend Logs

To view live logs from the deployed NestJS API on Heroku:

```bash
heroku logs --tail -a idea-vault
```

### Verify Frontend Deployment

Check the latest Vercel deployment status and preview URL:

```bash
cd web && vercel inspect
```
