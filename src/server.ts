import Fastity from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { poolRoutes } from './routes/pool'
import { authRoutes } from './routes/auth'
import { gameRoutes } from './routes/game'
import { guessRoutes } from './routes/guess'
import { userRoutes } from './routes/user'



async function bootstrop() {
    const fastify = Fastity({
        logger: true,
    })

    await fastify.register(cors,{
        origin: true,
    })

//em produção precisa ser chave ambiente
    await fastify.register(jwt, {
       secret:'nlwcopa',
    })

    await fastify.register(poolRoutes)
    await fastify.register(authRoutes)
    await fastify.register(gameRoutes)
    await fastify.register(guessRoutes)
    await fastify.register(userRoutes)
  

    await fastify.listen({port: 3000, host: '0.0.0.0'});
}

bootstrop()