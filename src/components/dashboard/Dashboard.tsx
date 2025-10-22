import { Column } from "../kanbanBoard/kanbanData";
import { useLocalStorage } from "../../hooks/useLocalStorage";

export default function Dashboard() {
  const [columns] = useLocalStorage<Column[]>("kanban-columns", []);

  const allCards = columns.flatMap((c) => c.cards);
  const total = allCards.length;
  const done = columns.find((c) => c.title === "Concluído")?.cards.length || 0;
  const inProgress =
    columns.find((c) => c.title === "Em Progresso")?.cards.length || 0;
  const backlog = columns.find((c) => c.title === "Backlog")?.cards.length || 0;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total de Tarefas" value={total} color="bg-indigo-500" />
        <Card title="Em Progresso" value={inProgress} color="bg-yellow-500" />
        <Card title="Backlog" value={backlog} color="bg-gray-400" />
        <Card title="Concluídas" value={done} color="bg-green-600" />
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`p-6 rounded-lg shadow-md text-white ${color} flex flex-col items-center`}
    >
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
