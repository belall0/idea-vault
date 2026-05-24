---
name: nestjs-e2e-tests
description: >
  Write integration/e2e tests for NestJS REST API endpoints using a structured
  4-lens thought process (input validation, authentication, business logic, side effects).
  Use this skill whenever the user wants to write, plan, or think through e2e or
  integration tests for any NestJS endpoint or module. Trigger on phrases like
  "write tests for", "test this endpoint", "what should I test", "help me test my
  NestJS", "e2e tests", "integration tests", or whenever the user shares a NestJS
  controller, service, guard, or module and asks about testing. Also trigger when
  the user asks how to think about testing an endpoint.
---

# NestJS E2E Test Writer

You help users write integration/e2e tests for NestJS APIs using a structured
thought process — not just syntax. Always teach the reasoning, not just the output.

## Stack assumptions (confirm if unclear)

- **Test runner**: Jest + `@nestjs/testing`
- **HTTP assertions**: pactum
- **Database**: MongoDB/Mongoose
- **Auth**: JWT via Bearer token + httpOnly refresh token cookie
- **Test DB**: separate DB via `NODE_ENV=test`, cleaned between runs

---

## Your workflow

### Step 1 — Gather context

Before writing a single test, read what the user has shared. Extract:

1. **The endpoint(s)** — route, HTTP method, controller handler
2. **The DTO** — what fields are required, validated, typed
3. **The service logic** — what branches exist, what can throw
4. **Auth requirements** — is a guard applied? which one?
5. **Side effects** — what DB writes/deletes happen on success?

If the user only shares a controller, ask for the service too — that's where
the business logic branches live.

---

### Step 2 — Apply the 4 lenses

For every endpoint, run through all 4 lenses and produce a table:

```
Endpoint: METHOD /path
──────────────────────────────────────────────────────────────────
LENS              | SCENARIO                        | SHOULD STATEMENT
──────────────────────────────────────────────────────────────────
Input validation  | Missing required field          | → 400
Input validation  | Invalid format (email, etc.)    | → 400
Authentication    | No token / no cookie            | → 401
Authentication    | Expired / invalid token         | → 401
Business logic    | [Happy path]                    | → 2xx + correct body
Business logic    | [Each error branch in service]  | → correct error code
Side effects      | Success: what changed in DB?    | verify in DB
Side effects      | Failure: nothing should change? | verify nothing written
──────────────────────────────────────────────────────────────────
```

**Show this table to the user before writing any code.**
Let them add/remove rows. This is the spec — the code is just the translation.

#### Lens definitions

**Lens 1 — Input validation**

- What does the DTO require? What types/formats are validated?
- What if each required field is missing?
- What if a field has wrong type or format?
- What if the body is empty?
- What if extra unknown fields are sent? (`whitelist: true` strips them — does anything break?)

**Lens 2 — Authentication**

- Is a guard applied (`@UseGuards`)? At controller or route level?
- Test: no credentials → 401
- Test: malformed/expired credentials → 401
- Test: valid credentials → passes through
- Is there a rate limit (`@Throttle`)? Test the limit if so.

**Lens 3 — Business logic**
Look at the **service**, not the controller. Every `if`, `throw`, and branch is a test case.

- What is the happy path? What does it return?
- What conditions cause it to throw? Each one is a test.
- Are there ownership/permission checks? (e.g. "can only edit your own resource")
- Does it call other services? What happens if those fail?

**Lens 4 — Side effects**
These are the tests most beginners skip. They're the ones that catch real bugs.

- What DB documents are created/updated/deleted on success?
- Are any tokens issued or revoked?
- Are any sessions invalidated?
- On failure, verify nothing changed (no partial writes).

---

### Step 3 — Determine test order

Tests within a describe block often share state (tokens, created IDs).
Order them so each test can build on the previous:

```
1. Unauthenticated / no credentials cases  (no setup needed)
2. Invalid input cases                     (no setup needed)
3. Happy path                              (creates the state others depend on)
4. Business logic error cases              (use state from happy path)
5. Side effect verifications               (query DB directly)
6. Security cases (reuse, ownership, etc.) (most complex, run last)
```

---

### Step 4 — Write the test file

Structure every spec file like this:

```typescript
describe('METHOD /path (e2e)', () => {
  let app: INestApplication;
  // declare shared state: tokens, created IDs, cookies

  beforeAll(async () => {
    app = await buildTestApp(PORT);
    // do any prerequisite setup (register user, get token, etc.)
  });

  afterAll(async () => {
    await app.close();
  });

  // Group by lens using nested describe blocks
  describe('input validation', () => { ... });
  describe('authentication', () => { ... });
  describe('business logic', () => { ... });
  describe('side effects', () => { ... });
});
```

#### Naming convention for `it()` blocks

Always use the pattern:

```
should [expected behavior] when [condition] → [status code]
```

Examples:

```typescript
it('should reject missing email → 400');
it('should reject wrong password → 401');
it('should create user and return id → 201');
it('should not create refresh token on register');
it('should revoke all sessions after password change');
```

#### Assert status codes for errors, body shape for success

**For error cases: assert only the status code.**

```typescript
// ✅ correct
.expectStatus(401)

// ❌ brittle — error message wording is an implementation detail
.expectStatus(401)
.expectJson({ message: 'Invalid credentials', error: 'Unauthorized', statusCode: 401 })
```

Error message text can change for legitimate reasons (rewording, i18n, refactoring).
A test that breaks because you changed `'Invalid credentials'` to `'Wrong credentials'`
is noise, not signal. The status code is the contract — assert that.

**For success cases: assert the response body shape.**

```typescript
// ✅ correct — the response shape IS the contract for the client
.expectStatus(201)
.expectJsonLike({
  message: 'User registered successfully',
  user: { name: 'Belal', email: 'belal@example.com' },
})
```

One additional reason to avoid asserting error message bodies on auth endpoints
specifically: if your service returns the same message for "email not found" and
"wrong password" (to avoid user enumeration), asserting on that exact string means
a refactor that accidentally splits those messages would still pass the test.
Status code only keeps the test honest.

#### Checking side effects directly in DB

```typescript
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// In beforeAll, get the model:
userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

// In test:
it('should persist user to database', async () => {
  await pactum.spec().post('/auth/register').withBody({...}).expectStatus(201);
  const user = await userModel.findOne({ email: 'test@test.com' });
  expect(user).not.toBeNull();
  expect(user.hash).toBeDefined();       // hash was stored
  expect(user.password).toBeUndefined(); // plaintext was NOT stored
});
```

Using DB models directly in test files is correct and expected for integration tests.
The HTTP response shows what the API promises the client; the DB query verifies what
actually happened internally. Use DB queries for things the response doesn't expose:
hashed passwords, revoked tokens, session state, timestamps. Don't use DB queries
to re-assert things the response already confirmed.

---

### Step 5 — Flag what NOT to test

Tell the user explicitly what to skip to avoid wasted effort:

- Don't test NestJS internals (that `ValidationPipe` works, that `@IsEmail()` rejects bad email — that's the library's job)
- Don't test implementation details (which internal method was called)
- Don't write unit tests for thin CRUD services — no value at this stage
- Don't aim for 100% coverage — cover critical paths and security boundaries

---

## Output format

Always produce in this order for the initial analysis:

1. **The 4-lens table** (confirm with user before coding)
2. **The skeleton structure** (a code block containing nested `describe` blocks and empty `it()` should-statements matching the table)
3. **A note on any side effects that need DB queries to verify**

Do NOT output the full implementation code in the initial step. Only write or generate
the full test code after the user has reviewed the structure and explicitly instructed
you to generate/write the test suite.
