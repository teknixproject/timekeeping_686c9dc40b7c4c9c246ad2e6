import { stateManagementStore } from '@/stores';
import {
  TAction,
  TActionLoop,
  TActionLoopOverList,
  TConditionChildMap,
  TTypeSelectState,
} from '@/types';

import { actionHookSliceStore } from './actionSliceStore';
import { useConditionAction } from './useConditionAction';
import { useHandleData } from './useHandleData';

type TProps = {
  executeActionFCType: (action?: TAction) => Promise<void>;
};

// Hằng số cấu hình
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_STEP_SIZE = 1;
const LOOP_INTERVAL_MS = 10;
// Utility functions
const getRootCondition = (conditionAction: TAction<TConditionChildMap>) => {
  return Object.values(conditionAction?.data?.childs || {}).find((child) => !child.parentId);
};

const checkTimeout = (startTime: number, timeoutMs: number): boolean => {
  if (Date.now() - startTime > timeoutMs) {
    console.warn(`Loop timeout after ${timeoutMs}ms`);
    return true;
  }
  return false;
};

const processLoopItem = async (item: any, index: number) => {
  console.log(`Processing item at index ${index}:`, item);
  await new Promise((resolve) => setTimeout(resolve, 0));
};

// Loop handlers
const handleWhileLoop = async (
  conditionAction: TAction<TConditionChildMap>,
  compareCondition: (id: string, data: TConditionChildMap) => boolean, // Synchronous
  timeoutMs: number = DEFAULT_TIMEOUT_MS
) => {
  const rootCondition = getRootCondition(conditionAction);
  if (!rootCondition) return;

  const startTime = Date.now();

  while (true) {
    // Check timeout first
    if (checkTimeout(startTime, timeoutMs)) break;

    // Synchronous comparison
    const check = compareCondition(rootCondition.id, conditionAction.data as TConditionChildMap);

    if (!check) break;

    // Add small delay to prevent blocking
    await new Promise((resolve) => setTimeout(resolve, LOOP_INTERVAL_MS));
  }
};

const handleListLoop = async (
  list: any[],
  options: {
    reverseOrder?: boolean;
    startIndex?: number;
    endIndex?: number;
    stepSize?: number;
  },
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  itemProcessor: (item: any, index: number) => Promise<void> = processLoopItem
) => {
  const { reverseOrder, startIndex, endIndex, stepSize = DEFAULT_STEP_SIZE } = options;
  const startTime = Date.now();

  if (reverseOrder) {
    const effectiveStart = startIndex ?? list.length - 1;
    const effectiveEnd = endIndex ?? 0;

    for (let i = effectiveStart; i >= effectiveEnd; i -= stepSize) {
      if (checkTimeout(startTime, timeoutMs)) break;
      await itemProcessor(list[i], i);
    }
  } else {
    const effectiveStart = startIndex ?? 0;
    const effectiveEnd = endIndex ?? list.length;

    for (let i = effectiveStart; i < effectiveEnd; i += stepSize) {
      if (checkTimeout(startTime, timeoutMs)) break;
      await itemProcessor(list[i], i);
    }
  }
};

// Main hook
export const useLoopActions = ({ executeActionFCType }: TProps) => {
  const { getData } = useHandleData({});
  const findVariable = stateManagementStore((state) => state.findVariable);
  const findAction = actionHookSliceStore((state) => state.findAction);
  const { handleCompareCondition } = useConditionAction({ executeActionFCType });

  const executeLoopOverList = async (action: TAction<TActionLoop>) => {
    const option = action.data?.option;

    if (option === 'while') {
      const loopCondition = findAction(action.data?.while?.condition || '');
      if (!loopCondition) return;

      await handleWhileLoop(loopCondition as TAction<TConditionChildMap>, handleCompareCondition);
    } else if (option === 'overList') {
      const overListId = action.data?.overList?.condition;
      const overList = findAction(overListId || '') as TAction<TActionLoopOverList>;

      if (!overList?.data) return;

      const { list, startIndex, endIndex, stepSize, reserverOrder } = overList.data;
      const { type } = list;
      const variable = findVariable({
        type: type as TTypeSelectState,
        id: (list[type] as any).variableId,
      });
      if (!variable) return;

      await handleListLoop(variable.value || [], {
        reverseOrder: reserverOrder,
        startIndex: getData(startIndex),
        endIndex: getData(endIndex),
        stepSize: getData(stepSize),
      });
    }
  };

  return { executeLoopOverList };
};
