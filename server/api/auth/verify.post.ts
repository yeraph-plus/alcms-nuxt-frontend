import { apiClient } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  try {
    // 获取Authorization头
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Missing or invalid authorization header'
      })
    }

    // 从后端验证token并获取用户信息
    const result = await apiClient.get('/api/auth/profile', {}, event, {
      Authorization: authHeader
    })

    if (!result.success) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    const user = result.data
    
    // 服务端权限验证
    const hasAdminAccess = ['admin', 'moderator'].includes(user.role)
    
    return {
      success: true,
      data: {
        user,
        hasAdminAccess,
        permissions: getUserPermissions(user.role)
      }
    }

  } catch (error: any) {
    console.error('Token verification error:', error)
    
    throw createError({
      statusCode: error.statusCode || 401,
      statusMessage: error.statusMessage || 'Authentication failed'
    })
  }
})

// 根据角色获取权限列表
function getUserPermissions(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    admin: ['*'], // 所有权限
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