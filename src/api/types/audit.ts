export interface AuditLog {
  id: number;
  actorId: number | null;
  action: string;
  targetType: string;
  targetId: number;
  createdAt: string;
}

export interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

// Tipos enriquecidos (frontend only)
export interface EnrichedAuditLog extends AuditLog {
  actor?: {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    setor?: {
      id: number;
      nome: string;
    };
  } | null;
  targetDetails?: any;
}