// src/api/services/ocorrencia.service.ts
import api from '../api';
import ENDPOINTS from '../endpoints';

export interface Ocorrencia {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo?: string;
}

export interface CreateOcorrenciaRequest {
  title: string;
  description: string;
}

export interface AtribuirRequest {
  userId: string;
}

export interface StatusRequest {
  status: string;
}

export const getOcorrencias = async (): Promise<Ocorrencia[]> => {
  const response = await api.get<Ocorrencia[]>(ENDPOINTS.OCORRENCIA_LISTAR);
  return response.data;
};

export const createOcorrencia = async (data: CreateOcorrenciaRequest): Promise<Ocorrencia> => {
  const response = await api.post<Ocorrencia>(ENDPOINTS.OCORRENCIA_CRIAR, data);
  return response.data;
};

export const createOcorrenciaPublica = async (data: CreateOcorrenciaRequest & { colaborador: string }): Promise<Ocorrencia> => {
  const response = await api.post<Ocorrencia>(ENDPOINTS.OCORRENCIA_CRIAR_PUBLICA, data);
  return response.data;
};

export const atribuirOcorrencia = async (id: string, data: AtribuirRequest): Promise<Ocorrencia> => {
  const response = await api.patch<Ocorrencia>(`${ENDPOINTS.OCORRENCIA_ATRIBUIR}${id}/atribuir`, data);
  return response.data;
};

export const alterarStatusOcorrencia = async (id: string, data: StatusRequest): Promise<Ocorrencia> => {
  const response = await api.patch<Ocorrencia>(`${ENDPOINTS.OCORRENCIA_ALTERAR_STATUS}${id}/status`, data);
  return response.data;
};

export const getOcorrenciaById = async (id: string): Promise<Ocorrencia> => {
  const response = await api.get<Ocorrencia>(`${ENDPOINTS.OCORRENCIA_DETALHES}${id}`);
  return response.data;
};