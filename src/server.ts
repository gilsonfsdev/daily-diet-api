import fastify from 'fastify'
import { UserRoutes } from './routes/users'
import { MealsRoutes } from './routes/meals'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(cookie)

app.register(UserRoutes)

app.register(MealsRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Servivor ON')
  })
