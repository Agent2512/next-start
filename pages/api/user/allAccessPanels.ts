import { NextApiRequest, NextApiResponse } from "next";
import { AccessPanelType, User } from "../../../prisma/lib/main";
import { hasAccess } from "../../../utils/server/hasAccess";
import { prismaConnect } from "../../../utils/server/prismaConnect";

export default async function allAccessPanels(req: NextApiRequest, res: NextApiResponse<allAccessPanelsResponse[]>) {
    const access = await hasAccess(req, res, ["user/panels"])
    if (!access) return

    const data = await prismaConnect.accessPanel.findMany({
        select: {
            id: true,
            panel: true,
            url: true,
            typeId: true,
            type: true,
            users: {
                select: {id: true}
            }
        }
    })

    return res.json(data)
}

export type allAccessPanelsResponse = {
    users: {}[];
    id: number;
    panel: string;
    url: string;
    typeId: number | null;
    type: AccessPanelType | null;
}