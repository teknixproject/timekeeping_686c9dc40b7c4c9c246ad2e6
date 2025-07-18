import axiosInstance from '@/configs/axiosInstance';
import { TApiResponse, TCustomFunction } from '@/types';

const create = async (
  data: Pick<TCustomFunction, 'name' | 'projectId' | 'documentId' | 'uid' | 'code'>
): Promise<TApiResponse<TCustomFunction>> => {
  return (await axiosInstance.post(`/customFunction`, data)).data;
};
const getOne = async ({ id }: { id: string }): Promise<TApiResponse<TCustomFunction>> => {
  const res = await axiosInstance.get(`/customFunction/${id}`);
  return res.data;
};
const update = async (data: Partial<TCustomFunction>): Promise<TApiResponse<TCustomFunction>> => {
  const res = await axiosInstance.patch(`/customFunction/${data._id}`, data);
  return res.data;
};
const deleteOne = async ({ id }: { id: string }): Promise<TApiResponse<TCustomFunction>> => {
  const res = await axiosInstance.delete(`/customFunction/${id}`);
  return res.data;
};
const getAll = async (
  query: Pick<TCustomFunction, 'uid' | 'projectId'>
): Promise<TApiResponse<TCustomFunction[]>> => {
  const res = await axiosInstance.get(`/customFunction`, { params: query });
  return res.data;
};
export const customFunctionService = {
  create,
  getOne,
  getAll,
  update,
  deleteOne,
};
