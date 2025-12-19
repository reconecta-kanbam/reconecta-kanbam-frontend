import { useEffect, useState } from "react";
import {
  createOcorrencia,
  editOcorrencia,
} from "../../api/services/ocorrencias";
import { listStatus } from "../../api/services/status";
import { listUsers } from "../../api/services/usuario";
import { getSectors } from "../../api/services/sectors";
import { listWorkflows } from "../../api/services/workflows";
import type {
  Ocorrencia,
  CreateOcorrenciaRequest,
} from "../../api/types/ocorrencia";
import type { Setor } from "../../api/types/usuario";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Layers,
  Settings,
  User as UserIcon,
  X,
  Folder,
  Link,
  FileCheck,
} from "lucide-react";

interface Status {
  id: number;
  nome: string;
  chave: string;
  ordem: number;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  setorId?: number;
  ativo?: boolean;
}

interface Workflow {
  id: number;
  nome: string;
  descricao?: string;
}

interface EditOccurrenceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocorrencia?: Ocorrencia | null;
  onSuccess: () => void;
}

const EditOccurrence: React.FC<EditOccurrenceProps> = ({
  open,
  onOpenChange,
  ocorrencia,
  onSuccess,
}) => {
  const isEditing = !!ocorrencia;

  // Estados de dados
  const [setores, setSetores] = useState<Setor[]>([]);
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado do formulário
  const [form, setForm] = useState<CreateOcorrenciaRequest>({
    titulo: "",
    descricao: "",
    setorId: 0,
    statusId: undefined,
    colaboradorId: undefined,
    workflowId: undefined,
    documentacaoUrl: "",
    descricaoExecucao: "",
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (ocorrencia) {
      setForm({
        titulo: ocorrencia.titulo,
        descricao: ocorrencia.descricao,
        setorId: ocorrencia.setor?.id || 0,
        statusId: ocorrencia.status?.id,
        colaboradorId: ocorrencia.colaborador?.id,
        workflowId: ocorrencia.workflowId || ocorrencia.workflow?.id,
        documentacaoUrl: ocorrencia.documentacaoUrl || "",
        descricaoExecucao: ocorrencia.descricaoExecucao || "",
      });
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocorrencia]);

  const loadInitialData = async () => {
    try {
      const [setoresData, statusData, usuariosData, workflowsData] =
        await Promise.all([
          getSectors(),
          // ✅ CORRIGIDO: Não passar workflowId para listar TODOS os status
          listStatus(),
          listUsers(),
          listWorkflows().catch(() => []),
        ]);

      setSetores(setoresData);
      setStatusList(statusData);
      setUsuarios(usuariosData);
      setWorkflows(workflowsData);

      if (!ocorrencia && setoresData.length > 0 && form.setorId === 0) {
        setForm((prev) => ({ ...prev, setorId: setoresData[0].id }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do sistema");
    }
  };

  const resetForm = () => {
    setForm({
      titulo: "",
      descricao: "",
      setorId: setores[0]?.id || 0,
      statusId: undefined,
      colaboradorId: undefined,
      workflowId: undefined,
      documentacaoUrl: "",
      descricaoExecucao: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titulo.trim() || !form.descricao.trim() || form.setorId === 0) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && ocorrencia) {
        // ==================== EDITAR ====================
        // CORREÇÃO: Enviar TODOS os campos, incluindo opcionais
        const editPayload = {
          titulo: form.titulo,
          descricao: form.descricao,
          setorId: form.setorId,
          statusId: form.statusId,
          // Campos opcionais - sempre enviar (string vazia = limpar campo)
          documentacaoUrl: form.documentacaoUrl ?? "",
          descricaoExecucao: form.descricaoExecucao ?? "",
          workflowId: form.workflowId || null,
        };

        
        await editOcorrencia(ocorrencia.id, editPayload);
        toast.success("Ocorrência atualizada com sucesso!");
      } else {
        // ==================== CRIAR ====================
        const createPayload: CreateOcorrenciaRequest = {
          titulo: form.titulo,
          descricao: form.descricao,
          setorId: form.setorId,
          colaboradorId: form.colaboradorId,
          statusId: form.statusId,
          workflowId: form.workflowId || undefined,
          // Campos opcionais - sempre enviar
          documentacaoUrl: form.documentacaoUrl ?? "",
          descricaoExecucao: form.descricaoExecucao ?? "",
        };

        
        await createOcorrencia(createPayload);
        toast.success("Ocorrência criada com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar ocorrência:", error);
      const errorMsg =
        error.response?.data?.message ||
        `Erro ao ${isEditing ? "atualizar" : "criar"} ocorrência`;
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      resetForm();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {isEditing ? (
              <>
                <FileText className="w-6 h-6 text-[#4c010c]" />
                Editar Ocorrência #{ocorrencia.id}
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-[#4c010c]" />
                Nova Ocorrência
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <FileText className="w-5 h-5 text-[#4c010c]" />
                Título *
              </label>
              <input
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                placeholder="Digite o título da ocorrência..."
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <FileText className="w-5 h-5 text-[#4c010c]" />
                Descrição *
              </label>
              <textarea
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all resize-none"
                rows={4}
                placeholder="Descreva a ocorrência em detalhes..."
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            {/* URL da Documentação */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <Link className="w-5 h-5 text-[#4c010c]" />
                URL da Documentação
              </label>
              <input
                type="url"
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                placeholder="https://exemplo.com/documentacao"
                value={form.documentacaoUrl || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    documentacaoUrl: e.target.value,
                  })
                }
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Link para documentação externa relacionada
              </p>
            </div>

            {/* Descrição de Execução */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <FileCheck className="w-5 h-5 text-[#4c010c]" />
                Breve Descrição de Execução
              </label>
              <textarea
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="Descreva brevemente como executar ou resolver..."
                value={form.descricaoExecucao || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    descricaoExecucao: e.target.value,
                  })
                }
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Instruções rápidas de execução ou resolução
              </p>
            </div>

            {/* Setor */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <Layers className="w-5 h-5 text-[#4c010c]" />
                Setor *
              </label>
              <select
                value={form.setorId}
                onChange={(e) =>
                  setForm({ ...form, setorId: Number(e.target.value) })
                }
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all cursor-pointer"
                required
                disabled={loading}
              >
                <option value="0">Selecione um setor</option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <Settings className="w-5 h-5 text-[#4c010c]" />
                Status
              </label>
              <select
                value={form.statusId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    statusId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all cursor-pointer"
                disabled={loading}
              >
                <option value="">Selecione um status (opcional)</option>
                {statusList.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Colaborador */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <UserIcon className="w-5 h-5 text-[#4c010c]" />
                Colaborador Responsável
              </label>
              <select
                value={form.colaboradorId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    colaboradorId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all cursor-pointer"
                disabled={loading}
              >
                <option value="">Selecione um colaborador (opcional)</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nome} - {usuario.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Workflow */}
            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                <Folder className="w-5 h-5 text-[#4c010c]" />
                Workflow
              </label>
              <select
                value={form.workflowId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    workflowId: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-full border-2 border-gray-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all cursor-pointer"
                disabled={loading}
              >
                <option value="">Selecione um workflow (opcional)</option>
                {workflows.map((workflow) => (
                  <option key={workflow.id} value={workflow.id}>
                    {workflow.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  {isEditing ? "Atualizar" : "Criar"} Ocorrência
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOccurrence;