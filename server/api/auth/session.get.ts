import jwt from 'jsonwebtoken'

// 服务端会话验证 - 使用 httpOnly cookie (更安全)
export default defineEventHandler(async (event) => {
  try {
    // 从 httpOnly cookie 获取session token
    const sessionToken = getCookie(event, 'alcms_session')
    
    if (!sessionToken) {
      return {
        success: false,
        authenticated: false,
        message: 'No session found'
      }
    }

    // 验证session token
    const config = useRuntimeConfig()
    const JWT_SECRET = config.jwtSecret
    
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as any
      
      // 从后端获取最新用户信息
      const userResult = await $fetch(`${config.apiBaseUrl}/api/users/${decoded.userId}`, {
        headers: {
          'Authorization': `Bearer ${decoded.accessToken}`
        }
      })

      if (!userResult.success) {
        throw new Error('User not found')
      }

      return {
        success: true,
        authenticated: true,
        user: userResult.data,
        permissions: getUserPermissions(userResult.data.role)
      }
    } catch (jwtError) {
      // Token无效，清除cookie
      deleteCookie(event, 'alcms_session')
      
      return {
        success: false,
        authenticated: false,
        message: 'Invalid session'
      }
    }

  } catch (error) {
    console.error('Session verification error:', error)
    
    return {
      success: false,
      authenticated: false,
      message: 'Session verification failed'
    }
  }
})

function getUserPermissions(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    admin: ['*'],
    moderator: [
      'users:read', 'users:update', 'users:freeze',
      'content:read', 'content:update', 'content:delete',
      'community:moderate'
    ],
    vip: [
      'content:read', 'profile:update',
      'community:post', 'community:comment'
    ],
    user: [
      'profile:read', 'profile:update',
      'community:post', 'community:comment'
    ]
  }
  
  return rolePermissions[role] || rolePermissions.user
}