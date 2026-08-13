import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model, Types } from 'mongoose';
import * as pactum from 'pactum';
import * as argon from 'argon2';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from '@/src/app/app.module';
import { User, UserDocument } from '@/src/users/schemas/user.schema';
import { Idea, IdeaDocument } from '@/src/ideas/schemas/idea.schema';

jest
  .spyOn(ThrottlerGuard.prototype, 'canActivate')
  .mockImplementation(async () => Promise.resolve(true));

describe('Ideas e2e', () => {
  let app: INestApplication;
  const port = 3003;
  let userModel: Model<UserDocument>;
  let ideaModel: Model<IdeaDocument>;

  const userA = {
    name: 'Idea Owner A',
    email: 'idea-owner-a@example.com',
    password: 'Password123!',
  };

  const userB = {
    name: 'Idea Owner B',
    email: 'idea-owner-b@example.com',
    password: 'Password123!',
  };

  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;

  let createdIdeaId: string;

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
    ideaModel = app.get<Model<IdeaDocument>>(getModelToken(Idea.name));

    // Seed test users
    const hashA = await argon.hash(userA.password);
    const createdUserA = await userModel.create({
      name: userA.name,
      email: userA.email,
      hash: hashA,
    });
    userAId = createdUserA._id.toString();

    const hashB = await argon.hash(userB.password);
    const createdUserB = await userModel.create({
      name: userB.name,
      email: userB.email,
      hash: hashB,
    });
    userBId = createdUserB._id.toString();

    // Login user A
    await pactum
      .spec()
      .post('/auth/login')
      .withBody({ email: userA.email, password: userA.password })
      .expectStatus(200)
      .expect((ctx) => {
        userAToken = (ctx.res.body as { access_token: string }).access_token;
      });

    // Login user B
    await pactum
      .spec()
      .post('/auth/login')
      .withBody({ email: userB.email, password: userB.password })
      .expectStatus(200)
      .expect((ctx) => {
        userBToken = (ctx.res.body as { access_token: string }).access_token;
      });
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /ideas', () => {
    const validIdeaDto = {
      title: 'AI Code Assistant',
      summary: 'An intelligent coding assistant for NestJS applications',
      description:
        'A comprehensive platform that helps developers write better code, generate unit tests, and perform e2e test validation.',
    };

    describe('authentication', () => {
      it('should reject request when Authorization header is missing → 401', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withBody(validIdeaDto)
          .expectStatus(401);
      });

      it('should reject request when Bearer token is malformed → 401', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withHeaders('Authorization', 'Bearer invalid.jwt.token')
          .withBody(validIdeaDto)
          .expectStatus(401);
      });

      it('should reject request when Bearer scheme is wrong → 401', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withHeaders('Authorization', `Basic ${userAToken}`)
          .withBody(validIdeaDto)
          .expectStatus(401);
      });
    });

    describe('input validation', () => {
      it('should reject request when title is missing → 400', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withBearerToken(userAToken)
          .withBody({
            summary: validIdeaDto.summary,
            description: validIdeaDto.description,
          })
          .expectStatus(400);
      });

      it('should reject request when summary is missing → 400', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withBearerToken(userAToken)
          .withBody({
            title: validIdeaDto.title,
            description: validIdeaDto.description,
          })
          .expectStatus(400);
      });

      it('should reject request when description is missing → 400', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withBearerToken(userAToken)
          .withBody({
            title: validIdeaDto.title,
            summary: validIdeaDto.summary,
          })
          .expectStatus(400);
      });

      it('should reject request when title exceeds 100 characters → 400', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withBearerToken(userAToken)
          .withBody({
            ...validIdeaDto,
            title: 'a'.repeat(101),
          })
          .expectStatus(400);
      });

      it('should reject request when summary exceeds 300 characters → 400', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withBearerToken(userAToken)
          .withBody({
            ...validIdeaDto,
            summary: 'a'.repeat(301),
          })
          .expectStatus(400);
      });

      it('should reject request when description exceeds 600 characters → 400', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withBearerToken(userAToken)
          .withBody({
            ...validIdeaDto,
            description: 'a'.repeat(601),
          })
          .expectStatus(400);
      });
    });

    describe('business logic', () => {
      it('should create an idea and return 201 with created idea payload → 201', async () => {
        await pactum
          .spec()
          .post('/ideas')
          .withBearerToken(userAToken)
          .withBody(validIdeaDto)
          .expectStatus(201)
          .expectJsonLike({
            title: validIdeaDto.title,
            summary: validIdeaDto.summary,
            description: validIdeaDto.description,
            userId: userAId,
          })
          .expect((ctx) => {
            createdIdeaId = (ctx.res.body as { _id: string })._id;
            expect(createdIdeaId).toBeDefined();
          });
      });
    });

    describe('side effects', () => {
      it('should persist created idea in MongoDB database', async () => {
        const persistedIdea = await ideaModel.findById(createdIdeaId);
        expect(persistedIdea).not.toBeNull();
        expect(persistedIdea?.title).toBe(validIdeaDto.title);
        expect(persistedIdea?.userId.toString()).toBe(userAId);
      });

      it('should not persist idea in MongoDB database when input validation fails', async () => {
        const initialCount = await ideaModel.countDocuments();
        await pactum
          .spec()
          .post('/ideas')
          .withBearerToken(userAToken)
          .withBody({ title: '' })
          .expectStatus(400);

        const newCount = await ideaModel.countDocuments();
        expect(newCount).toBe(initialCount);
      });
    });
  });

  describe('GET /ideas/me', () => {
    describe('authentication', () => {
      it('should reject request when Authorization header is missing → 401', async () => {
        await pactum.spec().get('/ideas/me').expectStatus(401);
      });

      it('should reject request when Bearer token is invalid → 401', async () => {
        await pactum
          .spec()
          .get('/ideas/me')
          .withHeaders('Authorization', 'Bearer invalid.token')
          .expectStatus(401);
      });
    });

    describe('business logic', () => {
      it('should return list of ideas belonging to authenticated user → 200', async () => {
        await pactum
          .spec()
          .get('/ideas/me')
          .withBearerToken(userAToken)
          .expectStatus(200)
          .expectJsonLike([
            {
              _id: createdIdeaId,
              title: 'AI Code Assistant',
              userId: userAId,
            },
          ]);
      });

      it('should return empty array when user has created no ideas → 200', async () => {
        await pactum
          .spec()
          .get('/ideas/me')
          .withBearerToken(userBToken)
          .expectStatus(200)
          .expectJson([]);
      });
    });

    describe('side effects', () => {
      it('should not mutate database state on profile ideas retrieval', async () => {
        const countBefore = await ideaModel.countDocuments();
        await pactum
          .spec()
          .get('/ideas/me')
          .withBearerToken(userAToken)
          .expectStatus(200);
        const countAfter = await ideaModel.countDocuments();
        expect(countAfter).toBe(countBefore);
      });
    });
  });

  describe('GET /ideas', () => {
    describe('authentication', () => {
      it('should allow public access without authentication token → 200', async () => {
        await pactum.spec().get('/ideas').expectStatus(200);
      });
    });

    describe('business logic', () => {
      it('should return all ideas across all users when no filter is provided → 200', async () => {
        await pactum
          .spec()
          .get('/ideas')
          .expectStatus(200)
          .expectJsonLike([
            {
              _id: createdIdeaId,
              userId: userAId,
            },
          ]);
      });

      it('should return ideas filtered by userId query parameter → 200', async () => {
        await pactum
          .spec()
          .get('/ideas')
          .withQueryParams('userId', userAId)
          .expectStatus(200)
          .expectJsonLike([
            {
              _id: createdIdeaId,
              userId: userAId,
            },
          ]);
      });

      it('should return empty array when filtering by userId with no ideas → 200', async () => {
        await pactum
          .spec()
          .get('/ideas')
          .withQueryParams('userId', userBId)
          .expectStatus(200)
          .expectJson([]);
      });
    });

    describe('side effects', () => {
      it('should not mutate database state on get all ideas', async () => {
        const countBefore = await ideaModel.countDocuments();
        await pactum.spec().get('/ideas').expectStatus(200);
        const countAfter = await ideaModel.countDocuments();
        expect(countAfter).toBe(countBefore);
      });
    });
  });

  describe('GET /ideas/:id', () => {
    describe('business logic', () => {
      it('should return single idea by ID → 200', async () => {
        await pactum
          .spec()
          .get(`/ideas/${createdIdeaId}`)
          .expectStatus(200)
          .expectJsonLike({
            _id: createdIdeaId,
            title: 'AI Code Assistant',
            userId: userAId,
          });
      });

      it('should return 404 when idea ID does not exist → 404', async () => {
        const nonExistentId = new Types.ObjectId().toString();
        await pactum.spec().get(`/ideas/${nonExistentId}`).expectStatus(404);
      });
    });

    describe('side effects', () => {
      it('should not mutate database state on get idea by ID', async () => {
        const countBefore = await ideaModel.countDocuments();
        await pactum.spec().get(`/ideas/${createdIdeaId}`).expectStatus(200);
        const countAfter = await ideaModel.countDocuments();
        expect(countAfter).toBe(countBefore);
      });
    });
  });

  describe('PUT /ideas/:id', () => {
    const updateDto = {
      title: 'Updated AI Code Assistant',
      summary: 'An updated summary for the coding assistant',
    };

    describe('authentication', () => {
      it('should reject request when Authorization header is missing → 401', async () => {
        await pactum
          .spec()
          .put(`/ideas/${createdIdeaId}`)
          .withBody(updateDto)
          .expectStatus(401);
      });

      it('should reject request when Bearer token is malformed → 401', async () => {
        await pactum
          .spec()
          .put(`/ideas/${createdIdeaId}`)
          .withHeaders('Authorization', 'Bearer invalid.token')
          .withBody(updateDto)
          .expectStatus(401);
      });
    });

    describe('input validation', () => {
      it('should reject request when updated title exceeds 100 characters → 400', async () => {
        await pactum
          .spec()
          .put(`/ideas/${createdIdeaId}`)
          .withBearerToken(userAToken)
          .withBody({ title: 'a'.repeat(101) })
          .expectStatus(400);
      });
    });

    describe('business logic', () => {
      it('should update idea owned by authenticated user → 200', async () => {
        await pactum
          .spec()
          .put(`/ideas/${createdIdeaId}`)
          .withBearerToken(userAToken)
          .withBody(updateDto)
          .expectStatus(200)
          .expectJsonLike({
            _id: createdIdeaId,
            title: updateDto.title,
            summary: updateDto.summary,
            userId: userAId,
          });
      });

      it("should return 404 when user attempts to update another user's idea → 404", async () => {
        await pactum
          .spec()
          .put(`/ideas/${createdIdeaId}`)
          .withBearerToken(userBToken)
          .withBody({ title: 'Hacked Title' })
          .expectStatus(404);
      });

      it('should return 404 when idea ID does not exist → 404', async () => {
        const nonExistentId = new Types.ObjectId().toString();
        await pactum
          .spec()
          .put(`/ideas/${nonExistentId}`)
          .withBearerToken(userAToken)
          .withBody(updateDto)
          .expectStatus(404);
      });
    });

    describe('side effects', () => {
      it('should reflect updated fields in database after successful update', async () => {
        const updatedDoc = await ideaModel.findById(createdIdeaId);
        expect(updatedDoc).not.toBeNull();
        expect(updatedDoc?.title).toBe(updateDto.title);
        expect(updatedDoc?.summary).toBe(updateDto.summary);
      });

      it('should not modify target idea in database when unauthorized user attempts update', async () => {
        const docBefore = await ideaModel.findById(createdIdeaId);

        await pactum
          .spec()
          .put(`/ideas/${createdIdeaId}`)
          .withBearerToken(userBToken)
          .withBody({ title: 'Unauthorized Modification' })
          .expectStatus(404);

        const docAfter = await ideaModel.findById(createdIdeaId);
        expect(docAfter?.title).toBe(docBefore?.title);
      });
    });
  });

  describe('DELETE /ideas/:id', () => {
    let ideaToDeleteId: string;

    beforeAll(async () => {
      // Create a temporary idea for deletion tests
      const created = await ideaModel.create({
        title: 'Temporary Idea',
        summary: 'Idea to be deleted',
        description: 'Will be deleted in e2e tests',
        userId: new Types.ObjectId(userAId),
      });
      ideaToDeleteId = created._id.toString();
    });

    describe('authentication', () => {
      it('should reject request when Authorization header is missing → 401', async () => {
        await pactum
          .spec()
          .delete(`/ideas/${ideaToDeleteId}`)
          .expectStatus(401);
      });

      it('should reject request when Bearer token is malformed → 401', async () => {
        await pactum
          .spec()
          .delete(`/ideas/${ideaToDeleteId}`)
          .withHeaders('Authorization', 'Bearer invalid.token')
          .expectStatus(401);
      });
    });

    describe('business logic', () => {
      it("should return 404 when user attempts to delete another user's idea → 404", async () => {
        await pactum
          .spec()
          .delete(`/ideas/${ideaToDeleteId}`)
          .withBearerToken(userBToken)
          .expectStatus(404);
      });

      it('should return 404 when idea ID does not exist → 404', async () => {
        const nonExistentId = new Types.ObjectId().toString();
        await pactum
          .spec()
          .delete(`/ideas/${nonExistentId}`)
          .withBearerToken(userAToken)
          .expectStatus(404);
      });

      it('should delete idea owned by authenticated user → 200', async () => {
        await pactum
          .spec()
          .delete(`/ideas/${ideaToDeleteId}`)
          .withBearerToken(userAToken)
          .expectStatus(200)
          .expectJson({ deleted: true });
      });
    });

    describe('side effects', () => {
      it('should remove deleted idea document from database', async () => {
        const deletedDoc = await ideaModel.findById(ideaToDeleteId);
        expect(deletedDoc).toBeNull();
      });

      it('should leave target idea in database when unauthorized user attempts deletion', async () => {
        // Create an idea for user A
        const targetIdea = await ideaModel.create({
          title: 'Protected Idea',
          summary: 'Should survive deletion attempt by User B',
          description: 'Protected description',
          userId: new Types.ObjectId(userAId),
        });
        const targetId = targetIdea._id.toString();

        await pactum
          .spec()
          .delete(`/ideas/${targetId}`)
          .withBearerToken(userBToken)
          .expectStatus(404);

        const survivingDoc = await ideaModel.findById(targetId);
        expect(survivingDoc).not.toBeNull();
        expect(survivingDoc?.title).toBe('Protected Idea');
      });
    });
  });
});
