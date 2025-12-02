// src/api/types/workflow.ts

export interface Workflow {
  id: number;
  nome: string;
  descricao?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkflowRequest {
  nome: string;
  descricao?: string;
}

export interface UpdateWorkflowRequest {
  nome?: string;
  descricao?: string;
}