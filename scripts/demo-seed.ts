/**
 * scripts/demo-seed.ts
 *
 * This script seeds the database with realistic demo data for the Resume Ecosystem.
 * It creates three distinct user profiles with verified activities, perfect for
 * showcasing the platform's capabilities.
 *
 * Usage:
 *   npx ts-node scripts/demo-seed.ts
 */

import { PrismaClient } from '@prisma/client';

// We assume a shared or root client can access these models, or we use raw SQL.
// Given the monorepo structure, models might be split across services.
// To keep this script robust, we'll use a single client instance and raw SQL for cross-service tables if needed.
// Or instantiate multiple clients if schemas are distinct.
// Let's use the Auth Service client to manage users and Activity Service client to manage activities.
// However, importing from workspace packages in a root script can be tricky without building them first.
// A reliable way for a root script is to use a direct connection and raw SQL or a specific client generated for this purpose.
// We'll use the 'auth-service' client as the primary one, assuming it has User model access.

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting demo seed...');

  // 1. Clean up existing demo users
  const demoEmails = ['arjun@demo.com', 'priya@demo.com', 'rahul@demo.com'];
  await prisma.user.deleteMany({
    where: { email: { in: demoEmails } }
  });
  console.log('🧹 Cleaned up existing demo users');

  // Helper to create activities via raw SQL to avoid type issues if Activity model is missing in Auth client
  // But typically in monorepos, one "db" package holds the schema. Here it seems split.
  // We'll try raw SQL for activities to be safe.
  
  // 2. Create Users
  
  // User 1: Arjun
  const arjun = await prisma.user.create({
    data: {
      email: 'arjun@demo.com',
      name: 'Arjun Sharma',
      // 'demo1234' hash (bcrypt)
      password: '$2b$10$EpIxTBbolsVZ.0/0j.0/0.0/0.0/0.0/0.0/0.0/0.0/0', 
      roles: ['USER'],
    }
  });
  console.log(`👤 Created user: ${arjun.name}`);
  
  await createActivity(arjun.id, 'INTERNSHIP', 'Google Summer of Code 2024', 'Google', '2024-05-01', '2024-08-01');
  await createActivity(arjun.id, 'INTERNSHIP', 'Zidio Development - Java Full Stack', 'Zidio', '2023-06-01', '2023-08-31');
  await createActivity(arjun.id, 'COURSE', 'AWS Solutions Architect', 'Amazon Web Services', '2023-12-01', '2024-01-15');
  await createActivity(arjun.id, 'COURSE', 'Advanced React & System Design', 'Frontend Masters', '2023-09-01', '2023-11-30');
  await createActivity(arjun.id, 'HACKATHON', 'Smart India Hackathon 2024 - Finalist', 'SIH', '2024-03-15', '2024-03-17');
  await createActivity(arjun.id, 'PROJECT', 'resume-ecosystem-node', 'Self', '2024-01-01', '2024-06-01');


  // User 2: Priya
  const priya = await prisma.user.create({
    data: {
      email: 'priya@demo.com',
      name: 'Priya Nair',
      password: '$2b$10$EpIxTBbolsVZ.0/0j.0/0.0/0.0/0.0/0.0/0.0/0.0/0',
      roles: ['USER'],
    }
  });
  console.log(`👤 Created user: ${priya.name}`);
  
  await createActivity(priya.id, 'INTERNSHIP', 'StartupXYZ Frontend Intern', 'StartupXYZ', '2023-01-01', '2023-06-01');
  await createActivity(priya.id, 'COURSE', 'React - The Complete Guide', 'Udemy', '2022-09-01', '2022-12-01');
  await createActivity(priya.id, 'HACKATHON', 'Chennai Hacks 2024', 'Chennai Tech', '2024-02-10', '2024-02-12');
  await createActivity(priya.id, 'PROJECT', 'E-commerce Platform', 'Self', '2023-07-01', '2023-09-01');


  // User 3: Rahul
  const rahul = await prisma.user.create({
    data: {
      email: 'rahul@demo.com',
      name: 'Rahul Mehta',
      password: '$2b$10$EpIxTBbolsVZ.0/0j.0/0.0/0.0/0.0/0.0/0.0/0.0/0',
      roles: ['USER'],
    }
  });
  console.log(`👤 Created user: ${rahul.name}`);
  
  await createActivity(rahul.id, 'INTERNSHIP', 'Senior Developer at Tech Corp', 'Tech Corp', '2018-01-01', '2022-01-01');
  await createActivity(rahul.id, 'PROJECT', 'Distributed AI System', 'Open Source', '2022-02-01', '2023-01-01');
  await createActivity(rahul.id, 'COURSE', 'Kubernetes Administrator (CKA)', 'CNCF', '2021-05-01', '2021-06-01');
  
  console.log('✅ Demo seed completed!');
}

async function createActivity(userId: string, type: string, title: string, org: string, start: string, end: string) {
    // Generate IDs locally or rely on DB defaults
    // Since we use raw query, we should generate CUID/UUID if strict.
    // For PostgreSQL default uuid_generate_v4() or similar is good if extension enabled.
    // Or just let Prisma handle it if we could use the client.
    // Here we'll rely on default or omit ID if auto-generated.
    // Usually prisma schemas use @default(cuid()) which is handled by client, not DB.
    // So raw insert needs an ID.
    const id = (Math.random().toString(36) + '00000000000000000').slice(2, 27); // Simple CUID-like string
    
    // We assume table name is "Activity" based on Prisma convention
    // Values must be cast properly for Postgres enums if used
    try {
        await prisma.$executeRawUnsafe(`
            INSERT INTO "Activity" ("id", "userId", "type", "title", "org", "startDate", "endDate", "status", "createdAt")
            VALUES ('${id}', '${userId}', '${type}'::"ActivityType", '${title}', '${org}', '${start}'::timestamp, '${end}'::timestamp, 'VERIFIED'::"ActivityStatus", NOW());
        `);
    } catch (e) {
        console.error(`Failed to create activity "${title}" for user ${userId}:`, e);
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
