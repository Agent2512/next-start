import { D, pipe } from "@mobily/ts-belt"
import { NextApiRequest, NextApiResponse } from "next"
import { hasAccess } from "../../../../utils/server/hasAccess"
import { prismaConnect } from "../../../../utils/server/prismaConnect"

export default async function updateAccessPanel(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["user/panels"])
    if (!access) return


    const panel = pipe(req.body, D.deleteKeys(["users", "type"])) 

    const newData = await prismaConnect.accessPanel.update({
        where: { id: panel.id },
        data: {
            typeId: panel.typeId,
            panel: panel.panel,
            url: panel.url,
        }
    })


    return res.json({ success: true, newData })
}