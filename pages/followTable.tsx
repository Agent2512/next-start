import { Grid, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useColorMode } from "@chakra-ui/react";
import { useState } from "react";
import Layout from "../components/layout";
import { useFilter } from "../hooks/useFilter";

const followTable = () => {
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
        ]
    })
    const [sliderValue, setSliderValue] = useState(50)


    return (
        <Layout>
            {Filter}
            <Slider aria-label='slider-ex-1' colorScheme={"blue"} step={.5} min={35} max={65} value={sliderValue} onChange={sv => setSliderValue(sv)}>
                <SliderTrack>
                    <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
            </Slider>

            <Grid w={"full"} templateColumns={`${sliderValue}% ${100 - sliderValue}%`} gap={2}>
                <TableOfSatisfaction filterValue={filterValue} />
                <TableOfTracking filterValue={filterValue} />
            </Grid>
        </Layout>
    )
}

followTable.auth = true;

export default followTable;


const TableOfSatisfaction = ({ filterValue }: { filterValue: ReturnType<typeof useFilter>["value"] }) => {
    const { colorMode } = useColorMode()

    return (
        <TableContainer borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1}>
            <Table variant={"striped"}>
                <Thead>
                    <Tr>
                        <Th>To convert</Th>
                        <Th>into</Th>
                        <Th isNumeric>multiply by</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td>inches</Td>
                        <Td>millimetres (mm)</Td>
                        <Td isNumeric>25.4</Td>
                    </Tr>
                    <Tr>
                        <Td>feet</Td>
                        <Td>centimetres (cm)</Td>
                        <Td isNumeric>30.48</Td>
                    </Tr>
                    <Tr>
                        <Td>yards</Td>
                        <Td>metres (m)</Td>
                        <Td isNumeric>0.91444</Td>
                    </Tr>
                </Tbody>
            </Table>
        </TableContainer>
    )
}

const TableOfTracking = ({ filterValue }: { filterValue: ReturnType<typeof useFilter>["value"] }) => {
    const { colorMode } = useColorMode()

    return (
        <TableContainer borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1}>
            <Table variant={"striped"}>
                <Thead>
                    <Tr>
                        <Th>To convert</Th>
                        <Th>into</Th>
                        <Th isNumeric>multiply by</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <Tr>
                        <Td>inches</Td>
                        <Td>millimetres (mm)</Td>
                        <Td isNumeric>25.4</Td>
                    </Tr>
                    <Tr>
                        <Td>feet</Td>
                        <Td>centimetres (cm)</Td>
                        <Td isNumeric>30.48</Td>
                    </Tr>
                    <Tr>
                        <Td>yards</Td>
                        <Td>metres (m)</Td>
                        <Td isNumeric>0.91444</Td>
                    </Tr>
                </Tbody>
            </Table>
        </TableContainer>
    )
}