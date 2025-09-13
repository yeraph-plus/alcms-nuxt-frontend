import type { H3Event } from "h3";
import { API_BASE_URL, API_TIMEOUT, API_ENDPOINTS } from "./config";

// 响应类型定义
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
  timestamp?: string;
}

// 请求配置接口
interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
}

// 端点配置类型
interface ApiEndpoint {
  method: string;
  url: string;
}

// HTTP请求代理类
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "User-Agent": "ALCMS-Nuxt-Cli/1.0 (Server)",
    };
  }

  // 默认请求头
  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  // 从H3Event中提取认证信息
  private extractAuthFromEvent(event: H3Event): Record<string, string> {
    const headers: Record<string, string> = {};

    // 提取Authorization头
    const authorization = getHeader(event, "authorization");
    if (authorization) {
      headers.Authorization = authorization;
    }

    return headers;
  }

  // 设置Bearer token
  setBearerToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // 清除Bearer token
  clearAuth() {
    delete this.defaultHeaders.Authorization;
  }

  // 定义意外情况的报错返回格式
  defaultError(message: string, error: any) {
    return {
      success: false,
      message: "[Client Error] " + message,
      error: error,
      timestamp: new Date().toISOString(),
    };
  }

  // 替换URL中的参数占位符
  private replaceUrlParams(
    url: string,
    params: Record<string, any> = {}
  ): string {
    let processedUrl = url;
    Object.entries(params).forEach(([key, value]) => {
      processedUrl = processedUrl.replace(
        `{${key}}`,
        encodeURIComponent(String(value))
      );
    });
    return processedUrl;
  }

  // 转义查询字符串
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  // 执行HTTP请求
  private async makeRequest<T>(
    url: string,
    config: RequestConfig = {},
    event?: H3Event
  ): Promise<ApiResponse<T>> {
    try {
      const {
        method = "GET",
        headers = {},
        body,
        params = {},
        timeout = this.timeout,
      } = config;

      // 处理URL参数替换
      let processedUrl = this.replaceUrlParams(url, params);

      // 构建完整URL
      const fullUrl = `${this.baseURL}${processedUrl}`;

      // 合并请求头
      const requestHeaders = {
        ...this.defaultHeaders,
        ...headers,
      };

      // 如果有H3Event，提取认证信息
      if (event) {
        const authHeaders = this.extractAuthFromEvent(event);
        Object.assign(requestHeaders, authHeaders);
      }

      // 处理 fetch 选项
      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: AbortSignal.timeout(timeout),
      };

      // 处理请求体
      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        // 非对象类型，时阻止发送
        if (typeof body !== "object") {
          return this.defaultError("Request body must be an object.", null);
        }
        fetchOptions.body = JSON.stringify(body);
      }

      // 发送请求
      const response = await fetch(fullUrl, fetchOptions);

      // 解析JSON
      const data = await response.json();

      // 解析失败或者响应数据为空
      if (!data || typeof data !== "object") {
        return this.defaultError("Server response invalid format.", data);
      }

      // 返回响应数据
      return data;
    } catch (error: any) {
      // 检查DOMException是否是超时或者Abort
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        return this.defaultError("Request timed out.", error);
      }
      // 认为是服务器连接失败
      return this.defaultError("Server connection failed.", error);
    }
  }

  // 定义请求方法

  // GET
  async get<T>(
    url: string,
    params?: Record<string, any>,
    event?: H3Event,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    let requestUrl = url;
    if (params && Object.keys(params).length > 0) {
      const queryString = this.buildQueryString(params);
      requestUrl += `?${queryString}`;
    }

    return this.makeRequest<T>(
      requestUrl,
      {
        method: "GET",
        headers,
      },
      event
    );
  }

  // POST
  async post<T>(
    url: string,
    body?: any,
    event?: H3Event,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: "POST",
        body,
        headers,
      },
      event
    );
  }

  // PUT
  async put<T>(
    url: string,
    body?: any,
    event?: H3Event,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: "PUT",
        body,
        headers,
      },
      event
    );
  }

  // DELETE
  async delete<T>(
    url: string,
    params?: Record<string, any>,
    event?: H3Event,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: "DELETE",
        params,
        headers,
      },
      event
    );
  }

  // PATCH
  async patch<T>(
    url: string,
    body?: any,
    event?: H3Event,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      url,
      {
        method: "PATCH",
        body,
        headers,
      },
      event
    );
  }

  // 抽象方法，使用API端点配置发送请求
  async callEndpoint<T>(
    endpointPath: string,
    data?: any,
    event?: H3Event,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    // 解析端点路径
    const pathParts = endpointPath.split(".");
    let endpoint: ApiEndpoint | undefined;

    // 递归查找端点配置
    let current: any = API_ENDPOINTS;
    for (const part of pathParts) {
      current = current[part];
      if (!current) {
        return this.defaultError(
          `API endpoint not found: ${endpointPath}`,
          null
        );
      }
    }

    endpoint = current as ApiEndpoint;

    if (!endpoint || !endpoint.method || !endpoint.url) {
      return this.defaultError(
        `Invalid API endpoint configuration: ${endpointPath}`,
        null
      );
    }

    const method = endpoint.method.toUpperCase() as RequestConfig["method"];
    const url = endpoint.url;

    // 根据HTTP方法调用相应的请求方法
    switch (method) {
      case "GET":
        return this.get<T>(url, data, event, headers);
      case "POST":
        return this.post<T>(url, data, event, headers);
      case "PUT":
        return this.put<T>(url, data, event, headers);
      case "DELETE":
        return this.delete<T>(url, data, event, headers);
      case "PATCH":
        return this.patch<T>(url, data, event, headers);
      default:
        return this.defaultError(`Unsupported HTTP method: ${method}`, null);
    }
  }
}

// 创建默认实例
export const apiClient = new ApiClient();

// 导出类型
export type { ApiResponse, RequestConfig };
