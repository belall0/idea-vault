import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import * as pactum from 'pactum';
import * as argon from 'argon2';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from '@/src/app/app.module';
import { User, UserDocument } from '@/src/users/schemas/user.schema';

jest
  .spyOn(ThrottlerGuard.prototype, 'canActivate')
  .mockImplementation(async () => Promise.resolve(true));

describe('Users e2e', () => {
  let app: INestApplication;
  const port = 3002;
  let userModel: Model<UserDocument>;

  const testUser = {
    name: 'Users Module Tester',
    email: 'users-test@example.com',
    password: 'Password123!',
  };
  let validAccessToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const connection = moduleRef.get<Connection>(getConnectionToken());
    await connection.dropDatabase();

    for (const model of Object.values(connection.models)) {
      await model.syncIndexes();
    }

    app = moduleRef.createNestApplication();

    app.use(helmet());
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.use(cookieParser());

    await app.init();
    await app.listen(port);

    pactum.request.setBaseUrl(`http://localhost:${port}/api`);

    userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    // Seed test user
    const hash = await argon.hash(testUser.password);
    const created = await userModel.create({
      name: testUser.name,
      email: testUser.email,
      hash,
    });
    testUserId = created._id.toString();

    // Login to obtain valid access token
    await pactum
      .spec()
      .post('/auth/login')
      .withBody({
        email: testUser.email,
        password: testUser.password,
      })
      .expectStatus(200)
      .expect((ctx) => {
        validAccessToken = (ctx.res.body as { access_token: string })
          .access_token;
      });
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /users/me', () => {
    describe('authentication', () => {
      it('should reject request when Authorization header is missing → 401', async () => {
        await pactum.spec().get('/users/me').expectStatus(401);
      });

      it('should reject request when Bearer token is malformed → 401', async () => {
        await pactum
          .spec()
          .get('/users/me')
          .withHeaders('Authorization', 'Bearer invalid.token.string')
          .expectStatus(401);
      });

      it('should reject request when Bearer token scheme is invalid → 401', async () => {
        await pactum
          .spec()
          .get('/users/me')
          .withHeaders('Authorization', `Basic ${validAccessToken}`)
          .expectStatus(401);
      });
    });

    describe('business logic', () => {
      it('should return current authenticated user profile → 200', async () => {
        await pactum
          .spec()
          .get('/users/me')
          .withBearerToken(validAccessToken)
          .expectStatus(200)
          .expectJsonLike({
            id: testUserId,
            name: testUser.name,
            email: testUser.email,
          });
      });
    });

    describe('side effects', () => {
      it('should not mutate user data in database after profile retrieval', async () => {
        const userBefore = await userModel.findById(testUserId);
        expect(userBefore).not.toBeNull();
        const updatedAtBefore = (userBefore as unknown as { updatedAt?: Date })
          .updatedAt;

        await pactum
          .spec()
          .get('/users/me')
          .withBearerToken(validAccessToken)
          .expectStatus(200);

        const userAfter = await userModel.findById(testUserId);
        expect(userAfter).not.toBeNull();
        const updatedAtAfter = (userAfter as unknown as { updatedAt?: Date })
          .updatedAt;

        if (updatedAtBefore && updatedAtAfter) {
          expect(updatedAtAfter.getTime()).toBe(updatedAtBefore.getTime());
        }
      });

      it('should ensure default admin account exists in database on application bootstrap', async () => {
        const defaultAdmin = await userModel.findOne({
          email: 'belal@gmail.com',
        });
        expect(defaultAdmin).not.toBeNull();
        expect(defaultAdmin!.name).toBe('Belal Muhammad');
        expect(defaultAdmin!.hash).toBeDefined();
      });
    });
  });
});
