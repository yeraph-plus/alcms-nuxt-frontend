<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-subtitle">欢迎回来，管理员！这里是系统概览</p>
    </div>
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <!-- 用户统计卡片 -->
      <el-card
        class="stat-card user-stats-card"
        shadow="hover"
        v-loading="statsLoading"
      >
        <template #header>
          <div class="card-header">
            <h3>用户统计</h3>
            <el-button
              type="text"
              size="small"
              @click="fetchUserStats"
              :loading="statsLoading"
            >
              刷新
            </el-button>
          </div>
        </template>

        <div v-if="statsError" class="error-message">
          <el-alert
            :title="statsError"
            type="error"
            show-icon
            :closable="false"
          />
        </div>

        <div v-else-if="userStats" class="user-stats-content">
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-icon total">
                <el-icon size="20"><User /></el-icon>
              </div>
              <div class="stat-details">
                <h4 class="stat-number">{{ userStats.total || 0 }}</h4>
                <p class="stat-label">总用户数</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon active">
                <el-icon size="20"><User /></el-icon>
              </div>
              <div class="stat-details">
                <h4 class="stat-number">{{ userStats.active || 0 }}</h4>
                <p class="stat-label">活跃用户</p>
              </div>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-icon inactive">
                <el-icon size="20"><User /></el-icon>
              </div>
              <div class="stat-details">
                <h4 class="stat-number">{{ userStats.inactive || 0 }}</h4>
                <p class="stat-label">未激活</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon blocked">
                <el-icon size="20"><User /></el-icon>
              </div>
              <div class="stat-details">
                <h4 class="stat-number">{{ userStats.blocked || 0 }}</h4>
                <p class="stat-label">已封禁</p>
              </div>
            </div>
          </div>

          <!-- 角色统计 -->
          <div v-if="userStats.roles" class="roles-stats">
            <h5 class="roles-title">角色分布</h5>
            <div class="roles-list">
              <div
                v-for="(count, role) in userStats.roles"
                :key="role"
                class="role-item"
              >
                <span class="role-name">{{ role }}:</span>
                <span class="role-count">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="loading-placeholder">
          <el-skeleton :rows="3" animated />
        </div>
      </el-card>

      <!-- 快捷操作 -->
      <div class="bottom-grid">
        <!-- 快捷操作 -->
        <el-card class="quick-actions" shadow="hover">
          <template #header>
            <h3>快捷操作</h3>
          </template>
          <div class="actions-grid">
            <el-button
              type="primary"
              :icon="Plus"
              @click="handleQuickAction('article')"
            >
              新建文章
            </el-button>
            <el-button
              type="success"
              :icon="User"
              @click="handleQuickAction('user')"
            >
              添加用户
            </el-button>
            <el-button
              type="warning"
              :icon="Setting"
              @click="handleQuickAction('settings')"
            >
              系统设置
            </el-button>
            <el-button
              type="info"
              :icon="Document"
              @click="handleQuickAction('backup')"
            >
              数据备份
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  User,
  Document,
  View,
  ChatDotRound,
  TrendCharts,
  Plus,
  Setting,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 页面元信息
useHead({
  title: "ALCMS - 仪表盘",
});

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// 状态管理
const adminStore = useAdminManagerStore();

// 用户统计数据
const userStats = ref(null);
const statsLoading = ref(false);
const statsError = ref(null);

// 获取用户统计数据
const fetchUserStats = async () => {
  try {
    statsLoading.value = true;
    statsError.value = null;
    const data = await adminStore.getUserStats();
    userStats.value = data;
  } catch (error) {
    console.error("获取用户统计失败:", error);
    statsError.value = error.message;
    ElMessage.error("获取用户统计数据失败");
  } finally {
    statsLoading.value = false;
  }
};

// 快捷操作处理
const handleQuickAction = (action) => {
  const actionMap = {
    article: "新建文章",
    user: "添加用户",
    settings: "系统设置",
    backup: "数据备份",
  };

  ElMessage.success(`执行操作: ${actionMap[action]}`);
};

// 数据更新
onMounted(() => {
  fetchUserStats();
});
</script>

<style scoped>
.admin-dashboard {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border: none;
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.articles {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.views {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.comments {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin: 0 0 4px 0;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card,
.activity-card {
  border: none;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.chart-note {
  font-size: 12px;
  margin-top: 8px;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #303133;
  margin: 0 0 4px 0;
}

.activity-time {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.quick-actions,
.system-info {
  border: none;
  border-radius: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #606266;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

/* 用户统计卡片样式 */
.user-stats-card {
  grid-column: span 2;
}

.user-stats-content {
  padding: 16px 0;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.stats-row:last-child {
  margin-bottom: 0;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.inactive {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #666;
}

.stat-icon.blocked {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.stat-details {
  flex: 1;
}

.stat-details .stat-number {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.stat-details .stat-label {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.roles-stats {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.roles-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e1f3d8;
  border-radius: 4px;
  font-size: 12px;
}

.role-name {
  color: #67c23a;
  font-weight: 500;
}

.role-count {
  color: #606266;
  font-weight: 600;
}

.error-message {
  margin-bottom: 16px;
}

.loading-placeholder {
  padding: 16px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-stats-card {
    grid-column: span 1;
  }

  .stats-row {
    flex-direction: column;
    gap: 12px;
  }

  .roles-list {
    justify-content: center;
  }
}
</style>
