import api from "../api";
import ENDPOINTS from "../endpoints";

// Lista todos os status
export const listStatus = async () => {
  const response = await api.get(ENDPOINTS.LIST_STATUS);
  return response.data;
};

// Cria um novo status
export const createStatus = async (statusData: {
  nome: string;
  descricao?: string;
  cor?: string;
  ativo?: boolean;
}) => {
  const response = await api.post(ENDPOINTS.CREATE_STATUS, statusData);
  return response.data;
};

// Atualiza um status
export const updateStatus = async (
  id: number,
  statusData: {
    nome?: string;
    descricao?: string;
    cor?: string;
    ativo?: boolean;
  }
) => {
  const response = await api.put(ENDPOINTS.UPDATE_STATUS(id), statusData);
  return response.data;
};
