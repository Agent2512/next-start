import { D, pipe } from "@mobily/ts-belt"
import { conv } from "color-shorthand-hex-to-six-digit"
import { NextApiRequest, NextApiResponse } from "next"
import { hasAccess } from "../../../../utils/server/hasAccess"
import { prismaConnect } from "../../../../utils/server/prismaConnect"

export default async function updatePanelType(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["user/panels"])
    if (!access) return


    const panelType = pipe(req.body, D.deleteKeys(["accessPanels"])) 

    const newData = await prismaConnect.accessPanelType.update({
        where: { id: panelType.id },
        data: {
            type: panelType.type,
            color: conv(panelType.color),
        }
    })

    return res.json({ success: true, newData })
}