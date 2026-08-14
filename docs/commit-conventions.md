# Commit Message Conventions

IdeaVault enforces strict commit message conventions to maintain a clean, readable, and auditable Git history linked directly to issue/ticket trackers.

---

## Format Specification

Every commit header must follow this exact structure:

```text
<ticket-id>(<type>): <description>
```

```text
  IV-15(feat): add create idea form
  └──┬─┘ └─┬─┘  └────────┬────────┘
     │     │             └─ Description (imperative mood, concise)
     │     └─────────────── Commit Type (feat, fix, refactor, perf, docs, test)
     └───────────────────── Ticket / Issue Identifier
```

---

## Allowed Exceptions

The validator automatically allows standard Git-generated messages:

- **Merge Commits**: Headers starting with `Merge branch`, `Merge tag`, `Merge pull request`, or `Merge remote-tracking branch`.
- **Revert Commits**: Headers starting with `Revert `.

---

## Examples

- `IV-15(feat): add create idea form`
- `IV-2(refactor): remove user roles and administrative navigation`
- `IV-99(fix): resolve race condition in token refresh`

---
