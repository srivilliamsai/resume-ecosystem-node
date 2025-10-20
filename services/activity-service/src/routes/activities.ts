import { prisma } from "../prisma.js";
import { jaccard, Topics } from "@common/index.js";
import { producer } from "../kafka.js";
import { requireUser } from "../utils/auth.js";
export async function routes(app: any) {
app.post("/activities", async (req: any, reply: any) => {
const user = await requireUser(req, reply);
const { type, title, org, startDate, endDate, source, metadata } = req.body || {};
const recent = await prisma.activity.findMany({ where: { userId: user.id, type }, orderBy: { createdAt: "desc" }, take: 20 });
const dup = recent.find(r => jaccard(r.title, title) >= 0.7 && (org ? (r.org||"")===org : true));
if (dup) return reply.code(409).send({ error: "Duplicate", dupId: dup.id });
const activity = await prisma.activity.create({ data: { userId: user.id, type, title, org, startDate: startDate ? new Date(startDate): null, endDate: endDate ? new Date(endDate): null, source: source||"MANUAL", metadata }});
await producer.send({ topic: Topics.ActivityCreated, messages: [{ key: activity.userId, value: JSON.stringify({ activityId: activity.id, userId: activity.userId }) }] });
return activity;
});
app.get("/activities", async (req: any, reply: any) => {
const user = await requireUser(req, reply);
const { type, status } = req.query as any;
const items = await prisma.activity.findMany({ where: { userId: user.id, ...(type?{type}:{}) , ...(status?{status}:{}) }, orderBy: { createdAt: "desc" } });
return items;
});
app.get("/activities/:id", async (req: any, reply: any) => {
const user = await requireUser(req, reply);
const id = req.params.id;
const item = await prisma.activity.findFirst({ where: { id, userId: user.id }, include: { artifacts: true, verifications: true } });
if (!item) return reply.code(404).send({ error: "Not found" });
return item;
});
app.post("/activities/:id/artifacts", async (req: any, reply: any) => {
const user = await requireUser(req, reply);
const id = req.params.id;
const { url, sha256Hex, kind } = req.body || {};
const act = await prisma.activity.findFirst({ where: { id, userId: user.id } });
if (!act) return reply.code(404).send({ error: "Not found" });
const artifact = await prisma.achievementArtifact.create({ data: { activityId: id, url, sha256Hex, kind } });
return artifact;
});
}
