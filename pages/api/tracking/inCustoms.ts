import { A, pipe } from "@mobily/ts-belt"
import dayjs from "dayjs"
import { NextApiRequest, NextApiResponse } from "next"
import { getOrders, makeSiteFilter } from "../../../utils/server/getOrders"
import { hasAccess } from "../../../utils/server/hasAccess"

export default async function inCustoms(req: NextApiRequest, res: NextApiResponse<InCustomsResponse>) {
    const access = await hasAccess(req, res, ["tracking"])
    if (!access) return

    const body = req.body
    const filter = body.filter
    const days = Number(filter.days)
    const sites = filter.sites



    const orderWithTracking = await getOrders({
        where: {
            DateCreated: {
                gt: dayjs().subtract(days, "day").startOf("day").add(2, "hour").toDate()
            },
            ...makeSiteFilter(sites)
        },
        orderBy: {
            DateCreated: "desc"
        }
    },
        {
            Tracking: {
                not: null
            },
            Status: {
                equals: "CUSTOMS"
            }
        })

    return res.json({
        orders: orderWithTracking.length,
        ordersInCustoms: A.filter(orderWithTracking, o => o.trackings.length != 0).length
    })
}

export interface InCustomsResponse {
    orders: number;
    ordersInCustoms: number;
}