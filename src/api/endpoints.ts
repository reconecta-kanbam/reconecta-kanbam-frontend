const BASE_URL = "https://sistema-de-ocorrencias-production.up.railway.app";

const ENDPOINTS = {
  // AUTH
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  AUTH_RECOVER_PASSWORD: "/auth/recover",
  SECTORS_LIST: "/setores",

  // OCORRÊNCIAS
  CREATE_OCORRENCIA: "/ocorrencias",
  LIST_OCORRENCIAS: "/ocorrencias",
  DELETE_OCORRENCIA: (id: string | number) => `/ocorrencias/${id}`,
  EDIT_OCORRENCIA: (id: string | number) => `/ocorrencias/${id}`,
  GET_OCORRENCIA_BY_USER: (userId: string | number) =>
    `/ocorrencias/usuario/${userId}`,

  // KANBAN (mock por enquanto, depois backend vai gerar via estados)
  LIST_KANBAN: "/kanban",
} as const;

export { BASE_URL };
export default ENDPOINTS;
