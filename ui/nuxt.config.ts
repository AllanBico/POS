// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@ant-design-vue/nuxt', '@pinia/nuxt' ],
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || 'http://localhost:4000',
    },
  },

})