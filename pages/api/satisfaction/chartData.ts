
import { A, F, G, pipe } from "@mobily/ts-belt";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { makeSiteFilter } from "../../../utils/server/getOrders";
import { hasAccess } from "../../../utils/server/hasAccess";
import { prismaConnect_saf } from "../../../utils/server/prismaConnect";

// dayjs.extend(require("dayjs/plugin/utc"));
// dayjs.extend(require("dayjs/plugin/timezone"));




interface Ibody {
    dateFocus: string;
    filter: {
        sites: string;
        time: number | "week" | "month" | "quarter" | "year";
        from: string;
        to: string;
    }
}

export interface ChartDataResponse {
    // date on data
    date: string,
    // sent on day
    sent: number,
    // answered to day
    answered: number,
    // sent on day with answered
    sentWithAnswered: number,
    // scores
    sentScores: number[],
    answeredScores: number[],
    // avg scores
    sentScoresAvg: number,
    answeredScoresAvg: number,

    // sent TP in day
    sentTP: number,
    // sent TP in day with answered
    sentTPWithAnswered: number,
    // answered TP to day 
    answeredTP: number,

    // sent with sent TP on day
    sentWithSentTP: number
    // sent with sent TP on day with answered
    sentWithSentTPWithAnswered: number,
}

const cache: { [x: string]: { timestamp: string, data: ChartDataResponse } } = {}

export default async function satisfactionChartData(req: NextApiRequest, res: NextApiResponse) {
    const access = await hasAccess(req, res, ["satisfaction/chart"])
    if (!access) return

    const body = req.body as Ibody
    console.log(body);

    const bodyToKey = JSON.stringify(body)
    if (cache[bodyToKey] && dayjs().diff(dayjs(cache[bodyToKey].timestamp), "minute") < 5) {
        return res.json(cache[bodyToKey].data)
    }


    const timePeriod = getTimePeriod(body)
    const timePeriodDays = dayjs(timePeriod.to).diff(dayjs(timePeriod.form), "days")
    console.log(timePeriod, timePeriodDays);

    const allData = await prismaConnect_saf.satisfaction.findMany({
        orderBy: {
            CreatedDate: "asc"
        },
        // include: {
        // Order: true
        // },
        where: {
            Order: {
                every: {
                    ...makeSiteFilter(body.filter.sites),
                }
            },
            OR: [
                {
                    SatisfactionSent: {
                        lte: timePeriod.to,
                        gte: timePeriod.form
                    }
                },
                {
                    TrustPilotSent: {
                        lte: timePeriod.to,
                        gte: timePeriod.form
                    }
                },
                {
                    SatisfactionAnswered: {
                        lte: timePeriod.to,
                        gte: timePeriod.form
                    }
                },
                {
                    TrustPilotClicked: {
                        lte: timePeriod.to,
                        gte: timePeriod.form
                    }
                }
            ]
        }
    })

    const chartData = pipe(
        A.range(0, timePeriodDays),
        A.reduce<number, any>([], (acc, i) => {
            const date = dayjs(timePeriod.form).add(i, "day")

            // sent data
            const sent = pipe(
                allData,
                A.filter(data => dayjs(data.SatisfactionSent).isSame(date, "day")),
                A.length
            )

            const sentWithAnswered = pipe(
                allData,
                A.filter(data => dayjs(data.SatisfactionSent).isSame(date, "day") && data.SatisfactionAnswered != null),
                A.length
            )

            const sentWithSentTP = pipe(
                allData,
                A.filter(data => dayjs(data.SatisfactionSent).isSame(date, "day") && data.SatisfactionAnswered != null && data.Score == 5 && data.TrustPilotSent != null),
                A.length
            )

            const sentWithSentTPWithAnswered = pipe(
                allData,
                A.filter(data => dayjs(data.SatisfactionSent).isSame(date, "day") && data.SatisfactionAnswered != null && data.Score == 5 && data.TrustPilotSent != null && data.TrustPilotClicked != null),
                A.length
            )

            const sentScores = pipe(
                allData,
                A.filter(data => dayjs(data.SatisfactionSent).isSame(date, "day") && data.Score != null),
                A.map(data => data.Score),
            )

            // answered data
            const answered = pipe(
                allData,
                A.filter(data => dayjs(data.SatisfactionAnswered).isSame(date, "day")),
                A.length
            )

            const answeredScores = pipe(
                allData,
                A.filter(data => dayjs(data.SatisfactionAnswered).isSame(date, "day") && data.Score != null),
                A.map(data => data.Score),
            )

            // tp data
            const sentTP = pipe(
                allData,
                A.filter(data => dayjs(data.TrustPilotSent).isSame(date, "day")),
                A.length
            )

            const answeredTP = pipe(
                allData,
                A.filter(data => dayjs(data.TrustPilotClicked).isSame(date, "day")),
                A.length
            )

            const sentTPWithAnswered = pipe(
                allData,
                A.filter(data => dayjs(data.TrustPilotSent).isSame(date, "day") && data.TrustPilotClicked != null),
                A.length
            )

            // avg scores
            const sentScoresAvg = pipe(
                sentScores,
                A.reduce(0, (acc, score) => acc + (score ? score : 0)),
                sum => (sum == 0 ? 0 : sum / sentScores.length).toFixed(2)
            )

            const answeredScoresAvg = pipe(
                answeredScores,
                A.reduce(0, (acc, score) => acc + (score ? score : 0)),
                sum => (sum == 0 ? 0 : sum / answeredScores.length).toFixed(2)
            )


            const newRow = {
                date: date.format("DD-MM-YYYY"),
                sent, sentWithAnswered, sentWithSentTP, sentWithSentTPWithAnswered, sentScores,

                answered, answeredScores,

                sentTP, answeredTP, sentTPWithAnswered,

                sentScoresAvg, answeredScoresAvg
            }

            return [
                ...acc,
                newRow
            ]
        }),


        F.toMutable
    )



    cache[bodyToKey] = {
        timestamp: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        data: chartData as ChartDataResponse
    }

    console.log("cache", cache);


    return res.json(chartData)
    return res.json([])
}


const getTimePeriod = (body: Ibody): { to: Date, form: Date } => {
    if (body.dateFocus == "from-to") {
        return {
            to: new Date(dayjs(body.filter.to).endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
            form: new Date(dayjs(body.filter.from).startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
        }
    }
    else if (body.dateFocus == "time") {
        if (G.isNumber(body.filter.time)) {

            return {
                to: new Date(dayjs().endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
                form: new Date(dayjs().subtract(body.filter.time, "days").startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
            }
        }
        else if (body.filter.time == "week") {
            return {
                to: new Date(dayjs().endOf("week").add(1, "day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
                form: new Date(dayjs().startOf("week").add(1, "day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
            }
        }
        else if (body.filter.time == "month") {
            return {
                to: new Date(dayjs().endOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
                form: new Date(dayjs().startOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
            }
        }
        else if (body.filter.time == "year") {
            return {
                to: new Date(dayjs().endOf("year").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
                form: new Date(dayjs().startOf("year").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
            }
        }
        else if (body.filter.time == "quarter") {
            switch (dayjs().month()) {
                case 0:
                case 1:
                case 2:
                    return {
                        to: new Date(dayjs().set("month", 2).endOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
                        form: new Date(dayjs().set("month", 0).startOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
                    }
                case 3:
                case 4:
                case 5:
                    return {
                        to: new Date(dayjs().set("month", 5).endOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
                        form: new Date(dayjs().set("month", 3).startOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
                    }
                case 6:
                case 7:
                case 8:
                    return {
                        to: new Date(dayjs().set("month", 8).endOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
                        form: new Date(dayjs().set("month", 6).startOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
                    }
                case 9:
                case 10:
                case 11:
                    return {
                        to: new Date(dayjs().set("month", 11).endOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
                        form: new Date(dayjs().set("month", 9).startOf("month").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
                    }
            }
        }
    }


    return {
        to: new Date(dayjs().endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
        form: new Date(dayjs().startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"))
    }
}