import { api } from "../lib/api";

export const getSetting = async (key: string) => {
  const response = await api.get(`/settings/${key}`);
  return response.data;
};

export const updateSetting = async (key: string, value: any) => {
  const response = await api.put(`/settings/${key}`, { value });
  return response.data;
};
