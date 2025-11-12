import React, { useState, useEffect } from "react";
import { Save, User, Mail, Shield, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/api";

const Settings: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    peso: "",
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [canEditAdvanced, setCanEditAdvanced] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.sub;
        const userPerfil = payload.perfil;

        // Define se pode editar campos avançados (ADMIN e GESTOR)
        setCanEditAdvanced(userPerfil === "ADMIN" || userPerfil === "GESTOR");

        try {
          const response = await api.get(`/users/${userId}`);
          const user = response.data;

          setUserData(user);
          setFormData({
            nome: user.nome || "",
            email: user.email || "",
            peso: user.peso?.toString() || "1",
            senhaAtual: "",
            novaSenha: "",
            confirmarSenha: "",
          });
        } catch (error) {
          // Fallback para dados do token
          setUserData({
            id: payload.sub,
            nome: payload.nome || payload.email?.split("@")[0] || "Usuário",
            email: payload.email,
            perfil: payload.perfil,
            peso: 1,
          });
          setFormData({
            nome: payload.nome || payload.email?.split("@")[0] || "",
            email: payload.email || "",
            peso: "1",
            senhaAtual: "",
            novaSenha: "",
            confirmarSenha: "",
          });
        }
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados do usuário:", error);
      toast.error("Erro ao carregar dados do usuário");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSavePeso = async () => {
    if (!canEditAdvanced) {
      toast.error("Você não tem permissão para alterar o peso");
      return;
    }

    const peso = parseFloat(formData.peso);
    if (isNaN(peso) || peso < 0 || peso > 1) {
      toast.error("Peso deve ser um número entre 0 e 1");
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/users/${userData.id}/peso`, { peso });
      toast.success("Peso atualizado com sucesso!");
      loadUserData();
    } catch (error: any) {
      console.error("Erro ao atualizar peso:", error);
      toast.error("Erro ao atualizar peso");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.senhaAtual.trim()) {
      toast.error("Senha atual é obrigatória");
      return;
    }

    if (!formData.novaSenha.trim()) {
      toast.error("Nova senha é obrigatória");
      return;
    }

    if (formData.novaSenha.length < 3) {
      toast.error("Nova senha deve ter pelo menos 3 caracteres");
      return;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);
      toast.warning("Alteração de senha em desenvolvimento. Entre em contato com o administrador.");
      
      setFormData({
        ...formData,
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      });
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha");
    } finally {
      setLoading(false);
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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#4c010c] rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando...</h2>
            <p className="text-gray-500">Buscando suas configurações</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
        </div>

        <div className="space-y-6">
          {/* Perfil Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4c010c] to-red-900 flex items-center justify-center text-white font-bold text-3xl">
                {userData?.nome?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{userData?.nome}</h2>
                <p className="text-gray-600">{userData?.email}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getPerfilColor(
                    userData?.perfil
                  )}`}
                >
                  {userData?.perfil}
                </span>
              </div>
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#4c010c]" />
              <h3 className="text-xl font-bold text-gray-800">Informações Pessoais</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Seu nome completo"
                />
                <p className="mt-1 text-xs text-gray-500">Campo somente leitura</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    placeholder="seu@email.com"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Campo somente leitura</p>
              </div>

              {canEditAdvanced && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Peso <span className="text-gray-500 text-xs">(0 a 1)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={formData.peso}
                      onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                      placeholder="1"
                    />
                    <button
                      onClick={handleSavePeso}
                      disabled={loading}
                      className="px-6 py-3 bg-[#4c010c] text-white rounded-lg font-semibold hover:bg-[#3a0109] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Salvar
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Define a distribuição de atendimentos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-[#4c010c]" />
              <h3 className="text-xl font-bold text-gray-800">Segurança</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={formData.senhaAtual}
                  onChange={(e) => setFormData({ ...formData, senhaAtual: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={formData.novaSenha}
                  onChange={(e) => setFormData({ ...formData, novaSenha: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                  placeholder="Digite sua nova senha"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                  placeholder="Confirme sua nova senha"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="px-6 py-3 bg-[#4c010c] text-white rounded-lg font-semibold hover:bg-[#3a0109] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Alterar Senha
                </button>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Nota Importante</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Nome e email não podem ser alterados aqui. Entre em contato com o administrador.</li>
                  <li>• A alteração de senha está em desenvolvimento.</li>
                  {canEditAdvanced && (
                    <li>• Como {userData?.perfil}, você pode editar seu próprio peso de atendimentos.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;