import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { TCustomFunction } from '@/types';

type State = {
  customFunctions: {
    [key: string]: TCustomFunction;
  };
};
type TActions = {
  setCustomFunctions: (data: TCustomFunction[]) => void;
  findCustomFunction: (id: string) => TCustomFunction;
  reset: () => void;
};

const initValues: State = {
  customFunctions: {},
};
export const customFunctionStore = create<State & TActions>()(
  devtools(
    (set, get) => ({
      ...initValues,
      setCustomFunctions(data) {
        return set({
          customFunctions: data?.reduce((obj, item) => {
            return {
              ...obj,
              [item._id]: item,
            };
          }, {}),
        });
      },
      findCustomFunction(id) {
        return get()?.customFunctions?.[id];
      },
      reset() {
        return set(initValues);
      },
    }),
    {
      name: 'customFunction',
    }
  )
);
