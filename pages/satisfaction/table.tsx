import { Button, Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useColorMode } from "@chakra-ui/react"
import { A, N } from "@mobily/ts-belt"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { Session } from "next-auth"
import { useEffect, useState } from "react"
import Layout from "../../components/layout"
import { useApi } from "../../hooks/useApi"
import { useFilter } from "../../hooks/useFilter"
import { SatisfactionTableDataResponse } from "../api/satisfaction/tableData"

const SatisfactionTable = () => {
    const { Filter, value: filterValue, setValue: setFilterValues } = useFilter({
        justifyContent: "center",
        filters: [
            {
                type: "Input",
                key: "orderNumber",
                title: "Order nr."
            },
            {
                type: "ButtonGroup",
                key: "score",
                title: "Score",
                buttonTexts: ["all", "1", "2", "3", "4", "5"],
                buttonValues: [-1, 1, 2, 3, 4, 5],
            },
            {
                type: "Increment",
                key: "page",
                defaultValue: 1,
                min: 1,
            },
            {
                type: "Sites",
                key: "sites",
            }
        ]
    })
    const { colorMode } = useColorMode()
    const [currentPage, setCurrentPage] = useState<number>(filterValue.page)
    const QueryClient = useQueryClient()
    const { post } = useApi("/api/satisfaction/")
    const getBefore = () => post<SatisfactionTableDataResponse[]>("tableData", { filter: { ...filterValue, page: filterValue.page - 1 } })
    const getNow = () => post<SatisfactionTableDataResponse[]>("tableData", { filter: filterValue })
    const getNext = () => post<SatisfactionTableDataResponse[]>("tableData", { filter: { ...filterValue, page: filterValue.page + 1 } })

    const { data: beforeData, isSuccess: beforeDataSuccess, isStale: beforeDataStale } = useQuery(
        ["satisfactionTableData", "before"],
        getBefore
    )

    const { data: tableData, isSuccess: tableDataSuccess, isStale: tableDataStale } = useQuery(
        ["satisfactionTableData", "now"],
        getNow,
        {
            enabled: false,
            initialData: [],
        }
    )

    const { data: nextData, isSuccess: nextDataSuccess, isStale: nextDataStale } = useQuery(
        ["satisfactionTableData", "next"],
        getNext
    )

    useEffect(() => {
        QueryClient.fetchQuery(["satisfactionTableData", "before"])
        QueryClient.fetchQuery(["satisfactionTableData", "now"])
        QueryClient.fetchQuery(["satisfactionTableData", "next"])

        setFilterValues(pre => {
            return {
                ...pre,
                page: 1
            }
        })
    }, [filterValue.sites, filterValue.orderNumber, filterValue.score, QueryClient, setFilterValues])

    useEffect(() => {
        if (beforeDataSuccess && beforeData.length == 0 && currentPage == 1) {
            QueryClient.fetchQuery(["satisfactionTableData", "now"])
        }
    }, [beforeDataSuccess, beforeData, currentPage, QueryClient])

    useEffect(() => {
        const page = filterValue.page as number
        setCurrentPage(page)

        if (N.gt(page, currentPage)) {
            // dir = "up";
            QueryClient.setQueryData(["satisfactionTableData", "now"], nextData)

        }
        if (N.lt(page, currentPage)) {
            // dir = "down";
            QueryClient.setQueryData(["satisfactionTableData", "now"], beforeData)
        }

        QueryClient.fetchQuery(["satisfactionTableData", "next"])
        QueryClient.fetchQuery(["satisfactionTableData", "before"])
    }, [filterValue.page, currentPage, nextData, beforeData, QueryClient])

    return (
        <Layout>
            {Filter}

            <TableContainer>
                <Table variant='unstyled'>
                    <Thead borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1}>
                        <Tr>
                            <Th w={"32"}>order nr.</Th>
                            <Th w={"24"}>score</Th>
                            <Th w={"32"}>date</Th>
                            <Th w={"32"}>comment</Th>
                            <Th textAlign={"end"}>follow state</Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {tableDataSuccess && A.map(tableData, s => <Row key={s.Id} satisfaction={s} />)}
                    </Tbody>
                </Table>
            </TableContainer>
        </Layout>
    )
}

SatisfactionTable.auth = true

export default SatisfactionTable

interface Props {
    satisfaction: SatisfactionTableDataResponse
}

const Row = (props: Props) => {
    const { colorMode } = useColorMode()

    return (
        <Tr borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1}>
            <Td>{props.satisfaction.Order?.OrderNumber} - {props.satisfaction.Order?.Webshop?.replace("https://www.", "")}</Td>
            <Td>{props.satisfaction.Score}</Td>
            <Td>{dayjs(props.satisfaction.SatisfactionAnswered).format("HH:mm DD/MM/YYYY")}</Td>
            <Td>{props.satisfaction.Comment || "no comment"}</Td>
            <Td display={"flex"} flexDir="row-reverse">
                <FollowButtonController id={props.satisfaction.Id} state={props.satisfaction.satisfactionState} />
            </Td>
        </Tr>
    )
}

const FollowButtonController = ({ id, state }: { id: number, state: SatisfactionTableDataResponse["satisfactionState"] }) => {
    const { get: authGet } = useApi("/api/auth/")
    const { data: session, isSuccess } = useQuery(["session"], () => authGet<Session>("session"))
    const { post: satisfactionPost } = useApi("/api/satisfaction/options/")
    const { mutate: addMutate } = useMutation(({ trackingId }: { trackingId: number }) => satisfactionPost("addFollow", { id: trackingId }))
    const { mutate: takeMutate } = useMutation(({ trackingId }: { trackingId: number }) => satisfactionPost("takeFollow", { id: trackingId }))
    const { mutate: doneMutate } = useMutation(({ trackingId }: { trackingId: number }) => satisfactionPost("doneFollow", { id: trackingId }))
    const queryClient = useQueryClient()


    const addToFollow = () => {
        addMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.fetchQuery(["satisfactionTableData", "now"])
            }
        })
    }

    const takeFollow = () => {
        takeMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.fetchQuery(["satisfactionTableData", "now"])
            }
        })
    }

    const doneFollow = () => {
        doneMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.fetchQuery(["satisfactionTableData", "now"])
            }
        })
    }

    if (!state) return <Button colorScheme={"messenger"} onClick={addToFollow}>Add follow up</Button>
    else if (state.state == "FOLLOW") return <Button colorScheme={"green"} onClick={takeFollow}>Follow</Button>
    else if (state.state == "HAS-FOLLOW" && state.user == null) return <Button colorScheme={"green"} onClick={takeFollow}>Follow</Button>
    else if (isSuccess && state.state == "HAS-FOLLOW" && state.user?.email == session.user.email) return <Button colorScheme={"cyan"} onClick={doneFollow}>say follow up is done</Button>
    else if (state.state == "HAS-FOLLOW" && state.user) return <Text textAlign={"center"}>Order has follow by<br /><Text fontWeight={"bold"} as="span">{state.user.name} - {state.user.email}</Text></Text>
    else if (state.state == "FOLLOW-DONE" && state.user == null) return (
        <Flex gap={4}>
            <Text>follow up has been done</Text>
            <Button colorScheme={"green"} onClick={takeFollow}>Follow</Button>
        </Flex>
    )
    else if (state.state == "FOLLOW-DONE" && state.user != null) return (
        <Flex gap={4}>
            <Text textAlign={"center"}>follow up has been done by<br /><Text fontWeight={"bold"} as="span">{state.user.name} - {state.user.email}</Text></Text>
            <Button colorScheme={"green"} onClick={takeFollow}>Follow</Button>
        </Flex>
    )

    return <></>
}