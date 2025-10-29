import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'
import { compression } from 'vite-plugin-compression2'
import { VitePWA } from 'vite-plugin-pwa'
import autoprefixer from 'autoprefixer'
import tailwindcss from '@tailwindcss/vite'


export const viteVue3Config = (__dirname) => defineConfig({
    esbuild: {
        supported: {
            'top-level-await': true //browsers can handle top-level-await features
        },
    },

    plugins: [
        // Tailwind CSS integration
        tailwindcss(),
        
        // Vue 3 support
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('micro-app'),
                },
            },
        }),

        // Vue JSX support
        vueJsx(),

        // HTML template processing
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    title: 'Vue 3 Qiankun Micro App',
                    description: 'Vue 3 microfrontend with Qiankun integration',
                },
            },
        }),

        // PWA support (optional for micro apps)
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            },
            manifest: {
                name: 'Vue 3 Micro App',
                short_name: 'Vue3Micro',
                description: 'Vue 3 Qiankun Microfrontend',
                theme_color: '#4DBA87',
                background_color: '#ffffff',
                display: 'standalone',
            },
        }),

        // Compression for production
        compression({
            algorithm: 'gzip',
            include: /\.(js|css|html|svg)$/,
            threshold: 1024,
        }),
    ],

    // Path resolution
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            // '@commons': resolve(__dirname, '../'),
            // '@components': resolve(__dirname, '../components'),
            // '@ui': resolve(__dirname, '../ui'),
            'vue': 'vue/dist/vue.esm-bundler.js',
        },
        extensions: ['.js', '.ts', '.vue', '.json'],
    },

    // Development server for Qiankun
    server: {
        host: '0.0.0.0',
        port: 8082,
        strictPort: true,
        cors: {
            origin: '*',
            credentials: true,
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    },

    // Preview server
    preview: {
        host: '0.0.0.0',
        port: 4175,
        strictPort: true,
        cors: true,
    },

    // Build configuration for Qiankun
    build: {
        target: 'esnext',
        outDir: 'dist',
        assetsDir: 'static',
        sourcemap: process.env.NODE_ENV !== 'production',

        // Qiankun specific rollup options
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
            output: {
                // UMD format for qiankun compatibility
                format: 'umd',
                entryFileNames: 'js/[name].[hash].js',
                chunkFileNames: 'js/[name].[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const extType = info[info.length - 1];
                    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
                        return `images/[name].[hash].${extType}`;
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
                        return `fonts/[name].[hash].${extType}`;
                    }
                    return `${extType}/[name].[hash].${extType}`;
                },
                // Qiankun library configuration
                library: {
                    name: '[name]',
                    type: 'umd',
                },
                globals: {
                    vue: 'Vue',
                },
            },
            external: ['vue'], // Externalize Vue for qiankun sharing
        },

        // CSS code splitting
        cssCodeSplit: true,

        // Enhanced minification for Vue 3
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: process.env.NODE_ENV === 'production',
                pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log'] : [],
            },
            format: {
                comments: false,
            },
        },

        // Performance optimizations
        chunkSizeWarningLimit: 1000,
    },

    // CSS configuration
    css: {
        devSourcemap: true,
        preprocessorOptions: {
            scss: {
                additionalData: '@import "@/styles/variables.scss";',
            },
            less: {
                modifyVars: {
                    '@primary-color': '#1890ff',
                },
                javascriptEnabled: true,
            },
        },
        postcss: {
            plugins: [
                autoprefixer({
                    overrideBrowserslist: [
                        '> 1%',
                        'last 2 versions',
                        'not dead',
                    ],
                }),
            ],
        },
    },

    // Vue 3 specific definitions
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV !== 'production',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        __QIANKUN__: true,
        'process.env': process.env,
    },

    // Dependency optimization
    optimizeDeps: {
        include: [
            'vue',
            'vue-router',
            'pinia',
            '@vue/shared',
        ],
        exclude: ['vue-demi'],
    },

    // Qiankun specific base path
    base: process.env.NODE_ENV === 'production' ? '/vue3-app/' : '/',

    // Environment variables
    envPrefix: ['VITE_', 'VUE_APP_'],

    // ESBuild configuration for Vue 3
    esbuild: {
        target: 'esnext',
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
})