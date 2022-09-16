import dayjs from 'dayjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Feed, FeedUpdate } from '../../../prisma/lib/main';
import { hasAccess } from '../../../utils/server/hasAccess';
import { prismaConnect } from '../../../utils/server/prismaConnect';

export default async function getAllFeeds(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["feed", "feed/admin"])
    if (!access) return

    // get unique feed
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

    const feeds: FeedWithUpdate[] = await prismaConnect.feed.findMany({
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
    }).then((feeds: FeedWithUpdate[]) => feeds.map(feed => {
        if (uniqueFeed == null) return feed
        const lastUniqueFeedProductUpdate = uniqueFeed.feedUpdate.find(update => update.type === "product")
        const lastUniquePriceUpdate = uniqueFeed.feedUpdate.find(update => update.type === "price")

        if (lastUniqueFeedProductUpdate) {
            const lastFeedProductUpdate = feed.feedUpdate.find(update => update.type === "product")

            if (lastFeedProductUpdate) {
                const isBefore = dayjs(lastFeedProductUpdate.updateDate).isBefore(dayjs(lastUniqueFeedProductUpdate.updateDate))

                if (isBefore) {
                    const index = feed.feedUpdate.findIndex(update => update.type === "product")
                    feed.feedUpdate[index] = lastUniqueFeedProductUpdate
                }
            }
            else {
                feed.feedUpdate.push(lastUniqueFeedProductUpdate)
            }



        }

        if (lastUniquePriceUpdate) {
            const lastFeedPriceUpdate = feed.feedUpdate.find(update => update.type === "price")

            if (lastFeedPriceUpdate) {
                const isBefore = dayjs(lastFeedPriceUpdate.updateDate).isBefore(dayjs(lastUniquePriceUpdate.updateDate))

                if (isBefore) {
                    const index = feed.feedUpdate.findIndex(update => update.type === "price")
                    feed.feedUpdate[index] = lastUniquePriceUpdate
                }
            }
            else {
                feed.feedUpdate.push(lastUniquePriceUpdate)
            }
        }

        // is feed product newer then feed price 
        const feedProductUpdate = feed.feedUpdate.find(update => update.type === "product")
        const feedPriceUpdate = feed.feedUpdate.find(update => update.type === "price")

        if (feedProductUpdate && feedPriceUpdate) {
            const isAfter = dayjs(feedProductUpdate.updateDate).isAfter(dayjs(feedPriceUpdate.updateDate))

            if (isAfter) {
                const index = feed.feedUpdate.findIndex(update => update.type === "price")
                feed.feedUpdate[index] = {
                    ...feedProductUpdate,
                    type: "price",
                }
            }
        }
        else if (feedProductUpdate && feedPriceUpdate == undefined) {
            feed.feedUpdate.push({
                ...feedProductUpdate,
                type: "price",
            })
        }

        return feed
    }))



    return res.status(200).json(feeds)
}

export type FeedWithUpdate = Feed & { feedUpdate: FeedUpdate[] }