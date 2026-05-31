// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,
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
    "@nuxt/hints",
  ],
  icon: {
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    serverBundle: {
      collections: ["lucide", "simple-icons"],
    },
  },
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    payosClientId: "",
    payosApiKey: "",
    payosChecksumKey: "",
    payosReturnUrl: "",
    payosCancelUrl: "",
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
        "@unovis/ts",
      ],
    },
  },
  supabase: {
    redirect: false,
  },
});
