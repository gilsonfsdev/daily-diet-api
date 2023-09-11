import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { randomUUID } from 'crypto'

export async function MealsRoutes(app: FastifyInstance) {
  // Criando uma refeição
  app.post(
    '/meals',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      // A partir deste sessionID, buscar os dados na tabela users para adicionar durante a criação de uma nova refeição na tabela meals
      // Desestruturando o user para depois armazenar apenas o seu ID na variável userID

      const [user] = await knex('users').where('session_id', sessionId).select()

      const userId = user.id

      const createMealBodySchema = z.object({
        name: z.string().nonempty('A refeição precisa ter um título'),
        description: z.string().nonempty('A refeição precisa ser descrita'),
        isOnTheDiet: z.boolean(),
      })

      const { name, description, isOnTheDiet } = createMealBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        user_id: userId,
        name,
        description,
        isOnTheDiet,
      })

      return reply.status(201).send()
    },
  )

  // Buscando todas as refeições do usuário
  app.get('/meals', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies

    const [user] = await knex('users')
      .where('session_id', sessionId)
      .select('id')

    const userId = user.id

    // Selecionar apenas onde a coluna user_id seja correspondende ao id do usuário que criou o prato
    const meals = await knex('meals').where('user_id', userId).select()

    return { meals }
  })

  // Buscando uma refeição específica
  app.get(
    '/meals/:id',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      // Validando os parâmetros
      const { id } = getMealParamsSchema.parse(request.params)

      // Buscando o usuário
      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      // Selecionar apenas onde a coluna user_id seja correspondende ao id do usuário que criou o prato, e que o id dos parâmetros corresponda ao id cadastrado
      const meal = await knex('meals')
        .where('user_id', userId)
        .andWhere('id', id)
        .first()
        .select()

      return { meal }
    },
  )

  // Atualizando uma refeição específica
  app.put(
    '/meals/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      // Criando um schema de validação do parâmetro
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      // Validando
      const { id } = getMealParamsSchema.parse(request.params)

      // Buscando o usuário através da sessionId
      const { sessionId } = request.cookies

      // Buscando o Id do usuário baseado na session_id
      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      // Validando e capturando o que o usuário manda pelo body
      const mealToEditBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnTheDiet: z.boolean(),
      })

      const { name, description, isOnTheDiet } = mealToEditBodySchema.parse(
        request.body,
      )

      // Buscando a refeição existente, passando o id que veio por params e o id do usuário capturado pelo session_id
      const meal = await knex('meals')
        .where('user_id', userId)
        .andWhere('id', id)
        .first()
        .update({
          name,
          description,
          isOnTheDiet,
        })

      if (!meal) {
        return reply.status(401).send({
          error: 'Refeição não encontrada',
        })
      }

      return reply.status(201).send('Refeição atualizada com sucesso')
    },
  )

  // Deletando uma refeição
  app.delete(
    '/meals/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      // Validando os parâmetros
      const { id } = getMealParamsSchema.parse(request.params)

      // Buscando o usuário
      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const mealToDelete = await knex('meals')
        .where('user_id', userId)
        .andWhere('id', id)
        .first()
        .delete()

      if (!mealToDelete) {
        return reply.status(401).send({
          error: 'Refeição não cadastrada',
        })
      }

      return reply.status(202).send('Refeição deletada com sucesso!')
    },
  )

  // Resumo das refeições
  app.get(
    '/meals/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      // Buscando o usuário
      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const [count] = await knex('meals')
        .count('id', {
          as: 'Total de refeições registradas',
        })
        .where('user_id', userId)

      const [mealOnTheDiet] = await knex('meals')
        .count('isOnTheDiet', {
          as: 'Total de refeições dentro da dieta',
        })
        .where('user_id', userId)
        .andWhere('isOnTheDiet', true)

      const [mealOffTheDiet] = await knex('meals')
        .count('isOnTheDiet', {
          as: 'Total de refeicoes fora da dieta',
        })
        .where('user_id', userId)
        .andWhere('isOnTheDiet', false)

      const summary = {
        'Total de refeições registradas': parseInt(
          JSON.parse(JSON.stringify(count))['Total de refeições registradas'],
        ),

        'Total de refeições dentro da dieta':
          mealOnTheDiet['Total de refeições dentro da dieta'],

        'Total de refeições fora da dieta':
          mealOffTheDiet['Total de refeicoes fora da dieta'],
      }

      return { summary }
    },
  )
}
