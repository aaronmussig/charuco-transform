// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    app: {
        baseURL: '/charuco-transform/'
    },
    devtools: {enabled: true},
    telemetry: false,
    ssr: true,
    modules: ['@nuxt/ui'],
    css: ['~/assets/css/main.css'],
    ui: {
        colorMode: {
            preference: 'dark'
        },
    },
    vite: {
        esbuild: {
            drop: ['debugger'],
            pure: ['console.log', 'console.error', 'console.warn', 'console.debug', 'console.trace']
        }
    }
})