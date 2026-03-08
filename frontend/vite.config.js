import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // Split vendor chunks for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'motion': ['framer-motion'],
                    'icons': ['lucide-react'],
                },
            },
        },
        // Increase inline limit for small assets
        assetsInlineLimit: 4096,
        // Enable minification
        minify: 'esbuild',
    },
    // Optimize deps during dev
    optimizeDeps: {
        include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
        // No longer need to include three.js / react-three
    },
})
