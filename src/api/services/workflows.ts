// src/api/services/workflows.ts

import api from "../api";
import ENDPOINTS from "../endpoints";
import type { Workflow, CreateWorkflowRequest, UpdateWorkflowRequest } from "../types/workflow";

// Listar todos os workflows (ordenados por ID ascendente)
export const listWorkflows = async (): Promise<Workflow[]> => {
  const response = await api.get<Workflow[]>(ENDPOINTS.LIST_WORKFLOWS);
  return response.data.sort((a, b) => a.id - b.id);
};

// Buscar workflow por ID
export const getWorkflowById = async (id: number): Promise<Workflow> => {
  const response = await api.get<Workflow>(`${ENDPOINTS.LIST_WORKFLOWS}/${id}`);
  return response.data;
};

// Criar novo workflow
export const createWorkflow = async (data: CreateWorkflowRequest): Promise<Workflow> => {
  const response = await api.post<Workflow>(ENDPOINTS.CREATE_WORKFLOW, data);
  return response.data;
};

// Atualizar workflow existente
export const updateWorkflow = async (id: number, data: UpdateWorkflowRequest): Promise<Workflow> => {
  const response = await api.patch<Workflow>(ENDPOINTS.UPDATE_WORKFLOW(id), data);
  return response.data;
};

// Deletar workflow
export const deleteWorkflow = async (id: number): Promise<void> => {
  await api.delete(ENDPOINTS.DELETE_WORKFLOW(id));
};