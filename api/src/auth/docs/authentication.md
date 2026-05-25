# Authentication Architecture

This document serves as the single source of truth for the authentication architecture in this application.

## Overview

The application uses a **JWT + Refresh Token Rotation** architecture.

- **Access Tokens (JWT):** Short-lived, stateless tokens used for accessing protected resources. Issued upon login or refresh.
- **Refresh Tokens:** Long-lived, stateful tokens stored in the database. They are used to obtain a new access token when the current one expires.

## Design Decisions

- **Token Hashing:** We never store raw refresh tokens in plaintext. We store the SHA-256 hash. The raw token is only visible to the user during the initial issuance.
- **Append-Only / No Deletion:** We do not delete old refresh token rows. When a token is rotated, it is marked as revoked but kept for audit trails and reuse detection.
- **Session Families:** A "session" is not a single token, but rather a _family_ of tokens linked by a common `sessionId`. Every time a user logs in, a new session family is created.

## Flows

### 1. Login / Registration

Upon successful authentication, the system generates:

- A new `sessionId` (the family ID).
- A raw refresh token.
- A hash of the refresh token, which is stored in the database alongside the user ID, session ID, and expiration date.
- The server returns an access token and sets the raw refresh token in an HTTP-only cookie.

### 2. Refresh Token Rotation

When the client needs a new access token, it sends the raw refresh token (via cookie):

1. **Validation:** The system hashes the incoming raw token and looks it up.
2. **Reuse Detection Check:** If the token exists but is marked as `revokedAt !== null`, someone is replaying a consumed token. This is a compromise signal. The system immediately revokes the **entire session family** (by setting `revokedAt` on all tokens with that `sessionId`).
3. **Rotation:** If valid and active, the system atomically:
   - Marks the old token as consumed (`revokedAt = Date.now()`).
   - Links it to a new token hash (`replacedByTokenHash`).
   - Issues a new token in the _same_ session family.
4. **Return:** The new access token is returned, and the new raw refresh token replaces the old cookie.

### 3. Logout

Logout involves finding the current refresh token's family (`sessionId`) and revoking all active tokens within that family. Even if the token has expired or is already revoked, the logout is considered successful.

## Future Considerations / Missing Flows

The following flows are currently missing and will be implemented in the future:

- **Email Verification:** Sending an OTP or verification link upon registration and ensuring the user cannot access certain features until verified.
- **Password Change Flow:** Requesting to change the password and updating it (requires user to be logged in).
- **Password Reset Flow:** Requesting a reset link via email, validating the reset token, and securely updating the password.

## Edge Cases and Security

- **Compromised Sessions:** Handled via the reuse detection mechanism in the refresh flow. If a legitimate user and an attacker both try to use the same token, the second attempt will trigger a family-wide revocation, cutting off both parties and forcing re-authentication.
- **Concurrent Requests:** The `findOneAndUpdate` atomic operation ensures that concurrent refresh requests with the same token won't result in duplicate active tokens. The second request will fail to match the query (`revokedAt: null`), triggering the reuse detection logic.
