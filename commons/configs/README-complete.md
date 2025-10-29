# Microfrontends Configurations

This package provides comprehensive, production-ready Vite and TypeScript configurations for Vue 2 and Vue 3 microfrontends with support for both Qiankun and Module Federation architectures.

## 🚀 Available Configurations

### Vite Configurations

| Configuration | Description | Use Case |
|---------------|-------------|----------|
| `vite.vue2.js` | Vue 2 + Qiankun | Vue 2 microfrontends with Qiankun integration |
| `vite.vue3.js` | Vue 3 + Qiankun | Vue 3 microfrontends with Qiankun integration |
| `vite.vue2.module-federation.js` | Vue 2 + Module Federation | Vue 2 microfrontends with Webpack Module Federation |
| `vite.vue3.module-federation.js` | Vue 3 + Module Federation | Vue 3 microfrontends with Module Federation |
| `vite.ssg.config.js` | Vue 3 SSG Enhanced | Static Site Generation with advanced optimizations |
| `vite.env.config.js` | Environment-specific | Multi-environment configurations |

### TypeScript Configurations

| Configuration | Description | Extends |
|---------------|-------------|---------|
| `tsconfig.json` | Base configuration | - |
| `tsconfig.vue2.json` | Vue 2 specific | Base config |
| `tsconfig.vue3.json` | Vue 3 specific | Base config |
| `tsconfig.module-federation.json` | Module Federation | Base config |

## 📦 Installation

Install the package and its dependencies:

```bash
# Install the shared configs package
bun add @commons/configs

# Install peer dependencies
bun add vite vue typescript

# Install optional dependencies based on your needs
bun add @vitejs/plugin-vue @vitejs/plugin-vue-jsx  # For Vue 3
bun add vite-plugin-vue2                           # For Vue 2
bun add @module-federation/vite                    # For Module Federation
```

## 🔧 Usage

### Using Vite Configurations

#### Vue 2 + Qiankun

```javascript
// vite.config.js in your Vue 2 project
import { viteVue2Config } from '@commons/configs/vite.vue2'
import { defineConfig } from 'vite'

export default defineConfig({
  ...viteVue2Config,
  // Override or extend as needed
  server: {
    ...viteVue2Config.server,
    port: 8080, // Your specific port
  },
})
```

#### Vue 3 + Module Federation

```javascript
// vite.config.js in your Vue 3 project
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'
import { defineConfig } from 'vite'

export default defineConfig({
  ...viteVue3ConfigModuleFederation,
  plugins: [
    ...viteVue3ConfigModuleFederation.plugins.map(plugin => {
      // Customize Module Federation plugin
      if (plugin.name === 'federation') {
        return plugin({
          ...plugin.options,
          name: 'your-app-name',
          exposes: {
            './YourComponent': './src/components/YourComponent.vue',
          },
        })
      }
      return plugin
    }),
  ],
})
```

### Using TypeScript Configurations

#### In Sub-repositories

Create a `tsconfig.json` in your project root:

```json
{
  "extends": "@commons/configs/tsconfig.vue3",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "~/*": ["src/*"]
    }
  },
  "include": [
    "src/**/*",
    "*.vue",
    "*.ts"
  ]
}
```

#### For Vue 2 Projects

```json
{
  "extends": "@commons/configs/tsconfig.vue2",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### For Module Federation Projects

```json
{
  "extends": "@commons/configs/tsconfig.mf",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "shell/*": ["types/remotes/shell/*"],
      "utils/*": ["types/remotes/utils/*"]
    }
  }
}
```

## 🏗️ Project Structure

The configurations assume this project structure:

```
your-project/
├── src/                    # Source code
│   ├── components/         # Vue components
│   ├── composables/        # Vue 3 composables
│   ├── stores/             # Pinia/Vuex stores
│   ├── utils/              # Utility functions
│   └── App.vue             # Main app component
├── types/                  # TypeScript definitions
│   └── remotes/            # Module Federation remote types
├── public/                 # Static assets
├── vite.config.js          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Package configuration
```

## ⚙️ Configuration Details

### Vue 2 + Qiankun Features

- ✅ Vue 2.7+ support with Composition API
- ✅ Legacy browser compatibility (IE11+)
- ✅ UMD build format for Qiankun
- ✅ CORS headers for cross-origin loading
- ✅ Externalized Vue for shared dependencies

### Vue 3 + Qiankun Features

- ✅ Vue 3.5+ with latest features
- ✅ PWA support with service worker
- ✅ Modern ES modules with fallbacks
- ✅ Advanced tree shaking
- ✅ Custom elements support

### Module Federation Features

- ✅ Webpack Module Federation compatibility
- ✅ Shared dependencies optimization
- ✅ Dynamic remote loading
- ✅ TypeScript support for remotes
- ✅ Hot module replacement

### SSG Features

- ✅ Static site generation optimization
- ✅ SEO enhancements (sitemap, robots.txt)
- ✅ Image optimization
- ✅ Critical CSS extraction
- ✅ Performance optimizations

## 📋 Configuration Options

### Environment Variables

All configurations support these environment variables:

```env
# Development
VITE_API_URL=http://localhost:3000/api
VITE_APP_TITLE=Your App Name

# Module Federation
MF_SHELL_URL=http://localhost:3000
MF_UTILS_URL=http://localhost:3001

# Build optimization
ANALYZE=true                # Enable bundle analyzer
NODE_ENV=production        # Production mode
```

### Port Configuration

Default ports for different setups:

- Vue 2 + Qiankun: `8080`
- Vue 2 + Module Federation: `8081`
- Vue 3 + Qiankun: `8082`
- Vue 3 + Module Federation: `8083`

### Build Outputs

- **Qiankun**: UMD format with externalized dependencies
- **Module Federation**: ESM with dynamic imports
- **SSG**: Optimized static files with prerendering

## 🔍 Development Scripts

Add these scripts to your project's `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:analyze": "ANALYZE=true vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "type-check:watch": "vue-tsc --noEmit --watch"
  }
}
```

## 🚀 Production Deployment

### Qiankun Deployment

1. Build your microfrontend:
   ```bash
   bun run build
   ```

2. Register in main application:
   ```javascript
   import { registerMicroApps, start } from 'qiankun'

   registerMicroApps([
     {
       name: 'vue3-app',
       entry: '//localhost:8082',
       container: '#subapp-vue3',
       activeRule: '/vue3',
     },
   ])

   start()
   ```

### Module Federation Deployment

1. Build with Module Federation:
   ```bash
   bun run build
   ```

2. Load in host application:
   ```javascript
   import { loadRemote } from '@module-federation/runtime'

   const VueComponent = await loadRemote('vue3MicroApp/App')
   ```

## 🔧 Customization

### Extending Configurations

```javascript
// Custom vite.config.js
import { viteVue3ConfigModuleFederation } from '@commons/configs/vite.vue3.module-federation'
import { defineConfig } from 'vite'

export default defineConfig({
  ...viteVue3ConfigModuleFederation,
  
  // Add custom plugins
  plugins: [
    ...viteVue3ConfigModuleFederation.plugins,
    yourCustomPlugin(),
  ],
  
  // Override build settings
  build: {
    ...viteVue3ConfigModuleFederation.build,
    outDir: 'custom-dist',
  },
})
```

### Custom TypeScript Paths

```json
{
  "extends": "@commons/configs/tsconfig.vue3",
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@api/*": ["src/api/*"],
      "@views/*": ["src/views/*"]
    }
  }
}
```

## 📊 Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true bun run build

# This generates dist/stats.html with detailed analysis
```

### Code Splitting

The configurations include intelligent code splitting:

- **Vendor chunks**: Vue, Vue Router, state management
- **Component chunks**: Shared components
- **Route chunks**: Page-level components
- **Utility chunks**: Helper functions

### Caching Strategy

- **Static assets**: Long-term caching with hash-based names
- **JavaScript**: Chunked with dependency-based splitting
- **CSS**: Extracted and minimized
- **Images**: Optimized with multiple formats (WebP, AVIF)

## 🤝 Contributing

When extending these configurations:

1. Test with both development and production builds
2. Verify compatibility with target Vue version
3. Check Module Federation/Qiankun integration
4. Update documentation accordingly
5. Add type definitions for new features

## 📝 License

MIT License - see LICENSE file for details.

## 🔗 Related Documentation

- [Vite Documentation](https://vitejs.dev/)
- [Vue 2 Documentation](https://v2.vuejs.org/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Qiankun Documentation](https://qiankun.umijs.org/)
- [Module Federation Documentation](https://module-federation.github.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)