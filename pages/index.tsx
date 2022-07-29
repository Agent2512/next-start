import { Flex } from '@chakra-ui/react'
import { A, D, pipe } from '@mobily/ts-belt'
import type { NextPage } from 'next'
import { type } from 'os'
import { ChangeEvent, useState } from 'react'
import { Filter, Filters, SelectFilter } from '../components/Filter'
import Layout from '../components/layout'

const Home: NextPage = () => {
  const { Filter, value } = useFilter({
    filters: [
      {
        key: "num",
        type: "Select",
        optionValues: [1, 2, 3, 4],
        optionTexts: ["1", "2", "3", "4"]
      },
      {
        key: "names",
        type: "Select",
        optionValues: ["niklas", "mads", "tino", "kim"],
        optionTexts: ["niklas", "mads", "tino", "kim"],
      }
    ]
  })

  return (
    <Layout>
      <Flex flexDir={"column"} p={2}>
        <Filter />

        {JSON.stringify(value, null, 2)}
      </Flex>
    </Layout>
  )
}

export default Home

type UseFilterSettings = {
  filters: Filters[]
}

const useFilter = (settings: UseFilterSettings) => {
  const initialState = pipe(
    settings.filters,
    A.keepMap(f => {
      switch (f.type) {
        case "Select":
          return { [f.key]: f.optionValues[f.defaultValueIndex || 0] }
      }
    }),
    A.reduce({}, (acc, f) => {
      return D.merge(acc, f)
    }),

  )
  const [value, setValue] = useState(initialState)


  const changeValue = (e: ChangeEvent<any>) => {
    const name = e.currentTarget.name
    const value = e.currentTarget.value || e.currentTarget.checked

    setValue(pre => {
      return {
        ...pre,
        [name]: value
      }
    })
  }

  return {
    Filter: () => <Filter filters={settings.filters} change={changeValue} />,
    value
  }
}


