"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onUpdateChecklist?: (items: string[]) => void;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  title,
  onUpdateChecklist,
}: TaskDetailDialogProps) {
  const [checklist, setChecklist] = useState<string[]>([
    "Ler documentação",
    "Escrever código",
    "Testar funcionalidade",
  ]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<string[]>(["Andreza"]);
  const [newAssignee, setNewAssignee] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCompleted((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleAddAssignee = () => {
    if (!newAssignee.trim()) return;
    setAssignees((prev) => [...prev, newAssignee.trim()]);
    setNewAssignee("");
  };

  const handleAddAttachment = () => {
    const url = prompt("Digite a URL do anexo:");
    if (url) setAttachments((prev) => [...prev, url]);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl space-y-6 overflow-y-auto max-h-[90vh]">
          <Dialog.Title className="text-xl font-semibold text-gray-900">
            Detalhes da Tarefa
          </Dialog.Title>

          <div>
            <h3 className="text-lg font-medium text-indigo-700 mb-2">
              {title}
            </h3>
          </div>

          {/* Checklist */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Checklist</h4>
            <ul className="space-y-1">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={completed.includes(item)}
                    onChange={() => toggleCheck(item)}
                  />
                  <span
                    className={
                      completed.includes(item)
                        ? "line-through text-gray-500"
                        : "text-gray-800"
                    }
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Responsáveis */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Responsáveis</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {assignees.map((a) => (
                <span
                  key={a}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                >
                  {a}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar responsável..."
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="border rounded-md p-2 flex-1"
              />
              <button
                onClick={handleAddAssignee}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Anexos */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Anexos</h4>
            <button
              onClick={handleAddAttachment}
              className="mb-2 px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Adicionar URL
            </button>
            <ul className="list-disc list-inside text-indigo-700">
              {attachments.map((a, i) => (
                <li key={i}>
                  <a
                    href={a}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {a}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Histórico */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Histórico</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>🕒 Criado em 22/10/2025 por Andreza</li>
              <li>✏️ Última edição há 5 minutos</li>
              <li>
                ✅ Checklist: {completed.length}/{checklist.length} concluído
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">
                Fechar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
