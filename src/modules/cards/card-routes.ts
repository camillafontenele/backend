import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";

export async function cardRoutes(app: FastifyInstance) {
  app.post(
    "/decks/:deckId/cards",
    {
      schema: {
        tags: ["Cards"],
        summary: "Cria um novo card",
        description: "Adiciona um novo flashcard a um deck existente.",
      },
    },
    async (request, reply) => {
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
    },
  );

  app.get(
    "/decks/:deckId/cards",
    {
      schema: {
        tags: ["Cards"],
        summary: "Lista os cards de um deck",
        description: "Retorna todos os flashcards pertencentes a um deck.",
      },
    },
    async (request) => {
      const { deckId } = request.params as {
        deckId: string;
      };

      const cards = await prisma.card.findMany({
        where: {
          deckId,
        },
      });

      return cards;
    },
  );
}
