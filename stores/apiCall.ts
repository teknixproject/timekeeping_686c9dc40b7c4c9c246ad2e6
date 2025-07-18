import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

export type TApiData = {
  id: string;
  idParent: string;
  data: any;
};
export type TApiCallData = {
  apiData: TApiData[];
};
export type TApiStoreActions = {
  addApiData: (data: TApiData) => void;
  updateApiData: (id: string, data: any) => void;
  removeApiData: (id: string) => void;
  findApiData: (key: 'id' | 'idParent', value: string) => TApiData;
};
export const initApiCallStore = () => ({
  apiData: [],
});
const defaultApiData = {
  apiData: [],
};
export type TApiCallStore = TApiCallData & TApiStoreActions;
export const createApiCallStore = (initState: TApiCallData = defaultApiData) => {
  return createStore<TApiCallStore>()(
    devtools(
      (set, get) => ({
        ...initState,
        addApiData: (data: TApiData) => set((state) => ({ apiData: [...state.apiData, data] })),
        updateApiData(id, data) {
          set((state) => ({
            apiData: state.apiData.map((item) => (item.id === id ? { ...item, data } : item)),
          }));
        },
        removeApiData: (id: string) =>
          set((state) => ({ apiData: state.apiData.filter((item) => item.id !== id) })),

        findApiData(key, value) {
          return get().apiData.find((item) => item[key] === value);
        },
      }),
      { name: 'ApiCallStore' }
    )
  );
};
