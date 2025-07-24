import axios from 'axios';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { stateManagementStore } from '@/stores';
import { authSettingStore } from '@/stores/authSetting';
import {
    TAction, TActionApiCall, TActionCustomFunction, TActionVariable, TApiCallValue, TApiCallVariable
} from '@/types';
import { variableUtil } from '@/uitls';

import { actionHookSliceStore } from './store/actionSliceStore';
import { useApiCall } from './useApiCall';
import { useCustomFunction } from './useCustomFunction';
import { useHandleData } from './useHandleData';

const { isUseVariable, extractAllValuesFromTemplate } = variableUtil;

export type TUseActions = {
  handleApiCallAction: (action: TAction<TActionApiCall>) => Promise<void>;
};

export const useApiCallAction = (): TUseActions => {
  const router = useRouter();
  const { getApiMember } = useApiCall();
  const { getData } = useHandleData({});
  const refreshAction = authSettingStore((state) => state.refreshAction);
  const entryPage = authSettingStore((state) => state.entryPage);
  const forbiddenCode = authSettingStore((state) => state.forbiddenCode);
  const findVariable = stateManagementStore((state) => state.findVariable);
  const updateVariables = stateManagementStore((state) => state.updateVariables);
  const { handleCustomFunction } = useCustomFunction();
  const { getState } = actionHookSliceStore;
  const convertActionVariables = useCallback(
    (actionVariables: TActionVariable[], apiCall: TApiCallValue): any[] => {
      if (_.isEmpty(actionVariables)) return [];

      return actionVariables.map((item) => {
        const { firstValue, secondValue } = item;

        const data = apiCall?.variables?.find((item) => item.id === firstValue.variableId);

        if (!data) return;

        if (secondValue?.type) {
          const valueInStore = getData(secondValue);
          data.value = valueInStore;
        }

        return data;
      });
    },
    [getData]
  );

  const convertApiCallBody = useCallback((body: any, variables: Record<string, any>): any => {
    if (typeof body === 'string') return body;
    if (typeof body !== 'object') return body;

    return Object.entries(body).reduce((acc, [key, value]) => {
      acc[key] = isUseVariable(value)
        ? variables.find(
            (item: TApiCallVariable) => item.key === extractAllValuesFromTemplate(value as string)
          )?.value
        : value;
      return acc;
    }, {} as Record<string, any>);
  }, []);

  const convertQuery = (apiCallMember: TApiCallValue) => {
    const queryConvert = apiCallMember?.query
      ?.map((item) => {
        const type = item.type;
        if (type === 'variable') {
          const variable = apiCallMember?.variables?.find(
            (variable) => variable.id === item.variableId
          );
          item.value = variable?.value;
        }
        return item;
      })
      .reduce(
        (acc, item) => ({
          ...acc,
          [item.key as string]: item.value,
        }),
        {}
      );
    return queryConvert;
  };

  const convertHeader = (apiCallMember: TApiCallValue) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = apiCallMember?.headers || ({ 'Content-Type': 'application/json' } as any);
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      return headers;
    } catch (error) {
      console.log('🚀 ~ convertHeader ~ error:', error);
      return apiCallMember?.headers || ({ 'Content-Type': 'application/json' } as any);
    }
  };
  const makeApiCall = async (
    apiCall: TApiCallValue,
    body: object,
    variableId: string
  ): Promise<any> => {
    const outputVariable = findVariable({
      type: 'apiResponse',
      id: variableId,
    });
    try {
      const response = await axios.request({
        baseURL: apiCall?.baseUrl || '',
        method: apiCall?.method?.toUpperCase(),
        url: apiCall.url,
        headers: convertHeader(apiCall),
        data: ['POST', 'PUT', 'PATCH'].includes(apiCall?.method?.toUpperCase() || '') && body,
        params: ['GET'].includes(apiCall?.method?.toUpperCase() || '') && convertQuery(apiCall),
      });

      if (outputVariable) {
        updateVariables({
          type: 'apiResponse',
          dataUpdate: {
            ...outputVariable,
            value: response.data,
            succeeded: true,
            statusCode: response.status,
            message: response.statusText,
          },
        });
      }

      return response.data;
    } catch (error: unknown) {
      console.log('🚀 ~ useApiCallAction ~ error:', error);
      if (axios.isAxiosError(error)) {
        if (error.status === forbiddenCode) {
          await handleRefreshToken(apiCall, body, variableId);
          return;
        }
        if (outputVariable) {
          updateVariables({
            type: 'apiResponse',
            dataUpdate: {
              ...outputVariable,

              value: error,
              statusCode: error?.response?.status || 500,
              succeeded: false,
              message: error?.message,
            },
          });
        }
        return error;
      }
    }
  };
  const handleRefreshToken = async (apiCall: TApiCallValue, body: object, variableId: string) => {
    try {
      if (refreshAction) {
        const rootAction = Object.values(refreshAction?.onClick || {})?.find(
          (item) => item.parentId === null
        );
        await handleCustomFunction(rootAction as TAction<TActionCustomFunction>);

        await makeApiCall(apiCall, body, variableId);
      } else if (entryPage) router.push(entryPage);
    } catch (error) {
      console.log('🚀 ~ handleRefreshToken ~ error:', error);
      if (entryPage) router.push(entryPage);
    }
  };
  const handleBody = (apiCall: TApiCallValue, variables: Record<string, any>) => {
    const formData = getState().formData;
    return formData || convertApiCallBody(apiCall?.body, variables);
  };
  const handleApiCallAction = async (action: TAction<TActionApiCall>): Promise<void> => {
    const apiCall = getApiMember(action?.data?.apiId ?? '');

    if (!apiCall) return;
    const variables = convertActionVariables(action?.data?.variables ?? [], apiCall);
    const newBody = handleBody(apiCall, variables);

    await makeApiCall(apiCall, newBody, action?.data?.output?.variableId ?? '');

    // handleApiResponse(result, action?.data?.output ?? {});
  };

  return { handleApiCallAction };
};
