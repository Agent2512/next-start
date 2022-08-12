import { NextApiRequest, NextApiResponse } from "next";
import { AccessPanelType, AccessPanel } from "../../../prisma/lib/main";
import { hasAccess } from "../../../utils/server/hasAccess";
import { prismaConnect } from "../../../utils/server/prismaConnect";

export default async function allAccessPanelTypes(req: NextApiRequest, res: NextApiResponse<allAccessPanelTypesResponse[]>) {
    const access = await hasAccess(req, res, ["user/panels", "user/admin"])
    if (!access) return

    const data = await prismaConnect.accessPanelType.findMany({
        include: {
            accessPanels: true
        }
    })

    return res.json(data)
}

export type allAccessPanelTypesResponse = (AccessPanelType & {
    accessPanels: AccessPanel[];
})