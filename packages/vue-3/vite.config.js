import { defineConfig, loadEnv } from 'vite';
import { viteVue3Config as configFunc } from '@commons/configs/vite.vue3';
import { resolve } from 'path';

export default ({ mode }) => {
    const { VITE_PORT, VITE_BASE_URL } = loadEnv(mode, process.cwd());
    const baseConfig = configFunc(import.meta.dirname);

    return defineConfig({
        ...baseConfig,
        base: '/vue-3',
        server: {
            ...baseConfig.server,
            port: VITE_PORT || 5175,
            host: '0.0.0.0',
            open: true,
            cors: true,
            proxy: {},
            warmup: {
                clientFiles: ['./index.html', './src/{views,components}/*'],
            },
        },

        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
            },
        },
        css: {
            preprocessorOptions: {
                less: {
                    modifyVars: {
                        hack: `true; @import (reference) "${resolve('src/style/variables.less')}";`,
                    },
                    math: 'strict',
                    javascriptEnabled: true,
                },
            },
        },
        build: {
            target: 'es2015',
            sourcemap: false,
            chunkSizeWarningLimit: 4000,
            rollupOptions: {
                output: {
                    entryFileNames: 'static/js/[name]-[hash].js',
                    chunkFileNames: 'static/js/[name]-[hash].js',
                    assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
                },
            },
        },
    });
};