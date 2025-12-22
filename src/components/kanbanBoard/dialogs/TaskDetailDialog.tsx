// src/components/TaskDetailDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, CheckCircle2, Layers, Calendar, User, UserPlus, Trash2, Edit2, Save, XCircle, Building2 } from "lucide-react";
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
    const confirmDelete = window.confirm("Tem certeza que deseja deletar esta subtarefa?");
    if (!confirmDelete) return;

    setDeletingSubtask(subtarefaId);
    try {
      await deleteSubtarefa(localOcorrencia.id, subtarefaId);
      
      const updatedSubtarefas = (localOcorrencia.subtarefas || []).filter(s => s.id !== subtarefaId);
      updateLocalAndParent({ subtarefas: updatedSubtarefas });
      
      toast.success("Subtarefa deletada!");
    } catch (error: any) {
      console.error("Erro ao deletar subtarefa:", error);
      toast.error("Erro ao deletar subtarefa.");
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
      
      toast.success("Subtarefa atualizada!");
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
      
      toast.success("Status atualizado!");
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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-gray-50 shadow-2xl overflow-hidden z-50 flex flex-col">
          {/* Header Fixo */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <Dialog.Title className="text-xl font-bold text-gray-900 truncate">
                  Detalhes da Ocorrência
                </Dialog.Title>
                <p className="text-sm text-gray-500 mt-0.5">#{localOcorrencia.id}</p>
              </div>
              <Dialog.Close className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <X size={20} />
              </Dialog.Close>
            </div>
          </div>

          {/* Conteúdo Scrollável */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-5">
              
              {/* Título e Descrição */}
              <div className="bg-[#4c010c] p-5 rounded-xl text-white">
                <h3 className="font-bold text-lg leading-tight break-words">{localOcorrencia.titulo}</h3>
                {localOcorrencia.descricao && (
                  <p className="text-sm mt-2 text-white/90 leading-relaxed break-words">{localOcorrencia.descricao}</p>
                )}
              </div>

              {/* Info Cards - Layout Vertical */}
              <div className="space-y-3">
                {/* Status */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                        <p className="font-semibold text-gray-900 truncate">{localOcorrencia.status?.nome || "Não definido"}</p>
                      </div>
                    </div>
                    <select
                      value={selectedStatusId || ""}
                      onChange={(e) => handleStatusChange(Number(e.target.value))}
                      disabled={updatingStatus || loadingUsers}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent bg-white min-w-[140px]"
                    >
                      <option value="">Alterar...</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Setor e Data */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Setor</p>
                        <p className="font-semibold text-gray-900 truncate" title={localOcorrencia.setor?.nome}>
                          {localOcorrencia.setor?.nome || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Criado</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(localOcorrencia.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atribuição */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#4c010c]" />
                    <h3 className="font-bold text-gray-900">Atribuição</h3>
                  </div>
                </div>
                
                <div className="p-5 space-y-4">
                  {/* Colaborador Atual */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Colaborador Atual</p>
                    {localOcorrencia.colaborador ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#4c010c] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {localOcorrencia.colaborador.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate" title={localOcorrencia.colaborador.nome}>
                            {localOcorrencia.colaborador.nome}
                          </p>
                          <p className="text-sm text-gray-500 truncate" title={localOcorrencia.colaborador.email}>
                            {localOcorrencia.colaborador.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">Não atribuído</p>
                    )}
                  </div>

                  {/* Auto-atribuir */}
                  <button
                    type="button"
                    onClick={handleAutoAssign}
                    disabled={autoAssigning}
                    className="w-full flex items-center justify-center gap-2 bg-[#4c010c] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#6b0115] transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    {autoAssigning ? "Atribuindo..." : "Auto-atribuir para mim"}
                  </button>

                  {/* Atribuir Manual */}
                  <div className="flex gap-2">
                    <select
                      value={selectedUserId || ""}
                      onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent text-sm"
                      disabled={loadingUsers}
                    >
                      <option value="">{loadingUsers ? "Carregando..." : "Selecionar colaborador..."}</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignUser}
                      disabled={!selectedUserId || assigningUser}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtarefas */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#4c010c]" />
                    <h3 className="font-bold text-gray-900">Subtarefas</h3>
                  </div>
                  <span className="bg-[#4c010c] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {localOcorrencia.subtarefas?.length || 0}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Lista de Subtarefas */}
                  {(!localOcorrencia.subtarefas || localOcorrencia.subtarefas.length === 0) ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <Layers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Nenhuma subtarefa</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {localOcorrencia.subtarefas.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
                        >
                          {editingSubtask === subtask.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editSubtaskData.titulo}
                                onChange={(e) => setEditSubtaskData({ ...editSubtaskData, titulo: e.target.value })}
                                className="w-full p-2.5 border-2 border-[#4c010c] rounded-lg text-sm"
                                placeholder="Título"
                              />
                              <textarea
                                value={editSubtaskData.descricao}
                                onChange={(e) => setEditSubtaskData({ ...editSubtaskData, descricao: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm resize-none"
                                rows={2}
                                placeholder="Descrição"
                              />
                              <select
                                value={editSubtaskData.responsavelId || ""}
                                onChange={(e) => setEditSubtaskData({ 
                                  ...editSubtaskData, 
                                  responsavelId: e.target.value ? Number(e.target.value) : null 
                                })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="">Sem responsável</option>
                                {users.map((user) => (
                                  <option key={user.id} value={user.id}>{user.nome}</option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEditSubtask(subtask.id)}
                                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                                >
                                  <Save className="w-4 h-4" /> Salvar
                                </button>
                                <button
                                  onClick={cancelEditSubtask}
                                  className="flex-1 flex items-center justify-center gap-1.5 bg-gray-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600"
                                >
                                  <XCircle className="w-4 h-4" /> Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-gray-900 text-sm break-words flex-1">{subtask.titulo}</h4>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={() => startEditSubtask(subtask)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubtask(subtask.id)}
                                    disabled={deletingSubtask === subtask.id}
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                                  >
                                    {deletingSubtask === subtask.id ? (
                                      <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              
                              {subtask.descricao && (
                                <p className="text-xs text-gray-600 mt-1 break-words">{subtask.descricao}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {subtask.responsavel && (
                                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                    <User className="w-3 h-3" />
                                    <span className="truncate max-w-[100px]" title={subtask.responsavel.nome}>
                                      {subtask.responsavel.nome.split(' ')[0]}
                                    </span>
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(subtask.createdAt).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nova Subtarefa */}
                  <div className="bg-[#4c010c]/5 p-4 rounded-lg border border-[#4c010c]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Plus className="w-4 h-4 text-[#4c010c]" />
                      <span className="text-sm font-semibold text-gray-900">Nova Subtarefa</span>
                    </div>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        placeholder="Título *"
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                        value={newSubtask.titulo}
                        onChange={(e) => setNewSubtask({ ...newSubtask, titulo: e.target.value })}
                      />
                      <textarea
                        placeholder="Descrição (opcional)"
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
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
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                        disabled={loadingUsers}
                      >
                        <option value="">Responsável (opcional)</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>{user.nome}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddSubtask}
                        disabled={!newSubtask.titulo.trim() || addingSubtask}
                        className="w-full bg-[#4c010c] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#3a0109] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                      >
                        {addingSubtask ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Criando...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Criar Subtarefa
                          </>
                        )}
                      </button>
                    </div>
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