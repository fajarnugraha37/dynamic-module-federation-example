# Quick Reference - Microfrontend Configurations

## 🚀 Quick Setup Commands

### Vue 3 + Module Federation
```bash
# 1. Install dependencies
bun add vite vue@^3.5.0 typescript vue-router@^4.6.0 pinia
bun add -D @vitejs/plugin-vue @module-federation/vite

# 2. Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'

export default defineConfig({
  ...viteVue3ConfigModuleFederation,
  server: { port: 8083 }
})
EOF

# 3. Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "@commons/configs/tsconfig.vue3",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
EOF

# 4. Start development
bun run dev
```

### Vue 3 + Qiankun
```bash
# 1. Install dependencies
bun add vite vue@^3.5.0 typescript vue-router@^4.6.0 pinia
bun add -D @vitejs/plugin-vue

# 2. Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { viteVue3Config } from '@commons/configs/vite.vue3'

export default defineConfig({
  ...viteVue3Config,
  server: { port: 8082 }
})
EOF

# 3. Create tsconfig.json  
cat > tsconfig.json << 'EOF'
{
  "extends": "@commons/configs/tsconfig.vue3",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
EOF
```

### Vue 2 + Qiankun
```bash
# 1. Install dependencies
bun add vite vue@^2.7.0 typescript vue-router@^3.6.0 vuex@^3.6.0 @vue/composition-api
bun add -D vite-plugin-vue2 @vitejs/plugin-legacy

# 2. Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { viteVue2Config } from '@commons/configs/vite.vue2'

export default defineConfig({
  ...viteVue2Config,
  server: { port: 8080 }
})
EOF

# 3. Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "@commons/configs/tsconfig.vue2",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
EOF
```

## 📋 Configuration Matrix

| Framework | Architecture | Config Import | Default Port | Build Format |
|-----------|-------------|---------------|--------------|--------------|
| Vue 2 | Qiankun | `@commons/configs/vite.vue2` | 8080 | UMD |
| Vue 2 | Module Federation | `@commons/configs/vite.vue2.module-federation` | 8081 | ESM |
| Vue 3 | Qiankun | `@commons/configs/vite.vue3` | 8082 | UMD |
| Vue 3 | Module Federation | `@commons/configs/vite.vue3.module-federation` | 8083 | ESM |

## 🔧 Essential Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build", 
    "build:analyze": "ANALYZE=true vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  }
}
```

## 🏗️ Project Structure Template

```
your-microfrontend/
├── src/
│   ├── components/          # Reusable components
│   ├── views/              # Page components  
│   ├── stores/             # Pinia (Vue 3) / Vuex (Vue 2)
│   ├── composables/        # Vue 3 only
│   ├── utils/              # Helper functions
│   ├── styles/             # SCSS/CSS files
│   ├── types/              # TypeScript definitions
│   ├── App.vue             # Root component
│   └── main.ts             # Entry point
├── public/                 # Static assets
├── types/                  # Global type definitions
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies & scripts
```

## 🔗 Import Examples

### Vite Configuration
```typescript
// Vue 3 + Module Federation
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'

// Vue 3 + Qiankun
import { viteVue3Config } from '@commons/configs/vite.vue3'

// Vue 2 + Module Federation  
import { viteVue2ConfigModuleFederation } from '@commons/configs/vite.vue2.module-federation'

// Vue 2 + Qiankun
import { viteVue2Config } from '@commons/configs/vite.vue2'

// Environment configs
import { createEnvironmentConfig } from '@commons/configs/vite.env'
```

### TypeScript Configuration
```json
{
  "extends": "@commons/configs/tsconfig.vue3",     // Vue 3
  "extends": "@commons/configs/tsconfig.vue2",     // Vue 2  
  "extends": "@commons/configs/tsconfig.mf"        // Module Federation
}
```

## 🌍 Environment Variables

### Development (.env.development)
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=My App (Dev)
MF_SHELL_URL=http://localhost:3000
MF_SHARED_URL=http://localhost:3001
```

### Production (.env.production)
```env
VITE_API_URL=https://api.myapp.com  
VITE_APP_TITLE=My App
MF_SHELL_URL=https://shell.myapp.com
MF_SHARED_URL=https://shared.myapp.com
```

## 🔨 Common Customizations

### Module Federation Customization
```typescript
export default defineConfig({
  ...viteVue3ConfigModuleFederation,
  plugins: viteVue3ConfigModuleFederation.plugins.map(plugin => {
    if (plugin?.name === 'federation') {
      return plugin({
        name: 'myApp',
        exposes: {
          './Component': './src/components/MyComponent.vue',
        },
        remotes: {
          shell: 'shell@http://localhost:3000/remoteEntry.js',
        },
      })
    }
    return plugin
  }),
})
```

### Path Alias Customization
```json
{
  "extends": "@commons/configs/tsconfig.vue3",
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

## 📊 Performance Commands

```bash
# Bundle analysis
ANALYZE=true bun run build

# Type checking
bun run type-check

# Production preview
bun run preview

# Development with specific port
VITE_PORT=3000 bun run dev
```

## 🐛 Quick Fixes

### Module Federation Types
```bash
npx @module-federation/typescript
```

### CORS Issues (Qiankun)
```typescript
server: {
  cors: { origin: '*' },
  headers: { 'Access-Control-Allow-Origin': '*' }
}
```

### Vue 2 Composition API
```typescript
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
```

## 📱 Testing Integration

### Qiankun Main App Registration
```typescript
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'vue3-app',
    entry: '//localhost:8082', 
    container: '#subapp',
    activeRule: '/vue3',
  },
])
start()
```

### Module Federation Remote Loading
```typescript
const RemoteComponent = defineAsyncComponent(() => 
  import('vue3MicroApp/Component')
)
```

---

📚 **Full documentation**: See [USAGE-GUIDE.md](./USAGE-GUIDE.md) for complete setup instructions.