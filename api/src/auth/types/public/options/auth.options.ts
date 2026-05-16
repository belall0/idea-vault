export class AuthOptions {
  public jwtSecret =
    process.env.JWT_SECRET ?? 'WdzQLKz9JQDG3QgVMDf7GsKwwgTxcZOr8aTcG8LMEyK';
  public expiresIn = 15 * 60; // 15 minutes
  public refreshTokenCookie = 'refreshToken';
  public cookieOptions = {
    httpOnly: true, // JS cannot read this cookie
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict' as const, // No cross-origin requests
    path: '/auth/refresh', // Cookie only sent to this path
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
}
