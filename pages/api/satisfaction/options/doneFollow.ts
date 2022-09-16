import { NextApiRequest, NextApiResponse } from "next";
import { hasAccess } from "../../../../utils/server/hasAccess";
import { prismaConnect } from "../../../../utils/server/prismaConnect";

export default async function doneFollow(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["satisfaction/table"])
    if (!access) return

    const { id } = req.body as { id: number }

    const data = await prismaConnect.satisfactionState.update({
        where: {
            id
        },
        data: {
            state: "FOLLOW-DONE",
        }
    })

    return res.json(data);
}