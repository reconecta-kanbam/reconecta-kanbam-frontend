// src/api/services/setor.service.ts
import api from '../api';
import ENDPOINTS from '../endpoints';

export interface Setor {
  id: string;
  name: string;
  description?: string;
}

export interface CreateSetorRequest {
  name: string;
  description?: string;
}

export const createSetor = async (data: CreateSetorRequest): Promise<Setor> => {
  const response = await api.post<Setor>(ENDPOINTS.SETOR_CRIAR, data);
  return response.data;
};