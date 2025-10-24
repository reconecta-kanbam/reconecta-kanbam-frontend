"use client";

import type React from "react";
import { useEffect, useState } from "react";
import type { Ocorrencia } from "../../api/types/ocorrencia";
import api from "../../api/api";
import ENDPOINTS from "../../api/endpoints";
import {
  Search,
  X,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  User,
  File,
  PenBox,
} from "lucide-react";
import OcorrenciaActions from "./OcorrenciaActions";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-[#4c010c] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2 pr-10">{ocorrencia.titulo}</h2>

          <p className="text-red-100 text-sm">{ocorrencia.descricao}</p>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6">
          {/* Detalhes */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                  Status
                </span>
              </div>
              <p className="text-green-900 font-medium">
                {ocorrencia.status?.nome || "Não definido"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                  Setor
                </span>
              </div>
              <p className="text-purple-900 font-medium">
                {ocorrencia.setor?.nome || "Não definido"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#ffffa6] to-yellow-100 p-4 rounded-xl border border-yellow-300">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-yellow-800" />
                <span className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">
                  Criado em
                </span>
              </div>
              <p className="text-yellow-900 font-medium text-sm">
                {new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Subtarefas */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#4c010c]" />
              Subtarefas ({ocorrencia.subtarefas.length})
            </h3>
            <div className="space-y-2">
              {ocorrencia.subtarefas.length === 0 ? (
                <p className="text-gray-500 text-sm italic py-4 text-center bg-gray-50 rounded-lg">
                  Nenhuma subtarefa adicionada ainda
                </p>
              ) : (
                ocorrencia.subtarefas.map((subtask) => (
                  <details
                    key={subtask.id}
                    className="group bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl hover:shadow-md transition-all"
                  >
                    <summary className="p-4 cursor-pointer list-none flex justify-between items-center">
                      <h4 className="font-semibold text-gray-800">
                        {subtask.titulo}
                      </h4>
                      <div className="transform transition-transform group-open:rotate-180">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </summary>
                    <div className="p-4 pt-0 space-y-3">
                      {subtask.descricao && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Descrição:
                          </p>
                          <p className="text-gray-600">{subtask.descricao}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Status:
                        </p>
                        <p className="text-gray-600 capitalize">
                          {subtask.status?.replace(/_/g, " ") || "Não definido"}
                        </p>
                      </div>
                      {subtask.responsavel && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Responsável:
                          </p>
                          <p className="text-gray-600">
                            {subtask.responsavel.nome}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {subtask.responsavel.email}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Criado em:
                        </p>
                        <p className="text-gray-600">
                          {new Date(subtask.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </p>
                      </div>
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-xl border-2 border-[#4c010c]/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#4c010c]" />
              Adicionar Nova Subtarefa
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título da subtarefa"
                className="w-full p-3 border-2 border-[#4c010c]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all"
                value={newSubtask.titulo}
                onChange={(e) =>
                  setNewSubtask({ ...newSubtask, titulo: e.target.value })
                }
              />
              <textarea
                placeholder="Descrição da subtarefa (opcional)"
                className="w-full p-3 border-2 border-[#4c010c]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all resize-none"
                rows={3}
                value={newSubtask.descricao}
                onChange={(e) =>
                  setNewSubtask({ ...newSubtask, descricao: e.target.value })
                }
              />
              <button
                onClick={handleAddSubtask}
                className="w-full bg-[#4c010c] text-white px-4 py-3 rounded-lg hover:bg-[#3a0109] transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Adicionar Subtarefa
              </button>
            </div>
          </div>
        </div>
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
      // Aqui você precisa definir o responsável. Se for fixo ou selecionável, adapte
      const responsavelId = 10; // exemplo fixo, você pode adicionar input para escolher

      const response = await api.post(
        ENDPOINTS.CREATE_SUBTAREFA(ocorrenciaId),
        {
          ...subtask,
          responsavelId,
        }
      );

      console.log("API Response:", response.data);

      // Map the response data to match our Subtarefa interface
      const createdSubtask = {
        id: response.data.id,
        titulo: response.data.titulo,
        descricao: response.data.descricao,
        status: response.data.status,
        createdAt: response.data.createdAt,
        responsavel: response.data.responsavel
          ? {
              id: response.data.responsavel.id,
              nome: response.data.responsavel.nome,
              email: response.data.responsavel.email,
            }
          : undefined,
      };

      console.log("Mapped Subtask:", createdSubtask);

      // Atualiza a ocorrência localmente para não precisar buscar do servidor
      setOcorrencias((prev) =>
        prev.map((ocorrencia) =>
          ocorrencia.id === ocorrenciaId
            ? {
                ...ocorrencia,
                subtarefas: [...ocorrencia.subtarefas, createdSubtask],
              }
            : ocorrencia
        )
      );

      console.log("Updated Ocorrencias:", ocorrencias);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ocorrências</h1>
          <p className="text-gray-600">
            Gerencie e acompanhe todas as ocorrências do sistema
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar ocorrências por título ou descrição..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all shadow-sm hover:shadow-md bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-5">
          {filteredOcorrencias.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-gray-600 text-lg font-medium">
                Nenhuma ocorrência encontrada
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Tente ajustar sua pesquisa
              </p>
            </div>
          ) : (
            filteredOcorrencias.map((ocorrencia) => (
              <div
                key={ocorrencia.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:border-[#4c010c] transition-all duration-200 hover:-translate-y-1 group"
                onClick={() => {
                  setSelectedOcorrencia(ocorrencia);
                  setIsDialogOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#4c010c] transition-colors">
                    {ocorrencia.titulo}
                  </h3>
                  <span className="bg-[#ffffa6] text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-300">
                    #{ocorrencia.id}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  <PenBox className="w-5 h-5 inline mr-2" />
                  {ocorrencia.descricao}
                </p>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  <User className="w-5 h-5 inline mr-2" />
                  Colaborador: {ocorrencia.colaborador?.nome}
                </p>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  <User className="w-5 h-5 inline mr-2" />
                  Gestor: {ocorrencia.gestor?.nome}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 bg-[#4c010c]/10 text-[#4c010c] px-3 py-1 rounded-full border border-[#4c010c]/20">
                      <Layers className="w-4 h-4" />
                      <span className="font-medium">
                        {ocorrencia.subtarefas.length} subtarefas
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(ocorrencia.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <OcorrenciaActions
                  id={ocorrencia.id}
                  onDeleted={(deletedId) =>
                    setOcorrencias((prev) =>
                      prev.filter((o) => o.id !== deletedId)
                    )
                  }
                />
              </div>
            ))
          )}
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
    </div>
  );
};

export default ListarOcorrencias;
