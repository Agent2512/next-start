import { A, F, pipe } from "@mobily/ts-belt"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { SatisfactionState, User } from "../../../prisma/lib/main"
import { Satisfaction } from "../../../prisma/lib/saf"
import { hasAccess } from "../../../utils/server/hasAccess"
import { prismaConnect, prismaConnect_saf } from "../../../utils/server/prismaConnect"

export default async function followSatisfaction(req: NextApiRequest, res: NextApiResponse) {
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

    const satisfactionStates = await prismaConnect.satisfactionState.findMany({
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

    const data = await prismaConnect_saf.satisfaction.findMany({
        where: {
            Id: {
                in: pipe(satisfactionStates, A.map((x) => x.id), F.toMutable)
            },
        }
    })

    const dataAndStates = pipe(
        data,
        A.map(x => {
            const state = A.find(satisfactionStates, (y) => y.id === x.Id)
            return {
                ...x,
                state
            }
        }),
        F.toMutable
    )

    return res.json(dataAndStates)
}

export type followSatisfactionResponse = Satisfaction & {
    state: SatisfactionState & {
        user: User
    }
}