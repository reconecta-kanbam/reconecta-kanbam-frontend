"use client";

import { useState, useEffect } from "react";
import {
  Ocorrencia,
  CreateOcorrenciaRequest,
} from "../../api/types/ocorrencia";
import { Setor } from "../../api/types/usuario";
import {
  editOcorrencia,
  assignOcorrencia,
  updateStatusOcorrencia,
} from "../../api/services/ocorrencias";
import { getSectors } from "../../api/services/sectors";
import { listUsers } from "../../api/services/usuario";
import { listStatus } from "../../api/services/status";
import {
  Layers,
  FileText,
  AlignLeft,
  CheckCircle,
  User as UserIcon,
} from "lucide-react";

interface UserData {
  id: number;
  nome: string;
  email: string;
  setorId?: number;
  ativo?: boolean;
}

interface StatusData {
  id: number;
  nome: string;
  descricao?: string;
  cor?: string;
  ativo?: boolean;
}

interface EditOcorrenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocorrencia: Ocorrencia | null;
  onUpdated?: (updated: Ocorrencia) => void;
}

// Função para formatar nomes de status
const formatStatusName = (statusName: string): string => {
  const specialCases: Record<string, string> = {
    em_fila: "Em Fila",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
    cancelado: "Cancelado",
    pendente: "Pendente",
    revisao: "Em Revisão",
    aprovado: "Aprovado",
  };

  if (specialCases[statusName.toLowerCase()]) {
    return specialCases[statusName.toLowerCase()];
  }

  // Fallback: capitalizar primeira letra e substituir _ por espaços
  return statusName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const EditOcorrenciaDialog: React.FC<EditOcorrenciaDialogProps> = ({
  open,
  onOpenChange,
  ocorrencia,
  onUpdated,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [setorId, setSetorId] = useState<number | null>(null);
  const [colaboradorId, setColaboradorId] = useState<number | null>(null);
  const [statusId, setStatusId] = useState<number | null>(null);

  const [setores, setSetores] = useState<Setor[]>([]);
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [statusList, setStatusList] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar setores
        const setoresData = await getSectors();
        setSetores(setoresData);
        console.log("🏢 Setores carregados:", setoresData);

        // Carregar usuários
        const usuariosData = await listUsers();
        setUsuarios(usuariosData);
        console.log("👥 Usuários carregados:", usuariosData);

        // Carregar status
        const statusData = await listStatus();
        setStatusList(statusData);
        console.log("📊 Status carregados:", statusData);
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        // Fallback para setores hardcoded caso a API falhe
        setSetores([
          { id: 1, nome: "TI" },
          { id: 2, nome: "Financeiro" },
          { id: 3, nome: "RH" },
          { id: 4, nome: "Operações" },
        ]);

        // Fallback para usuários
        setUsuarios([
          { id: 1, nome: "Administrador", email: "admin@empresa.com" },
        ]);

        // Fallback para status
        const fallbackStatus = [
          { id: 1, nome: "em_fila", descricao: "Em Fila" },
          { id: 2, nome: "em_andamento", descricao: "Em Andamento" },
          { id: 3, nome: "concluido", descricao: "Concluído" },
        ];
        setStatusList(fallbackStatus);
        console.log("🔄 Usando status fallback:", fallbackStatus);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (ocorrencia) {
      setTitulo(ocorrencia.titulo);
      setDescricao(ocorrencia.descricao);
      setSetorId(ocorrencia.setor?.id || null);
      setColaboradorId(ocorrencia.colaborador?.id || null);
      setStatusId(ocorrencia.status?.id || null);
    }
  }, [ocorrencia]);

  const handleSave = async () => {
    if (!ocorrencia || setorId === null) return;
    setLoading(true);

    console.log("🚀 Iniciando salvamento da ocorrência:", {
      ocorrenciaId: ocorrencia.id,
      statusAtual: ocorrencia.status,
      statusSelecionado: statusId,
      colaboradorAtual: ocorrencia.colaborador,
      colaboradorSelecionado: colaboradorId,
    });

    try {
      // 1. Atualizar dados básicos da ocorrência
      const payload: CreateOcorrenciaRequest = {
        titulo,
        descricao,
        setorId,
      };
      console.log("📝 Atualizando dados básicos:", payload);
      let updated = await editOcorrencia(ocorrencia.id, payload);
      console.log("✅ Dados básicos atualizados:", updated);

      // 2. Atribuir colaborador se foi selecionado e é diferente do atual
      if (colaboradorId && colaboradorId !== ocorrencia.colaborador?.id) {
        console.log(`👤 Atribuindo colaborador ${colaboradorId}`);
        updated = await assignOcorrencia(ocorrencia.id, { colaboradorId });
        console.log("✅ Colaborador atribuído:", updated);
      }

      // 3. Atualizar status se foi selecionado e é diferente do atual
      if (statusId && statusId !== ocorrencia.status?.id) {
        console.log(
          `🔄 Atualizando status de ${ocorrencia.status?.id} para ${statusId}`
        );

        try {
          // Primeira tentativa: endpoint específico de status
          const statusResult = await updateStatusOcorrencia(ocorrencia.id, {
            statusId,
          });
          if (statusResult) {
            updated = statusResult;
            console.log(
              "✅ Status atualizado via endpoint específico:",
              updated
            );
          }
        } catch (error) {
          console.warn(
            "⚠️ Endpoint específico falhou, tentando via edição geral"
          );

          // Fallback: tentar via endpoint de edição geral
          try {
            const fallbackPayload = {
              titulo: updated.titulo,
              descricao: updated.descricao,
              setorId: updated.setor?.id || setorId,
              statusId: statusId, // incluir statusId no payload geral
            };
            const editResult = await editOcorrencia(
              ocorrencia.id,
              fallbackPayload
            );
            if (editResult) {
              updated = editResult;
              console.log("✅ Status atualizado via edição geral:", updated);
            }
          } catch (fallbackError) {
            console.error("❌ Ambos os métodos falharam:", fallbackError);
            throw fallbackError;
          }
        }
      }

      console.log("🎉 Salvamento concluído. Resultado final:", updated);
      onUpdated?.(updated);
      onOpenChange(false);
      alert("✅ Ocorrência atualizada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao atualizar ocorrência:", error);
      alert(
        "❌ Erro ao atualizar ocorrência: " +
          (error as any)?.response?.data?.message || (error as any)?.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open || !ocorrencia) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border-2 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Edição Completa da Ocorrência
        </h2>

        <div className="mb-4">
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <FileText className="w-4 h-4 text-[#4c010c]" />
            Título
          </label>
          <input
            type="text"
            placeholder="Digite o título da ocorrência"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <AlignLeft className="w-4 h-4 text-[#4c010c]" />
            Descrição
          </label>
          <textarea
            placeholder="Descreva a ocorrência"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <Layers className="w-4 h-4 text-[#4c010c]" />
            Setor
          </label>
          <select
            value={setorId || ""}
            onChange={(e) => setSetorId(Number(e.target.value))}
            className="w-full border-2 border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all text-gray-800 cursor-pointer"
            required
          >
            <option value="">Selecione um setor</option>
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <UserIcon className="w-4 h-4 text-[#4c010c]" />
            Colaborador Responsável
          </label>
          <select
            value={colaboradorId || ""}
            onChange={(e) =>
              setColaboradorId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full border-2 border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all text-gray-800 cursor-pointer"
          >
            <option value="">Nenhum colaborador atribuído</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nome} ({usuario.email})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
            <CheckCircle className="w-4 h-4 text-[#4c010c]" />
            Status
          </label>
          <select
            value={statusId || ""}
            onChange={(e) => {
              const newStatusId = e.target.value
                ? Number(e.target.value)
                : null;
              console.log(
                "🔄 Status selecionado:",
                newStatusId,
                "Valor anterior:",
                statusId
              );
              setStatusId(newStatusId);
            }}
            className="w-full border-2 border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all text-gray-800 cursor-pointer"
          >
            <option value="">Selecione um status</option>
            {statusList.map((status) => (
              <option key={status.id} value={status.id}>
                {status.descricao || formatStatusName(status.nome)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={
              loading || !titulo.trim() || !descricao.trim() || !setorId
            }
            className="px-6 py-3 bg-[#4c010c] text-white rounded-xl hover:bg-[#6d0210] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOcorrenciaDialog;
