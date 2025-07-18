/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  TAction,
  TActionApiCall,
  TActionCustomFunction,
  TActionLoop,
  TActionNavigate,
  TActionUpdateState,
  TConditional,
  TTriggerActions,
  TTriggerValue,
} from '@/types';
import { GridItem } from '@/types/gridItem';

import { actionHookSliceStore } from './actionSliceStore';
import { useApiCallAction } from './useApiCallAction';
import { useConditionAction } from './useConditionAction';
import { useCustomFunction } from './useCustomFunction';
import { useLoopActions } from './useLoopActions';
import { useNavigateAction } from './useNavigateAction';
import { useUpdateStateAction } from './useUpdateStateAction';

export type TUseActions = {
  handleAction: (
    triggerType: TTriggerValue,
    action?: TTriggerActions,
    formData?: Record<string, any>
  ) => Promise<void>;
  isLoading: boolean;
};

export const useActions = (data?: GridItem): TUseActions => {
  const actions = useMemo(() => _.get(data, 'actions') as TTriggerActions, [data]);
  const setMultipleActions = actionHookSliceStore((state) => state.setMultipleActions);
  const [isLoading, setIsLoading] = useState(false);

  const executeActionFCType = async (action?: TAction): Promise<void> => {
    if (!action?.fcType) return;

    switch (action.fcType) {
      case 'action':
        await executeAction(action as TAction<TActionApiCall>);
        break;
      case 'conditional':
        await executeConditional(action as TAction<TConditional>);
        break;
      case 'loop':
        await executeLoopOverList(action as TAction<TActionLoop>);
        break;

      default:
        console.warn(`Unknown fcType: ${action.fcType}`);
    }
  };

  const { handleApiCallAction } = useApiCallAction({ executeActionFCType });
  const { executeConditional } = useConditionAction({ executeActionFCType });
  const { handleUpdateStateAction } = useUpdateStateAction({
    executeActionFCType,
  });
  const { handleNavigateAction } = useNavigateAction({ executeActionFCType });
  const { executeLoopOverList } = useLoopActions({ executeActionFCType });
  const { handleCustomFunction } = useCustomFunction({ executeActionFCType });

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const executeAction = async (action: TAction): Promise<void> => {
    if (!action) return;

    try {
      switch (action.type) {
        case 'navigate':
          return handleNavigateAction(action as TAction<TActionNavigate>);
        case 'apiCall':
          return handleApiCallAction(action as TAction<TActionApiCall>);
        case 'updateStateManagement':
          return handleUpdateStateAction(action as TAction<TActionUpdateState>);
        case 'customFunction':
          return handleCustomFunction(action as TAction<TActionCustomFunction>);
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Error executing action ${action.id}:`, error);
    }
  };

  const executeTriggerActions = async (
    triggerActions: TTriggerActions,
    triggerType: TTriggerValue,
    formData?: Record<string, any>
  ): Promise<void> => {
    console.log('🚀 ~ useActions ~ formData:', formData);
    const actionsToExecute = triggerActions[triggerType];

    await setMultipleActions({
      actions: triggerActions,
      triggerName: triggerType,
      formData,
    });
    if (!actionsToExecute) return;

    // Find and execute the root action (parentId === null)
    const rootAction = Object.values(actionsToExecute).find((action) => !action.parentId);
    if (rootAction) {
      if (rootAction.delay) {
        await new Promise((resolve) => setTimeout(resolve, rootAction.delay));
      }
      await executeActionFCType(rootAction);
    }
  };

  const handleAction = useCallback(
    async (
      triggerType: TTriggerValue,
      action?: TTriggerActions,
      formData?: Record<string, any>
    ): Promise<void> => {
      setIsLoading(true);
      try {
        await executeTriggerActions(action || data?.actions || {}, triggerType, formData);
      } finally {
        setIsLoading(false);
      }
    },
    [data?.actions, executeTriggerActions]
  );

  useEffect(() => {
    if (mounted.current && !_.isEmpty(actions) && 'onPageLoad' in actions) {
      handleAction('onPageLoad');
    }
  }, [mounted.current]);

  return { handleAction, isLoading };
};
