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
  data: {
    titulo: string;
    descricao: string;
    setorId: number;
    statusId?: number; // Adicionar statusId como opcional
  }
) => {
  console.log(`✏️ Editando ocorrência ID ${id}`, data);
  const response = await api.patch(ENDPOINTS.EDIT_OCORRENCIA(id), data);
  console.log("✅ Ocorrência atualizada:", response.data);

  // Debug: verificar se o status foi atualizado
  if (data.statusId) {
    const statusAntes = data.statusId;
    const statusDepois = response.data.status?.id;
    console.log(
      `🔍 Status solicitado: ${statusAntes}, Status retornado: ${statusDepois}`
    );

    if (statusAntes !== statusDepois) {
      console.warn("⚠️ ATENÇÃO: Status não foi atualizado pelo backend!");
    } else {
      console.log("✅ Status atualizado corretamente!");
    }
  }
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
  const endpoint = ENDPOINTS.UPDATE_STATUS_OCORRENCIA(id);
  console.log(
    `🔄 Atualizando status da ocorrência ${id} para status ${data.statusId}`
  );
  console.log(`📍 Endpoint: ${endpoint}`);

  // Tentar diferentes formatos de payload
  const basePayloads = [
    { statusId: data.statusId }, // formato camelCase
    { status_id: data.statusId }, // formato snake_case
    { status: { id: data.statusId } }, // formato objeto aninhado
    { statusChave: data.statusId }, // formato com chave numérica
  ];

  // Tentar formatos com chave string baseados nos status disponíveis
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
  const chavePayloads = statusChave
    ? [
        { statusChave: statusChave }, // formato com chave string
        { status_chave: statusChave }, // formato snake_case chave
        { chave: statusChave }, // formato direto chave
        { status: statusChave }, // formato status como string
        { status: { id: data.statusId, chave: statusChave } }, // formato completo
      ]
    : [];

  const payloads = [...basePayloads, ...chavePayloads];

  for (let i = 0; i < payloads.length; i++) {
    const payload = payloads[i];
    console.log(`🔄 Tentativa ${i + 1}/${payloads.length} - Payload:`, payload);

    try {
      const response = await api.patch(endpoint, payload);
      console.log("✅ Status da ocorrência atualizado:", response.data);
      return response.data as Ocorrencia;
    } catch (error: any) {
      console.error(
        `❌ Tentativa ${i + 1} falhou:`,
        error.response?.data || error.message
      );

      // Se não é a última tentativa, continua
      if (i < payloads.length - 1) {
        console.log(`🔄 Tentando próximo formato...`);
        continue;
      }

      // Se chegou aqui, todas as tentativas falharam
      console.error("❌ Todas as tentativas falharam");
      console.error("📍 Endpoint usado:", endpoint);
      console.error("📦 Payloads testados:", payloads);
      throw error;
    }
  }
};
