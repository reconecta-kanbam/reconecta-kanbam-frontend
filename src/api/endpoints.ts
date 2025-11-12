const ENDPOINTS = {
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_RECOVER_PASSWORD: "/auth/recover",
  SECTORS_LIST: "/setores",

  // OCORRÊNCIAS
  CREATE_OCORRENCIA: "/ocorrencias",
  CREATE_OCORRENCIA_PUBLIC: "/ocorrencias/public",
  LIST_OCORRENCIAS: "/ocorrencias",
  GET_OCORRENCIA_BY_USER: (userId: number) => `/users/${userId}/ocorrencias`,
  DELETE_OCORRENCIA: (id: number) => `/ocorrencias/${id}`,
  EDIT_OCORRENCIA: (id: number) => `/ocorrencias/${id}`,
  ASSIGN_OCORRENCIA: (id: number) => `/ocorrencias/${id}/atribuir`,
  AUTO_ASSIGN_OCORRENCIA: (id: number) => `/ocorrencias/${id}/atribuir`,
  UPDATE_STATUS_OCORRENCIA: (id: number) => `/ocorrencias/${id}/status`,

  // USUÁRIOS
  LIST_USERS: "/users",
  CREATE_USER: "/users",
  UPDATE_USER_WEIGHT: (userId: number) => `/users/${userId}/peso`,

  // STATUS (Colunas do Kanban)
  LIST_STATUS: "/status",
  CREATE_STATUS: "/status",
  UPDATE_STATUS: (id: number) => `/status/${id}`,
  DELETE_STATUS: (id: number) => `/status/${id}`,

  // SUBTAREFAS - 🔥 CORRIGIDO: Removido /users/ do path de edição
  CREATE_SUBTAREFA: (ocorrenciaId: number) =>
    `/ocorrencias/${ocorrenciaId}/subtarefas`,
  EDIT_SUBTAREFA: (ocorrenciaId: number, subId: number) =>
    `/ocorrencias/${ocorrenciaId}/subtarefas/${subId}`, // ✅ Path correto
  DELETE_SUBTAREFA: (ocorrenciaId: number, subId: number) =>
    `/ocorrencias/${ocorrenciaId}/subtarefas/${subId}`,

  // WORKFLOWS (Agrupamento opcional de ocorrências)
  LIST_WORKFLOWS: "/workflows",
  CREATE_WORKFLOW: "/workflows",
  UPDATE_WORKFLOW: (id: number) => `/workflows/${id}`,
  DELETE_WORKFLOW: (id: number) => `/workflows/${id}`,

  // KANBAN
  GET_KANBAN_DATA: "/kanban",
} as const;

export default ENDPOINTS;