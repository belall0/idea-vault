import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from '@/src/app/app.module';

describe('AppModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const connection = moduleFixture.get<Connection>(getConnectionToken());
    await connection.dropDatabase();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should compile and boot the Nest application successfully', () => {
    expect(app).toBeDefined();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
