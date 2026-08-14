# Engineering Decisions

This document captures key architectural and technical trade-offs made in IdeaVault and the reasoning behind them.

---

## 1. Why Opaque Refresh Tokens (instead of JWT refresh tokens)?

JWT refresh tokens cannot be easily revoked without server-side blacklists or lookups. Using an opaque, cryptographically random token with a hashed MongoDB record enables:

- **Single-token revocation** immediately on logout.
- **Session-family revocation** on reuse detection (if an old refresh token is reused, all tokens in the chain are invalidated).
- **Auditable lifecycle** via the `replacedByTokenHash` linked chain.
- **Enhanced security**: Only the SHA-256 hash is persisted in the database; the raw token is never stored.

---

## 2. Why Feature-Sliced Design (FSD) on the Frontend?

FSD enforces a strict unidirectional dependency graph (`app → pages → features → shared`):

- **Prevents hidden coupling**: Components cannot import freely across arbitrary layers, preventing "component spaghetti".
- **Scalable structure**: Business domains and UI features are modular, self-contained, and easier to refactor or delete.
- **Pragmatic adaptation**: A 4-layer reduction keeps overhead low while retaining high architectural discipline for the application's scale.

---

## 3. Why E2E Tests over Unit Tests?

For a REST API built on NestJS and MongoDB/Mongoose:

- **High confidence**: E2E tests execute the complete HTTP request pipeline, including middleware, guards, pipes, interceptors, and database queries.
- **Low maintenance boilerplate**: Unit testing services requires mocking Mongoose query chains, models, and NestJS dependency injection, which often tests implementation mocks rather than real runtime behavior.
- **Comprehensive validation**: Tests run against an isolated test database (`TEST_DB_URL`), directly validating database side effects, indexing, and schema validations.
