import { Flex, InputGroup, InputLeftAddon, Input, Select, Button, useColorMode } from "@chakra-ui/react";
import { A } from "@mobily/ts-belt";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useState, ChangeEvent } from "react";
import { useApi } from "../../hooks/useApi";
import { allAccessPanelsResponse } from "../../pages/api/user/allAccessPanels";
import { allAccessPanelTypesResponse } from "../../pages/api/user/allAccessPanelTypes";

export const NewPanelCard = ({ panel }: { panel: allAccessPanelsResponse; }) => {
    const { colorMode } = useColorMode();
    const { get, post } = useApi("/api/user/")
    const { data: panelTypes, isSuccess } = useQuery(["panelTypes"], () => get<allAccessPanelTypesResponse[]>("allAccessPanelTypes"));
    const [data, setData] = useState(panel);
    const queryClient = useQueryClient();
    const { mutate: savePanel } = useMutation(() => post("options/addAccessPanel", data))

    const handleChange = (e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "type" && isSuccess) {
            setData(pre => {
                const newType = A.find(panelTypes, p => p.type === value);

                if (newType) {
                    return {
                        ...pre,
                        type: newType,
                        typeId: newType.id
                    };
                }

                return pre;
            });
        } else {
            setData({
                ...data,
                [name]: value
            });
        }
    };

    const handleSave = () => {
        savePanel(undefined, {
            onSuccess: () => {
                queryClient.invalidateQueries(["panels"]);
                queryClient.invalidateQueries(["panelTypes"]);
                
                handleCancel()
            }
        })
    };

    const handleCancel = () => {
        queryClient.setQueriesData<allAccessPanelsResponse[]>(["newPanels"], (pre) => {
            if (pre) {
                const newPre = pre.filter(p => p.id !== panel.id);

                return newPre;
            }

            return pre
        })
    }

    return (
        <Flex flexDir={"column"} alignItems={"center"} justifyContent={"space-between"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"} bgGradient={`linear(to-t, ${data.type ? data.type.color : "#000"} 50%, black)`}>
            <Flex p={2} gap={.5} minW={"32"} flexDir={"column"} alignItems={"center"} textColor="white">
                <InputGroup borderColor={colorMode == "light" ? "black" : "white"}>
                    <InputLeftAddon bg={"black"}>Panel</InputLeftAddon>
                    <Input type='text' name={"panel"} value={data.panel} onChange={handleChange} />
                </InputGroup>

                <InputGroup borderColor={colorMode == "light" ? "black" : "white"}>
                    <InputLeftAddon bg={"black"}>Url</InputLeftAddon>
                    <Input type='text' name={"url"} value={data.url} onChange={handleChange} />
                </InputGroup>

                <InputGroup borderColor={colorMode == "light" ? "black" : "white"}>
                    <InputLeftAddon bg={"black"}>Type</InputLeftAddon>
                    <Select borderTopLeftRadius={0} borderBottomLeftRadius={0} borderColor={colorMode == "light" ? "black" : "white"} defaultValue={data.type?.type} name={"type"} onChange={handleChange}>
                        <option value="" disabled></option>
                        {isSuccess && A.map(panelTypes, p => <option key={p.id} value={p.type} style={{ backgroundColor: p.color }}>{p.type}</option>)}
                    </Select>
                </InputGroup>
            </Flex>
            <Flex flexDir={"column"} w={"full"}>
                <Button colorScheme={"green"} w={"full"} borderRadius={0} onClick={handleSave}>Save</Button>
                <Button colorScheme={"red"} w={"full"} borderRadius={0} onClick={handleCancel}>cancel</Button>
            </Flex>
        </Flex>
    )
}
