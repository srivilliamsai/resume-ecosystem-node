import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function shutdown() {
  await prisma.$disconnect().catch(() => undefined);
}

process.once("beforeExit", shutdown);
process.once("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});
process.once("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});
