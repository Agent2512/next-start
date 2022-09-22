import { Button, Flex, Grid, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useColorMode } from "@chakra-ui/react";
import { A, flow, pipe, S } from "@mobily/ts-belt";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Layout from "../components/layout";
import { useApi } from "../hooks/useApi";
import { useFilter } from "../hooks/useFilter";
import { followSatisfactionResponse } from "./api/follow/followSatisfaction";

const wordSplit = flow(
    S.split(" "),
    A.mapWithIndex((i, word) => {
        if (i % 4 == 0 && i != 0) {
            return <>{word}<br key={i} /></>
        }
        return word + " "
    })
)

const followTable = () => {
    const { Filter, value: filterValue } = useFilter({
        justifyContent: "center",
        filters: [
            {
                type: "ButtonGroup",
                key: "status",
                title: "Status",
                buttonTexts: ["all", "need follow", "followed", "follow up is done"],
                buttonValues: ["ALL", "FOLLOW", "HAS-FOLLOW", "FOLLOW-DONE"],
            },
            {
                type: "Sites",
                key: "sites",
            },
            // {
            //     type: "Increment",
            //     key: "page",
            //     defaultValue: 1,
            //     min: 1
            // }
        ]
    })

    return (
        <Layout>
            {Filter}

            <Grid templateColumns={`1fr 1fr`} gap={2}>
                <TableOfSatisfaction filterValue={filterValue} />
                <TableOfTracking filterValue={filterValue} />
            </Grid>
        </Layout>
    )
}

followTable.auth = true;

export default followTable;


const TableOfSatisfaction = ({ filterValue }: { filterValue: ReturnType<typeof useFilter>["value"] }) => {
    const { colorMode } = useColorMode()
    const { post } = useApi("/api/follow/")
    const { data, isSuccess } = useQuery(["followSatisfaction", filterValue], () => post<followSatisfactionResponse[]>("followSatisfaction", filterValue))


    return (
        <Flex flexDir={"column"} gap={1}>
            <Text fontSize="2xl">Satisfaction</Text>
            <TableContainer borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1}>
                <Table variant={"striped"} fontSize="md">
                    <Thead>
                        <Tr>
                            <Th>order nr.</Th>
                            <Th>score</Th>
                            <Th>date</Th>
                            <Th>comment</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>YNO38DYY</Td>
                            <Td>RE2245820</Td>
                            <Td>14:20 21/09/2022</Td>
                            <Td>{wordSplit("The parcel is expected to be delivered during the day.")}</Td>
                            <Td>
                                <Button>follow</Button>
                            </Td>
                        </Tr>
                        {
                            isSuccess && pipe(
                                data,
                                A.map((item) => {
                                    return (
                                        <Tr>
                                            <Td>{item.Id}</Td>
                                            <Td>{item.Score}</Td>
                                            <Td>{dayjs(item.SatisfactionAnswered).format("HH:mm DD/MM/YYYY")}</Td>
                                            <Td>{wordSplit(item.Comment || "no comment")}</Td>
                                            <Td>
                                                <Button>follow</Button>
                                            </Td>
                                        </Tr>
                                    )
                                })
                            )
                        }
                    </Tbody>
                </Table>
            </TableContainer>
        </Flex>
    )
}

const TableOfTracking = ({ filterValue }: { filterValue: ReturnType<typeof useFilter>["value"] }) => {
    const { colorMode } = useColorMode()

    return (
        <Flex flexDir={"column"} gap={1}>
            <Text textAlign={"end"} fontSize="2xl">Tracking</Text>
            <TableContainer borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1}>
                <Table variant={"striped"} fontSize="md">
                    <Thead>
                        <Tr>
                            <Th>Tracking nr.</Th>
                            <Th>Reference</Th>
                            <Th>Service Status</Th>
                            <Th>Last update</Th>
                            <Th></Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>YNO38DYY</Td>
                            <Td>RE2245820</Td>
                            <Td>{wordSplit("The parcel is expected to be delivered during the day.")}</Td>
                            <Td>14:20 21/09/2022</Td>
                            <Td>
                                <Button>follow</Button>
                            </Td>
                        </Tr>

                    </Tbody>
                </Table>
            </TableContainer>
        </Flex>
    )
}