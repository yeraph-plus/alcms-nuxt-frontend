import { ref, readonly } from 'vue';
import { useJwt } from './useJwt';

export const useApi = () => {
  // 响应式状态
  const loading = ref(false);
  const error = ref(null);
  
  // 获取JWT功能
  const { getValidAccessToken, tokenType } = useJwt();

  // 基础请求方法 - 直接通过代理获取apiClient的响应
  const request = async (path, options = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const { method = "GET", headers = {}, body, query = {}, skipAuth = false } = options;

      // 构建请求URL
      let url = `/api/${path.replace(/^\//, "")}`;

      // 构建请求配置
      const requestConfig = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };
      
      // 自动添加认证头（除非明确跳过）
      if (!skipAuth) {
        try {
          const token = await getValidAccessToken();
          if (token) {
            requestConfig.headers.Authorization = `${tokenType.value || 'Bearer'} ${token}`;
          }
        } catch (authError) {
          console.warn('获取访问令牌失败:', authError);
        }
      }

      // 处理查询参数
      if (method === "GET" && Object.keys(query).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            searchParams.append(key, String(value));
          }
        });
        url += `?${searchParams.toString()}`;
      }

      // 处理请求体
      if (["POST", "PUT", "PATCH"].includes(method) && body) {
        requestConfig.body = JSON.stringify(body);
      }

      // 直接返回代理端点的响应，不做额外包装
      const response = await $fetch(url, requestConfig);

      // 只更新error状态，不重新包装数据
      if (!response.success) {
        error.value = response.message || null;
      }

      return response;
    } catch (err) {
      console.error("API请求错误:", err);

      // 处理网络错误等异常情况
      let errorMessage = "请求失败，请检查网络连接或服务器状态";

      if (err.data?.error) {
        errorMessage = err.data.error;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      error.value = errorMessage;

      // 返回符合apiClient格式的错误响应
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    } finally {
      loading.value = false;
    }
  };

  // HTTP方法封装
  const get = async (path, query, headers, skipAuth = false) => {
    return request(path, { method: "GET", query, headers, skipAuth });
  };

  const post = async (path, body, headers, skipAuth = false) => {
    return request(path, { method: "POST", body, headers, skipAuth });
  };

  const put = async (path, body, headers, skipAuth = false) => {
    return request(path, { method: "PUT", body, headers, skipAuth });
  };

  const del = async (path, query, headers, skipAuth = false) => {
    return request(path, { method: "DELETE", query, headers, skipAuth });
  };

  const patch = async (path, body, headers, skipAuth = false) => {
    return request(path, { method: "PATCH", body, headers, skipAuth });
  };

  // 端点请求方法
  const callEndpoint = async (endpointPath, options = {}) => {
    const { data, headers, method, skipAuth = false } = options;

    // 将端点路径转换为API路径
    const apiPath = endpointPath.replace(/\./g, "/");

    // 根据方法类型调用对应的请求方法
    switch (method?.toUpperCase()) {
      case "GET":
        return get(apiPath, data, headers, skipAuth);
      case "PUT":
        return put(apiPath, data, headers, skipAuth);
      case "DELETE":
        return del(apiPath, data, headers, skipAuth);
      case "PATCH":
        return patch(apiPath, data, headers, skipAuth);
      case "POST":
      default:
        return post(apiPath, data, headers, skipAuth);
    }
  };

  return {
    // 状态
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    request,
    get,
    post,
    put,
    delete: del,
    patch,
    callEndpoint,
  };
};
