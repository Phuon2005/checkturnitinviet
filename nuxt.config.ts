// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,
  experimental: {
    viteEnvironmentApi: true,
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/ui",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "@nuxt/content",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
  ],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    vnpayTmnCode: "",
    vnpayHashSecret: "",
    vnpayReturnUrl: "",
    vnpayNotifyUrl: "",
  },
  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "zod",
        "date-fns",
        "@internationalized/date",
        "@unovis/vue",
      ],
    },
  },
  supabase: {
    redirect: false,
  },
});
