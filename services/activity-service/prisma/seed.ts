import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
await prisma.trustedIssuer.upsert({
where: { domain: "partner.example.com" },
update: {},
create: { domain: "partner.example.com", publicKey: "dummy", methods: "HASH,SIGNATURE" }
});
console.log("Seeded TrustedIssuer");
}
main().finally(()=>prisma.$disconnect());
