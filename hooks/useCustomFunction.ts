'use client';
import { stateManagementStore } from '@/stores';
import { customFunctionStore } from '@/stores/customFunction';
import { TAction, TActionCustomFunction } from '@/types';
import { transformVariable } from '@/uitls/tranformVariable';

import { handleCustomFunction as handleFunction } from './handleCustomFunction';
import { useHandleData } from './useHandleData';

export type TUseActions = {
  handleCustomFunction: (action: TAction<TActionCustomFunction>) => Promise<void>;
};

export const useCustomFunction = (): TUseActions => {
  const updateVariables = stateManagementStore((state) => state.updateVariables);
  const findVariable = stateManagementStore((state) => state.findVariable);
  const { getData } = useHandleData({});
  const findCustomFunction = customFunctionStore((state) => state.findCustomFunction);
  const handleCustomFunction = async (action: TAction<TActionCustomFunction>): Promise<void> => {
    try {
      const { customFunctionId, output, isList, outputType } = action?.data || {};

      if (customFunctionId) {
        const result = await handleFunction({
          data: action?.data as TActionCustomFunction,
          findCustomFunction,
          getData,
        });
        console.log('🚀 ~ handleCustomFunction ~ result:', result);
        const resultStander = transformVariable({
          isList: !!isList,
          type: outputType!,
          value: result,
        });
        console.log('🚀 ~ handleCustomFunction ~ resultStander:', resultStander);

        if (output?.variableId) {
          const variable = findVariable({ type: 'appState', id: output.variableId });
          updateVariables({
            type: 'appState',
            dataUpdate: {
              ...variable!,
              type: outputType!,
              isList: !!isList,
              value: resultStander,
            },
          });
        }
      }
    } catch (error) {
      throw error;
    }
  };
  //#endregion

  return { handleCustomFunction };
};
