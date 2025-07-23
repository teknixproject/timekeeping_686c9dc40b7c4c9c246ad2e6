import _ from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import {
    TAction, TActionApiCall, TActionNavigate, TActionUpdateState, TTriggerActions, TTriggerValue
} from '@/types';
import { GridItem } from '@/types/gridItem';

import { actionHookSliceStore } from './actionSliceStore';
import { useActions } from './useActions';
import { useApiCallAction } from './useApiCallAction';
import { useNavigateAction } from './useNavigateAction';
import { useUpdateStateAction } from './useUpdateStateAction';

interface TDataProps {
  name: string;
  type: 'data' | 'MouseEventHandler';
  data: TTriggerActions;
}

interface UseHandlePropsResult {
  actions: Record<string, React.MouseEventHandler<HTMLButtonElement>>;
  executeAction: (action: TAction) => Promise<void>;
  executeTriggerActions: (actions: TTriggerActions, triggerType: TTriggerValue) => Promise<void>;
  createActionHandler: (actionName: string) => (triggerType?: TTriggerValue) => Promise<void>;
}

interface UseHandlePropsProps {
  dataProps: TDataProps[];
  valueStream?: any;
  formData?: any;
  data?: GridItem;
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

const createActionsMap = (dataProps: TDataProps[]): Record<string, TTriggerActions> => {
  const map: Record<string, TTriggerActions> = {};

  dataProps?.forEach((item) => {
    if (!_.isEmpty(item.data)) {
      map[item.name] = item.data;
    }
  });

  return map;
};

export const findRootAction = (actionsToExecute: Record<string, TAction>): TAction | undefined => {
  return Object.values(actionsToExecute).find((action) => !action.parentId);
};

const validateActionMap = (actionMap: TTriggerActions | undefined, actionName: string): boolean => {
  if (!actionMap) {
    console.warn(`No actions found for: ${actionName}`);
    return false;
  }
  return true;
};

const createActionExecutor = (actionHandlers: {
  handleNavigateAction: (action: TAction<TActionNavigate>) => Promise<void>;
  handleApiCallAction: (action: TAction<TActionApiCall>) => Promise<void>;
  handleUpdateStateAction: (action: TAction<TActionUpdateState>) => Promise<void>;
}) => {
  return async (action: TAction): Promise<void> => {
    if (!action) return;

    try {
      switch (action.type) {
        case ACTION_TYPES.NAVIGATE:
          return actionHandlers.handleNavigateAction(action as TAction<TActionNavigate>);
        case ACTION_TYPES.API_CALL:
          return actionHandlers.handleApiCallAction(action as TAction<TActionApiCall>);
        case ACTION_TYPES.UPDATE_STATE:
          return actionHandlers.handleUpdateStateAction(action as TAction<TActionUpdateState>);
        default:
          console.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Error executing action ${action.id}:`, error);
    }
  };
};

export const createTriggerActionsExecutor = (
  setMultipleActions: (payload: { actions: TTriggerActions; triggerName: TTriggerValue }) => void,
  executeActionFCType: (action?: TAction) => Promise<void>
) => {
  return async (actions: TTriggerActions, triggerType: TTriggerValue): Promise<void> => {
    const actionsToExecute = actions[triggerType];

    setMultipleActions({ actions, triggerName: triggerType });

    if (!actionsToExecute) return;

    const rootAction = findRootAction(actionsToExecute);
    if (rootAction) {
      await executeActionFCType(rootAction);
    }
  };
};

export const createActionHandlerFactory = (
  actionsMap: Record<string, TTriggerActions>,
  executeTriggerActions: (actions: TTriggerActions, triggerType: TTriggerValue) => Promise<void>
) => {
  return (actionName: string) =>
    async (triggerType: TTriggerValue = DEFAULT_TRIGGER): Promise<void> => {
      const actionMap = actionsMap[actionName];
      if (!validateActionMap(actionMap, actionName)) {
        return;
      }

      await executeTriggerActions(actionMap, triggerType);
    };
};

export const createMouseEventHandlers = (
  dataProps: TDataProps[],
  createActionHandler: (actionName: string) => (triggerType?: TTriggerValue) => Promise<void>
): Record<string, React.MouseEventHandler<HTMLButtonElement>> => {
  const validActions = dataProps?.filter((item) => !_.isEmpty(item.data?.onClick));
  const result: Record<string, React.MouseEventHandler<HTMLButtonElement>> = {};

  if (!_.isArray(validActions)) return {};

  for (const item of validActions) {
    result[item.name] = async (e) => {
      e?.preventDefault?.();
      const handler = createActionHandler(item.name);
      await handler();
    };
  }

  return result;
};

export const useHandleProps = ({ dataProps, data }: UseHandlePropsProps): UseHandlePropsResult => {
  const triggerNameRef = useRef<TTriggerValue>(DEFAULT_TRIGGER);
  const previousActionsMapRef = useRef<Record<string, TTriggerActions>>({});
  const setMultipleActions = actionHookSliceStore((state) => state.setMultipleActions);

  const actionsMap = useMemo(() => createActionsMap(dataProps), [dataProps]);

  const { handleApiCallAction } = useApiCallAction();
  const { executeActionFCType } = useActions(data);

  // const { executeConditional } = useConditionAction();

  const { handleUpdateStateAction } = useUpdateStateAction();

  const { handleNavigateAction } = useNavigateAction();

  const executeAction = useMemo(
    () =>
      createActionExecutor({
        handleNavigateAction,
        handleApiCallAction,
        handleUpdateStateAction,
      }),
    [handleApiCallAction, handleNavigateAction, handleUpdateStateAction]
  );

  // const executeActionFCType = useMemo(() => createFCTypeExecutor(executeAction), [executeAction]);

  const executeTriggerActions = useMemo(
    () => createTriggerActionsExecutor(setMultipleActions, executeActionFCType),
    [setMultipleActions, executeActionFCType]
  );

  const createActionHandler = useMemo(
    () => createActionHandlerFactory(actionsMap, executeTriggerActions),
    [actionsMap, executeTriggerActions]
  );

  const actions = useMemo(
    () => createMouseEventHandlers(dataProps, createActionHandler),
    [dataProps, createActionHandler]
  );

  useEffect(() => {
    const currentActionsMap = actionsMap[triggerNameRef.current];
    const previousActionsMap = previousActionsMapRef.current[triggerNameRef.current];

    if (currentActionsMap && !_.isEqual(currentActionsMap, previousActionsMap)) {
      setMultipleActions({
        actions: currentActionsMap,
        triggerName: triggerNameRef.current,
      });

      previousActionsMapRef.current[triggerNameRef.current] = currentActionsMap;
    }
  }, [actionsMap, setMultipleActions]);

  return {
    actions,
    executeAction,
    executeTriggerActions,
    createActionHandler,
  };
};

export { ACTION_TYPES, DEFAULT_TRIGGER, FC_TYPES };
