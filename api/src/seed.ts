import { faker } from '@faker-js/faker';
import * as argon from 'argon2';
import mongoose from 'mongoose';

// Default to local MongoDB if DB_URL is not provided
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/ideavault';

async function seed() {
  console.log(`Connecting to database: ${DB_URL}`);
  await mongoose.connect(DB_URL);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not established');
  }

  // Clear existing data to ensure a clean seed
  await db.collection('users').deleteMany({});
  await db.collection('ideas').deleteMany({});
  console.log('Cleared existing users and ideas');

  const defaultPassword = 'Password123!';
  const hash = await argon.hash(defaultPassword);

  console.log('Generating seed data...');

  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Create User
    const userResult = await db.collection('users').insertOne({
      name,
      email,
      hash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const userId = userResult.insertedId;
    const ideaCount = faker.number.int({ min: 3, max: 8 });

    console.log(`- Created User: ${email} (${name})`);
    console.log(`  -> Generating ${ideaCount} ideas...`);

    const ideas: any[] = [];
    for (let j = 0; j < ideaCount; j++) {
      ideas.push({
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        summary: faker.lorem.sentence({ min: 10, max: 15 }),
        description: faker.lorem.paragraphs(2),
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (ideas.length > 0) {
      await db.collection('ideas').insertMany(ideas);
    }
  }

  console.log('\nSeed completed successfully!');
  console.log(`Note: All users have the default password: ${defaultPassword}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
