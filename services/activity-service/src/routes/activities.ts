import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import type { Activity } from "@prisma/client";
import { prisma } from "@resume/services/prisma";
import { producer } from "@resume/services/kafka";
import { jaccard, Topics, type ActivityType, type ActivityStatus } from "common-lib";
import { requireUser } from "../utils/auth.js";

const ACTIVITY_TYPES = new Set<ActivityType>(["INTERNSHIP", "COURSE", "HACKATHON", "PROJECT"]);
const ACTIVITY_STATUS = new Set<ActivityStatus>(["PENDING", "VERIFIED", "REJECTED"]);

function toDate(input?: string | null): Date | null {
  if (!input) return null;
  const value = new Date(input);
  return Number.isNaN(value.getTime()) ? null : value;
}

type CreateActivityBody = {
  type?: ActivityType;
  title?: string;
  org?: string;
  startDate?: string;
  endDate?: string;
  source?: string;
  metadata?: unknown;
};

type ArtifactBody = {
  url?: string;
  sha256Hex?: string;
  kind?: "CERT" | "BADGE" | "PR" | "SUBMISSION";
};

export async function routes(app: FastifyInstance): Promise<void> {
  app.post("/activities", async (req: FastifyRequest<{ Body: CreateActivityBody }>, reply: FastifyReply) => {
    const user = await requireUser(req, reply);
    const body = req.body ?? {};

    if (!body.type || !ACTIVITY_TYPES.has(body.type)) {
      return reply.code(400).send({ error: "Invalid or missing activity type" });
    }

    if (!body.title || body.title.trim().length < 3) {
      return reply.code(400).send({ error: "Title must be at least 3 characters" });
    }

    const normalizedTitle = body.title.trim();

    const start = toDate(body.startDate);
    const end = toDate(body.endDate);
    if (start && end && start > end) {
      return reply.code(400).send({ error: "Start date must be before end date" });
    }

    const recent = (await prisma.activity.findMany({
      where: { userId: user.id, type: body.type },
      orderBy: { createdAt: "desc" },
      take: 20
    })) as Activity[];

    const orgNormalized = body.org?.toLowerCase();

    const duplicate = recent.find((entry: Activity) => {
      const sameOrg = orgNormalized ? (entry.org ?? "").toLowerCase() === orgNormalized : true;
      return sameOrg && jaccard(entry.title, normalizedTitle) >= 0.7;
    });

    if (duplicate) {
      return reply.code(409).send({ error: "Activity already recorded", duplicateId: duplicate.id });
    }

    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        type: body.type,
        title: normalizedTitle,
        org: body.org?.trim() ?? null,
        startDate: start,
        endDate: end,
        source: body.source?.toUpperCase() ?? "MANUAL",
        metadata: body.metadata ?? {}
      }
    });

    await producer.send({
      topic: Topics.ActivityCreated,
      messages: [
        {
          key: activity.userId,
          value: JSON.stringify({ activityId: activity.id, userId: activity.userId })
        }
      ]
    });

    return reply.code(201).send(activity);
  });

  app.get("/activities", async (req: FastifyRequest<{ Querystring: { type?: ActivityType; status?: ActivityStatus } }>, reply: FastifyReply) => {
    const user = await requireUser(req, reply);
    const filters: Record<string, unknown> = { userId: user.id };

    if (req.query?.type && ACTIVITY_TYPES.has(req.query.type)) {
      filters.type = req.query.type;
    }

    if (req.query?.status && ACTIVITY_STATUS.has(req.query.status)) {
      filters.status = req.query.status;
    }

    const activities = await prisma.activity.findMany({
      where: filters,
      orderBy: { createdAt: "desc" }
    });

    return reply.send(activities);
  });

  app.get("/activities/:id", async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = await requireUser(req, reply);
    const id = req.params.id;

    const activity = await prisma.activity.findFirst({
      where: { id, userId: user.id },
      include: { artifacts: true, verifications: true }
    });

    if (!activity) {
      return reply.code(404).send({ error: "Activity not found" });
    }

    return reply.send(activity);
  });

  app.post("/activities/:id/artifacts", async (req: FastifyRequest<{ Params: { id: string }; Body: ArtifactBody }>, reply: FastifyReply) => {
    const user = await requireUser(req, reply);
    const id = req.params.id;
    const body = req.body ?? {};

    if (!body.url || !body.sha256Hex || !body.kind) {
      return reply.code(400).send({ error: "Artifact url, sha256Hex and kind are required" });
    }

    const activity = await prisma.activity.findFirst({
      where: { id, userId: user.id }
    });

    if (!activity) {
      return reply.code(404).send({ error: "Activity not found" });
    }

    const artifact = await prisma.achievementArtifact.create({
      data: {
        activityId: id,
        url: body.url,
        sha256Hex: body.sha256Hex,
        kind: body.kind
      }
    });

    return reply.code(201).send(artifact);
  });
}
