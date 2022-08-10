import { Button, Flex, Heading, IconButton, Input, InputGroup, InputLeftAddon, Select, Text } from "@chakra-ui/react";
import { A } from "@mobily/ts-belt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import Layout from "../../components/layout";
import { useApi } from "../../hooks/useApi";
import type { allAccessPanelsResponse } from "../api/user/allAccessPanels";
import type { allAccessPanelTypesResponse } from "../api/user/allAccessPanelTypes";

const PanelsAdmin = () => {
    const { get } = useApi("/api/user/")
    const { data: panels, isSuccess } = useQuery(["panels"], () => get<allAccessPanelsResponse[]>("allAccessPanels"))
    const { data: panelTypes } = useQuery(["panelTypes"], () => get<allAccessPanelTypesResponse[]>("allAccessPanelTypes"))


    return (
        <Layout>
            <Flex flexDir={"column"} borderColor={"black"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"}>
                <Flex alignItems={"center"} gap={2}>
                    <Heading ml={2} mb={1} textTransform="capitalize">access panels</Heading>
                    {/* <IconButton onClick={newPanel} colorScheme="green" aria-label="add new panel Type" icon={<AddIcon />} /> */}
                </Flex>
                <Flex p={2} gap={2} borderColor={"black"} borderStyle={"solid"} borderTopWidth={1} wrap={"wrap"}>
                    {isSuccess && A.map(panels, p => <PanelCard key={p.id} panel={p} />)}
                </Flex>
            </Flex>


        </Layout>
    )
}

PanelsAdmin.auth = true;

export default PanelsAdmin;


const PanelCard = ({ panel }: { panel: allAccessPanelsResponse }) => {
    const { get, post } = useApi("/api/user/")
    const { data: panelTypes, isSuccess } = useQuery(["panelTypes"], () => get<allAccessPanelTypesResponse[]>("allAccessPanelTypes"))
    const [edit, setEdit] = useState(false)
    const [editData, setEditData] = useState(panel);
    const queryClient = useQueryClient();
    const { mutate } = useMutation(() => post<allAccessPanelsResponse>("options/updateAccessPanel", editData))

    const handleChange = (e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "type" && isSuccess) {

            setEditData(pre => {
                const newType = A.find(panelTypes, p => p.type === value)

                if (newType) {
                    return {
                        ...pre,
                        type: newType,
                        typeId: newType.id
                    }
                }

                return pre
            })

        }
        else {
            setEditData({ ...editData, [name]: value })
        }
    }

    const handleEdit = () => {
        setEdit(pre => !pre);
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this panel?") == false) return;

    }

    const handleSubmit = () => {
        mutate(undefined, {
            onSuccess: () => {
                queryClient.refetchQueries(["panels"])
                queryClient.refetchQueries(["panelTypes"])
                queryClient.refetchQueries(["userAccessPanels"])
                setEdit(false)
            }
        })
    }

    if (edit) {
        return (
            <Flex flexDir={"column"} alignItems={"center"} justifyContent={"space-between"} borderColor={"black"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"} bgGradient={`linear(to-t, ${editData.type ? editData.type.color : "#000"} 50%, black)`}>
                <Flex p={2} gap={.5} minW={"32"} flexDir={"column"} alignItems={"center"} textColor="white" >
                    <InputGroup borderColor={"black"}>
                        <InputLeftAddon bg={"black"} children='Panel' />
                        <Input type='text' name={"panel"} value={editData.panel} onChange={handleChange} />
                    </InputGroup>

                    <InputGroup borderColor={"black"}>
                        <InputLeftAddon bg={"black"} children='Url' />
                        <Input type='text' name={"url"} value={editData.url} onChange={handleChange} />
                    </InputGroup>

                    <InputGroup borderColor={"black"}>
                        <InputLeftAddon bg={"black"} children='Type' />
                        <Select borderTopLeftRadius={0} borderBottomLeftRadius={0} borderColor={"black"} defaultValue={editData.type?.type} name={"type"} onChange={handleChange}>
                            {isSuccess && A.map(panelTypes, p => <option key={p.id} value={p.type} style={{ backgroundColor: p.color }} >{p.type}</option>)}
                        </Select>
                    </InputGroup>
                </Flex>
                <Flex flexDir={"column"} w={"full"}>
                    <Button colorScheme={"green"} w={"full"} borderRadius={0} onClick={handleSubmit}>Save</Button>
                    <Button colorScheme={"red"} w={"full"} borderRadius={0} onClick={handleEdit}>Stop Edit</Button>
                </Flex>
            </Flex>
        )
    }

    return (
        <Flex flexDir={"column"} alignItems={"center"} justifyContent={"space-between"} borderColor={"black"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"} bgGradient={`linear(to-t, ${panel.type ? panel.type.color : "#000"} 50%, black)`}>
            <Flex p={2} minW={"32"} flexDir={"column"} alignItems={"center"} textColor="white" >
                <Text textTransform={"capitalize"}>{panel.panel.replace("\\n", " ")}</Text>
                <Text>Url: {panel.url}</Text>
                <Text textTransform={"capitalize"}>type: {panel.type ? panel.type.type : "not set"}</Text>
                <Text>Users: {panel.users.length}</Text>
            </Flex>
            <Flex flexDir={"column"} w={"full"}>
                <Button colorScheme={"blue"} w={"full"} borderRadius={0} onClick={handleEdit}>Edit</Button>
                <Button colorScheme={"red"} w={"full"} borderRadius={0} onClick={handleDelete}>Delete</Button>
            </Flex>
        </Flex>
    )
}