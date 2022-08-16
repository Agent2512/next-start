import { useQuery } from "@tanstack/react-query";
import Layout from "../../components/layout";
import { useApi } from "../../hooks/useApi";
import { useFilter } from "../../hooks/useFilter";

const Trackingindex = () => {
    const { Filter, value } = useFilter({
        justifyContent: "center",
        filters: [
            {
                type: "ButtonGroup",
                key: "last",
                buttonTexts: ["Last 7 days", "Last 30 days", "Last 90 days"],
                buttonValues: [7, 30, 90],
                defaultValueIndex: 1,
            },
            {
                type: "Sites",
                key: "sites",
            }
        ]
    })

    console.log(value);
    

    // const { post } = useApi("/api/tracking/");
    // const { } = useQuery(["inCustoms", value.last], () => post("inCustoms", { last: value.last }))

    return (
        <Layout>
            {Filter}
            <h1>Tracking</h1>
        </Layout>
    );
}

Trackingindex.auth = true;

export default Trackingindex;