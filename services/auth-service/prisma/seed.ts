import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
const u = await prisma.user.upsert({
where: { email: "admin@example.com" },
update: {},
create: { email: "admin@example.com", name: "Admin", password: "seed:disabled", roles: ["ADMIN"] }
});
console.log("Seeded user", u.email);
}
main().finally(()=>prisma.$disconnect());
