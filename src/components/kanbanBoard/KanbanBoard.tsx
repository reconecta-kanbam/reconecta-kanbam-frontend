// src/components/kanbanBoard/KanbanBoard.tsx
import { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { getKanbanData } from "../../api/services/kanban";
import { updateStatusViaDrag, assignOcorrencia, autoAssignOcorrencia, createOcorrencia } from "../../api/services/ocorrencias";
import { createStatus, updateStatus, deleteStatus } from "../../api/services/status";
import { listWorkflows, createWorkflow, updateWorkflow, deleteWorkflow } from "../../api/services/workflows";
import { Column, Card } from "../../api/types/kanban";
import { 
  User, GripVertical, Eye, Calendar, Settings, Plus, Edit2, Trash2, 
  LayoutGrid, List as ListIcon, Folder, ChevronDown, ArrowLeft, Send
} from "lucide-react";
import TaskDetailDialog from "./dialogs/TaskDetailDialog";
import Filters, { FilterOptions } from "../Filters/Filters";
import { listColaboradores } from "../../api/services/usuario";
import { useNavigate, useSearchParams } from "react-router-dom";

type ViewMode = "kanban" | "list";
type ManagerMode = "status" | "workflow";

interface Workflow {
  id: number;
  nome: string;
  descricao?: string;
}

interface OnlineUser {
  id: number;
  nome: string;
  email: string;
  iniciais: string;
  cor: string;
}

const KanbanBoard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const workflowIdFromUrl = searchParams.get("workflowId");
  const initialWorkflowId = workflowIdFromUrl ? Number(workflowIdFromUrl) : null;

  // Estados principais
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  // Estados de Criação de Ocorrência
  const [creatingInColumn, setCreatingInColumn] = useState<string | null>(null);
  const [newOcorrenciaTitle, setNewOcorrenciaTitle] = useState("");
  const [loadingOcorrencia, setLoadingOcorrencia] = useState(false);

  // Estados do gerenciador
  const [showManager, setShowManager] = useState(false);
  const [managerMode, setManagerMode] = useState<ManagerMode>("status");

  // Estados de Status
  const [editingStatus, setEditingStatus] = useState<any | null>(null);
  const [newStatusChave, setNewStatusChave] = useState("");
  const [newStatusNome, setNewStatusNome] = useState("");
  const [newStatusWorkflowId, setNewStatusWorkflowId] = useState<number | undefined>(undefined);

  // Estados de Workflow
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [newWorkflowNome, setNewWorkflowNome] = useState("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState("");

  // Estados de Usuários Online
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  const [activeWorkflowId, setActiveWorkflowId] = useState<number | null>(initialWorkflowId); // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // Estados de notificação e confirmação
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: number | null;
    nome: string;
    type: "status" | "workflow";
  }>({ open: false, id: null, nome: "", type: "status" });

  // 👇 BUSCAR NOME DO WORKFLOW ATIVO
  const activeWorkflow = workflows.find(wf => wf.id === activeWorkflowId);

  // ==================== FUNÇÕES UTILITÁRIAS ====================

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const loadKanban = useCallback(async (currentFilters: FilterOptions = {}) => {
    try {
      setLoading(true);
      const filtersWithWorkflow = {
        ...currentFilters,
        ...(activeWorkflowId ? { workflowId: activeWorkflowId } : {}),
      };
      const data = await getKanbanData(filtersWithWorkflow);
      setColumns(data);
    } catch (err) {
      showNotification("Erro ao carregar dados do Kanban", "error");
    } finally {
      setLoading(false);
    }
  }, [activeWorkflowId]);

  const loadWorkflows = useCallback(async () => {
    try {
      const data = await listWorkflows();
      setWorkflows(data);
    } catch (error) {
      showNotification("Erro ao carregar workflows", "error");
    }
  }, []);

  const loadOnlineUsers = useCallback(async () => {
    try {
      const colaboradores = await listColaboradores();
      const users = colaboradores.slice(0, 10).map((colab) => ({
        id: colab.id,
        nome: colab.nome,
        email: colab.email,
        iniciais: getInitials(colab.nome),
        cor: getRandomColor(),
      }));
      setOnlineUsers(users);
    } catch (error) {
      console.error("Erro ao carregar usuários online:", error);
    }
  }, []);

  // ==================== HANDLERS DE OCORRÊNCIA ====================

  const handleCreateOcorrenciaInColumn = async (columnId: string) => {
    if (!newOcorrenciaTitle.trim()) {
      showNotification("Título não pode estar vazio", "error");
      return;
    }

    if (!activeWorkflowId) {
      showNotification("Selecione um workflow primeiro", "error");
      return;
    }

    setLoadingOcorrencia(true);
    try {
      const column = columns.find(col => col.id === columnId);
      if (!column) {
        showNotification("Coluna não encontrada", "error");
        return;
      }

      // ✅ CORRIGIDO: Incluir statusId da coluna na criação
      await createOcorrencia({
        titulo: newOcorrenciaTitle.trim(),
        workflowId: activeWorkflowId,
        statusId: column.statusId, // ✅ ADICIONADO
      } as any);

      showNotification(`Ocorrência "${newOcorrenciaTitle}" criada com sucesso!`, "success");
      setNewOcorrenciaTitle("");
      setCreatingInColumn(null);
      
      // ✅ Recarregar o Kanban
      setTimeout(() => {
        loadKanban(filters);
      }, 500);
    } catch (error: any) {
      console.error("Erro ao criar ocorrência:", error.response?.data || error);
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    } finally {
      setLoadingOcorrencia(false);
    }
  };

  const handleAssignOcorrencia = async (ocorrenciaId: number, colaboradorId: number) => {
    try {
      const updatedOcorrencia = await assignOcorrencia(ocorrenciaId, { colaboradorId });

      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card.ocorrencia?.id === ocorrenciaId
              ? { ...card, ocorrencia: updatedOcorrencia }
              : card
          ),
        }))
      );

      if (selectedCard?.ocorrencia?.id === ocorrenciaId) {
        setSelectedCard((prev) =>
          prev ? { ...prev, ocorrencia: updatedOcorrencia } : null
        );
      }

      showNotification("Ocorrência atribuída com sucesso!", "success");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const handleAutoAssignOcorrencia = async (ocorrenciaId: number) => {
    try {
      const updatedOcorrencia = await autoAssignOcorrencia(ocorrenciaId);

      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card.ocorrencia?.id === ocorrenciaId
              ? { ...card, ocorrencia: updatedOcorrencia }
              : card
          ),
        }))
      );

      if (selectedCard?.ocorrencia?.id === ocorrenciaId) {
        setSelectedCard((prev) =>
          prev ? { ...prev, ocorrencia: updatedOcorrencia } : null
        );
      }

      showNotification("Ocorrência auto-atribuída com sucesso!", "success");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  // ==================== HANDLERS DE STATUS ====================

  const generateChaveFromNome = (nome: string): string => {
    return nome
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const handleCreateStatus = async () => {
    if (!newStatusNome.trim()) {
      showNotification("Nome do status é obrigatório", "error");
      return;
    }

    try {
      const chaveGerada = generateChaveFromNome(newStatusNome);
      const proximaOrdem = columns.filter(c => c.id !== "sem_status").length + 1;

      const statusPayload = {
        chave: chaveGerada,
        nome: newStatusNome.trim(),
        ordem: proximaOrdem,
        workflowId: newStatusWorkflowId || (activeWorkflowId || undefined),
      };


      await createStatus(statusPayload);

      showNotification(`Status "${newStatusNome}" criado com sucesso!`, "success");
      setNewStatusChave("");
      setNewStatusNome("");
      setNewStatusWorkflowId(undefined);
      
      // ✅ CORRIGIDO: Recarregar imediatamente
      setTimeout(() => {
        loadKanban(filters);
      }, 300);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };
  
  const handleUpdateStatus = async () => {
    if (!editingStatus) return;

    if (!newStatusChave.trim() || !newStatusNome.trim()) {
      showNotification("Chave e nome do status são obrigatórios", "error");
      return;
    }

    try {
      await updateStatus(editingStatus.id, {
        chave: newStatusChave.trim(),
        nome: newStatusNome.trim(),
        ordem: editingStatus.ordem,
        workflowId: newStatusWorkflowId,
      });

      showNotification("Status atualizado com sucesso!", "success");
      setEditingStatus(null);
      setNewStatusChave("");
      setNewStatusNome("");
      setNewStatusWorkflowId(undefined);
      loadKanban(filters);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const handleDeleteStatus = async (statusId: number, statusNome: string) => {
    try {
      await deleteStatus(statusId);
      showNotification(`Status "${statusNome}" deletado com sucesso!`, "success");
      loadKanban(filters);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const startEditStatus = (col: Column) => {
    setEditingStatus({
      id: col.statusId,
      chave: col.statusChave,
      nome: col.titulo,
      ordem: col.ordem,
      workflowId: col.workflowId,
    });
    setNewStatusChave(col.statusChave);
    setNewStatusNome(col.titulo);
    setNewStatusWorkflowId(col.workflowId);
    setManagerMode("status");
    setShowManager(true);
  };

  const openCreateStatusModal = () => {
    setEditingStatus(null);
    setNewStatusChave("");
    setNewStatusNome("");
    setNewStatusWorkflowId(activeWorkflowId || undefined);
    setManagerMode("status");
    setShowManager(true);
  };

  const handleReorderColumns = async (sourceIndex: number, destIndex: number) => {
    const reorderedColumns = [...columns.filter(c => c.id !== "sem_status")];
    const [movedColumn] = reorderedColumns.splice(sourceIndex, 1);
    reorderedColumns.splice(destIndex, 0, movedColumn);

    const updatedColumns = reorderedColumns.map((col, index) => ({
      ...col,
      ordem: index + 1,
    }));

    setColumns(updatedColumns);

    try {
      for (const col of updatedColumns) {
        await updateStatus(col.statusId, {
          chave: col.statusChave,
          nome: col.titulo,
          ordem: col.ordem,
          workflowId: col.workflowId,
        });
      }
      showNotification("Ordem das colunas atualizada!", "success");
    } catch (error) {
      showNotification("Erro ao reordenar colunas", "error");
      loadKanban(filters);
    }
  };

  // ==================== HANDLERS DE WORKFLOW ====================

  const handleCreateWorkflow = async () => {
    if (!newWorkflowNome.trim()) {
      showNotification("O nome do workflow é obrigatório", "error");
      return;
    }

    try {
      await createWorkflow({
        nome: newWorkflowNome.trim(),
        descricao: newWorkflowDesc.trim() || undefined,
      });

      showNotification(`Workflow "${newWorkflowNome}" criado com sucesso!`, "success");
      setNewWorkflowNome("");
      setNewWorkflowDesc("");
      loadWorkflows();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const handleUpdateWorkflow = async () => {
    if (!editingWorkflow) return;

    if (!newWorkflowNome.trim()) {
      showNotification("O nome do workflow é obrigatório", "error");
      return;
    }

    try {
      await updateWorkflow(editingWorkflow.id, {
        nome: newWorkflowNome.trim(),
        descricao: newWorkflowDesc.trim() || undefined,
      });

      showNotification("Workflow atualizado com sucesso!", "success");
      setEditingWorkflow(null);
      setNewWorkflowNome("");
      setNewWorkflowDesc("");
      loadWorkflows();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const handleDeleteWorkflow = async (workflowId: number, workflowNome: string) => {
    try {
      await deleteWorkflow(workflowId);
      showNotification(`Workflow "${workflowNome}" deletado com sucesso!`, "success");
      loadWorkflows();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(`Erro: ${errorMessage}`, "error");
    }
  };

  const startEditWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setNewWorkflowNome(workflow.nome);
    setNewWorkflowDesc(workflow.descricao || "");
    setManagerMode("workflow");
    setShowManager(true);
  };

  // ==================== DRAG & DROP ====================

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "COLUMN") {
      handleReorderColumns(source.index, destination.index);
      return;
    }

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find((col) => col.id === destination.droppableId);
    const draggedCard = sourceColumn?.cards.find((card) => card.id === draggableId);

    if (!draggedCard || !draggedCard.ocorrencia || !destColumn) return;

    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex((col) => col.id === source.droppableId);
    const destColIndex = newColumns.findIndex((col) => col.id === destination.droppableId);

    const [movedCard] = newColumns[sourceColIndex].cards.splice(source.index, 1);
    newColumns[destColIndex].cards.splice(destination.index, 0, movedCard);

    setColumns(newColumns);

    try {
      const newStatusId = destColumn.statusId;
      const newStatusChave = destColumn.statusChave;

      if (!newStatusId) {
        throw new Error(`Status ID não encontrado para coluna: ${destination.droppableId}`);
      }

      const updatedOcorrencia = await updateStatusViaDrag(
        draggedCard.ocorrencia.id,
        newStatusId,
        newStatusChave
      );

      const finalColumns = [...newColumns];
      const cardIndex = finalColumns[destColIndex].cards.findIndex((card) => card.id === draggableId);

      if (cardIndex !== -1) {
        finalColumns[destColIndex].cards[cardIndex] = {
          ...finalColumns[destColIndex].cards[cardIndex],
          ocorrencia: updatedOcorrencia,
          statusId: updatedOcorrencia.status?.id || newStatusId,
          statusNome: updatedOcorrencia.status?.nome || destColumn.titulo,
        };
        setColumns(finalColumns);
      }

      showNotification(`Card movido para "${destColumn.titulo}" com sucesso!`);
    } catch (error) {
      const revertedColumns = [...columns];
      const revertSourceIndex = revertedColumns.findIndex((col) => col.id === source.droppableId);
      const revertDestIndex = revertedColumns.findIndex((col) => col.id === destination.droppableId);
      const [cardToRevert] = revertedColumns[revertDestIndex].cards.splice(destination.index, 1);
      revertedColumns[revertSourceIndex].cards.splice(source.index, 0, cardToRevert);
      setColumns(revertedColumns);

      showNotification(
        `Erro ao mover card: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        "error"
      );
    }
  };

  // ==================== USUÁRIOS ONLINE ====================

  const getInitials = (nome: string): string => {
    const words = nome.trim().split(" ");
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getRandomColor = (): string => {
    const colors = [
      "#4c010c", "#6a0110", "#8b0000", "#a52a2a", "#c41e3a",
      "#dc143c", "#ff6347", "#ff4500", "#ff8c00", "#ffa500"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadWorkflows();
    loadOnlineUsers();
  }, [loadWorkflows, loadOnlineUsers]);

  useEffect(() => {
    loadKanban(filters);
  }, [activeWorkflowId, filters, loadKanban]);

  useEffect(() => {
    if (showManager && managerMode === "workflow") {
      loadWorkflows();
    }
  }, [showManager, managerMode, loadWorkflows]);

  useEffect(() => {
    if (!showManager) {
      setNewStatusWorkflowId(activeWorkflowId || undefined);
    }
  }, [columns, showManager, activeWorkflowId]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const totalCards = columns.reduce((sum, col) => sum + (col.cards?.length || 0), 0);
  const allCards = columns.flatMap((col) => 
    (col.cards || []).map(card => ({ ...card, columnTitle: col.titulo, columnId: col.id }))
  );

  // ==================== RENDER ====================

  return (
    <div className="pgKanbanBoard">
      {/* Barra Superior */}
      <section className="pgKanbanBoard__workflowBar">
        <div className="container">
          <div className="pgKanbanBoard__workflowBar__left">
            {/* 👇 NOVO: Botão de Voltar + Nome do Workflow */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/workflows')}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Voltar para Workflows"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="pgKanbanBoard__workflowBar__left__title">
                  {activeWorkflow?.nome || "Workflow"}
                </h1>
                {activeWorkflow?.descricao && (
                  <p className="text-sm text-gray-500 mt-0.5">{activeWorkflow.descricao}</p>
                )}
              </div>
            </div>
            
            <span className="pgKanbanBoard__workflowBar__left__badge">{totalCards} cards</span>
          </div>

          <div className="pgKanbanBoard__workflowBar__right">
            {/* Usuários Online */}
            <div className="pgKanbanBoard__workflowBar__right__UsuáriosOn">
              {onlineUsers.length > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  {onlineUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="relative group">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-transform hover:scale-110 shadow-md border-2 border-white"
                        style={{ backgroundColor: user.cor }}
                      >
                        {user.iniciais}
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                        <div className="font-semibold">{user.nome}</div>
                        <div className="text-gray-300 text-[10px] mt-0.5">{user.email}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                  ))}

                  {onlineUsers.length > 5 && (
                    <div className="relative group">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-transform hover:scale-110 shadow-md border-2 border-white">
                        +{onlineUsers.length - 5}
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                        <div className="font-semibold mb-1">
                          Mais {onlineUsers.length - 5} {onlineUsers.length - 5 === 1 ? "usuário" : "usuários"}
                        </div>
                        {onlineUsers.slice(5, 10).map((user) => (
                          <div key={user.id} className="text-gray-300 text-[10px]">
                            • {user.nome}
                          </div>
                        ))}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filtros */}
            <div className="pgKanbanBoard__workflowBar__right__filters">
              <Filters
                onFiltersChange={handleFiltersChange}
                showStatusFilter={false}
                showCollaboratorFilter={true}
                showGestorFilter={true}
                className="shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pgKanbanBoard__access">
        <div className="container">
          {/* Toggle de Visualização */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-[#4c010c] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Visualização em Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white text-[#4c010c] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Visualização em Lista"
            >
              <ListIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Lista</span>
            </button>
          </div>

          {/* Dropdown de Gerenciamento */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#4c010c] text-white rounded-lg hover:bg-[#6a0110] transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Gerenciar</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2">
                <button
                  onClick={() => {
                    setManagerMode("status");
                    setShowManager(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Status</div>
                    <div className="text-xs text-gray-500">Gerenciar colunas do Kanban</div>
                  </div>
                </button>

                
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
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
              <p className="text-gray-500">Buscando suas ocorrências</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* MODAL DE GERENCIAMENTO */}
          {showManager && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {managerMode === "status" ? "Gerenciar Status" : "Gerenciar Workflows"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {managerMode === "status"
                        ? "Defina as colunas do seu Kanban e reorganize-as"
                        : "Organize ocorrências em projetos"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setManagerMode("status")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          managerMode === "status"
                            ? "bg-white text-[#4c010c] shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Status
                      </button>
                      <button
                        onClick={() => setManagerMode("workflow")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          managerMode === "workflow"
                            ? "bg-white text-[#4c010c] shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Workflows
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setShowManager(false);
                        setEditingStatus(null);
                        setEditingWorkflow(null);
                        setNewStatusChave("");
                        setNewStatusNome("");
                        setNewStatusWorkflowId(undefined);
                        setNewWorkflowNome("");
                        setNewWorkflowDesc("");
                      }}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  {managerMode === "status" ? (
                    <>
                      {/* Formulário de Status */}
                      <div className="bg-red-50 rounded-xl p-6 mb-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Plus className="w-5 h-5 text-blue-600" />
                          {editingStatus ? "Editar Status" : "Criar Novo Status"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Nome */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                            <input
                              type="text"
                              value={newStatusNome}
                              onChange={(e) => {
                                const nome = e.target.value;
                                setNewStatusNome(nome);
                                const chaveGerada = generateChaveFromNome(nome);
                                setNewStatusChave(chaveGerada);
                              }}
                              placeholder="Ex: Em Desenvolvimento"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          {/* Chave */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Chave * {!editingStatus && <span className="text-xs text-gray-500">(gerada automaticamente)</span>}
                            </label>
                            <input
                              type="text"
                              value={newStatusChave}
                              onChange={(e) => setNewStatusChave(e.target.value)}
                              placeholder="desenvolvimento_teste"
                              disabled={!editingStatus && !newStatusChave}
                              className={`w-full px-4 py-2 border rounded-lg ${
                                editingStatus || newStatusChave
                                  ? "focus:ring-2 focus:ring-blue-500"
                                  : "bg-gray-50 text-gray-500 cursor-not-allowed"
                              }`}
                            />
                            {!editingStatus && newStatusChave && (
                              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                ✓ Chave gerada: <code className="bg-green-50 px-1 rounded">{newStatusChave}</code>
                              </p>
                            )}
                          </div>

                        </div>

                        <div className="flex gap-3">
                          {editingStatus ? (
                            <>
                              <button
                                onClick={handleUpdateStatus}
                                className="flex-1 bg-red-50 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                                style={{ backgroundColor: 'var(--details-color)' }}
                              >
                                Salvar Alterações
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStatus(null);
                                  setNewStatusChave("");
                                  setNewStatusNome("");
                                  setNewStatusWorkflowId(undefined);
                                }}
                                className="px-6 py-2 border border-gray-300 text-white rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                style={{ backgroundColor: 'var(--cancel-bg)' }}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={handleCreateStatus}
                              className="flex-1 bg-red-50 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                              style={{ backgroundColor: 'var(--details-color)' }}
                            >
                              Criar Status
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lista de Status com Drag */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-700">
                            Status Existentes ({columns.filter((col) => col.id !== "sem_status").length})
                          </h3>
                        </div>

                        {columns.filter((col) => col.id !== "sem_status").length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Nenhum status cadastrado</p>
                          </div>
                        ) : (
                          <DragDropContext
                            onDragEnd={(result) => {
                              if (!result.destination) return;
                              handleReorderColumns(result.source.index, result.destination.index);
                            }}
                          >
                            <Droppable droppableId="status-list" type="STATUS">
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="space-y-3"
                                >
                                  {columns
                                    .filter((col) => col.id !== "sem_status")
                                    .sort((a, b) => a.ordem - b.ordem)
                                    .map((col, index) => (
                                      <Draggable key={col.id} draggableId={col.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`bg-white border-2 rounded-xl p-4 transition-all ${
                                              snapshot.isDragging
                                                ? "border-red-50 shadow-2xl rotate-1 scale-105"
                                                : "border-gray-200 hover:border-red-100 hover:shadow-md"
                                            }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div
                                                {...provided.dragHandleProps}
                                                className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg"
                                              >
                                                <GripVertical className="w-5 h-5 text-gray-400" />
                                              </div>

                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                  <h4 className="font-semibold text-gray-800">
                                                    {col.titulo}
                                                  </h4>
                                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                    #{col.ordem}
                                                  </span>
                                                  {col.workflowId && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                                      Workflow: {workflows.find(w => w.id === col.workflowId)?.nome || col.workflowId}
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2">
                                                  Chave:{" "}
                                                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                    {col.statusChave}
                                                  </code>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                  {col.cards.length} {col.cards.length === 1 ? "card" : "cards"}
                                                </p>
                                              </div>

                                              <div className="flex gap-1">
                                                <button
                                                  onClick={() => startEditStatus(col)}
                                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colores"
                                                  title="Editar"
                                                >
                                                  <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    setConfirmDelete({
                                                      open: true,
                                                      id: col.statusId,
                                                      nome: col.titulo,
                                                      type: "status",
                                                    })
                                                  }
                                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colores"
                                                  title="Deletar"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Formulário de Workflow */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Plus className="w-5 h-5 text-purple-600" />
                          {editingWorkflow ? "Editar Workflow" : "Criar Novo Workflow"}
                        </h3>

                        <div className="space-y-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome do Workflow *
                            </label>
                            <input
                              type="text"
                              value={newWorkflowNome}
                              onChange={(e) => setNewWorkflowNome(e.target.value)}
                              placeholder="Ex: Projeto Alpha"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descrição (opcional)
                            </label>
                            <textarea
                              value={newWorkflowDesc}
                              onChange={(e) => setNewWorkflowDesc(e.target.value)}
                              placeholder="Descrição do workflow..."
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {editingWorkflow ? (
                            <>
                              <button
                                onClick={handleUpdateWorkflow}
                                className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                              >
                                Salvar Alterações
                              </button>
                              <button
                                onClick={() => {
                                  setEditingWorkflow(null);
                                  setNewWorkflowNome("");
                                  setNewWorkflowDesc("");
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colores font-medium"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={handleCreateWorkflow}
                              className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                            >
                              Criar Workflow
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Lista de Workflows */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">
                          Workflows Existentes ({workflows.length})
                        </h3>

                        {workflows.length === 0 ? (
                          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Nenhum workflow cadastrado</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {workflows.map((workflow) => (
                              <div
                                key={workflow.id}
                                className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-md transition-all"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 mb-1">
                                      {workflow.nome}
                                    </h4>
                                    {workflow.descricao && (
                                      <p className="text-sm text-gray-600 mb-2">
                                        {workflow.descricao}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => startEditWorkflow(workflow)}
                                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colores"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setConfirmDelete({
                                          open: true,
                                          id: workflow.id,
                                          nome: workflow.nome,
                                          type: "workflow",
                                        })
                                      }
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colores"
                                      title="Deletar"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE CONFIRMAÇÃO */}
          {confirmDelete.open && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Confirmar Exclusão</h3>
                <p className="text-gray-600 mb-6">
                  Tem certeza que deseja deletar {confirmDelete.type === "status" ? "o status" : "o workflow"}{" "}
                  <strong>"{confirmDelete.nome}"</strong>?
                  <br />
                  <br />
                  <span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span>
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmDelete({ open: false, id: null, nome: "", type: "status" })}
                    className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (confirmDelete.id !== null) {
                        if (confirmDelete.type === "status") {
                          await handleDeleteStatus(confirmDelete.id, confirmDelete.nome);
                        } else {
                          await handleDeleteWorkflow(confirmDelete.id, confirmDelete.nome);
                        }
                      }
                      setConfirmDelete({ open: false, id: null, nome: "", type: "status" });
                    }}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VISUALIZAÇÃO KANBAN */}
          {viewMode === "kanban" && columns.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
                {(provided) => (
                  <section 
                    className="pgKanbanBoard__Workflows"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="container">
                      {columns
                        .filter((col) => col.id !== "sem_status")
                        .sort((a, b) => a.ordem - b.ordem)
                        .map((col, colIndex) => (
                          <Draggable key={col.id} draggableId={col.id} index={colIndex} isDragDisabled={false}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`pgKanbanBoard__Workflows__column ${
                                  snapshot.isDragging ? "opacity-50" : ""
                                }`}
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-200 cursor-grab active:cursor-grabbing hover:bg-gray-50 -mx-4 px-4 py-2 rounded-t-lg"
                                  title="Arraste para reordenar coluna"
                                >
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-xl font-bold text-gray-800">{col.titulo}</h3>
                                  </div>
                                  <span className="bg-[#ffffa6] text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-300">
                                    {(col.cards || []).length}
                                  </span>
                                </div>

                                <Droppable droppableId={col.id} type="CARD">
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={`pgKanbanBoard__Workflows__column__content flex-col${
                                        (col.cards || []).length === 0 ? "pgKanbanBoard__Workflows__column__content--empty" : ""
                                      }`}
                                      style={{
                                        backgroundColor: snapshot.isDraggingOver ? "#fef2f2" : "transparent",
                                        borderRadius: snapshot.isDraggingOver ? "0.5rem" : "0",
                                        padding: snapshot.isDraggingOver ? "0.5rem" : "0",
                                        transition: "background-color 0.2s ease",
                                      }}
                                    >
                                      {(col.cards || []).length > 0 ? (
                                        <div className="space-y-3 mr-3">
                                          {(col.cards || []).map((card, index) => (
                                            <Draggable key={card.id} draggableId={card.id} index={index}>
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  onClick={() => {
                                                    setSelectedCard(card);
                                                    setDetailOpen(true);
                                                  }}
                                                  className={`bg-gradient-to-br from-gray-50 to-slate-50 hover:from-red-50 hover:to-rose-50 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all border-2 ${
                                                    snapshot.isDragging
                                                      ? "border-[#4c010c] shadow-2xl rotate-2 scale-105"
                                                      : "border-gray-200 hover:border-[#4c010c] hover:shadow-lg"
                                                  }`}
                                                >
                                                  <div className="flex items-start gap-2 mb-3">
                                                    <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                    <h4 className="font-semibold text-gray-800 flex-1 leading-snug">
                                                      {card.titulo}
                                                    </h4>
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedCard(card);
                                                        setDetailOpen(true);
                                                      }}
                                                      aria-label="Ver detalhes"
                                                      className="p-1 rounded hover:bg-gray-100 ml-2"
                                                    >
                                                      <Eye className="w-5 h-5 text-gray-500" />
                                                    </button>
                                                  </div>

                                                  {card.colaboradorNome && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-200 mb-2">
                                                      <User className="w-4 h-4 text-[#4c010c] flex-shrink-0" />
                                                      <span className="font-medium truncate">
                                                        {card.colaboradorNome}
                                                      </span>
                                                    </div>
                                                  )}

                                                  {card.createdAt && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-200">
                                                      <Calendar className="w-4 h-4 text-[#4c010c]" />
                                                      <span className="font-medium">
                                                        {new Date(card.createdAt).toLocaleDateString("pt-BR")}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center h-full w-full">
                                          <p className=" w-full text-gray-400 text-sm italic text-center py-6 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                            Arraste cards para cá
                                          </p>
                                        </div>
                                      )}

                                      {provided.placeholder}

                                      {/* 👇 INPUT PARA CRIAR OCORRÊNCIA */}
                                      <div className="mt-3 mr-3">
                                        {creatingInColumn === col.id ? (
                                          <div className="flex gap-2">
                                            <input
                                              type="text"
                                              autoFocus
                                              value={newOcorrenciaTitle}
                                              onChange={(e) => setNewOcorrenciaTitle(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleCreateOcorrenciaInColumn(col.id);
                                                } else if (e.key === "Escape") {
                                                  setCreatingInColumn(null);
                                                  setNewOcorrenciaTitle("");
                                                }
                                              }}
                                              placeholder="Título da ocorrência..."
                                              className="flex-1 px-3 py-2 border-2 border-[#4c010c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c010c] text-sm"
                                            />
                                            <button
                                              onClick={() => handleCreateOcorrenciaInColumn(col.id)}
                                              disabled={loadingOcorrencia}
                                              className="p-2 bg-[#4c010c] text-white rounded-lg hover:bg-[#6a0110] transition-colors disabled:opacity-50"
                                              title="Criar ocorrência"
                                            >
                                              <Send className="w-4 h-4" />
                                            </button>
                                            <button
                                              onClick={() => {
                                                setCreatingInColumn(null);
                                                setNewOcorrenciaTitle("");
                                              }}
                                              className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                              title="Cancelar"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setCreatingInColumn(col.id)}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#4c010c] hover:text-[#4c010c] hover:bg-red-50 transition-all font-medium text-sm"
                                          >
                                            <Plus className="w-4 h-4" />
                                            Adicionar Ocorrência
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </section>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* VISUALIZAÇÃO LISTA */}
          {viewMode === "list" && (
            <section className="px-8 py-6 bg-gray-50 min-h-screen">
              <div className="max-w-7xl mx-auto">
                {allCards.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm">
                    <ListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Nenhuma ocorrência encontrada</p>
                    <p className="text-gray-400 text-sm mt-2">Crie uma nova ocorrência para começar</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-t-2xl border-b-2 border-gray-200 px-6 py-4 mb-2 shadow-sm">
                      <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        <div className="col-span-4">Título</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-3">Responsável</div>
                        <div className="col-span-2">Data de Criação</div>
                        <div className="col-span-1 text-right">Ações</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-b-2xl shadow-sm divide-y divide-gray-100">
                      {allCards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => {
                            setSelectedCard(card);
                            setDetailOpen(true);
                          }}
                          className="px-6 py-4 hover:bg-blue-50 transition-all cursor-pointer group"
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4">
                              <h3 className="font-semibold text-gray-900 group-hover:text-[#4c010c] transition-colors">
                                {card.titulo}
                              </h3>
                            </div>

                            <div className="col-span-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                {card.columnTitle}
                              </span>
                            </div>

                            <div className="col-span-3">
                              {card.colaboradorNome ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-details rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {card.colaboradorNome.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm text-gray-700 font-medium truncate">
                                    {card.colaboradorNome}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 italic">Não atribuído</span>
                              )}
                            </div>

                            <div className="col-span-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>
                                  {new Date(card.createdAt).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="col-span-1 flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCard(card);
                                  setDetailOpen(true);
                                }}
                                className="p-2 hover:bg-white rounded-lg transition-colores opacity-0 group-hover:opacity-100"
                                title="Ver detalhes"
                              >
                                <Eye className="w-5 h-5 text-gray-500 hover:text-[#4c010c]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 bg-white rounded-xl px-6 py-3 shadow-sm">
                      <p className="text-sm text-gray-600">
                        Total: <span className="font-semibold text-gray-900">{allCards.length}</span>{" "}
                        {allCards.length === 1 ? "ocorrência" : "ocorrências"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* EMPTY STATE */}
          {columns.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Nenhum Status Cadastrado</h2>
                <p className="text-gray-500 mb-6">
                  Crie seu primeiro status para começar a organizar suas ocorrências
                </p>
                <button
                  onClick={() => {
                    setManagerMode("status");
                    setShowManager(true);
                  }}
                  className="inline-flex items-center gap-2 bg-[#4c010c] text-white px-6 py-3 rounded-lg hover:bg-[#6a0110] transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeiro Status
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* DIALOG DE DETALHES */}
      {selectedCard?.ocorrencia && (
        <TaskDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          ocorrencia={selectedCard.ocorrencia}
          onAssign={handleAssignOcorrencia}
          onAutoAssign={handleAutoAssignOcorrencia}
        />
      )}

      {/* NOTIFICAÇÃO TOAST */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? "✅" : "❌"}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* 👇 NOVO: BOTÃO FLUTUANTE PARA CRIAR STATUS */}
      <button
        onClick={openCreateStatusModal}
        className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 bg-[#4c010c] text-white rounded-full shadow-2xl hover:bg-[#6a0110] hover:scale-110 transition-all duration-300 group"
        title="Criar novo status"
      >
        <Plus className="w-6 h-6" />
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl">
          Criar novo status
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>
    </div>
  );
};

export default KanbanBoard;