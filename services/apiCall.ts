import axiosInstance from '@/configs/axiosInstance';
import { TApiCall, TApiResponse } from '@/types';

const create = async (data: Omit<TApiCall, '_id'>): Promise<TApiResponse<TApiCall>> => {
  const res = await axiosInstance.post(`/apiCall`, data);
  return res.data;
};
const update = async (data: Pick<TApiCall, '_id' | 'apis'>): Promise<TApiResponse<TApiCall>> => {
  const res = await axiosInstance.patch(`/apiCall/${data._id}`, data);
  return res.data;
};
const getAll = async (
  query: Partial<Pick<TApiCall, 'projectId'>>
): Promise<TApiResponse<TApiCall>> => {
  const res = await axiosInstance.get(`/apiCall/all/${query.projectId}`);
  return res.data;
};
export const apiCallService = {
  create,
  update,
  getAll,
};
