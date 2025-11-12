import api from "../api";
import ENDPOINTS from "../endpoints";
import type { AuditLog, AuditLogsResponse } from "../types/audit";

export const listAuditLogs = async (
  page: number = 1,
  limit: number = 50
): Promise<AuditLogsResponse> => {
  const response = await api.get<AuditLogsResponse>(ENDPOINTS.AUDIT_LOGS || "/audit", {
    params: { page, limit }
  });
  return response.data;
};