import { Box, Flex, Grid, GridItem, Text, useColorMode } from "@chakra-ui/react"
import { A, D } from "@mobily/ts-belt"
import { useQuery } from "@tanstack/react-query"
import type { ApexOptions } from 'apexcharts'
import dayjs from "dayjs"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import Layout from "../../components/layout"
import { useApi } from "../../hooks/useApi"
import { useFilter } from "../../hooks/useFilter"
import { ChartDataResponse } from "../api/satisfaction/chartData"

const Chart = dynamic(() => import("react-apexcharts"),
    {
        ssr: false,
        loading: () => <div>Loading...</div>
    })

const chartOptions: ApexOptions = {
    chart: {
        type: 'line',
        toolbar: {

        },
        zoom: {
            enabled: false
        },
        animations: {
            enabled: true,
            easing: "linear",
        }
    },
    tooltip: {
        enabled: true,
        y: {
            formatter(val) {
                return String(val)
            },
        }
    },
    fill: {
        type: 'solid',
    },
    yaxis: {
        decimalsInFloat: 0,
        min: 0,
        max: n => n + 10 - n % 10,
    },
    dataLabels: {
        enabled: true,
    },
    stroke: {
        // width: [6, 8, 3, 2, 2, 2, 2, 2, 2, 2],
        curve: 'straight',
    },
}

const mapChartData = (data: ChartDataResponse[], key: keyof ChartDataResponse) => {
    return A.map(data, item => {
        return {
            x: item.date,
            y: item[key]
        }
    }) as { x: string; y: number; }[]
}

const SatisfactionChart = () => {
    const { Filter, value: filterValue, setValue: setFilterValues } = useFilter({
        justifyContent: "center",
        filters: [
            {
                type: "Sites",
                key: "sites",
            },
            {
                type: "ButtonGroup",
                key: "time",
                title: "Current",
                buttonTexts: ["week", "month", "quarter", "year"],
                buttonValues: ["week", "month", "quarter", "year"],
            },
            {
                type: "ButtonGroup",
                key: "time",
                title: "Last",
                buttonTexts: ["7 days", "30 days", "3 months"],
                buttonValues: [
                    7,
                    30,
                    dayjs().diff(dayjs().subtract(3, "months"), "days")
                ],
            },
            {
                type: "Date",
                key: "from",
                title: "From",
                defaultValue: dayjs().subtract(6, "days").format("YYYY-MM-DD"),
            },
            {
                type: "Date",
                key: "to",
                title: "To",
                defaultValue: dayjs().format("YYYY-MM-DD"),
            },
        ],

    })
    const [dateFocus, setDateFocus] = useState<"time" | "from-to">("time")
    const { post } = useApi("/api/satisfaction/")
    const { data, isSuccess } = useQuery(
        [
            "satisfactionTableData",
            D.selectKeys(filterValue, [
                dateFocus == "time" ? "time" : "",
                dateFocus == "from-to" ? "from" : "",
                dateFocus == "from-to" ? "to" : "",
            ]),
            filterValue.sites,
        ],
        () => post<ChartDataResponse[]>("chartData", { filter: filterValue, dateFocus }),
    )

    useEffect(() => {
        const inputs = document.getElementsByClassName("chakra-input")
        const inputsArray = Array.from(inputs) as HTMLInputElement[]
        inputsArray.forEach((input) => {
            if (input.type != "date") return
            input.addEventListener("click", () => {
                setDateFocus("from-to")
            })
        })

        const buttons = document.getElementsByClassName("chakra-button")
        const buttonsArray = Array.from(buttons) as HTMLButtonElement[]
        buttonsArray.forEach((button) => {
            if (button.name != "time") return
            button.addEventListener("click", () => {
                setDateFocus("time")
            })
        })
    }, [])

    return (
        <Layout>
            {Filter}

            <Flex w={"full"}>
                <Grid w={"full"} templateColumns={"14fr 1fr"} gap={2}>
                    <MyChart key={1} data={data || undefined} dataKeys={["sent", "sentWithAnswered", "sentScoresAvg", "sentWithSentTP", "sentWithSentTPWithAnswered"]} />
                    <MyChart key={2} data={data || undefined} dataKeys={["sentTP", "sentTPWithAnswered", "answered", "answeredScoresAvg", "answeredTP"]} />
                </Grid>
            </Flex>
        </Layout>
    )
}

SatisfactionChart.auth = true

export default SatisfactionChart

interface Props {
    data: ChartDataResponse[] | undefined
    dataKeys: (keyof ChartDataResponse)[]
}

const MyChart = ({ data, dataKeys }: Props) => {
    const { colorMode } = useColorMode()
    const [chartData, setChartData] = useState<ApexAxisChartSeries>([])

    useEffect(() => {
        if (data == undefined) return

        let newChartData: ApexAxisChartSeries = []

        if (dataKeys.includes("sent")) newChartData.push({
            name: "Sent today",
            data: mapChartData(data, "sent"),
            type: "area",
            color: "#44f"
        })

        if (dataKeys.includes("sentWithAnswered")) newChartData.push({
            name: "Sent today: Answered",
            data: mapChartData(data, "sentWithAnswered"),
            type: "line",
            color: "#4f4",
        })

        if (dataKeys.includes("sentScoresAvg")) newChartData.push({
            name: "Sent today: Average score",
            data: mapChartData(data, "sentScoresAvg"),
            type: "line",
            color: "#f44",
        })

        if (dataKeys.includes("sentWithSentTP")) newChartData.push({
            name: "Sent today: TP sent",
            data: mapChartData(data, "sentWithSentTP"),
            type: "line",
            color: "#4ff",
        })

        if (dataKeys.includes("sentWithSentTPWithAnswered")) newChartData.push({
            name: "Sent today: TP answered",
            data: mapChartData(data, "sentWithSentTPWithAnswered"),
            type: "line",
            color: "#f4f",
        })

        if (dataKeys.includes("sentTP")) newChartData.push({
            name: "TP sent today",
            data: mapChartData(data, "sentTP"),
            type: "line",
            color: "#f94",
        })

        if (dataKeys.includes("sentTPWithAnswered")) newChartData.push({
            name: "TP sent today: Answered",
            data: mapChartData(data, "sentTPWithAnswered"),
            type: "line",
            color: "#FA5935",
        })

        if (dataKeys.includes("answeredTP")) newChartData.push({
            name: "TP answered today",
            data: mapChartData(data, "answeredTP"),
            type: "line",
            color: "#1F2F49"
        })

        if (dataKeys.includes("answered")) newChartData.push({
            name: "Answered today",
            data: mapChartData(data, "answered"),
            type: "line",
            color: "#AC0FD2"
        })

        if (dataKeys.includes("answeredScoresAvg")) newChartData.push({
            name: "Answered today: Average score",
            data: mapChartData(data, "answeredScoresAvg"),
            type: "line",
            color: "#473910"
        })

        setChartData(newChartData)
    }, [data, dataKeys])

    return (
        <>
            <GridItem borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1} p={2}>
                <Chart
                    options={chartOptions}
                    series={chartData}
                    height={"350"}
                />
            </GridItem>
            <Flex borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1} flexDir="column" gap={5}>
                <Text textAlign={"center"}>data average</Text>

                <Flex flexDir="column" justifyContent="center" alignItems="center" gap={5}>
                    {A.map(chartData, (row) => {
                        const yArray = (row.data as { x: string, y: number }[]).map(t => t.y)
                        const avg = A.reduce(yArray, 0, (a, b) => Number(a) + Number(b)) / yArray.length

                        return (
                            <Flex key={row.name} flexDir="column" alignItems="center">
                                <Box w={"15px"} h={"15px"} borderRadius={"md"} bg={row.color} />
                                <Text>
                                    {avg.toFixed(2)}
                                </Text>
                            </Flex>
                        )
                    })}
                </Flex>
            </Flex>
        </>
    )
}