import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'
import { federation } from '@module-federation/vite'
import legacy from '@vitejs/plugin-legacy'
import { createHtmlPlugin } from 'vite-plugin-html'
import { compression } from 'vite-plugin-compression2'

const __dirname = import.meta.dirname;

export const viteVue2ConfigModuleFederation = defineConfig({
  plugins: [
    // Vue 2 support
    createVuePlugin({
      jsx: true,
      jsxOptions: {
        compositionAPI: true,
      },
    }),

    // Module Federation configuration for Vue 2
    federation({
      name: 'vue2MicroApp',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.vue',
        './Button': './src/components/Button.vue',
        './utils': './src/utils/index.js',
        './store': './src/store/index.js',
      },
      remotes: {
        // Define remote applications
        shell: 'shell@http://localhost:3000/remoteEntry.js',
        utils: 'utils@http://localhost:3001/remoteEntry.js',
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '^2.7.0',
          eager: false,
        },
        'vue-router': {
          singleton: true,
          requiredVersion: '^3.6.0',
        },
        vuex: {
          singleton: true,
          requiredVersion: '^3.6.0',
        },
        '@vue/composition-api': {
          singleton: true,
          requiredVersion: '^1.7.0',
        },
        'element-ui': {
          singleton: true,
          requiredVersion: '^2.15.0',
        },
      },
    }),

    // Legacy browser support
    legacy({
      targets: ['> 1%', 'last 2 versions', 'not dead', 'ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: ['es.promise.finally'],
    }),

    // HTML template processing
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Vue 2 Module Federation App',
          description: 'Vue 2 microfrontend with Module Federation',
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

  // Module Federation specific server configuration
  server: {
    host: '0.0.0.0',
    port: 8081,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:8081',
  },

  // Preview server
  preview: {
    host: '0.0.0.0',
    port: 4174,
    strictPort: true,
    cors: true,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@commons': resolve(__dirname, '../'),
      '@components': resolve(__dirname, '../components'),
      '@ui': resolve(__dirname, '../ui'),
      'vue': 'vue/dist/vue.esm.js',
    },
    extensions: ['.js', '.ts', '.vue', '.json'],
  },

  // Build configuration optimized for Module Federation
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    
    rollupOptions: {
      input: resolve(__dirname, '../../index.html'),
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
        // Code splitting for Module Federation
        manualChunks: {
          vue: ['vue'],
          'vue-ecosystem': ['vue-router', 'vuex', '@vue/composition-api'],
          'ui-library': ['element-ui'],
        },
      },
    },

    // Module Federation specific minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
      format: {
        comments: false,
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
          '@primary-color': '#1890ff',
        },
        javascriptEnabled: true,
      },
    },
  },

  // Define global constants for Module Federation
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __MODULE_FEDERATION__: true,
    'process.env': process.env,
  },

  // Dependency optimization for Module Federation
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'vuex',
      '@vue/composition-api',
      'element-ui',
    ],
    exclude: ['vue-demi'],
  },

  // Base path for Module Federation
  base: process.env.NODE_ENV === 'production' ? '/vue2-mf/' : '/',
  
  // Environment variables
  envPrefix: ['VITE_', 'VUE_APP_', 'MF_'],
})