import { prisma } from "../prisma.js";
import { rebuildForUser } from "../services/rebuilder.js";
import * as jose from "jose";
async function requireUser(req: any, reply: any) {
const token = (req.headers.authorization || "").replace("Bearer ", "");
if (!token) { reply.code(401).send({ error: "No token" }); throw new Error("no token"); }
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "devsecret");
const { payload } = await jose.jwtVerify(token, secret);
return { id: String(payload.sub) };
}
export async function routes(app: any) {
app.get("/resume/me", async (req: any, reply: any) => {
const user = await requireUser(req, reply);
const r = await prisma.resume.findUnique({ where: { userId: user.id }, include: { currentVersion: true } });
if (!r || !r.currentVersion) return { empty: true };
return r.currentVersion;
});
app.post("/resume/rebuild", async (req: any, reply: any) => {
const user = await requireUser(req, reply);
const out = await rebuildForUser(user.id);
return out.version;
});
app.get("/resume/versions", async (req: any, reply: any) => {
const user = await requireUser(req, reply);
const resume = await prisma.resume.findUnique({ where: { userId: user.id } });
if (!resume) return [];
return prisma.resumeVersion.findMany({ where: { resumeId: resume.id }, orderBy: { createdAt: "desc" } });
});
}
