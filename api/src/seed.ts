import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon from 'argon2';

import { AppModule } from './app/app.module';
import { User, UserDocument } from './users/schemas/user.schema';
import { Idea, IdeaDocument } from './ideas/schemas/idea.schema';

const SEED_USERS = [
  {
    name: 'Belal Muhammad',
    email: 'belal@gmail.com',
    password: 'Idea@2026',
    role: 'Admin',
  },
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'password123',
    role: 'Developer',
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'password123',
    role: 'Designer',
  },
  {
    name: 'Carol White',
    email: 'carol@example.com',
    password: 'password123',
    role: 'Product Manager',
  },
];

const SEED_IDEAS = [
  {
    userEmail: 'belal@gmail.com',
    title: 'AI Voice Note Summarizer for Meetings',
    summary:
      'Automatically record, transcribe, and extract actionable items from team meetings.',
    description:
      'An intelligent assistant that connects with Google Meet and Zoom to transcribe discussions in real time. It uses LLMs to highlight decisions, action items, and deadline commitments, seamlessly syncing them into Notion or Jira.',
  },
  {
    userEmail: 'alice@example.com',
    title: 'AI-Powered Recipe & Meal Planner',
    summary:
      'Generate weekly meal plans based on dietary preferences and pantry ingredients.',
    description:
      'A web app that syncs with your smart fridge or input list to generate custom recipes, minimize food waste, and automatically generate grocery delivery lists.',
  },
  {
    userEmail: 'alice@example.com',
    title: 'Open-Source API Rate Limiting Gateway',
    summary:
      'An ultra-fast reverse proxy to protect microservices from traffic spikes.',
    description:
      'Built with Rust and Redis, this API gateway enables granular sliding-window rate limiting, token bucket algorithms, and detailed telemetry dashboards for microservice clusters.',
  },
  {
    userEmail: 'bob@example.com',
    title: 'Developer Workspace Dashboard',
    summary:
      'A unified minimalist desktop widget for GitHub PRs, CI builds, and calendar events.',
    description:
      'Reduces context-switching by aggregating notifications from GitHub, GitLab, Docker Hub, and Google Calendar into a customizable glassmorphic desktop panel.',
  },
  {
    userEmail: 'carol@example.com',
    title: 'Community Micro-Donation Platform',
    summary:
      'Empower local neighborhood projects with small, transparent recurring donations.',
    description:
      'A web application for micro-funding community parks, neighborhood repairs, and local events with real-time budget tracking and milestone updates.',
  },
];

async function seed() {
  const isClean = process.argv.includes('--clean');
  console.log('\n🌱 Starting Database Seeding...');
  if (isClean) {
    console.log(
      '🧹 Clean flag detected: Wiping existing Users and Ideas collections...',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    const ideaModel = app.get<Model<IdeaDocument>>(getModelToken(Idea.name));

    if (isClean) {
      await ideaModel.deleteMany({});
      await userModel.deleteMany({});
      console.log('✅ Cleaned existing data.');
    }

    const createdUserMap = new Map<string, UserDocument>();

    console.log('\n👥 Seeding Users...');
    for (const seedUser of SEED_USERS) {
      let user = await userModel.findOne({ email: seedUser.email }).exec();
      if (!user) {
        const hash = await argon.hash(seedUser.password);
        user = await userModel.create({
          name: seedUser.name,
          email: seedUser.email,
          hash,
        });
      }

      createdUserMap.set(seedUser.email, user);
    }

    console.log('\n💡 Seeding Ideas...');
    let ideasCreatedCount = 0;
    for (const seedIdea of SEED_IDEAS) {
      const user = createdUserMap.get(seedIdea.userEmail);
      if (!user) {
        console.warn(
          `  ⚠️ Could not find user ${seedIdea.userEmail} for idea: "${seedIdea.title}"`,
        );
        continue;
      }

      const existingIdea = await ideaModel
        .findOne({ title: seedIdea.title, userId: user._id })
        .exec();
      if (existingIdea) {
        continue;
      }

      await ideaModel.create({
        title: seedIdea.title,
        summary: seedIdea.summary,
        description: seedIdea.description,
        userId: user._id,
      });
      ideasCreatedCount++;
    }

    console.log('\n==================================================');
    console.log('🎉 Seeding Complete Successfully!');
    console.log(`Total Users Ready: ${SEED_USERS.length}`);
    console.log(`New Ideas Created: ${ideasCreatedCount}`);
    console.log('==================================================\n');
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void seed();
