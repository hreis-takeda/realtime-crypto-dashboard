import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export default defineConfig({
    root: '.',
    server: {
        port: Number(process.env.FRONTEND_PORT) || 5173,
        proxy: {
            '/events': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            '/health': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            '/rates': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
        },
    },
});
