# 服务端 API 客户端

这个 ApiClient 系统为 Nuxt 应用提供了一个统一的方式来代理前端请求到后端 API。

## 文件结构

```
server/utils/
├── apiConfig.ts     # API 端点配置和验证规则
├── apiClient.ts     # ApiClient 类实现
└── README.md        # 使用文档

server/api/
├── auth/
│   └── login.post.ts           # 登录API示例
├── resources/
│   └── [id].get.ts            # 资源详情API示例
└── example/
    └── proxy.ts               # 通用代理示例
```

## 核心功能

### ApiClient 类

- **统一的 HTTP 请求处理**：支持 GET、POST、PUT、DELETE、PATCH 方法
- **简化的认证处理**：只处理 Authorization 头，支持 Bearer token 设置
- **URL 参数替换**：自动处理 `:id` 等路径参数
- **错误处理**：统一的错误响应格式
- **超时控制**：可配置的请求超时时间
- **类型安全**：完整的 TypeScript 类型定义

## 使用方法

### 1. 基础用法

```typescript
import { apiClient } from '~/server/utils/apiClient'

// 在 API 路由中使用
export default defineEventHandler(async (event) => {
  // 使用预定义的端点
  const result = await apiClient.callEndpoint(
    'auth.login',
    { email: 'user@example.com', password: 'password' },
    event
  )
  
  return result
})
```

### 2. 直接 HTTP 方法调用

```typescript
// GET 请求
const users = await apiClient.get('/api/users', { page: 1, limit: 10 }, event)

// POST 请求
const newUser = await apiClient.post('/api/users', userData, event)

// PUT 请求
const updatedUser = await apiClient.put('/api/users/123', updateData, event)

// DELETE 请求
const result = await apiClient.delete('/api/users/123', undefined, event)
```

### 3. 带路径参数的请求

```typescript
// URL: /api/users/:userId/posts/:postId
const result = await apiClient.callEndpoint(
  'users.posts.detail',
  { userId: '123', postId: '456' },
  event
)
```

### 4. 自定义请求头

```typescript
const result = await apiClient.get(
  '/api/data',
  { query: 'search' },
  event,
  { 'X-Custom-Header': 'value' }
)
```

## API 端点配置

在 `apiConfig.ts` 中定义的端点可以通过 `callEndpoint` 方法调用：

```typescript
// apiConfig.ts 中的配置
const API_ENDPOINTS = {
  auth: {
    login: { method: "POST", url: "/api/auth/login" },
    profile: { method: "GET", url: "/api/auth/profile" }
  },
  users: {
    list: { method: "GET", url: "/api/users" },
    detail: { method: "GET", url: "/api/users/:userId" }
  }
}

// 使用方式
await apiClient.callEndpoint('auth.login', loginData, event)
await apiClient.callEndpoint('users.detail', { userId: '123' }, event)
```

## 响应格式

ApiClient 统一返回以下格式的响应：

```typescript
interface ApiResponse<T = any> {
  success: boolean;    // 请求是否成功
  data?: T;           // 成功时的响应数据
  message?: string;   // 响应消息
  error?: string;     // 错误信息
  code?: number;      // HTTP状态码
  timestamp?: string; // 时间戳（错误时包含）
}
```

### 后端响应处理

ApiClient 专门适配后端的标准 OpenAPI 响应格式：

```typescript
// 后端标准响应格式
{
  "success": false,
  "message": "访问令牌无效或已过期",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

- **成功响应**：检查 `success: true`，返回完整的后端响应数据
- **失败响应**：检查 `success: false`，提取 `message` 作为错误信息
- **网络错误**：超时或连接失败时，返回标准格式的错误响应

## 错误处理

```typescript
export default defineEventHandler(async (event) => {
  try {
    const result = await apiClient.callEndpoint('users.profile', undefined, event)
    
    if (!result.success) {
      throw createError({
        statusCode: result.code || 500,
        statusMessage: result.error || 'API request failed'
      })
    }
    
    return result.data
  } catch (error) {
    console.error('API Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
```

## 认证处理

ApiClient 提供了简化的认证处理：

### 自动认证传递
- 自动从前端请求中提取 `Authorization` 头并转发到后端

### Bearer Token 设置
```typescript
// 设置 Bearer token 到默认请求头
apiClient.setBearerToken('your-access-token')

// 清除认证信息
apiClient.clearAuth()
```

### 在 API 路由中使用
```typescript
export default defineEventHandler(async (event) => {
  // 方式1：自动传递前端的 Authorization 头
  const result = await apiClient.callEndpoint('users.profile', undefined, event)
  
  // 方式2：使用预设的 Bearer token
  apiClient.setBearerToken('server-side-token')
  const result2 = await apiClient.get('/api/admin/users')
  
  return result
})
```

## 配置选项

```typescript
// 创建自定义 ApiClient 实例
const customClient = new ApiClient('https://api.example.com', 15000)

// 设置默认请求头
customClient.setDefaultHeaders({
  'X-API-Key': 'your-api-key',
  'X-Client-Version': '1.0.0'
})
```

## 最佳实践

1. **使用预定义端点**：优先使用 `callEndpoint` 方法调用 `apiConfig.ts` 中定义的端点
2. **错误处理**：始终检查 `result.success` 并适当处理错误
3. **类型安全**：为响应数据定义 TypeScript 接口
4. **日志记录**：在生产环境中记录 API 调用和错误
5. **缓存策略**：对于频繁访问的数据考虑实现缓存机制

## 示例文件

- `server/api/auth/login.post.ts` - 用户登录代理
- `server/api/resources/[id].get.ts` - 资源详情获取
- `server/api/example/proxy.ts` - 通用代理示例

这些示例展示了如何在不同场景下使用 ApiClient 系统。