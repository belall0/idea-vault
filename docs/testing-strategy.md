# Testing Strategy

This document outlines the testing approach, frameworks, test suites, and assertions used in IdeaVault.

---

## Approach

All automated backend tests are **end-to-end (e2e)**. Each test suite spins up a full `NestApplication` against a **dedicated test database** (`TEST_DB_URL`), which is dropped and re-indexed in `beforeAll`.

- **Real HTTP behavior**: Tests verify status codes, headers, cookies, and response body structure.
- **Database side effects**: Asserted directly via injected Mongoose models.
- **Zero service mocking**: No mocking of services or repositories — the entire application stack is exercised.

---

## Frameworks

| Tool                                  | Role                                              |
| ------------------------------------- | ------------------------------------------------- |
| [Jest](https://jestjs.io/)            | Test runner and assertion library                 |
| [Pactum](https://pactumjs.github.io/) | Fluent HTTP spec library for clean test authoring |

---

## Test Coverage

| Suite      | File                     | Cases | Description                          |
| ---------- | ------------------------ | ----- | ------------------------------------ |
| Auth       | `test/auth.e2e-spec.ts`  | ~50   | Registration, login, refresh, logout |
| Ideas      | `test/ideas.e2e-spec.ts` | ~40   | CRUD, ownership, visibility          |
| Users      | `test/users.e2e-spec.ts` | ~10   | Admin bootstrap, user profiles       |
| App health | `test/app.e2e-spec.ts`   | Smoke | Health check & app bootstrap         |

---

## Test Categories per Endpoint

Each endpoint is verified across four distinct lenses:

| Lens                 | What it verifies                                          |
| -------------------- | --------------------------------------------------------- |
| **Input validation** | Malformed / missing fields → 400                          |
| **Authentication**   | Missing / invalid token → 401                             |
| **Business logic**   | Correct status codes and body shape on happy + sad paths  |
| **Side effects**     | DB state assertions (token creation, hashing, revocation) |

---

## Notable Side-Effect Assertions

- **Password Hashing**: Registration persists passwords as Argon2 hashes (never plaintext), verified directly from the database.
- **Login Failures**: Failed logins do **not** create refresh token records — verified by comparing document counts before and after.
- **Token Family Revocation**: Refresh token reuse triggers session-family revocation — the entire token chain is verified as `revokedAt != null`.
- **Granular Logout**: Logout marks only the targeted token chain as revoked; an invalid logout does not alter other active sessions.

---

## ThrottlerGuard in Tests

The global `ThrottlerGuard` is registered as an `APP_GUARD`. In e2e tests, it is bypassed cleanly with a `jest.spyOn` mock — requiring no production code changes or special test module overrides.
