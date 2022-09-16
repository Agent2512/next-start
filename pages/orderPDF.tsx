import { Button, Center, Flex, Heading, Input, InputGroup, InputLeftAddon, Radio, RadioGroup, Spinner, Stack, useColorMode } from "@chakra-ui/react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { FormEvent, useState } from "react"
import Layout from "../components/layout"
import { useApi } from "../hooks/useApi"
import { addressBlock, hookInfo, orderItemInfo } from "../utils/pdfTemplate"

type res = {
    orderItemsInfo: orderItemInfo
    orderInfo: hookInfo["newValues"]
    addressBlock: addressBlock
    msg?: string
}

const OrderPDF = () => {
    const [order, setOrder] = useState('')
    const [vat, setVat] = useState('true')
    const [site, setSite] = useState('iwao')
    const [running, setRunning] = useState(false)
    const { post } = useApi()
    const [Animate] = useAutoAnimate<HTMLDivElement>({
        easing: "ease-in"
    })
    const { colorMode } = useColorMode()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setRunning(true)
        const url = e.currentTarget.action

        const data = await post<res>(url, {
            order,
            vat,
            site,
        })

        if (data.msg) {
            alert(data.msg)
            setRunning(false)
            return
        }

        const pdfTemplate = (await import("../utils/pdfTemplate")).pdfTemplate

        const pdf = pdfTemplate(data.orderItemsInfo, data.orderInfo, data.addressBlock)

        pdf.download(`Order-${data.orderInfo.id}.pdf`)
        setRunning(false)
    }
    return (
        <Layout>
            <Center h="full" >
                <form onSubmit={handleSubmit} action="https://autoinvoice.v.navo-it.dk/api/getOrderPDF" method="post" >
                    <Stack>
                        <Heading mx="auto" fontSize="2xl">Get order PDF</Heading>

                        <InputGroup borderColor={colorMode == "light" ? "black" : "white"}>
                            <InputLeftAddon borderColor={colorMode == "light" ? "black" : "white"}>Order number</InputLeftAddon>
                            <Input type='text' name="order" placeholder='order number' value={order} onChange={(e: any) => { setOrder(e.target.value) }} />
                        </InputGroup>

                        <RadioGroup onChange={setVat} value={vat} justifyContent="space-between" display="flex" borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" >
                            <Radio borderColor={colorMode == "light" ? "black" : "white"} value='true'>with VAT</Radio>
                            <Radio borderColor={colorMode == "light" ? "black" : "white"} value='false'>with out VAT</Radio>
                        </RadioGroup>

                        <RadioGroup onChange={setSite} value={site} justifyContent="space-between" display="flex" borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" >
                            <Radio borderColor={colorMode == "light" ? "black" : "white"} value='iwao'>OgawaEurope, IWAO, <br /> Billige-Senkesett, <br /> Billiga-Coilovers, <br /> Elite-Armor</Radio>
                            <Radio borderColor={colorMode == "light" ? "black" : "white"} value='nardocar'>nardocar</Radio>
                        </RadioGroup>

                        <Flex ref={Animate} w="full" gap={2} alignItems="center">
                            <Button bg={running ? "green.500" : "blue.500"} w="full" textColor="white" type="submit" disabled={running}>{running ? "downloading pdf" : "submit"}</Button>
                            {running && <Spinner mr={1} />}
                        </Flex>
                    </Stack>
                </form>
            </Center>
        </Layout>
    )
}

OrderPDF.auth = true;

export default OrderPDF