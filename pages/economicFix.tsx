import { Button, Center, Flex, Heading, Input, InputGroup, InputLeftAddon, Stack, Text, useColorMode } from "@chakra-ui/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { S } from "@mobily/ts-belt";
import { ChangeEvent, useState } from "react";
import Layout from "../components/layout";
import { useApi } from "../hooks/useApi";
import { economicFixResponse } from "./api/economicFix";

const EconomicFix = () => {
    const { colorMode } = useColorMode()
    const [orderNr, setOrderNr] = useState("")
    const [status, setStatus] = useState("")
    const { post } = useApi("/api/")
    const [Animate] = useAutoAnimate<HTMLDivElement>()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setOrderNr(e.target.value)
    }

    const handleSubmit = () => {
        post<economicFixResponse>("economicFix", { orderNr })
            .then(data => {
                setStatus(data.status)
                console.log(data);

            })
    }

    return (
        <Layout>
            <Center h={"full"}>
                <Stack ref={Animate} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" p={2}>
                    <Heading mx="auto" fontSize="2xl">Nardocar Economic Order Fix</Heading>

                    <InputGroup borderColor={colorMode == "light" ? "black" : "white"}>
                        <InputLeftAddon>order. nr</InputLeftAddon>
                        <Input type="text" value={orderNr} onChange={handleChange} />
                    </InputGroup>

                    <Button bg="blue.500" textColor="white" onClick={handleSubmit}>send</Button>
                    {
                        S.isNotEmpty(status) && (
                            <Flex borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" justifyContent={"center"} p={1}>
                                <Text>{status}</Text>
                            </Flex>
                        )
                    }
                </Stack>
            </Center>
        </Layout>
    )
}

EconomicFix.auth = true

export default EconomicFix;