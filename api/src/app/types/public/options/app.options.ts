export class AppOptions {
  public dbUrl =
    process.env.NODE_ENV === 'test'
      ? (process.env.TEST_DB_URL ?? 'mongodb://localhost:27017/ideavault-test')
      : (process.env.DB_URL ?? 'mongodb://localhost:27017/ideavault');
}
