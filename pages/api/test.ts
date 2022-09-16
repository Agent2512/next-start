import { genSaltSync, hashSync } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function satisfactionTableData(req: NextApiRequest, res: NextApiResponse) {
    const salt = genSaltSync(10, "b")
    console.log(salt);


    return res.json({
        pass1: hashSync("123456", salt),
        pass2: hashSync("123456", 10),
    })
}