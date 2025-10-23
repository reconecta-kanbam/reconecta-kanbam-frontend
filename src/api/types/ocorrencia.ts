export interface Ocorrencia {
  id: number;
  titulo: string;
  descricao: string;
  status?: string; // Ex: "Backlog", "Em andamento", "Concluído"
  colaboradorId?: number;
  colaboradorNome?: string;
  setor?: Setor;
  dataCriacao?: string;
  subtarefas?: Subtarefa[];
}

export interface Subtarefa {
  id: number;
  titulo: string;
  descricao?: string;
  responsavelId?: number;
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
