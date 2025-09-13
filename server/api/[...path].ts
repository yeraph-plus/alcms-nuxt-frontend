import { apiClient } from "../utils/apiClient";

export default defineEventHandler(async (event) => {
  try {
    // 获取路径参数
    const path = getRouterParam(event, "path");
    if (!path) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing path parameter",
      });
    }

    // 构建路径字符串
    const pathString = Array.isArray(path) ? path.join("/") : path;

    // 获取请求方法
    const method = getMethod(event);

    // 获取查询参数
    const query = getQuery(event);

    // 获取请求体（如果有）
    let body = null;
    if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
      try {
        body = await readBody(event);
      } catch (error) {
        // 如果没有请求体，忽略错误
      }
    }

    // 获取请求头
    const headers = getHeaders(event);

    // 提取认证头
    const authHeaders: Record<string, string> = {};
    if (headers.authorization) {
      authHeaders.Authorization = headers.authorization;
    }

    let result;

    // 检测是否为端点路径格式（包含点号）
    if (pathString.includes(".")) {
      // 端点路径格式，使用 callEndpoint 方法
      const requestData = method.toUpperCase() === "GET" ? query : body;
      result = await apiClient.callEndpoint(
        pathString,
        requestData,
        event,
        authHeaders
      );
    } else {
      // 普通API路径格式，构建完整的API路径
      const apiPath = `/api/${pathString}`;

      // 根据方法调用相应的 apiClient 方法
      switch (method.toUpperCase()) {
        case "GET":
          result = await apiClient.get(apiPath, query, event, authHeaders);
          break;
        case "POST":
          result = await apiClient.post(apiPath, body, event, authHeaders);
          break;
        case "PUT":
          result = await apiClient.put(apiPath, body, event, authHeaders);
          break;
        case "DELETE":
          result = await apiClient.delete(apiPath, query, event, authHeaders);
          break;
        case "PATCH":
          result = await apiClient.patch(apiPath, body, event, authHeaders);
          break;
        default:
          throw createError({
            statusCode: 405,
            statusMessage: `Method ${method} not allowed`,
          });
      }
    }

    return result;
  } catch (error: any) {
    console.error("Proxy API Error:", error);

    // 如果是 HTTP 错误，保持原始状态码
    if (error.statusCode) {
      throw error;
    }

    // 其他错误返回 500
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error",
      data: {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
});
