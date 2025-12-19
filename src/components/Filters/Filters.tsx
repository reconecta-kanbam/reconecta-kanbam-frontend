import { useState, useEffect, useRef } from "react";
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

interface FiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  showStatusFilter?: boolean;
  showCollaboratorFilter?: boolean;
  showGestorFilter?: boolean;
  className?: string;
  resultsCount?: number;
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

const Filters: React.FC<FiltersProps> = ({
  onFiltersChange,
  showStatusFilter = true,
  showCollaboratorFilter = true,
  showGestorFilter = false,
  className = "",
  resultsCount,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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

  // Hook para detectar cliques fora do componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current && 
        !filterRef.current.contains(event.target as Node) &&
        isExpanded
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Hook para detectar tecla ESC
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isExpanded]);

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

  // Limpar todos os filtros (NÃO fecha o dropdown)
  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  // Alternar o dropdown de filtros
  const toggleFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Fechar o dropdown e limpar filtros (usado pelo X quando expandido)
  const closeFilters = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    clearFilters();
  };

  // Contar filtros ativos
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div ref={filterRef} className="pgKanbanBoard__workflowBar__right__filters__Filters">
      
      {/* Header do filtro */}
      <div className="pgKanbanBoard__workflowBar__right__filters__Filters__boxs">
        <div className="pgKanbanBoard__workflowBar__right__filters__Filters__boxs__box">
          {/* Ícone muda: Filter quando fechado, X quando aberto */}
          {isExpanded ? (
            <X 
              className="pgKanbanBoard__workflowBar__right__filters__Filters__boxs__box__iconFiltro pgKanbanBoard__workflowBar__right__filters__Filters__boxs__box__iconFiltro--close" 
              onClick={closeFilters}
            />
          ) : (
            <Filter 
              className="pgKanbanBoard__workflowBar__right__filters__Filters__boxs__box__iconFiltro"
              onClick={toggleFilters}
            />
          )}
          
          <h3 className="pgKanbanBoard__workflowBar__right__filters__Filters__boxs__box__title" onClick={toggleFilters}>Filtros</h3>

          {/* Badge de contagem quando há filtros ativos E não está expandido */}
          {activeFiltersCount > 0 && !isExpanded && (
            <span className="pgKanbanBoard__workflowBar__right__filters__Filters__boxs__box__badge">
              {activeFiltersCount}
            </span>
          )}
          
          <ChevronDown 
            className={`w-4 h-4 text-gray-500 transition-transform duration-300 cursor-pointer ${
              isExpanded ? "rotate-180" : ""
            }`}
            onClick={toggleFilters}
          />
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="pgKanbanBoard__workflowBar__right__filters__Filters__filter">
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
              <div className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__box">
                <label className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__label">
                  Buscar por título
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Digite o título da ocorrência..."
                    value={filters.titulo || ""}
                    onChange={(e) => updateFilter("titulo", e.target.value)}
                  />
                </div>
              </div>

              {/* Filtro por setor */}
              <div className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__box">
                <label className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__label">
                  Setor
                </label>
                <select
                  value={filters.setorId || ""}
                  onChange={(e) =>
                    updateFilter("setorId", Number(e.target.value) || null)
                  }
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
                <div className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__box">
                  <label className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__label">
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
                <div className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__box">
                  <label className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__label">
                    Gestor
                  </label>
                  <select
                    value={filters.gestorId || ""}
                    onChange={(e) =>
                      updateFilter("gestorId", Number(e.target.value) || null)
                    }
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
                <div className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__box">
                  <label className="pgKanbanBoard__workflowBar__right__filters__Filters__filter__label">
                    Status
                  </label>
                  <select
                    value={filters.statusId || ""}
                    onChange={(e) =>
                      updateFilter("statusId", Number(e.target.value) || null)
                    }
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

      {/* Resultado de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="pgKanbanBoard__workflowBar__right__filters__Filters__result">
          <span className="bg-[#4c010c] text-white text-xs px-2 py-1 rounded-full">
            {activeFiltersCount} - Resultado(s) Encontrado(s)
          </span>
          <button 
            onClick={clearFilters} 
            className="pgKanbanBoard__workflowBar__right__filters__Filters__result__button btn"
          >
            Limpar
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters;