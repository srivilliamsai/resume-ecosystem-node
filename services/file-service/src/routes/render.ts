import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import puppeteer from "puppeteer";

import { prisma } from "@resume/services/prisma";

type RenderBody = {
  resumeVersionId?: string;
};

function htmlTemplate(version: any): string {
  const sections = version.sections ?? {};

  const formatDate = (value: unknown): string | undefined => {
    if (!value) return undefined;
    const date = new Date(value as string);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }
    return date.toLocaleDateString();
  };

  const renderList = (items: any[] | undefined): string => {
    if (!Array.isArray(items) || items.length === 0) {
      return "<li>No entries yet.</li>";
    }

    return items
      .map((item) => {
        const title = item.title || item.organization || "Item";
        const score = typeof item.score === "number" ? item.score : 0;
        const start = formatDate(item.startDate);
        const end = formatDate(item.endDate);
        const dates = [start, end].filter(Boolean).join(" – ");
        return `<li><strong>${title}</strong>${dates ? ` <span class="dates">${dates}</span>` : ""}<span class="score">Score: ${score}</span></li>`;
      })
      .join("");
  };

  const summary = Array.isArray(sections.summary) && sections.summary[0]?.text ? sections.summary[0].text : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Resume</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #111; }
      h1 { margin: 0 0 12px; font-size: 28px; }
      h2 { margin: 24px 0 12px; font-size: 20px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
      ul { list-style: none; padding: 0; margin: 0; }
      li { margin: 8px 0; }
      .score { float: right; font-size: 12px; color: #444; }
      .summary { margin-bottom: 16px; }
      .dates { margin-left: 8px; font-size: 12px; color: #666; }
    </style>
  </head>
  <body>
    <h1>Resume Snapshot</h1>
    <p class="summary">${summary}</p>
    <h2>Projects</h2>
    <ul>${renderList(sections.projects)}</ul>
    <h2>Experience</h2>
    <ul>${renderList(sections.experience)}</ul>
    <h2>Courses</h2>
    <ul>${renderList(sections.courses)}</ul>
    <h2>Hackathons</h2>
    <ul>${renderList(sections.hackathons)}</ul>
  </body>
</html>`;
}

export async function routes(app: FastifyInstance): Promise<void> {
  app.post("/render", async (req: FastifyRequest<{ Body: RenderBody }>, reply: FastifyReply) => {
    const { resumeVersionId } = req.body ?? {};

    if (!resumeVersionId) {
      return reply.code(400).send({ error: "resumeVersionId is required" });
    }

    const version = await prisma.resumeVersion.findUnique({ where: { id: resumeVersionId } });
    if (!version) {
      return reply.code(404).send({ error: "Resume version not found" });
    }

    const html = htmlTemplate(version);

    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({ format: "A4", printBackground: true });

      reply.header("Content-Type", "application/pdf");
      reply.header("Content-Disposition", `inline; filename=resume-${resumeVersionId}.pdf`);
      return reply.send(pdf);
    } finally {
      await browser.close();
    }
  });
}
