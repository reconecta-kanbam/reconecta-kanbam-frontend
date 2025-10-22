import { Link } from "react-router-dom";

// Quando o backend chegar:
// substituir mockProjects → GET /projects
// o project.id servirá para filtrar os cards por projeto no Kanban.

const mockProjects = [
  {
    id: "1",
    name: "Sistema de Ocorrências",
    description: "Monitoramento e suporte interno",
  },
  {
    id: "2",
    name: "Portal Corporativo",
    description: "Novo portal de comunicação",
  },
  { id: "3", name: "Dashboard Financeiro", description: "Análises e KPIs" },
];

export default function ProjectsList() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Projetos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <Link
            to={`/projects/${project.id}`}
            key={project.id}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-indigo-700">
              {project.name}
            </h3>
            <p className="text-gray-600 text-sm mt-2">{project.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
