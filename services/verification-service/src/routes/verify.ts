import { prisma } from "../prisma.js";
import { verifyCache } from "../services/cache.js";
import { producer } from "../kafka.js";
import { Topics } from "@common/index.js";
export async function routes(app: any) {
app.get("/verify/status/:activityId", async (req: any) => {
const id = req.params.activityId;
const cached = verifyCache.get(id);
if (cached) return { cached: true, ...cached };
const last = await prisma.verificationCase.findFirst({ where: { activityId: id }, orderBy: { verifiedAt: "desc" } });
return { cached: false, last };
});
app.post("/verify/:activityId/hash", async (req: any, reply: any) => {
const { activityId } = req.params as any;
const { expected, actual, userId } = req.body || {};
const ok = expected === actual;
const v = await prisma.verificationCase.create({
data: { activityId, method: "HASH", status: ok ? "OK" : "FAILED", logs: { expected, actual }, verifiedAt: new Date() }
});
verifyCache.set(activityId, v);
if (ok) {
await prisma.activity.update({ where: { id: activityId }, data: { status: "VERIFIED" } });
await producer.send({ topic: Topics.ActivityVerified, messages: [{ key: userId, value: JSON.stringify({ activityId, userId, status: "OK" }) }] });
}
return v;
});
app.post("/verify/:activityId/issuer-signature", async (req: any) => {
const { activityId } = req.params as any;
const { signature, payload, userId } = req.body || {};
// demo: accept any non-empty signature
const ok = !!signature && !!payload;
const v = await prisma.verificationCase.create({
data: { activityId, method: "WEBHOOK", status: ok ? "OK" : "FAILED", logs: { signature, payload }, verifiedAt: new Date() }
});
verifyCache.set(activityId, v);
if (ok) {
await prisma.activity.update({ where: { id: activityId }, data: { status: "VERIFIED" } });
await producer.send({ topic: Topics.ActivityVerified, messages: [{ key: userId, value: JSON.stringify({ activityId, userId, status: "OK" }) }] });
}
return v;
});
}
