import { useEffect, useState } from "react";
import { getSectors } from "../../api/services/sectors";
import { toast } from "sonner";
import { Plus, Search, Edit2, Building, Users } from "lucide-react";
import EditSetor from "./EditSectors";

interface Setor {
  id: number;
  nome: string;
}

const Setores: React.FC = () => {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setorToEdit, setSetorToEdit] = useState<Setor | null>(null);

  useEffect(() => {
    loadSetores();
  }, []);

  const loadSetores = async () => {
    try {
      setLoading(true);
      const data = await getSectors();
      setSetores(data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      toast.error("Erro ao carregar setores");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSetorToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (setor: Setor) => {
    setSetorToEdit(setor);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    loadSetores();
  };

  const filteredSetores = setores.filter((setor) =>
    setor.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#4c010c] rounded-full animate-spin"></div>
            <div
              className="w-12 h-12 border-4 border-transparent border-t-red-300 rounded-full animate-spin absolute top-2 left-2"
              style={{ animationDuration: "0.8s" }}
            ></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando...</h2>
            <p className="text-gray-500">Buscando setores do sistema</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Gerenciar Setores</h1>
            <p className="text-gray-600">Crie e organize os setores da empresa</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-3 bg-[#4c010c] text-white rounded-xl hover:bg-[#3a0109] transition-all font-bold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Setor
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar setores..."
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4c010c] focus:border-transparent transition-all shadow-sm hover:shadow-md bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSetores.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">
                Nenhum setor encontrado
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 px-6 py-2 bg-[#4c010c] text-white rounded-lg hover:bg-[#3a0109] transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar primeiro setor
              </button>
            </div>
          ) : (
            filteredSetores.map((setor) => (
              <div
                key={setor.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-[#4c010c] transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#4c010c]/10 rounded-xl group-hover:bg-[#4c010c]/20 transition-colors">
                      <Building className="w-6 h-6 text-[#4c010c]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{setor.nome}</h3>
                      <span className="text-xs text-gray-500">ID #{setor.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEditModal(setor)}
                    className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5 text-yellow-600" />
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Setor da organização</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <EditSetor
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        setor={setorToEdit}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Setores;