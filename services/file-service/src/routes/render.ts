import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import PDFDocument from "pdfkit";
import type PDFKit from "pdfkit";

import { prisma } from "@resume/services/prisma";

type RenderBody = {
  resumeVersionId?: string;
};

type NormalisedItem = {
  title: string;
  organization?: string;
  score?: number;
  start?: string | null;
  end?: string | null;
  description?: string;
};

const SECTION_ORDER: Array<{ key: string; label: string }> = [
  { key: "projects", label: "Projects" },
  { key: "experience", label: "Experience" },
  { key: "courses", label: "Courses" },
  { key: "hackathons", label: "Hackathons" }
];

function formatDate(value: unknown): string | null {
  if (!value) return null;
  const asDate = new Date(String(value));
  if (Number.isNaN(asDate.getTime())) {
    return null;
  }
  return asDate.toLocaleDateString();
}

function normaliseDescription(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string").join(" • ");
  }
  return undefined;
}

function normaliseItems(value: unknown): NormalisedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((raw, index) => {
    if (typeof raw === "string") {
      return { title: raw };
    }

    if (raw && typeof raw === "object") {
      const item = raw as Record<string, unknown>;
      const titleCandidate = item.title ?? item.organization ?? `Item ${index + 1}`;

      return {
        title: typeof titleCandidate === "string" ? titleCandidate : String(titleCandidate),
        organization: typeof item.organization === "string" ? item.organization : undefined,
        score: typeof item.score === "number" ? item.score : undefined,
        start: formatDate(item.startDate),
        end: formatDate(item.endDate),
        description: normaliseDescription(item.description ?? item.text)
      };
    }

    return { title: JSON.stringify(raw) };
  });
}

function renderSection(doc: PDFKit.PDFDocument, heading: string, items: NormalisedItem[]): void {
  doc.moveDown(1);
  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(16).text(heading);
  doc.moveDown(0.35);

  if (items.length === 0) {
    doc.fillColor("#64748b").font("Helvetica").fontSize(11).text("No entries yet.");
    return;
  }

  for (const item of items) {
    doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(12).text(item.title, { continued: false });

    if (item.organization) {
      doc.fillColor("#475569").font("Helvetica").fontSize(10).text(item.organization);
    }

    if (item.description) {
      doc.fillColor("#475569").font("Helvetica").fontSize(10).text(item.description, { lineGap: 2 });
    }

    const badges: string[] = [];
    if (typeof item.score === "number") {
      badges.push(`Score +${item.score}`);
    }

    const dates = [item.start, item.end].filter(Boolean).join(" – ");
    if (dates) {
      badges.push(dates);
    }

    if (badges.length > 0) {
      doc.fillColor("#64748b").font("Helvetica").fontSize(9).text(badges.join("   "));
    }

    doc.moveDown(0.6);
  }
}

async function createPdf(version: any): Promise<Buffer> {
  const sections = version.sections ?? {};
  const summary =
    Array.isArray(sections.summary) && sections.summary[0]?.text
      ? String(sections.summary[0].text)
      : "Dynamic resume generated from verified activities.";

  const doc = new PDFDocument({
    size: "A4",
    margin: 56
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const pdfBuffer = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(26).text("Resume Snapshot");
  doc.moveDown(0.4);
  doc.fillColor("#0f172a").font("Helvetica").fontSize(12).text(`Version ${version.id?.slice?.(0, 8) ?? "—"}`);

  doc.moveDown(0.6);
  doc.fillColor("#475569").font("Helvetica").fontSize(11).text(summary, { lineGap: 4 });

  doc.moveDown(0.8);
  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(12).text(`Score: ${typeof version.score === "number" ? version.score : "—"}`);

  for (const section of SECTION_ORDER) {
    const items = normaliseItems(sections[section.key]);
    renderSection(doc, section.label, items);
  }

  doc.end();

  return pdfBuffer;
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

    const pdf = await createPdf(version);

    reply.header("Content-Type", "application/pdf");
    reply.header("Content-Disposition", `inline; filename=resume-${resumeVersionId}.pdf`);
    return reply.send(pdf);
  });
}
