import { NextApiRequest, NextApiResponse } from "next"
import { getOrders, makeSiteFilter, OrderWithTracking } from "../../../utils/server/getOrders"
import { hasAccess } from "../../../utils/server/hasAccess"

export default async function tableData(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["tracking/table"])
    if (!access) return

    const body = req.body
    const filter = body.filter
    const numPage = Number(filter.page)
    const sites = filter.sites

    const orderWithTracking = await getOrders({
        where: {
            ...makeSiteFilter(sites)
        },
        orderBy: {
            DateCreated: "desc",
        },
        take: 100,
        skip: 10 * (numPage - 1)
    })


    return res.json(orderWithTracking)
}

export type TableDataResponse = OrderWithTracking[]