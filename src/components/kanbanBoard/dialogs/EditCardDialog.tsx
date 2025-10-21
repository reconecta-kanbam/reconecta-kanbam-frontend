"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onSave: (newTitle: string) => void;
}

export const EditCardDialog: React.FC<EditCardDialogProps> = ({
  open,
  onOpenChange,
  initialTitle,
  onSave,
}) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (open) setTitle(initialTitle);
  }, [open, initialTitle]);

  const handleSave = () => {
    if (title.trim()) onSave(title.trim());
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-800">
            Editar card
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mt-1">
            Atualize o título do card selecionado.
          </Dialog.Description>

          <input
            className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Título do card"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              Salvar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
