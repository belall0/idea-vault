# Roles & Permissions

## Overview

The platform uses a role-based access control (RBAC) system with four roles. Every user falls into exactly one role.

---

## Roles

### Unauthenticated

A visitor who has not signed in. Can browse public content only. Has no identity in the system.

### Member

A registered and authenticated user. Can submit and manage their own ideas. Cannot access any moderation or administrative tools.

### Moderator

A trusted user with content moderation capabilities. Can manage any idea on the platform and view/suspend user accounts. Cannot modify system configuration or user roles.

### Admin

Full system access. Responsible for platform configuration, user role assignments, and permanent data deletion. Should be assigned sparingly.

---

## Permission Matrix

### Idea Resource

> All ideas are public and go live immediately upon creation. There is no draft state.

| Action             | Unauthenticated | Member | Moderator | Admin |
| ------------------ | :-------------: | :----: | :-------: | :---: |
| View any idea      |       ✅        |   ✅   |    ✅     |  ✅   |
| Create idea        |       ❌        |   ✅   |    ✅     |  ✅   |
| Edit own idea      |       ❌        |   ✅   |    ✅     |  ✅   |
| Delete own idea    |       ❌        |   ✅   |    ✅     |  ✅   |
| Delete any idea    |       ❌        |   ❌   |    ✅     |  ✅   |
| Pin / Feature idea |       ❌        |   ❌   |    ✅     |  ✅   |

### User Resource

> User management is restricted to staff roles (Moderator and Admin) only.
> Members can only manage their own profile.

| Action             | Unauthenticated | Member | Moderator | Admin |
| ------------------ | :-------------: | :----: | :-------: | :---: |
| List all users     |       ❌        |   ❌   |    ✅     |  ✅   |
| View user profile  |       ❌        |   ❌   |    ✅     |  ✅   |
| Edit own profile   |       ❌        |   ✅   |    ✅     |  ✅   |
| Edit any user      |       ❌        |   ❌   |    ❌     |  ✅   |
| Ban / Suspend user |       ❌        |   ❌   |    ✅     |  ✅   |
| Change user role   |       ❌        |   ❌   |    ❌     |  ✅   |
| Delete user        |       ❌        |   ❌   |    ❌     |  ✅   |

---

## Design Decisions

**No one can edit other users' idea content.**
Editing another user's idea violates authorship integrity. If an idea violates platform rules, the correct action is removal — not rewriting.

**Role assignment is admin-only.**
Allowing moderators to promote users would create a privilege escalation vector.

**No draft state.**
Ideas go live immediately upon creation. There is no publish/unpublish flow.

---

## Role Assignment Guidelines

- The **admin** role should be assigned to as few people as possible.
- **Moderators** should be trusted, vetted members of the community.
- New registered users are assigned the **member** role by default.
- **Unauthenticated** is not a stored role — it is the absence of authentication.
