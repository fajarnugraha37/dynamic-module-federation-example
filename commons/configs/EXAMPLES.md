# Real-World Implementation Examples

This guide provides practical, copy-paste examples for implementing microfrontends using the shared configurations.

## 🏢 Scenario 1: E-commerce Platform

### Architecture Overview
- **Shell App** (Vue 3 + Module Federation) - Main navigation and layout
- **Product Catalog** (Vue 3 + Module Federation) - Product listing and details  
- **Shopping Cart** (Vue 2 + Qiankun) - Legacy cart system
- **User Dashboard** (Vue 3 + Qiankun) - User account management

### Shell Application Setup

#### `packages/shell/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'

export default defineConfig({
  ...viteVue3ConfigModuleFederation,
  
  server: { port: 3000 },
  
  plugins: viteVue3ConfigModuleFederation.plugins.map(plugin => {
    if (plugin?.name === 'federation') {
      return plugin({
        name: 'shell',
        filename: 'remoteEntry.js',
        exposes: {
          './Layout': './src/components/Layout.vue',
          './Navigation': './src/components/Navigation.vue',
          './store': './src/stores/index.ts',
        },
        remotes: {
          products: 'products@http://localhost:3001/remoteEntry.js',
          cart: 'cart@http://localhost:3002/remoteEntry.js',
          dashboard: 'dashboard@http://localhost:3003/remoteEntry.js',
        },
        shared: {
          vue: { singleton: true, requiredVersion: '^3.5.0' },
          'vue-router': { singleton: true },
          pinia: { singleton: true },
          'element-plus': { singleton: true },
        },
      })
    }
    return plugin
  }),
})
```

#### `packages/shell/src/main.ts`
```typescript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'

const app = createApp(App)

// Router with microfrontend routes
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/products' },
    { 
      path: '/products/:pathMatch(.*)*', 
      component: () => import('products/App'),
      meta: { title: 'Products' }
    },
    {
      path: '/cart/:pathMatch(.*)*',
      component: () => import('cart/App'),
      meta: { title: 'Shopping Cart' }
    },
    {
      path: '/dashboard/:pathMatch(.*)*', 
      component: () => import('dashboard/App'),
      meta: { title: 'Dashboard' }
    },
  ],
})

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
```

### Product Catalog (Module Federation)

#### `packages/products/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'

export default defineConfig({
  ...viteVue3ConfigModuleFederation,
  
  server: { port: 3001 },
  
  plugins: viteVue3ConfigModuleFederation.plugins.map(plugin => {
    if (plugin?.name === 'federation') {
      return plugin({
        name: 'products',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/App.vue',
          './ProductList': './src/components/ProductList.vue',
          './ProductDetail': './src/components/ProductDetail.vue',
          './store': './src/stores/products.ts',
        },
        remotes: {
          shell: 'shell@http://localhost:3000/remoteEntry.js',
        },
        shared: {
          vue: { singleton: true, requiredVersion: '^3.5.0' },
          'vue-router': { singleton: true },
          pinia: { singleton: true },
          axios: { singleton: true },
        },
      })
    }
    return plugin
  }),
})
```

#### `packages/products/src/stores/products.ts`
```typescript
import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    selectedProduct: null,
    loading: false,
    filters: {
      category: '',
      priceRange: [0, 1000],
      inStock: true,
    }
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const response = await axios.get('/api/products', {
          params: this.filters
        })
        this.products = response.data
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchProduct(id: string) {
      this.loading = true
      try {
        const response = await axios.get(`/api/products/${id}`)
        this.selectedProduct = response.data
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        this.loading = false
      }
    },

    updateFilters(newFilters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...newFilters }
      this.fetchProducts()
    }
  }
})
```

### Shopping Cart (Qiankun - Legacy Vue 2)

#### `packages/cart/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import { viteVue2Config } from '@commons/configs/vite.vue2'

export default defineConfig({
  ...viteVue2Config,
  
  server: { port: 3002 },
  base: '/cart/',
  
  build: {
    ...viteVue2Config.build,
    rollupOptions: {
      ...viteVue2Config.build?.rollupOptions,
      output: {
        ...viteVue2Config.build?.rollupOptions?.output,
        library: {
          name: 'cart',
          type: 'umd',
        },
      },
    },
  },
})
```

#### `packages/cart/src/main.ts`
```typescript
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import VueCompositionAPI from '@vue/composition-api'
import ElementUI from 'element-ui'
import App from './App.vue'
import store from './store'

Vue.use(VueCompositionAPI)
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(ElementUI)

let instance = null
let router = null

function render(props = {}) {
  const { container } = props
  
  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? '/cart/' : '/',
    mode: 'history',
    routes: [
      { path: '/', component: () => import('./views/CartSummary.vue') },
      { path: '/checkout', component: () => import('./views/Checkout.vue') },
    ],
  })

  instance = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// Qiankun lifecycle
export async function bootstrap() {
  console.log('[cart] bootstrapped')
}

export async function mount(props) {
  console.log('[cart] props from main framework', props)
  render(props)
}

export async function unmount() {
  instance?.$destroy()
  instance = null
  router = null
}

// Standalone mode
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}
```

## 🏥 Scenario 2: Healthcare Management System

### Architecture Overview
- **Main Dashboard** (Vue 3 + Module Federation)
- **Patient Management** (Vue 3 + Module Federation)
- **Appointment Scheduler** (Vue 3 + Module Federation)
- **Legacy Billing System** (Vue 2 + Qiankun)

### Main Dashboard with Micro App Loading

#### `packages/dashboard/src/composables/useMicroApps.ts`
```typescript
import { ref, onMounted } from 'vue'
import { loadRemote } from '@module-federation/runtime'

export function useMicroApps() {
  const loadedApps = ref(new Map())
  const loading = ref(false)
  const error = ref(null)

  const loadMicroApp = async (appName: string, componentName: string) => {
    if (loadedApps.value.has(`${appName}/${componentName}`)) {
      return loadedApps.value.get(`${appName}/${componentName}`)
    }

    try {
      loading.value = true
      const component = await loadRemote(`${appName}/${componentName}`)
      loadedApps.value.set(`${appName}/${componentName}`, component)
      return component
    } catch (err) {
      error.value = err
      console.error(`Failed to load ${appName}/${componentName}:`, err)
    } finally {
      loading.value = false
    }
  }

  return {
    loadedApps,
    loading,
    error,
    loadMicroApp,
  }
}
```

#### `packages/dashboard/src/components/AppContainer.vue`
```vue
<template>
  <div class="app-container">
    <el-loading-directive v-loading="loading">
      <component 
        :is="loadedComponent" 
        v-if="loadedComponent"
        v-bind="componentProps"
        @app-event="handleAppEvent"
      />
      <div v-else-if="error" class="error-state">
        <el-alert type="error" :title="error.message" show-icon />
      </div>
    </el-loading-directive>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineAsyncComponent } from 'vue'
import { useMicroApps } from '../composables/useMicroApps'

interface Props {
  appName: string
  componentName: string
  componentProps?: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits(['app-event'])

const { loadMicroApp, loading, error } = useMicroApps()
const loadedComponent = ref(null)

const loadComponent = async () => {
  try {
    const component = await loadMicroApp(props.appName, props.componentName)
    loadedComponent.value = defineAsyncComponent(() => Promise.resolve(component))
  } catch (err) {
    console.error('Failed to load component:', err)
  }
}

const handleAppEvent = (event: any) => {
  emit('app-event', { app: props.appName, ...event })
}

watch(() => [props.appName, props.componentName], loadComponent, { immediate: true })
</script>
```

### Patient Management with Real-time Updates

#### `packages/patients/src/stores/patients.ts`
```typescript
import { defineStore } from 'pinia'
import { io, Socket } from 'socket.io-client'

export const usePatientsStore = defineStore('patients', {
  state: () => ({
    patients: [],
    selectedPatient: null,
    socket: null as Socket | null,
    searchTerm: '',
    filters: {
      status: 'all',
      department: '',
    }
  }),

  getters: {
    filteredPatients: (state) => {
      return state.patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase()
          .includes(state.searchTerm.toLowerCase())
        const matchesStatus = state.filters.status === 'all' || 
          patient.status === state.filters.status
        const matchesDepartment = !state.filters.department || 
          patient.department === state.filters.department
        
        return matchesSearch && matchesStatus && matchesDepartment
      })
    }
  },

  actions: {
    initializeSocket() {
      this.socket = io(process.env.VITE_SOCKET_URL)
      
      this.socket.on('patient:updated', (patient) => {
        const index = this.patients.findIndex(p => p.id === patient.id)
        if (index !== -1) {
          this.patients[index] = patient
        }
      })

      this.socket.on('patient:created', (patient) => {
        this.patients.unshift(patient)
      })

      this.socket.on('patient:deleted', (patientId) => {
        const index = this.patients.findIndex(p => p.id === patientId)
        if (index !== -1) {
          this.patients.splice(index, 1)
        }
      })
    },

    async fetchPatients() {
      try {
        const response = await fetch('/api/patients')
        this.patients = await response.json()
      } catch (error) {
        console.error('Failed to fetch patients:', error)
      }
    },

    async createPatient(patientData: any) {
      try {
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patientData)
        })
        const newPatient = await response.json()
        
        // Socket will handle the update, but we can optimistically update
        this.patients.unshift(newPatient)
        return newPatient
      } catch (error) {
        console.error('Failed to create patient:', error)
        throw error
      }
    }
  }
})
```

## 🏭 Scenario 3: Manufacturing Dashboard

### Multi-Environment Configuration

#### `packages/manufacturing/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import { createEnvironmentConfig } from '@commons/configs/vite.env'
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'

export default defineConfig(({ mode }) => {
  const baseConfig = createEnvironmentConfig(mode)
  
  return {
    ...baseConfig,
    
    server: { port: 4000 },
    
    plugins: baseConfig.plugins.map(plugin => {
      if (plugin?.name === 'federation') {
        return plugin({
          name: 'manufacturing',
          exposes: {
            './ProductionLine': './src/components/ProductionLine.vue',
            './QualityControl': './src/components/QualityControl.vue',
            './Analytics': './src/components/Analytics.vue',
          },
          remotes: {
            inventory: `inventory@${process.env.VITE_INVENTORY_URL}/remoteEntry.js`,
            reports: `reports@${process.env.VITE_REPORTS_URL}/remoteEntry.js`,
          },
          shared: {
            vue: { singleton: true },
            'vue-router': { singleton: true },
            pinia: { singleton: true },
            'chart.js': { singleton: true },
            'date-fns': { singleton: true },
          },
        })
      }
      return plugin
    }),
    
    // Environment-specific optimizations
    define: {
      ...baseConfig.define,
      __FEATURE_FLAGS__: JSON.stringify({
        enableAnalytics: mode === 'production',
        enableDebugTools: mode === 'development',
        enableRealTimeUpdates: mode !== 'development',
      }),
    },
  }
})
```

#### Environment Files

**`.env.development`**
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=ws://localhost:8001
VITE_INVENTORY_URL=http://localhost:4001
VITE_REPORTS_URL=http://localhost:4002
VITE_ENABLE_MOCK=true
VITE_LOG_LEVEL=debug
```

**`.env.staging`**
```env
VITE_API_URL=https://staging-api.manufacturing.com/api
VITE_SOCKET_URL=wss://staging-api.manufacturing.com
VITE_INVENTORY_URL=https://staging-inventory.manufacturing.com
VITE_REPORTS_URL=https://staging-reports.manufacturing.com  
VITE_ENABLE_MOCK=false
VITE_LOG_LEVEL=warn
```

**`.env.production`**
```env
VITE_API_URL=https://api.manufacturing.com/api
VITE_SOCKET_URL=wss://api.manufacturing.com
VITE_INVENTORY_URL=https://inventory.manufacturing.com
VITE_REPORTS_URL=https://reports.manufacturing.com
VITE_ENABLE_MOCK=false
VITE_LOG_LEVEL=error
```

## 🚀 Deployment Configurations

### Docker Setup for Each Microfrontend

#### `packages/shell/Dockerfile`
```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### `packages/shell/nginx.conf`
```nginx
server {
  listen 80;
  server_name localhost;
  
  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
  
  # Enable CORS for microfrontends
  location /remoteEntry.js {
    root /usr/share/nginx/html;
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept";
  }
  
  # Gzip compression
  gzip on;
  gzip_types text/css application/javascript application/json;
  gzip_min_length 1000;
}
```

### Kubernetes Deployment

#### `k8s/shell-deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shell-app
  labels:
    app: shell
spec:
  replicas: 3
  selector:
    matchLabels:
      app: shell
  template:
    metadata:
      labels:
        app: shell
    spec:
      containers:
      - name: shell
        image: your-registry/shell:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_PRODUCTS_URL
          value: "https://products.yourapp.com"
        - name: VITE_CART_URL
          value: "https://cart.yourapp.com"
---
apiVersion: v1
kind: Service
metadata:
  name: shell-service
spec:
  selector:
    app: shell
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### CI/CD Pipeline (GitHub Actions)

#### `.github/workflows/deploy-microfrontends.yml`
```yaml
name: Deploy Microfrontends

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        app: [shell, products, cart, dashboard]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: packages/${{ matrix.app }}/package-lock.json
    
    - name: Install dependencies
      run: |
        cd packages/${{ matrix.app }}
        npm ci
    
    - name: Type check
      run: |
        cd packages/${{ matrix.app }}
        npm run type-check
    
    - name: Build
      run: |
        cd packages/${{ matrix.app }}
        npm run build
      env:
        VITE_API_URL: ${{ secrets.API_URL }}
        VITE_SOCKET_URL: ${{ secrets.SOCKET_URL }}
    
    - name: Test
      run: |
        cd packages/${{ matrix.app }}
        npm run test
    
    - name: Build and push Docker image
      if: github.ref == 'refs/heads/main'
      run: |
        cd packages/${{ matrix.app }}
        docker build -t ${{ secrets.REGISTRY_URL }}/${{ matrix.app }}:${{ github.sha }} .
        docker push ${{ secrets.REGISTRY_URL }}/${{ matrix.app }}:${{ github.sha }}
    
    - name: Deploy to staging
      if: github.ref == 'refs/heads/develop'
      run: |
        # Deploy to staging environment
        kubectl set image deployment/${{ matrix.app }}-deployment \
          ${{ matrix.app }}=${{ secrets.REGISTRY_URL }}/${{ matrix.app }}:${{ github.sha }} \
          --namespace=staging
```

## 🔍 Monitoring and Debugging

### Performance Monitoring Setup

#### `packages/shell/src/utils/monitoring.ts`
```typescript
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  app: string
}

class MicrofrontendMonitor {
  private metrics: PerformanceMetric[] = []

  trackAppLoad(appName: string, loadTime: number) {
    this.metrics.push({
      name: 'app_load_time',
      value: loadTime,
      timestamp: Date.now(),
      app: appName,
    })
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'app_load', {
        app_name: appName,
        load_time: loadTime,
      })
    }
  }

  trackInteraction(appName: string, interaction: string) {
    this.metrics.push({
      name: 'user_interaction',
      value: 1,
      timestamp: Date.now(),
      app: appName,
    })
  }

  getMetrics() {
    return this.metrics
  }
}

export const monitor = new MicrofrontendMonitor()
```

---

These examples demonstrate real-world implementations using the shared configurations. Each scenario showcases different aspects like Module Federation, Qiankun integration, environment management, and deployment strategies.