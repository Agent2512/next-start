import { A } from "@mobily/ts-belt"
import { NextApiRequest, NextApiResponse } from "next"
import { getOrders, makeSiteFilter, OrderWithTracking } from "../../../utils/server/getOrders"
import { hasAccess } from "../../../utils/server/hasAccess"
import { prismaConnect_common } from "../../../utils/server/prismaConnect"

export default async function tableData(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["tracking/table"])
    if (!access) return

    const body = req.body
    const filter = body.filter
    const numPage = Number(filter.page)
    const sites = filter.sites

    const siteinformation = await prismaConnect_common.siteinformation.findMany()

    const orderWithTracking = await getOrders({
        where: {
            ...makeSiteFilter(sites)
        },
        orderBy: {
            DateCreated: "desc",
        },
        skip: 10 * (numPage - 1),
        take: 100
    })
        .then(orders => {
            return orders.map(order => {
                const site = A.getBy(siteinformation, s => s.backendid == order.ShopId && s.siteid == order.SiteId)
                if (!site) return order

                const ret = {
                    ...order,
                    Webshop: site.website
                }

                return ret
            })
        })




    return res.json(A.slice(orderWithTracking, 0, 30))
}

export type TableDataResponse = OrderWithTracking