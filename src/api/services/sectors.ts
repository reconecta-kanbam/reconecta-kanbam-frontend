// src/api/services/setores.ts

import api from "../api";
import ENDPOINTS from "../endpoints";
import type { Setor, CreateSetorRequest, UpdateSetorRequest } from "../types/sectors";

// Listar todos os setores
export const listSetores = async (): Promise<Setor[]> => {
  const response = await api.get<Setor[]>(ENDPOINTS.SECTORS_LIST);
  return response.data.sort((a, b) => a.id - b.id);
};

// Buscar setor por ID
export const getSetorById = async (id: number): Promise<Setor> => {
  const response = await api.get<Setor>(`${ENDPOINTS.SECTORS_LIST}/${id}`);
  return response.data;
};

// Criar setor
export const createSetor = async (data: CreateSetorRequest): Promise<Setor> => {
  const response = await api.post<Setor>(ENDPOINTS.SECTORS_LIST, data);
  return response.data;
};

// Atualizar setor
export const updateSetor = async (id: number, data: UpdateSetorRequest): Promise<Setor> => {
  const response = await api.patch<Setor>(`${ENDPOINTS.SECTORS_LIST}/${id}`, data);
  return response.data;
};

// Deletar setor
export const deleteSetor = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINTS.SECTORS_LIST}/${id}`);
};

// Alias para manter compatibilidade
export const getSectors = listSetores;