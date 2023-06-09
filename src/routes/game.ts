import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"
import { z } from "zod"
import { autheticate } from "../plugins/authenticate"


export async function gameRoutes(fastify: FastifyInstance) {
     fastify.get('/pools/:id/games', {
         onRequest:[autheticate],
     }, async (Request) => {
        const getPoolParams = z.object({
            id: z.string(),
        })

        const { id } = getPoolParams.parse(Request.params)

        const games = await prisma.game.findMany({
            orderBy: {
                date: 'desc',
            },
            include: {
                guesses:{
                    where: {
                        participant: {
                            userId: Request.user.sub,
                            poolId: id,
                        }
                    }
                }
            }
        })

        return { 
            games: games.map(game =>{
                return {
                    ...game,
                    guess: game.guesses.length > 0 ? game.guesses[0]: null,
                    guesses: undefined,
                }
            })
        }


     })               

}