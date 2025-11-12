import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/api";

interface EditSetorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setor: { id: number; nome: string } | null;
  onSuccess: () => void;
}

const EditSetor: React.FC<EditSetorProps> = ({
  open,
  onOpenChange,
  setor,
  onSuccess,
}) => {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setor) {
      setNome(setor.nome);
    } else {
      setNome("");
    }
  }, [setor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error("Nome do setor é obrigatório");
      return;
    }

    try {
      setLoading(true);

      if (setor) {
        // Editar
        await api.patch(`/setores/${setor.id}`, { nome: nome.trim() });
        toast.success("Setor atualizado com sucesso!");
      } else {
        // Criar
        await api.post("/setores", { nome: nome.trim() });
        toast.success("Setor criado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
      setNome("");
    } catch (error: any) {
      console.error("Erro ao salvar setor:", error);
      toast.error(
        error.response?.data?.message || "Erro ao salvar setor"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-50">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {setor ? "Editar Setor" : "Novo Setor"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Setor *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Desenvolvimento, Marketing, Financeiro..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : setor ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSetor;