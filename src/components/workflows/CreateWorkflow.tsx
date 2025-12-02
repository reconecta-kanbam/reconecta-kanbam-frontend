// src/components/workflows/CriarWorkflow.tsx

import React, { useState } from "react";
import { X, Layers } from "lucide-react";
import { createWorkflow } from "../../api/services/workflows";
import type { CreateWorkflowRequest } from "../../api/types/workflow";
import { toast } from "sonner";

interface CriarWorkflowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CriarWorkflow: React.FC<CriarWorkflowProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNome("");
    setDescricao("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error("Nome do workflow é obrigatório");
      return;
    }

    try {
      setLoading(true);

      const payload: CreateWorkflowRequest = {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
      };

      await createWorkflow(payload);

      toast.success(`Workflow "${nome}" criado com sucesso!`);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao criar workflow";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4c010c] to-[#8b0000] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Novo Workflow</h3>
                <p className="text-white/80 text-sm">Organize suas ocorrências</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Workflow *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Projeto Alpha, Q1 2024"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o objetivo deste workflow..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all resize-none"
              disabled={loading}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-colors font-semibold shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarWorkflow;