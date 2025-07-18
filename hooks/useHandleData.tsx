/* eslint-disable react-hooks/exhaustive-deps */
import { JSONPath } from 'jsonpath-plus';
import _ from 'lodash';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { stateManagementStore } from '@/stores';
import { customFunctionStore } from '@/stores/customFunction';
import { TConditionChildMap, TTypeSelect, TVariable } from '@/types';
import { TData, TDataField, TOptionApiResponse } from '@/types/dataItem';
import { executeConditionalInData } from '@/uitls/handleConditionInData';
import { transformVariable } from '@/uitls/tranformVariable';

import { actionHookSliceStore } from './actionSliceStore';
import { handleCustomFunction } from './handleCustomFunction';
import { findRootConditionChild, handleCompareCondition } from './useConditionAction';

type UseHandleDataReturn = {
  dataState?: any;
  getData: (data: TData | null | undefined, valueStream?: any) => any;
};

const handleCompareValue = ({
  conditionChildMap,
  getData,
}: {
  conditionChildMap: TConditionChildMap;
  getData: any;
}) => {
  if (_.isEmpty(conditionChildMap)) return;
  const rootCondition = findRootConditionChild(conditionChildMap);

  return handleCompareCondition(rootCondition?.id || '', conditionChildMap, getData);
};
type TUseHandleData = {
  dataProp?: TData;
};

export const useHandleData = (props: TUseHandleData): UseHandleDataReturn => {
  const params = useParams();
  const { findAction } = actionHookSliceStore();
  const apiResponseState = stateManagementStore((state) => state.apiResponse);
  const findCustomFunction = customFunctionStore((state) => state.findCustomFunction);
  const appState = stateManagementStore((state) => state.appState);
  const componentState = stateManagementStore((state) => state.componentState);
  const globalState = stateManagementStore((state) => state.globalState);
  const [dataState, setDataState] = useState<any>();
  const itemInList = useRef(null);
  const findVariable = stateManagementStore((state) => state.findVariable);
  const handleInputValue = (data: TData['valueInput']) => {
    return data || '';
  };

  //#region handle api
  const handleApiResponse = useCallback(
    (data: TData) => {
      if (_.isEmpty(data)) return;
      const apiResponse = data.apiResponse;
      const variableId = apiResponse?.variableId || '';
      const variable = findVariable({ id: variableId, type: 'apiResponse' });

      const handleOption = (
        item: NonNullable<TDataField<TOptionApiResponse>['options']>[number],
        value?: TVariable
      ) => {
        switch (item.option) {
          case 'jsonPath':
            const valueJsonPath = JSONPath({
              json: value?.value,
              path: getData(item.jsonPath as TData) || '',
            });
            return valueJsonPath?.[0];
          case 'statusCode':
            return value?.statusCode;
          case 'succeeded':
            return value?.succeeded;
          case 'isEmpty':
            return _.isEmpty(value);
          case 'isNotEmpty':
            return !_.isEmpty(value);
          case 'exceptionMessage':
            return value?.message;
          default:
            return (
              value?.value ||
              transformVariable({
                ...variable!,
                value: data.defaultValue,
              })
            );
        }
      };

      let value = variable as TVariable;
      for (const option of apiResponse?.options || []) {
        value = handleOption(
          option as NonNullable<TDataField<TOptionApiResponse>['options']>[number],
          value
        );
      }
      if (_.isEmpty(variable)) return data.defaultValue;
      return value;
    },
    [findVariable]
  );

  //#region  handle state
  const handleState = useCallback(
    (data: TData) => {
      const state = data[data.type] as TDataField;
      if ('variableId' in state || {}) {
        const variableId = state?.variableId || '';
        const variable = findVariable({ id: variableId, type: data.type as TTypeSelect });

        let value = variable?.value;

        for (const option of state?.options || []) {
          const optionItem = option as NonNullable<TDataField['options']>[number];

          switch (optionItem.option) {
            case 'jsonPath':
              const jsonPathValue = getData(optionItem.jsonPath as TData);
              const valueJsonPath = JSONPath({
                json: value,
                path: jsonPathValue || '',
              });
              value = valueJsonPath[0];
              break;

            case 'itemAtIndex':
              const index = getData(optionItem?.itemAtIndex as TData);
              let indexValid: number = 0;
              if (typeof index !== 'number') {
                indexValid = parseInt(index);
              }
              value = value[indexValid];
              break;

            case 'filter':
              if (Array.isArray(value)) {
                value = value.filter((item: any) => {
                  itemInList.current = item;
                  const result = handleCompareValue({
                    conditionChildMap: optionItem.filterCondition?.data as TConditionChildMap,
                    getData,
                  });
                  return result;
                });
              }
              break;

            case 'sort':
              if (Array.isArray(value)) {
                const sortOption = optionItem.sortOrder || 'asc';
                const jsonPath = getData(optionItem.jsonPath as TData);

                value = [...value].sort((a: any, b: any) => {
                  let aVal = a;
                  let bVal = b;

                  if (jsonPath) {
                    const aJsonPath = JSONPath({ json: a, path: jsonPath });
                    const bJsonPath = JSONPath({ json: b, path: jsonPath });
                    aVal = aJsonPath[0];
                    bVal = bJsonPath[0];
                  }

                  if (sortOption === 'asc') {
                    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                  } else {
                    return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                  }
                });
              }
              break;

            case 'length':
              return value?.length || 0;
            case 'isEmpty':
              return _.isEmpty(value);
            case 'isNotEmpty':
              return !_.isEmpty(value);
            default:
              return (
                value ||
                transformVariable({
                  ...variable!,
                  value: data.defaultValue,
                })
              );
          }
        }

        return value;
      }
    },
    [findVariable]
  );

  //#region handle item list
  const handleItemInList = (data: TData, valueStream: any) => {
    const { jsonPath } = data.itemInList;
    if (jsonPath) {
      const result = JSONPath({
        json: valueStream || itemInList.current,
        path: jsonPath || '',
      })?.[0];
      return result;
    }
    return valueStream || itemInList.current;
  };

  //#region handle custom function
  //#region handle dynamic generate
  const handleDynamicGenerate = (data: TData) => {
    const state = data[data.type] as TDataField;
    const dynamicItem = data.temp;

    let value = dynamicItem;

    for (const option of state?.options || []) {
      const optionItem = option as NonNullable<TDataField['options']>[number];

      switch (optionItem.option) {
        case 'jsonPath':
          const jsonPathValue = getData(optionItem.jsonPath as TData);
          const valueJsonPath = JSONPath({
            json: value,
            path: jsonPathValue || '',
          });
          value = valueJsonPath?.[0];
          break;

        case 'itemAtIndex':
          const index = getData(optionItem?.itemAtIndex as TData);
          let indexValid: number = 0;
          if (typeof index !== 'number') {
            indexValid = parseInt(index);
          }
          value = value[indexValid];
          break;

        case 'filter':
          if (Array.isArray(value)) {
            value = value.filter((item: any) => {
              itemInList.current = item;
              const result = handleCompareValue({
                conditionChildMap: optionItem.filterCondition?.data as TConditionChildMap,
                getData,
              });
              return result;
            });
          }
          break;

        case 'sort':
          if (Array.isArray(value)) {
            const sortOption = optionItem.sortOrder || 'asc';
            const jsonPath = getData(optionItem.jsonPath as TData);

            value = [...value].sort((a: any, b: any) => {
              let aVal = a;
              let bVal = b;

              if (jsonPath) {
                const aJsonPath = JSONPath({ json: a, path: jsonPath });
                const bJsonPath = JSONPath({ json: b, path: jsonPath });
                aVal = aJsonPath[0];
                bVal = bJsonPath[0];
              }

              if (sortOption === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
              } else {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
              }
            });
          }
          break;

        case 'length':
          return value?.length || 0;
        case 'isEmpty':
          return _.isEmpty(value);
        case 'isNotEmpty':
          return !_.isEmpty(value);
        default:
          return value || data?.defaultValue;
      }
    }

    return value;
  };

  const handleParemeters = (data: TData) => {
    const paramName = data?.parameters?.paramName;
    if (!paramName) return '';
    const result = params[paramName];
    return result;
  };

  const handleCondition = (data: TData) => {
    const value = executeConditionalInData(data?.condition, getData);
    // return executeConditional(conditionChildMap, findAction, getData);
    return value;
    // if (_.isEmpty(conditionChildMap)) return;
    // const rootCondition = findRootConditionChild(conditionChildMap);

    // return handleCompareCondition(rootCondition?.id || '', conditionChildMap, getData);
  };
  //#region getData
  const getData = useCallback(
    (data: TData | null | undefined, valueStream?: any) => {
      if (_.isEmpty(data) && valueStream) return valueStream;
      if (_.isEmpty(data) || !data.type) return data?.defaultValue;

      switch (data.type) {
        case 'valueInput':
          return handleInputValue(data.valueInput);
        case 'parameters':
          return handleParemeters(data);
        case 'dynamicGenerate':
          return handleDynamicGenerate(data);
        case 'apiResponse':
          return handleApiResponse(data);
        case 'appState':
          return handleState(data);
        case 'componentState':
          return handleState(data);
        case 'globalState':
          return handleState(data);
        case 'combineText':
          return data.combineText;
        case 'itemInList':
          return handleItemInList(data, valueStream);
        case 'customFunction':
          return handleCustomFunction({
            data: data.customFunction,
            findCustomFunction,
            getData,
          });

        case 'condition':
          return handleCondition(data);
        default:
          return data?.defaultValue;
      }
    },
    [handleApiResponse, handleState]
  );
  //#region tracking
  const variableId = (props?.dataProp?.[props?.dataProp?.type] as any)?.variableId || '';

  const apiResponseTracking = apiResponseState?.[variableId];
  const appStateTracking = appState?.[variableId];
  const componentStateTracking = componentState?.[variableId];
  const globalStateTracking = globalState?.[variableId];

  //#region handle main
  // Fixed useEffect - only update when data actually changes
  useEffect(() => {
    if (props?.dataProp) {
      const newDataState = getData(props.dataProp);
      // Only update state if the value actually changed
      setDataState((prevState: any) => {
        if (!_.isEqual(prevState, newDataState)) {
          return newDataState;
        }
        return prevState;
      });
    }
  }, [
    props.dataProp,
    apiResponseTracking,
    appStateTracking,
    componentStateTracking,
    globalStateTracking,
  ]);

  return {
    getData,
    dataState,
  };
};
