import { Button, Flex, Heading, Stack, Text, useColorMode, VStack } from "@chakra-ui/react";
import { A, pipe } from "@mobily/ts-belt";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { MouseEvent, useEffect, useState } from "react";
import Layout from "../../components/layout";
import { useApi } from "../../hooks/useApi";
import { useFilter } from "../../hooks/useFilter";
import { FeedWithUpdate } from "../api/feed/getAllFeeds";

const Feed = () => {
    const { Filter, value } = useFilter({
        filters: [
            {
                type: "Input",
                key: "feedName",
                title: "Feed Name",
            }
        ]
    });
    const queryClient = useQueryClient();
    const { get, post } = useApi("/api/feed/")
    const { data, isSuccess } = useQuery(["feed"], () => get<FeedWithUpdate[]>("getAllFeeds"), {
        refetchInterval: 1000 * 60
    })

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        const name = e.currentTarget.name as "product" | "price"
        const value = e.currentTarget.value.split(",") as [string, string]

        post("options/update", {
            type: name,
            siteId: Number(value[0]),
            webShop: value[1],
        }).then(() => queryClient.invalidateQueries(["feed"]))
    }

    return (
        <Layout>
            {Filter}

            <VStack>
                {
                    isSuccess && pipe(
                        data,
                        A.filter(f => f.feedName.toLowerCase().includes(value.feedName.toLowerCase())),
                        A.map(feed => <FeedControlBtn key={feed.id} feed={feed} handleClick={handleClick} value={[feed.siteId.toString(), feed.webShop]} />)
                    )
                }
            </VStack>
        </Layout>
    )
}

Feed.auth = true;

export default Feed

interface Props {
    value: [string, string];
    feed: FeedWithUpdate;
    handleClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const FeedControlBtn = (props: Props) => {
    const [lastProductUpdateString, setLastProductUpdateString] = useState<string>(new Date("0").toLocaleString("en-GB"));
    const [lastPriceUpdateString, setLastPriceUpdateString] = useState<string>(new Date("0").toLocaleString("en-GB"));
    const [isUpdateDone, setIsUpdateDone] = useState<boolean>(false)
    const { colorMode } = useColorMode()

    useEffect(() => {
        const lastProductUpdate = props.feed.feedUpdate.find(update => update.type === "product");
        const lastPriceUpdate = props.feed.feedUpdate.find(update => update.type === "price");

        if (lastProductUpdate) {
            setLastProductUpdateString(
                new Date(lastProductUpdate.updateDate).toLocaleString("en-GB")
            );
        }
        if (lastPriceUpdate) {
            setLastPriceUpdateString(
                new Date(lastPriceUpdate.updateDate).toLocaleString("en-GB")
            );
        }
    }, [props.feed])

    useEffect(() => {
        if (props.feed.feedUpdate[0] == undefined)
            return;
        const isBefore = dayjs().isBefore(dayjs(props.feed.feedUpdate[0].updateDone));

        setIsUpdateDone(isBefore);
    }, [props.feed])

    useEffect(() => {
        if (props.feed.feedUpdate[0] == undefined) return;
        if (isUpdateDone == false) return;

        const int = setInterval(() => {
            if (props.feed.feedUpdate[0] == undefined) return
            const isBefore = dayjs().isBefore(dayjs(props.feed.feedUpdate[0].updateDone));

            setIsUpdateDone(isBefore);

            if (isBefore == false) {
                clearInterval(int);
            }

        }, 1000);


    }, [props.feed, isUpdateDone])

    return (
        <Stack direction={"row"} px="3" borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" wrap="wrap" justifyContent={"space-between"}>
            <Heading w="60" fontSize="2xl">{props.feed.feedName}</Heading>

            <Stack direction={"row"} alignItems="center" gap={2} wrap="wrap" justifyContent="center">
                <Flex justifyContent={"space-evenly"} >
                    <Text textAlign="center" w="40">
                        last product update: <br />
                        {lastProductUpdateString}
                    </Text>

                    <Text textAlign="center" w="40">
                        last price update: <br />
                        {lastPriceUpdateString}
                    </Text>
                </Flex>

                <Flex gap={2} justifyContent={"space-evenly"}  >
                    <Button onClick={props.handleClick} borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1} name="product" w="32" value={props.value} disabled={isUpdateDone}>
                        {isUpdateDone ? "running products" : "update products"}
                    </Button>

                    <Button onClick={props.handleClick} borderColor={colorMode == "light" ? "black" : "white"} borderWidth={1} name="price" w="32" value={props.value} disabled={isUpdateDone}>
                        {isUpdateDone ? "running prices" : "update prices"}
                    </Button>
                </Flex>
            </Stack>
        </Stack>
    );
}