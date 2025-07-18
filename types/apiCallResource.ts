import { TTypeVariable, TVariable } from '@/types';

export enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}
export enum TypeApiCall {
  GROUP = 'GROUP',
  MEMBER = 'MEMBER',
  INDIVIDUAL = 'INDIVIDUAL',
}
export type TApiCall = {
  _id: string;
  projectId: string;
  apis: TApiCallValue[];
};
export type TApiCallValue = {
  type?: TypeApiCall;
  groupId?: string | null;
  groupName?: string | null;
  apiId?: string;
  apiName?: string;
  url?: string;
  baseUrl?: string | null;
  method?: METHODS;
  headers?: object;
  body?: object;
  query?: {
    key: string;
    value: string;
    variableId: string;
    type: 'variable' | 'value';
  }[];
  variables?: TVariable[];
};
export type TApiCallVariable = {
  id: string;
  key: string;
  value: string;
  type: TTypeVariable;
  isList: boolean;
};
