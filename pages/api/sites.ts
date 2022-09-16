import { A, pipe } from "@mobily/ts-belt";
import { NextApiRequest, NextApiResponse } from "next";
import { prismaConnect_common } from "../../utils/server/prismaConnect";



export default async function sites(req: NextApiRequest, res: NextApiResponse) {
    const query = req.query;
    const format = query.format as string;
    const active = query.active as string | undefined;

    const sites = await prismaConnect_common.siteinformation.findMany({
        where: {
            active: active == undefined ? true : active == "true" ? true : false
        },
        select: {
            id: true,
            name: true,
            backendid: true,
            siteid: true,
            website: true,
        },
        orderBy: {
            name: "asc"
        }
    })

    if (format === "list") {
        return res.json(sites);
    }

    const multibleNames = pipe(
        sites,
        A.keepMap(x => x.name),
        A.filter(name => sites.filter(x => x.name === name).length > 1),
        A.uniq
    )

    const out = A.reduce(sites, {} as sitesResponse, (acc, x) => {
        if (x.name && multibleNames.includes(x.name)) {
            if (!acc[x.name]) {
                acc[x.name] = []
            }
            acc[x.name].push(x)
        }
        else {
            if (!acc.other) {
                acc.other = []
            }
            acc.other.push(x)
        }


        return acc
    })


    return res.status(200).json(out);
}

type sites = {
    id: number;
    name: string | null;
    backendid: number;
    siteid: number;
    website: string;
}

export type sitesResponse = { [x: string]: sites[], other: sites[] }
export type sitesResponseList = sites[]