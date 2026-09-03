import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import { authGuard } from "../auth/auth-guard.js";

export async function deckRoutes(app: FastifyInstance) {
  app.post(
    "/decks",
    {
      preHandler: [authGuard],
      schema: {
        tags: ["Decks"],
        summary: "Cria um novo deck",
        description: "Cria um novo baralho de flashcards.",

        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
        },

        security: [
          {
            bearerAuth: [],
          },
        ],

        response: {
          201: {
            description: "Deck criado com sucesso",
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              createdAt: { type: "string" },
            },
          },
        },
      },
    },

    async (request, reply) => {
      const body = request.body as { name: string; description?: string };
      const user = request.user as {
        sub: string;
        email: string;
      };

      const deck = await prisma.deck.create({
        data: {
          name: body.name,
          description: body.description,
          userId: user.sub,
        },
      });

      return reply.status(201).send(deck);
    },
  );

  app.get(
    "/decks",
    {
      preHandler: [authGuard],
      schema: {
        tags: ["Decks"],
        summary: "Lista os decks",
        description: "Retorna os baralhos do usuário autenticado.",

        security: [
          {
            bearerAuth: [],
          },
        ],

        response: {
          200: {
            description: "Lista de decks",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                createdAt: { type: "string" },
              },
            },
          },
        },
      },
    },

    async (request) => {
      const user = request.user as {
        sub: string;
        email: string;
      };

      const decks = await prisma.deck.findMany({
        where: {
          userId: user.sub,
        },
      });

      return decks;
    },
  );
}
