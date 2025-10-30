import type { Activity, Prisma } from "@prisma/client";

import { prisma } from "@resume/services/prisma";
import { rankScore, topK, type ActivityType } from "common-lib";

const DAY_IN_MS = 86_400_000;

type RankedActivity = {
  id: string;
  type: ActivityType;
  title: string;
  org: string | null;
  startDate: Date | null;
  endDate: Date | null;
  metadata: Record<string, unknown> | null;
  score: number;
};

function asRanked(activity: Activity, now: number): RankedActivity {
  const endDate = activity.endDate ? new Date(activity.endDate) : null;
  const daysSinceEnd = endDate ? Math.max(0, Math.floor((now - endDate.getTime()) / DAY_IN_MS)) : 0;

  const metadata = (activity.metadata ?? {}) as Record<string, unknown>;
  const base = Number(metadata.baseScore ?? 50);
  const trust = Number(metadata.issuerTrust ?? 75);
  const impact = Number(metadata.impact ?? 10);

  const score = rankScore(base, trust, impact, daysSinceEnd);

  return {
    id: activity.id,
    type: activity.type,
    title: activity.title,
    org: activity.org ?? null,
    startDate: activity.startDate ? new Date(activity.startDate) : null,
    endDate,
    metadata,
    score
  };
}

function sectionFor(type: ActivityType, mapped: RankedActivity[], take: number) {
  return topK(mapped.filter((item) => item.type === type), take, (item) => item.score).map((item) => ({
    id: item.id,
    title: item.title,
    organization: item.org,
    startDate: item.startDate,
    endDate: item.endDate,
    score: item.score
  }));
}

export async function rebuildForUser(userId: string) {
  const activities = (await prisma.activity.findMany({
    where: { userId, status: "VERIFIED" },
    orderBy: { endDate: "desc" }
  })) as Activity[];

  const now = Date.now();
  const ranked: RankedActivity[] = activities.map((activity: Activity) => asRanked(activity, now));

  const sections = {
    summary: [
      {
        text: "Dynamic resume generated from verified activities."
      }
    ],
    experience: sectionFor("INTERNSHIP", ranked, 3),
    projects: sectionFor("PROJECT", ranked, 4),
    courses: sectionFor("COURSE", ranked, 4),
    hackathons: sectionFor("HACKATHON", ranked, 3)
  } as const;

  const totalScore = Math.round(ranked.reduce<number>((sum, item) => sum + item.score, 0));

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const resume = await tx.resume.upsert({
      where: { userId },
      update: {},
      create: { userId, visibility: "PRIVATE" }
    });

    const version = await tx.resumeVersion.create({
      data: {
        resumeId: resume.id,
        score: totalScore,
        sections
      }
    });

    const updatedResume = await tx.resume.update({
      where: { id: resume.id },
      data: { currentVersionId: version.id }
    });

    return { resume: updatedResume, version };
  });

  return result;
}
