// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
// @ts-ignore
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt','@ant-design-vue/nuxt', '@pinia/nuxt' ],
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || 'http://localhost:4000',
    },
  },

  pwa: {
    manifest: {
      name: 'Nuxt 3 Inventory & POS',
      short_name: 'InventoryPOS',
      description: 'An inventory and POS system built with Nuxt 3',
      theme_color: '#ffffff',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: '^https://your-api-domain.com/.*',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400, // 1 day
            },
          },
        },
      ],
    },
  },
  hooks: {
    'render:errorMiddleware': (app) => {
      app.use((err, req, res, next) => {
        if (err.statusCode === 404) {
          res.statusCode = 404
          res.end('<div id="__nuxt"><nuxt-page></nuxt-page></div>')
        } else if (err.statusCode === 403) {
          res.statusCode = 403
          res.end('<div id="__nuxt"><nuxt-page></nuxt-page></div>')
        } else {
          res.statusCode = 500
          res.end('<div id="__nuxt"><nuxt-page></nuxt-page></div>')
        }
      })
    }
  }
})