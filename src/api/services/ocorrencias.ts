import api from "../api";
import ENDPOINTS from "../endpoints";
import {
  Ocorrencia,
  CreateOcorrenciaRequest,
  Subtarefa,
} from "../types/ocorrencia";

// Criar nova ocorrência
export const createOcorrencia = async (data: CreateOcorrenciaRequest) => {
  // Montar payload garantindo que os campos opcionais sejam enviados
  const payload: any = {
    titulo: data.titulo,
    descricao: data.descricao,
    setorId: data.setorId,
  };

  // Adicionar campos opcionais apenas se tiverem valor
  if (data.colaboradorId) payload.colaboradorId = data.colaboradorId;
  if (data.statusId) payload.statusId = data.statusId;
  if (data.workflowId) payload.workflowId = data.workflowId;
  
  // CORREÇÃO: Sempre enviar esses campos (mesmo vazios) para garantir persistência
  payload.documentacaoUrl = data.documentacaoUrl || "";
  payload.descricaoExecucao = data.descricaoExecucao || "";

  const response = await api.post(ENDPOINTS.CREATE_OCORRENCIA, payload);
  return response.data as Ocorrencia;
};

// Criar ocorrência pública
export const createOcorrenciaPublic = async (data: {
  titulo: string;
  descricao: string;
  colaboradorNome: string;
  setorId: number;
  documentacaoUrl?: string;
  descricaoExecucao?: string;
}) => {
  const payload: any = {
    titulo: data.titulo,
    descricao: data.descricao,
    colaboradorNome: data.colaboradorNome,
    setorId: data.setorId,
  };

  // CORREÇÃO: Sempre enviar esses campos
  payload.documentacaoUrl = data.documentacaoUrl || "";
  payload.descricaoExecucao = data.descricaoExecucao || "";

  const response = await api.post(ENDPOINTS.CREATE_OCORRENCIA_PUBLIC, payload);
  return response.data as Ocorrencia;
};

// Listar ocorrências (com filtros avançados)
export const listOcorrencias = async (filters?: {
  titulo?: string;
  setorId?: number;
  colaboradorId?: number;
  statusId?: number;
  gestorId?: number;
}) => {
  const cleanFilters = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== undefined && value !== null && value !== ""
        )
      )
    : {};

  const response = await api.get(ENDPOINTS.LIST_OCORRENCIAS, {
    params: cleanFilters,
  });
  return response.data as Ocorrencia[];
};

// Listar por usuário
export const listOcorrenciasByUser = async (userId: number) => {
  const response = await api.get(ENDPOINTS.GET_OCORRENCIA_BY_USER(userId));
  return response.data as Ocorrencia[];
};

// Deletar
export const deleteOcorrencia = async (id: number) => {
  await api.delete(ENDPOINTS.DELETE_OCORRENCIA(id));
};

// Editar ocorrência
export const editOcorrencia = async (
  id: number,
  data: {
    titulo?: string;
    descricao?: string;
    setorId?: number;
    statusId?: number;
    documentacaoUrl?: string;
    descricaoExecucao?: string;
  }
) => {
  // Montar payload
  const payload: any = {};
  if (data.titulo !== undefined) payload.titulo = data.titulo;
  if (data.descricao !== undefined) payload.descricao = data.descricao;
  if (data.setorId !== undefined) payload.setorId = data.setorId;
  
  // CORREÇÃO: Sempre enviar esses campos para garantir que sejam atualizados
  // Usa ?? para incluir string vazia, diferente de || que ignoraria ""
  payload.documentacaoUrl = data.documentacaoUrl ?? "";
  payload.descricaoExecucao = data.descricaoExecucao ?? "";

  const response = await api.patch(ENDPOINTS.EDIT_OCORRENCIA(id), payload);

  // Se statusId foi passado, atualizar status separadamente
  if (data.statusId !== undefined) {
    await updateStatusOcorrencia(id, { statusId: data.statusId });
  }

  return response.data as Ocorrencia;
};

// Subtarefas
export const createSubtarefa = async (
  ocorrenciaId: number,
  data: { titulo: string; descricao?: string; responsavelId?: number }
) => {
  const response = await api.post(
    ENDPOINTS.CREATE_SUBTAREFA(ocorrenciaId),
    data
  );
  return response.data as Subtarefa;
};

export const editSubtarefa = async (
  ocorrenciaId: number,
  subId: number,
  data: { titulo: string; descricao?: string; responsavelId?: number }
) => {
  const response = await api.patch(
    ENDPOINTS.EDIT_SUBTAREFA(ocorrenciaId, subId),
    data
  );
  return response.data as Subtarefa;
};

export const deleteSubtarefa = async (ocorrenciaId: number, subId: number) => {
  await api.delete(ENDPOINTS.DELETE_SUBTAREFA(ocorrenciaId, subId));
};

// Atribuir ocorrência a um colaborador
export const assignOcorrencia = async (
  id: number,
  data: { colaboradorId: number }
) => {
  const response = await api.patch(ENDPOINTS.ASSIGN_OCORRENCIA(id), data);
  return response.data as Ocorrencia;
};

// Auto-atribuir ocorrência
export const autoAssignOcorrencia = async (id: number) => {
  try {
    const response = await api.patch(ENDPOINTS.AUTO_ASSIGN_OCORRENCIA(id));
    return response.data as Ocorrencia;
  } catch (error: any) {
    try {
      const response = await api.patch(ENDPOINTS.AUTO_ASSIGN_OCORRENCIA(id), {
        auto: true,
      });
      return response.data as Ocorrencia;
    } catch (error2: any) {
      const errorMessage =
        error2.response?.status === 404
          ? "Endpoint de auto-atribuição não encontrado no backend"
          : error2.response?.data?.message || error2.message;

      throw new Error(`Auto-atribuição não disponível: ${errorMessage}`);
    }
  }
};

// Atualizar status via Drag & Drop
export const updateStatusViaDrag = async (
  ocorrenciaId: number,
  statusId: number,
  statusChave?: string
): Promise<Ocorrencia> => {
  const endpoint = ENDPOINTS.UPDATE_STATUS_OCORRENCIA(ocorrenciaId);

  const payloads = [
    ...(statusChave ? [{ status: statusChave }] : []),
    { statusId: statusId },
    ...(statusChave ? [{ statusChave: statusChave }] : []),
    { status: { id: statusId } },
    { status_id: statusId },
  ];

  let lastError: any = null;

  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];

    try {
      const response = await api.patch(endpoint, payload);
      return response.data as Ocorrencia;
    } catch (error: any) {
      lastError = error;

      if (i < payloads.length - 1) {
        continue;
      }
    }
  }

  throw new Error(
    `Erro ao atualizar status: ${
      lastError?.response?.data?.message ||
      lastError?.message ||
      "Erro desconhecido"
    }`
  );
};

// Atualizar status da ocorrência
export const updateStatusOcorrencia = async (
  id: number,
  data: { statusId: number }
) => {
  const endpoint = ENDPOINTS.UPDATE_STATUS_OCORRENCIA(id);

  const statusChaveMap: Record<number, string> = {
    1: "em_atribuicao",
    2: "em_fila",
    3: "desenvolvimento",
    4: "aprovacao",
    5: "documentacao",
    6: "entregue",
    7: "em_execucao",
  };

  const statusChave = statusChaveMap[data.statusId];

  const payloads = [
    ...(statusChave ? [{ status: statusChave }] : []),
    { statusId: data.statusId },
    { status: { id: data.statusId } },
    { status_id: data.statusId },
  ];

  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];

    try {
      const response = await api.patch(endpoint, payload);
      return response.data as Ocorrencia;
    } catch (error: any) {
      if (i < payloads.length - 1) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Erro ao atualizar status da ocorrência");
};