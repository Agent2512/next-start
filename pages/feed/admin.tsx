import { AddIcon } from "@chakra-ui/icons";
import { Button, Grid, IconButton, Input, Stack, Text, useColorMode, VStack } from "@chakra-ui/react";
import { A, N, pipe } from "@mobily/ts-belt";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent } from "react";
import Layout from "../../components/layout";
import { useApi } from "../../hooks/useApi";
import { useFilter } from "../../hooks/useFilter";
import { FeedWithUpdate } from "../api/feed/getAllFeeds";

const FeedAdmin = () => {
    const queryClient = useQueryClient()

    const makeNewFeed = () => {
        queryClient.setQueriesData(["feed"], (fs) => {
            const feeds = fs as FeedWithUpdate[]
            const newFeed: FeedWithUpdate = {
                id: -feeds.length,
                feedName: "...feed name",
                siteId: 0,
                webShop: "",
                durationPrice: 5,
                durationProduct: 5,
                feedUpdate: []
            }
            return [newFeed, ...feeds]
        })
    }

    const { get } = useApi("/api/feed/")
    const { data, isSuccess } = useQuery(["feed"], () => get<FeedWithUpdate[]>("getAllFeeds"))
    const { Filter, value } = useFilter({
        filters: [
            {
                type: "Input",
                key: "feedName",
                title: "Feed Name",
            }
        ],
        childrenAfter: [
            <IconButton
                colorScheme='green'
                aria-label='new feed'
                key={"newFeed"}
                icon={<AddIcon />}
                onClick={makeNewFeed}
            />
        ]
    });



    return (
        <Layout>
            {Filter}

            <VStack>
                {
                    isSuccess && pipe(
                        data,
                        A.filter(f => f.feedName.toLowerCase().includes(value.feedName.toLowerCase())),
                        A.map(f => <FeedControlAdmin key={f.id} feed={f} />)
                    )
                }
            </VStack>
        </Layout>
    )
}

FeedAdmin.auth = true;

export default FeedAdmin

interface Props {
    feed: FeedWithUpdate;
}

const FeedControlAdmin = (props: Props) => {
    const { colorMode } = useColorMode()
    const queryClient = useQueryClient()
    const { post } = useApi("/api/feed/options/")

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        queryClient.setQueriesData(["feed"], (fs) => {
            let feeds = fs as FeedWithUpdate[]
            const feed = A.getBy(feeds, f => f.id === props.feed.id)
            if (!feed) return
            const newFeed = { ...feed, [name]: value }
            const index = feeds.indexOf(feed)
            return A.replaceAt(feeds, index, newFeed)
        })
    }

    const handleSave = () => {
        if (N.lt(props.feed.id, 0)) {
            post<FeedWithUpdate>("new", props.feed)
                .then(() => queryClient.invalidateQueries(["feed"]))
        }
        else {
            post<FeedWithUpdate>("eidt", props.feed)
                .then(() => queryClient.invalidateQueries(["feed"]))
        }


    }

    const handleDelete = () => {
        if (N.lt(props.feed.id, 0)) {
            queryClient.setQueriesData(["feed"], (fs) => {
                let feeds = fs as FeedWithUpdate[]
                const index = feeds.indexOf(props.feed)
                return A.removeAt(feeds, index)
            })
            return
        }
        else {
            if (confirm("Are you sure you want to delete this feed?") == false) return;

            queryClient.setQueriesData(["feed"], (fs) => {
                let feeds = fs as FeedWithUpdate[]
                const index = feeds.indexOf(props.feed)
                return A.removeAt(feeds, index)
            })

            post<FeedWithUpdate>("delete", props.feed)
                .then(() => queryClient.invalidateQueries(["feed"]))
        }
    }


    return (
        <Grid bg={colorMode == "light" ? "gray.200" : "gray.800"} templateColumns="2fr .7fr .6fr .5fr .5fr .5fr" columnGap={2} p={2} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" textTransform="capitalize">
            <Stack bg={colorMode == "light" ? "gray.300" : "gray.700"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" >
                <Text ml={1}>feed name</Text>
                <Input bg={colorMode == "light" ? "white" : "black"} value={props.feed.feedName} onChange={handleChange} name="feedName" border={0} borderTop="1px solid var(--chakra-colors-black)" borderTopRadius={0} />
            </Stack >

            <Stack bg={colorMode == "light" ? "gray.300" : "gray.700"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md">
                <Text ml={1}>product time</Text>
                <Input bg={colorMode == "light" ? "white" : "black"} value={props.feed.durationProduct} onChange={handleChange} name="durationProduct" type="number" border={0} borderTop="1px solid var(--chakra-colors-black)" borderTopRadius={0} />
            </Stack>

            <Stack bg={colorMode == "light" ? "gray.300" : "gray.700"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md">
                <Text ml={1}>price time</Text>
                <Input bg={colorMode == "light" ? "white" : "black"} value={props.feed.durationPrice} onChange={handleChange} name="durationPrice" type="number" border={0} borderTop="1px solid var(--chakra-colors-black)" borderTopRadius={0} />
            </Stack>

            <Stack bg={colorMode == "light" ? "gray.300" : "gray.700"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md">
                <Text ml={1}>site id</Text>
                <Input bg={colorMode == "light" ? "white" : "black"} value={props.feed.siteId} onChange={handleChange} name="siteId" type="number" border={0} borderTop="1px solid var(--chakra-colors-black)" borderTopRadius={0} />
            </Stack>

            <Stack bg={colorMode == "light" ? "gray.300" : "gray.700"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md">
                <Text ml={1}>web shop</Text>
                <Input bg={colorMode == "light" ? "white" : "black"} value={props.feed.webShop} onChange={handleChange} name="webShop" border={0} borderTop="1px solid var(--chakra-colors-black)" borderTopRadius={0} />
            </Stack>

            <Grid templateRows={"1fr 1fr"} >
                <Button h={"auto"} onClick={handleSave} borderBottomRadius={0} colorScheme={"green"}>Save</Button>
                <Button h={"auto"} onClick={handleDelete} borderTopRadius={0} colorScheme={"red"}>Delete</Button>
            </Grid>
        </Grid >
    )
}