import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'
import legacy from '@vitejs/plugin-legacy'
import { createHtmlPlugin } from 'vite-plugin-html'
import { compression } from 'vite-plugin-compression2'
import autoprefixer from 'autoprefixer'
import tailwindcss from '@tailwindcss/vite'


export const viteVue2Config = (__dirname) => defineConfig({
    esbuild: {
        supported: {
            'top-level-await': true //browsers can handle top-level-await features
        },
    },

    plugins: [
        // Tailwind CSS integration
        tailwindcss(),
        
        // Vue 2 support
        createVuePlugin({
            jsx: true,
            jsxOptions: {
                compositionAPI: true,
            },
        }),

        // Legacy browser support for Vue 2
        legacy({
            targets: ['> 1%', 'last 2 versions', 'not dead', 'ie >= 11'],
            // additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
            // renderLegacyChunks: true,
            polyfills: [
                'es.symbol',
                'es.array.filter',
                'es.promise',
                'es.promise.finally',
            ],
        }),

        // HTML template processing
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    title: 'Vue 2 Qiankun Micro App',
                    description: 'Vue 2 microfrontend with Qiankun integration',
                },
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
            // '@commons': resolve(import.meta.dirname, '../'),
            // '@components': resolve(import.meta.dirname, '../components'),
            // '@ui': resolve(import.meta.dirname, '../ui'),
            'vue': 'vue/dist/vue.esm.js', // Vue 2 ESM build
        },
        extensions: ['.js', '.ts', '.vue', '.json'],
    },

    // Development server
    server: {
        host: '0.0.0.0',
        port: 8080,
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
        port: 4173,
        strictPort: true,
        cors: true,
    },

    // Build configuration
    build: {
        target: 'es2015', // Vue 2 compatibility
        outDir: 'dist',
        assetsDir: 'static',
        sourcemap: process.env.NODE_ENV !== 'production',

        // Qiankun specific build options
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

        // Minification options
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: process.env.NODE_ENV === 'production',
            },
        },
    },

    // CSS configuration
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@import "@/styles/variables.scss";',
            },
            less: {
                modifyVars: {
                    // Ant Design Vue variables
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
                        'ie >= 11',
                    ],
                }),
            ],
        },
    },

    // Define global constants
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __QIANKUN__: true,
        'process.env': process.env,
    },

    // Dependency optimization
    optimizeDeps: {
        include: [
            'vue',
            'vue-router',
            'vuex',
            '@vue/composition-api',
        ],
        exclude: ['vue-demi'],
    },

    // Qiankun specific configuration
    base: process.env.NODE_ENV === 'production' ? '/vue2-app/' : '/',

    // Environment variables
    envPrefix: ['VITE_', 'VUE_APP_'],
})