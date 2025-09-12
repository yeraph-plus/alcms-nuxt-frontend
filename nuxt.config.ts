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
    // 服务端专用配置 (不会暴露给客户端)
    jwtSecret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production',
    apiBaseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:3000',
    logLevel: process.env.LOG_LEVEL || 'info',
    
    // 客户端可访问的公共配置 (会暴露给前端)
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'ALCMS',
      version: process.env.NUXT_PUBLIC_APP_VERSION || "1.0.0",
      // 注意：不要在这里放敏感信息！
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
