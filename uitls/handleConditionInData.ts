import { findRootConditionChild, handleCompareCondition } from '@/hooks/useConditionAction';
import { TAction, TConditionChildMap } from '@/types';

import { TConditional, TTriggerActions } from '../types/actions';
import { transformVariable } from './tranformVariable';

const findAction = (actionId: string, triggerFull: TTriggerActions): TAction<unknown> => {
  const onClick = triggerFull.onClick || {};
  return onClick[actionId];
};

const processCondition = (
  conditionId: string,
  triggerFull: TTriggerActions,
  getData: (value: any) => any
): boolean => {
  const conditionChild = findAction(conditionId, triggerFull) as TAction<TConditionChildMap>;

  if (!conditionChild?.data) {
    console.warn(`Condition data not found: ${conditionId}`);
    return false;
  }

  const rootCondition = findRootConditionChild(conditionChild.data);

  if (!rootCondition?.id) {
    console.warn(`Root condition not found: ${conditionId}`);
    return false;
  }

  return handleCompareCondition(rootCondition.id, conditionChild.data, getData);
};

const extractReturnValue = (condition: TAction<TConditionChildMap>): any => {
  if (!condition.data?.isReturnValue) return null;

  const value = condition.data.valueReturn;
  return value ? transformVariable(value) : null;
};

const isElseCondition = (condition: TAction<TConditionChildMap>): boolean => {
  return condition.data?.label === 'else';
};

export const executeConditionalInData = (
  triggerFull: TTriggerActions,
  getData: (value: any) => any
): any => {
  const onClick = triggerFull.onClick || {};
  const conditionAction = Object.values(onClick).find(
    (item) => item.fcType === 'conditional'
  ) as TAction<TConditional>;

  if (!conditionAction) {
    console.warn('No conditional action found');
    return null;
  }

  const conditions = conditionAction.data?.conditions || [];

  if (conditions.length === 0) {
    console.warn('No conditions found in conditional action');
    return null;
  }

  let elseCondition: TAction<TConditionChildMap> | null = null;

  // Process conditions in order
  for (const conditionId of conditions) {
    try {
      const condition = findAction(conditionId, triggerFull) as TAction<TConditionChildMap>;

      if (!condition) {
        console.warn(`Condition not found: ${conditionId}`);
        continue;
      }

      // Store else condition for later processing
      if (isElseCondition(condition)) {
        elseCondition = condition;
        continue;
      }

      // Check if condition is met
      const isConditionMet = processCondition(conditionId, triggerFull, getData);

      if (isConditionMet) {
        return extractReturnValue(condition);
      }
    } catch (error) {
      console.error(`Error processing condition ${conditionId}:`, error);
      // Continue with next condition
    }
  }

  // If no conditions were met, process else condition
  if (elseCondition) {
    return extractReturnValue(elseCondition);
  }

  return null;
};
