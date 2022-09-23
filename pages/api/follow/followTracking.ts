import { A, F, pipe } from "@mobily/ts-belt"
import { NextApiRequest, NextApiResponse } from "next"
import { User } from "next-auth"
import { getSession } from "next-auth/react"
import { SatisfactionState } from "../../../prisma/lib/main"
import { Tracking } from "../../../prisma/lib/saf"
import { hasAccess } from "../../../utils/server/hasAccess"
import { prismaConnect, prismaConnect_saf } from "../../../utils/server/prismaConnect"

export default async function followTracking(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["followTable"])
    if (!access) return

    const body = req.body
    const userScope = req.body.userScope as string

    let userEmail: undefined | string = undefined

    if (userScope == "ME") {
        const session = await getSession({ req })

        if (!session || !session.user.email) {
            return res.json([])
        }

        userEmail = session.user.email
    }

    const trackingStates = await prismaConnect.trackingState.findMany({
        where: {
            state: body.status == "ALL" ? undefined : body.status,
            userEmail
        },
        select: {
            id: true,
            state: true,
            userEmail: true,
            user: {
                select: {
                    name: true,
                    email: true,
                    id: true,
                }
            }
        }
    })

    const data = await prismaConnect_saf.tracking.findMany({
        where: {
            Id: {
                in: pipe(trackingStates, A.map((x) => x.id), F.toMutable)
            },
        }
    })

    const dataAndStates = pipe(
        data,
        A.map(x => {
            const state = A.find(trackingStates, (y) => y.id === x.Id)
            return {
                ...x,
                state
            }
        }),
        F.toMutable
    )

    return res.json(dataAndStates)
}

export type followTrackingResponse = Tracking & {
    state: SatisfactionState & {
        user: User
    }
}