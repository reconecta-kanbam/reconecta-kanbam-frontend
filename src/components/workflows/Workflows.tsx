// src/components/workflows/Workflows.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from "../../api/services/workflows";
import { Folder, Plus, Edit2, Trash2, ArrowRight, Layers, Clock, Calendar } from "lucide-react";

interface Workflow {
  id: number;
  nome: string;
  descricao?: string;
  createdAt?: string;
  updatedAt?: string;
}

const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do formulário
  const [showForm, setShowForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [formNome, setFormNome] = useState("");
  const [formDesc, setFormDesc] = useState("");

  // Estados de notificação
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Estado de confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: number | null;
    nome: string;
  }>({ open: false, id: null, nome: "" });

  // ==================== FUNÇÕES UTILITÁRIAS ====================

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (error) {
      showNotification("Erro ao carregar workflows", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  // ==================== HANDLERS ====================

  const handleCreate = async () => {
    if (!formNome.trim()) {
      showNotification("Nome do workflow é obrigatório", "error");
      return;
    }

    try {
      await createWorkflow({
        nome: formNome.trim(),
        descricao: formDesc.trim() || undefined,
      });

      showNotification(`Workflow "${formNome}" criado com sucesso!`, "success");
      setFormNome("");
      setFormDesc("");
      setShowForm(false);
      loadWorkflows();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const handleUpdate = async () => {
    if (!editingWorkflow) return;

    if (!formNome.trim()) {
      showNotification("Nome do workflow é obrigatório", "error");
      return;
    }

    try {
      await updateWorkflow(editingWorkflow.id, {
        nome: formNome.trim(),
        descricao: formDesc.trim() || undefined,
      });

      showNotification("Workflow atualizado com sucesso!", "success");
      setEditingWorkflow(null);
      setFormNome("");
      setFormDesc("");
      setShowForm(false);
      loadWorkflows();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    try {
      await deleteWorkflow(id);
      showNotification(`Workflow "${nome}" deletado com sucesso!`, "success");
      loadWorkflows();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const startEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setFormNome(workflow.nome);
    setFormDesc(workflow.descricao || "");
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingWorkflow(null);
    setFormNome("");
    setFormDesc("");
    setShowForm(false);
  };

  const handleViewWorkflow = (workflowId: number) => {
    navigate(`/kanban-board?workflowId=${workflowId}`);
  };

  // ==================== RENDER ====================

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Meus Workflows
              </h1>
              <p className="text-gray-600">
                Organize suas ocorrências em projetos e fluxos de trabalho
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#4c010c] text-white px-6 py-3 rounded-lg hover:bg-[#6a0110] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Novo Workflow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {workflows.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Folder className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Nenhum workflow criado
              </h2>
              <p className="text-gray-600 mb-6">
                Crie seu primeiro workflow para começar a organizar suas
                ocorrências de forma estruturada
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-[#4c010c] text-white px-6 py-3 rounded-lg hover:bg-[#6a0110] transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Workflow
              </button>
            </div>
          </div>
        ) : (
          /* Grid de Workflows */
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
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(workflow);
                          }}
                          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
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
                          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                          title="Deletar workflow"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 truncate">
                      {workflow.nome}
                    </h3>
                    
                    {workflow.descricao && (
                      <p className="text-white text-opacity-90 text-sm line-clamp-2">
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
                      <span>
                        Criado em{" "}
                        {/* {new Date(workflow.createdAt).toLocaleDateString("pt-BR")} */}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#4c010c]" />
                      <span>
                        Atualizado em{" "}
                        {/* {new Date(workflow.updatedAt).toLocaleDateString("pt-BR")} */}
                      </span>
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

      {/* Modal de Criação/Edição */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#4c010c] to-[#8b0000] px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingWorkflow ? "Editar Workflow" : "Criar Novo Workflow"}
                  </h3>
                  <p className="text-white text-opacity-90 text-sm mt-1">
                    {editingWorkflow 
                      ? "Atualize as informações do seu workflow"
                      : "Organize suas ocorrências em um novo fluxo"
                    }
                  </p>
                </div>
                <button
                  onClick={cancelForm}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Workflow *
                </label>
                <input
                  type="text"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Ex: Projeto Alpha, Q1 2024, Migração de Sistema"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Descreva o objetivo deste workflow..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={cancelForm}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={editingWorkflow ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-3 bg-[#4c010c] text-white rounded-lg hover:bg-[#6a0110] transition-colors font-medium shadow-lg"
              >
                {editingWorkflow ? "Salvar Alterações" : "Criar Workflow"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Tem certeza que deseja deletar o workflow{" "}
              <strong className="text-gray-900">"{confirmDelete.nome}"</strong>?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                ⚠️ Todas as ocorrências associadas perderão a referência a este workflow.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false, id: null, nome: "" })}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (confirmDelete.id !== null) {
                    await handleDelete(confirmDelete.id, confirmDelete.nome);
                  }
                  setConfirmDelete({ open: false, id: null, nome: "" });
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Deletar Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificação Toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? "✅" : "❌"}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;