"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { getSectors } from "../../api/services/sectors";
import { listUsers } from "../../api/services/usuario";
import { listStatus } from "../../api/services/status";

export interface FilterOptions {
  titulo?: string;
  setorId?: number;
  colaboradorId?: number;
  statusId?: number;
  gestorId?: number;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  showStatusFilter?: boolean;
  showCollaboratorFilter?: boolean;
  showGestorFilter?: boolean;
  className?: string;
  resultsCount?: number; // Contador de resultados
}

interface Setor {
  id: number;
  nome: string;
}

interface User {
  id: number;
  nome: string;
  email: string;
  perfil?: string;
}

interface Status {
  id: number;
  nome: string;
  chave?: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  showStatusFilter = true,
  showCollaboratorFilter = true,
  showGestorFilter = false,
  className = "",
  resultsCount,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Dados para os dropdowns
  const [setores, setSetores] = useState<Setor[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [gestores, setGestores] = useState<User[]>([]);

  // Estado de carregamento
  const [loading, setLoading] = useState(false);

  // Carregar dados para os filtros
  useEffect(() => {
    const loadFilterData = async () => {
      setLoading(true);
      try {
        // Carregar setores
        const setoresData = await getSectors();
        setSetores(setoresData);

        // Carregar usuários
        if (showCollaboratorFilter || showGestorFilter) {
          const usuariosData = await listUsers();
          setUsuarios(usuariosData);

          // Filtrar gestores
          if (showGestorFilter) {
            const gestoresData = usuariosData.filter(
              (user: User) =>
                user.perfil === "GESTOR" || user.perfil === "ADMIN"
            );
            setGestores(gestoresData);
          }
        }

        // Carregar status
        if (showStatusFilter) {
          const statusData = await listStatus();
          setStatusList(statusData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados dos filtros:", error);

        // Fallbacks em caso de erro
        setSetores([
          { id: 1, nome: "TI" },
          { id: 2, nome: "Financeiro" },
          { id: 3, nome: "RH" },
          { id: 4, nome: "Operações" },
        ]);

        setStatusList([
          { id: 1, nome: "em_atribuicao", chave: "em_atribuicao" },
          { id: 2, nome: "em_fila", chave: "em_fila" },
          { id: 3, nome: "desenvolvimento", chave: "desenvolvimento" },
          { id: 4, nome: "aprovacao", chave: "aprovacao" },
          { id: 5, nome: "documentacao", chave: "documentacao" },
          { id: 6, nome: "entregue", chave: "entregue" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadFilterData();
  }, [showCollaboratorFilter, showGestorFilter, showStatusFilter]);

  // Função para formatar nome do status
  const formatStatusName = (status: Status): string => {
    const specialCases: Record<string, string> = {
      em_atribuicao: "Em Atribuição",
      em_fila: "Em Fila",
      desenvolvimento: "Desenvolvimento",
      aprovacao: "Aprovação",
      documentacao: "Documentação",
      entregue: "Entregue",
      em_execucao: "Em Execução",
    };

    const key = status.chave || status.nome;
    return specialCases[key] || status.nome;
  };

  // Atualizar filtros
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };

    // Remove campos vazios
    Object.keys(newFilters).forEach((k) => {
      if (!newFilters[k as keyof FilterOptions]) {
        delete newFilters[k as keyof FilterOptions];
      }
    });

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  // Contar filtros ativos
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div
      className={`bg-white rounded-xl border-2 border-gray-200 ${className}`}
    >
      {/* Header do filtro */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[#4c010c]" />
            <h3 className="font-semibold text-gray-800">Filtros</h3>
            {activeFiltersCount > 0 && (
              <span className="bg-[#4c010c] text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            {resultsCount !== undefined && (
              <span className="text-sm text-gray-600">
                {resultsCount} resultado(s) encontrado(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {loading && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-[#4c010c] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-sm text-gray-500">
                Carregando filtros...
              </span>
            </div>
          )}

          {!loading && (
            <>
              {/* Pesquisa por título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por título
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Digite o título da ocorrência..."
                    value={filters.titulo || ""}
                    onChange={(e) => updateFilter("titulo", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro por setor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setor
                </label>
                <select
                  value={filters.setorId || ""}
                  onChange={(e) =>
                    updateFilter("setorId", Number(e.target.value) || null)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                >
                  <option value="">Todos os setores</option>
                  {setores.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por colaborador */}
              {showCollaboratorFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colaborador
                  </label>
                  <select
                    value={filters.colaboradorId || ""}
                    onChange={(e) =>
                      updateFilter(
                        "colaboradorId",
                        Number(e.target.value) || null
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                  >
                    <option value="">Todos os colaboradores</option>
                    {usuarios.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nome} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtro por gestor */}
              {showGestorFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gestor
                  </label>
                  <select
                    value={filters.gestorId || ""}
                    onChange={(e) =>
                      updateFilter("gestorId", Number(e.target.value) || null)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                  >
                    <option value="">Todos os gestores</option>
                    {gestores.map((gestor) => (
                      <option key={gestor.id} value={gestor.id}>
                        {gestor.nome} ({gestor.perfil})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtro por status */}
              {showStatusFilter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.statusId || ""}
                    onChange={(e) =>
                      updateFilter("statusId", Number(e.target.value) || null)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                  >
                    <option value="">Todos os status</option>
                    {statusList.map((status) => (
                      <option key={status.id} value={status.id}>
                        {formatStatusName(status)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
