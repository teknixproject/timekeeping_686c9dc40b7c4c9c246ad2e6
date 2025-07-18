import axiosInstance from '@/configs/axiosInstance';
import { TDocumentUids } from '@/stores/documents';
import { TApiResponse } from '@/types';

const getAllPageNames = async (projectId: string): Promise<TApiResponse<TDocumentUids[]>> => {
  const result = await (await axiosInstance.get('/document/uids', { params: { projectId } })).data;

  return result;
};

export const documentService = {
  getAllPageNames,
};
