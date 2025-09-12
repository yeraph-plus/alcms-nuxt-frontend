export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const { accessToken, isLoggedIn } = useJwt();

  // 如果没有登录状态，但有令牌，尝试恢复
  if (!isLoggedIn.value && process.client) {
    if (accessToken.value) {
      console.log("检测到令牌，尝试恢复认证状态");
      await authStore.initializeAuth();
    }
  }

  // 检查是否已登录
  if (!isLoggedIn.value) {
    return navigateTo("/admin/login");
  }

  // 检查是否有管理权限
  if (!authStore.isAdmin && !authStore.isModerator) {
    throw createError({
      statusCode: 403,
      statusMessage: "您没有访问此页面的权限",
    });
  }
});
