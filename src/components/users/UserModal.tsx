import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../../api/api";
import { toast } from "sonner";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Setor {
  id: number;
  nome: string;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "COLABORADOR",
    setorId: "",
    peso: "1",
  });
  const [setores, setSetores] = useState<Setor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadSetores();
    }
  }, [isOpen]);

  const loadSetores = async () => {
    try {
      const response = await api.get("/setores");
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      toast.error("Erro ao carregar setores");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const peso = parseFloat(formData.peso);
      if (isNaN(peso) || peso < 0 || peso > 1) {
        setError("Peso deve ser um número entre 0 e 1");
        setIsLoading(false);
        return;
      }

      // CORREÇÃO: Validar setorId antes de enviar
      const setorIdParsed = parseInt(formData.setorId);
      if (!formData.setorId || isNaN(setorIdParsed)) {
        setError("Selecione um setor válido");
        setIsLoading(false);
        return;
      }

      const payload: any = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        perfil: formData.perfil,
        peso: peso,
      };

      if (!isNaN(setorIdParsed) && setorIdParsed > 0) {
        payload.setorId = setorIdParsed;
      }

      await api.post("/users", payload);

      toast.success("Usuário criado com sucesso!");
      setFormData({
        nome: "",
        email: "",
        senha: "",
        perfil: "COLABORADOR",
        setorId: "",
        peso: "1",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      setError(
        error.response?.data?.message || "Erro ao criar usuário. Tente novamente."
      );
      toast.error(error.response?.data?.message || "Erro ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nome: "",
      email: "",
      senha: "",
      perfil: "COLABORADOR",
      setorId: "",
      peso: "1",
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Criar Novo Usuário</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required
                minLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                placeholder="Mínimo 3 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Perfil <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.perfil}
                onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
              >
                <option value="COLABORADOR">COLABORADOR</option>
                <option value="GESTOR">GESTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.setorId}
                onChange={(e) => setFormData({ ...formData, setorId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4c010c] focus:border-transparent"
                placeholder="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Define a distribuição de atendimentos
              </p>
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-[#4c010c] text-white rounded-lg hover:bg-[#3a0109] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Criando..." : "Criar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;