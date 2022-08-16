import { NextApiRequest, NextApiResponse } from "next"
import { hasAccess } from "../../../../utils/server/hasAccess"
import { prismaConnect } from "../../../../utils/server/prismaConnect"
import { AllUsersResponse } from "../allUsers"

export default async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["user/admin"])
    if (!access) return

    const user = req.body as AllUsersResponse

    const newData = await prismaConnect.user.delete({
        where: {
            id: user.id
        },
        select: {id: true}
    })

    return res.json({ success: true, newData })
}