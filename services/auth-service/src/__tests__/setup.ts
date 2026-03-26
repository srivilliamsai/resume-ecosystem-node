// services/auth-service/src/__tests__/setup.ts
import { PrismaClient } from '@prisma/client';

// Global prisma client for tests
const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure connection is established
  await prisma.$connect();
});

afterEach(async () => {
  // Clean up database between tests
  // Delete in order to respect foreign key constraints if they exist
  // For auth service, usually just User needs cleaning
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Export prisma for use in tests if needed
export { prisma };
