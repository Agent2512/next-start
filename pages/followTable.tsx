import { Button, Flex, Grid, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr, useColorMode } from "@chakra-ui/react";
import { A, flow, pipe, S } from "@mobily/ts-belt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Session } from "next-auth";
import Layout from "../components/layout";
import { useApi } from "../hooks/useApi";
import { useFilter } from "../hooks/useFilter";
import { followSatisfactionResponse } from "./api/follow/followSatisfaction";
import { followTrackingResponse } from "./api/follow/followTracking";

const wordSplit = flow(
    S.split(" "),
    A.mapWithIndex((i, word) => {
        if (i % 4 == 0 && i != 0) {
            return <>{word}<br key={i} /></>
        }
        return word + " "
    })
)

const FollowTable = () => {
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
                type: "ButtonGroup",
                key: "userScope",
                title: "User scope",
                buttonTexts: ["all", "only you"],
                buttonValues: ["ALL", "ME"],

            }
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

FollowTable.auth = true;

export default FollowTable;

const FollowButtonController = ({ id, state, api }: { id: number, state: any, api: "satisfaction" | "tracking" }) => {
    const { get: authGet } = useApi("/api/auth/")
    const { data: session, isSuccess } = useQuery(["session"], () => authGet<Session>("session"))
    const { post } = useApi(`/api/${api}/options/`)
    const { mutate: addMutate } = useMutation(({ trackingId }: { trackingId: number }) => post("addFollow", { id: trackingId }))
    const { mutate: takeMutate } = useMutation(({ trackingId }: { trackingId: number }) => post("takeFollow", { id: trackingId }))
    const { mutate: doneMutate } = useMutation(({ trackingId }: { trackingId: number }) => post("doneFollow", { id: trackingId }))
    const queryClient = useQueryClient()


    const addToFollow = () => {
        addMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.invalidateQueries(["follow"])
            }
        })
    }

    const takeFollow = () => {
        takeMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.invalidateQueries(["follow"])
            }
        })
    }

    const doneFollow = () => {
        doneMutate({ trackingId: id }, {
            onSuccess: () => {
                queryClient.invalidateQueries(["follow"])
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


const TableOfSatisfaction = ({ filterValue }: { filterValue: ReturnType<typeof useFilter>["value"] }) => {
    const { colorMode } = useColorMode()
    const { post } = useApi("/api/follow/")
    const { data, isSuccess } = useQuery(["follow", "followSatisfaction", filterValue], () => post<followSatisfactionResponse[]>("followSatisfaction", filterValue))


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
                        {
                            isSuccess && pipe(
                                data,
                                A.map((item) => {
                                    return (
                                        <Tr key={item.Id}>
                                            <Td>{item.Id}</Td>
                                            <Td>{item.Score}</Td>
                                            <Td>{dayjs(item.SatisfactionAnswered).format("HH:mm DD/MM/YYYY")}</Td>
                                            <Td>{wordSplit(item.Comment || "no comment")}</Td>
                                            <Td>
                                                <FollowButtonController id={item.Id} state={item.state} api={"satisfaction"} />
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
    const { post } = useApi("/api/follow/")
    const { data, isSuccess } = useQuery(["follow", "followTracking", filterValue], () => post<followTrackingResponse[]>("followTracking", filterValue))

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
                        {
                            isSuccess && pipe(
                                data,
                                A.map((item) => {
                                    return (
                                        <Tr key={item.Id}>
                                            <Td>{item.Tracking || "not set yet"}</Td>
                                            <Td>{item.Reference || "-"}</Td>
                                            <Td>{wordSplit(item.ServiceStatus || "not set yet")}</Td>
                                            <Td>{item.StatusUpdate ? dayjs(item.StatusUpdate).format("HH:mm DD/MM/YYYY") : "not set yet"}</Td>
                                            <Td>
                                                <FollowButtonController id={item.Id} state={item.state} api={"tracking"} />
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