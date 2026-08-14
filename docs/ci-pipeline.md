# Continuous Integration Pipeline

This document outlines the GitHub Actions CI pipeline architecture, triggers, workflow jobs, and services used in IdeaVault.

---

## Overview

IdeaVault uses **GitHub Actions** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) to validate every push and pull request against the `main` and `develop` branches.

The pipeline is organized into **parallel jobs** to minimize run time and provide fast feedback to developers.

---

## Workflow Triggers & Concurrency

- **Triggers**:
  - `push` to `main`, `develop`
  - `pull_request` targeting `main`, `develop`
  - `workflow_dispatch` (manual trigger)
- **Concurrency Management**: In-progress runs for the same branch or PR are automatically cancelled when new commits are pushed, preventing redundant resource consumption.

---

## Pipeline Jobs

| Job | Description | Environment / Services | Execution Steps |
| --- | ----------- | ---------------------- | --------------- |
| **Lint** | Lints both API and Web workspaces | `ubuntu-latest`<br>Node.js 22, pnpm 10 | `pnpm --filter api lint`<br>`pnpm --filter web lint` |
| **Build** | Typechecks and produces production builds | `ubuntu-latest`<br>Node.js 22, pnpm 10 | `pnpm --filter api build`<br>`pnpm --filter web build` |
| **Backend Tests** | Runs full backend E2E test suites | `ubuntu-latest`<br>Node.js 22, pnpm 10<br>`mongo:7.0` service container (`27017:27017`) | `pnpm test:api:e2e` |

---

## Environment & Services

### MongoDB Service Container

The `test-backend` job launches an isolated `mongo:7.0` Docker service container with automated health checks:

```yaml
services:
  mongodb:
    image: mongo:7.0
    ports:
      - 27017:27017
    options: >-
      --health-cmd "mongosh --eval 'db.adminCommand({ ping: 1 })'"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Test Environment Variables

| Variable | Value / Purpose |
| --- | --- |
| `NODE_ENV` | `test` |
| `TEST_DB_URL` | `mongodb://localhost:27017/ideavault-test` |
| `JWT_SECRET` | Secret key used for signing JWTs during test execution |
| `FRONTEND_URL` | `http://localhost:5173` |

---

## Dependency Caching

All jobs take advantage of `pnpm/action-setup@v4` coupled with `actions/setup-node@v4` using `cache: 'pnpm'` and `pnpm install --frozen-lockfile` for fast and reproducible dependency installation.
