# 服务端 API 前端代理


## 请求结构

前端 (useApi) → Nuxt代理 ([...path].ts) → 后端API请求器 (apiClient) → 后端

## 文件结构
server/
├── utils/
│   ├── config.ts           # API端点配置和参数定义
│   └── apiClient.ts         # ApiClient类实现
└── api/
└── [...path].ts         # 通用代理端点

app/
└── composables/
└── useApi.ts            # 前端API组合函数

## 代理工作逻辑

### 1. 前端请求流程 (useApi)

前端通过useApi组合函数发起请求：

```typescript
// 前端调用示例
const { callEndpoint } = useApi()

// 调用端点
const result = await callEndpoint('auth.login', {
  data: { email: 'user@example.com', password: 'password' },
  method: 'POST'
})
```

**useApi工作流程：**
1. 接收端点路径（如 `auth.login`）和请求配置
2. 将端点路径转换为API路径（`auth.login` → `auth/login`）
3. 根据method参数选择对应的HTTP方法（GET/POST/PUT/DELETE/PATCH）
4. 构建完整的代理URL：`/api/auth/login`
5. 通过$fetch发送请求到Nuxt代理端点
6. 返回标准化的ApiResponse格式

### 2. Nuxt代理层 ([...path].ts)

代理端点接收前端请求并转发到后端：

```typescript
// 代理处理流程
export default defineEventHandler(async (event) => {
  // 1. 解析路径参数
  const path = getRouterParam(event, 'path') // ['auth', 'login']
  const apiPath = `/api/${path.join('/')}` // '/api/auth/login'
  
  // 2. 获取请求信息
  const method = getMethod(event)           // 'POST'
  const query = getQuery(event)             // 查询参数
  const body = await readBody(event)       // 请求体
  const headers = getHeaders(event)         // 请求头
  
  // 3. 提取认证信息
  const authHeaders = {}
  if (headers.authorization) {
    authHeaders.Authorization = headers.authorization
  }
  
  // 4. 调用对应的apiClient方法
  switch (method.toUpperCase()) {
    case 'POST':
      return await apiClient.post(apiPath, body, event, authHeaders)
    // ... 其他方法
  }
})
```

### 3. 后端API客户端 (apiClient)

ApiClient负责与外部API服务通信：

```typescript
// ApiClient处理流程
class ApiClient {
  async post<T>(url: string, body?: any, event?: H3Event, headers?: Record<string, string>) {
    // 1. 构建完整URL
    const fullUrl = `${this.baseURL}${url}` // 'http://127.0.0.1:3000/api/auth/login'
    
    // 2. 合并请求头
    const requestHeaders = {
      ...this.defaultHeaders,
      ...this.extractAuthFromEvent(event), // 从前端请求提取认证
      ...headers
    }
    
    // 3. 发送HTTP请求
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body)
    })
    
    // 4. 处理响应
    const data = await response.json()
    
    // 5. 返回标准格式
    return {
      success: data.success || response.ok,
      message: data.message,
      data: data.data || data
    }
  }
}
```

## 核心功能特性

### 1. 统一的响应格式

所有API调用都返回标准的ApiResponse格式：

```typescript
interface ApiResponse<T = any> {
  success: boolean;    // 请求是否成功
  message?: string;    // 响应消息
  data?: T;           // 响应数据
}
```

### 2. 自动HTTP方法路由

根据配置文件中定义的method自动选择HTTP方法：

```typescript
// config.ts中的端点配置
const API_ENDPOINTS = {
  auth: {
    login: { method: "POST", url: "/api/auth/login" },
    profile: { method: "GET", url: "/api/auth/profile" }
  },
  users: {
    list: { method: "GET", url: "/api/users" },
    delete: { method: "DELETE", url: "/api/users/:userId" }
  }
}

// 前端调用时自动使用正确的HTTP方法
await callEndpoint('auth.login', { data: loginData, method: 'POST' })
await callEndpoint('users.list', { method: 'GET' })
await callEndpoint('users.delete', { data: { userId: '123' }, method: 'DELETE' })
```

### 3. 认证信息透传

自动处理认证信息的传递：

前端请求头 → Nuxt代理 → ApiClient → 后端API
Authorization: Bearer xxx → Authorization: Bearer xxx → Authorization: Bearer xxx

### 4. 错误处理链

完整的错误处理机制：

```typescript
// 1. 后端API错误 → ApiClient捕获并标准化
// 2. 网络错误 → 代理层捕获并返回500
// 3. 前端处理 → useApi更新error状态

try {
  const result = await callEndpoint('auth.login', { data: loginData, method: 'POST' })
  if (!result.success) {
    // 处理业务错误
    console.error(result.message)
  }
} catch (error) {
  // 处理网络或系统错误
  console.error('请求失败:', error)
}
```

## 使用示例

### 1. 基础端点调用

```typescript
// 组合函数
const { callEndpoint, loading, error } = useApi()

// 登录请求
const login = async (credentials) => {
  const result = await callEndpoint('auth.login', {
    data: credentials,
    method: 'POST'
  })
  
  if (result.success) {
    // 登录成功
    return result.data
  } else {
    // 登录失败
    throw new Error(result.message)
  }
}
```

### 2. 带参数的请求

```typescript
// GET请求with查询参数
const getUsers = async (page = 1, limit = 20) => {
  return await callEndpoint('users.list', {
    data: { page, limit },
    method: 'GET'
  })
}

// DELETE请求with路径参数
const deleteUser = async (userId) => {
  return await callEndpoint('users.delete', {
    data: { userId },
    method: 'DELETE'
  })
}
```

### 3. 自定义请求头

```typescript
const result = await callEndpoint('users.profile', {
  method: 'GET',
  headers: {
    'X-Custom-Header': 'value'
  }
})
```

## 配置和扩展

### 1. 端点配置

在`server/utils/config.ts`中定义新的API端点：

```typescript
export const API_ENDPOINTS = {
  // 新增模块
  products: {
    list: { method: "GET", url: "/api/products" },
    create: { method: "POST", url: "/api/products" },
    update: { method: "PUT", url: "/api/products/:id" },
    delete: { method: "DELETE", url: "/api/products/:id" }
  }
}
```

### 2. ApiClient配置

```typescript
// 修改基础URL和超时时间
export const API_BASE_URL = "https://api.example.com"
export const API_TIMEOUT = 15000
```

## 最佳实践

1. **端点优先**：优先使用配置文件中定义的端点，通过`callEndpoint`调用
2. **错误处理**：始终检查`result.success`并处理错误情况
3. **类型安全**：为API响应定义TypeScript接口
4. **状态管理**：利用`loading`和`error`状态提供用户反馈
5. **认证处理**：依赖自动认证传递，避免手动处理token

## 调试和监控

### 1. 请求日志

```typescript
// 在useApi中启用调试
console.log('发送请求:', { endpointPath, method, data })

// 在代理层查看请求信息
console.log('代理请求:', { apiPath, method, body, headers })

// 在ApiClient中监控外部API调用
console.log('外部API调用:', { url, method, response })
```

### 2. 错误追踪

完整的错误链路追踪：

前端错误 → useApi.error
代理错误 → [...path].ts console.error
后端错误 → apiClient.defaultError

