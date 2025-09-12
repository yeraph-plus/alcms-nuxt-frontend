// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devServer: {
    port: 3001,
    host: "127.0.0.1",
  },
  devtools: { enabled: true },
  // 模块配置
  modules: [
    "@element-plus/nuxt",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/image",
    "pinia-plugin-persistedstate/nuxt",
  ],
  // 图片优化配置
  image: {
    //
  },
  // Element Plus配置
  elementPlus: {
    //
  },
  // 运行时配置
  runtimeConfig: {
    public: {
      version: "1.0.0",
    },
  },
  // 构建配置
  build: {
    transpile: ["element-plus"],
  },
  // 应用配置
  app: {
    head: {
      title: "ALCMS Nuxt4 App",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "ALCMS Content Management System built with Nuxt 4",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  // 服务器端渲染配置
  ssr: true,
  // 优化构建性能和内存使用
  nitro: {
    experimental: {
      wasm: false,
    },
    minify: false, // 开发环境关闭压缩以节省内存
  },
  // 优化Vite配置以减少内存使用
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["vue", "vue-router"],
          },
        },
      },
    },
    server: {
      hmr: {
        overlay: false, // 减少HMR开销
      },
    },
  },
});
