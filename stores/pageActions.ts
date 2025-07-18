import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { TPageActionReturn } from '@/types/pageActions';

type TState = {
  pageActions: TPageActionReturn[] | null;
};

const initValues: TState = {
  pageActions: null,
};
type TActions = {
  setActions: (data: TPageActionReturn[]) => void;
  reset: () => void;
};

export const pageActionsStore = create<TState & TActions>()(
  devtools(
    (set) => ({
      ...initValues,
      setActions: (data) => set(() => ({ pageActions: data })),

      reset() {
        set(() => ({
          ...initValues,
        }));
      },
    }),
    { name: 'PageActionsStore' }
  )
);
