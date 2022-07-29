import { Flex, Select, Text } from '@chakra-ui/react';
import { A } from '@mobily/ts-belt';

export type Filters = IncrementFilter | SelectFilter

export const Filter = ({ filters, change }: { filters: Filters[], change: (e: any) => void }) => {
  return (
    <Flex borderColor={"black"} borderStyle={"solid"} borderWidth={2} borderRadius={"md"} p={2} gap={2} justifyContent="center">
      {
        A.map(filters, f => {
          switch (f.type) {
            case "Select":
              return <SelectFilter key={f.key} fliter={f} change={change} />
          }

          return <></>
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

const SelectFilter = (props: { fliter: SelectFilter, change: (e: any) => void }) => {

  return (
    <Flex order={props.fliter.flexOrder} gap={1} alignItems="center">
      <Text fontSize={"lg"} textTransform="capitalize">{props.fliter.title || props.fliter.key}</Text>
      <Select onChange={props.change} name={props.fliter.key} w="fit-content" defaultValue={props.fliter.optionValues[props.fliter.defaultValueIndex || 0]}>
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
  type: "increment"

  title?: string
  defaultValue: number
  min?:number
  max?:number
}