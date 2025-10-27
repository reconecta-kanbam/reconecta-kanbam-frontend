"use client";

import { useEffect, useState } from "react";
import type { Ocorrencia } from "../../api/types/ocorrencia";
import { listOcorrencias } from "../../api/services/ocorrencias";
import api from "../../api/api";
import ENDPOINTS from "../../api/endpoints";
import { Search, Eye, Layers, Calendar } from "lucide-react";
import OcorrenciaActions from "./OcorrenciaActions";
import TaskDetailDialog from "../kanbanBoard/dialogs/TaskDetailDialog";
import EditOcorrenciaDialog from "./EditOcorrenciaDialog";
import AdvancedFilters, { FilterOptions } from "../ui/AdvancedFilters";

const ListarOcorrencias = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOcorrencia, setSelectedOcorrencia] =
    useState<Ocorrencia | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editOcorrenciaId, setEditOcorrenciaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Função para carregar ocorrências com filtros
  const fetchOcorrencias = async (currentFilters: FilterOptions = {}) => {
    try {
      setLoading(true);
      console.log("🔍 Carregando ocorrências com filtros:", currentFilters);

      // Usar o serviço com filtros se houver filtros ativos
      const hasFilters = Object.keys(currentFilters).length > 0;

      if (hasFilters) {
        const data = await listOcorrencias(currentFilters);
        setOcorrencias(data);
      } else {
        // Fallback para a API direta se não houver filtros
        const response = await api.get(ENDPOINTS.LIST_OCORRENCIAS);
        setOcorrencias(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar ocorrências:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOcorrencias(filters);
  }, [filters]);

  // Função para atualizar filtros
  const handleFiltersChange = (newFilters: FilterOptions) => {
    console.log("🔄 Filtros atualizados:", newFilters);
    setFilters(newFilters);
  };

  const handleAddSubtask = async (
    ocorrenciaId: number,
    subtask: { titulo: string; descricao: string }
  ) => {
    try {
      const responsavelId = 10; // exemplo fixo
      const response = await api.post(
        ENDPOINTS.CREATE_SUBTAREFA(ocorrenciaId),
        { ...subtask, responsavelId }
      );

      const createdSubtask = {
        id: response.data.id,
        titulo: response.data.titulo,
        descricao: response.data.descricao,
        status: response.data.status,
        createdAt: response.data.createdAt,
        responsavel: response.data.responsavel
          ? {
              id: response.data.responsavel.id,
              nome: response.data.responsavel.nome,
              email: response.data.responsavel.email,
            }
          : undefined,
      };

      setOcorrencias((prev) =>
        prev.map((o) =>
          o.id === ocorrenciaId
            ? { ...o, subtarefas: [...o.subtarefas, createdSubtask] }
            : o
        )
      );
    } catch (error) {
      console.error("Erro ao adicionar subtarefa:", error);
    }
  };

  const filteredOcorrencias = ocorrencias
    .filter(
      (o) =>
        o.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!searchTerm) return 0; // Sem ordenação se não há busca

      const searchLower = searchTerm.toLowerCase();
      const aTitleMatch = a.titulo.toLowerCase().includes(searchLower);
      const bTitleMatch = b.titulo.toLowerCase().includes(searchLower);

      // Priorizar matches no título sobre matches na descrição
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      // Se ambos ou nenhum match no título, manter ordem original
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ocorrências</h1>
          <p className="text-gray-600">
            Gerencie e acompanhe todas as ocorrências do sistema
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-[#4c010c] rounded-full animate-spin"></div>
                <div
                  className="w-12 h-12 border-4 border-transparent border-t-red-300 rounded-full animate-spin absolute top-2 left-2"
                  style={{ animationDuration: "0.8s" }}
                ></div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Carregando...
                </h2>
                <p className="text-gray-500">Buscando as ocorrências</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filtros Avançados */}
            <AdvancedFilters
              onFiltersChange={handleFiltersChange}
              showStatusFilter={true}
              showCollaboratorFilter={true}
              showGestorFilter={true}
              className="mb-6"
            />

            {/* Search */}
            <div className="mb-8 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar ocorrências..."
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all shadow-sm hover:shadow-md bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Cards */}
            <div className="grid gap-5">
              {filteredOcorrencias.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                  <p className="text-gray-600 text-lg font-medium">
                    Nenhuma ocorrência encontrada
                  </p>
                </div>
              ) : (
                filteredOcorrencias.map((ocorrencia) => (
                  <div
                    key={ocorrencia.id}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 transition-all hover:shadow-xl hover:border-[#4c010c]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {ocorrencia.titulo}
                      </h3>
                      <span className="bg-[#ffffa6] text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-300">
                        #{ocorrencia.id}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-2 line-clamp-2">
                      {ocorrencia.descricao}
                    </p>
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      Colaborador: {ocorrencia.colaborador?.nome}
                    </p>
                    <p className="text-gray-600 mb-2 line-clamp-2">
                      Gestor: {ocorrencia.gestor?.nome}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#4c010c]/10 text-[#4c010c] px-3 py-1 rounded-full border border-[#4c010c]/20">
                          <Layers className="w-4 h-4" />
                          <span className="font-medium">
                            {ocorrencia.subtarefas.length} subtarefas
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ocorrencia.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex justify-end gap-2 mt-4">
                      {/* Ver detalhes */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOcorrencia(ocorrencia);
                          setIsDialogOpen(true);
                        }}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>

                      {/* Deletar */}
                      <OcorrenciaActions
                        id={ocorrencia.id}
                        onDeleted={(deletedId) => {
                          setOcorrencias((prev) =>
                            prev.filter((o) => o.id !== deletedId)
                          );
                          if (selectedOcorrencia?.id === deletedId) {
                            setIsDialogOpen(false);
                            setSelectedOcorrencia(null);
                          }
                        }}
                        onEdit={(id) => setEditOcorrenciaId(id)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Modal de detalhes com formulário de subtarefa */}
        {selectedOcorrencia && (
          <TaskDetailDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setSelectedOcorrencia(null);
            }}
            ocorrencia={selectedOcorrencia}
            onAddSubtask={handleAddSubtask} // agora incluído
          />
        )}

        {editOcorrenciaId !== null && (
          <EditOcorrenciaDialog
            open={true}
            onOpenChange={(open) => {
              if (!open) setEditOcorrenciaId(null);
            }}
            ocorrencia={
              ocorrencias.find((o) => o.id === editOcorrenciaId) || null
            }
            onUpdated={(updated) => {
              setOcorrencias((prev) =>
                prev.map((o) =>
                  o.id === updated.id
                    ? {
                        ...updated,
                        subtarefas: updated.subtarefas || [],
                        colaborador: updated.colaborador || {
                          id: 0,
                          nome: "-",
                          email: "",
                          perfil: "",
                        },
                        gestor: updated.gestor || {
                          id: 0,
                          nome: "-",
                          email: "",
                          perfil: "",
                        },
                        setor: updated.setor || { id: 0, nome: "-" },
                      }
                    : o
                )
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ListarOcorrencias;
