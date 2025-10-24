"use client";

import { Trash2, Pencil } from "lucide-react";
import { deleteOcorrencia } from "../../api/services/ocorrencias";
import { useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";

interface OcorrenciaActionsProps {
  id: number;
  onDeleted?: (id: number) => void;
  onEdit?: (id: number) => void; // nova callback
}

const OcorrenciaActions: React.FC<OcorrenciaActionsProps> = ({
  id,
  onDeleted,
  onEdit,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
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
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Editar */}
        <button
          onClick={() => onEdit?.(id)}
          className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Excluir */}
        <button
          onClick={handleDeleteClick}
          className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1"
          disabled={loading}
        >
          <Trash2 className="w-4 h-4" />
          {loading ? "Excluindo..." : ""}
        </button>
      </div>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        isLoading={loading}
      />
    </>
  );
};

export default OcorrenciaActions;
