"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";
import { Ocorrencia } from "../../../api/types/ocorrencia";

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
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-lg p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Detalhes da Ocorrência
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Título e Descrição */}
            <div>
              <h3 className="font-semibold text-gray-700">Título</h3>
              <p className="text-gray-900">{ocorrencia.titulo}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">Descrição</h3>
              <p className="text-gray-900">{ocorrencia.descricao}</p>
            </div>

            {/* Status */}
            {ocorrencia.status && (
              <div>
                <h3 className="font-semibold text-gray-700">Status</h3>
                <p className="text-gray-900">{ocorrencia.status.nome}</p>
              </div>
            )}

            {/* Gestor e Colaborador */}
            {ocorrencia.gestor && (
              <div>
                <h3 className="font-semibold text-gray-700">Gestor</h3>
                <p className="text-gray-900">
                  {ocorrencia.gestor.nome} ({ocorrencia.gestor.email})
                </p>
              </div>
            )}
            {ocorrencia.colaborador && (
              <div>
                <h3 className="font-semibold text-gray-700">Colaborador</h3>
                <p className="text-gray-900">
                  {ocorrencia.colaborador.nome} ({ocorrencia.colaborador.email})
                </p>
              </div>
            )}

            {/* Setor */}
            {ocorrencia.setor && (
              <div>
                <h3 className="font-semibold text-gray-700">Setor</h3>
                <p className="text-gray-900">{ocorrencia.setor.nome}</p>
              </div>
            )}

            {/* Datas */}
            <div>
              <h3 className="font-semibold text-gray-700">Criado em</h3>
              <p className="text-gray-900">
                {new Date(ocorrencia.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
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
              <div>
                <h3 className="font-semibold text-gray-700">Subtarefas</h3>
                <ul className="list-disc list-inside">
                  {ocorrencia.subtarefas.map((sub) => (
                    <li key={sub.id} className="text-gray-900">
                      {sub.titulo}{" "}
                      {sub.status && (
                        <span className="text-xs text-gray-500">
                          ({sub.status})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Histórico */}
            {ocorrencia.historicos.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700">Histórico</h3>
                <ul className="list-disc list-inside">
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
              <div>
                <h3 className="font-semibold text-gray-700">Documentação</h3>
                <a
                  href={ocorrencia.documentacaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
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
