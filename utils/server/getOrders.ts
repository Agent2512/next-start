import { pipe, A, F, D, O } from "@mobily/ts-belt"
import dayjs from "dayjs"
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

const orderIdfilter = A.reduce<number, OrderIdFilter[]>([], (acc, n) => {
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