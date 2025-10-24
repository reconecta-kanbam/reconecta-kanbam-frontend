"use client";

import { useEffect, useState } from "react";
import {
  createOcorrencia,
  listOcorrencias,
} from "../../api/services/ocorrencias";
import {
  Ocorrencia,
  Setor,
  CreateOcorrenciaRequest,
} from "../../api/types/ocorrencia";
import { toast } from "sonner";
import { Plus, FileText, Layers } from "lucide-react";

export default function Occurrences() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [form, setForm] = useState<CreateOcorrenciaRequest>({
    titulo: "",
    descricao: "",
    setorId: 1,
    colaboradorId: 7,
  });

  // 🔹 Carregar ocorrências e setores
  useEffect(() => {
    const loadData = async () => {
      try {
        const ocorrenciasData = await listOcorrencias();
        setOcorrencias(ocorrenciasData);

        const setoresData: Setor[] = [
          { id: 1, nome: "TI" },
          { id: 2, nome: "Financeiro" },
          { id: 3, nome: "RH" },
          { id: 4, nome: "Operações" },
        ];
        setSetores(setoresData);
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      }
    };
    loadData();
  }, []);

  // 🔹 Criar nova ocorrência
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titulo.trim() || !form.descricao.trim()) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    try {
      const nova = await createOcorrencia(form);
      setOcorrencias((prev) => [...prev, nova]);

      toast.success("Ocorrência criada com sucesso!");

      setForm({
        titulo: "",
        descricao: "",
        setorId: setores[0]?.id || 1,
        colaboradorId: 7,
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar ocorrência. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Plus className="w-10 h-10 text-[#4c010c]" />
            Nova Ocorrência
          </h2>
          <p className="text-gray-600">
            Preencha os campos abaixo para criar uma nova ocorrência
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-8 space-y-6 border-2 border-gray-200"
        >
          {/* Título */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2 text-lg">
              <FileText className="w-5 h-5 text-[#4c010c]" />
              Título
            </label>
            <input
              className="w-full border-2 border-gray-200 p-4 rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all text-gray-800 font-medium"
              placeholder="Digite o título da ocorrência..."
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2 text-lg">
              <FileText className="w-5 h-5 text-[#4c010c]" />
              Descrição
            </label>
            <textarea
              className="w-full border-2 border-gray-200 p-4 rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all resize-none text-gray-800"
              rows={5}
              placeholder="Descreva a ocorrência em detalhes..."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>

          {/* Setor */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-800 mb-2 text-lg">
              <Layers className="w-5 h-5 text-[#4c010c]" />
              Setor
            </label>
            <select
              value={form.setorId}
              onChange={(e) =>
                setForm({ ...form, setorId: Number(e.target.value) })
              }
              className="w-full border-2 border-gray-200 p-4 rounded-xl mt-1 focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all text-gray-800 font-medium cursor-pointer"
            >
              {setores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Botão de Submit */}
          <button
            type="submit"
            className="w-full px-6 py-4 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mt-8"
          >
            <Plus className="w-6 h-6" />
            Criar Ocorrência
          </button>
        </form>

        {/* Informação adicional */}
        <div className="mt-6 bg-[#ffffa6] border-2 border-yellow-300 rounded-xl p-5">
          <p className="text-yellow-900 font-medium text-center">
            💡 Após criar a ocorrência, você poderá adicionar subtarefas e
            acompanhar o progresso no Kanban Board
          </p>
        </div>

        {ocorrencias.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              Última Ocorrência
            </h2>
            <div className="bg-white shadow-xl rounded-2xl p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {ocorrencias[0].titulo}
              </h3>
              <p className="text-gray-600">{ocorrencias[0].descricao}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
