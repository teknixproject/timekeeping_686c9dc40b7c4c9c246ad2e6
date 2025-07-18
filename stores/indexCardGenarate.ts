import { create } from 'zustand';

export type TIndexCard = {
  index: number | null;
  id: string | null;
};
type TStore = {
  indexCard: TIndexCard;
};
const initValue: TStore = {
  indexCard: {
    index: null,
    id: null,
  },
};
type TActions = {
  setIndexCard: (indexCard: TIndexCard) => void;
  reset: () => void;
};
export const indexCardGenarateStore = create<TStore & TActions>((set) => ({
  ...initValue,
  setIndexCard: (indexCard: TIndexCard) => set(() => ({ indexCard })),
  reset() {
    set({ indexCard: { index: null, id: null } });
  },
}));
