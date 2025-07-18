import { TTriggerActions } from '@/types';

type TPage = {
  documentId: {
    uid: string;
    documentName: string;
    _id: string;
  };
  roles?: { value: string }[];
  required: boolean;
};

export type TAuthSetting = {
  projectId: string;
  enable: boolean;
  entryPage: string;
  loggedInPage: string;
  pages: TPage[];
  refreshAction?: TTriggerActions;
  forbiddenCode: number;
};
export type TAuthSettingUpdate = {
  documentId: string;
  roles?: { value: string }[];
  required: boolean;
} & TAuthSetting;
