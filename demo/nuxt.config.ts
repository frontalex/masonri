export default defineNuxtConfig({
  compatibilityDate: '2025-10-19',
  devtools: { enabled: true },
  components: [
    {
      path: '../src',
      pathPrefix: false,
    },
  ],
  ssr: false
})