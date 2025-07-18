import { TTypeVariable } from './variable';

export type TCustomFunction = {
  _id: string;
  projectId: string;
  documentId: string;
  uid: string;
  name: string;
  code: string;
  props: {
    key: string;
    type: TTypeVariable;
    value?: any;
    isList: boolean;
  }[];
  description?: string;
};
