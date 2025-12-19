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
export const listStatus = async (workflowId?: number) => {
  // ✅ Se workflowId é passado, filtrar. Senão, retornar todos
  const params = new URLSearchParams();
  if (typeof workflowId === "number") {
    params.append("workflowId", workflowId.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `/status?${queryString}` : "/status";

  const response = await api.get(url);
  return response.data;
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