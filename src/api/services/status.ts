// src/api/services/status.ts
import api from "../api";
import ENDPOINTS from "../endpoints";

export interface Status {
  id: number;
  chave: string;
  nome: string;
  ordem: number;
  workflowId?: number;
}

export interface CreateStatusRequest {
  chave: string;
  nome: string;
  ordem: number;
  workflowId?: number;
}

export interface UpdateStatusRequest {
  chave?: string;
  nome?: string;
  ordem?: number;
  workflowId?: number;
}

// Lista todos os status ordenados
export const listStatus = async (): Promise<Status[]> => {
  const response = await api.get<Status[]>(ENDPOINTS.LIST_STATUS);
  // Garantir ordenação por ordem
  return response.data.sort((a, b) => a.ordem - b.ordem);
};

// Cria novo status
export const createStatus = async (data: CreateStatusRequest): Promise<Status> => {
  const response = await api.post<Status>(ENDPOINTS.CREATE_STATUS, data);
  return response.data;
};

// Atualiza status
export const updateStatus = async (
  id: number,
  data: UpdateStatusRequest
): Promise<Status> => {
  const response = await api.patch<Status>(ENDPOINTS.UPDATE_STATUS(id), data);
  return response.data;
};

// Deleta status
export const deleteStatus = async (id: number): Promise<void> => {
  await api.delete(ENDPOINTS.DELETE_STATUS(id));
};