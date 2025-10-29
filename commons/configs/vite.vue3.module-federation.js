import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import { federation } from '@module-federation/vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { compression } from 'vite-plugin-compression2'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import autoprefixer from 'autoprefixer'


export const viteVue3ConfigModuleFederation = (__dirname) => defineConfig({
    esbuild: {
        supported: {
            'top-level-await': true //browsers can handle top-level-await features
        },
    },

    plugins: [
        // Vue 3 support
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.startsWith('micro-app') || tag.startsWith('remote-'),
                },
            },
        }),

        // Vue JSX support
        vueJsx(),

        // Module Federation configuration for Vue 3
        federation({
            name: 'vue3MicroApp',
            filename: 'remoteEntry.js',
            exposes: {
                // './App': './src/App.vue',
                // './Button': './src/components/Button.vue',
                // './Card': './src/components/Card.vue',
                // './utils': './src/utils/index.ts',
                // './store': './src/stores/index.ts',
                // './composables': './src/composables/index.ts',
            },
            remotes: {
                // Define remote applications
                shell: {
                    type: 'module',
                    name: 'shell',
                    entry: 'http://localhost:3000/remoteEntry.js',
                    entryGlobalName: 'shell',
                    shareScope: 'default',
                },
                utils: {
                    type: 'module',
                    name: 'utils',
                    entry: 'http://localhost:3001/remoteEntry.js',
                    entryGlobalName: 'utils',
                    shareScope: 'default',
                },
            },
            shared: {
                vue: {
                    singleton: true,
                    requiredVersion: '^3.5.0',
                    eager: false,
                },
                'vue-router': {
                    singleton: true,
                    requiredVersion: '^4.6.0',
                },
                pinia: {
                    singleton: true,
                    requiredVersion: '^2.1.0',
                },
                '@vue/shared': {
                    singleton: true,
                    requiredVersion: '^3.5.0',
                },
                'element-plus': {
                    singleton: true,
                    requiredVersion: '^2.8.0',
                },
                'ant-design-vue': {
                    singleton: true,
                    requiredVersion: '^4.0.0',
                },
            },
        }),

        // HTML template processing
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    title: 'Vue 3 Module Federation App',
                    description: 'Vue 3 microfrontend with Module Federation',
                },
            },
        }),

        // PWA support
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\./,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24, // 24 hours
                            },
                        },
                    },
                ],
            },
            manifest: {
                name: 'Vue 3 Module Federation App',
                short_name: 'Vue3MF',
                description: 'Vue 3 Microfrontend with Module Federation',
                theme_color: '#4DBA87',
                background_color: '#ffffff',
                display: 'standalone',
            },
        }),

        // Bundle analyzer for production optimization
        process.env.ANALYZE && visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
        }),

        // Compression for production
        compression({
            algorithm: 'gzip',
            include: /\.(js|css|html|svg)$/,
            threshold: 1024,
        }),
        compression({
            algorithm: 'brotliCompress',
            include: /\.(js|css|html|svg)$/,
            threshold: 1024,
        }),
    ],

    // Module Federation specific server configuration
    server: {
        host: '0.0.0.0',
        port: 8083,
        strictPort: true,
        cors: true,
        origin: 'http://localhost:8083',
        hmr: {
            overlay: true,
        },
    },

    // Preview server
    preview: {
        host: '0.0.0.0',
        port: 4176,
        strictPort: true,
        cors: true,
    },

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

    // Build configuration optimized for Module Federation
    build: {
        target: 'esnext',
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: process.env.NODE_ENV !== 'production',

        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
            output: {
                // Module Federation compatible output
                entryFileNames: 'assets/js/[name]-[hash].js',
                chunkFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const extType = info[info.length - 1];
                    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
                        return `assets/images/[name]-[hash].${extType}`;
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
                        return `assets/fonts/[name]-[hash].${extType}`;
                    }
                    return `assets/[ext]/[name]-[hash].${extType}`;
                },
                // Advanced code splitting for Module Federation
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('vue')) {
                            return 'vue-vendor';
                        }
                        if (id.includes('element-plus') || id.includes('ant-design-vue')) {
                            return 'ui-vendor';
                        }
                        if (id.includes('lodash') || id.includes('axios')) {
                            return 'utils-vendor';
                        }
                        return 'vendor';
                    }
                    if (id.includes('src/components')) {
                        return 'components';
                    }
                    if (id.includes('src/composables')) {
                        return 'composables';
                    }
                },
            },
        },

        // Enhanced minification for Module Federation
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
        reportCompressedSize: false, // Disable for faster builds
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
                require('cssnano')({
                    preset: 'advanced',
                }),
            ],
        },
    },

    // Vue 3 + Module Federation definitions
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV !== 'production',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        __MODULE_FEDERATION__: true,
        'process.env': process.env,
    },

    // Dependency optimization for Module Federation
    optimizeDeps: {
        include: [
            'vue',
            'vue-router',
            'pinia',
            '@vue/shared',
            'element-plus',
            'ant-design-vue',
        ],
        exclude: ['vue-demi'],
    },

    // Base path for Module Federation
    base: process.env.NODE_ENV === 'production' ? '/vue3-mf/' : '/',

    // Environment variables
    envPrefix: ['VITE_', 'VUE_APP_', 'MF_'],

    // Enhanced ESBuild configuration
    esbuild: {
        target: 'esnext',
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
        legalComments: 'none',
    },
})