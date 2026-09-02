import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";

export async function cardRoutes(app: FastifyInstance) {
  app.post("/decks/:deckId/cards", async (request, reply) => {
    const { deckId } = request.params as {
      deckId: string;
    };

    const body = request.body as {
      front: string;
      back: string;
    };

    const card = await prisma.card.create({
      data: {
        deckId,
        front: body.front,
        back: body.back,
      },
    });
    return reply.status(201).send(card);
  });

  app.get("/decks/:deckId/cards", async (request, reply) => {
    const { deckId } = request.params as {
      deckId: string;
    };

    const cards = await prisma.card.findMany({
      where: {
        deckId,
      },
    });

    return cards;
  });
}
