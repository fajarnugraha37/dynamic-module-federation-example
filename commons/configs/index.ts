// Import Vite Configurations
import { viteVue2Config } from './vite.vue2.js'
import { viteVue3Config } from './vite.vue3.js' 
import { viteVue2ConfigModuleFederation } from './vite.vue2.module-federation.js'
import { viteVue3ConfigModuleFederation } from './vite.vue3.module-federation.js'
import { viteConfig as viteSSGConfig } from './vite.config.js'
import { createEnvironmentConfig, environmentConfigs } from './vite.env.config.js'

// Re-export Vite Configurations
export {
  viteVue2Config,
  viteVue3Config,
  viteVue2ConfigModuleFederation,
  viteVue3ConfigModuleFederation,
  viteSSGConfig,
  createEnvironmentConfig,
  environmentConfigs,
}

// TypeScript Configuration Paths
export const tsConfigPaths = {
  base: './tsconfig.json',
  vue2: './tsconfig.vue2.json',
  vue3: './tsconfig.vue3.json',
  moduleFederation: './tsconfig.module-federation.json',
} as const

// Configuration Types
export interface MicrofrontendConfig {
  framework: 'vue2' | 'vue3'
  architecture: 'qiankun' | 'module-federation'
  mode: 'development' | 'staging' | 'production' | 'ssg'
}

export interface ConfigOptions {
  port?: number
  host?: string
  basePath?: string
  appName?: string
  exposes?: Record<string, string>
  remotes?: Record<string, string>
  shared?: Record<string, any>
}

// Helper Functions
export function getViteConfig(config: MicrofrontendConfig) {
  const { framework, architecture } = config
  
  if (framework === 'vue2' && architecture === 'qiankun') {
    return viteVue2Config
  }
  
  if (framework === 'vue2' && architecture === 'module-federation') {
    return viteVue2ConfigModuleFederation
  }
  
  if (framework === 'vue3' && architecture === 'qiankun') {
    return viteVue3Config
  }
  
  if (framework === 'vue3' && architecture === 'module-federation') {
    return viteVue3ConfigModuleFederation
  }
  
  throw new Error(`Unsupported configuration: ${framework} + ${architecture}`)
}

export function getTsConfig(config: MicrofrontendConfig) {
  const { framework, architecture } = config
  
  if (architecture === 'module-federation') {
    return tsConfigPaths.moduleFederation
  }
  
  if (framework === 'vue2') {
    return tsConfigPaths.vue2
  }
  
  if (framework === 'vue3') {
    return tsConfigPaths.vue3
  }
  
  return tsConfigPaths.base
}

// Default Configurations
export const defaultPorts = {
  vue2Qiankun: 8080,
  vue2ModuleFederation: 8081,
  vue3Qiankun: 8082,
  vue3ModuleFederation: 8083,
} as const

export const defaultBasePaths = {
  vue2Qiankun: '/vue2-app/',
  vue2ModuleFederation: '/vue2-mf/',
  vue3Qiankun: '/vue3-app/',
  vue3ModuleFederation: '/vue3-mf/',
} as const

// Re-export types
export * from "./vite.env.config";
export * from "./vite.ssg.config";
export * from "./vite.vue2";
export * from "./vite.vue2.module-federation";
export * from "./vite.vue3";
export * from "./vite.vue3.module-federation";