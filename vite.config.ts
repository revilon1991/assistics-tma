import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
        // Для работы с Telegram WebApp
        global: 'globalThis'
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
