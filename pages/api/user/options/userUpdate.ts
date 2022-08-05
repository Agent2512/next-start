import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { prismaConnect } from "../../../../utils/server/prismaConnect";

export default async function userUpdate(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req })
    if (session == null) return res.status(401).json({ error: "Not logged in" })
    if (session.user.email == null) return res.status(401).json({ error: "Not logged in" })
    const { email: userEmail } = session.user

    const { email, username }: { email: string, username: string } = req.body

    if (/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)) return res.status(400).json({ message: "Invalid email" })

    if (email != userEmail) {
        const user = await getUser(email)
        if (user != null) return res.status(404).json({ error: "email already used" })
    }

    const newData = prismaConnect.user.update({
        where: {
            email: userEmail
        },
        data: {
            email,
            name: username
        },
        select: {
            email: true,
            name: true
        }
    })


    return res.json({ message: "ok", newData })
}

const getUser = (email: string) => prismaConnect.user.findUnique({
    where: { email }
})