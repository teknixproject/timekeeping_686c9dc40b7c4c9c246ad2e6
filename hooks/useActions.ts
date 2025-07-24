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
  TConditionChildMap,
  TTriggerActions,
  TTriggerValue,
} from '@/types';
import { GridItem } from '@/types/gridItem';
import { transformVariable } from '@/uitls/tranformVariable';

import { actionHookSliceStore } from './store/actionSliceStore';
import { useApiCallAction } from './useApiCallAction';
import { useConditionChildAction } from './useConditionChildAction';
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
  executeActionFCType: (action?: TAction) => Promise<void>;
};

export type TActionsProps = {
  data?: GridItem;
  valueStream?: any;
};
export const useActions = (props: TActionsProps): TUseActions => {
  const { data, valueStream } = useMemo(() => {
    return props;
  }, [props]);
  console.log(`🚀 ~ const{data,valueStream}=useMemo ~ { data , valueStream} :${data?.id}`, {
    data,
    valueStream,
  });
  const actions = useMemo(() => _.get(data, 'actions') as TTriggerActions, [data]);
  const setMultipleActions = actionHookSliceStore((state) => state.setMultipleActions);
  const findAction = actionHookSliceStore((state) => state.findAction);
  const { handleApiCallAction } = useApiCallAction();
  // const { executeConditional } = useConditionAction();
  const { executeConditionalChild } = useConditionChildAction();
  const { handleUpdateStateAction } = useUpdateStateAction();
  const { handleNavigateAction } = useNavigateAction({ data, valueStream });
  const { executeLoopOverList } = useLoopActions();
  const { handleCustomFunction } = useCustomFunction();
  const [isLoading, setIsLoading] = useState(false);

  const executeConditional = (action: TAction<TConditional>) => {
    const conditions = action?.data?.conditions as string[];
    if (_.isEmpty(conditions)) return;
    for (const conditionId of conditions) {
      const condition = findAction(conditionId) as TAction<TConditionChildMap>;
      console.log('🚀 ~ executeConditional ~ condition:', condition);

      if (condition) {
        executeActionFCType(condition);
      }
    }
  };
  const executeActionFCType = async (action?: TAction): Promise<void> => {
    if (!action?.fcType) return;

    switch (action.fcType) {
      case 'action':
        await executeAction(action as TAction<TActionApiCall>);
        break;
      case 'conditional':
        executeConditional(action as TAction<TConditional>);
        break;
      case 'conditionalChild':
        const isMatch = await executeConditionalChild(action as TAction<TConditionChildMap>);
        console.log('🚀 ~ executeActionFCType ~ isMatch:', { action, isMatch });
        const conditionChildData = action?.data as TConditionChildMap;
        const isReturnValue = (action?.data as TConditionChildMap)?.isReturnValue;
        if (isReturnValue && isMatch) {
          return transformVariable(conditionChildData.valueReturn!);
        }
        if (!isMatch) return;
        break;
      case 'loop':
        await executeLoopOverList(action as TAction<TActionLoop>);
        break;

      default:
        console.error(`Unknown fcType: ${action.fcType}`);
    }
    if (action.next) {
      await executeActionFCType(findAction(action.next));
    }
  };

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
          return await handleApiCallAction(action as TAction<TActionApiCall>);
        case 'updateStateManagement':
          return await handleUpdateStateAction(action as TAction<TActionUpdateState>);
        case 'customFunction':
          return await handleCustomFunction(action as TAction<TActionCustomFunction>);
        default:
          console.error(`Unknown action type: ${action.type}`);
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
    const actionsToExecute = triggerActions[triggerType];
    console.log('🚀 ~ useActions ~ actionsToExecute:', actionsToExecute);

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

  return { handleAction, isLoading, executeActionFCType };
};
