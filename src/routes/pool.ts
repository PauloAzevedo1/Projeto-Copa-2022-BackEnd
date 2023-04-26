import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { autheticate } from "../plugins/authenticate"


export async function poolRoutes(fastify: FastifyInstance) {
                      //3000
    // http://localhost:3333
    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count()
         
         return { count}
     })


     fastify.post('/pools', async (request, reply) => {
        const createPoolBody = z.object({
            title: z.string(),
        }) 

        const  { title } = createPoolBody.parse(request.body)

        const generate = new ShortUniqueId({length: 6})
        const code = String(generate()).toUpperCase();

        let ownerId = null;

        try {
            await request.jwtVerify()

            await prisma.pool.create({
                data: {
                    title,
                    code,
                    ownerId: request.user.sub,

                    participants:{
                        create:{
                            userId: request.user.sub,
                        }
                    }
                }

            })
        } catch {

            await prisma.pool.create({
                data: {
                    title,
                    code
                }

            })

        }


        return reply.status(201).send({code})
     })

     fastify.post('/pools/join', {
         onRequest: [autheticate]
     }, async (Request, reply) => {
         const joinPoolBody = z.object({
             code: z.string(),
         })

         const {code } = joinPoolBody.parse(Request.body)

         const pool = await prisma.pool.findUnique({
             where: {
                 code,
             },
             include: {
                participants:{
                     where: {
                        userId: Request.user.sub
                     }
                 }
             }
         })

         if (!pool) {
             return reply.status(400).send({
                 message: 'Pool not found.'
             })
         }

         if (pool.participants.length >0){
            return reply.status(400).send({
                message: 'you already joined this Pool.'
            })
         }

         if (!pool.ownerId) {
             await prisma.pool.update({
                 where: {
                     id: pool.id,
                 },
                 data:{
                     ownerId: Request.user.sub
                 }
             })
         }

         await prisma.participant.create({
             data:{
                poolId: pool.id,
                userId: Request.user.sub,
             }
         })

         return reply.status(201).send()
     })

     fastify.get('/pools', {
         onRequest: [autheticate]
     }, async (Request) => {
         const pools = await prisma.pool.findMany({
             where: {
                 participants: {
                     some: {
                         userId: Request.user.sub,
                     }
                 }
             },
             include:{
                 _count:{
                     select: {
                        participants: true,
                     }
                 },
                 participants:{
                     select:{
                         id: true,

                         user: {
                             select:{
                                 avatarUrl: true,
                             }
                         }
                     },
                     take: 4,
                 },
                 owner: {
                     select: {
                         id: true,
                         name: true,
                     }
                 }
             }
         })

         return { pools }
     })

     fastify.get('/pools/:id', {
         onRequest: [autheticate],
     }, async (Request) => {
        const getPoolParams = z.object({
            id: z.string(),
        })

        const { id } = getPoolParams.parse(Request.params)

        const pool = await prisma.pool.findUnique({
            where: {
              id,
            },
            include:{
                _count:{
                    select: {
                        participants: true,
                    }
                },
                participants:{
                    select:{
                        id: true,

                        user: {
                            select:{
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return { pool}

     })

}