import { ArrowForwardIcon } from "@chakra-ui/icons"
import { Table, TableContainer, Tbody, Td, Th, Thead, Tr, useBoolean, useColorMode } from "@chakra-ui/react"
import { A } from "@mobily/ts-belt"
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import Layout from "../../components/layout"
import { useApi } from "../../hooks/useApi"
import { useFilter } from "../../hooks/useFilter"
import { TableDataResponse } from "../api/tracking/tableData"

const TrackingTable = () => {
    const { Filter, value: filterValue } = useFilter({
        justifyContent: "center",
        filters: [
            {
                type: "Input",
                key: "search",
                title: "Order nr. / Tracking nr. / Reference"
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
    const { post } = useApi("/api/tracking/")
    const { data: tableData, isSuccess: tableDataSuccess } = useQuery(["tableData", filterValue], () => post<TableDataResponse[]>("tableData", { filter: filterValue }))


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
                        {tableDataSuccess && A.map(tableData, order => <Row key={order.Id} order={order} />)}
                    </Tbody>
                </Table>
            </TableContainer>
        </Layout>
    )
}

TrackingTable.auth = true

export default TrackingTable

const Row = ({ order }: { order: TableDataResponse }) => {
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
                                {/* <FollowButtonController id={v.Id} /> */}
                            </Td>
                        </Tr>
                    )
                })
            }
        </>
    )
}