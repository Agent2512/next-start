import { A, pipe } from "@mobily/ts-belt"
import dayjs from "dayjs"
import { NextApiRequest, NextApiResponse } from "next"
import { getOrders, makeSiteFilter } from "../../../utils/server/getOrders"
import { hasAccess } from "../../../utils/server/hasAccess"

export default async function threeDaysDelivery(req: NextApiRequest, res: NextApiResponse<ThreeDaysDeliveryResponse>) {
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
                not: null,
            },
            Status: {
                equals: "DONE"
            },
            StatusUpdate: {
                not: null
            }
        })

        const ThreeDaysDelivery = pipe(
            orderWithTracking,
            A.filter(o => o.trackings.length != 0),
            A.reduce(0, (acc, o) => {
                // newestTracking by date
                const newestTracking = o.trackings


                return acc
            })
        )




    return res.json({
        orders: 0,
        ordersWithThreeDelivery: 0
    })
}

export interface ThreeDaysDeliveryResponse {
    orders: number;
    ordersWithThreeDelivery: number;

}