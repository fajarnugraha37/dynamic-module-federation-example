import { defineConfig } from 'vite'
import { viteConfig } from './vite.config.js'

/**
 * Environment-specific Vite configurations for Vue 3 SSG
 * Usage: vite build --mode [development|staging|production|ssg]
 */

const environmentConfigs = {
    development: {
        build: {
            sourcemap: true,
            minify: false,
            cssMinify: false,
            rollupOptions: {
                output: {
                    manualChunks: undefined, // Disable chunking in dev for faster builds
                },
            },
        },
        define: {
            __VUE_PROD_DEVTOOLS__: true,
        },
    },

    staging: {
        build: {
            sourcemap: true,
            minify: 'esbuild', // Faster than terser for staging
            cssMinify: true,
        },
        define: {
            __VUE_PROD_DEVTOOLS__: true,
        },
    },

    production: {
        build: {
            sourcemap: false,
            minify: 'terser',
            cssMinify: true,
            reportCompressedSize: true,
        },
        define: {
            __VUE_PROD_DEVTOOLS__: false,
        },
    },

    ssg: {
        build: {
            sourcemap: false,
            minify: 'terser',
            cssMinify: true,
            ssr: false, // Ensure SSG mode
            rollupOptions: {
                output: {
                    // Optimize for SSG with predictable chunk names
                    chunkFileNames: 'assets/js/[name].js',
                    entryFileNames: 'assets/js/[name].js',
                    assetFileNames: 'assets/[ext]/[name].[ext]',
                },
            },
        },
        ssgOptions: {
            script: 'async',
            formatting: 'minify',
            crittersOptions: {
                reduceInlineStyles: true,
                mergeStylesheets: true,
                preload: 'media',
                inlineFonts: true,
            },
        },
        define: {
            __VUE_PROD_DEVTOOLS__: false,
        },
    },
}

export function createEnvironmentConfig(mode = 'production') {
    const baseConfig = { ...viteConfig }
    const envConfig = environmentConfigs[mode] || environmentConfigs.production

    // Deep merge configuration
    return defineConfig({
        ...baseConfig,
        ...envConfig,
        build: {
            ...baseConfig.build,
            ...envConfig.build,
            rollupOptions: {
                ...baseConfig.build?.rollupOptions,
                ...envConfig.build?.rollupOptions,
                output: {
                    ...baseConfig.build?.rollupOptions?.output,
                    ...envConfig.build?.rollupOptions?.output,
                },
            },
        },
        define: {
            ...baseConfig.define,
            ...envConfig.define,
        },
    })
}

export { environmentConfigs }