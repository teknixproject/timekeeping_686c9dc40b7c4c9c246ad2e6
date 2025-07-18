import _ from 'lodash';
import { useEffect, useRef } from 'react';

import { stateManagementStore } from '@/stores';
import { TAction, TActionUpdateState, TTypeSelectState } from '@/types';

import { actionHookSliceStore } from './actionSliceStore';
import { useHandleData } from './useHandleData';

export type TUseActions = {
  handleUpdateStateAction: (action: TAction<TActionUpdateState>) => Promise<void>;
};

type TProps = {
  executeActionFCType: (action?: TAction) => Promise<void>;
};
export const useUpdateStateAction = ({ executeActionFCType }: TProps): TUseActions => {
  // State management

  // Store hooks
  const { getData } = useHandleData({});
  const { findVariable, updateVariables } = stateManagementStore();
  const { findAction } = actionHookSliceStore();
  // Memoized actions from data

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  //#region Action Handlers

  const handleUpdateStateAction = async (action: TAction<TActionUpdateState>): Promise<void> => {
    const updates = action?.data?.update;
    console.log('🚀 ~ handleUpdateStateAction ~ updates:', updates);

    if (_.isEmpty(updates)) return;

    for (const item of updates || []) {
      const { firstState, secondState } = item;
      const { type } = item.firstState;
      if (!firstState || !secondState || !firstState[type]) continue;
      const variableFirst = findVariable({
        type: type as TTypeSelectState,
        id: (item.firstState[type] as any).variableId || '',
      });
      console.log('🚀 ~ handleUpdateStateAction ~ item:', item);

      const variableSecond = getData(item.secondState);
      console.log('🚀 ~ handleUpdateStateAction ~ variableSecond:', variableSecond);

      if (!variableFirst) return;

      variableFirst.value = variableSecond;

      updateVariables({
        type: type as TTypeSelectState,
        dataUpdate: variableFirst,
      });
    }

    if (action?.next) {
      await executeActionFCType(findAction(action.next));
    }
  };

  return { handleUpdateStateAction };
};
