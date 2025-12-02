import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listWorkflows, deleteWorkflow } from "../../api/services/workflows";
import type { Workflow } from "../../api/types/workflow";
import { toast } from "sonner";
import { Folder, Plus, Edit2, Trash2, ArrowRight, Layers, Clock, Calendar } from "lucide-react";
import ConfirmDialog from "../../ErrorMessage/services/btnDelete";
import CriarWorkflow from "./CreateWorkflow";
import EditarWorkflow from "./EditWorkflow";

const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [workflowToEdit, setWorkflowToEdit] = useState<Workflow | null>(null);

  // Confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: number | null;
    nome: string;
  }>({ open: false, id: null, nome: "" });

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (error) {
      toast.error("Erro ao carregar workflows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleOpenEditModal = (workflow: Workflow) => {
    setWorkflowToEdit(workflow);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (confirmDelete.id === null) return;

    try {
      await deleteWorkflow(confirmDelete.id);
      toast.success(`Workflow "${confirmDelete.nome}" deletado com sucesso!`);
      setWorkflows((prev) => prev.filter((w) => w.id !== confirmDelete.id));
      setConfirmDelete({ open: false, id: null, nome: "" });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao deletar workflow";
      toast.error(errorMessage);
    }
  };

  const handleViewWorkflow = (workflowId: number) => {
    navigate(`/kanban-board?workflowId=${workflowId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            <p className="text-gray-500">Buscando seus workflows</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Workflows</h1>
              <p className="text-gray-600">
                Organize suas ocorrências em projetos e fluxos de trabalho
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-[#4c010c] text-white px-6 py-3 rounded-lg hover:bg-[#3a0109] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Novo Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Folder className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Nenhum workflow criado
              </h2>
              <p className="text-gray-600 mb-6">
                Crie seu primeiro workflow para começar a organizar suas ocorrências
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#4c010c] text-white px-6 py-3 rounded-lg hover:bg-[#3a0109] transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Workflow
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all border-2 border-gray-200 hover:border-[#4c010c] overflow-hidden group transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-[#4c010c] to-[#8b0000] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(workflow);
                          }}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                          title="Editar workflow"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({
                              open: true,
                              id: workflow.id,
                              nome: workflow.nome,
                            });
                          }}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                          title="Deletar workflow"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 truncate">{workflow.nome}</h3>

                    {workflow.descricao && (
                      <p className="text-white/90 text-sm line-clamp-2">
                        {workflow.descricao}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-[#4c010c]" />
                      <span>Criado em {formatDate(workflow.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#4c010c]" />
                      <span>Atualizado em {formatDate(workflow.updatedAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewWorkflow(workflow.id)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-[#4c010c] hover:text-white transition-all font-medium group"
                  >
                    <span>Abrir Workflow</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      <CriarWorkflow
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={loadWorkflows}
      />

      <EditarWorkflow
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        workflow={workflowToEdit}
        onSuccess={loadWorkflows}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, id: null, nome: "" })}
        title="Excluir Workflow"
        description={`Tem certeza que deseja deletar "${confirmDelete.nome}"? Todas as ocorrências associadas perderão a referência a este workflow.`}
        confirmText="Deletar"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Workflows;