import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '')
    
    return {
        plugins: [react()],
        server: {
            port: 8000,
            host: true
        },
        build: {
            outDir: 'dist',
            sourcemap: true
        },
        define: {
            global: 'globalThis',
            'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
            'import.meta.env.VITE_IDP_BASE_URL': JSON.stringify(env.VITE_IDP_BASE_URL),
            'import.meta.env.VITE_SUBJECT_ISSUER': JSON.stringify(env.VITE_SUBJECT_ISSUER),
            'import.meta.env.VITE_CLIENT_ID': JSON.stringify(env.VITE_CLIENT_ID),
            'import.meta.env.VITE_RESOURCE': JSON.stringify(env.VITE_RESOURCE),
            'import.meta.env.VITE_SCOPE_LIST': JSON.stringify(env.VITE_SCOPE_LIST)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        }
    }
})
