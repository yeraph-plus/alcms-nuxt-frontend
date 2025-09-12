import { defineStore } from "pinia";
import { useJwt } from "~/composables/useJwt";

export const useAuthStore = defineStore("auth", {
  state() {
    return {
      user: null,
      isLoading: false,
    };
  },

  getters: {
    // 使用 JWT composable 的权限检查方法
    isAdmin() {
      const { isAdmin } = useJwt();
      return isAdmin();
    },
    isModerator() {
      const { isModerator } = useJwt();
      return isModerator();
    },
    isVip() {
      const { isVip } = useJwt();
      return isVip();
    },
    userDisplayName(state) {
      return state.user?.nickname || state.user?.username || state.user?.email;
    },
    userRoleDisplayNames(state) {
      return state.user?.roles?.map((role) => role.display_name) || [];
    },
    // 从 JWT 获取当前用户信息
    currentUser() {
      const { currentUser } = useJwt();
      return currentUser.value;
    },
    // 检查是否已认证
    isAuthenticated() {
      const { isLoggedIn } = useJwt();
      return isLoggedIn.value;
    },
  },

  actions: {
    async login(email, password) {
      const { callEndpoint } = useApi();
      const { setTokens } = useJwt();
      this.isLoading = true;

      try {
        const response = await callEndpoint("auth.login", {
          data: { email, password },
          method: "POST",
          skipAuth: true,
        });

        if (response.success && response.data) {
          const { tokens, user } = response.data;

          // 使用 JWT composable 设置 tokens
          setTokens(tokens);

          // 设置用户信息
          this.user = user;

          return { success: true, message: response.message || "登录成功" };
        } else {
          return { success: false, message: response.message || "登录失败" };
        }
      } catch (error) {
        console.error("登录错误:", error);
        return {
          success: false,
          message: error.message || "登录失败，请检查网络连接",
        };
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      const { callEndpoint } = useApi();
      const { refreshToken, clearTokens } = useJwt();

      try {
        if (refreshToken.value) {
          await callEndpoint("auth.logout", {
            data: { refreshToken: refreshToken.value },
            method: "POST",
            skipAuth: true,
          });
        }
      } catch (error) {
        console.error("登出错误:", error);
      } finally {
        this.clearAuth();
      }
    },

    async register(username, email, password) {
      const { callEndpoint } = useApi();

      try {
        const response = await callEndpoint("auth.register", {
          data: { username, email, password },
          method: "POST",
          skipAuth: true,
        });

        if (response.success) {
          return { success: true, message: response.message || "注册成功" };
        } else {
          return { success: false, message: response.message || "注册失败" };
        }
      } catch (error) {
        console.error("注册错误:", error);
        return {
          success: false,
          message: error.message || "注册失败，请检查网络连接",
        };
      }
    },

    async getUserProfile() {
      const { callEndpoint } = useApi();
      const { getValidAccessToken, tokenType } = useJwt();

      try {
        const token = await getValidAccessToken();
        if (!token) {
          console.warn("没有有效的访问令牌，无法获取用户信息");
          return false;
        }

        console.log("正在获取用户信息...");
        const response = await callEndpoint("users.profile", {
          headers: {
            Authorization: `${tokenType.value || "Bearer"} ${token}`,
          },
          method: "GET",
        });

        if (response.success && response.data) {
          this.user = response.data;
          console.log("用户信息获取成功:", {
            user: this.user,
            roles: this.user.roles,
          });
          return true;
        } else {
          console.warn("获取用户信息失败:", response.message);
          return false;
        }
      } catch (error) {
        console.error("获取用户信息错误:", error);
        // 如果是401错误，说明令牌无效
        if (error.status === 401 || error.statusCode === 401) {
          console.log("令牌无效，需要重新认证");
        }
        return false;
      }
    },

    clearAuth() {
      const { clearTokens } = useJwt();

      this.user = null;

      // 使用 JWT composable 清除 tokens
      clearTokens();
    },

    async initializeAuth() {
      if (!import.meta.client) return false;

      console.log("开始初始化认证状态");

      const { loadTokensFromStorage, isTokenValid, getValidAccessToken } =
        useJwt();

      // 从存储中加载 tokens
      loadTokensFromStorage();

      // 检查是否有有效的 token
      if (!isTokenValid()) {
        // 尝试获取有效的访问令牌（会自动刷新）
        const token = await getValidAccessToken();
        if (!token) {
          console.log("没有找到有效的令牌信息");
          this.clearAuth();
          return false;
        }
      }

      console.log("令牌信息已验证，开始获取用户信息");

      // 验证令牌有效性并获取用户信息
      try {
        const profileSuccess = await this.getUserProfile();
        if (profileSuccess && this.user) {
          console.log("用户认证状态恢复成功", {
            user: this.user,
            roles: this.user.roles,
            isAdmin: this.isAdmin,
            isModerator: this.isModerator,
          });
          return true;
        } else {
          console.log("无法恢复用户认证状态");
          this.clearAuth();
          return false;
        }
      } catch (error) {
        console.error("初始化认证状态时发生错误:", error);
        this.clearAuth();
        return false;
      }
    },
  },

  persist: {
    key: "alcms_auth",
    pick: ["user"],
  },
});
