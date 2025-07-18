import { TTypeSelect } from './actions';
import { TTypeVariable } from './variable';

export type TTypeSelectState =
  | 'parameters'
  | 'appState'
  | 'componentState'
  | 'globalState'
  | 'apiResponse'
  | 'dynamicGenerate';
export type TVariable = {
  id: string;
  key: string;
  type: TTypeVariable;
  isList: boolean;
  value: any;
  succeeded?: boolean;
  message?: string;
  statusCode?: number;
};
export type TPageVariable = {
  projectId: string;
  documentId?: string;
  uid?: string;
  state: TVariable[];
  type: TTypeSelectState;
};
export type TPageVariableResponse = {
  message: string;
  data: TPageVariable;
};

export type TTypeDocumentState = TTypeSelectState;
export type TDocumentState = {
  parameters?: TVariableMap;
  appState?: TVariableMap;
  componentState?: TVariableMap;
  globalState?: TVariableMap;
  apiResponse?: TVariableMap;
  dynamicGenerate?: TVariableMap;
};

export type TVariableMap = {
  [key: string]: TVariable;
};
export type TDocumentStateSet = {
  type: TTypeSelect;
  dataUpdate: TVariableMap;
};
export type TDocumentStateUpdate = {
  type: TTypeSelect;
  dataUpdate: TVariable;
};
export type TDocumentStateFind = {
  type: TTypeSelect;
  name?: string;
  id?: string;
};
