import type { FastifyInstance } from "fastify";
import type { Deck } from "./deck.js";
import { prisma } from "../../lib/prisma.js";

const decks: Deck[] = [];

export async function deckRoutes(app: FastifyInstance) {
  app.post(
    "/decks",
    {
      schema: {
        tags: ["Decks"],
        summary: "Cria um novo deck",
        description: "Cria um novo baralho de flashcards.",
      },
    },
    async (request, reply) => {
      const body = request.body as { name: string; description: string };

      const deck: Deck = {
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description,
        createdAt: new Date(),
      };

      decks.push(deck);
      reply.status(201).send(deck);
    },
  );

  app.get(
    "/decks",
    {
      schema: {
        tags: ["Decks"],
        summary: "Lista os decks",
        description: "Retorna todos os baralhos cadastrados.",
      },
    },
    async () => {
      const decks = await prisma.deck.findMany();

      return decks;
    },
  );
}
