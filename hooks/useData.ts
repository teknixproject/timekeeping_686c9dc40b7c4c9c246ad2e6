import { JSONPath } from 'jsonpath-plus';
/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { useEffect, useState } from 'react';

import { stateManagementStore } from '@/stores';
import { TTypeSelectState } from '@/types';
import { GridItem, TDynamicGenerate } from '@/types/gridItem';

type Props = {
  layoutData: GridItem;
  defaultTitle?: string | Record<string, any>;
};

export const useData = ({ layoutData, defaultTitle = 'Text' }: Props) => {
  const [title, setTitle] = useState<string | Record<string, any>>(
    _.get(layoutData, 'dataSlice.title')
  );
  const [value, setValue] = useState<string | Record<string, any>>(
    _.get(layoutData, 'dataSlice.value')
  );
  const [defaultValue, setDefaultValue] = useState<string | Record<string, any>>(
    _.get(layoutData, 'dataSlice.defaultValue')
  );
  const [variableId, setVariableId] = useState<string>(
    _.get(layoutData, 'dataSlice.variableId', '')
  );
  const [typeStore, setTypeStore] = useState<TTypeSelectState>(
    _.get(layoutData, 'dataSlice.typeStore', 'appState')
  );
  const [dynamicGenerateData, setDynamicGenerateData] = useState<TDynamicGenerate>(
    _.get(layoutData, 'dynamicGenerateData', {})
  );
  const { findVariable, appState, componentState, globalState, apiResponse } =
    stateManagementStore();

  useEffect(() => {
    if (dynamicGenerateData) {
    }
  }, [dynamicGenerateData]);

  useEffect(() => {
    if (variableId && typeStore) {
      const valueInStore = findVariable({
        type: typeStore,
        id: variableId,
      });
      if (valueInStore !== undefined) {
        const jsonPath = _.get(layoutData, 'dataSlice.jsonPath', '');
        if (jsonPath) {
          const valueJsonPath = JSONPath({
            path: jsonPath!,
            json: typeStore === 'apiResponse' ? valueInStore?.value?.data : valueInStore.value,
          });
          setValue(
            _.isArray(valueJsonPath) ? String(valueJsonPath[0]) : valueJsonPath ?? defaultTitle
          );
        } else {
          setValue(valueInStore.value ?? defaultTitle);
        }
      }
    }
  }, [
    typeStore,
    appState,
    componentState,
    globalState,
    apiResponse,
    findVariable,
    defaultTitle,
    layoutData,
    variableId,
  ]);

  return {
    title: title || value || defaultValue || 'Text',
  };
};
