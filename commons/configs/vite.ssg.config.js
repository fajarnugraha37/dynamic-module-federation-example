import { defineConfig } from 'vite'
import { viteConfig } from './vite.config.js'

/**
 * Enhanced SSG-specific plugins and optimizations
 * for Vue 3 Static Site Generation
 */

// SSG-specific plugin imports
import { createSitemapPlugin } from 'vite-plugin-sitemap'
import { ViteImageOptimize } from 'vite-plugin-imagemin'
import { createRobotsTxtPlugin } from 'vite-plugin-robots-txt'

const ssgEnhancedConfig = defineConfig({
    ...viteConfig,

    plugins: [
        ...viteConfig.plugins,

        // Sitemap generation for SEO
        createSitemapPlugin({
            hostname: 'https://yourdomain.com',
            routes: [
                '/',
                '/about',
                '/contact',
                // Add your static routes here
            ],
            options: {
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: 0.8,
            },
        }),

        // Image optimization
        ViteImageOptimize({
            gifsicle: { optimizationLevel: 7 },
            mozjpeg: { quality: 85 },
            optipng: { optimizationLevel: 7 },
            pngquant: { quality: [0.6, 0.8] },
            svgo: {
                plugins: [
                    { name: 'removeViewBox', active: false },
                    { name: 'removeDimensions', active: true },
                ],
            },
            webp: { quality: 85 },
            avif: { quality: 80 },
        }),

        // Robots.txt generation
        createRobotsTxtPlugin({
            sitemap: 'https://yourdomain.com/sitemap.xml',
            policies: [
                {
                    userAgent: '*',
                    allow: '/',
                    disallow: ['/admin', '/private'],
                },
            ],
        }),
    ],

    // SSG-specific build optimizations
    build: {
        ...viteConfig.build,

        // Pre-render configuration
        ssr: false,

        rollupOptions: {
            ...viteConfig.build.rollupOptions,

            // SSG-specific external dependencies
            external: [
                ...(Array.isArray(viteConfig.build.rollupOptions?.external)
                    ? viteConfig.build.rollupOptions.external
                    : []),
            ],

            output: {
                ...viteConfig.build.rollupOptions?.output,

                // Static asset optimization
                manualChunks: {
                    ...viteConfig.build.rollupOptions?.output?.manualChunks,

                    // SSG-specific chunks
                    'ssg-runtime': ['vue', 'vue-router'],
                    'ui-components': ['@commons/components', '@commons/ui'],
                },
            },
        },

        // Enhanced minification for static sites
        terserOptions: {
            ...viteConfig.build.terserOptions,
            compress: {
                ...viteConfig.build.terserOptions?.compress,
                // More aggressive optimization for SSG
                passes: 2,
                unsafe: true,
                unsafe_comps: true,
                unsafe_math: true,
                unsafe_proto: true,
            },
        },
    },

    // SSG-specific CSS optimizations
    css: {
        ...viteConfig.css,
        postcss: {
            plugins: [
                ...(viteConfig.css?.postcss?.plugins || []),

                // Critical CSS extraction for SSG
                require('@fullhuman/postcss-purgecss')({
                    content: ['./src/**/*.vue', './src/**/*.ts', './src/**/*.js'],
                    safelist: {
                        standard: [/^vue-/, /^router-/, /^transition-/],
                        deep: [/::v-deep/, /::v-global/, /::v-slotted/],
                    },
                }),

                // CSS optimization for static sites
                require('postcss-combine-media-query'),
                require('postcss-sort-media-queries'),
            ],
        },
    },

    // Enhanced define for SSG
    define: {
        ...viteConfig.define,
        __SSG_MODE__: true,
        __STATIC_GENERATION__: true,
        __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    },
})

export default ssgEnhancedConfig

// Export individual configuration pieces for customization
export const ssgPlugins = ssgEnhancedConfig.plugins
export const ssgBuildOptions = ssgEnhancedConfig.build
export const ssgCssOptions = ssgEnhancedConfig.css