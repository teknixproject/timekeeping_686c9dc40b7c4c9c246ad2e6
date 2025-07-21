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
      formData: null,

      setActions: (actions) => {
        console.log('[setActions]', actions);
        set({ actions }, false, 'actionHook/setActions');
      },

      setTriggerName: (triggerName) => {
        console.log('[setTriggerName]', triggerName);
        set({ triggerName }, false, 'actionHook/setTriggerName');
      },

      setFormData: (formData) => {
        console.log('[setFormData]', formData);
        set({ formData }, false, 'actionHook/setFormData');
      },

      async setMultipleActions(data) {
        console.log('[setMultipleActions]', data);
        set(
          (state) => ({
            ...state,
            actions: data.actions ?? state.actions,
            triggerName: data.triggerName ?? state.triggerName,
            formData: data.formData ?? state.formData,
          }),
          false,
          'actionHook/setMultipleActions'
        );
      },

      findAction: (actionId) => {
        const trigger = get().triggerName;
        const action = get().actions[trigger]?.[actionId];
        console.log('[findAction]', { trigger, actionId, action });
        return action || undefined;
      },

      getFormData: () => {
        const data = get().formData;
        console.log('[getFormData]', data);
        return data;
      },

      reset: () => {
        console.log('[reset]');
        set(
          {
            actions: {},
            triggerName: 'onClick',
            formData: null,
          },
          false,
          'actionHook/reset'
        );
      },
    }),
    {
      name: 'actionHookSliceStore', // Hiện tên trong Redux DevTools
    }
  )
);
