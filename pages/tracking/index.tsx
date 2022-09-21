import { Flex, Heading, Text, useColorMode } from "@chakra-ui/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../../components/layout";
import { useApi } from "../../hooks/useApi";
import { useFilter } from "../../hooks/useFilter";
import { InCustomsResponse } from "../api/tracking/inCustoms";
import { MissingTrackingResponse } from "../api/tracking/missingTracking";
import { ThreeDaysDeliveryResponse } from "../api/tracking/threeDaysDelivery";

const Trackingindex = () => {
    const { Filter, value: filterValue } = useFilter({
        justifyContent: "center",
        filters: [
            {
                type: "ButtonGroup",
                key: "days",
                title: "Last",
                buttonTexts: ["Last 7 days", "Last 30 days", "Last 90 days"],
                buttonValues: [7, 30, 90],
                defaultValueIndex: 1,
            },
            {
                type: "Sites",
                key: "sites",
            },

        ]
    })
    const [Animate] = useAutoAnimate<HTMLDivElement>()
    const { post } = useApi("/api/tracking/");
    const { data: inCustoms, isSuccess: inCustomsSuccess } = useQuery(["inCustoms", filterValue], () => post<InCustomsResponse>("inCustoms", { filter: filterValue }))
    const { data: missingTracking, isSuccess: missingTrackingSuccess } = useQuery(["missingTracking", filterValue], () => post<MissingTrackingResponse>("missingTracking", { filter: filterValue }))
    const { data: threeDaysDelivery, isSuccess: threeDaysDeliverySuccess } = useQuery(["threeDaysDelivery", filterValue], () => post<ThreeDaysDeliveryResponse>("threeDaysDelivery", { filter: filterValue }))


    return (
        <Layout>
            {Filter}

            <Flex gap={2} justifyContent="center" ref={Animate}>
                <TrackingCard
                    key={"missingTracking"}
                    title={"missingTracking"}
                    low={missingTrackingSuccess ? missingTracking.ordersWithOutTracking : 0}
                    high={missingTrackingSuccess ? missingTracking.orders : 0}
                />

                <TrackingCard
                    key={"inCustoms"}
                    title={"InCustoms"}
                    low={inCustomsSuccess ? inCustoms.ordersInCustoms : 0}
                    high={inCustomsSuccess ? inCustoms.orders : 0}
                />

                <TrackingCard
                    key={"threeDaysDelivery"}
                    title={"threeDaysDelivery"}
                    low={threeDaysDeliverySuccess ? threeDaysDelivery.ordersWithThreeDelivery : 0}
                    high={threeDaysDeliverySuccess ? threeDaysDelivery.orders : 0}
                />

            </Flex>

        </Layout>
    );
}

Trackingindex.auth = true;

export default Trackingindex;

interface Props {
    title: string;
    high: number;
    low: number;
}

const TrackingCard = (props: Props) => {
    const [Animate] = useAutoAnimate<HTMLParagraphElement>()
    const { colorMode } = useColorMode()

    return (
        <Flex borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" w={"max-content"} p={2} flexDir="column">
            <Heading>{props.title}</Heading>
            <Text ref={Animate} fontSize={"3xl"} fontWeight="bold" textAlign="center">
                {props.low}/{props.high}
            </Text>
        </Flex>
    );
}