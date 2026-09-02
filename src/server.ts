import Fastify from "fastify";
import { deckRoutes } from "./modules/decks/deck-routes";
import { cardRoutes } from "./modules/cards/card-routes";
import { reviewRoutes } from "./modules/reviews/review-routes";

const app = Fastify({
  logger: true,
});

app.get("/", async () => {
  return { message: "MemDeck Api funcionando" };
});

app.register(deckRoutes);
app.register(cardRoutes);
app.register(reviewRoutes);

app.listen({ port: 3333 });
