export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // 检查是否已登录
  if (!authStore.isLoggedIn) {
    return navigateTo('/admin/login')
  }

  // 检查是否有管理权限
  if (!authStore.isAdmin && !authStore.isModerator) {
    throw createError({
      statusCode: 403,
      statusMessage: '您没有访问此页面的权限'
    })
  }
})