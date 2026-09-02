import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'

export async function deckRoutes(app: FastifyInstance) {
  app.post('/decks', async (request, reply) => {
    const body = request.body as {
      name: string
      description?: string
    }

    const deck = await prisma.deck.create({
      data: {
        name: body.name,
        description: body.description,
      },
    })

    return reply.status(201).send(deck)
  })

  app.get('/decks', async () => {
    const decks = await prisma.deck.findMany()

    return decks
  })
}
