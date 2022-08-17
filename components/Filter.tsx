import { Button, ButtonGroup, Flex, FlexboxProps, Input, Select, Text, useColorMode } from '@chakra-ui/react';
import { A, D, F, N, pipe } from '@mobily/ts-belt';
import { useQuery } from '@tanstack/react-query';
import { ChangeEvent, HTMLInputTypeAttribute, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { sitesResponse } from '../pages/api/sites';

export type Filters = SelectFilter | IncrementFilter | InputFilter | ButtonGroupFilter | DateFilter | SitesFilter

interface Props {
  filters: Filters[];
  change: (e: ChangeEvent<any>) => void;
  values: { [key: string]: any };
  justifyContent?: FlexboxProps["justifyContent"]
}

export const Filter = ({ filters, change, values, justifyContent }: Props) => {
  const { colorMode } = useColorMode()

  return (
    <Flex borderColor={colorMode == "light" ? "black" : "white"} justifyContent={justifyContent} borderWidth={2} borderRadius={"md"} p={2} gap={2} mb={2}>
      {
        A.keepMap(filters, f => {
          switch (f.type) {
            case "Select":
              return <SelectFilter key={f.key} fliter={f} change={change} value={values[f.key]} />
            case "Increment":
              return <IncrementFilter key={f.key} fliter={f} change={change} value={values[f.key]} />
            case "Input":
              return <InputFilter key={f.key} fliter={f} change={change} value={values[f.key]} />
            case "ButtonGroup":
              return <ButtonGroupFilter key={f.key} fliter={f} change={change} value={values[f.key]} />
            case "Date":
              return <DateFilter key={f.key} fliter={f} change={change} value={values[f.key]} />
            case "Sites":
              return <SitesFilter key={f.key} fliter={f} change={change} value={values[f.key]} />
          }
        })
      }
    </Flex>
  );
};


export type SelectFilter = {
  flexOrder?: number
  key: string
  type: "Select"
  title?: string

  optionValues: (string | number)[]
  optionTexts: string[]
  defaultValueIndex?: number
}

const SelectFilter = (props: { fliter: SelectFilter, change: (e: any) => void, value: any }) => {

  return (
    <Flex order={props.fliter.flexOrder} gap={1} alignItems="center">
      <Text fontSize={"lg"} textTransform="capitalize">{props.fliter.title || props.fliter.key}</Text>

      <Select name={props.fliter.key} onChange={props.change} w="fit-content" value={props.value}>
        {
          A.mapWithIndex(props.fliter.optionTexts, (i, v) => <option key={v} value={props.fliter.optionValues[i]}>{v}</option>)
        }
      </Select>
    </Flex>
  )
}

type IncrementFilter = {
  flexOrder?: number
  key: string
  type: "Increment"
  title?: string

  defaultValue: number
  min?: number
  max?: number
}

const IncrementFilter = (props: { fliter: IncrementFilter, change: (e: any) => void, value: number }) => {
  const { colorMode } = useColorMode()

  const makeChange = (e: ChangeEvent<any>) => {
    const newValue = Number(e.currentTarget.value)

    if (props.fliter.min != undefined && N.lt(newValue, props.fliter.min)) return;
    if (props.fliter.max != undefined && N.gt(newValue, props.fliter.max)) return;

    props.change(e)
  }

  return (
    <Flex gap={1} alignItems={"center"} order={props.fliter.flexOrder}>
      <Text fontSize={"lg"} textTransform={"capitalize"}>{props.fliter.title || props.fliter.key}</Text>

      <Flex alignItems={"center"} borderColor={colorMode == "light" ? "black" : "white"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"}>
        <Button name={props.fliter.key} value={props.value - 1} onClick={makeChange} border={0} bg={"transparent"}>{"<"}</Button>
        <Text fontSize={"lg"} mx={2}>{props.value}</Text>
        <Button name={props.fliter.key} value={props.value + 1} onClick={makeChange} border={0} bg={"transparent"}>{">"}</Button>
      </Flex>
    </Flex>
  )
}

type InputFilter = {
  flexOrder?: number
  key: string
  type: "Input"
  title?: string

  inputType?: HTMLInputTypeAttribute
  defaultValue?: string | number
  placeholder?: string
}

const InputFilter = (props: { fliter: InputFilter, change: (e: any) => void, value: number }) => {
  const { colorMode } = useColorMode()

  return (
    <Flex alignItems={"center"} gap={1} order={props.fliter.flexOrder}>
      <Text fontSize={"lg"}>{props.fliter.title || props.fliter.key}</Text>
      <Input type={props.fliter.inputType} name={props.fliter.key} placeholder={props.fliter.placeholder} value={props.value} onChange={props.change} borderColor={colorMode == "light" ? "black" : "white"}/>
    </Flex>
  )
}

type ButtonGroupFilter = {
  flexOrder?: number
  key: string
  type: "ButtonGroup"
  title?: string

  buttonValues: (string | number)[]
  buttonTexts: string[]
  defaultValueIndex?: number
}

const ButtonGroupFilter = (props: { fliter: ButtonGroupFilter, change: (e: any) => void, value: number }) => {

  return (
    <Flex alignItems={"center"} gap={1} order={props.fliter.flexOrder}>
      <Text fontSize={"lg"}>{props.fliter.title || props.fliter.key}</Text>

      <ButtonGroup isAttached>
        {
          A.mapWithIndex(props.fliter.buttonTexts, (i, v) => <Button key={v} name={props.fliter.key} value={props.fliter.buttonValues[i]} onClick={props.change} colorScheme={props.fliter.buttonValues[i] == props.value ? "green" : ""} variant={props.fliter.buttonValues[i] == props.value ? "solid" : "outline"}>{v}</Button>)
        }
      </ButtonGroup>
    </Flex>
  )
}

type DateFilter = {
  flexOrder?: number
  key: string
  type: "Date"
  title?: string

  defaultValue?: string
}

const DateFilter = (props: { fliter: DateFilter, change: (e: any) => void, value: string }) => {
  const { colorMode } = useColorMode()


  return (
    <Flex alignItems={"center"} gap={1} order={props.fliter.flexOrder}>
      <Text fontSize={"lg"}>{props.fliter.title || props.fliter.key}</Text>

      <Input type="date" name={props.fliter.key} value={props.value} onChange={props.change} borderColor={colorMode == "light" ? "black" : "white"}/>
    </Flex>
  )
}

type SitesFilter = {
  flexOrder?: number
  key: string
  type: "Sites"
  title?: string
}



const SitesFilter = (props: { fliter: SitesFilter, change: (e: any) => void, value: string }) => {
  const { get } = useApi("/api/")
  const { data, isSuccess } = useQuery(["sites"], () => get<sitesResponse>("sites"))
  const { colorMode } = useColorMode()


  return (
    <Flex alignItems={"center"} gap={1} order={props.fliter.flexOrder}>
      <Text fontSize={"lg"} textTransform="capitalize">{props.fliter.title || props.fliter.key}</Text>

      <Select name={props.fliter.key} onChange={props.change} w="fit-content" value={props.value} borderColor={colorMode == "light" ? "black" : "white"}>
        <option key={"all"} value={"all"}>all</option>
        {
          isSuccess && pipe(
            data,
            D.deleteKey("other"),
            D.keys,
            A.map(v => {
              const sites = data[v]
              const sitesids = sites.map(s => s.siteid.toString())

              return [
                <option key={v} value={[sites[0].backendid.toString(), ...sitesids]}>All - {v}</option>,
                ...A.mapWithIndex(sites, (i, site) => <option key={site.website} value={[site.backendid.toString(), sitesids[i]]}>
                  {site.website.replace("https://www.", "")}
                </option>)
              ]
            })
          )
        }
        <option key={"other"} disabled>other</option>
        {
          isSuccess && A.map(
            data.other, 
            s => <option key={s.website} value={[s.backendid.toString(), s.siteid.toString()]}>{s.website.replace("https://www.", "")}</option>
          )
        }
      </Select>
    </Flex>
  )
}