import { prisma } from "../prisma.js";
import puppeteer from "puppeteer";
function htmlTemplate(data: any) {
const s = data.sections || {};
const list = (arr:any) => (arr||[]).map(x=><li><b>${x.title||x.org||"Item"}</b> — score ${x.score||0}</li>).join("");
return `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:Arial;margin:24px;color:#111}
h1{margin:0 0 12px}
h2{margin:16px 0 8px}
</style></head><body>
<h1>Resume</h1> <p>${s.summary?.[0]?.text||""}</p> <h2>Projects</h2><ul>${list(s.projects)}</ul> <h2>Experience</h2><ul>${list(s.experience)}</ul> <h2>Courses</h2><ul>${list(s.courses)}</ul> <h2>Hackathons</h2><ul>${list(s.hackathons)}</ul> </body></html>`; }
export async function routes(app: any) {
app.post("/render", async (req: any, reply: any) => {
const { resumeVersionId } = req.body || {};
const v = await prisma.resumeVersion.findUnique({ where: { id: resumeVersionId } });
if (!v) return reply.code(404).send({ error: "Version not found" });
const html = htmlTemplate(v);
const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
const pdf = await page.pdf({ format: "A4" });
await browser.close();
reply.header("Content-Type", "application/pdf");
reply.send(pdf);
});
}
