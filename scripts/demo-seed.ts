// scripts/demo-seed.ts
// ─────────────────────────────────────────────────────────────────────────────
// Demo seed script for Resume Ecosystem
//
// Creates 3 realistic user profiles with 10+ activities each, verified
// statuses, verification cases, achievement artifacts, and published resumes
// so the app looks impressive immediately on first launch.
//
// Usage:
//   npx ts-node scripts/demo-seed.ts
//   # or via npm script:
//   npm run demo
//
// Prerequisites:
//   - PostgreSQL running (via docker compose)
//   - Prisma migrations applied (npm run migrate)
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(8).toString("hex");
  return salt + ":" + crypto.pbkdf2Sync(pw, salt, 10000, 32, "sha256").toString("hex");
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

function cuid(): string {
  // Simple cuid-like ID for deterministic demo data
  return "demo" + crypto.randomBytes(12).toString("hex");
}

// ─── Profile Definitions ────────────────────────────────────────────────────

interface DemoProfile {
  email: string;
  name: string;
  password: string;
  roles: string[];
  activities: {
    type: "INTERNSHIP" | "COURSE" | "HACKATHON" | "PROJECT";
    title: string;
    org: string;
    startDate: Date;
    endDate: Date;
    status: "VERIFIED" | "PENDING";
    source: string;
    metadata: Record<string, unknown>;
    artifacts: {
      kind: "CERT" | "BADGE" | "PR" | "SUBMISSION";
      url: string;
    }[];
    verification?: {
      method: "HASH" | "OAUTH" | "WEBHOOK" | "OCR";
      status: "OK" | "PENDING";
    };
  }[];
  resumeScore: number;
  resumeVisibility: "PUBLIC" | "PRIVATE" | "LINK";
}

// ─── 1. CS Student ───────────────────────────────────────────────────────────

const csStudent: DemoProfile = {
  email: "priya.sharma@demo.resumeeco.dev",
  name: "Priya Sharma",
  password: "DemoUser2024!",
  roles: ["USER"],
  resumeScore: 82,
  resumeVisibility: "PUBLIC",
  activities: [
    {
      type: "INTERNSHIP",
      title: "Software Engineering Intern — Backend Team",
      org: "Stripe",
      startDate: daysAgo(180),
      endDate: daysAgo(90),
      status: "VERIFIED",
      source: "LINKEDIN",
      metadata: { location: "San Francisco, CA", team: "Payments API", language: "Go, TypeScript" },
      artifacts: [{ kind: "CERT", url: "https://stripe.com/verify/intern/priya-2024" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "INTERNSHIP",
      title: "Cloud Infrastructure Intern",
      org: "Google",
      startDate: daysAgo(400),
      endDate: daysAgo(310),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { location: "Bangalore, India", team: "GKE", language: "Python, Go" },
      artifacts: [{ kind: "CERT", url: "https://google.com/verify/intern/priya-gke" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "COURSE",
      title: "Machine Learning Specialization",
      org: "Stanford Online (Coursera)",
      startDate: daysAgo(250),
      endDate: daysAgo(200),
      status: "VERIFIED",
      source: "COURSERA",
      metadata: { grade: "97%", instructor: "Andrew Ng", certificateId: "ML-SPEC-2024-PS" },
      artifacts: [{ kind: "CERT", url: "https://coursera.org/verify/specialization/ML2024PS" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "COURSE",
      title: "Full Stack Open 2024",
      org: "University of Helsinki",
      startDate: daysAgo(350),
      endDate: daysAgo(280),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { grade: "Pass with Distinction", parts: "0-13" },
      artifacts: [{ kind: "CERT", url: "https://studies.cs.helsinki.fi/verify/priya-fso2024" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "HACKATHON",
      title: "TreeHacks 2024 — Grand Prize Winner",
      org: "Stanford University",
      startDate: daysAgo(120),
      endDate: daysAgo(118),
      status: "VERIFIED",
      source: "DEVPOST",
      metadata: { prize: "Grand Prize", project: "EcoRoute", teamSize: 4, devpostUrl: "https://devpost.com/ecoroute" },
      artifacts: [{ kind: "BADGE", url: "https://treehacks.com/badge/grand-prize-2024" }],
      verification: { method: "WEBHOOK", status: "OK" },
    },
    {
      type: "HACKATHON",
      title: "HackMIT 2023 — Best AI/ML Hack",
      org: "MIT",
      startDate: daysAgo(540),
      endDate: daysAgo(538),
      status: "VERIFIED",
      source: "DEVPOST",
      metadata: { prize: "Best AI/ML Hack", project: "ResumeLens", teamSize: 3 },
      artifacts: [{ kind: "BADGE", url: "https://hackmit.org/badge/aiml-2023" }],
      verification: { method: "WEBHOOK", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Distributed Key-Value Store in Rust",
      org: "GitHub",
      startDate: daysAgo(200),
      endDate: daysAgo(60),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "priyasharma/rkv", stars: 342, language: "Rust", commits: 187 },
      artifacts: [{ kind: "PR", url: "https://github.com/priyasharma/rkv" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Real-time Collaborative Code Editor",
      org: "GitHub",
      startDate: daysAgo(150),
      endDate: daysAgo(30),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "priyasharma/colab-code", stars: 128, language: "TypeScript", commits: 94 },
      artifacts: [{ kind: "PR", url: "https://github.com/priyasharma/colab-code" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "COURSE",
      title: "AWS Solutions Architect Associate",
      org: "Amazon Web Services",
      startDate: daysAgo(100),
      endDate: daysAgo(85),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { score: "890/1000", certificateId: "AWS-SAA-2024-PS" },
      artifacts: [{ kind: "CERT", url: "https://aws.amazon.com/verify/SAA-2024-PS" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Contributing to TensorFlow — Custom CUDA Kernel",
      org: "Google (Open Source)",
      startDate: daysAgo(300),
      endDate: daysAgo(270),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "tensorflow/tensorflow", prNumber: 58421, linesAdded: 1200, language: "C++, CUDA" },
      artifacts: [{ kind: "PR", url: "https://github.com/tensorflow/tensorflow/pull/58421" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "COURSE",
      title: "Distributed Systems (MIT 6.824)",
      org: "MIT OpenCourseWare",
      startDate: daysAgo(500),
      endDate: daysAgo(430),
      status: "PENDING",
      source: "MANUAL",
      metadata: { labs: "Lab 1-4 completed", language: "Go" },
      artifacts: [],
    },
  ],
};

// ─── 2. Bootcamp Graduate ────────────────────────────────────────────────────

const bootcampGrad: DemoProfile = {
  email: "marcus.chen@demo.resumeeco.dev",
  name: "Marcus Chen",
  password: "DemoUser2024!",
  roles: ["USER"],
  resumeScore: 71,
  resumeVisibility: "PUBLIC",
  activities: [
    {
      type: "COURSE",
      title: "Full Stack Web Development Bootcamp",
      org: "App Academy",
      startDate: daysAgo(365),
      endDate: daysAgo(180),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { format: "In-person", duration: "24 weeks", stack: "React, Node.js, PostgreSQL, AWS" },
      artifacts: [{ kind: "CERT", url: "https://appacademy.io/verify/marcus-chen-2024" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "INTERNSHIP",
      title: "Frontend Developer Apprentice",
      org: "Shopify",
      startDate: daysAgo(150),
      endDate: daysAgo(60),
      status: "VERIFIED",
      source: "LINKEDIN",
      metadata: { location: "Remote", team: "Merchant Dashboard", language: "TypeScript, React" },
      artifacts: [{ kind: "CERT", url: "https://shopify.com/verify/apprentice/marcus-2024" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "HACKATHON",
      title: "PennApps XXIV — Runner-Up",
      org: "University of Pennsylvania",
      startDate: daysAgo(200),
      endDate: daysAgo(198),
      status: "VERIFIED",
      source: "DEVPOST",
      metadata: { prize: "Runner-Up", project: "AccessiVision", teamSize: 4 },
      artifacts: [{ kind: "BADGE", url: "https://pennapps.com/badge/runnerup-xxiv" }],
      verification: { method: "WEBHOOK", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "E-Commerce Platform with Stripe Integration",
      org: "GitHub",
      startDate: daysAgo(120),
      endDate: daysAgo(45),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "marcuschen/shopwave", stars: 67, language: "TypeScript", commits: 156 },
      artifacts: [{ kind: "PR", url: "https://github.com/marcuschen/shopwave" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "AI-Powered Recipe Generator (Next.js + OpenAI)",
      org: "GitHub",
      startDate: daysAgo(90),
      endDate: daysAgo(30),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "marcuschen/chef-ai", stars: 214, language: "TypeScript", commits: 78, deployed: "https://chef-ai.vercel.app" },
      artifacts: [{ kind: "PR", url: "https://github.com/marcuschen/chef-ai" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "COURSE",
      title: "React — The Complete Guide (Udemy)",
      org: "Udemy",
      startDate: daysAgo(400),
      endDate: daysAgo(370),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { instructor: "Maximilian Schwarzmüller", hours: 48, certificateId: "UDEMY-REACT-MC" },
      artifacts: [{ kind: "CERT", url: "https://udemy.com/certificate/REACT-MC-2024" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "COURSE",
      title: "CS50: Introduction to Computer Science",
      org: "Harvard (edX)",
      startDate: daysAgo(500),
      endDate: daysAgo(430),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { grade: "A", certificateId: "CS50-2023-MC" },
      artifacts: [{ kind: "CERT", url: "https://cs50.harvard.edu/certificates/MC-2023" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Contributing to Next.js — Accessibility Improvements",
      org: "Vercel (Open Source)",
      startDate: daysAgo(80),
      endDate: daysAgo(70),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "vercel/next.js", prNumber: 62198, linesAdded: 340, language: "TypeScript" },
      artifacts: [{ kind: "PR", url: "https://github.com/vercel/next.js/pull/62198" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "HACKATHON",
      title: "CalHacks 10.0 — Best Social Impact",
      org: "UC Berkeley",
      startDate: daysAgo(100),
      endDate: daysAgo(98),
      status: "VERIFIED",
      source: "DEVPOST",
      metadata: { prize: "Best Social Impact", project: "GreenCommute", teamSize: 3 },
      artifacts: [{ kind: "BADGE", url: "https://calhacks.io/badge/social-impact-10" }],
      verification: { method: "WEBHOOK", status: "OK" },
    },
    {
      type: "COURSE",
      title: "Docker & Kubernetes: The Practical Guide",
      org: "Udemy",
      startDate: daysAgo(60),
      endDate: daysAgo(40),
      status: "PENDING",
      source: "MANUAL",
      metadata: { instructor: "Maximilian Schwarzmüller", hours: 23 },
      artifacts: [],
    },
    {
      type: "PROJECT",
      title: "Personal Portfolio with Three.js Animations",
      org: "GitHub",
      startDate: daysAgo(50),
      endDate: daysAgo(20),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "marcuschen/portfolio-3d", stars: 45, language: "JavaScript", deployed: "https://marcuschen.dev" },
      artifacts: [{ kind: "PR", url: "https://github.com/marcuschen/portfolio-3d" }],
      verification: { method: "OAUTH", status: "OK" },
    },
  ],
};

// ─── 3. Senior Developer ─────────────────────────────────────────────────────

const seniorDev: DemoProfile = {
  email: "elena.rodriguez@demo.resumeeco.dev",
  name: "Elena Rodriguez",
  password: "DemoUser2024!",
  roles: ["USER", "ADMIN"],
  resumeScore: 94,
  resumeVisibility: "PUBLIC",
  activities: [
    {
      type: "INTERNSHIP",
      title: "Senior Software Engineer — Platform Team",
      org: "Netflix",
      startDate: daysAgo(900),
      endDate: daysAgo(180),
      status: "VERIFIED",
      source: "LINKEDIN",
      metadata: { location: "Los Gatos, CA", team: "Platform Engineering", language: "Java, Kotlin", level: "L5" },
      artifacts: [{ kind: "CERT", url: "https://netflix.com/verify/engineer/elena-platform" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "INTERNSHIP",
      title: "Staff Engineer — Data Infrastructure",
      org: "Databricks",
      startDate: daysAgo(170),
      endDate: daysAgo(1),
      status: "VERIFIED",
      source: "LINKEDIN",
      metadata: { location: "San Francisco, CA", team: "Spark Runtime", language: "Scala, Rust", level: "Staff" },
      artifacts: [{ kind: "CERT", url: "https://databricks.com/verify/staff/elena-2024" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Apache Kafka Contributor — KIP-932 Implementation",
      org: "Apache Software Foundation",
      startDate: daysAgo(600),
      endDate: daysAgo(400),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "apache/kafka", commits: 47, linesAdded: 8500, language: "Java", kip: "KIP-932" },
      artifacts: [{ kind: "PR", url: "https://github.com/apache/kafka/pulls?q=author:elenarodriguez" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Rust Stream Processing Framework (Fluvio Fork)",
      org: "GitHub",
      startDate: daysAgo(300),
      endDate: daysAgo(100),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "elenarodriguez/streamline", stars: 1847, language: "Rust", commits: 423 },
      artifacts: [{ kind: "PR", url: "https://github.com/elenarodriguez/streamline" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "COURSE",
      title: "Designing Data-Intensive Applications (Study Group Lead)",
      org: "O'Reilly Media",
      startDate: daysAgo(700),
      endDate: daysAgo(650),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { role: "Study Group Lead", participants: 24, sessions: 12 },
      artifacts: [{ kind: "CERT", url: "https://oreilly.com/verify/study-group/ddia-elena" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "HACKATHON",
      title: "KubeCon Hackathon 2023 — Winner, Infrastructure Track",
      org: "CNCF",
      startDate: daysAgo(450),
      endDate: daysAgo(448),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { prize: "Winner", track: "Infrastructure", project: "K8s Cost Optimizer", teamSize: 2 },
      artifacts: [{ kind: "BADGE", url: "https://kubecon.io/hackathon/2023/winners" }],
      verification: { method: "WEBHOOK", status: "OK" },
    },
    {
      type: "COURSE",
      title: "Google Cloud Professional Data Engineer",
      org: "Google Cloud",
      startDate: daysAgo(500),
      endDate: daysAgo(480),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { certificateId: "GCP-PDE-2023-ER", score: "95%" },
      artifacts: [{ kind: "CERT", url: "https://cloud.google.com/verify/PDE-2023-ER" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Open Source Observability Toolkit (Prometheus + OTel)",
      org: "GitHub",
      startDate: daysAgo(200),
      endDate: daysAgo(50),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "elenarodriguez/obs-toolkit", stars: 923, language: "Go, TypeScript", commits: 267 },
      artifacts: [{ kind: "PR", url: "https://github.com/elenarodriguez/obs-toolkit" }],
      verification: { method: "OAUTH", status: "OK" },
    },
    {
      type: "COURSE",
      title: "Certified Kubernetes Administrator (CKA)",
      org: "CNCF / Linux Foundation",
      startDate: daysAgo(350),
      endDate: daysAgo(340),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { score: "92%", certificateId: "CKA-2024-ER" },
      artifacts: [{ kind: "CERT", url: "https://training.linuxfoundation.org/verify/CKA-2024-ER" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "HACKATHON",
      title: "MLH Global Hack Week — Mentor & Judge",
      org: "Major League Hacking",
      startDate: daysAgo(100),
      endDate: daysAgo(93),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { role: "Mentor & Judge", hackers: 500, category: "AI/Infrastructure" },
      artifacts: [{ kind: "BADGE", url: "https://mlh.io/badges/mentor-ghw-2024" }],
      verification: { method: "WEBHOOK", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Tech Talk: \"Zero-Downtime Migrations at Scale\" (QCon)",
      org: "QCon San Francisco",
      startDate: daysAgo(250),
      endDate: daysAgo(250),
      status: "VERIFIED",
      source: "MANUAL",
      metadata: { conference: "QCon SF 2024", attendees: 350, recording: "https://youtube.com/watch?v=example" },
      artifacts: [{ kind: "CERT", url: "https://qconsf.com/speakers/elena-rodriguez-2024" }],
      verification: { method: "HASH", status: "OK" },
    },
    {
      type: "PROJECT",
      title: "Contributing to Rust Compiler — Async Trait Improvements",
      org: "Rust Project",
      startDate: daysAgo(400),
      endDate: daysAgo(380),
      status: "VERIFIED",
      source: "GITHUB",
      metadata: { repo: "rust-lang/rust", prNumber: 118482, linesAdded: 2100, language: "Rust" },
      artifacts: [{ kind: "PR", url: "https://github.com/rust-lang/rust/pull/118482" }],
      verification: { method: "OAUTH", status: "OK" },
    },
  ],
};

// ─── Resume Section Builder ──────────────────────────────────────────────────

function buildResumeSections(profile: DemoProfile) {
  const verified = profile.activities.filter((a) => a.status === "VERIFIED");

  const internships = verified
    .filter((a) => a.type === "INTERNSHIP")
    .map((a) => ({
      title: a.title,
      org: a.org,
      startDate: a.startDate.toISOString(),
      endDate: a.endDate.toISOString(),
      verified: true,
      metadata: a.metadata,
    }));

  const courses = verified
    .filter((a) => a.type === "COURSE")
    .map((a) => ({
      title: a.title,
      org: a.org,
      completedDate: a.endDate.toISOString(),
      verified: true,
      metadata: a.metadata,
    }));

  const hackathons = verified
    .filter((a) => a.type === "HACKATHON")
    .map((a) => ({
      title: a.title,
      org: a.org,
      date: a.startDate.toISOString(),
      verified: true,
      metadata: a.metadata,
    }));

  const projects = verified
    .filter((a) => a.type === "PROJECT")
    .map((a) => ({
      title: a.title,
      org: a.org,
      startDate: a.startDate.toISOString(),
      endDate: a.endDate.toISOString(),
      verified: true,
      metadata: a.metadata,
    }));

  return {
    summary: {
      name: profile.name,
      email: profile.email,
      totalActivities: profile.activities.length,
      verifiedActivities: verified.length,
    },
    internships,
    courses,
    hackathons,
    projects,
  };
}

// ─── Seed a Single Profile ───────────────────────────────────────────────────

async function seedProfile(profile: DemoProfile): Promise<void> {
  console.log(`\n  👤 Seeding: ${profile.name} (${profile.email})`);

  // 1. Create user
  const user = await prisma.user.upsert({
    where: { email: profile.email },
    update: { name: profile.name },
    create: {
      email: profile.email,
      name: profile.name,
      password: hashPassword(profile.password),
      roles: profile.roles,
    },
  });
  console.log(`     ✓ User created (${user.id})`);

  // 2. Delete existing data for idempotency
  const existingActivities = await prisma.activity.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  if (existingActivities.length > 0) {
    const activityIds = existingActivities.map((a) => a.id);
    await prisma.achievementArtifact.deleteMany({ where: { activityId: { in: activityIds } } });
    await prisma.verificationCase.deleteMany({ where: { activityId: { in: activityIds } } });
    await prisma.activity.deleteMany({ where: { userId: user.id } });
  }

  // Clean up existing resume
  const existingResume = await prisma.resume.findUnique({ where: { userId: user.id } });
  if (existingResume) {
    // Unlink currentVersion before deleting versions
    await prisma.resume.update({
      where: { userId: user.id },
      data: { currentVersionId: null },
    });
    await prisma.resumeVersion.deleteMany({ where: { resumeId: existingResume.id } });
    await prisma.resume.delete({ where: { userId: user.id } });
  }

  // 3. Create activities with artifacts and verifications
  let verifiedCount = 0;
  for (const act of profile.activities) {
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        type: act.type,
        title: act.title,
        org: act.org,
        startDate: act.startDate,
        endDate: act.endDate,
        status: act.status,
        source: act.source,
        metadata: act.metadata,
      },
    });

    // Create artifacts
    for (const art of act.artifacts) {
      await prisma.achievementArtifact.create({
        data: {
          activityId: activity.id,
          kind: art.kind,
          url: art.url,
          sha256Hex: sha256(art.url + activity.id),
        },
      });
    }

    // Create verification case
    if (act.verification) {
      await prisma.verificationCase.create({
        data: {
          activityId: activity.id,
          method: act.verification.method,
          status: act.verification.status,
          verifiedAt: act.verification.status === "OK" ? act.endDate : null,
          logs: { verifiedBy: "demo-seed", method: act.verification.method },
        },
      });
    }

    if (act.status === "VERIFIED") verifiedCount++;
  }
  console.log(`     ✓ ${profile.activities.length} activities (${verifiedCount} verified)`);

  // 4. Create resume with a published version
  const sections = buildResumeSections(profile);

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      visibility: profile.resumeVisibility,
    },
  });

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      score: profile.resumeScore,
      sections: sections as any,
    },
  });

  // Link as current version
  await prisma.resume.update({
    where: { id: resume.id },
    data: { currentVersionId: version.id },
  });

  console.log(`     ✓ Resume published (score: ${profile.resumeScore}/100, version: ${version.id})`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("  🚀 Resume Ecosystem — Demo Seed");
  console.log("═".repeat(60));
  console.log("\n  Creating 3 demo profiles with rich activity data...\n");

  const profiles = [csStudent, bootcampGrad, seniorDev];

  for (const profile of profiles) {
    await seedProfile(profile);
  }

  // Print summary
  const userCount = await prisma.user.count();
  const activityCount = await prisma.activity.count();
  const verifiedCount = await prisma.activity.count({ where: { status: "VERIFIED" } });
  const resumeCount = await prisma.resume.count();

  console.log("\n" + "─".repeat(60));
  console.log("  ✅ Demo seed complete!\n");
  console.log(`  📊 Database Summary:`);
  console.log(`     Users:               ${userCount}`);
  console.log(`     Activities:           ${activityCount} (${verifiedCount} verified)`);
  console.log(`     Published Resumes:    ${resumeCount}`);
  console.log("\n  🔑 Demo Login Credentials:");
  console.log(`     Email:    priya.sharma@demo.resumeeco.dev`);
  console.log(`     Email:    marcus.chen@demo.resumeeco.dev`);
  console.log(`     Email:    elena.rodriguez@demo.resumeeco.dev`);
  console.log(`     Password: DemoUser2024!  (all accounts)`);
  console.log("\n" + "═".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("\n  ❌ Demo seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
