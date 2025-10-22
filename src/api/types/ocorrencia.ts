export interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: "baixa" | "média" | "alta";
  status?: string;
  usuarioId?: string;
  dataCriacao?: string;
}

export interface CreateOcorrenciaRequest {
  titulo: string;
  descricao: string;
  prioridade: "baixa" | "média" | "alta";
}
