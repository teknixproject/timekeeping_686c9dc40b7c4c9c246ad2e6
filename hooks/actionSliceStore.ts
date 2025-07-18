import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { TAction, TTriggerActions, TTriggerValue } from '@/types';

type TState = {
  actions: TTriggerActions;
  triggerName: TTriggerValue;
  formData: any;
};
type TActions = {
  setActions: (actions: TTriggerActions) => void;
  setTriggerName: (triggerName: TTriggerValue) => void;
  setMultipleActions: (data: Partial<TState>) => Promise<void>;
  getFormData: () => any;
  findAction: (actionId: string) => TAction | undefined;
  setFormData: (formData: any) => void;
  reset: () => void;
};
export const actionHookSliceStore = create<TState & TActions>()(
  devtools(
    (set, get) => ({
      actions: {},
      triggerName: 'onClick',
      setActions: (actions: TTriggerActions) => set(() => ({ actions })),
      setTriggerName: (triggerName: TTriggerValue) => set(() => ({ triggerName })),
      findAction: (actionId: string) => {
        return get().actions[get().triggerName]?.[actionId] || undefined;
      },
      getFormData: () => get().formData,
      setFormData: (formData: any) => set(() => ({ formData })),
      async setMultipleActions(data) {
        set(() => ({
          actions: data.actions,
          triggerName: data.triggerName,
          formData: data.formData,
        }));
      },
      reset: () => set(() => ({ actions: {}, triggerName: 'onClick' })),
    }),
    { name: 'actionHookSliceStore' }
  )
);
