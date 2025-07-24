import { TAction, TConditionalChild, TConditionChildMap } from '@/types';

import { actionHookSliceStore } from './store/actionSliceStore';
import { useHandleData } from './useHandleData';

export type TUseActions = {
  executeConditionalChild: (action: TAction<TConditionChildMap>) => Promise<boolean>;
  handleCompareCondition: (
    conditionChildId: string,
    condition: TConditionChildMap
  ) => Promise<boolean>;
};

// Enums for operators to avoid magic strings
export enum ComparisonOperator {
  EQUAL = 'equal',
  NOT_EQUAL = 'notEqual',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
}

export enum LogicOperator {
  AND = 'and',
  OR = 'or',
}

export enum ConditionType {
  COMPARE = 'compare',
  LOGIC = 'logic',
}

/**
 * Evaluates a comparison between two values using the specified operator
 * @param firstValue - The first value to compare
 * @param secondValue - The second value to compare
 * @param operator - The comparison operator to use
 * @returns The boolean result of the comparison
 */
export const evaluateComparison = (
  firstValue: any,
  secondValue: any,
  operator: string
): boolean => {
  const stringFirst = String(firstValue);
  const stringSecond = String(secondValue);
  const numberFirst = Number(firstValue);
  const numberSecond = Number(secondValue);

  switch (operator) {
    case ComparisonOperator.EQUAL:
      return stringFirst === stringSecond;
    case ComparisonOperator.NOT_EQUAL:
      return stringFirst !== stringSecond;
    case ComparisonOperator.GREATER_THAN:
      return numberFirst > numberSecond;
    case ComparisonOperator.LESS_THAN:
      return numberFirst < numberSecond;
    case ComparisonOperator.GREATER_THAN_OR_EQUAL:
      return numberFirst >= numberSecond;
    case ComparisonOperator.LESS_THAN_OR_EQUAL:
      return numberFirst <= numberSecond;
    default:
      console.warn(`Unknown comparison operator: ${operator}`);
      return false;
  }
};

/**
 * Evaluates a logic operation (AND/OR) between two boolean values
 * @param firstValue - The first boolean value
 * @param secondValue - The second boolean value
 * @param logicOperator - The logic operator to use
 * @returns The boolean result of the logic operation
 */
export const evaluateLogicOperation = (
  firstValue: boolean | undefined,
  secondValue: boolean | undefined,
  logicOperator: string
): boolean => {
  // Handle missing values by defaulting to false
  const first = firstValue ?? false;
  const second = secondValue ?? false;

  switch (logicOperator) {
    case LogicOperator.AND:
      return first && second;
    case LogicOperator.OR:
      return first || second;
    default:
      console.warn(`Unknown logic operator: ${logicOperator}, defaulting to AND`);
      return first && second;
  }
};

/**
 * Finds the root condition child (one without a parent)
 * @param condition - The condition child map to search in
 * @returns The root condition child or undefined if not found
 */
export const findRootConditionChild = (
  condition: TConditionChildMap
): TConditionalChild | undefined => {
  return Object.values(condition?.childs || {})?.find((child) => !child?.parentId);
};

/**
 * Retrieves a condition child by its ID
 * @param conditionId - The ID of the condition child to retrieve
 * @param condition - The condition child map to search in
 * @returns The condition child or undefined if not found
 */
export const getConditionChildById = (
  conditionId: string,
  condition: TConditionChildMap
): TConditionalChild | undefined => {
  return condition.childs[conditionId];
};

/**
 * Evaluates a simple comparison condition
 * @param compare - The comparison configuration
 * @param getData - Function to retrieve data values
 * @returns Boolean result of the comparison
 */
export const evaluateCompareCondition = async (
  compare: TConditionalChild['compare'],
  getData: (value: any) => any
): Promise<boolean> => {
  if (!compare?.firstValue || !compare?.secondValue) {
    console.warn('Missing comparison values');
    return false;
  }

  const firstValue = await getData(compare.firstValue);
  console.log('🚀 evaluateCompareCondition~ firstValue:', firstValue);
  const secondValue = await getData(compare.secondValue);
  console.log('🚀evaluateCompareCondition ~ secondValue:', secondValue);

  // Check for null/undefined values
  if (firstValue == null || secondValue == null) {
    console.warn('Comparison values are null or undefined');
    return false;
  }

  return evaluateComparison(firstValue, secondValue, compare.operator);
};

// const executeValueReturn = (conditionChild: TConditionChildMap, valueComparasion: boolean) => {
//   console.log('🚀 ~ executeValueReturn ~ valueComparasion:', valueComparasion);

//   if (conditionChild.isReturnValue && valueComparasion === true) {
//     return transformVariable(conditionChild.valueReturn!);
//   }
//   return valueComparasion;
// };

/**
 * Recursively handles complex condition evaluation
 * @param conditionChildId - ID of the condition child to evaluate
 * @param condition - The condition child map
 * @param getData - Function to retrieve data values
 * @returns Boolean result of the condition evaluation
 */
export const handleCompareCondition = async (
  conditionChildId: string,
  condition: TConditionChildMap,
  getData: (value: any) => any
): Promise<boolean> => {
  const conditionChild = getConditionChildById(conditionChildId, condition);

  if (!conditionChild) {
    console.warn(`Condition child not found: ${conditionChildId}`);
    return false;
  }

  // Handle simple comparison condition
  if (conditionChild.type === ConditionType.COMPARE) {
    const valueCompareSignle = await evaluateCompareCondition(conditionChild.compare, getData);
    console.log('🚀 ~ valueCompareSignle:', valueCompareSignle);

    return valueCompareSignle;
  }

  // Handle complex logic condition
  const firstValue = conditionChild.fistCondition
    ? await handleCompareCondition(conditionChild.fistCondition, condition, getData)
    : undefined;

  const secondValue = conditionChild.secondCondition
    ? await handleCompareCondition(conditionChild.secondCondition, condition, getData)
    : undefined;

  console.log('🚀 ~ firstValue:', firstValue);
  console.log('🚀 ~ secondValue:', secondValue);
  const valueComparasion = evaluateLogicOperation(
    firstValue,
    secondValue,
    conditionChild.logicOperator
  );
  return valueComparasion;
};

/**
 * Processes a single condition and executes its associated action if met
 * @param conditionId - ID of the condition to process
 * @param findAction - Function to find actions by ID
 * @param getData - Function to retrieve data values
 * @param executeActionFCType - Function to execute actions
 * @returns Boolean indicating if the condition was met
 */
export const processCondition = async (
  conditionChild: TAction<TConditionChildMap>,
  findAction: (id: string) => TAction | undefined,
  getData: (value: any) => any
): Promise<boolean> => {
  if (!conditionChild?.data) {
    console.warn(`Condition data not found: ${conditionChild.id}`);
    return false;
  }

  const rootCondition = findRootConditionChild(conditionChild.data);

  if (!rootCondition?.id) {
    console.warn(`Root condition not found: ${conditionChild.id}`);
    return false;
  }

  const isConditionMet = handleCompareCondition(rootCondition.id, conditionChild.data, getData);

  return isConditionMet;
};

/** This is as if, ifelse, else
 * Executes a conditional action by evaluating its conditions
 * @param action - The conditional action to execute
 * @param findAction - Function to find actions by ID
 * @param getData - Function to retrieve data values
 * @param executeActionFCType - Function to execute actions
 */
/**
 * Custom hook for handling condition-based actions
 * @param props - Hook properties containing action execution function
 * @returns Object with condition execution functions
 */
export const useConditionChildAction = (): TUseActions => {
  // Store hooks
  const { findAction } = actionHookSliceStore();
  const { getData } = useHandleData({});

  const handleCompareConditionWrapper = async (
    conditionChildId: string,
    condition: TConditionChildMap
  ): Promise<boolean> => {
    return await handleCompareCondition(conditionChildId, condition, getData);
  };

  const executeConditionalChild = async (action: TAction<TConditionChildMap>): Promise<boolean> => {
    return await processCondition(action, findAction, getData);
  };

  return {
    executeConditionalChild,
    handleCompareCondition: handleCompareConditionWrapper,
  };
};
