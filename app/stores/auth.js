import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state() {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      isLoading: false,
    };
  },

  getters: {
    isAdmin(state) {
      const result =
        state.user?.roles?.some((role) => role.name === "admin") || false;
      if (process.dev) {
        console.log("isAdmin check:", {
          user: state.user,
          roles: state.user?.roles,
          result,
        });
      }
      return result;
    },
    isModerator(state) {
      const userRoles = state.user?.roles?.map((role) => role.name) || [];
      const result =
        userRoles.includes("moderator") || userRoles.includes("admin");
      if (process.dev) {
        console.log("isModerator check:", {
          user: state.user,
          userRoles,
          result,
        });
      }
      return result;
    },
    isVip(state) {
      const userRoles = state.user?.roles?.map((role) => role.name) || [];
      return ["vip", "moderator", "admin"].some((role) =>
        userRoles.includes(role)
      );
    },
    userDisplayName(state) {
      return state.user?.nickname || state.user?.username || state.user?.email;
    },
    userRoleDisplayNames(state) {
      return state.user?.roles?.map((role) => role.display_name) || []; // 取用户角色显示名称
    },
  },

  actions: {
    async login(email, password) {
      const { callEndpoint } = useApi();
      this.isLoading = true;

      try {
        const response = await callEndpoint("auth.login", {
          data: { email, password },
          method: "POST",
        });

        if (response.success && response.data) {
          const { tokens, user } = response.data;

          this.token = tokens.accessToken;
          this.refreshToken = tokens.refreshToken;
          this.tokenType = tokens.tokenType;
          this.expiresIn = tokens.expiresIn;
          this.user = user;
          this.isLoggedIn = true;

          // 将认证信息存储到 localStorage
          if (import.meta.client) {
            localStorage.setItem("auth_token", this.token);
            localStorage.setItem("refresh_token", this.refreshToken);
            localStorage.setItem("token_type", this.tokenType);
            localStorage.setItem("expires_in", this.expiresIn);
          }

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

      try {
        if (this.refreshToken) {
          await callEndpoint("auth.logout", {
            data: { refreshToken: this.refreshToken },
            method: "POST",
          });
        }
      } catch (error) {
        console.error("登出错误:", error);
      } finally {
        this.clearAuth();
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        console.warn("没有刷新令牌，无法刷新访问令牌");
        return false;
      }

      const { callEndpoint } = useApi();

      try {
        const response = await callEndpoint("auth.refresh", {
          data: { refreshToken: this.refreshToken },
          method: "POST",
        });

        if (response.success && response.data) {
          const { tokens } = response.data;

          this.token = tokens.accessToken;
          this.tokenType = tokens.tokenType || "Bearer";
          this.expiresIn = tokens.expiresIn;

          // 如果返回了新的刷新令牌，也要更新
          if (tokens.refreshToken) {
            this.refreshToken = tokens.refreshToken;
          }

          // 更新 localStorage
          if (import.meta.client) {
            localStorage.setItem("auth_token", this.token);
            localStorage.setItem("token_type", this.tokenType);
            localStorage.setItem("expires_in", this.expiresIn);
            if (tokens.refreshToken) {
              localStorage.setItem("refresh_token", this.refreshToken);
            }
          }

          console.log("访问令牌刷新成功");
          return true;
        } else {
          console.warn("刷新令牌失败:", response.message);
          return false;
        }
      } catch (error) {
        console.error("刷新令牌错误:", error);
        return false;
      }
    },

    async getUserProfile() {
      if (!this.token) {
        console.warn("没有访问令牌，无法获取用户信息");
        return false;
      }

      const { callEndpoint } = useApi();

      try {
        console.log("正在获取用户信息...");
        const response = await callEndpoint("users.profile", {
          headers: {
            Authorization: `${this.tokenType || "Bearer"} ${this.token}`,
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
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.tokenType = "Bearer";
      this.expiresIn = null;
      this.isLoggedIn = false;

      if (import.meta.client) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("expires_in");
      }
    },

    async initializeAuth() {
      if (!import.meta.client) return false;

      console.log("开始初始化认证状态");

      const token = localStorage.getItem("auth_token");
      const refreshToken = localStorage.getItem("refresh_token");
      const tokenType = localStorage.getItem("token_type");
      const expiresIn = localStorage.getItem("expires_in");

      if (!token || !refreshToken) {
        console.log("没有找到有效的令牌信息");
        this.clearAuth();
        return false;
      }

      // 检查令牌是否过期
      if (expiresIn) {
        const expirationTime = parseInt(expiresIn);
        const currentTime = Math.floor(Date.now() / 1000);

        if (currentTime >= expirationTime) {
          console.log("令牌已过期，尝试刷新");
          const refreshSuccess = await this.refreshAccessToken();
          if (!refreshSuccess) {
            console.log("令牌刷新失败");
            this.clearAuth();
            return false;
          }
        }
      }

      // 恢复令牌信息
      this.token = token;
      this.refreshToken = refreshToken;
      this.tokenType = tokenType || "Bearer";
      this.expiresIn = expiresIn;

      console.log("令牌信息已恢复，开始验证用户信息");

      // 验证令牌有效性并获取用户信息
      try {
        const profileSuccess = await this.getUserProfile();
        if (profileSuccess && this.user) {
          this.isLoggedIn = true;
          console.log("用户认证状态恢复成功", {
            user: this.user,
            roles: this.user.roles,
            isAdmin: this.isAdmin,
            isModerator: this.isModerator,
          });
          return true;
        } else {
          console.log("获取用户信息失败，尝试刷新令牌");
          const refreshSuccess = await this.refreshAccessToken();
          if (refreshSuccess) {
            const retrySuccess = await this.getUserProfile();
            if (retrySuccess && this.user) {
              this.isLoggedIn = true;
              console.log("令牌刷新后用户认证状态恢复成功");
              return true;
            }
          }

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
    pick: ["user", "token", "refreshToken", "isLoggedIn"],
  },
});
