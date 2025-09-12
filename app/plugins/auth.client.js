export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();

  // 在客户端初始化认证状态
  if (import.meta.client) {
    try {
      await authStore.initializeAuth();
      console.log("认证插件初始化完成");
    } catch (error) {
      console.error("认证插件初始化失败:", error);
    }
  }
});
