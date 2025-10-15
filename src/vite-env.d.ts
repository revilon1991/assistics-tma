/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_IDP_BASE_URL: string
    readonly VITE_SUBJECT_ISSUER: string
    readonly VITE_CLIENT_ID: string
    readonly VITE_RESOURCE: string
    readonly VITE_SCOPE_LIST: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

