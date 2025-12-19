import { useEffect, useState, useMemo } from "react";
import { listAuditLogs } from "../../api/services/audit";
import { listUsers } from "../../api/services/usuario";
import { listOcorrencias } from "../../api/services/ocorrencias";
import { listStatus } from "../../api/services/status";
import { listWorkflows } from "../../api/services/workflows";
import { listSetores } from "../../api/services/sectors";
import type { AuditLog, EnrichedAuditLog } from "../../api/types/audit";
import type { Ocorrencia } from "../../api/types/ocorrencia";
import { toast } from "sonner";
import { Search, Calendar, User, FileText, ChevronLeft, ChevronRight, Briefcase, Hash, } from "lucide-react";

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<EnrichedAuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);

  // Cache para evitar requisições duplicadas
  const [usersCache, setUsersCache] = useState<Map<number, any>>(new Map());
  const [ocorrenciasCache, setOcorrenciasCache] = useState<Map<number, Ocorrencia>>(new Map());
  const [statusCache, setStatusCache] = useState<Map<number, any>>(new Map());
  const [setoresCache, setSetoresCache] = useState<Map<number, any>>(new Map());
  const [workflowsCache, setWorkflowsCache] = useState<Map<number, any>>(new Map());

  useEffect(() => {
    loadAllData();
  }, [page]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // Carregar dados base em paralelo
      const [logsResponse, users, ocorrencias, status, setores, workflows] = await Promise.all([
        listAuditLogs(page, limit),
        listUsers().catch(() => []),
        listOcorrencias().catch(() => []),
        listStatus().catch(() => []),
        listSetores().catch(() => []),
        listWorkflows().catch(() => []),
      ]);

      // ✅ CORRIGIDO: Type casting explícito
      const newUsersCache = new Map<number, any>(users.map((u: any) => [u.id, u]));
      const newOcorrenciasCache = new Map<number, Ocorrencia>(ocorrencias.map((o: Ocorrencia) => [o.id, o]));
      const newStatusCache = new Map<number, any>(status.map((s: any) => [s.id, s]));
      const newSetoresCache = new Map<number, any>(setores.map((s: any) => [s.id, s]));
      const newWorkflowsCache = new Map<number, any>(workflows.map((w: any) => [w.id, w]));

      setUsersCache(newUsersCache);
      setOcorrenciasCache(newOcorrenciasCache);
      setStatusCache(newStatusCache);
      setSetoresCache(newSetoresCache);
      setWorkflowsCache(newWorkflowsCache);

      // Enriquecer logs
      const enrichedLogs = logsResponse.items.map((log: AuditLog) => {
        const enriched: EnrichedAuditLog = { ...log };

        // Adicionar dados do usuário (actor)
        if (log.actorId) {
          const user = newUsersCache.get(log.actorId);
          if (user) {
            enriched.actor = {
              id: user.id,
              nome: user.nome,
              email: user.email,
              perfil: user.perfil,
              setor: user.setor ? newSetoresCache.get(user.setor.id) : undefined,
            };
          }
        }

        // Adicionar detalhes do target
        switch (log.targetType) {
          case "ocorrencia":
            const ocorrencia = newOcorrenciasCache.get(log.targetId);
            if (ocorrencia) {
              enriched.targetDetails = {
                titulo: ocorrencia.titulo,
                colaborador_nome: ocorrencia.colaborador?.nome,
                setor_nome: ocorrencia.setor?.nome,
              };
            }
            break;

          case "user":
            const targetUser = newUsersCache.get(log.targetId);
            if (targetUser) {
              enriched.targetDetails = {
                nome: targetUser.nome,
                email: targetUser.email,
                perfil: targetUser.perfil,
              };
            }
            break;

          case "subtarefa":
            for (const occ of ocorrencias) {
              const subtarefa = occ.subtarefas?.find((s: any) => s.id === log.targetId);
              if (subtarefa) {
                enriched.targetDetails = {
                  titulo: subtarefa.titulo,
                  ocorrencia_titulo: occ.titulo,
                  responsavel_nome: subtarefa.responsavel?.nome,
                };
                break;
              }
            }
            break;

          case "setor":
            const setor = newSetoresCache.get(log.targetId);
            if (setor) {
              enriched.targetDetails = {
                nome: setor.nome,
              };
            }
            break;

          case "status":
            // ✅ CORRIGIDO: Type assertion para statusItem
            const statusItem = newStatusCache.get(log.targetId) as { nome?: string; chave?: string } | undefined;
            if (statusItem) {
              enriched.targetDetails = {
                nome: statusItem.nome || 'N/A',
                chave: statusItem.chave || 'N/A',
              };
            }
            break;

          case "workflow":
            const workflow = newWorkflowsCache.get(log.targetId);
            if (workflow) {
              enriched.targetDetails = {
                nome: workflow.nome,
              };
            }
            break;

          case "historico_status":
            for (const occ of ocorrencias) {
              const historico = occ.historicos?.find((h: any) => h.id === log.targetId);
              if (historico) {
                enriched.targetDetails = {
                  ocorrencia_titulo: occ.titulo,
                };
                break;
              }
            }
            break;
        }

        return enriched;
      });

      setLogs(enrichedLogs);
      setTotal(logsResponse.total);
    } catch (error) {
      toast.error("Erro ao carregar logs de auditoria");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getActionLabel = (action: string): string => {
    const actionMap: Record<string, string> = {
      create_ocorrencia: "Criou ocorrência",
      update_ocorrencia: "Atualizou ocorrência",
      update_ocorrencia_atribuir: "Atribuiu ocorrência",
      update_ocorrencia_status: "Mudou status",
      delete_ocorrencia: "Deletou ocorrência",
      transfer_ocorrencia: "Transferiu ocorrência",
      create_user: "Criou usuário",
      update_user_peso: "Atualizou peso do usuário",
      delete_user: "Deletou usuário",
      create_subtarefa: "Criou subtarefa",
      update_subtarefa: "Atualizou subtarefa",
      delete_subtarefa: "Deletou subtarefa",
      transfer_subtarefa: "Transferiu subtarefa",
      nullify_subtarefa_responsavel: "Removeu responsável",
      create_setor: "Criou setor",
      update_setor: "Atualizou setor",
      create_status: "Criou status",
      update_status: "Atualizou status",
      delete_status: "Deletou status",
      create_workflow: "Criou workflow",
      update_workflow: "Atualizou workflow",
      delete_workflow: "Deletou workflow",
      delete_historico: "Deletou histórico",
      delete_historico_status: "Deletou histórico de status",
    };
    return actionMap[action] || action;
  };

  const getActionColor = (action: string): string => {
    if (action.includes("create")) return "badge-create";
    if (action.includes("update")) return "badge-update";
    if (action.includes("delete")) return "badge-delete";
    if (action.includes("transfer")) return "badge-transfer";
    if (action.includes("nullify")) return "badge-nullify";
    return "badge-default";
  };

  const getTargetTypeLabel = (targetType: string): string => {
    const typeMap: Record<string, string> = {
      ocorrencia: "Ocorrência",
      user: "Usuário",
      subtarefa: "Subtarefa",
      setor: "Setor",
      status: "Status",
      workflow: "Workflow",
      historico_status: "Histórico",
    };
    return typeMap[targetType] || targetType;
  };

  const getTargetDescription = (log: EnrichedAuditLog): string => {
    if (!log.targetDetails) {
      return `#${log.targetId}`;
    }

    const details = log.targetDetails;

    switch (log.targetType) {
      case "ocorrencia":
        return details.titulo || `#${log.targetId}`;

      case "user":
        return details.nome || details.email || `#${log.targetId}`;

      case "subtarefa":
        return details.titulo
          ? `${details.titulo}${details.ocorrencia_titulo ? ` (${details.ocorrencia_titulo})` : ""}`
          : `#${log.targetId}`;

      case "setor":
        return details.nome || `#${log.targetId}`;

      case "status":
        return details.nome || details.chave || `#${log.targetId}`;

      case "workflow":
        return details.nome || `#${log.targetId}`;

      case "historico_status":
        return details.ocorrencia_titulo
          ? `Histórico de "${details.ocorrencia_titulo}"`
          : `#${log.targetId}`;

      default:
        return `#${log.targetId}`;
    }
  };

  const getUserDisplay = (log: EnrichedAuditLog) => {
    if (!log.actor) {
      return {
        name: "Sistema",
        subtitle: "Ação automática",
        icon: <Briefcase className="w-4 h-4 text-gray-400" />,
      };
    }

    return {
      name: log.actor.nome,
      subtitle: log.actor.setor?.nome || log.actor.perfil,
      icon: <User className="w-4 h-4 text-gray-400" />,
    };
  };

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetId.toString().includes(searchTerm) ||
        log.id.toString().includes(searchTerm) ||
        log.actor?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTargetDescription(log).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#4c010c] rounded-full animate-spin"></div>
            <div
              className="w-12 h-12 border-4 border-transparent border-t-red-300 rounded-full animate-spin absolute top-2 left-2"
              style={{ animationDuration: "0.8s" }}
            ></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando...</h2>
            <p className="text-gray-500">Buscando logs do sistema</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Logs de Auditoria</h1>
          <p className="text-gray-600">Acompanhe todas as ações realizadas no sistema</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar por ID, usuário, ação, tipo ou descrição..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all shadow-sm hover:shadow-md bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Nenhum log encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ação
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Alvo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Data/Hora
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => {
                      const userDisplay = getUserDisplay(log);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-mono font-medium text-gray-900">
                                {log.id}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getActionColor(log.action)}`}>
                              {getActionLabel(log.action)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {getTargetTypeLabel(log.targetType)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {getTargetDescription(log)}
                              </span>
                              {log.targetDetails?.colaborador_nome && (
                                <span className="text-xs text-gray-500">
                                  Colaborador: {log.targetDetails.colaborador_nome}
                                </span>
                              )}
                              {log.targetDetails?.responsavel_nome && (
                                <span className="text-xs text-gray-500">
                                  Responsável: {log.targetDetails.responsavel_nome}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              {userDisplay.icon}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  {userDisplay.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {userDisplay.subtitle}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-600">
                                {formatDate(log.createdAt)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de{" "}
                    {total} registros
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                      Página {page} de {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Logs;