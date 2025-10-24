"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Trash2, X } from "lucide-react";
import React, { useState } from "react";

interface ConfirmDeleteDialogProps {
  onConfirm: () => Promise<void>;
  children: React.ReactNode; // botão que dispara o modal
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  onConfirm,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao deletar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <AlertDialog.Content className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Excluir Ocorrência
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir esta ocorrência? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
              >
                Cancelar
              </AlertDialog.Cancel>
              <AlertDialog.Action
                onClick={handleConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? "Excluindo..." : "Excluir"}
              </AlertDialog.Action>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmDeleteDialog;
