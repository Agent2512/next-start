import { D } from "@mobily/ts-belt";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { prismaConnect } from "../../../utils/server/prismaConnect";

const secret = process.env.NEXT_AUTH_JWT_SECRET

export default async function accessPanels(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret })

    if (token === null || token.email === null) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prismaConnect.user.findUnique({
        where: {
            email: token.email,
        },
        include: {
            accessPanels: {
                include: {
                    type: true,
                }
            }
        }
    })

    if (user == null) {
        return res.status(401).json({ message: "Not logged in" });
    }

    const accessPanels = user.accessPanels;

    return res.status(200).json(accessPanels);
}