import { Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import Layout from "../../components/layout"
import { useApi } from "../../hooks/useApi"
import { useFilter } from "../../hooks/useFilter"

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
    const {data: tableData, isSuccess: tableDataSuccess} = useQuery(["tableData", filterValue], () => post("tableData", { filter: filterValue }))

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

                    </Tbody>
                </Table>
            </TableContainer>
        </Layout>
    )
}

TrackingTable.auth = true

export default TrackingTable

const Row = () => {


    return (
        <>
            <Tr>

            </Tr>
        </>
    )
}