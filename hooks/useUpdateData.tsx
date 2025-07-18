import _ from 'lodash';
import { useMemo } from 'react';

import { stateManagementStore } from '@/stores';
import { TData } from '@/types/dataItem';

type TProps = {
  dataProp?: TData;
};
type TUpdateData = {
  updateData: (value: any) => void;
};
export const useUpdateData = ({ dataProp }: TProps): TUpdateData => {
  const findVariable = stateManagementStore((state) => state.findVariable);
  const updateVariables = stateManagementStore((state) => state.updateVariables);
  const { type, variableId } = useMemo(() => {
    const type = dataProp?.type as 'appState' | 'globalState' | 'componentState';
    const variableId = dataProp?.[type]?.variableId ?? '';
    return { type, variableId };
  }, [dataProp]);
  const updateData = (value: any) => {
    console.log('🚀 ~ updateData ~ value:', value);
    if (_.isEmpty(dataProp)) return;
    const variable = findVariable({ id: variableId, type: type });
    if (!variable) return;
    updateVariables({
      type: type,
      dataUpdate: { ...variable, value },
    });
  };
  return { updateData };
};
