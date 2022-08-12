import { Flex, InputGroup, InputLeftAddon, Input, Button, Text, useColorMode } from "@chakra-ui/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { conv } from "color-shorthand-hex-to-six-digit";
import { useState, ChangeEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { allAccessPanelTypesResponse } from "../../pages/api/user/allAccessPanelTypes";

export const PanelTypeCard = ({ panelType }: {panelType: allAccessPanelTypesResponse}) => {
    const { colorMode } = useColorMode();
    const { post } = useApi("/api/user/")
    const [edit, setEdit] = useState(false)
    const [editData, setEditData] = useState(panelType);
    const queryClient = useQueryClient();
    const { mutate: updatePanelType } = useMutation(() => post("options/updatePanelType", editData))
    const { mutate: deletePanelType } = useMutation(() => post("options/deletePanelType", editData))

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setEditData({ ...editData, [name]: value })
    }

    const handleSubmit = () => {
        updatePanelType(undefined, {
            onSuccess: () => {
                queryClient.refetchQueries(["panels"]);
                queryClient.refetchQueries(["panelTypes"]);
                queryClient.refetchQueries(["userAccessPanels"]);
                setEdit(false)
            }
        })
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this panel type?") == false) return

        deletePanelType(undefined, {
            onSuccess: () => {
                queryClient.refetchQueries(["panels"]);
                queryClient.refetchQueries(["panelTypes"]);
                queryClient.refetchQueries(["userAccessPanels"]);
            }
        })
    }

    const handleEdit = () => {
        setEdit(pre => !pre)
        setEditData(panelType)
    }

    if (edit) {
        return (
            <Flex flexDir={"column"} alignItems={"center"} justifyContent={"space-between"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"} bgGradient={`linear(to-t, ${editData.color} 55%, black)`}>
                <Flex p={2} gap={.5} minW={"32"} flexDir={"column"} alignItems={"center"} textColor="white">
                    <InputGroup borderColor={colorMode == "light" ? "black" : "white"}>
                        <InputLeftAddon bg={"black"}>Type</InputLeftAddon>
                        <Input type='text' name={"type"} value={editData.type} onChange={handleChange} />
                    </InputGroup>

                    <InputGroup borderColor={colorMode == "light" ? "black" : "white"}>
                        <InputLeftAddon bg={"black"}>Color</InputLeftAddon>
                        <Input type='text' name={"color"} value={editData.color} onChange={handleChange} />
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
        <Flex flexDir={"column"} alignItems={"center"} justifyContent={"space-between"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"} bgGradient={`linear(to-t, ${panelType.color} 55%, black)`}>
            <Flex p={2} minW={"32"} flexDir={"column"} alignItems={"center"} textColor="white">
                <Text textTransform={"capitalize"}>{panelType.type}</Text>
                <Text>Panels: {panelType.accessPanels.length}</Text>
                <Text>Color: {conv(panelType.color)}</Text>
            </Flex>
            <Flex flexDir={"column"} w={"full"}>
                <Button colorScheme={"blue"} w={"full"} borderRadius={0} onClick={handleEdit}>Edit</Button>
                <Button colorScheme={"red"} w={"full"} borderRadius={0} onClick={handleDelete}>Delete</Button>
            </Flex>
        </Flex>
    )
}