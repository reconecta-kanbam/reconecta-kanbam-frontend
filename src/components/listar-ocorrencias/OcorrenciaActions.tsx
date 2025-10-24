"use client";

import { Trash2, Pencil } from "lucide-react";
import { deleteOcorrencia } from "../../api/services/ocorrencias";
import { useState } from "react";

interface OcorrenciaActionsProps {
  id: number;
  onDeleted?: (id: number) => void; // para atualizar lista após deletar
}

const OcorrenciaActions: React.FC<OcorrenciaActionsProps> = ({
  id,
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir esta ocorrência?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await deleteOcorrencia(id);

      alert("✅ Ocorrência deletada com sucesso!");

      if (onDeleted) onDeleted(id);
    } catch (error) {
      console.error("Erro ao deletar ocorrência:", error);
      alert("❌ Erro ao deletar ocorrência");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Editar (só criaremos depois) */}
      <button
        className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
        disabled
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* Excluir */}
      <button
        onClick={handleDelete}
        className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1"
        disabled={loading}
      >
        <Trash2 className="w-4 h-4" />
        {loading ? "Excluindo..." : ""}
      </button>
    </div>
  );
};

export default OcorrenciaActions;
