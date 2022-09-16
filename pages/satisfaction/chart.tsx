import { Flex, Grid, GridItem, useColorMode } from "@chakra-ui/react"
import { useSize } from "@chakra-ui/react-use-size"
import { A, D } from "@mobily/ts-belt"
import { useQuery } from "@tanstack/react-query"
import type { ApexOptions } from 'apexcharts'
import dayjs from "dayjs"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
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
        width: 1650,
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
        width: [6, 8, 3, 2, 2, 2, 2, 2, 2, 2],
        curve: 'straight',
    },
}

const testdata: ApexAxisChartSeries = [
    {
        name: "loading data or error",
        data: [
            {
                x: 0,
                y: 0
            },
            {
                x: 1,
                y: 1.5
            },
            {
                x: 2,
                y: 0
            }
        ]
    }
]

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
                title: "Last",
                buttonTexts: ["7 days", "30 days", "3 months"],
                buttonValues: [7, 30, 90],
            },
            {
                type: "ButtonGroup",
                key: "time",
                title: "Current",
                buttonTexts: ["week", "month", "quarter", "year"],
                buttonValues: ["week", "month", "quarter", "year"],
            },
            {
                type: "Date",
                key: "from",
                title: "From",
                defaultValue: dayjs().subtract(7, "days").format("YYYY-MM-DD"),
            },
            {
                type: "Date",
                key: "to",
                title: "To",
                defaultValue: dayjs().format("YYYY-MM-DD"),
            },
        ],

    })
    const { colorMode } = useColorMode()
    const [dateFocus, setDateFocus] = useState<"time" | "from-to">("time")
    const [filterState, setFilterState] = useState(filterValue)
    const { post } = useApi("/api/satisfaction/")
    const ChartBoxRef = useRef<HTMLDivElement>(null)
    const ChartBoxDim = useSize(ChartBoxRef)
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
    const [chartData, setChartData] = useState<ApexAxisChartSeries>(testdata)

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

    useEffect(() => {
        if (data == undefined) return

        const newChartData: ApexAxisChartSeries = [
            {
                name: "Sent today",
                data: mapChartData(data, "sent"),
                type: "area",
                color: "#44f"
            },
            {
                name: "Sent today: Answered",
                data: mapChartData(data, "sentWithAnswered"),
                type: "line",
                color: "#4f4",
            },
            {
                name: "Sent today: Average score",
                data: mapChartData(data, "sentScoresAvg"),
                type: "line",
                color: "#f44",
            },
            {
                name: "Sent today: TP sent",
                data: mapChartData(data, "sentWithSentTP"),
                type: "line",
                color: "#4ff",
            },
            {
                name: "Sent today: TP answered",
                data: mapChartData(data, "sentWithSentTPWithAnswered"),
                type: "line",
                color: "#f4f",
            },


            {
                name: "TP sent today",
                data: mapChartData(data, "sentTP"),
                type: "line",
                color: "#f94",
            },
            {
                name: "TP sent today: Answered",
                data: mapChartData(data, "sentTPWithAnswered"),
                type: "line",
                color: "#FA5935",
            },


            {
                name: "Answered today",
                data: mapChartData(data, "answered"),
                type: "line",
                color: "#AC0FD2"
            },
            {
                name: "Answered today: Average score",
                data: mapChartData(data, "answeredScoresAvg"),
                type: "line",
                color: "#473910"
            },
            {
                name: "TP answered today",
                data: mapChartData(data, "answeredTP"),
                type: "line",
                color: "#1F2F49"
            },
        ]

        setChartData(newChartData)
    }, [data])

    return (
        <Layout>
            {Filter}

            <Flex w={"full"}>
                <Grid w={"full"} templateColumns={"14fr 1fr"} gap={2}>
                    <GridItem ref={ChartBoxRef} borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1} p={2}>
                        <Chart
                            options={chartOptions}
                            series={chartData}
                            height={"500"}
                        />
                    </GridItem>
                    {/* <GridItem bg="red">test</GridItem> */}
                </Grid>
            </Flex>
        </Layout>
    )
}

SatisfactionChart.auth = true

export default SatisfactionChart