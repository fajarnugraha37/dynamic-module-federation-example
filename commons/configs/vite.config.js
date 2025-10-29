import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { createHtmlPlugin } from 'vite-plugin-html'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'
import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'


export const viteConfig = (__dirname) => defineConfig({
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
                    // Enable SSG-friendly optimizations
                    hoistStatic: true,
                    cacheHandlers: true,
                },
            },
        }),

        // Module Federation for microfrontends
        federation({
            name: 'vue3-app',
            filename: 'remoteEntry.js',
            exposes: {
                // './App': './src/App.vue',
                // './components': './src/components/index.ts',
            },
            shared: {
                vue: {
                    singleton: true,
                    requiredVersion: '^3.5.0',
                },
                'vue-router': {
                    singleton: true,
                    requiredVersion: '^4.6.0',
                },
            },
        }),

        // HTML template processing
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    title: 'Vue 3 Microfrontend',
                    description: 'Production-ready Vue 3 SSG application',
                },
            },
        }),

        // PWA support for enhanced performance
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
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
                name: 'Vue 3 Microfrontend',
                short_name: 'Vue3MF',
                description: 'Vue 3 Static Site with Module Federation',
                theme_color: '#4DBA87',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: '/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),

        // Bundle analyzer for production optimization
        process.env.ANALYZE && visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
        }),

        // Compression for production builds
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

    // Development server configuration
    server: {
        host: '0.0.0.0',
        port: 3000,
        strictPort: true,
        cors: true,
        hmr: {
            overlay: true,
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },

    // Preview server configuration
    preview: {
        host: '0.0.0.0',
        port: 4173,
        strictPort: true,
        cors: true,
    },

    // Build optimization
    build: {
        target: 'esnext',
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: process.env.NODE_ENV !== 'production',
        minify: 'terser',
        cssMinify: true,

        // Rollup options for advanced optimization
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
            input: {
                main: resolve(__dirname, '../../index.html'),
            },
            output: {
                // Code splitting for better caching
                manualChunks: {
                    vendor: ['vue', 'vue-router'],
                    commons: ['@commons/components', '@commons/ui'],
                },
                // Asset naming for long-term caching
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const extType = info[info.length - 1];
                    if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name)) {
                        return `assets/media/[name]-[hash].${extType}`;
                    }
                    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
                        return `assets/images/[name]-[hash].${extType}`;
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
                        return `assets/fonts/[name]-[hash].${extType}`;
                    }
                    return `assets/[ext]/[name]-[hash].${extType}`;
                },
            },
            external: (id) => {
                // Externalize dependencies for micro-frontend architecture
                if (id.startsWith('qiankun')) return true;
                return false;
            },
        },

        // Terser options for production minification
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

    // CSS processing
    css: {
        devSourcemap: true,
        preprocessorOptions: {
            scss: {
                additionalData: '@import "@/styles/variables.scss";',
            },
        },
        postcss: {
            plugins: [
                require('autoprefixer')({
                    overrideBrowserslist: [
                        '> 1%',
                        'last 2 versions',
                        'not dead',
                        'not ie <= 11',
                    ],
                }),
                require('cssnano')({
                    preset: 'advanced',
                }),
            ],
        },
    },

    // Environment variables
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: process.env.NODE_ENV !== 'production',
    },

    // Dependency optimization
    optimizeDeps: {
        include: [
            'vue',
            'vue-router',
            '@vue/shared',
        ],
        exclude: [
            'vue-demi',
        ],
    },

    // SSG-specific configuration
    ssgOptions: {
        script: 'async',
        formatting: 'minify',
        crittersOptions: {
            reduceInlineStyles: false,
        },
    },

    // Performance and caching
    esbuild: {
        target: 'esnext',
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
        legalComments: 'none',
    },
})