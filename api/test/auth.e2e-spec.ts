import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash } from 'crypto';
import * as pactum from 'pactum';
import * as argon from 'argon2';
import { ThrottlerGuard } from '@nestjs/throttler';

import { buildTestApp } from './helpers/app.helper';
import { User, UserDocument } from '@/src/users/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '@/src/auth/schemas/refresh-token.schema';
import { RegisterDto } from '@/src/auth/types';

jest
  .spyOn(ThrottlerGuard.prototype, 'canActivate')
  .mockImplementation(async () => Promise.resolve(true));

describe('Auth e2e', () => {
  let app: INestApplication;
  let userModel: Model<UserDocument>;
  let refreshTokenModel: Model<RefreshTokenDocument>;

  beforeAll(async () => {
    app = await buildTestApp(3001);
    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    refreshTokenModel = app.get<Model<RefreshTokenDocument>>(
      getModelToken(RefreshToken.name),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    const validRegisterDto: RegisterDto = {
      name: 'Belal Muhammad',
      email: 'belal@example.com',
      password: 'Password123!',
    };

    describe('input validation', () => {
      it('should reject registration when name is missing → 400', async () => {
        await pactum
          .spec()
          .post('/auth/register')
          .withBody({
            email: validRegisterDto.email,
            password: validRegisterDto.password,
          })
          .expectStatus(400);
      });

      it('should reject registration when email is invalid → 400', async () => {
        await pactum
          .spec()
          .post('/auth/register')
          .withBody({
            ...validRegisterDto,
            email: 'invalid-email-format',
          })
          .expectStatus(400);
      });

      it('should reject registration when password is weak → 400', async () => {
        await pactum
          .spec()
          .post('/auth/register')
          .withBody({
            ...validRegisterDto,
            password: '123',
          })
          .expectStatus(400);
      });
    });

    describe('business logic', () => {
      it('should register a new user and return sanitized details → 201', async () => {
        await pactum
          .spec()
          .post('/auth/register')
          .withBody(validRegisterDto)
          .expectStatus(201)
          .expectJsonLike({
            message: 'User registered successfully',
            user: {
              name: validRegisterDto.name,
              email: validRegisterDto.email,
            },
          });
      });

      it('should reject registration with a conflict error if email is already in use → 409', async () => {
        await pactum
          .spec()
          .post('/auth/register')
          .withBody({
            name: 'Another User',
            email: validRegisterDto.email, // duplicate email
            password: 'AnotherPassword123!',
          })
          .expectStatus(409);
      });
    });

    describe('side effects', () => {
      it('should persist user with a hashed password and not plaintext in DB', async () => {
        const persistedUser = await userModel.findOne({
          email: validRegisterDto.email,
        });

        expect(persistedUser).not.toBeNull();
        expect(persistedUser!.name).toBe(validRegisterDto.name);

        // Assert security side effects
        expect(persistedUser!.hash).toBeDefined();
        const matchesPlaintext = await argon.verify(
          persistedUser!.hash,
          validRegisterDto.password,
        );
        expect(matchesPlaintext).toBe(true);
        expect(persistedUser).not.toHaveProperty('password');
      });

      it('should not create any refresh tokens or sessions on registration', async () => {
        const persistedUser = await userModel.findOne({
          email: validRegisterDto.email,
        });
        const tokens = await refreshTokenModel.find({
          userId: persistedUser!._id,
        });
        expect(tokens.length).toBe(0);
      });

      it('should not persist any user in DB on validation failure', async () => {
        const invalidEmail = 'failed-side-effect@example.com';

        await pactum
          .spec()
          .post('/auth/register')
          .withBody({
            name: 'Failed User',
            email: invalidEmail,
            password: '123', // Weak password → 400 Bad Request
          })
          .expectStatus(400);

        const persistedUser = await userModel.findOne({ email: invalidEmail });
        expect(persistedUser).toBeNull();
      });
    });
  });

  describe('POST /auth/login', () => {
    const loginUser = {
      name: 'Login Tester',
      email: 'login-test@example.com',
      password: 'Password123!',
    };

    beforeAll(async () => {
      // Seed the database with a user for login testing
      const hash = await argon.hash(loginUser.password);
      await userModel.create({
        name: loginUser.name,
        email: loginUser.email,
        hash,
      });
    });

    describe('input validation', () => {
      it('should reject login when email is missing → 400', async () => {
        await pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: loginUser.password,
          })
          .expectStatus(400);
      });

      it('should reject login when email format is invalid → 400', async () => {
        await pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'invalid-email',
            password: loginUser.password,
          })
          .expectStatus(400);
      });

      it('should reject login when password is missing → 400', async () => {
        await pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: loginUser.email,
          })
          .expectStatus(400);
      });
    });

    describe('business logic', () => {
      it('should reject login when email does not exist → 401', async () => {
        await pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'nonexistent@example.com',
            password: loginUser.password,
          })
          .expectStatus(401);
      });

      it('should reject login when password is incorrect → 401', async () => {
        await pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: loginUser.email,
            password: 'wrongpassword',
          })
          .expectStatus(401);
      });

      it('should login user, return access token and set refresh token cookie → 200', async () => {
        await pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: loginUser.email,
            password: loginUser.password,
          })
          .expectStatus(200)
          .expect((ctx) => {
            const body = ctx.res.body as { access_token: string };
            expect(body.access_token).toBeDefined();
            expect(typeof body.access_token).toBe('string');

            const setCookie = ctx.res.headers['set-cookie'];
            expect(setCookie).toBeDefined();
            expect(setCookie![0]).toContain('refreshToken=');
          });
      });
    });

    describe('side effects', () => {
      it('should persist a new refresh token record associated with the user session in the DB', async () => {
        // Clear all refresh tokens for this user first to have a clean slate
        const user = await userModel.findOne({ email: loginUser.email });
        expect(user).not.toBeNull();
        await refreshTokenModel.deleteMany({ userId: user!._id });

        // Perform login
        await pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: loginUser.email,
            password: loginUser.password,
          })
          .expectStatus(200);

        // Verify the DB side effect
        const tokens = await refreshTokenModel.find({ userId: user!._id });
        expect(tokens.length).toBe(1);
        expect(tokens[0].revokedAt).toBeNull();
      });

      it('should not create any refresh token records in the DB on login failure', async () => {
        const user = await userModel.findOne({ email: loginUser.email });
        expect(user).not.toBeNull();

        // Count tokens before failure
        const initialCount = await refreshTokenModel.countDocuments({
          userId: user!._id,
        });

        // Attempt login with wrong password
        await pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: loginUser.email,
            password: 'wrongpassword',
          })
          .expectStatus(401);

        // Verify counts are unchanged
        const finalCount = await refreshTokenModel.countDocuments({
          userId: user!._id,
        });
        expect(finalCount).toBe(initialCount);
      });
    });
  });

  describe('POST /auth/refresh', () => {
    const refreshUser = {
      name: 'Refresh Tester',
      email: 'refresh-test@example.com',
      password: 'Password123!',
    };
    let userId: string;

    const getValidSession = async (): Promise<{
      rawRefreshToken: string;
      accessToken: string;
    }> => {
      let rawRefreshToken = '';
      let accessToken = '';

      await pactum
        .spec()
        .post('/auth/login')
        .withBody({
          email: refreshUser.email,
          password: refreshUser.password,
        })
        .expectStatus(200)
        .expect((ctx) => {
          accessToken = (ctx.res.body as { access_token: string }).access_token;
          const setCookie = ctx.res.headers['set-cookie'];
          if (setCookie && setCookie[0]) {
            const match = setCookie[0].match(/refreshToken=([^;]+)/);
            if (match) {
              rawRefreshToken = match[1];
            }
          }
        });

      return { rawRefreshToken, accessToken };
    };

    beforeAll(async () => {
      const hash = await argon.hash(refreshUser.password);
      const user = await userModel.create({
        name: refreshUser.name,
        email: refreshUser.email,
        hash,
      });
      userId = user._id.toString();
    });

    describe('input validation', () => {
      it('should reject refresh when refresh token cookie is missing → 401', async () => {
        await pactum.spec().post('/auth/refresh').expectStatus(401);
      });
    });

    describe('business logic', () => {
      it('should rotate refresh token and return new access token → 200', async () => {
        const { rawRefreshToken } = await getValidSession();

        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', `refreshToken=${rawRefreshToken}`)
          .expectStatus(200)
          .expect((ctx) => {
            const body = ctx.res.body as { access_token: string };
            expect(body.access_token).toBeDefined();
            expect(typeof body.access_token).toBe('string');

            const setCookie = ctx.res.headers['set-cookie'];
            expect(setCookie).toBeDefined();
            expect(setCookie![0]).toContain('refreshToken=');
          });
      });

      it('should reject refresh when token is not found in DB → 401', async () => {
        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', 'refreshToken=nonexistenttoken123')
          .expectStatus(401);
      });

      it('should reject refresh when token is expired in DB → 401', async () => {
        const expiredRawToken = 'expiredtokenraw123';
        const expiredHash = createHash('sha256')
          .update(expiredRawToken)
          .digest('hex');

        await refreshTokenModel.create({
          tokenHash: expiredHash,
          userId: new Types.ObjectId(userId),
          sessionId: 'some-session-id',
          expiresAt: new Date(Date.now() - 10000), // 10s in the past
          revokedAt: null,
          replacedByTokenHash: null,
        });

        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', `refreshToken=${expiredRawToken}`)
          .expectStatus(401);
      });

      it('should reject refresh and revoke entire session family when token is reused → 401', async () => {
        const { rawRefreshToken: firstRawToken } = await getValidSession();

        // Consume the token once to get the second token
        let secondRawToken = '';
        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', `refreshToken=${firstRawToken}`)
          .expectStatus(200)
          .expect((ctx) => {
            const setCookie = ctx.res.headers['set-cookie'];
            const match = setCookie![0].match(/refreshToken=([^;]+)/);
            if (match) {
              secondRawToken = match[1];
            }
          });

        const firstHash = createHash('sha256')
          .update(firstRawToken)
          .digest('hex');
        const firstRecord = await refreshTokenModel.findOne({
          tokenHash: firstHash,
        });
        const _sessionId = firstRecord!.sessionId;

        // Verify second token is active before reuse
        const secondHash = createHash('sha256')
          .update(secondRawToken)
          .digest('hex');
        const secondRecordBefore = await refreshTokenModel.findOne({
          tokenHash: secondHash,
        });
        expect(secondRecordBefore!.revokedAt).toBeNull();

        // Reuse the consumed first token!
        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', `refreshToken=${firstRawToken}`)
          .expectStatus(401);

        // Side effects: Verify that the second token in the session family has been revoked too!
        const secondRecordAfter = await refreshTokenModel.findOne({
          tokenHash: secondHash,
        });
        expect(secondRecordAfter!.revokedAt).not.toBeNull();
      });
    });

    describe('side effects', () => {
      it('should mark the old token as consumed and persist a new linked token in DB', async () => {
        const { rawRefreshToken } = await getValidSession();
        const oldHash = createHash('sha256')
          .update(rawRefreshToken)
          .digest('hex');

        const oldRecordBefore = await refreshTokenModel.findOne({
          tokenHash: oldHash,
        });
        expect(oldRecordBefore).not.toBeNull();
        expect(oldRecordBefore!.revokedAt).toBeNull();
        const sessionId = oldRecordBefore!.sessionId;

        let newRawRefreshToken = '';
        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', `refreshToken=${rawRefreshToken}`)
          .expectStatus(200)
          .expect((ctx) => {
            const setCookie = ctx.res.headers['set-cookie'];
            const match = setCookie![0].match(/refreshToken=([^;]+)/);
            if (match) {
              newRawRefreshToken = match[1];
            }
          });

        const oldRecordAfter = await refreshTokenModel.findOne({
          tokenHash: oldHash,
        });
        expect(oldRecordAfter!.revokedAt).not.toBeNull();
        const newHash = createHash('sha256')
          .update(newRawRefreshToken)
          .digest('hex');
        expect(oldRecordAfter!.replacedByTokenHash).toBe(newHash);

        const newRecord = await refreshTokenModel.findOne({
          tokenHash: newHash,
        });
        expect(newRecord).not.toBeNull();
        expect(newRecord!.revokedAt).toBeNull();
        expect(newRecord!.sessionId).toBe(sessionId);
        expect(newRecord!.userId.toString()).toBe(userId);
      });

      it('should immediately revoke all active tokens sharing the same sessionId in DB', async () => {
        const { rawRefreshToken: firstRawToken } = await getValidSession();

        // Rotate once
        let secondRawToken = '';
        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', `refreshToken=${firstRawToken}`)
          .expectStatus(200)
          .expect((ctx) => {
            const setCookie = ctx.res.headers['set-cookie'];
            const match = setCookie![0].match(/refreshToken=([^;]+)/);
            if (match) {
              secondRawToken = match[1];
            }
          });

        const secondHash = createHash('sha256')
          .update(secondRawToken)
          .digest('hex');

        // Reuse the first (already consumed) token to trigger compromise response
        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', `refreshToken=${firstRawToken}`)
          .expectStatus(401);

        // Verify the entire family is now revoked
        const secondRecord = await refreshTokenModel.findOne({
          tokenHash: secondHash,
        });
        expect(secondRecord!.revokedAt).not.toBeNull();
      });

      it('should not persist any new tokens or alter unrelated sessions in DB on failure', async () => {
        const initialCount = await refreshTokenModel.countDocuments();

        await pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders('Cookie', 'refreshToken=nonexistenttoken123')
          .expectStatus(401);

        const finalCount = await refreshTokenModel.countDocuments();
        expect(finalCount).toBe(initialCount);
      });
    });
  });

  describe('POST /auth/logout', () => {
    const logoutUser = {
      name: 'Logout Tester',
      email: 'logout-test@example.com',
      password: 'Password123!',
    };
    let _userId: string;

    const getValidSession = async (): Promise<{
      rawRefreshToken: string;
      accessToken: string;
    }> => {
      let rawRefreshToken = '';
      let accessToken = '';

      await pactum
        .spec()
        .post('/auth/login')
        .withBody({
          email: logoutUser.email,
          password: logoutUser.password,
        })
        .expectStatus(200)
        .expect((ctx) => {
          accessToken = (ctx.res.body as { access_token: string }).access_token;
          const setCookie = ctx.res.headers['set-cookie'];
          if (setCookie && setCookie[0]) {
            const match = setCookie[0].match(/refreshToken=([^;]+)/);
            if (match) {
              rawRefreshToken = match[1];
            }
          }
        });

      return { rawRefreshToken, accessToken };
    };

    beforeAll(async () => {
      const hash = await argon.hash(logoutUser.password);
      const user = await userModel.create({
        name: logoutUser.name,
        email: logoutUser.email,
        hash,
      });
      _userId = user._id.toString();
    });

    describe('authentication', () => {
      it('should allow logout even without JWT bearer token → 200', async () => {
        await pactum
          .spec()
          .post('/auth/logout')
          .expectStatus(200)
          .expectJson({ success: true });
      });
    });

    describe('business logic', () => {
      it('should clear refresh token cookie and return success on happy path → 200', async () => {
        const { rawRefreshToken } = await getValidSession();

        await pactum
          .spec()
          .post('/auth/logout')
          .withHeaders('Cookie', `refreshToken=${rawRefreshToken}`)
          .expectStatus(200)
          .expectJson({ success: true })
          .expect((ctx) => {
            const setCookie = ctx.res.headers['set-cookie'];
            expect(setCookie).toBeDefined();
            expect(setCookie![0]).toContain('refreshToken=');
            expect(setCookie![0]).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);
          });
      });

      it('should succeed and clear cookie even if cookie is missing → 200', async () => {
        await pactum
          .spec()
          .post('/auth/logout')
          .expectStatus(200)
          .expectJson({ success: true })
          .expect((ctx) => {
            const setCookie = ctx.res.headers['set-cookie'];
            expect(setCookie).toBeDefined();
            expect(setCookie![0]).toContain('refreshToken=');
            expect(setCookie![0]).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);
          });
      });

      it('should succeed and clear cookie even if token is invalid or expired → 200', async () => {
        await pactum
          .spec()
          .post('/auth/logout')
          .withHeaders('Cookie', 'refreshToken=invalidtoken123')
          .expectStatus(200)
          .expectJson({ success: true })
          .expect((ctx) => {
            const setCookie = ctx.res.headers['set-cookie'];
            expect(setCookie).toBeDefined();
            expect(setCookie![0]).toContain('refreshToken=');
            expect(setCookie![0]).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);
          });
      });
    });

    describe('side effects', () => {
      it('should revoke the entire session family in DB on valid logout', async () => {
        const { rawRefreshToken } = await getValidSession();
        const hash = createHash('sha256').update(rawRefreshToken).digest('hex');

        const recordBefore = await refreshTokenModel.findOne({
          tokenHash: hash,
        });
        expect(recordBefore).not.toBeNull();
        expect(recordBefore!.revokedAt).toBeNull();

        await pactum
          .spec()
          .post('/auth/logout')
          .withHeaders('Cookie', `refreshToken=${rawRefreshToken}`)
          .expectStatus(200);

        const recordAfter = await refreshTokenModel.findOne({
          tokenHash: hash,
        });
        expect(recordAfter).not.toBeNull();
        expect(recordAfter!.revokedAt).not.toBeNull();
      });

      it('should not alter other sessions in DB when logging out with an invalid token', async () => {
        const { rawRefreshToken } = await getValidSession();
        const hash = createHash('sha256').update(rawRefreshToken).digest('hex');

        // Logout with a different/invalid token
        await pactum
          .spec()
          .post('/auth/logout')
          .withHeaders('Cookie', 'refreshToken=some-other-invalid-token')
          .expectStatus(200);

        // Active session should remain active
        const record = await refreshTokenModel.findOne({ tokenHash: hash });
        expect(record).not.toBeNull();
        expect(record!.revokedAt).toBeNull();
      });
    });
  });
});
