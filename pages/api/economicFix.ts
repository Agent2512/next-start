import { NextApiRequest, NextApiResponse } from "next"
import { useApi as api } from "../../hooks/useApi"
import { hasAccess } from "../../utils/server/hasAccess"
import { prismaConnect_saf } from "../../utils/server/prismaConnect"

export default async function economicFix(req: NextApiRequest, res: NextApiResponse<economicFixResponse>) {
    const access = await hasAccess(req, res, ["economicFix"])
    if (!access) return

    const body = req.body
    const orderNr = body.orderNr as string

    const order = await prismaConnect_saf.order.findFirst({
        where: {
            OrderNumber: Number(orderNr)
        }
    })

    if (!order) {
        return res.status(404).json({
            status: "Order not found"
        })
    }

    const { get } = api("http://nardocareconomic.navo-it.dk/api/web/")

    const test1 = await get<any>(`updateorder?orderid=${orderNr}`)

    const test2 = await get<any>(`QuickPass?Orderid=${orderNr}`)


    return res.json({
        status: "is should be fixed",
        test1,
        test2
    })
}

export type economicFixResponse = {
    status: string;
    [key: string]: any;
}