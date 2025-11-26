import api from "../api";
import ENDPOINTS from "../endpoints";
import {
  Ocorrencia,
  CreateOcorrenciaRequest,
  Subtarefa,
} from "../types/ocorrencia";

// Criar nova ocorrência
export const createOcorrencia = async (data: CreateOcorrenciaRequest) => {
  console.log("📤 Criando ocorrência:", data);

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

  console.log("📦 Payload final:", payload);

  const response = await api.post(ENDPOINTS.CREATE_OCORRENCIA, payload);
  console.log("✅ Ocorrência criada:", response.data);
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
  console.log("📤 Criando ocorrência pública:", data);

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
  console.log("✅ Ocorrência pública criada:", response.data);
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
  console.log("📥 Buscando ocorrências com filtros:", filters || {});

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
  console.log(
    `✅ ${response.data.length} ocorrências carregadas com filtros:`,
    cleanFilters
  );
  return response.data as Ocorrencia[];
};

// Listar por usuário
export const listOcorrenciasByUser = async (userId: number) => {
  console.log(`📥 Buscando ocorrências do usuário ${userId}`);
  const response = await api.get(ENDPOINTS.GET_OCORRENCIA_BY_USER(userId));
  console.log("✅ Ocorrências do usuário:", response.data);
  return response.data as Ocorrencia[];
};

// Deletar
export const deleteOcorrencia = async (id: number) => {
  console.log("🗑️ Deletando ocorrência ID:", id);
  await api.delete(ENDPOINTS.DELETE_OCORRENCIA(id));
  console.log("✅ Ocorrência deletada");
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
  console.log(`✏️ Editando ocorrência ID ${id}`, data);

  // Montar payload
  const payload: any = {};
  if (data.titulo !== undefined) payload.titulo = data.titulo;
  if (data.descricao !== undefined) payload.descricao = data.descricao;
  if (data.setorId !== undefined) payload.setorId = data.setorId;
  
  // CORREÇÃO: Sempre enviar esses campos para garantir que sejam atualizados
  // Usa ?? para incluir string vazia, diferente de || que ignoraria ""
  payload.documentacaoUrl = data.documentacaoUrl ?? "";
  payload.descricaoExecucao = data.descricaoExecucao ?? "";

  console.log("📦 Payload de edição:", payload);

  const response = await api.patch(ENDPOINTS.EDIT_OCORRENCIA(id), payload);
  console.log("✅ Ocorrência atualizada:", response.data);

  // Se statusId foi passado, atualizar status separadamente
  if (data.statusId !== undefined) {
    console.log(`🔄 Atualizando status para ${data.statusId}`);
    await updateStatusOcorrencia(id, { statusId: data.statusId });
  }

  return response.data as Ocorrencia;
};

// Subtarefas
export const createSubtarefa = async (
  ocorrenciaId: number,
  data: { titulo: string; descricao?: string; responsavelId?: number }
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

// Atribuir ocorrência a um colaborador
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

// Auto-atribuir ocorrência
export const autoAssignOcorrencia = async (id: number) => {
  console.log(`🤖 Auto-atribuindo ocorrência ${id}`);

  try {
    console.log("🔄 Tentativa 1: Endpoint auto-atribuição sem payload");
    const response = await api.patch(ENDPOINTS.AUTO_ASSIGN_OCORRENCIA(id));
    console.log("✅ Ocorrência auto-atribuída (sem payload):", response.data);
    return response.data as Ocorrencia;
  } catch (error: any) {
    console.warn(
      "⚠️ Endpoint sem payload falhou:",
      error.response?.data || error.message
    );

    try {
      console.log(
        "🔄 Tentativa 2: Endpoint auto-atribuição com payload auto: true"
      );
      const response = await api.patch(ENDPOINTS.AUTO_ASSIGN_OCORRENCIA(id), {
        auto: true,
      });
      console.log(
        "✅ Ocorrência auto-atribuída (com auto: true):",
        response.data
      );
      return response.data as Ocorrencia;
    } catch (error2: any) {
      console.warn(
        "⚠️ Endpoint com auto: true falhou:",
        error2.response?.data || error2.message
      );

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

  console.log("═══════════════════════════════════════════════════");
  console.log(`🎯 DRAG & DROP: Atualizando Ocorrência #${ocorrenciaId}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  console.log(`🏷️  Status ID: ${statusId}`);
  console.log(`🔑 Status Chave: ${statusChave || "não fornecida"}`);
  console.log("═══════════════════════════════════════════════════");

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

    console.log(`\n🔄 Tentativa ${i + 1}/${payloads.length}`);
    console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));

    try {
      const response = await api.patch(endpoint, payload);

      console.log("\n✅ SUCESSO! Status atualizado");
      console.log("📥 Resposta do backend:", response.data);

      if (response.data.status?.id === statusId) {
        console.log("✅ Status confirmado no retorno!");
      } else {
        console.warn("⚠️ Status retornado diferente do esperado");
        console.warn(
          `   Esperado: ${statusId}, Recebido: ${response.data.status?.id}`
        );
      }

      console.log(
        "═══════════════════════════════════════════════════\n"
      );
      return response.data as Ocorrencia;
    } catch (error: any) {
      lastError = error;

      console.error(`❌ Tentativa ${i + 1} falhou`);
      console.error(`   Status HTTP: ${error.response?.status}`);
      console.error(
        `   Mensagem: ${error.response?.data?.message || error.message}`
      );
      console.error(`   Dados completos:`, error.response?.data);

      if (i < payloads.length - 1) {
        console.log("   → Tentando próximo formato...");
        continue;
      }
    }
  }

  console.error("\n❌ TODAS AS TENTATIVAS FALHARAM");
  console.error("═══════════════════════════════════════════════════");
  console.error("📍 Endpoint testado:", endpoint);
  console.error("📦 Payloads testados:", JSON.stringify(payloads, null, 2));
  console.error(
    "❌ Último erro:",
    lastError?.response?.data || lastError?.message
  );
  console.error("═══════════════════════════════════════════════════\n");

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
  console.log(
    `🔄 Atualizando status da ocorrência ${id} para status ${data.statusId}`
  );
  console.log(`📍 Endpoint: ${endpoint}`);

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
    console.log(`🔄 Tentativa ${i + 1}/${payloads.length} - Payload:`, payload);

    try {
      const response = await api.patch(endpoint, payload);
      console.log("✅ Status da ocorrência atualizado:", response.data);

      if (response.data.status?.id === data.statusId) {
        console.log("✅ Status confirmado no retorno!");
      } else {
        console.warn("⚠️ Status retornado diferente do esperado");
        console.warn(
          `   Esperado: ${data.statusId}, Recebido: ${response.data.status?.id}`
        );
      }

      return response.data as Ocorrencia;
    } catch (error: any) {
      console.error(
        `❌ Tentativa ${i + 1} falhou:`,
        error.response?.data || error.message
      );

      if (i < payloads.length - 1) {
        console.log(`🔄 Tentando próximo formato...`);
        continue;
      }

      console.error("❌ Todas as tentativas falharam");
      console.error("📍 Endpoint usado:", endpoint);
      console.error("📦 Payloads testados:", payloads);
      throw error;
    }
  }

  throw new Error("Erro ao atualizar status da ocorrência");
};