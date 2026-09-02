import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import type { ReviewRating } from "./review";
import { calculateNextReview } from "./calculate-next-review";

export async function reviewRoutes(app: FastifyInstance) {
  app.post("/cards/:cardId/reviews", async (request, reply) => {
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
