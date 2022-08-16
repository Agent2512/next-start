import { NextApiRequest, NextApiResponse } from "next"
import { hasAccess } from "../../../utils/server/hasAccess"

export default async function inCustoms(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["tracking"])
    if (!access) return


    return res.json({ message: "inCustoms" })
}