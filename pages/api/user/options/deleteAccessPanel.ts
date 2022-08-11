import { pipe, D } from "@mobily/ts-belt"
import { NextApiRequest, NextApiResponse } from "next"
import { hasAccess } from "../../../../utils/server/hasAccess"
import { prismaConnect } from "../../../../utils/server/prismaConnect"

export default async function deleteAccessPanel(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["user/panels"])
    if (!access) return


    const panel = pipe(req.body, D.deleteKeys(["users", "type"])) 

    const newData = await prismaConnect.accessPanel.delete({
        where: {
            id: panel.id,
        }
    })


    return res.json({ success: true, newData })
}