import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prismaConnect } from '../../../utils/server/prismaConnect';
import { hashSync, compareSync } from "bcrypt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            name: string | null
            email: string | null
            image: string | null
        }
    }
}


export default NextAuth({
    providers: [
        CredentialsProvider({
            type: 'credentials',
            name: 'credentials',
            credentials: {
                email: { label: "Email", type: "Email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const email = credentials?.email
                const password = credentials?.password

                if (!email || !password) return null

                const user = await getUser(email)

                // if user is null must be a new user so make user is database
                if (user === null) {
                    return createUser(email, password)
                }
                // if user is not null and password is null then tell user to login with social and set password
                if (user.password === null) {

                    return null
                }
                // if user is not null and password is not null then check password

                return verifyPassword(password, user.password) ? user : null
            },

        })
    ],
    secret: process.env.NEXT_AUTH_SECRET,
    jwt: {
        secret: process.env.NEXT_AUTH_JWT_SECRET,
    },
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === 'development',
    adapter: PrismaAdapter(prismaConnect),
    
})

const createUser = (email: string, password: string) => {
    return prismaConnect.user.create({
        data: {
            name: email.split("@")[0],
            email,
            password: hashSync(password, 10)
        }
    })
}

const verifyPassword = (password: string, userPassword: string) => {
    return compareSync(password, userPassword)
}

const getUser = (email: string) => {
    return prismaConnect.user.findUnique({
        where: {
            email
        },
    })
}