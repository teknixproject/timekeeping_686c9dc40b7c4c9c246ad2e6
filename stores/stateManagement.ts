import { create } from 'zustand';
import { devtools } from 'zustand/middleware'; // Import devtools middleware

import {
  TDocumentState,
  TDocumentStateFind,
  TDocumentStateSet,
  TDocumentStateUpdate,
  TVariable,
} from '@/types';
import { transformVariable } from '@/uitls/tranformVariable';

export type TDocumentStateActions = {
  setStateManagement: (variable: TDocumentStateSet) => void;
  findVariable: (data: TDocumentStateFind) => TVariable | undefined;
  updateVariables: (data: TDocumentStateUpdate) => void;
  resetState: () => void;
};

const initValue: TDocumentState = {
  parameters: {},
  componentState: {},
  appState: {},
  globalState: {},
  apiResponse: {},
  dynamicGenerate: {},
};

// Sử dụng devtools middleware
export const stateManagementStore = create<TDocumentState & TDocumentStateActions>()(
  devtools(
    (set, get) => ({
      ...initValue,

      setStateManagement: ({ type, dataUpdate }) => {
        set(() => ({
          [type]: dataUpdate,
        }));
      },
      findVariable: ({ type, id, name }) => {
        const data = get()[type] || {};
        if (id)
          return {
            ...data[id],
            value: transformVariable(data[id]),
          };
        if (name) {
          return Object.values(data).find((item: TVariable) => item.key === name);
        }
      },
      updateVariables: ({ type, dataUpdate }) => {
        set((state) => {
          // Reuse findVariable to check if the item exists

          return {
            [type]: {
              ...state[type],
              [dataUpdate.id]: dataUpdate,
            },
          };
        });
        return get()[type];
      },

      resetState() {
        set(initValue);
      },
    }),
    {
      name: 'stateManagementStore', // Tên của store trong Redux DevTools
    }
  )
);
