import { Pencil, Trash2 } from "lucide-react";
import { deleteOcorrencia } from "../../api/services/ocorrencias";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface OcorrenciaActionsProps {
  id: number;
  onDeleted?: (id: number) => void;
}

const OcorrenciaActions: React.FC<OcorrenciaActionsProps> = ({
  id,
  onDeleted,
}) => {
  const handleDelete = async () => {
    await deleteOcorrencia(id);
    if (onDeleted) onDeleted(id);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Editar */}
      <button
        className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
        disabled
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* Excluir com modal bonito */}
      <ConfirmDeleteDialog onConfirm={handleDelete}>
        <button
          className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1"
          onClick={(e) => e.stopPropagation()} // evita abrir modal de detalhes
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </ConfirmDeleteDialog>
    </div>
  );
};

export default OcorrenciaActions;
