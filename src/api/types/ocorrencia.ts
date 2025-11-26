export interface Ocorrencia {
  id: number;
  titulo: string;
  descricao: string;
  status?: {
    id: number;
    nome: string;
    chave: string;
    ordem?: number;
  };
  setor?: {
    id: number;
    nome: string;
  };
  gestor?: {
    id: number;
    nome: string;
    email: string;
    perfil?: string;
  };
  colaborador?: {
    id: number;
    nome: string;
    email: string;
    perfil?: string;
  };
  workflow?: {
    id: number;
    nome: string;
    descricao?: string;
  };
  workflowId?: number | null;
  documentacaoUrl?: string | null;
  descricaoExecucao?: string | null;
  subtarefas?: Subtarefa[];
  historicos?: HistoricoStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtarefa {
  id: number;
  titulo: string;
  descricao?: string;
  status: string;
  responsavel?: {
    id: number;
    nome: string;
    email: string;
    perfil?: string;
  };
  createdAt: string;
}

export interface HistoricoStatus {
  id: number;
  status?: {
    id: number;
    nome: string;
    chave: string;
  };
  dataHora: string;
}

export interface CreateOcorrenciaRequest {
  titulo: string;
  descricao: string;
  setorId: number;
  colaboradorId?: number;
  autoAtribuir?: boolean;
  statusId?: number;
  workflowId?: number;
  documentacaoUrl?: string;
  descricaoExecucao?: string;
}

export interface EditOcorrenciaRequest {
  titulo?: string;
  descricao?: string;
  setorId?: number;
  statusId?: number | null;
  documentacaoUrl?: string;
  descricaoExecucao?: string;
  workflowId?: number | null;
}

export interface AtribuirOcorrenciaRequest {
  colaboradorId?: number;
  auto?: boolean;
}

export interface UpdateStatusRequest {
  statusId: number;
}