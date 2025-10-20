import { prisma } from "../prisma.js";
import { sign, verify } from "../utils/jwt.js";
import { hash, compare } from "../utils/pw.js";
export async function routes(app: any) {
app.post("/auth/register", async (req: any, reply: any) => {
const { email, name, password } = req.body || {};
const exists = await prisma.user.findUnique({ where: { email } });
if (exists) return reply.code(409).send({ error: "User exists" });
const user = await prisma.user.create({ data: { email, name, password: await hash(password), roles: ["USER"] } });
return { id: user.id, email: user.email };
});
app.post("/auth/token", async (req: any, reply: any) => {
const { email, password } = req.body || {};
const user = await prisma.user.findUnique({ where: { email } });
if (!user || !(await compare(password, user.password || ""))) return reply.code(401).send({ error: "Invalid creds" });
const token = await sign({ sub: user.id, email: user.email, roles: user.roles, name: user.name });
return { token, user: { id: user.id, email: user.email, name: user.name, roles: user.roles } };
});
app.get("/auth/me", async (req: any, reply: any) => {
const auth = (req.headers.authorization || "").replace("Bearer ", "");
if (!auth) return reply.code(401).send({ error: "No token" });
try {
const payload = await verify(auth);
return payload;
} catch (e) { return reply.code(401).send({ error: "Invalid token" }); }
});
}
