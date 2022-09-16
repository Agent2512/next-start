import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { hasAccess } from "../../../../utils/server/hasAccess"
import { prismaConnect } from "../../../../utils/server/prismaConnect"

export default async function takeFollow(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["satisfaction/table"])
    if (!access) return

    const session = await getSession({ req })
    if (!session || !session.user) return res.status(401).json({ error: "Unauthorized" })

    const { user } = session

    const { id } = req.body as { id: number }

    const data = await prismaConnect.satisfactionState.update({
        where: {
            id
        },
        data: {
            state: "HAS-FOLLOW",
            userEmail: user.email
        }
    })

    return res.json(data);
}