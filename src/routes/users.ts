import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function UserRoutes(app: FastifyInstance) {
  app.post('/users', async (request, reply) => {
    // Crio um Schema de validação
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    // Validando os dados do request.body para ver se bate com o schema de validação
    const { name } = createUserBodySchema.parse(request.body)

    // Checo se já existe um usuário cadastro com este nome
    const checkUserExist = await knex
      .select('*')
      .from('users')
      .where('name', name)
      .first()

    // Caso exista lanço um erro
    if (checkUserExist) {
      return reply.status(400).send({
        error: 'Este nome já está vinculado à um usuário',
      })
    }

    // Verifico se existe uma sessionID
    let sessionId = request.cookies.sessionId

    // Caso não exista crio uma
    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/meals', // apenas as rotas /meals podem acessar ao cookie
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/users', async () => {
    const users = await knex('users').select('*')

    return { users }
  })
}
