import { A, N, pipe } from "@mobily/ts-belt"
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
            const newestTracking = pipe(
                o.trackings,
                A.keepMap(t => {
                    if (t.StatusUpdate == null) return
                    return t.StatusUpdate.toISOString()
                }),
                A.reduce(new Date("0").toISOString(), (acc2, date) => {
                    return dayjs(date).isAfter(dayjs(acc2)) ? date : acc2
                }),
                dayjs
            )

            const days = dayjs(newestTracking).diff(o.DateCreated, "day")

            let counter = 0

            for (let i = 0; i < days; i++) {
                const date = dayjs(o.DateCreated).add(i, "day")
                if (date.day() != 0 && date.day() != 6) {
                    counter++
                }
            }

            if (N.lte(counter, 3)) return acc = acc + 1

            return acc
        })
    )

    return res.json({
        orders: orderWithTracking.length,
        ordersWithThreeDelivery: ThreeDaysDelivery
    })
}

export interface ThreeDaysDeliveryResponse {
    orders: number;
    ordersWithThreeDelivery: number;

}
