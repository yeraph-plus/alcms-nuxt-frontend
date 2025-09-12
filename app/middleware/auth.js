export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // 如果没有登录状态，但有令牌，尝试恢复
  if (!authStore.isLoggedIn && import.meta.client) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      console.log("检测到令牌，尝试恢复认证状态");
      try {
        await authStore.initializeAuth();
        // 给一点时间让状态更新完成
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("认证状态恢复失败:", error);
        authStore.clearAuth();
      }
    }
  }

  // 检查是否已登录
  if (!authStore.isLoggedIn) {
    return navigateTo("/admin/login");
  }

  // 等待用户信息加载完成后再检查权限
  if (!authStore.user) {
    console.log("用户信息尚未加载，等待中...");
    // 如果用户信息还没有加载，给一些时间
    let retryCount = 0;
    while (!authStore.user && retryCount < 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retryCount++;
    }
  }

  // 检查是否有管理权限
  if (!authStore.isAdmin && !authStore.isModerator) {
    console.error("权限检查失败:", {
      isLoggedIn: authStore.isLoggedIn,
      user: authStore.user,
      isAdmin: authStore.isAdmin,
      isModerator: authStore.isModerator,
    });

    throw createError({
      statusCode: 403,
      statusMessage: "您没有访问此页面的权限",
    });
  }
});
