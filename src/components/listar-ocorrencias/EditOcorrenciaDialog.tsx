"use client";

import { useState, useEffect } from "react";
import {
  Ocorrencia,
  CreateOcorrenciaRequest,
} from "../../api/types/ocorrencia";
import { editOcorrencia } from "../../api/services/ocorrencias";

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
  const [loading, setLoading] = useState(false);

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
      <div className="bg-white p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Editar Ocorrência</h2>
        <input
          type="text"
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full mb-4 p-3 border rounded"
        />
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full mb-4 p-3 border rounded"
        />
        <input
          type="number"
          placeholder="Setor ID"
          value={setorId || ""}
          onChange={(e) => setSetorId(Number(e.target.value))}
          className="w-full mb-4 p-3 border rounded"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOcorrenciaDialog;
