import { prisma } from "../lib/prisma"
import { FastifyInstance } from "fastify"
import { z } from "zod"
import { autheticate } from "../plugins/authenticate"
import fetch from "node-fetch";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.get(
        '/me', 
        {
        onRequest: [autheticate],
        },
        async (request) => {
        await request.jwtVerify()
        return { user : request.user }
    })


    fastify.post('/users', async (Request) => {
        const createUserBody = z.object({
            access_token: z.string(),
        }) 
        
        const { access_token } = createUserBody.parse(Request.body)

        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`, 
            }
        })
        const userData = await userResponse.json()

        const userInforSchema = z.object({
            id: z.string(),
            email: z.string(),
            name:z.string(),
            picture: z.string().url(),

        })

        const userInfo = userInforSchema.parse(userData)

        let user = await prisma.user.findUnique({
            where: {
                googleId: userInfo.id,
            }
        })

        if (!user){
            user = await prisma.user.create({
                data: {
                    googleId: userInfo.id,
                    name: userInfo.name,
                    email: userInfo.email,
                    avatarUrl: userInfo.picture,
                }
            })
        }

        const token = fastify.jwt.sign({
            name: user.name,
            avatarUrl: user.avatarUrl,
        },{
            sub: user.id,
            expiresIn: '7 days',
        })

         return { token } 
    }) 
}