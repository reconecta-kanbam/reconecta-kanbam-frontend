import api from "../api";
import ENDPOINTS from "../endpoints";
import { Ocorrencia, CreateOcorrenciaRequest } from "../types/ocorrencia";

// Criar nova ocorrência
export const createOcorrencia = async (
  data: CreateOcorrenciaRequest
): Promise<Ocorrencia> => {
  const response = await api.post<Ocorrencia>(
    ENDPOINTS.CREATE_OCORRENCIA,
    data
  );
  return response.data;
};

// Listar todas
export const listOcorrencias = async (): Promise<Ocorrencia[]> => {
  const response = await api.get<Ocorrencia[]>(ENDPOINTS.LIST_OCORRENCIAS);
  return response.data;
};

// Deletar
export const deleteOcorrencia = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.DELETE_OCORRENCIA(id));
};

// Atualizar
export const updateOcorrencia = async (
  id: string,
  data: Partial<Ocorrencia>
): Promise<Ocorrencia> => {
  const response = await api.patch<Ocorrencia>(
    ENDPOINTS.EDIT_OCORRENCIA(id),
    data
  );
  return response.data;
};
