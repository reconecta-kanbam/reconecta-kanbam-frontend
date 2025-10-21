"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onSave: (newTitle: string) => void;
}

export function EditCardDialog({
  open,
  onOpenChange,
  initialTitle,
  onSave,
}: EditCardDialogProps) {
  const [title, setTitle] = useState(initialTitle);

  const handleSave = () => {
    onSave(title);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay escuro de fundo */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        {/* Caixa do modal */}
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl space-y-4">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            Editar Card
          </Dialog.Title>

          <input
            type="text"
            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800">
                Cancelar
              </button>
            </Dialog.Close>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Salvar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
