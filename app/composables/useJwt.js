import { ref, computed, readonly } from "vue";

export const useJwt = () => {
  // 响应式状态
  const accessToken = ref(null);
  const refreshToken = ref(null);
  const tokenType = ref("Bearer");
  const expiresIn = ref(null);
  const tokenExpireTime = ref(null);
  const decodedPayload = ref(null);

  // Base64 URL 解码
  const base64UrlDecode = (str) => {
    // 替换 URL 安全字符
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    // 补齐 padding
    while (str.length % 4) {
      str += "=";
    }
    try {
      return atob(str);
    } catch (error) {
      console.error("Base64 failed", error);
      return null;
    }
  };

  // 解析 JWT token
  const parseJwtPayload = (token) => {
    if (!token || typeof token !== "string") {
      return null;
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Invalid JWT");
        return null;
      }

      const payload = base64UrlDecode(parts[1]);
      if (!payload) {
        return null;
      }

      const parsed = JSON.parse(payload);
      decodedPayload.value = parsed;
      return parsed;
    } catch (error) {
      console.error("Invalid JWT", error);
      return null;
    }
  };

  // 根据 expiresIn 计算过期时间
  const parseExpiresIn = (expiresIn) => {
    if (typeof expiresIn === "number") {
      return expiresIn * 1000;
    }
    if (typeof expiresIn === "string") {
      const match = expiresIn.match(/^(\d+)([smhd])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
          case "s":
            return value * 1000; // 秒
          case "m":
            return value * 60 * 1000; // 分钟
          case "h":
            return value * 60 * 60 * 1000; // 小时
          case "d":
            return value * 24 * 60 * 60 * 1000; // 天
          default:
            return 3600000; // 默认1小时
        }
      }
    }
    return 3600000; // 默认1小时
  };

  // 存储 Token 到 localStorage
  const setTokens = (tokens) => {
    if (!tokens) return;

    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;
    tokenType.value = tokens.tokenType || "Bearer";
    expiresIn.value = tokens.expiresIn;

    // 计算过期时间
    const expiresInMs = parseExpiresIn(tokens.expiresIn);
    tokenExpireTime.value = Date.now() + expiresInMs;

    // 解析 Payload
    if (tokens.accessToken) {
      parseJwtPayload(tokens.accessToken);
    }

    // 存储到 localStorage
    if (import.meta.client) {
      localStorage.setItem("auth_token", accessToken.value || "");
      localStorage.setItem("refresh_token", refreshToken.value || "");
      localStorage.setItem("token_type", tokenType.value || "Bearer");
      localStorage.setItem("expires_in", expiresIn.value || "");
      localStorage.setItem(
        "token_expire_time",
        tokenExpireTime.value?.toString() || ""
      );
    }
  };

  // 加载 localStorage 中的 Token
  const loadTokensFromStorage = () => {
    if (!import.meta.client) return;

    const storedToken = localStorage.getItem("auth_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");
    const storedTokenType = localStorage.getItem("token_type");
    const storedExpiresIn = localStorage.getItem("expires_in");
    const storedExpireTime = localStorage.getItem("token_expire_time");

    if (storedToken) {
      accessToken.value = storedToken;
      refreshToken.value = storedRefreshToken;
      tokenType.value = storedTokenType || "Bearer";
      expiresIn.value = storedExpiresIn;
      tokenExpireTime.value = storedExpireTime
        ? parseInt(storedExpireTime)
        : null;

      // 解析 Payload
      parseJwtPayload(storedToken);
    }
  };

  // 清除 localStorage 中的 Token
  const clearTokens = () => {
    accessToken.value = null;
    refreshToken.value = null;
    tokenType.value = "Bearer";
    expiresIn.value = null;
    tokenExpireTime.value = null;
    decodedPayload.value = null;

    if (import.meta.client) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("expires_in");
      localStorage.removeItem("token_expire_time");
    }
  };

  // 检查 Token 是否过期
  const isTokenExpired = (bufferTime = 5 * 60 * 1000) => {
    if (!tokenExpireTime.value) {
      return true;
    }
    return Date.now() >= tokenExpireTime.value - bufferTime;
  };

  // 检查 Token 是否有效
  const isTokenValid = () => {
    return !!(accessToken.value && !isTokenExpired());
  };

  // 刷新 Token
  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      console.error("没有可用的刷新令牌");
      return false;
    }

    try {
      const { callEndpoint } = useApi();
      const response = await callEndpoint("auth.refresh", {
        data: { refreshToken: refreshToken.value },
        method: "POST",
        skipAuth: true,
      });

      if (response.success && response.data?.tokens) {
        setTokens(response.data.tokens);
        return true;
      } else {
        console.error("刷新令牌失败:", response.message);
        clearTokens();
        return false;
      }
    } catch (error) {
      console.error("刷新令牌请求失败:", error);
      clearTokens();
      return false;
    }
  };

  // 获取自动刷新的 Access Token
  const getValidAccessToken = async () => {
    if (!accessToken.value) {
      return null;
    }

    if (isTokenExpired()) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        return null;
      }
    }

    return accessToken.value;
  };

  // 用户角色检查方法
  const hasRole = (roles) => {
    if (!decodedPayload.value?.roles) {
      return false;
    }

    const userRoles = decodedPayload.value.roles.map((role) => role.name);
    const targetRoles = Array.isArray(roles) ? roles : [roles];

    return targetRoles.some((role) => userRoles.includes(role));
  };

  // 用户是管理员
  const isAdmin = () => {
    return hasRole("admin");
  };

  // 用户是版主
  const isModerator = () => {
    return hasRole(["moderator", "admin"]);
  };

  // 用户是 VIP
  const isVip = () => {
    return hasRole(["vip", "moderator", "admin"]);
  };

  // 获取用户信息
  const getUserInfo = () => {
    if (!decodedPayload.value) {
      return null;
    }

    return {
      userId: decodedPayload.value.userId,
      username: decodedPayload.value.username,
      email: decodedPayload.value.email,
      roles: decodedPayload.value.roles || [],
    };
  };

  // 计算属性
  const isLoggedIn = computed(() => isTokenValid());
  const currentUser = computed(() => getUserInfo());
  const userRoles = computed(() => decodedPayload.value?.roles || []);

  // 初始化时加载存储的 Token
  if (import.meta.client) {
    loadTokensFromStorage();
  }

  return {
    // 状态
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    tokenType: readonly(tokenType),
    expiresIn: readonly(expiresIn),
    decodedPayload: readonly(decodedPayload),

    // 计算属性
    isLoggedIn,
    currentUser,
    userRoles,

    // 方法
    setTokens,
    clearTokens,
    loadTokensFromStorage,
    parseJwtPayload,
    isTokenExpired,
    isTokenValid,
    refreshAccessToken,
    getValidAccessToken,

    // 权限检查
    hasRole,
    isAdmin,
    isModerator,
    isVip,
    getUserInfo,
  };
};
