import { TAction, TConditionChildMap, TTriggerActions } from './actions';
import { TTypeVariable } from './variable';

export type TOptionApiResponse =
  | 'jsonPath'
  | 'succeeded'
  | 'statusCode'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'exceptionMessage';
export type TOptionList =
  | 'jsonPath'
  | 'itemAtIndex'
  | 'filterCondition'
  | 'sortOrder'
  | 'isEmpty'
  | 'isNotEmpty';
export type TDataField<T = unknown | TOptionApiResponse | TOptionList> = {
  variableId?: string;
  options: {
    jsonPath?: TData;
    option?: T;
    filterCondition?: TAction<TConditionChildMap>;
    itemAtIndex?: TData;
    sortOrder?: 'asc' | 'desc';
  }[];
};
export type TCombineText = {
  text: string;
  style: React.CSSProperties & { textGradient?: string };
}[];
export type TData = {
  type: keyof Omit<TData, 'type'>;
  parameters: {
    paramName: string;
  };
  itemInList: { jsonPath?: string };
  combineText?: TCombineText;
  dynamicGenerate?: TDataField;
  apiResponse?: TDataField;
  appState?: TDataField;
  componentState?: TDataField;
  globalState?: TDataField;
  apiCall?: {
    variableId: string;
  };
  customFunction: {
    customFunctionId: string;
    props: { key: string; type: TTypeVariable; isList: boolean; value: TData }[];
  };
  valueInput?: string;
  defaultValue?: string;
  condition?: TTriggerActions;
  temp: any;
};
