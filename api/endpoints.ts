// src/api/endpoints.ts

const ENDPOINTS = {
    // === AUTENTICAÇÃO ===
    AUTH_LOGIN: '/auth/login',
    AUTH_CADASTRO: '/auth/register',
    AUTH_RECUPERAR_SENHA: '/auth/recover', // opcional, baseado no exemplo

    // === USUÁRIOS ===
    USUARIO_LISTAR: '/users',
    USUARIO_CRIAR: '/users',
    USUARIO_DETALHES: '/users/',
    USUARIO_ATUALIZAR: '/users/',
    USUARIO_EXCLUIR: '/users/',

    // === SETORES ===
    SETOR_CRIAR: '/setores',

    // === OCORRÊNCIAS ===
    OCORRENCIA_LISTAR: '/ocorrencias',
    OCORRENCIA_CRIAR: '/ocorrencias',
    OCORRENCIA_CRIAR_PUBLICA: '/ocorrencias/public',
    OCORRENCIA_ATRIBUIR: '/ocorrencias/',
    OCORRENCIA_ALTERAR_STATUS: '/ocorrencias/',
    OCORRENCIA_DETALHES: '/ocorrencias/',

} as const;

export default ENDPOINTS;