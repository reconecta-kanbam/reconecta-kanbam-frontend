import api from "../api";
import ENDPOINTS from "../endpoints";
import {
  Ocorrencia,
  CreateOcorrenciaRequest,
  Subtarefa,
} from "../types/ocorrencia";

// 🟢 Criar nova ocorrência
export const createOcorrencia = async (data: CreateOcorrenciaRequest) => {
  console.log("📤 Criando ocorrência:", data);
  const response = await api.post(ENDPOINTS.CREATE_OCORRENCIA, data);
  console.log("✅ Ocorrência criada:", response.data);
  return response.data as Ocorrencia;
};

// 🟢 Criar ocorrência pública
export const createOcorrenciaPublic = async (data: {
  titulo: string;
  descricao: string;
  colaboradorNome: string;
  setorId: number;
}) => {
  console.log("📤 Criando ocorrência pública:", data);
  const response = await api.post(ENDPOINTS.CREATE_OCORRENCIA_PUBLIC, data);
  console.log("✅ Ocorrência pública criada:", response.data);
  return response.data as Ocorrencia;
};

// 🟡 Listar ocorrências (com filtros opcionais)
export const listOcorrencias = async (filters?: {
  titulo?: string;
  setorId?: number;
}) => {
  console.log("📥 Buscando ocorrências com filtros:", filters || {});
  const response = await api.get(ENDPOINTS.LIST_OCORRENCIAS, {
    params: filters,
  });
  console.log(`✅ ${response.data.length} ocorrências carregadas`);
  return response.data as Ocorrencia[];
};

// 🟣 Listar por usuário
export const listOcorrenciasByUser = async (userId: number) => {
  console.log(`📥 Buscando ocorrências do usuário ${userId}`);
  const response = await api.get(ENDPOINTS.GET_OCORRENCIA_BY_USER(userId));
  console.log("✅ Ocorrências do usuário:", response.data);
  return response.data as Ocorrencia[];
};

// 🔴 Deletar
export const deleteOcorrencia = async (id: number) => {
  console.log("🗑️ Deletando ocorrência ID:", id);
  await api.delete(ENDPOINTS.DELETE_OCORRENCIA(id));
  console.log("✅ Ocorrência deletada");
};

// ✏️ Editar ocorrência
export const editOcorrencia = async (
  id: number,
  data: { titulo: string; descricao: string; setorId: number }
) => {
  console.log(`✏️ Editando ocorrência ID ${id}`, data);
  const response = await api.patch(
    ENDPOINTS.CREATE_OCORRENCIA + `/${id}`,
    data
  );
  console.log("✅ Ocorrência atualizada:", response.data);
  return response.data as Ocorrencia;
};

// 🧩 Subtarefas
export const createSubtarefa = async (
  ocorrenciaId: number,
  data: { titulo: string; descricao?: string; responsavelId: number }
) => {
  console.log("📎 Criando subtarefa:", data);
  const response = await api.post(
    ENDPOINTS.CREATE_SUBTAREFA(ocorrenciaId),
    data
  );
  console.log("✅ Subtarefa criada:", response.data);
  return response.data as Subtarefa;
};

export const editSubtarefa = async (
  ocorrenciaId: number,
  subId: number,
  data: { titulo: string; descricao?: string; responsavelId?: number }
) => {
  console.log(`✏️ Editando subtarefa ${subId} da ocorrência ${ocorrenciaId}`);
  const response = await api.patch(
    ENDPOINTS.EDIT_SUBTAREFA(ocorrenciaId, subId),
    data
  );
  console.log("✅ Subtarefa atualizada:", response.data);
  return response.data as Subtarefa;
};

export const deleteSubtarefa = async (ocorrenciaId: number, subId: number) => {
  console.log(`🗑️ Deletando subtarefa ${subId} da ocorrência ${ocorrenciaId}`);
  await api.delete(ENDPOINTS.DELETE_SUBTAREFA(ocorrenciaId, subId));
  console.log("✅ Subtarefa deletada");
};

// 👤 Atribuir ocorrência a um colaborador
export const assignOcorrencia = async (
  id: number,
  data: { colaboradorId: number }
) => {
  console.log(
    `👤 Atribuindo ocorrência ${id} ao colaborador ${data.colaboradorId}`
  );
  const response = await api.patch(ENDPOINTS.ASSIGN_OCORRENCIA(id), data);
  console.log("✅ Ocorrência atribuída:", response.data);
  return response.data as Ocorrencia;
};

// 🔄 Atualizar status da ocorrência
export const updateStatusOcorrencia = async (
  id: number,
  data: { statusId: number }
) => {
  console.log(
    `🔄 Atualizando status da ocorrência ${id} para status ${data.statusId}`
  );
  const response = await api.patch(
    ENDPOINTS.UPDATE_STATUS_OCORRENCIA(id),
    data
  );
  console.log("✅ Status da ocorrência atualizado:", response.data);
  return response.data as Ocorrencia;
};
