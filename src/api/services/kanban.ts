// src/api/services/kanban.ts
import api from "../api";
import { Column, Card, Status } from "../types/kanban";
import { Ocorrencia } from "../types/ocorrencia";
import { listStatus } from "./status";
export interface KanbanFilters {
  titulo?: string;
  setorId?: number;
  colaboradorId?: number;
  statusId?: number;
  gestorId?: number;
  workflowId?: number; // ✅ JÁ EXISTE
}

export const getKanbanData = async (filters?: KanbanFilters): Promise<Column[]> => {
  try {
    console.log("📋 [KANBAN] Buscando status e ocorrências com filtros:", filters || {});

    // 1. Buscar todos os status (se houver filtro de workflow, filtrar aqui)
    const statusList = await listStatus();

    if (!statusList || statusList.length === 0) {
      console.warn("⚠️ Nenhum status encontrado no backend.");
      return [];
    }

    // 👇 FILTRAR STATUS POR WORKFLOW (se aplicável)
    const filteredStatus = filters?.workflowId 
      ? statusList.filter(s => s.workflowId === filters.workflowId)
      : statusList;

    console.log(`✅ [KANBAN] ${filteredStatus.length} status carregados (filtrados por workflow):`, filteredStatus);

    // 2. Buscar ocorrências com filtros
    const params: any = {};
    if (filters?.titulo) params.titulo = filters.titulo;
    if (filters?.setorId) params.setorId = filters.setorId;
    if (filters?.colaboradorId) params.colaboradorId = filters.colaboradorId;
    if (filters?.statusId) params.statusId = filters.statusId;
    if (filters?.gestorId) params.gestorId = filters.gestorId;
    if (filters?.workflowId) params.workflowId = filters.workflowId; // 👈 FILTRO DE WORKFLOW

    const ocorrenciasResponse = await api.get<Ocorrencia[]>("/ocorrencias", { params });
    const ocorrencias = ocorrenciasResponse.data;

    console.log(`✅ [KANBAN] ${ocorrencias.length} ocorrências carregadas.`);

    // 3. Criar colunas baseadas nos status FILTRADOS
    const columns: Column[] = filteredStatus.map((status) => {
      const statusOcorrencias = ocorrencias.filter((occ) => {
        if (!occ.status) return false;
        return occ.status.id === status.id;
      });

      const cards: Card[] = statusOcorrencias.map((occ) => ({
        id: String(occ.id),
        titulo: occ.titulo,
        descricao: occ.descricao,
        colaboradorNome: occ.colaborador?.nome || "Não atribuído",
        email: occ.colaborador?.email || "",
        ocorrencia: occ,
        createdAt: occ.createdAt,
        statusId: status.id,
        statusNome: status.nome,
      }));

      return {
        id: status.chave,
        titulo: status.nome,
        statusId: status.id,
        statusChave: status.chave,
        ordem: status.ordem,
        workflowId: status.workflowId, // 👈 INCLUIR workflowId
        cards,
      };
    });

    // 4. Ordenar colunas por ordem
    const sortedColumns = columns.sort((a, b) => a.ordem - b.ordem);

    console.log("📊 [KANBAN] Colunas geradas:", sortedColumns);
    return sortedColumns;
  } catch (error) {
    console.error("❌ [KANBAN] Erro ao buscar dados:", error);
    throw error;
  }
};