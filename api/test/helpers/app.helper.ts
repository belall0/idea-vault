import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Connection } from 'mongoose';
import * as pactum from 'pactum';
import { AppModule } from '@/src/app/app.module';

export async function buildTestApp(port: number): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());

  await app.init();
  await app.listen(port);

  // Drop the database before tests run to ensure a clean slate
  const connection = app.get<Connection>(getConnectionToken());
  await connection.dropDatabase();

  // Re-sync all Mongoose model indexes after dropping the DB.
  // Without this, unique constraints (e.g. the email unique index on User)
  // are lost and won't be enforced during the test run.
  for (const model of Object.values(connection.models)) {
    await model.syncIndexes();
  }

  pactum.request.setBaseUrl(`http://localhost:${port}/api`);

  return app;
}
