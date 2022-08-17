import { Button, Checkbox, Flex, Grid, Input, Stack, Text, useColorMode } from "@chakra-ui/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { A, pipe } from "@mobily/ts-belt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, MouseEvent, useState } from "react";
import Layout from "../../components/layout"
import { useApi } from "../../hooks/useApi";
import { useFilter } from "../../hooks/useFilter";
import { allAccessPanelsResponse } from "../api/user/allAccessPanels";
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
            {
                type: "Input",
                inputType: "text",
                key: "name",
            }
        ]
    })
    const [Animate] = useAutoAnimate<HTMLDivElement>()

    return (
        <Layout>
            {Filter}

            <Stack ref={Animate}>
                {allUsersIsSuccess && pipe(
                    allUsers,
                    A.filter(user => value.email ? user.email.includes(value.email) : true),
                    A.filter(user => value.name ? user.name.includes(value.name) : true),
                    A.map(user => <UserItem key={user.id} user={user} />)
                )}
            </Stack>
        </Layout>
    )
}

UserAdmin.auth = true;

export default UserAdmin;

const UserItem = ({ user }: { user: AllUsersResponse }) => {
    const { colorMode } = useColorMode();
    const { get, post } = useApi("/api/user/");
    const { data: panelTypes, isSuccess: panelTypesIsSuccess } = useQuery(["panelTypes"], () => get<allAccessPanelTypesResponse[]>("allAccessPanelTypes"))
    const { data: panels, isSuccess: panelsIsSuccess } = useQuery(["panels"], () => get<allAccessPanelsResponse[]>("allAccessPanels"))
    const [show, setShow] = useState(false);
    const queryClient = useQueryClient();
    const { mutate: deleteUser } = useMutation(() => post("options/deleteUser", user))
    const { mutate: ToggleUserPanel } = useMutation(({ panel, setTo }: { panel: allAccessPanelsResponse, setTo: boolean }) => post("options/toggleUserPanel", { user, panel, setTo }))
    const [Animate] = useAutoAnimate<HTMLDivElement>()

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this user?") == false) return

        deleteUser(undefined, {
            onSuccess: () => {
                queryClient.invalidateQueries(["allUsers"])
            }
        })
    }

    const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        const checked = e.currentTarget.checked;
        const panel = panelsIsSuccess ? A.find(panels, panel => panel.id.toString() == value) : undefined

        if (panel) {
            ToggleUserPanel({panel, setTo: checked}, {
                onSuccess: () => {
                    queryClient.invalidateQueries(["allUsers"])
                    queryClient.invalidateQueries(["userAccessPanels"])
                }
            })
        }
        
    }

    return (
        <Flex ref={Animate} flexDir={"column"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" p={2} gap={4}>
            <Grid w="full" templateColumns="4fr 1fr">
                {/* user info */}
                <Flex gap={2} flexDir="row">
                    <Text minW="20%">{user.name}</Text>
                    <Text minW="30%">Email: {user.email}</Text>
                    <Text>Panel Count: {user.accessPanels.length}</Text>
                </Flex>

                <Flex gap={2} flexDir="row-reverse">
                    <Button colorScheme={"red"} onClick={handleDelete}>Delete User</Button>
                    <Button colorScheme={"blue"} onClick={() => setShow(pre => !pre)}>More</Button>
                </Flex>
            </Grid>


            {/* panelTypes */}
            {
                show && <Flex justifyContent={"center"} gap={2}>
                    {panelTypesIsSuccess && A.map(panelTypes, pt => {

                        return (
                            <Flex key={pt.id} flexDir="column" textColor="white" p={2} bgGradient={`linear(to-t, ${pt.color}, black)`} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md">
                                <Text textAlign="center" textTransform="capitalize">{pt.type}</Text>

                                {A.map(pt.accessPanels, ap => {
                                    const bool = A.find(user.accessPanels, uap => uap.id === ap.id) ? true : false

                                    return <Checkbox key={ap.id} value={ap.id} onChange={handleToggle} defaultChecked={bool}>{ap.panel.replace("\\n", " ")}</Checkbox>
                                })}
                            </Flex>
                        )
                    })}
                </Flex>
            }
        </Flex>
    )
}