export default defineNuxtConfig({
  compatibilityDate: '2025-10-19',
  devtools: { enabled: true },
  components: [
    {
      path: '../src',
      pathPrefix: false,
    },
  ],
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/masonri/' : '/',
    buildAssetsDir: '/assets/'
  },
  ssr: false
})