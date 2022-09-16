import { A, D, F, N, pipe } from "@mobily/ts-belt"
import { NextApiRequest, NextApiResponse } from "next"
import { SatisfactionState, User } from "../../../prisma/lib/main"
import { Order, Satisfaction } from "../../../prisma/lib/saf"
import { makeSiteFilter } from "../../../utils/server/getOrders"
import { hasAccess } from "../../../utils/server/hasAccess"
import { prismaConnect, prismaConnect_common, prismaConnect_saf } from "../../../utils/server/prismaConnect"

export default async function satisfactionTableData(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["satisfaction/table"])
    if (!access) return

    const body = req.body
    const filter = body.filter


    const numPage = Number(filter.page)
    const perPage = 10

    const orderNumber = filter.orderNumber as string
    const score = filter.score as number

    if (N.lte(numPage, 0)) return res.json([])

    const siteinformation = await prismaConnect_common.siteinformation.findMany()

    const data = await prismaConnect_saf.satisfaction.findMany({
        orderBy: {
            CreatedDate: "desc"
        },
        include: {
            Order: true
        },
        where: {
            NOT: {
                Score: null
            },
            Score: score == -1 ? undefined : score,
            Order: {
                every: {
                    ...makeSiteFilter(filter.sites),
                }
            }
        },
        skip: (numPage - 1) * perPage,
        take: perPage
    })

    const satisfactionStates = await prismaConnect.satisfactionState.findMany({
        where: {
            id: {
                in: pipe(data, A.map(s => s.Id), F.toMutable)
            }
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

    const result = pipe(
        data,
        A.reduce<typeof data[0], any>([], (acc, sa) => {
            const state = A.getBy(satisfactionStates, st => st.id == sa.Id)
            const site = A.getBy(siteinformation, s => s.backendid == sa.Order[0].ShopId && s.siteid == sa.Order[0].SiteId)

            const order = sa.Order[0]

            if (site) {
                order.Webshop = site.website
            }

            const newSa = pipe(
                sa,
                D.set("satisfactionState", state ? state : null),
                // D.deleteKey("Order"),
                D.set("Order", order),
            )

            // const newSa = D.set(sa, "satisfactionState", state ? state : null)
            // const test = D.set(newSa, "Order", order)



            return [
                ...acc,
                newSa
            ]
        }),
        F.toMutable
    )

    // console.log(JSON.stringify(result, null, 2));
    // console.log("ids", pipe(data, A.map(s => s.Id), F.toMutable));

    return res.json(result)
}

export type SatisfactionTableDataResponse = Satisfaction & {
    Order: Order;
    satisfactionState: (SatisfactionState & { user: User | null }) | null;
}



