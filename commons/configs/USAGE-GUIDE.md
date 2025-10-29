# Microfrontends Configuration Usage Guide

This guide provides step-by-step instructions for using the shared Vite and TypeScript configurations in your microfrontend projects.

## 🚀 Quick Start

### 1. Choose Your Configuration

First, determine which configuration you need based on your project:

| Framework | Architecture | Configuration File | Port |
|-----------|-------------|-------------------|------|
| Vue 2 | Qiankun | `vite.vue2.js` | 8080 |
| Vue 2 | Module Federation | `vite.vue2.module-federation.js` | 8081 |
| Vue 3 | Qiankun | `vite.vue3.js` | 8082 |
| Vue 3 | Module Federation | `vite.vue3.module-federation.js` | 8083 |

### 2. Install Dependencies

In your project root, install the required dependencies:

```bash
# Core dependencies (required for all projects)
bun add vite vue typescript

# Vue 2 projects
bun add @vue/composition-api vue-router@3 vuex@3
bun add -D vite-plugin-vue2 @vitejs/plugin-legacy

# Vue 3 projects  
bun add vue-router@4 pinia
bun add -D @vitejs/plugin-vue @vitejs/plugin-vue-jsx

# Module Federation projects (additional)
bun add -D @module-federation/vite

# Optional: For enhanced features
bun add -D vite-plugin-pwa vite-plugin-html rollup-plugin-visualizer vite-plugin-compression2
```

## 📁 Project Setup

### Step 1: Create Project Structure

```
your-microfrontend/
├── src/
│   ├── components/
│   ├── views/
│   ├── stores/          # Pinia stores (Vue 3) or Vuex (Vue 2)
│   ├── composables/     # Vue 3 composables
│   ├── utils/
│   ├── styles/
│   ├── App.vue
│   └── main.ts
├── public/
├── types/              # TypeScript definitions
├── vite.config.ts
├── tsconfig.json
├── package.json
└── index.html
```

### Step 2: Configure Vite

Create `vite.config.ts` in your project root:

#### For Vue 3 + Module Federation:

```typescript
import { defineConfig } from 'vite'
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'

export default defineConfig({
  ...viteVue3ConfigModuleFederation,
  
  // Override server settings
  server: {
    ...viteVue3ConfigModuleFederation.server,
    port: 8083, // Your specific port
  },
  
  // Customize Module Federation
  plugins: viteVue3ConfigModuleFederation.plugins.map(plugin => {
    if (plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'federation') {
      // Customize federation configuration
      return plugin({
        name: 'myVue3App',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.vue',
          './Header': './src/components/Header.vue',
          './utils': './src/utils/index.ts',
        },
        remotes: {
          shell: 'shell@http://localhost:3000/remoteEntry.js',
          shared: 'shared@http://localhost:3001/remoteEntry.js',
        },
        shared: {
          vue: { singleton: true },
          'vue-router': { singleton: true },
          pinia: { singleton: true },
        },
      })
    }
    return plugin
  }),
})
```

#### For Vue 3 + Qiankun:

```typescript
import { defineConfig } from 'vite'
import { viteVue3Config } from '@commons/configs/vite.vue3'

export default defineConfig({
  ...viteVue3Config,
  
  // Customize for your app
  server: {
    ...viteVue3Config.server,
    port: 8082,
  },
  
  // Override base path for qiankun
  base: process.env.NODE_ENV === 'production' ? '/my-vue3-app/' : '/',
})
```

#### For Vue 2 + Qiankun:

```typescript
import { defineConfig } from 'vite'
import { viteVue2Config } from '@commons/configs/vite.vue2'

export default defineConfig({
  ...viteVue2Config,
  
  server: {
    ...viteVue2Config.server,
    port: 8080,
  },
  
  base: process.env.NODE_ENV === 'production' ? '/my-vue2-app/' : '/',
})
```

#### For Vue 2 + Module Federation:

```typescript
import { defineConfig } from 'vite'
import { viteVue2ConfigModuleFederation } from '@commons/configs/vite.vue2.module-federation'

export default defineConfig({
  ...viteVue2ConfigModuleFederation,
  
  server: {
    ...viteVue2ConfigModuleFederation.server,
    port: 8081,
  },
  
  // Customize federation settings
  plugins: viteVue2ConfigModuleFederation.plugins.map(plugin => {
    if (plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'federation') {
      return plugin({
        name: 'myVue2App',
        exposes: {
          './LegacyComponent': './src/components/LegacyComponent.vue',
        },
        shared: {
          vue: { singleton: true, requiredVersion: '^2.7.0' },
          'vue-router': { singleton: true },
        },
      })
    }
    return plugin
  }),
})
```

### Step 3: Configure TypeScript

Create `tsconfig.json`:

#### For Vue 3 Projects:

```json
{
  "extends": "@commons/configs/tsconfig.vue3",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"],
      "@stores/*": ["src/stores/*"]
    }
  },
  "include": [
    "src/**/*",
    "types/**/*",
    "*.vue",
    "*.ts"
  ]
}
```

#### For Vue 2 Projects:

```json
{
  "extends": "@commons/configs/tsconfig.vue2",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@views/*": ["src/views/*"]
    }
  }
}
```

#### For Module Federation Projects:

```json
{
  "extends": "@commons/configs/tsconfig.mf",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "shell/*": ["types/remotes/shell/*"],
      "shared/*": ["types/remotes/shared/*"]
    }
  }
}
```

### Step 4: Update Package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:analyze": "ANALYZE=true vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "type-check:watch": "vue-tsc --noEmit --watch",
    "serve": "vite preview"
  }
}
```

## 🔧 Environment Configuration

### Using Environment-Specific Configs

For different build environments, use the environment configuration:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createEnvironmentConfig } from '@commons/configs/vite.env'

export default defineConfig(({ mode }) => {
  return createEnvironmentConfig(mode)
})
```

### Environment Variables

Create `.env` files for different environments:

#### `.env.development`
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=My App (Dev)
VITE_LOG_LEVEL=debug

# Module Federation
MF_SHELL_URL=http://localhost:3000
MF_SHARED_URL=http://localhost:3001
```

#### `.env.production`
```env
VITE_API_URL=https://api.myapp.com
VITE_APP_TITLE=My App
VITE_LOG_LEVEL=error

# Module Federation
MF_SHELL_URL=https://shell.myapp.com
MF_SHARED_URL=https://shared.myapp.com
```

## 🏗️ Application Structure

### Vue 3 + Module Federation Example

#### Main Application (`src/main.ts`)
```typescript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

// Router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Your routes
  ]
})

// Store
const pinia = createPinia()

app.use(router)
app.use(pinia)

// Qiankun lifecycle hooks (if using Qiankun)
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}

// Mount function for both standalone and microfrontend modes
function render(props = {}) {
  const { container } = props
  const appElement = container ? container.querySelector('#app') : '#app'
  app.mount(appElement)
}

// Standalone mode
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// Qiankun lifecycle
export async function bootstrap() {
  console.log('Vue 3 app bootstrapped')
}

export async function mount(props) {
  render(props)
}

export async function unmount() {
  app.unmount()
}
```

#### Component Export (`src/components/index.ts`)
```typescript
// For Module Federation
export { default as Header } from './Header.vue'
export { default as Footer } from './Footer.vue'
export { default as Button } from './Button.vue'
```

#### Store Setup (`src/stores/index.ts`)
```typescript
import { createPinia } from 'pinia'

export const pinia = createPinia()

// Export individual stores
export { useUserStore } from './user'
export { useAppStore } from './app'
```

### Vue 2 + Qiankun Example

#### Main Application (`src/main.ts`)
```typescript
import Vue from 'vue'
import VueRouter from 'vue-router'
import VueCompositionAPI from '@vue/composition-api'
import App from './App.vue'

Vue.use(VueCompositionAPI)
Vue.use(VueRouter)

let instance = null

function render(props = {}) {
  const { container } = props
  const router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? '/vue2-app/' : '/',
    mode: 'history',
    routes: [
      // Your routes
    ]
  })

  instance = new Vue({
    router,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// Standalone mode
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  console.log('Vue 2 app bootstrapped')
}

export async function mount(props) {
  render(props)
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}
```

## 🚀 Development Workflow

### 1. Start Development Server

```bash
# Start your microfrontend
bun run dev

# The app will be available at:
# Vue 2 + Qiankun: http://localhost:8080
# Vue 2 + Module Federation: http://localhost:8081  
# Vue 3 + Qiankun: http://localhost:8082
# Vue 3 + Module Federation: http://localhost:8083
```

### 2. Type Checking

```bash
# Check types
bun run type-check

# Watch mode
bun run type-check:watch
```

### 3. Build for Production

```bash
# Standard build
bun run build

# Build with bundle analysis
bun run build:analyze
```

### 4. Preview Production Build

```bash
bun run preview
```

## 🔗 Integration Patterns

### Qiankun Integration

#### In Main Application:
```typescript
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'vue2-app',
    entry: '//localhost:8080',
    container: '#subapp-vue2',
    activeRule: '/vue2',
  },
  {
    name: 'vue3-app', 
    entry: '//localhost:8082',
    container: '#subapp-vue3',
    activeRule: '/vue3',
  },
])

start()
```

### Module Federation Integration

#### Loading Remote Components:
```typescript
// Vue 3 example
import { defineAsyncComponent } from 'vue'

const RemoteButton = defineAsyncComponent(() => 
  import('vue3MicroApp/Button')
)

export default {
  components: {
    RemoteButton
  }
}
```

#### Host Application Setup:
```typescript
// In host app vite.config.ts
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [
    federation({
      name: 'shell',
      remotes: {
        vue2App: 'vue2MicroApp@http://localhost:8081/remoteEntry.js',
        vue3App: 'vue3MicroApp@http://localhost:8083/remoteEntry.js',
      },
    }),
  ],
})
```

## 🛠️ Advanced Customization

### Custom Plugin Configuration

```typescript
import { defineConfig } from 'vite'
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'
import someCustomPlugin from 'some-custom-plugin'

export default defineConfig({
  ...viteVue3ConfigModuleFederation,
  
  plugins: [
    ...viteVue3ConfigModuleFederation.plugins,
    someCustomPlugin({
      // custom options
    }),
  ],
  
  // Override CSS processing
  css: {
    ...viteVue3ConfigModuleFederation.css,
    preprocessorOptions: {
      ...viteVue3ConfigModuleFederation.css?.preprocessorOptions,
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `,
      },
    },
  },
})
```

### Custom Build Configuration

```typescript
export default defineConfig({
  ...baseConfig,
  
  build: {
    ...baseConfig.build,
    outDir: 'custom-dist',
    rollupOptions: {
      ...baseConfig.build?.rollupOptions,
      output: {
        ...baseConfig.build?.rollupOptions?.output,
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash', 'axios'],
        },
      },
    },
  },
})
```

## 📊 Performance Optimization

### Bundle Analysis

```bash
# Generate bundle analysis
ANALYZE=true bun run build

# This creates dist/stats.html with detailed bundle information
```

### Code Splitting Best Practices

```typescript
// Route-based splitting
const routes = [
  {
    path: '/home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue'),
  },
]

// Component-based splitting
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
```

## 🐛 Troubleshooting

### Common Issues

#### Module Federation Type Errors
```bash
# Generate types for remotes
npx @module-federation/typescript
```

#### Qiankun CORS Issues
```typescript
// In vite.config.ts
export default defineConfig({
  server: {
    cors: {
      origin: '*',
      credentials: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
```

#### Vue 2 Composition API Issues
```typescript
// Make sure to install and use composition API
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
```

### Debug Mode

```bash
# Run with debug logging
DEBUG=vite:* bun run dev

# Type check with verbose output
bun run type-check --verbose
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vue 2 Documentation](https://v2.vuejs.org/)
- [Qiankun Documentation](https://qiankun.umijs.org/)
- [Module Federation Documentation](https://module-federation.github.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

Need help? Check the existing documentation files or create an issue in the repository.