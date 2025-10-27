"use client";

import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Plus,
  CheckCircle2,
  Layers,
  Calendar,
  User,
  UserPlus,
} from "lucide-react";
import type React from "react";
import type { Ocorrencia } from "../../../api/types/ocorrencia";
import { useState, useEffect } from "react";
import { listUsers } from "../../../api/services/usuario";

// Tipo de usuário baseado na interface de colaborador da ocorrência
interface UserType {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocorrencia: Ocorrencia;
  onAddSubtask?: (
    ocorrenciaId: number,
    subtask: { titulo: string; descricao: string }
  ) => Promise<void>;
  onAssign?: (ocorrenciaId: number, colaboradorId: number) => Promise<void>;
  onAutoAssign?: (ocorrenciaId: number) => Promise<void>;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  open,
  onOpenChange,
  ocorrencia,
  onAddSubtask,
  onAssign,
  onAutoAssign,
}) => {
  const [newSubtask, setNewSubtask] = useState({
    titulo: "",
    descricao: "",
  });
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigningUser, setAssigningUser] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);

  // Carregar lista de usuários
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const userData = await listUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) {
      loadUsers();
    }
  }, [open]);

  const handleAddSubtask = async () => {
    if (!onAddSubtask) return;
    await onAddSubtask(ocorrencia.id, newSubtask);
    setNewSubtask({ titulo: "", descricao: "" });
  };

  // Funções de atribuição
  const handleAssignUser = async () => {
    if (!selectedUserId || !onAssign) return;

    setAssigningUser(true);
    try {
      await onAssign(ocorrencia.id, selectedUserId);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Erro ao atribuir usuário:", error);
    } finally {
      setAssigningUser(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!onAutoAssign) return;

    setAutoAssigning(true);
    try {
      await onAutoAssign(ocorrencia.id);
    } catch (error) {
      console.error("Erro ao auto-atribuir:", error);
    } finally {
      setAutoAssigning(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl p-6 overflow-y-auto z-50 rounded-l-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              Detalhes da Ocorrência
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={24} />
            </Dialog.Close>
          </div>

          {/* Informações principais */}
          <div className="space-y-6">
            <div className="bg-[#4c010c] p-4 rounded-xl text-white">
              <h3 className="font-bold text-lg">{ocorrencia.titulo}</h3>
              <p className="text-sm mt-1 text-white">{ocorrencia.descricao}</p>
            </div>

            {/* Status, Setor, Criado em */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                    Status
                  </span>
                </div>
                <p className="text-green-900 font-medium">
                  {ocorrencia.status?.nome || "Não definido"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                    Setor
                  </span>
                </div>
                <p className="text-purple-900 font-medium">
                  {ocorrencia.setor?.nome || "Não definido"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#ffffa6] to-yellow-100 p-4 rounded-xl border border-yellow-300">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-yellow-800" />
                  <span className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">
                    Criado em
                  </span>
                </div>
                <p className="text-yellow-900 font-medium text-sm">
                  {new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {/* IMPLEMENTAÇÃO 4.2 e 4.3: Atribuição de Ocorrências */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-[#4c010c]" />
                Atribuição
              </h3>

              {/* Colaborador atual */}
              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Colaborador Atual:
                </p>
                {ocorrencia.colaborador ? (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#4c010c]" />
                    <span className="font-semibold">
                      {ocorrencia.colaborador.nome}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({ocorrencia.colaborador.email})
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Não atribuído</span>
                )}
              </div>

              {/* Auto-atribuição */}
              <div className="mb-4">
                <button
                  onClick={handleAutoAssign}
                  disabled={autoAssigning}
                  className="w-full flex items-center justify-center gap-2 bg-[#4c010c] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#6b0115] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  {autoAssigning ? "Atribuindo..." : "Auto-atribuir para mim"}
                </button>
              </div>

              {/* Atribuir para outro usuário */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600">
                  Ou atribuir para outro colaborador:
                </p>

                <select
                  value={selectedUserId || ""}
                  onChange={(e) =>
                    setSelectedUserId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                  disabled={loadingUsers}
                >
                  <option value="">
                    {loadingUsers
                      ? "Carregando usuários..."
                      : "Selecione um colaborador"}
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

            {/* Subtarefas */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#4c010c]" />
                Subtarefas ({ocorrencia.subtarefas?.length || 0})
              </h3>
              <div className="space-y-2">
                {!ocorrencia.subtarefas ||
                ocorrencia.subtarefas.length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-4 text-center bg-gray-50 rounded-lg">
                    Nenhuma subtarefa adicionada ainda
                  </p>
                ) : (
                  ocorrencia.subtarefas.map((subtask) => (
                    <details
                      key={subtask.id}
                      className="group bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl hover:shadow-md transition-all"
                    >
                      <summary className="p-4 cursor-pointer list-none flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800">
                          {subtask.titulo}
                        </h4>
                        <div className="transform transition-transform group-open:rotate-180">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </div>
                      </summary>
                      <div className="p-4 pt-0 space-y-3">
                        {subtask.descricao && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Descrição:
                            </p>
                            <p className="text-gray-600">{subtask.descricao}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Status:
                          </p>
                          <p className="text-gray-600 capitalize">
                            {subtask.status?.replace(/_/g, " ") ||
                              "Não definido"}
                          </p>
                        </div>
                        {subtask.responsavel && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Responsável:
                            </p>
                            <p className="text-gray-600">
                              {subtask.responsavel.nome}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {subtask.responsavel.email}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Criado em:
                          </p>
                          <p className="text-gray-600">
                            {new Date(subtask.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </p>
                        </div>
                      </div>
                    </details>
                  ))
                )}
              </div>
            </div>

            {/* Adicionar subtarefa */}
            {onAddSubtask && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-xl border-2 border-[#4c010c]/20">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#4c010c]" />
                  Adicionar Nova Subtarefa
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Título da subtarefa"
                    className="w-full p-3 border-2 border-[#4c010c]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                    value={newSubtask.titulo}
                    onChange={(e) =>
                      setNewSubtask({ ...newSubtask, titulo: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Descrição da subtarefa (opcional)"
                    className="w-full p-3 border-2 border-[#4c010c]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all resize-none"
                    rows={3}
                    value={newSubtask.descricao}
                    onChange={(e) =>
                      setNewSubtask({
                        ...newSubtask,
                        descricao: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="w-full bg-[#4c010c] text-white px-4 py-3 rounded-lg hover:bg-[#3a0109] transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Subtarefa
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TaskDetailDialog;
