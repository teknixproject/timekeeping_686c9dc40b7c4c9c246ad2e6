import axiosInstance from '@/configs/axiosInstance';
import { TActionServer, TApiResponse } from '@/types';

const createAndUpdate = async (data: TActionServer): Promise<TApiResponse<TActionServer>> => {
  const res = await axiosInstance.post(`/actions`, data);
  return res.data;
};
const getData = async (
  query: Pick<TActionServer, 'uid' | 'projectId'>
): Promise<TApiResponse<TActionServer>> => {
  const res = await axiosInstance.get(`/actions`, { params: query });
  return res.data;
};
export const actionService = {
  createAndUpdate,
  getData,
};
