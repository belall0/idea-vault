import { INestApplication } from '@nestjs/common';
import { buildTestApp } from './helpers/app.helper';

describe('Auth e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildTestApp(3001);
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------------------
  // Register
  // ------------------------------
  describe('POST /auth/register', () => {
    it('should register a new user → 201', () => {});
  });
});
