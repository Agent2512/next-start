import { Flex, InputGroup, InputLeftAddon, Input, Button } from "@chakra-ui/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, ChangeEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { allAccessPanelTypesResponse } from "../../pages/api/user/allAccessPanelTypes";

export const NewPanelTypeCard = ({ panelType }: { panelType: allAccessPanelTypesResponse }) => {
    const { post } = useApi("/api/user/")
    const [data, setData] = useState(panelType);
    const queryClient = useQueryClient();
    const { mutate: savePanelType } = useMutation(() => post("options/addPanelType", data))

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setData({ ...data, [name]: value })
    }

    const handleCancel = () => {
        queryClient.setQueriesData<allAccessPanelTypesResponse[]>(["newPanelTypes"], (pre) => {
            if (pre) {
                const newPre = pre.filter(p => p.id !== panelType.id);

                return newPre;
            }

            return pre
        })
    }

    const handleSave = () => {
        savePanelType(undefined, {
            onSuccess: () => {
                queryClient.refetchQueries(["panelTypes"]);
                
                handleCancel()
            }
        })
    }

    return (
        <Flex flexDir={"column"} alignItems={"center"} justifyContent={"space-between"} borderColor={"black"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"} bgGradient={`linear(to-t, ${data.color} 55%, black)`}>
            <Flex p={2} gap={.5} minW={"32"} flexDir={"column"} alignItems={"center"} textColor="white">
                <InputGroup borderColor={"black"}>
                    <InputLeftAddon bg={"black"} children='Type' />
                    <Input type='text' name={"type"} value={data.type} onChange={handleChange} />
                </InputGroup>

                <InputGroup borderColor={"black"}>
                    <InputLeftAddon bg={"black"} children='Color' />
                    <Input type='text' name={"color"} value={data.color} onChange={handleChange} />
                </InputGroup>
            </Flex>
            <Flex flexDir={"column"} w={"full"}>
                <Button colorScheme={"green"} w={"full"} borderRadius={0} onClick={handleSave}>Save</Button>
                <Button colorScheme={"red"} w={"full"} borderRadius={0} onClick={handleCancel}>cancel</Button>
            </Flex>
        </Flex>
    )
}
