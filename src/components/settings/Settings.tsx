import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Building2,
  Save,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateMe,
  changePassword,
  Colaborador,
} from "../../api/services/usuario";
import { getSectors } from "../../api/services/sectors";
import api from "../../api/api";

interface Setor {
  id: number;
  nome: string;
}

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [userData, setUserData] = useState<Colaborador | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmSenha: "",
    setorId: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError("");

      // Usar /users/me - funciona para TODOS os perfis (ADMIN, GESTOR, COLABORADOR)
      const [userResponse, setoresData] = await Promise.all([
        api.get<Colaborador>("/users/me"),
        getSectors(),
      ]);

      const user = userResponse.data;
      setUserData(user);
      setSetores(setoresData);

      setFormData({
        nome: user.nome || "",
        email: user.email || "",
        senha: "",
        confirmSenha: "",
        setorId: user.setor?.id || user.setorId || 0,
      });
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      if (err.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
      } else {
        setError("Erro ao carregar dados do usuário. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações
    if (!formData.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email é obrigatório");
      return;
    }

    if (formData.senha && formData.senha !== formData.confirmSenha) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.senha && formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      setSaving(true);

      const profilePayload: any = {};

      if (formData.nome !== userData?.nome) {
        profilePayload.nome = formData.nome;
      }

      if (formData.email !== userData?.email) {
        profilePayload.email = formData.email;
      }

      const currentSetorId = userData?.setor?.id || userData?.setorId || 0;
      if (formData.setorId !== currentSetorId && formData.setorId > 0) {
        profilePayload.setorId = formData.setorId;
      }

      // Atualizar perfil se houver mudanças
      if (Object.keys(profilePayload).length > 0) {
        await updateMe(profilePayload);
      }

      // Se houver senha, abrir dialog para confirmar senha atual
      if (formData.senha) {
        setShowPasswordDialog(true);
        setSaving(false);
        return;
      }

      setSuccess("Perfil atualizado com sucesso!");
      toast.success("Perfil atualizado com sucesso!");

      // Limpar campos de senha
      setFormData((prev) => ({
        ...prev,
        senha: "",
        confirmSenha: "",
      }));

      // Recarregar dados
      await loadUserData();
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Erro ao atualizar perfil";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPasswordChange = async () => {
    if (!currentPasswordInput.trim()) {
      setError("Digite sua senha atual");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await changePassword(currentPasswordInput, formData.senha);

      setSuccess("Senha alterada com sucesso!");
      toast.success("Senha alterada com sucesso!");

      // Limpar
      setFormData((prev) => ({
        ...prev,
        senha: "",
        confirmSenha: "",
      }));
      setCurrentPasswordInput("");
      setShowPasswordDialog(false);

      // Recarregar dados
      await loadUserData();
    } catch (err: any) {
      console.error("Erro ao alterar senha:", err);

      let errorMsg = "Erro ao alterar senha";

      // Verificar se é erro de senha incorreta (401)
      if (err.response?.status === 401) {
        errorMsg = "Senha atual incorreta.";
        setError(errorMsg);
        toast.error(errorMsg);
        setSaving(false);
        return;
      }

      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case "ADMIN":
        return "Administrador";
      case "GESTOR":
        return "Gestor";
      case "COLABORADOR":
        return "Colaborador";
      default:
        return perfil;
    }
  };

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
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Carregando...
            </h2>
            <p className="text-gray-500">Buscando seus dados</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Configurações
          </h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        {/* Card do Perfil */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-[#4c010c] to-red-900 p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                {userData?.nome?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{userData?.nome}</h2>
                <p className="text-white/80">{userData?.email}</p>
                <div className="mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPerfilColor(
                      userData?.perfil || ""
                    )}`}
                  >
                    <Shield className="w-3 h-3 inline mr-1" />
                    {getPerfilLabel(userData?.perfil || "")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Mensagens de erro/sucesso */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-[#4c010c]" />
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 text-[#4c010c]" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            {/* Setor */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-[#4c010c]" />
                Setor
              </label>
              <select
                value={formData.setorId}
                onChange={(e) =>
                  setFormData({ ...formData, setorId: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="0">Selecione um setor</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#4c010c]" />
                Alterar Senha
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Deixe em branco se não quiser alterar a senha. Mínimo 6
                caracteres.
              </p>

              {/* Nova Senha */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) =>
                      setFormData({ ...formData, senha: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all pr-12"
                    placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmSenha}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmSenha: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all pr-12"
                    placeholder="Confirme a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Informações somente leitura */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">
                Informações do Sistema
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID do Usuário:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    #{userData?.id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Perfil:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {getPerfilLabel(userData?.perfil || "")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Peso:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {userData?.peso || 1}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Setor Atual:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {userData?.setor?.nome || "Não definido"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * O perfil e peso só podem ser alterados por um administrador
              </p>
            </div>

            {/* Botão Salvar */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Dialog para confirmar senha antiga */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Lock className="w-6 h-6 text-[#4c010c]" />
                Confirmar Identidade
              </h2>
              <button
                onClick={() => {
                  if (!saving) {
                    setShowPasswordDialog(false);
                    setCurrentPasswordInput("");
                    setError("");
                  }
                }}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4">
              <p className="text-gray-600">
                Para alterar sua senha, confirme com sua senha atual:
              </p>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha Atual *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPasswordInput}
                    onChange={(e) => {
                      setCurrentPasswordInput(e.target.value);
                      setError("");
                    }}
                    placeholder="Digite sua senha atual"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all pr-12 ${
                      error
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:ring-[#4c010c]"
                    }`}
                    disabled={saving}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={saving}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mostrar erro */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">
                      Erro de Validação
                    </p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (!saving) {
                    setShowPasswordDialog(false);
                    setCurrentPasswordInput("");
                    setError("");
                  }
                }}
                disabled={saving}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPasswordChange}
                disabled={saving || !currentPasswordInput.trim() || !!error}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;