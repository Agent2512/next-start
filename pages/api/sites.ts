import { NextApiRequest, NextApiResponse } from "next";
import { prismaConnect_common } from "../../utils/server/prismaConnect";

export default async function sites(req: NextApiRequest, res: NextApiResponse<sitesResponse[]>) {

    const sites = await prismaConnect_common.siteinformation.findMany({
        where: {
            active: true
        },
        select: {
            name: true,
            backendid: true,
            siteid: true,
            website: true,
        }
    })

    return res.status(200).json(sites);
}

export type sitesResponse = {
    name: string | null;
    backendid: number;
    siteid: number;
    website: string;
}