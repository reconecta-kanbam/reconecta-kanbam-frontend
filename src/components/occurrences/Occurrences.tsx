import { useState } from "react";

// POST /occurrences → cria ocorrência.
// Slack será chamado pelo backend automaticamente.

interface Occurrence {
  id: string;
  title: string;
  description: string;
  priority: "baixa" | "média" | "alta";
}

export default function Occurrences() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "média" as "baixa" | "média" | "alta",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = { ...form, id: crypto.randomUUID() };
    setOccurrences((prev) => [...prev, newItem]);
    setForm({ title: "", description: "", priority: "média" });
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
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Descrição</label>
          <textarea
            className="w-full border p-2 rounded-md mt-1"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Prioridade</label>
          <select
            className="border p-2 rounded-md mt-1"
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value as "baixa" | "média" | "alta",
              })
            }
          >
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Criar Ocorrência
        </button>
      </form>

      {occurrences.length > 0 ? (
        <ul className="space-y-4">
          {occurrences.map((o) => (
            <li
              key={o.id}
              className="bg-white rounded-lg p-4 shadow-md border-l-4"
              style={{
                borderColor:
                  o.priority === "alta"
                    ? "#dc2626"
                    : o.priority === "média"
                    ? "#f59e0b"
                    : "#16a34a",
              }}
            >
              <h4 className="font-semibold">{o.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{o.description}</p>
              <p className="text-xs mt-2 text-gray-500">
                Prioridade: <strong>{o.priority}</strong>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">
          Nenhuma ocorrência criada ainda.
        </p>
      )}
    </div>
  );
}
