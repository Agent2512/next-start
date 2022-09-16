import { Box, Button, Center, createIcon, Heading, Input, InputGroup, InputLeftAddon, Radio, RadioGroup, Stack, Text, useColorMode } from "@chakra-ui/react";
import { A, F, G, pipe } from "@mobily/ts-belt";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Papa, { ParseLocalConfig, ParseResult, UnparseObject } from "papaparse";
import { ChangeEvent, useState } from "react";
import Layout from "../components/layout";
import { useApi } from "../hooks/useApi";
import { sitesResponseList } from "./api/sites";

const fileIocn = createIcon({
    viewBox: "0 0 16 16",
    d: "M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5v2zM3 12v-2h2v2H3zm0 1h2v2H4a1 1 0 0 1-1-1v-1zm3 2v-2h3v2H6zm4 0v-2h3v1a1 1 0 0 1-1 1h-2zm3-3h-3v-2h3v2zm-7 0v-2h3v2H6z"
})

const DownloadIocn = createIcon({
    viewBox: "0 0 16 16",
    d: "M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" + "M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"

})

function parseAsync<T>(file: any) {
    return new Promise<ParseResult<T>>((resolve, reject) => {
        const parseOptions = {
            complete: (results) => resolve(results),
            error: (error) => reject(error),
            comments: 'ORDERS',
            header: true,
            skipEmptyLines: 'greedy',
        } as ParseLocalConfig;

        Papa.parse(file, parseOptions);
    });
}

interface IcsvDataRaw {
    CUST_EMAIL: string
    CUST_NAME: string
    ORDER_ID: string
    STATE_ID: string
    LANGUAGE_ID: string
}

interface IcsvDataNew {
    CUST_NAME: string
    CUST_EMAIL: string
    CUST_FIRSTNAME: string | undefined
}

const MailMerge = () => {
    const { get } = useApi("/api/")
    const { data: sites, isSuccess: sitesSuccess } = useQuery(["sites", "list"], () => get<sitesResponseList>("sites?format=list"))
    const { data: dsites, isSuccess: dsitesSuccess } = useQuery(["sites", "list", "deactive"], () => get<sitesResponseList>("sites?format=list&active=false"), {
        select(data) {
            return A.map(data, s => s.siteid)
        },
    })
    const { colorMode } = useColorMode()
    const [platform, setPlatform] = useState("nardocar");
    const [fileName, setFileName] = useState('[No file selected...]');
    const [downloadDisabled, setDownloadDisabled] = useState(true);
    const [csvFile, setCsvFile] = useState<File | null>(null)

    const handlefileSet = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (G.isNull(files)) return
        const file = files.item(0)
        if (G.isNull(file)) return

        setFileName(file.name);
        setCsvFile(file);
        setDownloadDisabled(false);
    }

    const handleDownload = async () => {
        if (!dsitesSuccess) return
        if (G.isNull(csvFile)) return

        const csv = await parseAsync<IcsvDataRaw>(csvFile)

        pipe(
            csv.data,
            A.map(x => Number(x.LANGUAGE_ID)),
            A.uniq,
            A.filter(x => !A.includes(dsites, x)),
            A.sort((a, b) => a - b),
            A.map(siteId => {
                const newCsvData: IcsvDataNew[] = pipe(
                    csv.data,
                    A.filter(row => row.STATE_ID !== "1" && row.STATE_ID !== "4" && Number(row.LANGUAGE_ID) === siteId),
                    A.map(row => {
                        return {
                            CUST_NAME: row.CUST_NAME,
                            CUST_EMAIL: row.CUST_EMAIL,
                            CUST_FIRSTNAME: row.CUST_NAME.split(' ')[0],
                        }
                    }),
                    F.toMutable
                )

                const newCsv: UnparseObject<IcsvDataNew> = {
                    data: newCsvData,
                    fields: ['CUST_NAME', 'CUST_EMAIL', 'CUST_FIRSTNAME'],
                }

                const siteCsvFile = Papa.unparse(newCsv, {
                    delimiter: ';',
                    header: true,
                });

                const siteCsvBlob = new Blob(['\uFEFF' + siteCsvFile], {
                    type: 'text/csv;charset=utf-8',
                });

                const siteName = getSiteName(Number(siteId))?.website.replace("https://www.", "")
                if (siteName == undefined) return

                const siteCsvFileName = `${siteName}-${dayjs().format("DD-MM-YYYY")}.csv`
                const siteCsvFileUrl = URL.createObjectURL(siteCsvBlob)

                return {
                    siteCsvFileName,
                    siteCsvFileUrl,
                }
            }),
            F.ifElse(
                A.any(s => s == undefined),
                () => { alert("Wrong Platform"); return [] },
                s => s
            ),
            A.map(s => {
                if (!s) return s
                const a = document.createElement('a');
                a.href = s.siteCsvFileUrl;
                a.download = s.siteCsvFileName;
                a.click();
                a.remove();
                return s
            })
        )
    }

    const getSiteName = (siteId: number) => {
        if (!sitesSuccess) return

        const site = pipe(
            sites,
            A.filter(x => x.siteid === siteId),
            F.ifElse(
                () => platform == "nardocar",
                x => A.find(x, x => x.name == "Nardocar"),
                x => A.find(x, x => x.name != "Nardocar")
            )
        )

        return site
    }

    return (
        <Layout>
            <Center h={"full"}>
                <Stack borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" p={2}>
                    <Heading mx="auto" fontSize="2xl">Mail Merge</Heading>

                    <RadioGroup display="flex" justifyContent="space-between" gap={4} value={platform} onChange={setPlatform}>
                        <Box borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" p={2}>
                            <Radio value='nardocar'>Nardocar</Radio>
                        </Box>
                        <Text h={"fit-content"} m={"auto"}>Platform</Text>
                        <Box borderColor={colorMode == "light" ? "black" : "white"} borderStyle="solid" borderWidth={1} borderRadius="md" p={2}>
                            <Radio value='iwao'>BG/IWAO/EA</Radio>
                        </Box>
                    </RadioGroup>

                    <InputGroup borderColor={colorMode == "light" ? "black" : "white"}>
                        <InputLeftAddon>select CSV file</InputLeftAddon>
                        <Input type="text" value={fileName} onChange={() => { }} onClick={() => document.getElementById('file-input')?.click()} />

                        <Input type="file" multiple={false} accept=".csv" id="file-input" hidden onChange={handlefileSet} />
                    </InputGroup>

                    <Button bg="blue.500" textColor="white" disabled={sitesSuccess && dsitesSuccess && downloadDisabled} onClick={handleDownload}><DownloadIocn marginRight={2} /> download list</Button>
                </Stack>
            </Center>
        </Layout>
    )
}

MailMerge.auth = true

export default MailMerge