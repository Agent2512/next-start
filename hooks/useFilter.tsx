import { FlexboxProps } from '@chakra-ui/react';
import { A, D, pipe } from '@mobily/ts-belt';
import { ChangeEvent, useState } from 'react';
import { Filter, Filters } from '../components/Filter';

export type UseFilterSettings = {
  filters: Filters[],
  justifyContent?: FlexboxProps["justifyContent"]
}

export const useFilter = (settings: UseFilterSettings) => {
  const initialState = pipe(
    settings.filters,
    A.keepMap(f => {
      switch (f.type) {
        case "Select":
          return { [f.key]: f.optionValues[f.defaultValueIndex || 0] };
        case "Increment":
          return { [f.key]: f.defaultValue };
        case "Input":
          return { [f.key]: f.defaultValue || "" };
        case "ButtonGroup":
          return { [f.key]: f.buttonValues[f.defaultValueIndex || 0] };
        case "Date":
          return { [f.key]: f.defaultValue };
        case "Sites":
          return { [f.key]: "all" };
      }
    }),
    A.reduce({}, (acc, f) => {
      return D.merge(acc, f);
    })
  );

  type Tkeys = typeof settings.filters[number]["key"];
  type TValues = { [key in Tkeys]: any };
  const [values, setValue] = useState<TValues>(initialState);


  const changeValue = (e: ChangeEvent<any>) => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;

    setValue(pre => {
      return {
        ...pre,
        [name]: Number(value) || value
      };
    });
  };

  return {
    Filter: <Filter filters={settings.filters}  change={changeValue} justifyContent={settings.justifyContent} values={values} />,
    value: values
  };
};
