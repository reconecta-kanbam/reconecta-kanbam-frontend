"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";

interface CardData {
  id?: string;
  title: string;
  description: string;
  priority: "baixa" | "média" | "alta";
  dueDate: string;
  assignee: string;
  isPrimary: boolean;
}

interface CardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CardData) => void;
  onDelete?: (id: string) => void;
  initialData?: CardData | null;
}

export function CardDialog({
  open,
  onOpenChange,
  onSave,
  onDelete,
  initialData,
}: CardDialogProps) {
  const [form, setForm] = useState<CardData>({
    title: "",
    description: "",
    priority: "média",
    dueDate: "",
    assignee: "",
    isPrimary: false,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl space-y-4">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {initialData ? "Editar Card" : "Novo Card"}
          </Dialog.Title>

          <div className="space-y-3">
            <input
              placeholder="Título"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-md p-2"
            />

            <textarea
              placeholder="Descrição"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as any })
              }
              className="w-full border rounded-md p-2"
            >
              <option value="baixa">Baixa</option>
              <option value="média">Média</option>
              <option value="alta">Alta</option>
            </select>

            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full border rounded-md p-2"
            />

            <input
              placeholder="Responsável"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              className="w-full border rounded-md p-2"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) =>
                  setForm({ ...form, isPrimary: e.target.checked })
                }
              />
              Responsável primário
            </label>
          </div>

          <div className="flex justify-between pt-4">
            {initialData && onDelete && (
              <button
                onClick={() => onDelete(initialData.id!)}
                className="text-red-600 hover:underline"
              >
                Excluir
              </button>
            )}

            <div className="flex gap-2 ml-auto">
              <Dialog.Close asChild>
                <button className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
