
// Windows temporarily needs this file, https://github.com/module-federation/vite/issues/68

    import {loadShare} from "@module-federation/runtime";
    const importMap = {
      
        "@vue/composition-api": async () => {
          let pkg = await import("__mf__virtual/vue2MicroApp__prebuild___mf_0_vue_mf_1_composition_mf_2_api__prebuild__.js");
            return pkg;
        }
      ,
        "element-ui": async () => {
          let pkg = await import("__mf__virtual/vue2MicroApp__prebuild__element_mf_2_ui__prebuild__.js");
            return pkg;
        }
      ,
        "vue-router": async () => {
          let pkg = await import("__mf__virtual/vue2MicroApp__prebuild__vue_mf_2_router__prebuild__.js");
            return pkg;
        }
      ,
        "vuex": async () => {
          let pkg = await import("__mf__virtual/vue2MicroApp__prebuild__vuex__prebuild__.js");
            return pkg;
        }
      
    }
      const usedShared = {
      
          "@vue/composition-api": {
            name: "@vue/composition-api",
            version: undefined,
            scope: ["default"],
            loaded: false,
            from: "vue2MicroApp",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"@vue/composition-api"}' must be provided by host`);
              }
              usedShared["@vue/composition-api"].loaded = true
              const {"@vue/composition-api": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^1.7.0",
              
            }
          }
        ,
          "element-ui": {
            name: "element-ui",
            version: undefined,
            scope: ["default"],
            loaded: false,
            from: "vue2MicroApp",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"element-ui"}' must be provided by host`);
              }
              usedShared["element-ui"].loaded = true
              const {"element-ui": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^2.15.0",
              
            }
          }
        ,
          "vue-router": {
            name: "vue-router",
            version: "2.8.1",
            scope: ["default"],
            loaded: false,
            from: "vue2MicroApp",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"vue-router"}' must be provided by host`);
              }
              usedShared["vue-router"].loaded = true
              const {"vue-router": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^3.6.0",
              
            }
          }
        ,
          "vuex": {
            name: "vuex",
            version: "3.6.2",
            scope: ["default"],
            loaded: false,
            from: "vue2MicroApp",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"vuex"}' must be provided by host`);
              }
              usedShared["vuex"].loaded = true
              const {"vuex": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^3.6.0",
              
            }
          }
        
    }
      const usedRemotes = [
      ]
      export {
        usedShared,
        usedRemotes
      }
      