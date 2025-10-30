import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { Prisma } from "@prisma/client";

import { prisma } from "@resume/services/prisma";
import { producer } from "@resume/services/kafka";
import { verifyCache } from "../services/cache.js";
import { Topics } from "common-lib";

type HashBody = {
  expected?: string;
  actual?: string;
  userId?: string;
};

type IssuerBody = {
  signature?: string;
  payload?: unknown;
  userId?: string;
};

async function emitVerified(userId: string, activityId: string): Promise<void> {
  await prisma.activity.update({ where: { id: activityId }, data: { status: "VERIFIED" } });
  await producer.send({
    topic: Topics.ActivityVerified,
    messages: [
      {
        key: userId,
        value: JSON.stringify({ activityId, userId, status: "OK" })
      }
    ]
  });
}

export async function routes(app: FastifyInstance): Promise<void> {
  app.get("/verify/status/:activityId", async (req: FastifyRequest<{ Params: { activityId: string } }>, reply: FastifyReply) => {
    const id = req.params.activityId;
    const cached = verifyCache.get(id);

    if (cached) {
      return reply.send({ cached: true, verification: cached });
    }

    const last = await prisma.verificationCase.findFirst({
      where: { activityId: id },
      orderBy: { verifiedAt: "desc" }
    });

    return reply.send({ cached: false, verification: last ?? null });
  });

  app.post("/verify/:activityId/hash", async (req: FastifyRequest<{ Params: { activityId: string }; Body: HashBody }>, reply: FastifyReply) => {
    const { activityId } = req.params;
    const { expected, actual, userId } = req.body ?? {};

    if (!userId) {
      return reply.code(400).send({ error: "userId is required" });
    }

    if (!expected || !actual) {
      return reply.code(400).send({ error: "expected and actual hashes are required" });
    }

    const ok = expected === actual;

    const verification = await prisma.verificationCase.create({
      data: {
        activityId,
        method: "HASH",
        status: ok ? "OK" : "FAILED",
        logs: { expected, actual } as Prisma.JsonObject,
        verifiedAt: new Date()
      }
    });

    verifyCache.set(activityId, verification);

    if (ok) {
      await emitVerified(userId, activityId);
    }

    return reply.send(verification);
  });

  app.post("/verify/:activityId/issuer-signature", async (req: FastifyRequest<{ Params: { activityId: string }; Body: IssuerBody }>, reply: FastifyReply) => {
    const { activityId } = req.params;
    const { signature, payload, userId } = req.body ?? {};

    if (!userId) {
      return reply.code(400).send({ error: "userId is required" });
    }

    if (!signature || typeof signature !== "string") {
      return reply.code(400).send({ error: "signature is required" });
    }

    const ok = Boolean(signature) && payload !== undefined;

    const verification = await prisma.verificationCase.create({
      data: {
        activityId,
        method: "WEBHOOK",
        status: ok ? "OK" : "FAILED",
        logs: { signature, payload: payload as Prisma.JsonValue } as Prisma.JsonObject,
        verifiedAt: new Date()
      }
    });

    verifyCache.set(activityId, verification);

    if (ok) {
      await emitVerified(userId, activityId);
    }

    return reply.send(verification);
  });
}
