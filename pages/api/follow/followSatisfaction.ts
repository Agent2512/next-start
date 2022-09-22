import { A, F, pipe } from "@mobily/ts-belt"
import console from "console"
import { NextApiRequest, NextApiResponse } from "next"
import { SatisfactionState } from "../../../prisma/lib/main"
import { Satisfaction } from "../../../prisma/lib/saf"
import { makeSiteFilter } from "../../../utils/server/getOrders"
import { hasAccess } from "../../../utils/server/hasAccess"
import { prismaConnect, prismaConnect_saf } from "../../../utils/server/prismaConnect"

export default async function followSatisfaction(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["followTable"])
    if (!access) return

    const body = req.body
    console.log(body);

    const satisfactionStates = await prismaConnect.satisfactionState.findMany({
        where: {
            state: body.status == "ALL" ? undefined : body.status,
        }
    })

    const data = await prismaConnect_saf.satisfaction.findMany({
        where: {
            Id: {
                in: pipe(satisfactionStates, A.map((x) => x.id), F.toMutable)
            },
            Order: {
                every: {
                    ...makeSiteFilter(body.sites),
                }
            }
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


    console.log(dataAndStates);
    return res.json(dataAndStates)
}

export type followSatisfactionResponse = Satisfaction & {
    state: SatisfactionState
}