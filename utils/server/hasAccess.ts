import { A } from "@mobily/ts-belt";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prismaConnect } from "./prismaConnect";

const secret = process.env.NEXT_AUTH_JWT_SECRET

export async function hasAccess(req: NextApiRequest, res: NextApiResponse, urls: string[]) {
    const token = await getToken({ req, secret })

    if (token == null || !token.email) {
        res.status(401).json({ error: "No session" })
        return false
    }

    const { email } = token
    
    const user = await prismaConnect.user.findUnique({
        where: {
            email
        },
        select: {
            id: true,
            email: true,
            accessPanels: true,
        }
    })

    if (user == null) {
        res.status(401).json({ error: "No user" })
        return false
    }

    const sessionPanelUrl = A.map(user.accessPanels, p => p.url)
    const sessionHasPanel = A.filter(urls, url => {
        return A.includes(sessionPanelUrl, url)
    })

    if (sessionHasPanel.length != 0) {
        return true
    }

    res.status(401).json({ error: `No access to` })
    return false
}