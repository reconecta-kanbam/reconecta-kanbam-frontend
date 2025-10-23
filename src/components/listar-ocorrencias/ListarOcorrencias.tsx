"use client";

import React, { useEffect, useState } from "react";
import { Ocorrencia } from "../../api/types/ocorrencia";
import api from "../../api/api";
import ENDPOINTS from "../../api/endpoints";

interface TaskDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ocorrencia: Ocorrencia | null;
  onAddSubtask: (
    ocorrenciaId: number,
    subtask: { titulo: string; descricao: string }
  ) => void;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  isOpen,
  onClose,
  ocorrencia,
  onAddSubtask,
}) => {
  const [newSubtask, setNewSubtask] = useState({ titulo: "", descricao: "" });

  if (!isOpen || !ocorrencia) return null;

  const handleAddSubtask = () => {
    onAddSubtask(ocorrencia.id, newSubtask);
    setNewSubtask({ titulo: "", descricao: "" });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{ocorrencia.titulo}</h2>
        <p className="mb-4">{ocorrencia.descricao}</p>

        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Detalhes</h3>
          <p>
            <strong>Status:</strong> {ocorrencia.status?.nome || "Não definido"}
          </p>
          <p>
            <strong>Setor:</strong> {ocorrencia.setor?.nome || "Não definido"}
          </p>
          <p>
            <strong>Criado em:</strong>{" "}
            {new Date(ocorrencia.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Subtarefas</h3>
          {ocorrencia.subtarefas.map((subtask) => (
            <div key={subtask.id} className="p-2 border rounded mb-2">
              <h4 className="font-semibold">{subtask.titulo}</h4>
              {subtask.descricao && <p>{subtask.descricao}</p>}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Adicionar Subtarefa</h3>
          <input
            type="text"
            placeholder="Título da subtarefa"
            className="w-full p-2 border rounded mb-2"
            value={newSubtask.titulo}
            onChange={(e) =>
              setNewSubtask({ ...newSubtask, titulo: e.target.value })
            }
          />
          <textarea
            placeholder="Descrição da subtarefa"
            className="w-full p-2 border rounded mb-2"
            value={newSubtask.descricao}
            onChange={(e) =>
              setNewSubtask({ ...newSubtask, descricao: e.target.value })
            }
          />
          <button
            onClick={handleAddSubtask}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Adicionar Subtarefa
          </button>
        </div>

        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

const ListarOcorrencias = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOcorrencia, setSelectedOcorrencia] =
    useState<Ocorrencia | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchOcorrencias = async () => {
      try {
        const response = await api.get(ENDPOINTS.LIST_OCORRENCIAS);
        setOcorrencias(response.data);
      } catch (error) {
        console.error("Erro ao buscar ocorrências:", error);
      }
    };

    fetchOcorrencias();
  }, []);

  const handleAddSubtask = async (
    ocorrenciaId: number,
    subtask: { titulo: string; descricao: string }
  ) => {
    try {
      await api.post(`${ENDPOINTS.CREATE_SUBTAREFA}/${ocorrenciaId}`, subtask);
      // Atualiza a lista de ocorrências após adicionar a subtarefa
      const response = await api.get(ENDPOINTS.LIST_OCORRENCIAS);
      setOcorrencias(response.data);
    } catch (error) {
      console.error("Erro ao adicionar subtarefa:", error);
    }
  };

  const filteredOcorrencias = ocorrencias.filter(
    (ocorrencia) =>
      ocorrencia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ocorrencia.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-6 p-4">
        <input
          type="text"
          placeholder="Pesquisar ocorrências..."
          className="w-full p-3 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className=" mx-auto p-4">
        <div className="grid gap-4">
          {filteredOcorrencias.map((ocorrencia) => (
            <div
              key={ocorrencia.id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedOcorrencia(ocorrencia);
                setIsDialogOpen(true);
              }}
            >
              <h3 className="text-xl font-semibold mb-2">
                {ocorrencia.titulo}
              </h3>
              <p className="text-gray-600">{ocorrencia.descricao}</p>
              <div className="mt-2 text-sm text-gray-500">
                Subtarefas: {ocorrencia.subtarefas.length}
              </div>
            </div>
          ))}
        </div>

        <TaskDetailDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedOcorrencia(null);
          }}
          ocorrencia={selectedOcorrencia}
          onAddSubtask={handleAddSubtask}
        />
      </div>
    </>
  );
};

export default ListarOcorrencias;
