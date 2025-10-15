/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_IDP_BASE_URL: string
    readonly VITE_SUBJECT_ISSUER: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

