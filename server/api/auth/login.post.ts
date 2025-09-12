import jwt from 'jsonwebtoken'
import { apiClient } from '../../utils/apiClient'

export default defineEventHandler(async (event) => {
  try {
    const { email, password, rememberMe } = await readBody(event)

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }

    // 调用后端登录API
    const loginResult = await apiClient.post('/api/auth/login', {
      email,
      password
    }, event)

    if (!loginResult.success) {
      throw createError({
        statusCode: 401,
        statusMessage: loginResult.message || 'Invalid credentials'
      })
    }

    const { accessToken, refreshToken, user } = loginResult.data

    // 验证用户权限
    const allowedRoles = ['admin', 'moderator']
    if (!allowedRoles.includes(user.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: '您没有访问管理后台的权限'
      })
    }

    // 创建服务端会话 (使用 httpOnly cookie 更安全)
    const config = useRuntimeConfig()
    const JWT_SECRET = config.jwtSecret
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        accessToken,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60) // 30天或1天
      },
      JWT_SECRET
    )

    // 设置 httpOnly cookie (防XSS)
    setCookie(event, 'alcms_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30天或1天
      path: '/'
    })

    // 设置刷新令牌cookie (用于令牌刷新)
    setCookie(event, 'alcms_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/api/auth'
    })

    return {
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          nickname: user.nickname,
          role: user.role,
          avatar_url: user.avatar_url
        }
      }
    }

  } catch (error: any) {
    console.error('Login error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Login service error'
    })
  }
})