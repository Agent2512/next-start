import { createPdf } from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";



const blankLine = '<svg height="3" width="515"><line x1="0" y1="2" x2="515" y2="2" style="stroke:#000;stroke-width:2" /></svg>'

export const pdfTemplate = (orderItemsInfo: orderItemInfo | any, orderInfo: hookInfo["newValues"] | any, addressBlock: addressBlock | any) => {
    const docDefinition: TDocumentDefinitions = {
        content: [
            {
                // header
                text: "Proforma Invoice",
                bold: true,
                fontSize: 15,
            },
            {
                // order info
                lineHeight: 1.2,
                columns: [
                    {
                        // buyer info
                        text: [
                            // title
                            {
                                text: "Buyer",
                                bold: true,
                                fontSize: 13,
                            },
                            // info
                            addressBlock.buyer.companyName,
                            addressBlock.buyer.name,
                            addressBlock.buyer.address,
                            `${addressBlock.buyer.zipCode} ${addressBlock.buyer.city}, ${addressBlock.buyer.country}`,
                            addressBlock.buyer.phone && `Phone: ${addressBlock.buyer.phone}`,
                            addressBlock.buyer.email && `Email: ${addressBlock.buyer.email}`,
                            addressBlock.buyer.vatRegistrationNumber && `VAT No: ${addressBlock.buyer.vatRegistrationNumber}`,
                        ].map(l => addLineBreak(l))
                    },
                    {
                        // seller info
                        alignment: "right",
                        text: [
                            // title
                            {
                                text: "Seller",
                                bold: true,
                                fontSize: 13
                            },
                            // info
                            addressBlock.seller.companyName,
                            addressBlock.seller.address,
                            `${addressBlock.seller.zipCode} ${addressBlock.seller.city}, ${addressBlock.seller.country}`,
                            addressBlock.seller.email && `Email: ${addressBlock.seller.email}`,
                            addressBlock.seller.vatRegistrationNumber && `VAT No: ${addressBlock.seller.vatRegistrationNumber}`,
                        ].map(l => addLineBreak(l))
                    }
                ]
            },
            {
                // delivery address
                lineHeight: 1.2,
                alignment: "right",
                text: addressBlock.delivery == undefined ? "" : [
                    // title
                    {
                        text: "Delivery Address",
                        bold: true,
                        fontSize: 13,
                    },
                    // info
                    addressBlock.delivery.companyName,
                    addressBlock.delivery.name,
                    addressBlock.delivery.address,
                    `${addressBlock.delivery.zipCode} ${addressBlock.delivery.city}, ${addressBlock.delivery.country}`,
                    addressBlock.delivery.phone && `Phone: ${addressBlock.delivery.phone}`,
                    addressBlock.delivery.email && `Email: ${addressBlock.delivery.email}`,
                    addressBlock.delivery.vatRegistrationNumber && `VAT No: ${addressBlock.delivery.vatRegistrationNumber}`,
                ].map(l => addLineBreak(l))
            },

            {
                // order info
                margin: [0, 10, 0, 0],
                alignment: "right",
                text: [
                    `Nr: ${orderInfo.id}`,
                    `Order date: ${orderInfo.createdDate.replace("T", " ")}`
                ].map(l => addLineBreak(l)),
            },
            {
                // blank line
                svg: blankLine,
            },
            {
                layout: "lightHorizontalLines",
                alignment: "right",
                table: {
                    widths: [40, "*", 55, 35, 20, 45, 60],
                    body: [
                        [
                            {
                                text: "Item nr", style: "tableHeader",
                                alignment: "left"
                            },
                            {
                                text: "Description", style: "tableHeader",
                                alignment: "left"
                            },
                            {
                                text: "CustomCode", style: "tableHeader",
                            },
                            {
                                text: "MadeIn", style: "tableHeader",
                            },
                            {
                                text: "QTY", style: "tableHeader",
                            },
                            {
                                text: "Amount", style: "tableHeader",
                            },
                            {
                                text: "Total Amount", style: "tableHeader",
                            }
                        ],
                        ...makeItemsToPdf(orderItemsInfo.items),
                    ]
                }
            },
            {
                // blank line
                svg: blankLine,
            },
            {
                alignment: "right",
                text: [
                    { text: "(Tax free amount: 0,00 = Taxable amount: 0,00)", alignment: "left" },
                    `Sub Total: ${orderItemsInfo.subTotal.toFixed(2)}`,
                    `${orderInfo.vatPercentage}% VAT: ${orderItemsInfo.vatTotal.toFixed(2)}`,
                    { text: `Total ${orderItemsInfo.isVatIncluded ? 'incl.' : 'ex.'} VAT: ${orderInfo.currencyCode} ${orderItemsInfo.total.toFixed(2)}`, bold: true },
                ].map(l => addLineBreak(l)),
            },
            {
                // blank line
                svg: blankLine,
            },
            {
                alignment: "center",
                text: [
                    { text: "Payment Terms: Credit", alignment: "left" },
                    `${addressBlock.seller.companyName} - ${addressBlock.seller.address} - ${addressBlock.seller.zipCode} ${addressBlock.seller.city}, ${addressBlock.seller.country} - Mail: ${addressBlock.seller.email}`,
                    `Bank: Sparekassen for Nr. Nebel og Omegn - Account No.: ${addressBlock.seller.AccountNr} - IBAN: ${addressBlock.seller.IBAN}`,
                    `SWIFT: ${addressBlock.seller.SWIFT}`
                ].map(l => addLineBreak(l))
            },
        ],
        pageSize: 'A4',
        styles: {
            tableHeader: {
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 9
        },
        info: {
            title: `Order-${orderInfo.id}`,
        },
    }

    // const pdfDoc = pdf.createPdfKitDocument(docDefinition);
    // pdfDoc.end()
    return createPdf(
        docDefinition,
        undefined,
        undefined,
        pdfFonts.pdfMake.vfs
    );
}



const makeItemsToPdf = (items: item[]) => {
    return items.map(item => {
        const number = item.productNumber;
        const name = item.productName;

        const customCode = item.customCode ?? '';
        const madeIn = item.madeIn ?? '';

        const qty = item.quantity;
        const unitPrice = item.unitPrice;
        const totalPrice = item.totalPrice;

        return [
            {
                text: number,
                alignment: "left"
            },
            {
                text: name,
                alignment: "left"
            },
            customCode,
            madeIn,
            qty,
            unitPrice.toFixed(2),
            totalPrice.toFixed(2),
        ];
    })
}


const addLineBreak = (line: string | undefined | { text: string }): string | { text: string } => {
    if (line === undefined) {
        return "";
    } else if (typeof line === "string") {
        return line + "\r\n";
    } else {
        return {
            ...line,
            text: line.text + "\r\n"
        }
    }
}

interface item {
    // default
    id: number;
    productNumber: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variant: string;
    fileSaleLink: string;
    vatPercentage: string;
    unitPriceBeforeSpecialOffer: number;
    isCredited: boolean;
    // addon
    customCode: string;
    madeIn: string;
}

export interface orderItemInfo {
    // default
    items: item[];
    hasMore: boolean;
    count: number;
    correlationId: string
    // addon
    subTotal: number;
    total: number;
    isVatIncluded: boolean;
    vatTotal: number;
}

interface Site {
    origin: Site | null
    shippingMails: any[]
}

interface addressInfo {
    companyName?: string;
    name?: string;

    address?: string;
    zipCode?: string;
    city?: string;
    country?: string;

    phone?: string;
    email?: string;

    vatRegistrationNumber?: string;
}

export interface addressBlock {
    seller: Site;
    buyer: addressInfo;
    delivery?: addressInfo;
}

interface values {
    id: number;
    createdDate: string;
    incomplete: boolean;
    siteId: any;
    currencyCode: string;
    vatPercentage: string;
    shippingId: number;
    orderStateId: number;
    "deliveryInfo.phone": string;
    "deliveryInfo.address": string;
    "deliveryInfo.address2": string;
    "deliveryInfo.name": string;
    "deliveryInfo.companyName": string;
    "deliveryInfo.city": string;
    "deliveryInfo.country": string;
    "deliveryInfo.ean": string;
    "deliveryInfo.email": string;
    "deliveryInfo.fax": string;
    "deliveryInfo.state": string;
    "deliveryInfo.vatRegistrationNumber": string;
    "deliveryInfo.zipCode": string;

    "customerInfo.phone": string;
    "customerInfo.address": string;
    "customerInfo.address2": string;
    "customerInfo.name": string;
    "customerInfo.companyName": string;
    "customerInfo.city": string;
    "customerInfo.country": string;
    "customerInfo.ean": string;
    "customerInfo.email": string;
    "customerInfo.fax": string;
    "customerInfo.state": string;
    "customerInfo.zipCode": string;
}

export interface hookInfo {
    propertiesChanged: string[];
    oldValues: values | null
    newValues: values
    objectType: string
    version: number
    shopIdentifier: any
    metadata: {
        [key: string]: any
    }
}