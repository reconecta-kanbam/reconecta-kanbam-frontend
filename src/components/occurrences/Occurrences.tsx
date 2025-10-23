"use client";

import { useEffect, useState } from "react";
import {
  createOcorrencia,
  listOcorrencias,
  deleteOcorrencia,
} from "../../api/services/ocorrencias";
import {
  Ocorrencia,
  CreateOcorrenciaRequest,
  Setor,
} from "../../api/types/ocorrencia";
import { ConfirmDialog } from "../kanbanBoard/dialogs/ConfirmDialog";

export default function Occurrences() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [form, setForm] = useState<CreateOcorrenciaRequest>({
    titulo: "",
    descricao: "",
    setorId: 1, // apenas o ID
    colaboradorId: 7,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 🔹 Buscar ocorrências e setores do backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const ocorrenciasData = await listOcorrencias();
        setOcorrencias(ocorrenciasData);

        // Exemplo: setores poderiam vir de outro endpoint
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
    try {
      const nova = await createOcorrencia(form);
      setOcorrencias((prev) => [...prev, nova]);
      setForm({
        titulo: "",
        descricao: "",
        setorId: setores[0].id,
        colaboradorId: 7,
      });
    } catch (err) {
      console.error("Erro ao criar ocorrência", err);
    }
  };

  // 🔹 Deletar ocorrência com modal
  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteOcorrencia(selectedId);
      setOcorrencias((prev) => prev.filter((o) => o.id !== selectedId));
    } catch (err) {
      console.error("Erro ao excluir ocorrência", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Ocorrências</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 mb-8 space-y-4"
      >
        <div>
          <label className="block font-medium text-gray-700">Título</label>
          <input
            className="w-full border p-2 rounded-md mt-1"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full border p-2 rounded-md mt-1"
            rows={3}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Setor</label>
          <select
            value={form.setorId}
            onChange={(e) =>
              setForm({ ...form, setorId: Number(e.target.value) })
            }
            className="w-full border p-2 rounded-md mt-1"
          >
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Criar Ocorrência
        </button>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir ocorrência"
        description="Tem certeza que deseja excluir esta ocorrência? Essa ação não poderá ser desfeita."
      />
    </div>
  );
}
