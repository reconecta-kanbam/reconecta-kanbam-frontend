import { useEffect, useState } from "react";
import { listOcorrencias, deleteOcorrencia } from "../../api/services/ocorrencias";
import type { Ocorrencia } from "../../api/types/ocorrencia";
import { toast } from "sonner";
import { Plus, Search, Eye, Calendar, Trash2, Edit2, Link, FileCheck } from "lucide-react";
import Filters, { FilterOptions } from "../Filters/Filters";
import TaskDetailDialog from "../kanbanBoard/dialogs/TaskDetailDialog";
import ConfirmDialog from "../../ErrorMessage/services/btnDelete";
import EditOccurrence from "./EditOccurrence";

const Occurrences: React.FC = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);

  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ocorrenciaToEdit, setOcorrenciaToEdit] = useState<Ocorrencia | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  
  useEffect(() => {
    loadOcorrencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadOcorrencias = async () => {
    try {
      setLoading(true);
      const ocorrenciasData = await listOcorrencias(filters);
      setOcorrencias(ocorrenciasData);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
      toast.error("Erro ao carregar ocorrências");
    } finally {
      setLoading(false);
    }
  };

  const updateOcorrenciaInState = (updatedOcorrencia: Ocorrencia) => {
    setOcorrencias(prev =>
      prev.map(occ => occ.id === updatedOcorrencia.id ? updatedOcorrencia : occ)
    );
    if (selectedOcorrencia?.id === updatedOcorrencia.id) {
      setSelectedOcorrencia(updatedOcorrencia);
    }
  };

  const removeOcorrenciaFromState = (ocorrenciaId: number) => {
    setOcorrencias(prev => prev.filter(occ => occ.id !== ocorrenciaId));
  };

  const handleOpenCreateModal = () => {
    setOcorrenciaToEdit(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (ocorrencia: Ocorrencia) => {
    setOcorrenciaToEdit(ocorrencia);
    setIsEditModalOpen(true);
  };

  const handleSuccess = () => {
    loadOcorrencias();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOcorrencia(id);
      removeOcorrenciaFromState(id);
      toast.success("Ocorrência deletada com sucesso!");
      setConfirmDelete({ open: false, id: null });
    } catch (error) {
      console.error("Erro ao deletar ocorrência:", error);
      toast.error("Erro ao deletar ocorrência");
    }
  };

  const filteredOcorrencias = ocorrencias.filter(
    (o) =>
      o.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-gray-500">Buscando dados do sistema</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Gerenciar Ocorrências</h1>
            <p className="text-gray-600">Crie, edite e acompanhe todas as ocorrências do sistema</p>
          </div>
          <button 
            onClick={handleOpenCreateModal} 
            className="px-6 py-3 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Ocorrência
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <Filters
            onFiltersChange={(newFilters) => setFilters(newFilters)}
            showStatusFilter={true}
            showCollaboratorFilter={true}
            showGestorFilter={true}
          />

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar ocorrências..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all shadow-sm hover:shadow-md bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredOcorrencias.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-gray-600 text-lg font-medium">Nenhuma ocorrência encontrada</p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-6 py-2 bg-[#4c010c] text-white rounded-lg hover:bg-[#3a0109] transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar primeira ocorrência
              </button>
            </div>
          ) : (
            filteredOcorrencias.map((ocorrencia) => (
              <div
                key={ocorrencia.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-[#4c010c] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{ocorrencia.titulo}</h3>
                    <p className="text-gray-600 mt-2 line-clamp-2">{ocorrencia.descricao}</p>
                  </div>
                  <span className="bg-[#ffffa6] text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-300 ml-4">
                    #{ocorrencia.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Setor:</span>
                    <p className="font-medium text-gray-800">{ocorrencia.setor?.nome || "N/A"}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium text-gray-800">{ocorrencia.status?.nome || "N/A"}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Colaborador:</span>
                    <p className="font-medium text-gray-800">{ocorrencia.colaborador?.nome || "Não atribuído"}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Gestor:</span>
                    <p className="font-medium text-gray-800">{ocorrencia.gestor?.nome || "N/A"}</p>
                  </div>
                </div>

                {(ocorrencia.documentacaoUrl || ocorrencia.descricaoExecucao) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {ocorrencia.documentacaoUrl && (
                      <div className="flex items-start gap-2 text-sm">
                        <Link className="w-4 h-4 text-[#4c010c] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-gray-500 block">Documentação:</span>
                          <a
                            href={ocorrencia.documentacaoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                          >
                            {ocorrencia.documentacaoUrl}
                          </a>
                        </div>
                      </div>
                    )}

                    {ocorrencia.descricaoExecucao && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileCheck className="w-4 h-4 text-[#4c010c] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-gray-500 block">Execução:</span>
                          <p className="text-gray-700 line-clamp-2">{ocorrencia.descricaoExecucao}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR")}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOcorrencia(ocorrencia);
                        setIsDialogOpen(true);
                      }}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(ocorrencia)}
                      className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5 text-yellow-600" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ open: true, id: ocorrencia.id })}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <EditOccurrence
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        ocorrencia={ocorrenciaToEdit}
        onSuccess={handleSuccess}
      />

      {selectedOcorrencia && (
        <TaskDetailDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedOcorrencia(null);
          }}
          ocorrencia={selectedOcorrencia}
          onUpdate={updateOcorrenciaInState}
        />
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, id: null })}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
      />
    </div>
  );
};

export default Occurrences;