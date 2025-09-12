import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  username: string
  nickname: string
  role: string
  avatar_url?: string
  bio?: string
  status: 'normal' | 'frozen'
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    isLoggedIn: false,
    isLoading: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isModerator: (state) => state.user?.role === 'moderator' || state.user?.role === 'admin',
    isVip: (state) => ['vip', 'moderator', 'admin'].includes(state.user?.role || ''),
    userDisplayName: (state) => state.user?.nickname || state.user?.username || state.user?.email
  },

  actions: {
    async login(email: string, password: string) {
      const { callEndpoint } = useApi()
      this.isLoading = true

      try {
        const response = await callEndpoint('auth.login', {
          data: { email, password },
          method: 'POST'
        })

        if (response.success && response.data) {
          this.token = response.data.accessToken
          this.refreshToken = response.data.refreshToken
          this.user = response.data.user
          this.isLoggedIn = true

          // 将认证信息存储到 localStorage
          if (process.client) {
            localStorage.setItem('auth_token', this.token!)
            localStorage.setItem('refresh_token', this.refreshToken!)
          }

          return { success: true, message: '登录成功' }
        } else {
          return { success: false, message: response.message || '登录失败' }
        }
      } catch (error: any) {
        console.error('登录错误:', error)
        return { 
          success: false, 
          message: error.message || '登录失败，请检查网络连接' 
        }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      const { callEndpoint } = useApi()

      try {
        if (this.refreshToken) {
          await callEndpoint('auth.logout', {
            data: { refreshToken: this.refreshToken },
            method: 'POST'
          })
        }
      } catch (error) {
        console.error('登出错误:', error)
      } finally {
        this.clearAuth()
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        return false
      }

      const { callEndpoint } = useApi()

      try {
        const response = await callEndpoint('auth.refresh', {
          data: { refreshToken: this.refreshToken },
          method: 'POST'
        })

        if (response.success && response.data) {
          this.token = response.data.accessToken
          
          if (process.client) {
            localStorage.setItem('auth_token', this.token!)
          }

          return true
        } else {
          this.clearAuth()
          return false
        }
      } catch (error) {
        console.error('刷新令牌错误:', error)
        this.clearAuth()
        return false
      }
    },

    async getUserProfile() {
      if (!this.token) {
        return false
      }

      const { callEndpoint } = useApi()

      try {
        const response = await callEndpoint('users.profile', {
          headers: { Authorization: `Bearer ${this.token}` },
          method: 'GET'
        })

        if (response.success && response.data) {
          this.user = response.data
          return true
        } else {
          return false
        }
      } catch (error) {
        console.error('获取用户信息错误:', error)
        return false
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isLoggedIn = false

      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
      }
    },

    initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        const refreshToken = localStorage.getItem('refresh_token')

        if (token && refreshToken) {
          this.token = token
          this.refreshToken = refreshToken
          this.isLoggedIn = true
          
          // 尝试获取用户信息
          this.getUserProfile()
        }
      }
    }
  },

  persist: {
    key: 'alcms_auth',
    pick: ['user', 'token', 'refreshToken', 'isLoggedIn']
  }
})