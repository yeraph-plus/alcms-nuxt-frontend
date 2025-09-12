<template>
  <div
    style="
      min-height: 100vh;
      background-color: var(--el-bg-color-page);
      padding: 20px;
    "
  >
    <el-container>
      <!-- 页面标题 -->
      <el-header
        style="
          text-align: center;
          margin-bottom: 30px;
          height: auto;
          padding: 0;
        "
      >
        <h1
          style="
            font-size: 28px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin-bottom: 8px;
          "
        >
          接口测试工具
        </h1>
        <el-text type="info" size="large"
          >调用 server\utils\config.ts 测试接口</el-text
        >
      </el-header>

      <el-row :gutter="20">
        <!-- 左侧：接口选择和参数配置 -->
        <el-col :span="8">
          <!-- 接口分类和具体接口选择 -->
          <el-card shadow="hover" style="margin-bottom: 20px; width: 100%">
            <template #header>
              <div style="display: flex; align-items: center">
                <el-icon><Menu /></el-icon>
                <span style="margin-left: 8px; font-weight: 600"
                  >API 接口列表</span
                >
              </div>
            </template>

            <el-collapse v-model="activeCollapse" accordion>
              <el-collapse-item
                v-for="(category, key) in apiCategories"
                :key="key"
                :title="`${key} (${Object.keys(category).length} 个接口)`"
                :name="key"
                @click="selectedCategory = key"
                style=""
              >
                <template #title>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      width: 100%;
                    "
                  >
                    <div style="display: flex; align-items: center">
                      <el-icon style="margin-right: 8px"><Folder /></el-icon>
                      <span style="font-weight: 500">{{ key }}</span>
                    </div>
                    <el-tag size="small" type="info"
                      >{{ Object.keys(category).length }} 个接口</el-tag
                    >
                  </div>
                </template>

                <div style="padding: 10px 0">
                  <el-space
                    direction="vertical"
                    style="width: 100%"
                    size="small"
                  >
                    <el-card
                      v-for="(endpoint, endpointKey) in category"
                      :key="endpointKey"
                      shadow="hover"
                      :class="
                        selectedEndpoint?.key === endpointKey
                          ? 'selected-endpoint'
                          : ''
                      "
                      style="cursor: pointer; transition: all 0.3s"
                      @click="selectEndpoint(endpointKey, endpoint)"
                    >
                      <div
                        style="
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          width: 100%;
                        "
                      >
                        <div style="flex: 1">
                          <div
                            style="
                              display: flex;
                              align-items: center;
                              margin-bottom: 4px;
                              width: 100%;
                            "
                          >
                            <el-icon
                              style="
                                margin-right: 6px;
                                color: var(--el-color-primary);
                              "
                              ><Menu
                            /></el-icon>
                            <el-text
                              style="font-weight: 600; font-size: 14px"
                              >{{ endpointKey }}</el-text
                            >
                          </div>
                          <el-text
                            type="info"
                            size="small"
                            style="font-family: monospace"
                            >{{ endpoint.url }}</el-text
                          >
                        </div>
                        <div style="margin-left: 12px">
                          <el-tag
                            :type="getMethodTagType(endpoint.method)"
                            size="small"
                            effect="dark"
                            round
                          >
                            {{ endpoint.method }}
                          </el-tag>
                        </div>
                      </div>
                    </el-card>
                  </el-space>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </el-col>

        <!-- 右侧：响应结果 -->
        <el-col :span="16">
          <!-- 参数配置 -->
          <el-card
            v-if="selectedEndpoint"
            shadow="hover"
            style="margin-bottom: 20px"
          >
            <template #header>
              <div style="display: flex; align-items: center">
                <el-icon><Setting /></el-icon>
                <span style="margin-left: 8px; font-weight: 600">参数配置</span>
              </div>
            </template>

            <!-- URL 参数 -->
            <div v-if="urlParams.length > 0" style="margin-bottom: 20px">
              <el-divider content-position="left">
                <el-text type="primary" style="font-weight: 500"
                  >URL 参数</el-text
                >
              </el-divider>
              <el-space direction="vertical" style="width: 100%" size="large">
                <el-row
                  v-for="param in urlParams"
                  :key="param"
                  :gutter="10"
                  style="align-items: center"
                >
                  <el-col :span="6">
                    <el-text style="font-weight: 500">{{ param }}:</el-text>
                  </el-col>
                  <el-col :span="18">
                    <el-input
                      v-model="formData.urlParams[param]"
                      :placeholder="`请输入 ${param}`"
                      clearable
                    />
                  </el-col>
                </el-row>
              </el-space>
            </div>

            <!-- Query 参数 -->
            <div
              v-if="selectedEndpoint.config.params"
              style="margin-bottom: 20px"
            >
              <el-divider content-position="left">
                <el-text type="primary" style="font-weight: 500"
                  >Query 参数</el-text
                >
              </el-divider>
              <el-space direction="vertical" style="width: 100%" size="large">
                <el-row
                  v-for="(param, key) in selectedEndpoint.config.params"
                  :key="key"
                  :gutter="10"
                  style="align-items: center"
                >
                  <el-col :span="6">
                    <el-text style="font-weight: 500">{{ key }}:</el-text>
                  </el-col>
                  <el-col :span="14">
                    <el-input
                      v-model="formData.queryParams[key]"
                      :type="param.type === 'number' ? 'number' : 'text'"
                      :placeholder="
                        param.example ? String(param.example) : param.desc
                      "
                      clearable
                    />
                  </el-col>
                  <el-col :span="4">
                    <el-text size="small" type="info">{{ param.desc }}</el-text>
                  </el-col>
                </el-row>
              </el-space>
            </div>

            <!-- Body 参数 -->
            <div
              v-if="
                selectedEndpoint.config.body &&
                Object.keys(selectedEndpoint.config.body).length > 0
              "
              style="margin-bottom: 20px"
            >
              <el-divider content-position="left">
                <el-text type="primary" style="font-weight: 500"
                  >Body 参数</el-text
                >
              </el-divider>
              <el-space direction="vertical" style="width: 100%" size="large">
                <el-row
                  v-for="(param, key) in selectedEndpoint.config.body"
                  :key="key"
                  :gutter="10"
                  style="align-items: center"
                >
                  <el-col :span="6">
                    <el-text style="font-weight: 500">
                      {{ key }}
                      <el-text v-if="param.required" type="danger">*</el-text>:
                    </el-text>
                  </el-col>
                  <el-col :span="14">
                    <el-input
                      v-model="formData.bodyParams[key]"
                      :type="param.type === 'number' ? 'number' : 'text'"
                      :placeholder="
                        param.example ? String(param.example) : param.desc
                      "
                      :required="param.required"
                      clearable
                    />
                  </el-col>
                  <el-col :span="4">
                    <el-text size="small" type="info">{{ param.desc }}</el-text>
                  </el-col>
                </el-row>
              </el-space>
            </div>

            <!-- 认证设置 -->
            <div
              v-if="selectedEndpoint.config.header?.Auth"
              style="margin-bottom: 20px"
            >
              <el-divider content-position="left">
                <el-text type="primary" style="font-weight: 500"
                  >认证设置</el-text
                >
              </el-divider>
              <el-row :gutter="10" style="align-items: center">
                <el-col :span="6">
                  <el-text style="font-weight: 500">Token:</el-text>
                </el-col>
                <el-col :span="18">
                  <el-input
                    v-model="authToken"
                    type="password"
                    placeholder="请输入 Bearer Token"
                    show-password
                    clearable
                  />
                </el-col>
              </el-row>
            </div>

            <!-- 发送请求按钮 -->
            <el-row :gutter="10">
              <el-col :span="18">
                <el-button
                  @click="sendRequest"
                  :loading="loading"
                  type="primary"
                  style="width: 100%"
                  size="large"
                >
                  <template v-if="!loading">
                    <el-icon><Position /></el-icon>
                  </template>
                  {{ loading ? "发送中..." : "发送请求" }}
                </el-button>
              </el-col>
              <el-col :span="6">
                <el-button @click="clearForm" style="width: 100%" size="large">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </el-col>
            </el-row>
          </el-card>
          <!-- 请求信息 -->
          <el-card
            v-if="selectedEndpoint"
            shadow="hover"
            style="margin-bottom: 20px"
          >
            <template #header>
              <div style="display: flex; align-items: center">
                <el-icon><InfoFilled /></el-icon>
                <span style="margin-left: 8px; font-weight: 600">请求信息</span>
              </div>
            </template>

            <el-space direction="vertical" style="width: 100%" size="large">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-text style="font-weight: 500">方法:</el-text>
                <el-tag
                  :type="getMethodTagType(selectedEndpoint.config.method)"
                  size="small"
                  effect="dark"
                >
                  {{ selectedEndpoint.config.method }}
                </el-tag>
              </div>

              <div style="display: flex; align-items: center; gap: 8px">
                <el-text style="font-weight: 500">URL:</el-text>
                <el-text
                  type="info"
                  style="
                    font-family: monospace;
                    background: var(--el-fill-color-light);
                    padding: 4px 8px;
                    border-radius: 4px;
                  "
                >
                  {{ buildRequestUrl() }}
                </el-text>
              </div>

              <div
                v-if="selectedEndpoint.config.header?.Auth"
                style="display: flex; align-items: center; gap: 8px"
              >
                <el-text style="font-weight: 500">认证:</el-text>
                <el-text type="primary">需要 Bearer Token</el-text>
              </div>
            </el-space>
          </el-card>

          <!-- 响应结果 -->
          <el-card shadow="hover">
            <template #header>
              <div style="display: flex; align-items: center">
                <el-icon><DataLine /></el-icon>
                <span style="margin-left: 8px; font-weight: 600">响应结果</span>
              </div>
            </template>

            <!-- 空状态 -->
            <el-empty
              v-if="!response && !error"
              description="选择接口并发送请求查看结果"
            >
              <template #image>
                <el-icon size="64" color="var(--el-color-info)"
                  ><ChatDotRound
                /></el-icon>
              </template>
            </el-empty>

            <!-- 成功响应 -->
            <div v-if="response">
              <el-space direction="vertical" style="width: 100%" size="large">
                <div style="display: flex; align-items: center; gap: 8px">
                  <el-text style="font-weight: 500">状态:</el-text>
                  <el-tag
                    :type="response.success ? 'success' : 'danger'"
                    size="small"
                    effect="dark"
                  >
                    {{ response.success ? "成功" : "失败" }}
                  </el-tag>
                  <el-text v-if="response.code" type="info" size="small"
                    >({{ response.code }})</el-text
                  >
                </div>

                <div v-if="response.message">
                  <el-text style="font-weight: 500">消息:</el-text>
                  <el-text style="display: block; margin-top: 4px">{{
                    response.message
                  }}</el-text>
                </div>

                <div>
                  <el-text
                    style="font-weight: 500; display: block; margin-bottom: 8px"
                    >响应数据:</el-text
                  >
                  <el-input
                    :model-value="JSON.stringify(response, null, 2)"
                    type="textarea"
                    :rows="15"
                    readonly
                    style="font-family: monospace; font-size: 12px"
                  />
                </div>
              </el-space>
            </div>

            <!-- 错误响应 -->
            <div v-if="error">
              <el-space direction="vertical" style="width: 100%" size="large">
                <div style="display: flex; align-items: center; gap: 8px">
                  <el-text style="font-weight: 500">状态:</el-text>
                  <el-tag type="danger" size="small" effect="dark">错误</el-tag>
                </div>

                <div>
                  <el-text
                    style="font-weight: 500; display: block; margin-bottom: 8px"
                    >错误信息:</el-text
                  >
                  <el-input
                    :model-value="error"
                    type="textarea"
                    :rows="10"
                    readonly
                    style="font-family: monospace; font-size: 12px"
                  />
                </div>
              </el-space>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import {
  Menu,
  Folder,
  Setting,
  Position,
  Delete,
  InfoFilled,
  DataLine,
  ChatDotRound,
} from "@element-plus/icons-vue";
import { API_ENDPOINTS } from "../../../server/utils/config";
const { callEndpoint, loading: apiLoading, error: apiError } = useApi();

// 设置页面布局
definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
// 响应式数据
const selectedCategory = ref("");
const selectedEndpoint = ref(null);
const loading = ref(false);
const response = ref(null);
const error = ref(null);
const authToken = ref("");
const activeCollapse = ref("");

// 表单数据
const formData = reactive({
  urlParams: {},
  queryParams: {},
  bodyParams: {},
});

// API分类数据
const apiCategories = computed(() => API_ENDPOINTS);

// 提取URL参数
const urlParams = computed(() => {
  if (!selectedEndpoint.value) return [];
  const url = selectedEndpoint.value.config.url;
  const matches = url.match(/:([^/]+)/g);
  return matches ? matches.map((match) => match.substring(1)) : [];
});

// 选择端点
function selectEndpoint(key, config) {
  selectedEndpoint.value = { key, config };
  clearForm();
}

// 清空表单
function clearForm() {
  formData.urlParams = {};
  formData.queryParams = {};
  formData.bodyParams = {};
  response.value = null;
  error.value = null;
}

// 获取方法标签类型
function getMethodTagType(method) {
  const types = {
    GET: "success",
    POST: "primary",
    PUT: "warning",
    DELETE: "danger",
    PATCH: "info",
  };
  return types[method] || "info";
}

// 构建请求URL（用于显示）
function buildRequestUrl() {
  if (!selectedEndpoint.value) return "";

  let url = selectedEndpoint.value.config.url;

  // 替换URL参数
  Object.entries(formData.urlParams).forEach(([key, value]) => {
    if (value) {
      url = url.replace(`:${key}`, value);
    }
  });

  // 添加查询参数
  const queryString = Object.entries(formData.queryParams)
    .filter(
      ([key, value]) => value !== "" && value !== null && value !== undefined
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return queryString ? `${url}?${queryString}` : url;
}

// 发送请求（使用useApi通过代理）
async function sendRequest() {
  if (!selectedEndpoint.value) return;

  loading.value = true;
  response.value = null;
  error.value = null;

  try {
    const { key, config } = selectedEndpoint.value;

    // 构建端点路径（例如："auth.login"）
    const endpointPath = `${selectedCategory.value}.${key}`;

    // 准备请求数据，合并URL参数、查询参数和请求体参数
    const requestData = {
      // URL参数
      ...Object.entries(formData.urlParams)
        .filter(
          ([key, value]) =>
            value !== "" && value !== null && value !== undefined
        )
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      // 查询参数
      ...Object.entries(formData.queryParams)
        .filter(
          ([key, value]) =>
            value !== "" && value !== null && value !== undefined
        )
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
      // 请求体参数
      ...Object.entries(formData.bodyParams)
        .filter(
          ([key, value]) =>
            value !== "" && value !== null && value !== undefined
        )
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
    };

    // 准备headers
    const headers = {};
    if (config.header?.Auth && authToken.value) {
      headers["Authorization"] = `Bearer ${authToken.value}`;
    }

    console.log("使用useApi代理发送请求:", {
      endpointPath,
      requestData,
      headers,
    });

    // 使用useApi发送请求
    const result = await callEndpoint(endpointPath, {
      data: requestData,
      headers,
      method: config.method,
    });

    response.value = result;
  } catch (err) {
    console.error("请求错误:", err);

    // 处理错误响应
    if (err.error) {
      error.value = err.error;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = "请求失败，请检查网络连接或服务器状态";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* 自定义滚动条样式 */
pre::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

pre::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 选中的接口卡片样式 */
.selected-endpoint {
  border: 2px solid var(--el-color-primary) !important;
  background-color: var(--el-color-primary-light-9) !important;
}

.selected-endpoint:hover {
  border-color: var(--el-color-primary) !important;
  background-color: var(--el-color-primary-light-8) !important;
}
</style>
le>
