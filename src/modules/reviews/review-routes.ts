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
  });
}
