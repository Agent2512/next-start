import { NextApiRequest, NextApiResponse } from "next"
import { hasAccess } from "../../../../utils/server/hasAccess"
import { prismaConnect } from "../../../../utils/server/prismaConnect"
import { allAccessPanelsResponse } from "../allAccessPanels"
import { AllUsersResponse } from "../allUsers"

export default async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["user/admin"])
    if (!access) return

    const data = req.body as {
        panel: allAccessPanelsResponse
        setTo: boolean
        user: AllUsersResponse
    }

    if (data.setTo) {
        const newData = await prismaConnect.user.update({
            where: {
                id: data.user.id
            },
            data: {
                accessPanels: {
                    connect: {
                        id: data.panel.id
                    }
                }
            },
            select: {id: true}
        })
    
        return res.json({ success: true, newData })
    }
    else {
        const newData = await prismaConnect.user.update({
            where: {
                id: data.user.id
            },
            data: {
                accessPanels: {
                    disconnect: {
                        id: data.panel.id
                    }
                }
            },
            select: {id: true}
        })
    
        return res.json({ success: true, newData })
    }
}