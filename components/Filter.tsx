import { Button, ButtonGroup, Flex, Input, Select, Text } from '@chakra-ui/react';
import { A, N } from '@mobily/ts-belt';
import { ChangeEvent, HTMLInputTypeAttribute } from 'react';

export type Filters = SelectFilter | IncrementFilter | InputFilter | ButtonGroupFilter

export const Filter = ({ filters, change, values }: { filters: Filters[], change: (e: any) => void, values: any }) => {
  return (
    <Flex borderColor={"black"} borderStyle={"solid"} borderWidth={2} borderRadius={"md"} p={2} gap={2} justifyContent="center">
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

  const makeChange = (e: ChangeEvent<any>) => {
    const newValue = Number(e.currentTarget.value)

    if (props.fliter.min != undefined && N.lt(newValue, props.fliter.min)) return;
    if (props.fliter.max != undefined && N.gt(newValue, props.fliter.max)) return;

    props.change(e)
  }

  return (
    <Flex gap={1} alignItems={"center"} order={props.fliter.flexOrder}>
      <Text fontSize={"lg"} textTransform={"capitalize"}>{props.fliter.title || props.fliter.key}</Text>

      <Flex alignItems={"center"} borderColor={"inherit"} borderStyle={"solid"} borderWidth={1} borderRadius={"md"}>
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

  return (
    <Flex alignItems={"center"} gap={1} order={props.fliter.flexOrder}>
      <Text fontSize={"lg"}>{props.fliter.title || props.fliter.key}</Text>
      <Input type={props.fliter.inputType} name={props.fliter.key} placeholder={props.fliter.placeholder} value={props.value} onChange={props.change} />
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
          A.mapWithIndex(props.fliter.buttonTexts, (i, v) => <Button key={v} name={props.fliter.key} value={props.fliter.buttonValues[i]} onClick={props.change} colorScheme={props.fliter.buttonValues[i] == props.value ? "green" : ""}  variant={props.fliter.buttonValues[i] == props.value ? "solid" : "outline"}>{v}</Button>)
        }
      </ButtonGroup>
    </Flex>
  )
}