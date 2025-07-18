import _ from 'lodash';

import { findRootConditionChild, handleCompareCondition } from '@/hooks/useConditionAction';
import { TAction, TConditionChildMap } from '@/types';

import { TTriggerActions, TTriggerActionValue } from '../types/actions';
import { transformVariable } from './tranformVariable';

const findAction = (actionId: string, triggerFull: TTriggerActions): TAction<unknown> => {
  const onClick = _.get(triggerFull, 'onClick', {}) as TTriggerActionValue;
  return onClick?.[actionId];
};
const processCondition = (
  conditionId: string,
  triggerFull: TTriggerActions,
  getData: (value: any) => any
): boolean => {
  const conditionChild = findAction(conditionId, triggerFull) as TAction<TConditionChildMap>;
  console.log('🚀rootCondition ~ conditionId:', conditionId);

  if (!conditionChild?.data) {
    console.warn(`Condition data not found: ${conditionId}`);
    return false;
  }

  const rootCondition = findRootConditionChild(conditionChild.data);
  console.log('🚀 ~ rootCondition:', rootCondition);

  if (!rootCondition?.id) {
    console.warn(`Root condition not found: ${conditionId}`);
    return false;
  }

  const isConditionMet = handleCompareCondition(rootCondition.id, conditionChild.data, getData);

  return isConditionMet;
};
export const executeConditionalInData = (triggerFull: TTriggerActions, getData: any) => {
  const onClick = _.get(triggerFull, 'onClick', {});
  const conditionAction = Object.values(onClick).find((item) => item.fcType === 'conditional');
  console.log('🚀 ~ executeConditionalInData ~ conditionAction:', conditionAction);

  const conditions = _.get(conditionAction, 'data.conditions', []);
  let valueReturn = null;
  // Process each condition until the first one that is met
  for (const conditionId of conditions) {
    try {
      const isConditionMet = processCondition(conditionId, triggerFull, getData);
      console.log('🚀 ~ executeConditionalInData ~ isConditionMet:', isConditionMet);

      if (isConditionMet) {
        const condition = findAction(conditionId, triggerFull) as TAction<TConditionChildMap>;
        const isReturnValue = condition?.data?.isReturnValue;
        const value = _.get(condition, 'data.valueReturn');
        if (value && isReturnValue) {
          valueReturn = transformVariable(value);
        }
        break; // Exit after first matching condition
      }
    } catch (error) {
      console.error(`Error processing condition ${conditionId}:`, error);
      // Continue with next condition
    }
  }

  if (valueReturn) return valueReturn;
};
