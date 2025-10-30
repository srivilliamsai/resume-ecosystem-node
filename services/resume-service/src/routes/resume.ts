import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import * as jose from "jose";

import { prisma } from "@resume/services/prisma";
import { rebuildForUser } from "../services/rebuilder.js";

type JwtUser = {
  id: string;
};

async function requireUser(req: FastifyRequest, reply: FastifyReply): Promise<JwtUser> {
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    reply.code(401).send({ error: "Authorization token missing" });
    throw new Error("missing token");
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "devsecret");

  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return { id: String(payload.sub) };
  } catch {
    reply.code(401).send({ error: "Invalid token" });
    throw new Error("invalid token");
  }
}

export async function routes(app: FastifyInstance): Promise<void> {
  app.get("/resume/me", async (req: FastifyRequest, reply: FastifyReply) => {
    const user = await requireUser(req, reply);

    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
      include: { currentVersion: true }
    });

    if (!resume || !resume.currentVersion) {
      return reply.send({ empty: true });
    }

    return reply.send(resume.currentVersion);
  });

  app.post("/resume/rebuild", async (req: FastifyRequest, reply: FastifyReply) => {
    const user = await requireUser(req, reply);
    const { version } = await rebuildForUser(user.id);
    return reply.code(202).send(version);
  });

  app.get("/resume/versions", async (req: FastifyRequest, reply: FastifyReply) => {
    const user = await requireUser(req, reply);

    const resume = await prisma.resume.findUnique({ where: { userId: user.id } });
    if (!resume) {
      return reply.send([]);
    }

    const versions = await prisma.resumeVersion.findMany({
      where: { resumeId: resume.id },
      orderBy: { createdAt: "desc" }
    });

    return reply.send(versions);
  });
}
