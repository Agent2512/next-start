import { ArrowForwardIcon } from "@chakra-ui/icons"
import { Button, Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useBoolean, useColorMode } from "@chakra-ui/react"
import { A, N, Option } from "@mobily/ts-belt"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { Session } from "next-auth"
import { useEffect, useState } from "react"
import Layout from "../../components/layout"
import { useApi } from "../../hooks/useApi"
import { useFilter } from "../../hooks/useFilter"
import { TrackingTableDataResponse } from "../api/tracking/tableData"
import { trackingStatesResponse } from "../api/tracking/tableDataRowStates"

const TrackingTable = () => {
    const { Filter, value: filterValue, setValue: setFilterValues } = useFilter({
        justifyContent: "center",
        filters: [
            {
                type: "Input",
                key: "orderNumber",
                title: "Order nr."
            },
            {
                type: "Input",
                key: "trackingNumberOrReference",
                title: "Tracking nr. / Reference"
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
    const [currentPage, setCurrentPage] = useState<number>(filterValue.page)
    const QueryClient = useQueryClient()
    const { post } = useApi("/api/tracking/")
    const getBefore = () => post<TrackingTableDataResponse[]>("tableData", { filter: { ...filterValue, page: filterValue.page - 1 } })
    const getNow = () => post<TrackingTableDataResponse[]>("tableData", { filter: filterValue })
    const getNext = () => post<TrackingTableDataResponse[]>("tableData", { filter: { ...filterValue, page: filterValue.page + 1 } })

    const { data: beforeData, isSuccess: beforeDataSuccess, isStale: beforeDataStale } = useQuery(
        ["trackingTableData", "before"],
        getBefore
    )
    const { data: tableData, isSuccess: tableDataSuccess, isStale: tableDataStale } = useQuery(
        ["trackingTableData", "now"],
        getNow,
        {
            enabled: false,
            initialData: [],
        }
    )
    const { data: nextData, isSuccess: nextDataSuccess, isStale: nextDataStale } = useQuery(
        ["trackingTableData", "next"],
        getNext
    )


    useEffect(() => {
        QueryClient.fetchQuery(["trackingTableData", "before"])
        QueryClient.fetchQuery(["trackingTableData", "now"])
        QueryClient.fetchQuery(["trackingTableData", "next"])

        setFilterValues(pre => {
            return {
                ...pre,
                page: 1
            }
        })
    }, [filterValue.sites, filterValue.orderNumber, filterValue.trackingNumberOrReference])


    useEffect(() => {
        const page = filterValue.page as number
        setCurrentPage(page)

        if (N.gt(page, currentPage)) {
            // dir = "up";
            QueryClient.setQueryData(["trackingTableData", "now"], nextData)

        }
        if (N.lt(page, currentPage)) {
            // dir = "down";
            QueryClient.setQueryData(["trackingTableData", "now"], beforeData)
        }

        QueryClient.fetchQuery(["trackingTableData", "next"])
        QueryClient.fetchQuery(["trackingTableData", "before"])
    }, [filterValue.page])

    useEffect(() => {
        if (beforeDataSuccess && beforeData.length == 0 && currentPage == 1) {
            QueryClient.fetchQuery(["trackingTableData", "now"])
        }
    }, [beforeData])

    return (
        <Layout>
            {Filter}

            <TableContainer>
                <Table variant='unstyled'>
                    <Thead>
                        <Tr>
                            <Th w={"32"}>order nr.</Th>
                            <Th w={"24"}>number of trackings</Th>
                            <Th w={"32"}>date</Th>
                            <Th w={"32"}></Th>
                            <Th></Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {tableDataSuccess && A.map(tableData, order => <Row key={order.Id} order={order} trackingStates={[]} />)}
                    </Tbody>
                </Table>
            </TableContainer>
        </Layout>
    )
}

TrackingTable.auth = true

export default TrackingTable

const Row = ({ order, trackingStates }: { order: TrackingTableDataResponse, trackingStates: trackingStatesResponse[] }) => {
    const [open, setOpen] = useBoolean(false)
    const { colorMode } = useColorMode()


    return (
        <>
            <Tr key={order.Id} onClick={order.trackings.length != 0 ? setOpen.toggle : undefined} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={2} borderBottomWidth={!open ? 2 : 0}>
                <Td>{order.OrderNumber} - {order.Webshop?.replace("https://www.", "")}</Td>
                <Td>{order.trackings.length}</Td>
                <Td>{dayjs(order.DateCreated).format("HH:mm DD/MM/YYYY")}</Td>
                <Td></Td>
                <Td></Td>
            </Tr>
            {
                open && A.mapWithIndex(order.trackings, (i, v) => {
                    return (
                        <Tr key={v.Id} bg={colorMode == "light" ? "gray.300" : "gray.700"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderLeftWidth={2} borderRightWidth={2} borderBottomWidth={order.trackings.length - 1 == i ? 2 : 0}>
                            <Td display={"flex"} alignItems="center" gap={2}>
                                <ArrowForwardIcon />
                                Tracking nr. <br />{v.Tracking || "not set yet"}
                            </Td>

                            <Td>
                                Reference<br />{v.Reference || "-"}
                            </Td>

                            <Td>
                                Service Status<br />{v.ServiceStatus || "not set yet"}
                            </Td>

                            <Td>
                                Last update<br />{dayjs(v.StatusUpdate).format("HH:mm DD/MM/YYYY") || "not set yet"}
                            </Td>
                            <Td display={"flex"} flexDir="row-reverse">
                                <FollowButtonController
                                    id={v.Id}
                                    state={A.getBy(trackingStates, t => t.id == v.Id)}
                                />
                            </Td>
                        </Tr>
                    )
                })
            }
        </>
    )
}

const FollowButtonController = ({ id, state }: { id: number, state: Option<trackingStatesResponse> }) => {
    const { get: authGet } = useApi("/api/auth/")
    const { data: session, isSuccess } = useQuery(["session"], () => authGet<Session>("session"))
    const { post: trackingPost } = useApi("/api/tracking/options/")
    const { mutate: addMutate } = useMutation(({ trackingId }: { trackingId: number }) => trackingPost("addFollow", { id: trackingId }))
    const { mutate: takeMutate } = useMutation(({ trackingId }: { trackingId: number }) => trackingPost("takeFollow", { id: trackingId }))
    const { mutate: doneMutate } = useMutation(({ trackingId }: { trackingId: number }) => trackingPost("doneFollow", { id: trackingId }))
    const queryClient = useQueryClient()

    const addToFollow = () => {
        addMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.invalidateQueries(["trackingStates"])
            }
        })
    }

    const takeFollow = () => {
        takeMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.invalidateQueries(["trackingStates"])
            }
        })
    }

    const doneFollow = () => {
        doneMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.invalidateQueries(["trackingStates"])
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
        </Flex>)
    else if (state.state == "FOLLOW-DONE" && state.user != null) return (
        <Flex gap={4}>
            <Text textAlign={"center"}>follow up has been done by<br /><Text fontWeight={"bold"} as="span">{state.user.name} - {state.user.email}</Text></Text>
            <Button colorScheme={"green"} onClick={takeFollow}>Follow</Button>
        </Flex>
    )

    return <></>
}