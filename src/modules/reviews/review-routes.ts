import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma.js";
import type { ReviewRating } from "./review.js";
import { calculateNextReview } from "./calculate-next-review.js";

export async function reviewRoutes(app: FastifyInstance) {
  app.post(
    "/cards/:cardId/reviews",
    {
      schema: {
        tags: ["Reviews"],
        summary: "Registra uma revisão",
        description:
          "Registra a avaliação de um card e calcula a próxima revisão usando o SRS.",

        params: {
          type: "object",
          required: ["cardId"],
          properties: {
            cardId: { type: "string" },
          },
        },

        body: {
          type: "object",
          required: ["rating"],
          properties: {
            rating: {
              type: "string",
              enum: ["AGAIN", "HARD", "GOOD", "EASY"],
            },
          },
        },

        security: [
          {
            bearerAuth: [],
          },
        ],

        response: {
          201: {
            description: "Revisão registrada com sucesso",
            type: "object",
            properties: {
              id: { type: "string" },
              cardId: { type: "string" },
              rating: { type: "string" },
              reviewedAt: { type: "string" },
              nextReviewAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { cardId } = request.params as {
        cardId: string;
      };

      const body = request.body as {
        rating: ReviewRating;
      };

      const reviewedAt = new Date();

      const nextReviewAt = calculateNextReview(body.rating, reviewedAt);

      const review = await prisma.review.create({
        data: {
          cardId,
          rating: body.rating,
          reviewedAt,
          nextReviewAt,
        },
      });
      return reply.status(201).send(review);
    },
  );

  app.get(
    "/decks/:deckId/reviews/available",
    {
      schema: {
        tags: ["Reviews"],
        summary: "Lista os cards para revisão",
        description:
          "Retorna os cards cuja próxima revisão já está disponível.",

        params: {
          type: "object",
          required: ["deckId"],
          properties: {
            deckId: { type: "string" },
          },
        },

        querystring: {
          type: "object",
          required: ["mode"],
          properties: {
            mode: {
              type: "string",
              enum: ["ideal", "good", "medium", "short"],
            },
          },
        },

        security: [
          {
            bearerAuth: [],
          },
        ],

        response: {
          200: {
            description: "Cards disponiveis para revisão",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                deckId: { type: "string" },
                front: { type: "string" },
                back: { type: "string" },
                createdAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const { deckId } = request.params as {
        deckId: string;
      };
      const { mode } = request.query as {
        mode: "ideal" | "good" | "medium" | "short";
      };

      const now = new Date();

      const cards = await prisma.card.findMany({
        where: {
          deckId,
        },
        include: {
          reviews: {
            orderBy: {
              reviewedAt: "desc",
            },
            take: 1,
          },
        },
      });

      const availableCards = cards.filter((card) => {
        const lastReview = card.reviews[0];

        if (!lastReview) {
          return true;
        }

        return lastReview.nextReviewAt <= now;
      });

      const limits = {
        ideal: undefined,
        good: 100,
        medium: 50,
        short: 20,
      };

      const limit = limits[mode];

      if (!limit) {
        return availableCards;
      }

      return availableCards.slice(0, limit);
    },
  );
}
