import { NextApiRequest, NextApiResponse } from "next";
import { hasAccess } from "../../../../utils/server/hasAccess";
import { prismaConnect } from "../../../../utils/server/prismaConnect";
import { FeedWithUpdate } from "../getAllFeeds";

export default async function feedDelete(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["feed/admin"])
    if (!access) return

    const body: FeedWithUpdate = req.body;

    const feed = await prismaConnect.feed.delete({
        where: {
            id: body.id,
        }
    })

    return res.json(feed)
}