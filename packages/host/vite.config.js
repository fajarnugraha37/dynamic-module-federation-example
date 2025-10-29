import { defineConfig, loadEnv } from 'vite';
import { viteVue2ConfigModuleFederation as configFunc } from '@commons/configs/vite.vue2.module-federation';
import { resolve } from 'path';

export default ({ mode }) => {
    const { VITE_PORT, VITE_BASE_URL } = loadEnv(mode, process.cwd());
    const baseConfig = configFunc(import.meta.dirname);

    return defineConfig({
        ...baseConfig,
        base: '/host',
        server: {
            ...baseConfig.server,
            port: VITE_PORT || 5173,
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
    });
};