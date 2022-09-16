import { NextApiRequest, NextApiResponse } from "next";
import { hasAccess } from "../../../../utils/server/hasAccess";
import { prismaConnect } from "../../../../utils/server/prismaConnect";
import { FeedWithUpdate } from "../getAllFeeds";

export default async function feedNew(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["feed/admin"])
    if (!access) return

    const body: FeedWithUpdate = req.body;

    const feed = await prismaConnect.feed.create({
        data: {
            feedName: body.feedName,
            durationProduct: body.durationProduct,
            durationPrice: body.durationPrice,
            siteId: body.siteId,
            webShop: body.webShop,
        }
    })

    return res.json(feed)
}