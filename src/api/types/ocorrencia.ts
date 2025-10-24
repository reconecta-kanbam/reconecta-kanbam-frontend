export interface Ocorrencia {
  id: number;
  titulo: string;
  descricao: string;
  status: {
    id: number;
    chave: string;
    nome: string;
    ordem: number;
  } | null;
  gestor: {
    id: number;
    nome: string;
    email: string;
    perfil: string;
  } | null;
  colaborador: {
    id: number;
    nome: string;
    email: string;
    perfil: string;
  } | null;
  setor: {
    id: number;
    nome: string;
  } | null;
  documentacaoUrl: string | null;
  descricaoExecucao: string | null;
  createdAt: string;
  updatedAt: string;
  subtarefas: {
    id: number;
    titulo: string;
    descricao?: string;
    status?: string;
    createdAt: string;
    responsavel?: {
      id: number;
      nome: string;
      email: string;
    };
  }[];
  historicos: {
    id: number;
    dataHora: string;
  }[];
}

export interface Subtarefa {
  id: number;
  titulo: string;
  descricao?: string;
  status?: string;
  createdAt: string;
  responsavel?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface CreateOcorrenciaRequest {
  titulo: string;
  descricao: string;
  setorId: number;
  colaboradorId?: number;
  colaboradorNome?: string;
}

export interface Setor {
  id: number;
  nome: string;
}
