/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  TAction,
  TActionApiCall,
  TActionNavigate,
  TActionUpdateState,
  TConditional,
  TTriggerActions,
  TTriggerValue,
} from '@/types';

import { actionHookSliceStore } from './actionSliceStore';
import { useApiCallAction } from './useApiCallAction';
import { useConditionAction } from './useConditionAction';
import { useHandleData } from './useHandleData';
import { useNavigateAction } from './useNavigateAction';
import { useUpdateStateAction } from './useUpdateStateAction';

// Types
interface ActionProp {
  name: string;
  type: any;
  data: any;
}

interface UseHandlePropsResult {
  multiples: Record<string, React.MouseEventHandler<HTMLButtonElement>>;
}

interface UseHandlePropsProps {
  actionsProp: ActionProp[];
  valueStream?: any;
}

// Constants
const ACTION_TYPES = {
  NAVIGATE: 'navigate',
  API_CALL: 'apiCall',
  UPDATE_STATE: 'updateStateManagement',
} as const;

const FC_TYPES = {
  ACTION: 'action',
  CONDITIONAL: 'conditional',
} as const;

const DEFAULT_TRIGGER: TTriggerValue = 'onClick';

export const useHandleProps = ({
  actionsProp,
  valueStream,
}: UseHandlePropsProps): UseHandlePropsResult => {
  // Refs
  const triggerNameRef = useRef<TTriggerValue>(DEFAULT_TRIGGER);

  // Store and utilities
  const { getData } = useHandleData({});
  const { setMultipleActions } = actionHookSliceStore();

  // Memoized actions mapping
  const actionsMap = useMemo(() => {
    const map: Record<string, TTriggerActions> = {};

    actionsProp?.forEach((item) => {
      if (!_.isEmpty(item.data)) {
        map[item.name] = item.data;
      }
    });

    return map;
  }, [actionsProp]);

  // Action handlers
  const { handleApiCallAction } = useApiCallAction({
    executeActionFCType: executeActionFCType,
  });

  const { executeConditional } = useConditionAction({
    executeActionFCType: executeActionFCType,
  });

  const { handleUpdateStateAction } = useUpdateStateAction({
    executeActionFCType: executeActionFCType,
  });

  const { handleNavigateAction } = useNavigateAction({
    executeActionFCType: executeActionFCType,
  });

  // Action execution functions
  async function executeActionFCType(action?: TAction): Promise<void> {
    if (!action?.fcType) return;

    try {
      switch (action.fcType) {
        case FC_TYPES.ACTION:
          await executeAction(action as TAction<TActionApiCall>);
          break;
        case FC_TYPES.CONDITIONAL:
          await executeConditional(action as TAction<TConditional>);
          break;
        default:
          console.warn(`Unknown fcType: ${action.fcType}`);
      }
    } catch (error) {
      console.error(`Error executing action with fcType ${action.fcType}:`, error);
    }
  }

  const executeAction = useCallback(
    async (action: TAction): Promise<void> => {
      if (!action) return;

      try {
        switch (action.type) {
          case ACTION_TYPES.NAVIGATE:
            return handleNavigateAction(action as TAction<TActionNavigate>);
          case ACTION_TYPES.API_CALL:
            return handleApiCallAction(action as TAction<TActionApiCall>);
          case ACTION_TYPES.UPDATE_STATE:
            return handleUpdateStateAction(action as TAction<TActionUpdateState>);
          default:
            console.warn(`Unknown action type: ${action.type}`);
        }
      } catch (error) {
        console.error(`Error executing action ${action.id}:`, error);
      }
    },
    [handleApiCallAction, handleNavigateAction, handleUpdateStateAction]
  );

  // Trigger execution
  const executeTriggerActions = useCallback(
    async (actions: TTriggerActions, triggerType: TTriggerValue): Promise<void> => {
      const actionsToExecute = actions[triggerType];
      setMultipleActions({ actions, triggerName: triggerType });

      if (!actionsToExecute) return;

      const rootAction = Object.values(actionsToExecute).find((action) => !action.parentId);
      if (rootAction) {
        await executeActionFCType(rootAction);
      }
    },
    [setMultipleActions]
  );

  // Action handler factory
  const createActionHandler = useCallback(
    (actionName: string) =>
      async (triggerType: TTriggerValue = DEFAULT_TRIGGER): Promise<void> => {
        const actionMap = actionsMap[actionName];
        if (!actionMap) {
          console.warn(`No actions found for: ${actionName}`);
          return;
        }

        triggerNameRef.current = triggerType;
        await executeTriggerActions(actionMap, triggerType);
      },
    [actionsMap, executeTriggerActions]
  );

  const multiples = useMemo(() => {
    const validActions = _.filter(actionsProp, (item) => !_.isEmpty(item.data));

    return _.reduce(
      validActions,
      (result, item) => {
        const value =
          item?.type && item.type.includes('MouseEventHandler')
            ? async (e: any) => {
                e?.preventDefault?.();
                await createActionHandler(item.name)();
              }
            : getData(item.data, valueStream);

        return _.set(result, item.name, value);
      },
      {} as Record<string, any>
    );
  }, [createActionHandler, actionsProp, getData, valueStream]);

  // Update store when actions change
  useEffect(() => {
    setMultipleActions({
      actions: actionsMap[triggerNameRef.current] || {},
      triggerName: triggerNameRef.current,
    });
  }, [actionsMap, setMultipleActions]);

  return { multiples };
};
