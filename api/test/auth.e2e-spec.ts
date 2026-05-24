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
});
