import axiosInstance from '@/configs/axiosInstance';
import { TPageVariable, TPageVariableResponse } from '@/types';

const create = async (data: TPageVariable): Promise<TPageVariableResponse> => {
  const res = await axiosInstance.post(`/state`, data);
  return res.data;
};
const getData = async (
  query: Pick<TPageVariable, 'uid' | 'projectId' | 'type'>
): Promise<TPageVariableResponse> => {
  const res = await axiosInstance.get(`/state`, { params: query });
  return res.data;
};
export const stateManagerService = {
  create,
  getData,
};
