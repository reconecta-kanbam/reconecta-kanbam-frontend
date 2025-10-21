"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

interface WorkflowState {
  id: string;
  name: string;
}

interface WorkflowConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workflow: any) => void;
}

export const WorkflowConfigDialog: React.FC<WorkflowConfigDialogProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [states, setStates] = useState<WorkflowState[]>([]);
  const [newStateName, setNewStateName] = useState("");
  const [transitions, setTransitions] = useState<Record<string, string[]>>({});

  const addState = () => {
    if (!newStateName.trim()) return;
    const newState: WorkflowState = {
      id: crypto.randomUUID(),
      name: newStateName.trim(),
    };
    setStates((prev) => [...prev, newState]);
    setNewStateName("");
  };

  const toggleTransition = (fromId: string, toId: string) => {
    setTransitions((prev) => {
      const from = prev[fromId] || [];
      const updated = from.includes(toId)
        ? from.filter((id) => id !== toId)
        : [...from, toId];
      return { ...prev, [fromId]: updated };
    });
  };

  const handleSave = () => {
    if (states.length === 0) {
      alert("Adicione ao menos um estado antes de salvar.");
      return;
    }
    onSave({ states, transitions });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-gray-800">
            Configurar Workflow
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mt-1">
            Defina os estados e as transições permitidas entre eles.
          </Dialog.Description>

          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nome do estado"
              value={newStateName}
              onChange={(e) => setNewStateName(e.target.value)}
            />
            <button
              onClick={addState}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              Adicionar
            </button>
          </div>

          {states.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="p-2 border-b text-left">De →</th>
                    {states.map((to) => (
                      <th key={to.id} className="p-2 border-b text-center">
                        {to.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {states.map((from) => (
                    <tr key={from.id}>
                      <td className="p-2 border-b font-medium">{from.name}</td>
                      {states.map((to) => (
                        <td key={to.id} className="p-2 border-b text-center">
                          {from.id === to.id ? (
                            "—"
                          ) : (
                            <input
                              type="checkbox"
                              checked={
                                transitions[from.id]?.includes(to.id) || false
                              }
                              onChange={() => toggleTransition(from.id, to.id)}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
              Salvar Workflow
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
