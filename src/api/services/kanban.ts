// src/api/services/kanban.ts
import api from '../api';
import type { Column } from '../types/kanban';
import type { Ocorrencia } from '../types/ocorrencia';

export const getKanbanData = async (filters?: {
  titulo?: string;
  setorId?: number;
  status?: string;
  workflowId?: number;
  order?: string;
}): Promise<Column[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.titulo) params.append('titulo', filters.titulo);
    if (filters?.setorId) params.append('setorId', filters.setorId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.workflowId) params.append('workflowId', filters.workflowId.toString());
    if (filters?.order) params.append('order', filters.order);

    const queryString = params.toString();
    const ocorrenciasUrl = queryString ? `/ocorrencias?${queryString}` : '/ocorrencias';

    // ✅ Buscar ocorrências E status do banco
    const [ocorrenciasResponse, statusResponse] = await Promise.all([
      api.get(ocorrenciasUrl),
      api.get('/status'),
    ]);

    const ocorrencias: Ocorrencia[] = ocorrenciasResponse.data;
    const statusList = statusResponse.data;

    console.log('📊 Ocorrências retornadas:', ocorrencias);
    console.log('📋 Status retornados:', statusList);

    // ✅ Criar mapa de colunas a partir dos status do banco
    const columnsMap = new Map<number, Column>();

    // Primeiro, criar TODAS as colunas de status
    statusList.forEach((status: any) => {
      columnsMap.set(status.id, {
        id: `status-${status.id}`,
        titulo: status.nome,
        statusId: status.id,
        statusChave: status.chave,
        ordem: status.ordem || status.id,
        workflowId: status.workflowId || undefined,
        cards: [],
      });
    });

    // ✅ NOVO: Criar coluna "Sem Status" para ocorrências orfãs
    columnsMap.set(0, {
      id: 'sem_status',
      titulo: 'Sem Status',
      statusId: 0,
      statusChave: 'sem_status',
      ordem: 999,
      workflowId: undefined,
      cards: [],
    });

    // Depois, adicionar as ocorrências nas colunas
    ocorrencias.forEach((occ) => {
      const statusId = occ.status?.id;
      
      console.log(`🔍 Processando ocorrência ${occ.id}: status=${statusId}, statusNome=${occ.status?.nome}`);

      // ✅ Se a ocorrência tem status, adicionar na coluna correspondente
      if (statusId && columnsMap.has(statusId)) {
        const column = columnsMap.get(statusId)!;
        column.cards.push({
          id: `card-${occ.id}`,
          titulo: occ.titulo,
          descricao: occ.descricao,
          colaboradorNome: occ.colaborador?.nome,
          createdAt: occ.createdAt,
          statusId: statusId,
          statusNome: occ.status?.nome || 'Sem Status',
          ocorrencia: occ,
        });
        
        console.log(`✅ Card ${occ.id} adicionado à coluna ${column.titulo}`);
      } else {
        // ✅ Adicionar na coluna "Sem Status"
        const column = columnsMap.get(0)!;
        column.cards.push({
          id: `card-${occ.id}`,
          titulo: occ.titulo,
          descricao: occ.descricao,
          colaboradorNome: occ.colaborador?.nome,
          createdAt: occ.createdAt,
          statusId: 0,
          statusNome: 'Sem Status',
          ocorrencia: occ,
        });
        
        console.log(`✅ Card ${occ.id} adicionado à coluna "Sem Status"`);
      }
    });

    const result = Array.from(columnsMap.values()).sort((a, b) => a.ordem - b.ordem);
    console.log('✅ Colunas transformadas:', result);
    return result;
  } catch (error) {
    console.error('Erro ao buscar dados do Kanban:', error);
    throw error;
  }
};