import { JwtUser } from "@common/index.js";
import * as jose from "jose";
export async function requireUser(req: any, reply: any): Promise<JwtUser> {
const token = (req.headers.authorization || "").replace("Bearer ", "");
if (!token) { reply.code(401).send({ error: "No token" }); throw new Error("no token"); }
try {
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "devsecret");
const { payload } = await jose.jwtVerify(token, secret);
return { id: String(payload.sub), email: String(payload.email), name: String(payload.name || ""), roles: (payload.roles as string[]) || [] };
} catch { reply.code(401).send({ error: "Invalid token" }); throw new Error("bad token"); }
}
