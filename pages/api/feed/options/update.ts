import { A } from "@mobily/ts-belt";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { useApi as Api } from "../../../../hooks/useApi";
import { hasAccess } from "../../../../utils/server/hasAccess";
import { prismaConnect } from "../../../../utils/server/prismaConnect";
import { FeedWithUpdate } from "../getAllFeeds";

const FEED_KEY_UPDATE_PRICE = process.env.FEED_KEY_UPDATE_PRICE
const FEED_KEY_UPDATE_PRODUCT = process.env.FEED_KEY_UPDATE_PRODUCT

export default async function feedUpdate(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["feed"])
    if (!access) return

    const body = req.body;
    const { siteId, webShop, type }: { siteId: number, webShop: string, type: "product" | "price" } = body;
    const typeCap = type.charAt(0).toUpperCase() + type.slice(1) as "Product" | "Price"

    const feed = await prismaConnect.feed.findFirst({
        where: {
            siteId,
            webShop,
        },
        orderBy: {
            feedName: "asc"
        },
        include: {
            feedUpdate: {
                orderBy: {
                    updateDate: "desc"
                },
                distinct: ["type"],
                take: 2,
            },
        },
    })

    const uniqueFeed: FeedWithUpdate | null = await prismaConnect.feed.findFirst({
        where: {
            siteId: 0,
            webShop: "all",
        },
        include: {
            feedUpdate: {
                orderBy: {
                    updateDate: "desc"
                },
                distinct: ["type"],
                take: 2,
            },
        },
    })

    if (feed == null) return;

    const feedUpdate = A.find(feed.feedUpdate, f => f.type == type)
    if (feedUpdate && dayjs().isBefore(feedUpdate.updateDone)) return

    if (uniqueFeed) {
        const uniqueFeedUpdate = A.find(uniqueFeed.feedUpdate, f => f.type == type)
        if (uniqueFeedUpdate && dayjs().isBefore(uniqueFeedUpdate.updateDone)) return
    }

    if (process.env.NODE_ENV == "production") {
        const { get } = Api("https://productfeed.navo-it.dk/api/feed/")

        if (siteId == 0 && webShop == "all") {
            if (type == "product") get(`updateall?key=${FEED_KEY_UPDATE_PRODUCT}`)
            if (type == "price") get(`updateallprices?key=${FEED_KEY_UPDATE_PRICE}`)
        }
        else {
            if (type == "product") get(`update?webshop=${webShop}?siteid=${siteId}?key=${FEED_KEY_UPDATE_PRODUCT}`)
            if (type == "price") get(`updateprices?webshop=${webShop}?siteid=${siteId}?key=${FEED_KEY_UPDATE_PRICE}`)
        }
    }
    else {
        console.log(`${typeCap} updated for ${feed.feedName}`);
    }

    await prismaConnect.feedUpdate.create({
        data: {
            feedId: feed.id,
            duration: feed[`duration${typeCap}`],
            type: type,
            updateDone: dayjs().add(feed[`duration${typeCap}`], "m").toISOString(),
        }
    })


    return res.json({
        status: "success",
    })
}