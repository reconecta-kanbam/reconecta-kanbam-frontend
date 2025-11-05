// src/api/services/workflows.ts
import api from "../api";
import ENDPOINTS from "../endpoints";

export interface Workflow {
  id: number;
  nome: string;
  descricao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowRequest {
  nome: string;
  descricao?: string;
}

export interface UpdateWorkflowRequest {
  nome: string;
  descricao?: string;
}

export const listWorkflows = async (): Promise<Workflow[]> => {
  const response = await api.get<Workflow[]>(ENDPOINTS.LIST_WORKFLOWS || "/workflows");
  return response.data;
};

export const createWorkflow = async (data: CreateWorkflowRequest): Promise<Workflow> => {
  const payload = { nome: data.nome, descricao: data.descricao || undefined };
  const response = await api.post<Workflow>(ENDPOINTS.CREATE_WORKFLOW || "/workflows", payload);
  return response.data;
};

export const updateWorkflow = async (id: number, data: UpdateWorkflowRequest): Promise<Workflow> => {
  const payload = { nome: data.nome, descricao: data.descricao || undefined };
  const response = await api.patch<Workflow>(ENDPOINTS.UPDATE_WORKFLOW?.(id) || `/workflows/${id}`, payload);
  return response.data;
};

export const deleteWorkflow = async (id: number): Promise<void> => {
  await api.delete(ENDPOINTS.DELETE_WORKFLOW?.(id) || `/workflows/${id}`);
};