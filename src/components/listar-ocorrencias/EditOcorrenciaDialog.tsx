"use client";

import { useState, useEffect } from "react";
import {
  Ocorrencia,
  CreateOcorrenciaRequest,
} from "../../api/types/ocorrencia";
import { Setor } from "../../api/types/usuario";
import { editOcorrencia } from "../../api/services/ocorrencias";
import { getSectors } from "../../api/services/sectors";
import { Layers, FileText, AlignLeft } from "lucide-react";

interface EditOcorrenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocorrencia: Ocorrencia | null;
  onUpdated?: (updated: Ocorrencia) => void;
}

const EditOcorrenciaDialog: React.FC<EditOcorrenciaDialogProps> = ({
  open,
  onOpenChange,
  ocorrencia,
  onUpdated,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [setorId, setSetorId] = useState<number | null>(null);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar setores
  useEffect(() => {
    const loadSetores = async () => {
      try {
        const setoresData = await getSectors();
        setSetores(setoresData);
      } catch (error) {
        console.error("Erro ao carregar setores:", error);
        // Fallback para setores hardcoded caso a API falhe
        setSetores([
          { id: 1, nome: "TI" },
          { id: 2, nome: "Financeiro" },
          { id: 3, nome: "RH" },
          { id: 4, nome: "Operações" },
        ]);
      }
    };
    loadSetores();
  }, []);

  useEffect(() => {
    if (ocorrencia) {
      setTitulo(ocorrencia.titulo);
      setDescricao(ocorrencia.descricao);
      setSetorId(ocorrencia.setor?.id || null);
    }
  }, [ocorrencia]);

  const handleSave = async () => {
    if (!ocorrencia || setorId === null) return;
    setLoading(true);
    try {
      const payload: CreateOcorrenciaRequest = {
        titulo,
        descricao,
        setorId,
      };
      const updated = await editOcorrencia(ocorrencia.id, payload);
      onUpdated?.(updated);
      onOpenChange(false);
      alert("✅ Ocorrência atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error);
      alert("❌ Erro ao atualizar ocorrência");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !ocorrencia) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border-2 border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Editar Ocorrência
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
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOcorrenciaDialog;
