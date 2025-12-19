// src/components/TaskDetailDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, CheckCircle2, Layers, Calendar, User, UserPlus, Trash2, Edit2, Save, XCircle } from "lucide-react";
import type React from "react";
import type { Ocorrencia } from "../../../api/types/ocorrencia";
import { useState, useEffect } from "react";
import { listUsers } from "../../../api/services/usuario";
import { deleteSubtarefa, editSubtarefa, createSubtarefa, updateStatusOcorrencia } from "../../../api/services/ocorrencias";
import { listStatus } from "../../../api/services/status";
import { toast } from "sonner";

interface UserType {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface StatusType {
  id: number;
  chave: string;
  nome: string;
  ordem: number;
}

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocorrencia: Ocorrencia;
  onAddSubtask?: (ocorrenciaId: number, subtask: { titulo: string; descricao: string; responsavelId?: number }) => Promise<void>;
  onAssign?: (ocorrenciaId: number, colaboradorId: number) => Promise<void>;
  onAutoAssign?: (ocorrenciaId: number) => Promise<void>;
  onUpdate?: (updatedOcorrencia: Ocorrencia) => void;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  open,
  onOpenChange,
  ocorrencia,
  onAssign,
  onAutoAssign,
  onUpdate,
}) => {
  const [localOcorrencia, setLocalOcorrencia] = useState<Ocorrencia>(ocorrencia);
  const [newSubtask, setNewSubtask] = useState({ titulo: "", descricao: "", responsavelId: null as number | null });
  const [users, setUsers] = useState<UserType[]>([]);
  const [statuses, setStatuses] = useState<StatusType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(ocorrencia.status?.id || null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigningUser, setAssigningUser] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [deletingSubtask, setDeletingSubtask] = useState<number | null>(null);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const [editingSubtask, setEditingSubtask] = useState<number | null>(null);
  const [editSubtaskData, setEditSubtaskData] = useState<{
    titulo: string;
    descricao: string;
    responsavelId: number | null;
  }>({ titulo: "", descricao: "", responsavelId: null });

  useEffect(() => {
    setLocalOcorrencia(ocorrencia);
  }, [ocorrencia]);

  useEffect(() => {
    const loadData = async () => {
      if (!open) return;
      
      setLoadingUsers(true);
      try {
        const [userData, statusData] = await Promise.all([
          listUsers(),
          // ✅ CORRIGIDO: Não passar workflowId para listar TODOS os status
          listStatus()
        ]);
        setUsers(userData);
        setStatuses(statusData);
        setSelectedStatusId(ocorrencia.status?.id || null);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadData();
  }, [open, ocorrencia.status?.id]);

  const updateLocalAndParent = (updates: Partial<Ocorrencia>) => {
    const updated = { ...localOcorrencia, ...updates };
    setLocalOcorrencia(updated);
    if (onUpdate) {
      onUpdate(updated);
    }
  };

  const handleAddSubtask = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!newSubtask.titulo.trim()) return;
    
    setAddingSubtask(true);
    try {
      const newSub = await createSubtarefa(localOcorrencia.id, {
        titulo: newSubtask.titulo,
        descricao: newSubtask.descricao,
        responsavelId: newSubtask.responsavelId || undefined
      });
      
      const updatedSubtarefas = [...(localOcorrencia.subtarefas || []), newSub];
      updateLocalAndParent({ subtarefas: updatedSubtarefas });
      
      setNewSubtask({ titulo: "", descricao: "", responsavelId: null });
      toast.success("Subtarefa criada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar subtarefa:", error);
      toast.error("Erro ao adicionar subtarefa.");
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleAssignUser = async () => {
    if (!onAssign || !selectedUserId) return;
    setAssigningUser(true);
    try {
      await onAssign(localOcorrencia.id, selectedUserId);
      
      const assignedUser = users.find(u => u.id === selectedUserId);
      if (assignedUser) {
        updateLocalAndParent({
          colaborador: {
            id: assignedUser.id,
            nome: assignedUser.nome,
            email: assignedUser.email,
            perfil: assignedUser.perfil
          }
        });
      }
      
      setSelectedUserId(null);
      toast.success("Colaborador atribuído com sucesso!");
    } catch (error) {
      console.error("Erro ao atribuir usuário:", error);
      toast.error("Erro ao atribuir colaborador.");
    } finally {
      setAssigningUser(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!onAutoAssign) return;
    setAutoAssigning(true);
    try {
      await onAutoAssign(localOcorrencia.id);
      toast.success("Ocorrência auto-atribuída com sucesso!");
    } catch (error) {
      console.error("Erro ao auto-atribuir:", error);
      toast.error("Erro ao auto-atribuir ocorrência.");
    } finally {
      setAutoAssigning(false);
    }
  };

  const handleDeleteSubtask = async (subtarefaId: number) => {
    const confirmDelete = window.confirm("Tem certeza que deseja deletar esta subtarefa? Esta ação não pode ser desfeita.");
    if (!confirmDelete) return;

    setDeletingSubtask(subtarefaId);
    try {
      await deleteSubtarefa(localOcorrencia.id, subtarefaId);
      
      const updatedSubtarefas = (localOcorrencia.subtarefas || []).filter(s => s.id !== subtarefaId);
      updateLocalAndParent({ subtarefas: updatedSubtarefas });
      
      toast.success("Subtarefa deletada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao deletar subtarefa:", error);
      const message = error.response?.data?.message || error.message || "Erro interno do servidor.";
      toast.error(`Erro ao deletar subtarefa: ${message}`);
    } finally {
      setDeletingSubtask(null);
    }
  };

  const startEditSubtask = (subtask: any) => {
    setEditingSubtask(subtask.id);
    setEditSubtaskData({
      titulo: subtask.titulo,
      descricao: subtask.descricao || "",
      responsavelId: subtask.responsavel?.id || null
    });
  };

  const cancelEditSubtask = () => {
    setEditingSubtask(null);
    setEditSubtaskData({ titulo: "", descricao: "", responsavelId: null });
  };

  const saveEditSubtask = async (subtaskId: number) => {
    if (!editSubtaskData.titulo.trim()) {
      toast.error("Título não pode ser vazio");
      return;
    }

    try {
      const updated = await editSubtarefa(localOcorrencia.id, subtaskId, {
        titulo: editSubtaskData.titulo,
        descricao: editSubtaskData.descricao,
        responsavelId: editSubtaskData.responsavelId || undefined
      });
      
      const updatedSubtarefas = (localOcorrencia.subtarefas || []).map(s => 
        s.id === subtaskId ? updated : s
      );
      updateLocalAndParent({ subtarefas: updatedSubtarefas });
      
      toast.success("Subtarefa atualizada com sucesso!");
      setEditingSubtask(null);
    } catch (error) {
      console.error("Erro ao editar subtarefa:", error);
      toast.error("Erro ao editar subtarefa.");
    }
  };

  const handleStatusChange = async (newStatusId: number) => {
    if (newStatusId === localOcorrencia.status?.id) return;
    
    setUpdatingStatus(true);
    try {
      const updatedOcorrencia = await updateStatusOcorrencia(localOcorrencia.id, { statusId: newStatusId });
      
      setSelectedStatusId(newStatusId);
      updateLocalAndParent({ status: updatedOcorrencia.status });
      
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl p-6 overflow-y-auto z-50 rounded-l-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              Detalhes da Ocorrência
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={24} />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            <div className="bg-[#4c010c] p-4 rounded-xl text-white">
              <h3 className="font-bold text-lg">{localOcorrencia.titulo}</h3>
              <p className="text-sm mt-1 text-white">{localOcorrencia.descricao}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Status</span>
                </div>
                <p className="text-green-900 font-medium">{localOcorrencia.status?.nome || "Não definido"}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Setor</span>
                </div>
                <p className="text-purple-900 font-medium">{localOcorrencia.setor?.nome || "Não definido"}</p>
              </div>

              <div className="bg-gradient-to-br from-[#ffffa6] to-yellow-100 p-4 rounded-xl border border-yellow-300">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-yellow-800" />
                  <span className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">Criado em</span>
                </div>
                <p className="text-yellow-900 font-medium text-sm">
                  {new Date(localOcorrencia.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#4c010c]" />
                Atualizar Status
              </h3>
              <select
                value={selectedStatusId || ""}
                onChange={(e) => handleStatusChange(Number(e.target.value))}
                disabled={updatingStatus || loadingUsers}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
              >
                <option value="">Selecione um status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.nome}
                  </option>
                ))}
              </select>
              {updatingStatus && (
                <p className="text-sm text-gray-500 mt-2">Atualizando status...</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-[#4c010c]" />
                Atribuição
              </h3>

              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-600 mb-1">Colaborador Atual:</p>
                {localOcorrencia.colaborador ? (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#4c010c]" />
                    <span className="font-semibold">{localOcorrencia.colaborador.nome}</span>
                    <span className="text-sm text-gray-500">({localOcorrencia.colaborador.email})</span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Não atribuído</span>
                )}
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAutoAssign();
                  }}
                  disabled={autoAssigning}
                  className="w-full flex items-center justify-center gap-2 bg-[#4c010c] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#6b0115] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  {autoAssigning ? "Atribuindo..." : "Auto-atribuir para mim"}
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">Ou atribuir para outro colaborador:</p>
                <select
                  value={selectedUserId || ""}
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                  disabled={loadingUsers}
                >
                  <option value="">
                    {loadingUsers ? "Carregando..." : "Selecione um colaborador"}
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nome} ({user.email})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAssignUser}
                  disabled={!selectedUserId || assigningUser}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  {assigningUser ? "Atribuindo..." : "Atribuir Colaborador"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#4c010c] p-2 rounded-lg">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Subtarefas</h3>
                      <p className="text-xs text-gray-600">Gerencie as etapas desta ocorrência</p>
                    </div>
                  </div>
                  <div className="bg-[#4c010c] text-white px-3 py-1.5 rounded-full">
                    <span className="text-sm font-bold">{localOcorrencia.subtarefas?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-3 max-h-[400px] overflow-y-auto mb-5">
                  {!localOcorrencia.subtarefas || localOcorrencia.subtarefas.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Layers className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">Nenhuma subtarefa criada</p>
                      <p className="text-gray-400 text-xs mt-1">Crie subtarefas para organizar melhor o trabalho</p>
                    </div>
                  ) : (
                    localOcorrencia.subtarefas.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all group"
                      >
                        {editingSubtask === subtask.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editSubtaskData.titulo}
                              onChange={(e) => setEditSubtaskData({ ...editSubtaskData, titulo: e.target.value })}
                              className="w-full p-2 border-2 border-[#4c010c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c]"
                              placeholder="Título"
                            />
                            <textarea
                              value={editSubtaskData.descricao}
                              onChange={(e) => setEditSubtaskData({ ...editSubtaskData, descricao: e.target.value })}
                              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] resize-none"
                              rows={2}
                              placeholder="Descrição"
                            />
                            <select
                              value={editSubtaskData.responsavelId || ""}
                              onChange={(e) => setEditSubtaskData({ 
                                ...editSubtaskData, 
                                responsavelId: e.target.value ? Number(e.target.value) : null 
                              })}
                              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c]"
                            >
                              <option value="">Sem responsável</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.nome}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEditSubtask(subtask.id)}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                              >
                                <Save className="w-4 h-4" />
                                Salvar
                              </button>
                              <button
                                onClick={cancelEditSubtask}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-gray-900 flex-1">{subtask.titulo}</h4>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditSubtask(subtask)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubtask(subtask.id)}
                                  disabled={deletingSubtask === subtask.id}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Deletar"
                                >
                                  {deletingSubtask === subtask.id ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            {subtask.descricao && (
                              <p className="text-sm text-gray-600 mb-2">{subtask.descricao}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {subtask.responsavel && (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-semibold">
                                  <User className="w-3 h-3" />
                                  {subtask.responsavel.nome}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-semibold">
                                <Calendar className="w-3 h-3" />
                                {new Date(subtask.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-xl border-2 border-[#4c010c]/30 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-[#4c010c]" />
                    <h3 className="text-base font-bold text-gray-900">Adicionar Nova Subtarefa</h3>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Título da subtarefa *"
                      className="w-full p-3 border-2 border-[#4c010c]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                      value={newSubtask.titulo}
                      onChange={(e) => setNewSubtask({ ...newSubtask, titulo: e.target.value })}
                    />
                    <textarea
                      placeholder="Descrição (opcional)"
                      className="w-full p-3 border-2 border-[#4c010c]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent resize-none"
                      rows={2}
                      value={newSubtask.descricao}
                      onChange={(e) => setNewSubtask({ ...newSubtask, descricao: e.target.value })}
                    />
                    <select
                      value={newSubtask.responsavelId || ""}
                      onChange={(e) => setNewSubtask({ 
                        ...newSubtask, 
                        responsavelId: e.target.value ? Number(e.target.value) : null 
                      })}
                      className="w-full p-3 border-2 border-[#4c010c]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                      disabled={loadingUsers}
                    >
                      <option value="">
                        {loadingUsers ? "Carregando..." : "Atribuir responsável (opcional)"}
                      </option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.nome} ({user.perfil})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddSubtask}
                      disabled={!newSubtask.titulo.trim() || addingSubtask}
                      className="w-full bg-[#4c010c] text-white px-4 py-3 rounded-lg hover:bg-[#3a0109] transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingSubtask ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Criar Subtarefa
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskDetailDialog;