import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as pactum from 'pactum';
import * as argon from 'argon2';

import { buildTestApp } from './helpers/app.helper';
import { User, UserDocument } from '@/src/users/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '@/src/auth/schemas/refresh-token.schema';
import { RegisterDto } from '@/src/auth/types';

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
});
