// services/activity-service/src/__tests__/setup.ts
import { PrismaClient } from '@prisma/client';

// Global prisma client for tests
const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure connection is established
  await prisma.$connect();
});

afterEach(async () => {
  // Clean up database between tests
  // Be careful with cascading deletes if models are related
  await prisma.activity.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Export prisma for use in tests if needed
export { prisma };
