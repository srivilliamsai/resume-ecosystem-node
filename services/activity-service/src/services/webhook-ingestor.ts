import type { ActivityType } from "common-lib";

import { prisma } from "@resume/services/prisma";
import { producer } from "@resume/services/kafka";
import { Topics } from "common-lib";

type WebhookEvent = {
  source: string;
  receivedAt?: string;
  payload?: Record<string, any>;
};

function mapSourceToActivity(event: WebhookEvent): { type: ActivityType; title: string; org: string | null } {
  const payload = event.payload ?? {};
  switch (event.source) {
    case "github":
      return {
        type: "PROJECT",
        title: payload.projectTitle || payload.repository || payload.repoName || "GitHub Project",
        org: payload.organization || payload.owner || "GitHub"
      };
    case "hackathon":
      return {
        type: "HACKATHON",
        title: payload.eventName || payload.hackathon || "Hackathon Participation",
        org: payload.organizer || payload.host || null
      };
    case "course":
      return {
        type: "COURSE",
        title: payload.courseTitle || payload.name || "Online Course",
        org: payload.provider || payload.platform || null
      };
    default:
      return {
        type: "PROJECT",
        title: payload.title || `Activity from ${event.source}`,
        org: payload.org || payload.organization || null
      };
  }
}

function parseDate(value?: string | null, fallback?: Date): Date | null {
  if (!value) return fallback ?? null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback ?? null : date;
}

export async function ingestWebhookEvent(event: WebhookEvent): Promise<void> {
  const payload = event.payload ?? {};
  const userId = payload.userId as string | undefined;

  if (!userId) {
    return;
  }

  const mapping = mapSourceToActivity(event);
  const receivedAt = parseDate(event.receivedAt, new Date());

  const startDate = parseDate(payload.startedAt || payload.startDate || payload.assignedAt || null);
  const endDate = parseDate(payload.completedAt || payload.finishedAt || payload.submittedAt || null, receivedAt ?? undefined);

  const existing = await prisma.activity.findFirst({
    where: {
      userId,
      type: mapping.type,
      title: mapping.title,
      source: event.source.toUpperCase()
    }
  });

  if (existing) {
    return;
  }

  const activity = await prisma.activity.create({
    data: {
      userId,
      type: mapping.type,
      title: mapping.title,
      org: mapping.org,
      startDate,
      endDate,
      status: "PENDING",
      source: event.source.toUpperCase(),
      metadata: {
        ...payload,
        ingestedAt: new Date().toISOString()
      }
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
}
