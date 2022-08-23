import { A, F, pipe } from "@mobily/ts-belt"
import { Order, Prisma, Tracking } from "../../prisma/lib/saf"
import { prismaConnect_saf } from "./prismaConnect"

export type OrderWithTracking = Order & {
    trackings: Tracking[]
}

export const getOrders = async (orderArgs?: Prisma.OrderFindManyArgs, trackingArgs?: Prisma.TrackingWhereInput) => {

    const orders = await prismaConnect_saf.order.findMany(orderArgs)

    const orderIds = pipe(orders, A.map(o => o.Id), A.uniq, A.sort((a, b) => a - b), orderIdfilter, F.toMutable)

    const trackings = await prismaConnect_saf.tracking.findMany({
        where: {
            ...trackingArgs,
            OR: orderIds
        },
        orderBy: {
            StatusUpdate: "desc",
        }
    })

    const orderWithTracking = A.reduce<Order, OrderWithTracking[]>(orders, [], (acc, o) => {
        const tracks = F.toMutable(A.filter(trackings, t => t.OrderId == o.Id))

        const newRow: OrderWithTracking = {
            ...o,
            trackings: tracks
        }

        return [
            ...acc,
            newRow
        ]
    })

    return orderWithTracking
}

type OrderIdFilter = { OrderId: { gte: number, lte: number } }

export const orderIdfilter = A.reduce<number, OrderIdFilter[]>([], (acc, n) => {
    const last = A.last(acc)

    if (!last) {
        return [{
            OrderId: {
                gte: n,
                lte: n
            }
        }]
    }

    if (last.OrderId.lte + 1 == n) {
        const index = acc.indexOf(last)
        acc[index] = {
            OrderId: {
                gte: last.OrderId.gte,
                lte: n
            }
        }
    }
    else {
        return [
            ...acc,
            {
                OrderId: {
                    gte: n,
                    lte: n
                }
            }
        ]
    }

    return acc
})

export const makeSiteFilter = (sites: string) => {
    if (sites == "all") return { ShopId: undefined, SiteId: { in: undefined } }

    const siteArray = sites.split(",")
    const [shopId, ...siteIds] = siteArray

    const ret = {
        ShopId: Number(shopId),
        SiteId: { in: siteIds.map(s => Number(s)) }
    }

    return ret
}