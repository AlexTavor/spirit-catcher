import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process';

const version = execSync('git rev-list --count HEAD').toString().trim();

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
    ],
    server: {
        port: 8080
    },
    define: {
    __APP_VERSION__: JSON.stringify(version),
  }
})
