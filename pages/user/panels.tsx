import { Button, Flex, Heading, IconButton, Input, InputGroup, InputLeftAddon, Select, Text } from "@chakra-ui/react";
import { A } from "@mobily/ts-belt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import Layout from "../../components/layout";
import { useApi } from "../../hooks/useApi";
import type { allAccessPanelsResponse } from "../api/user/allAccessPanels";
import type { allAccessPanelTypesResponse } from "../api/user/allAccessPanelTypes";
import { PanelCard } from '../../components/user/PanelCard';
import { AddIcon } from "@chakra-ui/icons"
import { NewPanelCard } from "../../components/user/NewPanelCard";
import { PanelTypeCard } from "../../components/user/PanelTypeCard";
import { NewPanelTypeCard } from "../../components/user/NewPanelTypeCard";
import { useAutoAnimate } from '@formkit/auto-animate/react'

const PanelsAdmin = () => {
    const { get } = useApi("/api/user/")
    const queryClient = useQueryClient();
    const { data: panels, isSuccess: panelsIsSuccess } = useQuery(["panels"], () => get<allAccessPanelsResponse[]>("allAccessPanels"))
    const { data: panelTypes, isSuccess: panelTypesIsSuccess } = useQuery(["panelTypes"], () => get<allAccessPanelTypesResponse[]>("allAccessPanelTypes"))
    const { data: newPanels } = useQuery<allAccessPanelsResponse[]>(["newPanels"], {
        initialData: [],
        enabled: false,
    })
    const { data: newPanelTypes } = useQuery<allAccessPanelTypesResponse[]>(["newPanelTypes"], {
        initialData: [],
        enabled: false,
    })
    const [Animate] = useAutoAnimate<HTMLDivElement>()

    const newPanel = () => {
        queryClient.setQueriesData<allAccessPanelsResponse[]>(["newPanels"], () => {
            const newP: allAccessPanelsResponse = {
                id: newPanels.length + 1,
                panel: "",
                url: "",
                users: [],
                typeId: null,
                type: {
                    type: "",
                    id: -1,
                    color: "#000",
                },
            }

            return [
                ...newPanels,
                newP
            ]
        })
    }

    const newPanelType = () => {
        queryClient.setQueriesData<allAccessPanelTypesResponse[]>(["newPanelTypes"], () => {
            const newPT: allAccessPanelTypesResponse = {
                id: newPanelTypes.length + 1,
                type: "",
                color: "#000",
                accessPanels: [],
            }

            return [
                ...newPanelTypes,
                newPT
            ]
        })
    }

    return (
        <Layout>
            <Flex flexDir={"column"} borderColor={"black"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"}>
                <Flex alignItems={"center"} gap={2}>
                    <Heading ml={2} mb={1} textTransform="capitalize">access panels</Heading>
                    <IconButton onClick={newPanel} colorScheme="green" aria-label="add new panel Type" icon={<AddIcon />} />
                </Flex>
                <Flex ref={Animate} p={2} gap={2} borderColor={"black"} borderStyle={"solid"} borderTopWidth={1} wrap={"wrap"}>
                    {panelsIsSuccess && A.map(panels, p => <PanelCard key={p.id} panel={p} />)}
                    {A.map(newPanels, p => <NewPanelCard key={p.id} panel={p} />)}
                </Flex>
            </Flex>

            <Flex flexDir={"column"} borderColor={"black"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"} mt={2}>
                <Flex alignItems={"center"} gap={2}>
                    <Heading ml={2} mb={1} textTransform="capitalize">access panel types</Heading>
                    <IconButton onClick={newPanelType} colorScheme="green" aria-label="add new panel Type" icon={<AddIcon />} />
                </Flex>
                <Flex ref={Animate} p={2} gap={2} borderColor={"black"} borderStyle={"solid"} borderTopWidth={1} wrap={"wrap"}>
                    {panelTypesIsSuccess && A.map(panelTypes, p => <PanelTypeCard key={p.id} panelType={p} />)}
                    {A.map(newPanelTypes, p => <NewPanelTypeCard key={p.id} panelType={p} />)}
                </Flex>
            </Flex>
        </Layout>
    )
}

PanelsAdmin.auth = true;

export default PanelsAdmin;

