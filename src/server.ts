import Fastify from "fastify";
import { deckRoutes } from "./modules/decks/deck-routes";

const app = Fastify({
  logger: true,
});

app.get("/", async () => {
  return { message: "MemDeck Api funcionando" };
});

app.register(deckRoutes);
app.listen({ port: 3333 });
