import { TVariable } from '@/types';

export type saveDocumentRequest = {
  projectId: string;
  documentId: string;
  documentName: string;
  layoutJson: object;
};
export type TDocumentUids = {
  _id: string;
  documentName: string;
  uid: string;
  parameters?: Array<TVariable>;
};
