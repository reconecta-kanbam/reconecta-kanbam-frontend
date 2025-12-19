import React, { useEffect, useState } from "react";
import { Plus, Search, Trash2, Edit2, User as UserIcon, Shield } from "lucide-react";
import { toast } from "sonner";
import { listUsers } from "../../api/services/usuario";
import type { Colaborador } from "../../api/services/usuario";
import api from "../../api/api";
import UserModal from "./UserModal";
import EditUserDialog from "./EditUserDialog";
import ConfirmDialog from "../../ErrorMessage/services/btnDelete";

const Users: React.FC = () => {
  const [users, setUsers] = useState<Colaborador[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Colaborador | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserData({
          id: payload.sub,
          perfil: payload.perfil,
        });
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await listUsers();
      setUsers(data);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Usar o endpoint correto que o backend fornece
      await api.post(`/users/${id}/delete-action`, {
        mode: "delete"
      });
      
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success("Usuário deletado com sucesso!");
      setConfirmDelete({ open: false, id: null });
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      const errorMessage = error.response?.data?.message || "Erro ao deletar usuário";
      toast.error(errorMessage);
    }
  };

  const canEditUser = (targetUserId: number, targetPerfil: string): boolean => {
    if (!currentUserData) return false;
    
    // Não pode editar a si mesmo aqui (usa Settings)
    if (targetUserId === currentUserData.id) return false;
    
    // ADMIN pode editar todos
    if (currentUserData.perfil === "ADMIN") return true;
    
    // GESTOR pode editar apenas COLABORADORES
    if (currentUserData.perfil === "GESTOR") {
      return targetPerfil === "COLABORADOR";
    }
    
    return false;
  };

  const canDeleteUser = (targetUserId: number, targetPerfil: string): boolean => {
    if (!currentUserData) return false;
    
    // Não pode deletar a si mesmo
    if (targetUserId === currentUserData.id) return false;
    
    // ADMIN pode deletar todos (exceto si mesmo)
    if (currentUserData.perfil === "ADMIN") return true;
    
    // GESTOR pode deletar apenas COLABORADORES
    if (currentUserData.perfil === "GESTOR") {
      return targetPerfil === "COLABORADOR";
    }
    
    return false;
  };

  const canCreateUser = (): boolean => {
    if (!currentUserData) return false;
    return currentUserData.perfil === "ADMIN" || currentUserData.perfil === "GESTOR";
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-300";
      case "GESTOR":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "COLABORADOR":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#4c010c] rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando...</h2>
            <p className="text-gray-500">Buscando usuários</p>
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Gerenciar Usuários</h1>
            <p className="text-gray-600">Crie, edite e gerencie os usuários do sistema</p>
          </div>
          {canCreateUser() && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Usuário
            </button>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou email..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all shadow-sm hover:shadow-md bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">Nenhum usuário encontrado</p>
              {canCreateUser() && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-6 py-2 bg-[#4c010c] text-white rounded-lg hover:bg-[#3a0109] transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar primeiro usuário
                </button>
              )}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-[#4c010c] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4c010c] to-red-900 flex items-center justify-center text-white font-bold text-lg">
                      {user.nome.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-800">{user.nome}</h3>
                        {user.id === currentUserData?.id && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full border border-purple-300">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPerfilColor(
                            user.perfil
                          )}`}
                        >
                          <Shield className="w-3 h-3 inline mr-1" />
                          {user.perfil}
                        </span>
                        <span className="text-sm text-gray-500">
                          Peso: {user.peso || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canEditUser(user.id, user.perfil) && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors"
                        title="Editar peso do usuário"
                      >
                        <Edit2 className="w-5 h-5 text-yellow-600" />
                      </button>
                    )}
                    
                    {canDeleteUser(user.id, user.perfil) && (
                      <button
                        onClick={() => setConfirmDelete({ open: true, id: user.id })}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                        title="Deletar usuário"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadUsers();
          setIsCreateModalOpen(false);
        }}
      />

      <EditUserDialog
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        currentUserPerfil={currentUserData?.perfil}
        onSuccess={() => {
          loadUsers(); // ✅ Recarregar usuários
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, id: null })}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita e todas as ocorrências atribuídas a ele serão removidas."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => confirmDelete.id && handleDelete(confirmDelete.id)}
      />
    </div>
  );
};

export default Users;