import { TTriggerActions } from '@/types';

type TPageActionBase = {
  projectId: string;
  documentId: string;
  uid: string;
  name: string;
  actions: TTriggerActions;
};
export type TPageActionReturn = {
  _id: string;
} & TPageActionBase;
export type TPageActionCreate = TPageActionBase;
