import jwt from 'jsonwebtoken'

// 服务端认证中间件
export default defineEventHandler(async (event) => {
  // 只对需要认证的API路由生效
  if (!event.node.req.url?.startsWith('/api/admin')) {
    return
  }

  try {
    // 获取认证信息
    const authHeader = getHeader(event, 'authorization')
    const sessionCookie = getCookie(event, 'alcms_session')
    
    let token = ''
    let authMethod = ''

    // 优先使用 Bearer Token
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
      authMethod = 'bearer'
    } 
    // 备用 httpOnly cookie
    else if (sessionCookie) {
      const config = useRuntimeConfig()
      const JWT_SECRET = config.jwtSecret
      try {
        const decoded = jwt.verify(sessionCookie, JWT_SECRET) as any
        token = decoded.accessToken
        authMethod = 'session'
      } catch {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid session'
        })
      }
    }

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // 验证token并获取用户信息
    const config = useRuntimeConfig()
    
    const userResponse = await $fetch(`${config.apiBaseUrl}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).catch((error) => {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token validation failed'
      })
    })

    if (!userResponse.success) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    const user = userResponse.data

    // 服务端权限检查
    const requiredRoles = ['admin', 'moderator']
    if (!requiredRoles.includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions'
      })
    }

    // 将用户信息添加到请求上下文
    event.context.user = user
    event.context.authMethod = authMethod

  } catch (error: any) {
    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误统一处理
    console.error('Auth middleware error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication service error'
    })
  }
})