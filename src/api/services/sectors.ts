// src/api/services/sectors.ts
import api from '../api';
import ENDPOINTS from '../endpoints';
import { Setor } from '../types/usuario';

export const getSectors = async (): Promise<Setor[]> => {
  const response = await api.get<Setor[]>(ENDPOINTS.SECTORS_LIST);
  return response.data;
};