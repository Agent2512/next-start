import { Grid, GridItem } from "@chakra-ui/react";
import { ReactNode } from "react";

interface props {
    children: ReactNode;
}

const Layout = ({ children }: props) => {
    return (
        <Grid h="100vh" templateRows="auto 1fr" templateColumns="auto 1fr">
            <GridItem w={"160px"} rowSpan={2} borderColor={"black"} borderStyle={"solid"} borderRightWidth={2}>
                
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

