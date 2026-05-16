export class AuthOptions {
  public jwtSecret =
    process.env.JWT_SECRET ?? 'WdzQLKz9JQDG3QgVMDf7GsKwwgTxcZOr8aTcG8LMEyK';
  public expiresIn = 15 * 60; // 15 minutes
  public refreshTokenCookie = 'refreshToken';
  public cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
}
