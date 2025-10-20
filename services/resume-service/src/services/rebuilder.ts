import { prisma } from "../prisma.js";
import { rankScore, topK } from "@common/index.js";
export async function rebuildForUser(userId: string) {
const acts = await prisma.activity.findMany({ where: { userId, status: "VERIFIED" }, orderBy: { endDate: "desc" } });
const now = Date.now();
const mapped = acts.map(a => {
const days = a.endDate ? Math.floor((now - new Date(a.endDate).getTime()) / (1000360024)) : 0;
const base = 50; const trust = 80; const impact = 10;
const score = rankScore(base, trust, impact, days);
return { ...a, score };
});
const sections = {
experience: topK(mapped.filter(a=>a.type==="INTERNSHIP"), 3, a=>a.score),
projects: topK(mapped.filter(a=>a.type==="PROJECT"), 4, a=>a.score),
courses: topK(mapped.filter(a=>a.type==="COURSE"), 4, a=>a.score),
hackathons: topK(mapped.filter(a=>a.type==="HACKATHON"), 3, a=>a.score),
summary: [{ text: "Dynamic resume generated from verified activities." }]
};
let resume = await prisma.resume.upsert({
where: { userId },
update: {},
create: { userId, visibility: "PRIVATE" }
});
const totalScore = Math.round(mapped.reduce((s,a)=>s+a.score,0));
const version = await prisma.resumeVersion.create({ data: { resumeId: resume.id, score: totalScore, sections } });
resume = await prisma.resume.update({ where: { id: resume.id }, data: { currentVersionId: version.id } });
return { resume, version };
}
