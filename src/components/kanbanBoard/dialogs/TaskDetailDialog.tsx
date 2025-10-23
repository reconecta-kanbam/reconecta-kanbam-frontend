"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type React from "react";
import type { Ocorrencia } from "../../../api/types/ocorrencia";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocorrencia: Ocorrencia;
}

export const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  open,
  onOpenChange,
  ocorrencia,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl p-8 overflow-y-auto z-50 rounded-l-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              Detalhes da Ocorrência
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-700 transition-colors">
              <X size={24} />
            </Dialog.Close>
          </div>

          <div className="space-y-6">
            {/* Título e Descrição */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-1">Título</h3>
              <p className="text-gray-900">{ocorrencia.titulo}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-1">Descrição</h3>
              <p className="text-gray-900">{ocorrencia.descricao}</p>
            </div>

            {/* Status */}
            {ocorrencia.status && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-1">Status</h3>
                <p className="text-green-900">{ocorrencia.status.nome}</p>
              </div>
            )}

            {/* Gestor e Colaborador */}
            {ocorrencia.gestor && (
              <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-1">
                <h3 className="font-semibold text-gray-700">Gestor</h3>
                <p className="text-gray-900">
                  {ocorrencia.gestor.nome} ({ocorrencia.gestor.email})
                </p>
              </div>
            )}
            {ocorrencia.colaborador && (
              <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-1">
                <h3 className="font-semibold text-gray-700">Colaborador</h3>
                <p className="text-gray-900">
                  {ocorrencia.colaborador.nome} ({ocorrencia.colaborador.email})
                </p>
              </div>
            )}

            {/* Setor */}
            {ocorrencia.setor && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-700">Setor</h3>
                <p className="text-gray-900">{ocorrencia.setor.nome}</p>
              </div>
            )}

            {/* Datas */}
            <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-1">
              <h3 className="font-semibold text-gray-700">Criado em</h3>
              <p className="text-gray-900">
                {new Date(ocorrencia.createdAt).toLocaleString("pt-BR")}
              </p>
              <h3 className="font-semibold text-gray-700 mt-2">
                Última atualização
              </h3>
              <p className="text-gray-900">
                {new Date(ocorrencia.updatedAt).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </div>

            {/* Subtarefas */}
            {ocorrencia.subtarefas.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2">Subtarefas</h3>
                <ul className="list-disc list-inside space-y-1">
                  {ocorrencia.subtarefas.map((sub) => (
                    <li key={sub.id} className="text-gray-900">
                      {sub.titulo}{" "}
                      {sub.status && (
                        <span className="text-xs text-gray-500">
                          ({sub.status})
                        </span>
                      )}
                      {sub.descricao}
                      {sub.createdAt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Histórico */}
            {ocorrencia.historicos.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-2">Histórico</h3>
                <ul className="list-disc list-inside space-y-1">
                  {ocorrencia.historicos.map((h) => (
                    <li key={h.id} className="text-gray-900">
                      {new Date(h.dataHora).toLocaleString("pt-BR")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documentação */}
            {ocorrencia.documentacaoUrl && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-1">
                  Documentação
                </h3>
                <a
                  href={ocorrencia.documentacaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Abrir documento
                </a>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
