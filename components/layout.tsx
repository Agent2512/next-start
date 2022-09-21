import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Grid, GridItem, Text, useColorMode, VStack } from "@chakra-ui/react";
import { useSize } from "@chakra-ui/react-use-size";
import { A, D } from "@mobily/ts-belt";
import { useQuery } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from "next/router";
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { AccessPanel, AccessPanelType } from "../prisma/lib/main";

type AccessPanelAndType = AccessPanel & {
    type: AccessPanelType | null;
};

const getAccessPanels = () => fetch(`/api/user/userAccessPanels`).then((res) => res.json() as Promise<AccessPanelAndType[]>);


interface props {
    children: ReactNode;
}

const Layout = ({ children }: props) => {
    const { colorMode } = useColorMode()
    const [sideSize, setSideSize] = useState({ width: 162.625, height: 524.625 });

    return (
        <Grid h="100vh" templateRows="auto 1fr" templateColumns="auto 1fr" >
            <GridItem w={sideSize.width} rowSpan={2} borderColor={colorMode == "light" ? "black" : "white"} borderStyle={"solid"} borderRightWidth={2} >
                <SideNavber setSize={setSideSize} />
            </GridItem>

            <GridItem borderColor={colorMode == "light" ? "black" : "white"} borderStyle={"solid"} borderBottomWidth={2}>
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
    const { data: accessPanel, isSuccess } = useQuery(["userAccessPanels"], getAccessPanels, {
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

const SideNavber = ({ setSize }: { setSize: Dispatch<SetStateAction<{ width: number, height: number }>> }) => {
    const { data: accessPanels, isSuccess } = useQuery(["userAccessPanels"], getAccessPanels);
    // const [Animate] = useAutoAnimate<HTMLDivElement>()
    const { toggleColorMode } = useColorMode()
    const elementRef = useRef<HTMLDivElement>(null)
    const size = useSize(elementRef)

    useEffect(() => {
        size && setSize(size);
    }, [size, setSize])

    useEffect(() => {
        (window as any).toggleColorMode = toggleColorMode
    })


    return (
        <>
            <Text onClick={toggleColorMode} fontSize={"2xl"} textAlign={"center"} textTransform={"capitalize"}>menu</Text>

            <VStack ref={elementRef} justifyContent={"center"} mt={2} spacing={2} px={4} pos={"fixed"}>
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