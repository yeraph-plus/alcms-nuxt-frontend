// 更安全的认证 Composable
export const useAuth = () => {
  const user = ref(null)
  const loading = ref(false)
  const authenticated = ref(false)
  const permissions = ref<string[]>([])

  // 检查服务端会话状态
  const checkSession = async () => {
    loading.value = true
    
    try {
      const response = await $fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include' // 包含 httpOnly cookies
      })

      if (response.success && response.authenticated) {
        user.value = response.user
        authenticated.value = true
        permissions.value = response.permissions || []
      } else {
        user.value = null
        authenticated.value = false
        permissions.value = []
      }

      return response

    } catch (error) {
      console.error('Session check failed:', error)
      user.value = null
      authenticated.value = false
      permissions.value = []
      return { success: false, authenticated: false }
    } finally {
      loading.value = false
    }
  }

  // 安全登录 - 使用 httpOnly cookie
  const login = async (email: string, password: string, rememberMe = false) => {
    loading.value = true

    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password, rememberMe },
        credentials: 'include'
      })

      if (response.success) {
        // 重新检查会话状态
        await checkSession()
        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }

    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.data?.message || '登录失败，请检查网络连接' 
      }
    } finally {
      loading.value = false
    }
  }

  // 安全登出
  const logout = async () => {
    loading.value = true

    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 无论是否成功，都清除本地状态
      user.value = null
      authenticated.value = false
      permissions.value = []
      loading.value = false
    }
  }

  // 权限检查
  const hasPermission = (permission: string): boolean => {
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(permission)
  }

  const hasRole = (role: string): boolean => {
    return user.value?.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(user.value?.role)
  }

  // 管理员权限快捷检查
  const isAdmin = computed(() => hasRole('admin'))
  const isModerator = computed(() => hasAnyRole(['admin', 'moderator']))
  const isVip = computed(() => hasAnyRole(['admin', 'moderator', 'vip']))

  // 显示名称
  const displayName = computed(() => {
    if (!user.value) return ''
    return user.value.nickname || user.value.username || user.value.email
  })

  return {
    // 状态
    user: readonly(user),
    loading: readonly(loading),
    authenticated: readonly(authenticated),
    permissions: readonly(permissions),

    // 计算属性
    isAdmin,
    isModerator,
    isVip,
    displayName,

    // 方法
    checkSession,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole
  }
}