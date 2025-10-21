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
  onSave: (workflow: {
    name: string;
    states: WorkflowState[];
    transitions: Record<string, string[]>;
  }) => void;
}

export function WorkflowConfigDialog({
  open,
  onOpenChange,
  onSave,
}: WorkflowConfigDialogProps) {
  const [workflowName, setWorkflowName] = useState("Workflow Padrão");
  const [states, setStates] = useState<WorkflowState[]>([
    { id: "1", name: "Em atribuição" },
    { id: "2", name: "Em desenvolvimento" },
    { id: "3", name: "Em revisão" },
    { id: "4", name: "Documentação" },
    { id: "5", name: "Entregue" },
  ]);
  const [transitions, setTransitions] = useState<Record<string, string[]>>({});

  const handleAddState = () => {
    const newId = String(Date.now());
    setStates([
      ...states,
      { id: newId, name: `Novo estado ${states.length + 1}` },
    ]);
  };

  const handleRemoveState = (id: string) => {
    setStates(states.filter((s) => s.id !== id));
  };

  const handleChangeStateName = (id: string, newName: string) => {
    setStates(states.map((s) => (s.id === id ? { ...s, name: newName } : s)));
  };

  const handleToggleTransition = (from: string, to: string) => {
    setTransitions((prev) => {
      const allowed = prev[from] || [];
      return {
        ...prev,
        [from]: allowed.includes(to)
          ? allowed.filter((t) => t !== to)
          : [...allowed, to],
      };
    });
  };

  const handleSave = () => {
    onSave({ name: workflowName, states, transitions });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl space-y-6">
          <Dialog.Title className="text-xl font-semibold text-gray-900">
            Configurar Workflow
          </Dialog.Title>

          {/* Nome do workflow */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Workflow
            </label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Lista de estados */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-800">Estados</h4>
              <button
                onClick={handleAddState}
                className="px-3 py-1 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                + Adicionar Estado
              </button>
            </div>
            <div className="space-y-2">
              {states.map((state) => (
                <div key={state.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={state.name}
                    onChange={(e) =>
                      handleChangeStateName(state.id, e.target.value)
                    }
                    className="flex-1 border rounded-md p-2"
                  />
                  <button
                    onClick={() => handleRemoveState(state.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela de transições */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">
              Transições Permitidas
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">De / Para</th>
                    {states.map((to) => (
                      <th key={to.id} className="p-2 text-center">
                        {to.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {states.map((from) => (
                    <tr key={from.id}>
                      <td className="p-2 font-medium border-r">{from.name}</td>
                      {states.map((to) => (
                        <td key={to.id} className="p-2 text-center border">
                          {from.id !== to.id && (
                            <input
                              type="checkbox"
                              checked={
                                transitions[from.id]?.includes(to.id) || false
                              }
                              onChange={() =>
                                handleToggleTransition(from.id, to.id)
                              }
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botões */}
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
              Salvar Workflow
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
