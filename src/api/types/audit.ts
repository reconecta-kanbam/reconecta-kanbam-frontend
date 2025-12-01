// src/api/types/audit.ts

export interface AuditLog {
  id: number;
  action: string;
  targetType: string;
  targetId: number;
  actorId: number | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

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
  };
  targetDetails?: {
    titulo?: string;
    nome?: string;
    email?: string;
    perfil?: string;
    chave?: string;
    colaborador_nome?: string;
    responsavel_nome?: string;
    setor_nome?: string;
    ocorrencia_titulo?: string;
  };
}

export interface AuditLogResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}