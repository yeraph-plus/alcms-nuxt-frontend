// 使用 apiClient 的类型定义

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  method?: string;
  timestamp?: string;
}

export const useApi = () => {
  // 响应式状态
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 基础请求方法 - 直接通过代理获取apiClient的响应
  const request = async <T = any>(
    path: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      headers?: Record<string, string>;
      body?: any;
      query?: Record<string, any>;
    } = {}
  ): Promise<ApiResponse<T>> => {
    loading.value = true;
    error.value = null;

    try {
      const { method = "GET", headers = {}, body, query = {} } = options;

      // 构建请求URL
      let url = `/api/${path.replace(/^\//, "")}`;

      // 构建请求配置
      const requestConfig: any = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

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
      const response = await $fetch<ApiResponse<T>>(url, requestConfig);

      // 只更新error状态，不重新包装数据
      if (!response.success) {
        error.value = response.message || null;
      }

      return response;
    } catch (err: any) {
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
      } as ApiResponse<T>;
    } finally {
      loading.value = false;
    }
  };

  // HTTP方法封装
  const get = async <T = any>(
    path: string,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return request<T>(path, { method: "GET", query, headers });
  };

  const post = async <T = any>(
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return request<T>(path, { method: "POST", body, headers });
  };

  const put = async <T = any>(
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return request<T>(path, { method: "PUT", body, headers });
  };

  const del = async <T = any>(
    path: string,
    query?: Record<string, any>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return request<T>(path, { method: "DELETE", query, headers });
  };

  const patch = async <T = any>(
    path: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> => {
    return request<T>(path, { method: "PATCH", body, headers });
  };

  // 端点请求方法
  const callEndpoint = async <T = any>(
    endpointPath: string,
    options: {
      data?: any;
      headers?: Record<string, string>;
      method?: string; // 添加method参数
    } = {}
  ): Promise<ApiResponse<T>> => {
    const { data, headers, method } = options;

    // 将端点路径转换为API路径
    const apiPath = endpointPath.replace(/\./g, "/");

    // 根据方法类型调用对应的请求方法
    switch (method?.toUpperCase()) {
      case "GET":
        return get<T>(apiPath, data, headers);
      case "PUT":
        return put<T>(apiPath, data, headers);
      case "DELETE":
        return del<T>(apiPath, data, headers);
      case "PATCH":
        return patch<T>(apiPath, data, headers);
      case "POST":
      default:
        return post<T>(apiPath, data, headers);
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

// 直接导出apiClient的类型
export type { ApiResponse };
