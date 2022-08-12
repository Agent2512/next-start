import { Button, Checkbox, Flex, Grid, Input, Stack, Text, useColorMode } from "@chakra-ui/react";
import { A } from "@mobily/ts-belt";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import Layout from "../../components/layout"
import { useApi } from "../../hooks/useApi";
import { useFilter } from "../../hooks/useFilter";
import type { allAccessPanelTypesResponse } from "../api/user/allAccessPanelTypes";
import type { AllUsersResponse } from "../api/user/allUsers";

const UserAdmin = () => {
    const { get } = useApi("/api/user/");
    const { data: allUsers, isSuccess: allUsersIsSuccess } = useQuery(["allUsers"], () => get<AllUsersResponse[]>("allUsers"));
    const { Filter, value } = useFilter({
        filters: [
            {
                type: "Input",
                inputType: "email",
                key: "email",
            },
        ]
    })

    return (
        <Layout>
            {Filter}

            <Stack mt={2}>
                {allUsersIsSuccess && allUsers.map(user => <UserItem key={user.id} user={user} />)}
            </Stack>
        </Layout>
    )
}

UserAdmin.auth = true;

export default UserAdmin;

const UserItem = ({ user }: { user: AllUsersResponse }) => {
    const {colorMode} = useColorMode();
    const { get } = useApi("/api/user/");
    const { data: panelTypes, isSuccess: panelTypesIsSuccess } = useQuery(["panelTypes"], () => get<allAccessPanelTypesResponse[]>("allAccessPanelTypes"))



    return (
        <Flex flexDir={"column"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" p={2} gap={4}>
            <Grid w="full" templateColumns="4fr 1fr">
                {/* user info */}
                <Flex gap={2} flexDir="row">
                    <Text minW="20%">{user.name}</Text>
                    <Text minW="30%">Email: {user.email}</Text>
                    <Text>Panel Count: {user.accessPanels.length}</Text>
                </Flex>

                <Flex gap={2} flexDir="row-reverse">
                    <Button colorScheme={"blue"}>More</Button>
                    <Button colorScheme={"red"}>Delete User</Button>
                </Flex>
            </Grid>


            {/* panelTypes */}
            <Flex justifyContent={"center"} gap={2}>
                {panelTypesIsSuccess && A.map(panelTypes, pt => {

                    return (
                        <Flex key={pt.id} flexDir="column" textColor="white" p={2} bgGradient={`linear(to-t, ${pt.color}, black)`} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md">
                            <Text textAlign="center" textTransform="capitalize">{pt.type}</Text>

                            {A.map(pt.accessPanels, ap => {
                                const bool = A.find(user.accessPanels, uap => uap.id === ap.id) ? true : false

                                return <Checkbox key={ap.id} value={ap.id} defaultChecked={bool}>{ap.panel.replace("\\n"," ")}</Checkbox>
                            })}
                        </Flex>
                    )
                })}
            </Flex>
        </Flex>
    )
}