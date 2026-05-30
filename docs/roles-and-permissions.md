# Roles & Permissions

## Overview

The platform uses a role-based access control (RBAC) system with five roles. Every user falls into exactly one role.

---

## Roles

### Unauthenticated

A visitor who has not signed in. Can browse public ideas only. Has no identity in the system.

### Member

A registered and authenticated user. Can create and manage their own ideas, comment, vote, and save favorites. Cannot access any moderation or administrative tools.

### Moderator

A trusted member with content moderation capabilities. Can remove any idea or comment, manage the report queue, and temporarily suspend users. Cannot ban users, manage roles, or reverse their own decisions.

### Admin

A staff role responsible for user safety. Can permanently ban users and restore content removed by moderators. Cannot assign or revoke roles.

### Super-Admin

The highest privilege level. A bootstrap role assigned outside the normal flow. Can assign and revoke moderator and admin roles, and override any decision made by a moderator or admin. Should be held by as few people as possible.

---

## Permission Matrix

### Idea Resource

> Ideas support three states: draft (visible to owner only), published (visible to all), and private (visible to owner only, permanently). Only published ideas appear in public listings.

| Action                       | Unauthenticated | Member | Moderator | Admin | Super-Admin |
| ---------------------------- | :-------------: | :----: | :-------: | :---: | :---------: |
| View published ideas         |       ✅        |   ✅   |    ✅     |  ✅   |     ✅      |
| View own draft/private ideas |       ❌        |   ✅   |    ❌     |  ❌   |     ❌      |
| Create idea                  |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Edit own idea                |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Delete own idea              |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Remove any idea              |       ❌        |   ❌   |    ✅     |  ✅   |     ✅      |
| Restore removed idea         |       ❌        |   ❌   |    ❌     |  ✅   |     ✅      |
| Upvote / Downvote idea       |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Save / Unsave idea           |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Report idea                  |       ❌        |   ✅   |    ❌     |  ❌   |     ❌      |

### Comment Resource

| Action                  | Unauthenticated | Member | Moderator | Admin | Super-Admin |
| ----------------------- | :-------------: | :----: | :-------: | :---: | :---------: |
| View comments           |       ✅        |   ✅   |    ✅     |  ✅   |     ✅      |
| Post comment            |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Reply to comment        |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Edit own comment        |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Delete own comment      |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Remove any comment      |       ❌        |   ❌   |    ✅     |  ✅   |     ✅      |
| Restore removed comment |       ❌        |   ❌   |    ❌     |  ✅   |     ✅      |
| Report comment          |       ❌        |   ✅   |    ❌     |  ❌   |     ❌      |

### User Resource

> Members can view any public profile. Elevated actions are restricted to staff roles.

| Action                   | Unauthenticated | Member | Moderator | Admin | Super-Admin |
| ------------------------ | :-------------: | :----: | :-------: | :---: | :---------: |
| View public profile      |       ✅        |   ✅   |    ✅     |  ✅   |     ✅      |
| Edit own profile         |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| View all users (list)    |       ❌        |   ❌   |    ✅     |  ✅   |     ✅      |
| Suspend user (temporary) |       ❌        |   ❌   |    ✅     |  ❌   |     ✅      |
| Unsuspend user           |       ❌        |   ❌   |    ❌     |  ❌   |     ✅      |
| Ban user (permanent)     |       ❌        |   ❌   |    ❌     |  ✅   |     ✅      |
| Unban user               |       ❌        |   ❌   |    ❌     |  ❌   |     ✅      |
| Delete own account       |       ❌        |   ✅   |    ✅     |  ✅   |     ✅      |
| Assign / Revoke roles    |       ❌        |   ❌   |    ❌     |  ❌   |     ✅      |

### Report Resource

| Action            | Unauthenticated | Member | Moderator | Admin | Super-Admin |
| ----------------- | :-------------: | :----: | :-------: | :---: | :---------: |
| Submit report     |       ❌        |   ✅   |    ❌     |  ❌   |     ❌      |
| View report queue |       ❌        |   ❌   |    ✅     |  ✅   |     ✅      |
| Dismiss report    |       ❌        |   ❌   |    ✅     |  ✅   |     ✅      |
| Resolve report    |       ❌        |   ❌   |    ✅     |  ✅   |     ✅      |

---

## Design Decisions

**No one can edit another user's content.**
Editing another user's idea or comment violates authorship integrity. If content violates platform rules, the correct action is removal — not rewriting.

**Moderator decisions are final at their level.**
Moderators cannot reverse their own actions. Only admins and super-admins can restore content a moderator removed.

**Ban and suspend are separate powers held by different roles.**
Suspension (temporary) is a high-frequency, low-stakes action — moderators handle it. Banning (permanent) is high-stakes and irreversible — admins handle it. This prevents a moderator from permanently removing a user from the platform.

**Moderators and members cannot report content.**
Moderators act on reports; they don't generate them. Allowing moderators to report would create a redundant flow — they should simply act directly.

**Role assignment is super-admin only.**
Allowing admins to promote users would create a privilege escalation vector where an admin could create new admins without oversight.

**Draft state exists; not all ideas are public.**
Ideas support draft, published, and private states. Only published ideas appear in public listings. Moderators cannot see draft or private ideas — those are owner-only.

---

## Role Assignment Guidelines

- **Super-admin** is a bootstrap role. It should be seeded directly in the database and held by as few people as possible.
- **Admin** should be assigned sparingly to trusted staff responsible for user safety decisions.
- **Moderators** should be vetted, trusted members of the community.
- New registered users are assigned the **member** role by default.
- **Unauthenticated** is not a stored role — it is the absence of authentication.
