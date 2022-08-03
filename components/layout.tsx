import { Button, Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import { AccessPanel, AccessPanelType } from "../prisma/lib/main";

type AccessPanelAndType = AccessPanel & {
    type: AccessPanelType | null;
};

const getAccessPanels = () => fetch(`/api/user/accessPanel`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
}).then((res) => res.json() as Promise<AccessPanelAndType[]>);


interface props {
    children: ReactNode;
}

const Layout = ({ children }: props) => {
    useQuery(["accessPanels"], getAccessPanels)

    return (
        <Grid h="100vh" templateRows="auto 1fr" templateColumns="auto 1fr">
            <GridItem w={"160px"} rowSpan={2} borderColor={"black"} borderStyle={"solid"} borderRightWidth={2}>
                <SideNavber />
            </GridItem>

            <GridItem h={"35px"} borderColor={"black"} borderStyle={"solid"} borderBottomWidth={2}>

            </GridItem>



            <GridItem>
                {children}
            </GridItem>
        </Grid>
    )
}

export default Layout;

const SideNavber = () => {
    const router = useRouter();
    const [accessPanels, setAccessPanels] = useState<AccessPanelAndType[]>([]);
    useQuery(["accessPanels"], {
        refetchInterval: 1000,
        onSuccess: (data:AccessPanelAndType[]) => setAccessPanels(data),
    });

    useEffect(() => console.log(accessPanels), [accessPanels])


    return (
        <>
            <Text fontSize={"2xl"} textAlign={"center"} textTransform={"capitalize"}>manu</Text>

            <HStack justifyContent={"center"} mt={2} spacing={2}>
                <Button key={"/"} onClick={() => router.push(`/`)} h={"auto"} py={2} textColor="#fff" textTransform={"capitalize"} bgGradient={`linear(to-t, gray.500, black)`}>
                    Dashboard
                </Button>
            </HStack>
        </>
    )
}