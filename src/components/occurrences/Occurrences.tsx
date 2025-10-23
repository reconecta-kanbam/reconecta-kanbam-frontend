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
} from "../../api/types/ocorrencia";
import { ConfirmDialog } from "../kanbanBoard/dialogs/ConfirmDialog";

export default function Occurrences() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [form, setForm] = useState<CreateOcorrenciaRequest>({
    titulo: "",
    descricao: "",
    setorId: 1,
    colaboradorId: 7,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 🔹 Buscar ocorrências existentes
  useEffect(() => {
    const loadOcorrencias = async () => {
      try {
        const data = await listOcorrencias();
        console.log("✅ Ocorrências carregadas:", data);
        setOcorrencias(data);
      } catch (err) {
        console.error("❌ Erro ao buscar ocorrências", err);
      }
    };
    loadOcorrencias();
  }, []);

  // 🔹 Criar nova ocorrência
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("🟢 Enviando nova ocorrência:", form);
      const nova = await createOcorrencia(form);
      console.log("✅ Criada:", nova);
      setOcorrencias((prev) => [...prev, nova]);
      setForm({ titulo: "", descricao: "", setorId: 1, colaboradorId: 7 });
    } catch (err) {
      console.error("❌ Erro ao criar ocorrência", err);
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
      console.log(`🟠 Excluindo ocorrência ${selectedId}...`);
      await deleteOcorrencia(selectedId);
      setOcorrencias((prev) => prev.filter((o) => o.id !== selectedId));
      console.log(`✅ Ocorrência ${selectedId} removida`);
    } catch (err) {
      console.error("❌ Erro ao excluir ocorrência", err);
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

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Criar Ocorrência
        </button>
      </form>

      {ocorrencias.length > 0 ? (
        <ul className="space-y-4">
          {ocorrencias.map((o) => (
            <li
              key={o.id}
              className="relative bg-white rounded-lg p-4 shadow-md border-l-4 border-indigo-500"
            >
              <button
                onClick={() => handleDeleteClick(o.id)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
              >
                ✕
              </button>
              <h4 className="font-semibold">{o.titulo}</h4>
              <p className="text-sm text-gray-600 mt-1">{o.descricao}</p>
              <p className="text-xs mt-2 text-gray-500">
                Setor: <strong>{o.setorId}</strong> • Colaborador:{" "}
                <strong>{o.colaboradorNome || o.colaboradorId}</strong>
              </p>
              {o.status && (
                <p className="text-xs text-gray-400 mt-1">Status: {o.status}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">
          Nenhuma ocorrência criada ainda.
        </p>
      )}

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
