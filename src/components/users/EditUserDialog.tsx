import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../../api/api";
import { toast } from "sonner";
import type { Colaborador } from "../../api/services/usuario";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Colaborador | null;
  currentUserPerfil: string;
  onSuccess: () => void;
}

interface Setor {
  id: number;
  nome: string;
}

interface Workflow {
  id: number;
  nome: string;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onClose,
  user,
  currentUserPerfil,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    perfil: "COLABORADOR",
    setorId: "",
    peso: "1",
    workflowIds: [] as number[],
  });
  const [setores, setSetores] = useState<Setor[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      const setorId = user.setorId || (user as any).setor?.id || "";
      // ✅ MUDANÇA: Pegar workflowIds diretamente (é um array de números agora)
      const workflowIds = (user as any).workflowIds || [];

      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        perfil: user.perfil || "COLABORADOR",
        setorId: setorId.toString(),
        peso: user.peso?.toString() || "1",
        workflowIds: Array.isArray(workflowIds) ? workflowIds : [], // ✅ Garantir que é um array
      });
      loadSetores();
      loadWorkflows();
    }
  }, [isOpen, user]);

  const loadSetores = async () => {
    try {
      const response = await api.get("/setores");
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      toast.error("Erro ao carregar setores");
    }
  };

  const loadWorkflows = async () => {
    try {
      // ✅ Remover cache completamente
      const response = await api.get("/workflows", {
        params: { _t: Date.now() },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      setWorkflows(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar workflows:", error);
      toast.error("Erro ao carregar workflows");
      setWorkflows([]);
    }
  };

  const canEditFields = (): boolean => {
    if (currentUserPerfil === "ADMIN") return true;
    if (currentUserPerfil === "GESTOR" && user?.perfil === "COLABORADOR") return true;
    return false;
  };

  const canEditPerfil = (): boolean => {
    return currentUserPerfil === "ADMIN";
  };

  const handleWorkflowToggle = (workflowId: number) => {
    setFormData((prev) => ({
      ...prev,
      workflowIds: prev.workflowIds.includes(workflowId)
        ? prev.workflowIds.filter((id) => id !== workflowId)
        : [...prev.workflowIds, workflowId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const peso = parseFloat(formData.peso);
    if (isNaN(peso) || peso < 0 || peso > 1) {
      setError("Peso deve ser um número entre 0 e 1");
      return;
    }

    if (!canEditFields()) {
      setError("Você não tem permissão para editar este usuário");
      return;
    }

    const setorIdParsed = parseInt(formData.setorId);
    if (!formData.setorId || isNaN(setorIdParsed)) {
      setError("Selecione um setor válido");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload: any = {
        nome: formData.nome,
        email: formData.email,
        peso: peso,
        workflowIds: formData.workflowIds,
      };

      if (canEditPerfil()) {
        payload.perfil = formData.perfil;
      }

      if (!isNaN(setorIdParsed) && setorIdParsed > 0) {
        payload.setorId = setorIdParsed;
      }

      await api.patch(`/users/${user.id}`, payload);

      toast.success("Usuário atualizado com sucesso!");
      onSuccess();
      
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);

      if (error.response?.status === 404 || error.response?.status === 405) {
        setError(
          "⚠️ Endpoint PATCH /users/:id não está implementado no backend. " +
          "Contate o desenvolvedor para implementar o método updateUser no UsersService."
        );
        toast.error("Funcionalidade não disponível no backend");
      } else {
        const errorMsg = error.response?.data?.message || "Erro ao atualizar usuário";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Editar Usuário</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome {canEditFields() && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={!canEditFields()}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  !canEditFields()
                    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                }`}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email {canEditFields() && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!canEditFields()}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  !canEditFields()
                    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                }`}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perfil {canEditPerfil() && <span className="text-red-500">*</span>}
              </label>
              <select
                value={formData.perfil}
                onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                disabled={!canEditPerfil()}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  !canEditPerfil()
                    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                }`}
              >
                <option value="COLABORADOR">COLABORADOR</option>
                <option value="GESTOR">GESTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {!canEditPerfil() && (
                <p className="mt-1 text-xs text-gray-500">Apenas ADMIN pode alterar perfil</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor {canEditFields() && <span className="text-red-500">*</span>}
              </label>
              <select
                value={formData.setorId}
                onChange={(e) => setFormData({ ...formData, setorId: e.target.value })}
                disabled={!canEditFields()}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  !canEditFields()
                    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                }`}
              >
                <option value="">Selecione um setor</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
              </select>
              {setores.length === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  Nenhum setor disponível. Verifique o backend.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-1">(0 a 1)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                disabled={!canEditFields()}
                required
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                  !canEditFields()
                    ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                }`}
                placeholder="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Define a distribuição de atendimentos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workflows {canEditFields() && <span className="text-red-500">*</span>}
              </label>
              <div className="space-y-2 border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
                {workflows.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum workflow disponível</p>
                ) : (
                  workflows.map((workflow) => (
                    <label
                      key={workflow.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        !canEditFields() ? "opacity-50 cursor-not-allowed" : "hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.workflowIds.includes(workflow.id)}
                        onChange={() => handleWorkflowToggle(workflow.id)}
                        disabled={!canEditFields()}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700">{workflow.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !canEditFields()}
              className="flex-1 px-4 py-2 bg-[#4c010c] text-white rounded-lg hover:bg-[#3a0109] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserDialog;