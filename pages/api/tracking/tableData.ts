import { A, N, pipe, S } from "@mobily/ts-belt"
import { NextApiRequest, NextApiResponse } from "next"
import { getOrders, getOrdersTest, makeSiteFilter, orderIdfilter, OrderWithTracking } from "../../../utils/server/getOrders"
import { hasAccess } from "../../../utils/server/hasAccess"
import { prismaConnect_common, prismaConnect_saf } from "../../../utils/server/prismaConnect"

export default async function trackingTableData(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["tracking/table"])
    if (!access) return

    const body = req.body
    const filter = body.filter

    const numPage = Number(filter.page)
    const perPage = 10

    const orderNumber = filter.orderNumber as string
    const trackingNumberOrReference = filter.trackingNumberOrReference as string

    if (N.lte(numPage, 0)) return res.json([])

    const siteinformation = await prismaConnect_common.siteinformation.findMany()

    const trackingOrderIds = trackingNumberOrReference == "" ? null : await prismaConnect_saf.tracking.groupBy({
        by: ["OrderId"],
        where: {
            OR: [
                {
                    Reference: {
                        contains: trackingNumberOrReference
                    }
                },
                {
                    Tracking: {
                        contains: trackingNumberOrReference
                    }
                },

            ]
        },
        _count: true
    })

    const orderIds = trackingOrderIds == null ? null : pipe(
        trackingOrderIds,
        A.keepMap(o => { if (o.OrderId) return o.OrderId }),
        A.uniq,
        A.sort((a, b) => a - b),
        orderIdfilter,
        JSON.stringify,
        S.replaceAll("OrderId", "Id"),
        JSON.parse,
    )

    const orderWithTracking = orderIds != null ?
        await getOrdersTest(
            orderIds,
            {
                where: {
                    ...makeSiteFilter(filter.sites),
                    OrderNumber: {
                        gte: orderNumber == "" ? undefined : Number(orderNumber.padEnd(6, "0")),
                        lte: orderNumber == "" ? undefined : Number(orderNumber.padEnd(6, "9"))
                    },
                },
                take: perPage,
                skip: perPage * (numPage - 1),
                orderBy: {
                    DateCreated: "desc"
                }
            })
        : await getOrders({
            where: {
                ...makeSiteFilter(filter.sites),
                OrderNumber: {
                    gte: orderNumber == "" ? undefined : Number(orderNumber.padEnd(6, "0")),
                    lte: orderNumber == "" ? undefined : Number(orderNumber.padEnd(6, "9"))
                },
            },
            take: perPage,
            skip: perPage * (numPage - 1),
            orderBy: {
                DateCreated: "desc"
            }
        })

    return res.json(
        pipe(
            orderWithTracking,
            A.map(o => {
                const site = A.getBy(siteinformation, s => s.backendid == o.ShopId && s.siteid == o.SiteId)
                if (!site) return o
                return {
                    ...o,
                    Webshop: site.website,
                }
            })
        )
    )
}

export type TrackingTableDataResponse = OrderWithTracking