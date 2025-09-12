import { apiClient } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  try {
    // 获取刷新令牌
    const refreshToken = getCookie(event, 'alcms_refresh')
    
    if (refreshToken) {
      // 调用后端登出API
      try {
        await apiClient.post('/api/auth/logout', {
          refreshToken
        }, event)
      } catch (error) {
        console.warn('Backend logout failed:', error)
        // 即使后端登出失败，也要清除本地cookie
      }
    }

    // 清除所有认证相关的 cookie
    deleteCookie(event, 'alcms_session', {
      path: '/'
    })
    
    deleteCookie(event, 'alcms_refresh', {
      path: '/api/auth'
    })

    return {
      success: true,
      message: '已退出登录'
    }

  } catch (error: any) {
    console.error('Logout error:', error)

    // 即使出错也要清除cookie
    deleteCookie(event, 'alcms_session', { path: '/' })
    deleteCookie(event, 'alcms_refresh', { path: '/api/auth' })

    return {
      success: true,
      message: '已退出登录'
    }
  }
})