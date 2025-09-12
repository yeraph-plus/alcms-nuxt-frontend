export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // 如果用户已登录，重定向到管理后台
  if (authStore.isLoggedIn) {
    if (authStore.isAdmin || authStore.isModerator) {
      return navigateTo("/admin");
    } else {
      // 权限不足，清除登录状态
      authStore.logout();
    }
  }
});
