import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Grid, GridItem, Text, VStack } from "@chakra-ui/react";
import { A, D } from "@mobily/ts-belt";
import { useQuery } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { ReactNode } from "react";
import { AccessPanel, AccessPanelType } from "../prisma/lib/main";
import Link from 'next/link';
import router, { useRouter } from "next/router";

type AccessPanelAndType = AccessPanel & {
    type: AccessPanelType | null;
};

const getAccessPanels = () => fetch(`/api/user/accessPanels`).then((res) => res.json() as Promise<AccessPanelAndType[]>);


interface props {
    children: ReactNode;
}

const Layout = ({ children }: props) => {



    return (
        <Grid h="100vh" templateRows="auto 1fr" templateColumns="auto 1fr">
            <GridItem rowSpan={2} borderColor={"black"} borderStyle={"solid"} borderRightWidth={2}>
                <SideNavber />
            </GridItem>

            <GridItem borderColor={"black"} borderStyle={"solid"} borderBottomWidth={2}>
                <TopNavbar />
            </GridItem>



            <GridItem p={2}>
                {children}
            </GridItem>
        </Grid>
    )
}

export default Layout;

const TopNavbar = () => {
    const router = useRouter()
    const { data: accessPanel, isSuccess } = useQuery(["accessPanels"], getAccessPanels, {
        select(data) {
            const path = router.pathname.slice(1);
            const panel = data.find((p) => p.url === path);
            const temp = D.makeEmpty<AccessPanelAndType>()
            temp.url = ""
            return panel || temp;
        },
    });

    return (
        <Breadcrumb textTransform={"capitalize"} marginLeft="2" fontSize={"2xl"}>
            <BreadcrumbItem key={"/"}>
                <Link href="/" passHref>
                    <BreadcrumbLink>Dashboard</BreadcrumbLink>
                </Link>
            </BreadcrumbItem>

            {
                isSuccess && A.map(accessPanel.url.split("/"), line => {
                    return <BreadcrumbItem key={line}>
                        <Link href={`/${line}`} passHref>
                            <BreadcrumbLink>{line}</BreadcrumbLink>
                        </Link>
                    </BreadcrumbItem>
                })
            }
        </Breadcrumb>
    )
}


const SideNavber = () => {
    const { data: accessPanels, isSuccess } = useQuery(["accessPanels"], getAccessPanels);

    return (
        <>
            <Text fontSize={"2xl"} textAlign={"center"} textTransform={"capitalize"}>manu</Text>

            <VStack justifyContent={"center"} mt={2} spacing={2} px={4}>
                <Link href='/' key='/' passHref>
                    <Button as='a' h={"auto"} w={"full"} py={2} flexDir="column" textColor="white" textTransform={"capitalize"} bgGradient={`linear(to-t, gray.500, black)`}>
                        Dashboard
                    </Button>
                </Link>
                {isSuccess && accessPanels.length == 0 && <Button colorScheme={"green"} h={"auto"} w="full" py={2} onClick={() => signIn()}>Log in</Button>}
                {
                    isSuccess && A.map(accessPanels, p => {

                        return (
                            <Link href={`/${p.url}`} key={p.id} passHref>
                                <Button as='a' h={"auto"} w={"full"} py={2} flexDir="column" textColor="white" textTransform={"capitalize"} bgGradient={`linear(to-t, ${p.type ? p.type.color : "#000"}, black)`}>
                                    {p.panel.split('\\n').map(i => <p key={i}>{i}</p>)}
                                </Button>
                            </Link>
                        )
                    })
                }
            </VStack>
        </>
    )
}