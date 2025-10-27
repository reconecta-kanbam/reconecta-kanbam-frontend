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
  UPDATE_STATUS_OCORRENCIA: (id: number) => `/ocorrencias/${id}/status`,

  // USUÁRIOS
  LIST_USERS: "/users",
  CREATE_USER: "/users",
  UPDATE_USER_WEIGHT: (userId: number) => `/users/${userId}/peso`,

  // STATUS
  LIST_STATUS: "/status",
  CREATE_STATUS: "/status",
  UPDATE_STATUS: (id: number) => `/status/${id}`,

  // Subtarefas
  CREATE_SUBTAREFA: (ocorrenciaId: number) =>
    `/ocorrencias/${ocorrenciaId}/subtarefas`,
  EDIT_SUBTAREFA: (ocorrenciaId: number, subId: number) =>
    `/users/ocorrencias/${ocorrenciaId}/subtarefas/${subId}`,
  DELETE_SUBTAREFA: (ocorrenciaId: number, subId: number) =>
    `/ocorrencias/${ocorrenciaId}/subtarefas/${subId}`,

  // KANBAN (mock por enquanto, depois backend vai gerar via estados)
  LIST_KANBAN: "/kanban",
} as const;

export default ENDPOINTS;
