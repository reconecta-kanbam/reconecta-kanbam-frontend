// src/api/services/audit.ts

import api from "../api";
import ENDPOINTS from "../endpoints";
import type { AuditLogResponse } from "../types/audit";

// Listar logs de auditoria com paginação
export const listAuditLogs = async (
  page: number = 1,
  limit: number = 50
): Promise<AuditLogResponse> => {
  const response = await api.get<AuditLogResponse>(ENDPOINTS.AUDIT_LOGS, {
    params: { page, limit },
  });
  
  // Ordenar por ID decrescente (mais recente primeiro)
  response.data.items.sort((a, b) => b.id - a.id);
  
  return response.data;
};

// Buscar log por ID (se necessário)
export const getAuditLogById = async (id: number): Promise<AuditLogResponse> => {
  const response = await api.get<AuditLogResponse>(`${ENDPOINTS.AUDIT_LOGS}/${id}`);
  return response.data;
};