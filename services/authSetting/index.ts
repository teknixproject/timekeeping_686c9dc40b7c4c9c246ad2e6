import axiosInstance from '@/configs/axiosInstance';
import { TApiResponse, TAuthSetting, TAuthSettingUpdate } from '@/types';

const create = async (data: TAuthSetting): Promise<TApiResponse<TAuthSetting>> => {
  const res = await axiosInstance.post(`/authSetting`, data);
  return res.data;
};
const update = async (data: TAuthSettingUpdate): Promise<TApiResponse<TAuthSetting>> => {
  const res = await axiosInstance.put(`/authSetting`, data);
  return res.data;
};
const get = async (data: { projectId?: string }): Promise<TApiResponse<TAuthSetting>> => {
  const res = await axiosInstance.get(`/authSetting`, { params: data });
  return res.data;
};
export const authSettingService = {
  create,
  update,
  get,
};
