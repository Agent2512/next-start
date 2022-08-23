import { A, F, pipe } from "@mobily/ts-belt"
import { NextApiRequest, NextApiResponse } from "next"
import { hasAccess } from "../../../utils/server/hasAccess"
import { prismaConnect } from "../../../utils/server/prismaConnect"

export default async function trackingStates(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["tracking/table"])
    if (!access) return

    const body = req.body
    const _ids = body.ids as number[]

    const ids = pipe(_ids, A.sort((a, b) => a - b), F.toMutable)

    const data = await prismaConnect.trackingState.findMany({
        where: {
            id: {
                in: ids
            },
        },
        select: {
            id: true,
            state: true,
            userEmail: true,
            user: {
                select: {
                    email: true,
                    name: true,
                }
            }
        }
    })

    return res.json(data)
}

export type trackingStatesResponse = {
    id: number;
    state: string;
    userEmail: string | null;
    user: {
        email: string;
        name: string;
    } | null;
}