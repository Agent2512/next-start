import { NextApiRequest, NextApiResponse } from "next"
import { AccessPanel, AccessPanelType } from "../../../prisma/lib/main"
import { hasAccess } from "../../../utils/server/hasAccess"
import { prismaConnect } from "../../../utils/server/prismaConnect"

export default async function allUsers(req: NextApiRequest, res: NextApiResponse<AllUsersResponse[]>) {
    const access = await hasAccess(req, res, ["user/admin"])
    if (!access) return 

    const users = await prismaConnect.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            accessPanels: {
                include: {
                    type: true,
                },
            }
        }
    })

    return res.json(users)
}

export type AllUsersResponse = {
    accessPanels: (AccessPanel & { type: AccessPanelType | null; })[];
    id: string;
    email: string | null;
    name: string | null;
}