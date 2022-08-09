import { D } from "@mobily/ts-belt";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { prismaConnect } from "../../../utils/server/prismaConnect";

const secret = process.env.NEXT_AUTH_JWT_SECRET

export default async function userAccessPanels(req: NextApiRequest, res: NextApiResponse) {
    const token = await getToken({ req, secret })

    if (token === null || token.email === null) {
        return res.status(401).json([]);
    }

    const user = await prismaConnect.user.findUnique({
        where: {
            email: token.email,
        },
        include: {
            accessPanels: {
                include: {
                    type: true,
                },
                orderBy: {
                    type: {
                        type: "asc",
                    }
                }
            }
        }
    })

    if (user == null) {
        return res.status(401).json([]);
    }

    const accessPanels = user.accessPanels;

    // return res.status(200).json([]);
    return res.status(200).json(accessPanels);
}