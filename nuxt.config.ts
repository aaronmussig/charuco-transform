// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    app: {
        baseURL: '/charuco-transform/',
        head: {
            title: 'ChArUco Transform',
            htmlAttrs: {
                lang: 'en',
            },
            link: [
                {rel: 'icon', type: 'image/svg+xml', href: '/charuco-transform/favicon.svg'},
            ],
        }
    },
    devtools: {enabled: true},
    telemetry: false,
    ssr: true,
    modules: ['@nuxt/ui'],
    css: ['~/assets/css/main.css'],
    vite: {
        esbuild: {
            drop: ['debugger'],
            pure: ['console.log']
        }
    }
});
