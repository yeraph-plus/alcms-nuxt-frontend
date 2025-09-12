<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
      <p class="page-subtitle">欢迎回来，管理员！这里是系统概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon users">
            <el-icon size="24"><User /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-number">{{ stats.totalUsers }}</h3>
            <p class="stat-label">总用户数</p>
            <span class="stat-change positive">+12% 本月</span>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon articles">
            <el-icon size="24"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-number">{{ stats.totalArticles }}</h3>
            <p class="stat-label">文章总数</p>
            <span class="stat-change positive">+8% 本月</span>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon views">
            <el-icon size="24"><View /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-number">{{ stats.totalViews }}</h3>
            <p class="stat-label">总浏览量</p>
            <span class="stat-change positive">+25% 本月</span>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon comments">
            <el-icon size="24"><ChatDotRound /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-number">{{ stats.totalComments }}</h3>
            <p class="stat-label">评论总数</p>
            <span class="stat-change negative">-3% 本月</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表和数据 -->
    <div class="charts-grid">
      <!-- 访问趋势图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>访问趋势</h3>
            <el-select v-model="chartPeriod" size="small" style="width: 100px">
              <el-option label="7天" value="7d" />
              <el-option label="30天" value="30d" />
              <el-option label="90天" value="90d" />
            </el-select>
          </div>
        </template>
        <div class="chart-placeholder">
          <el-icon size="48" color="#ddd"><TrendCharts /></el-icon>
          <p>访问趋势图表区域</p>
          <p class="chart-note">（此处可集成 ECharts 或其他图表库）</p>
        </div>
      </el-card>

      <!-- 最新活动 -->
      <el-card class="activity-card" shadow="hover">
        <template #header>
          <h3>最新活动</h3>
        </template>
        <div class="activity-list">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-avatar">
              <el-avatar :size="32" :src="activity.avatar">
                {{ activity.user.charAt(0) }}
              </el-avatar>
            </div>
            <div class="activity-content">
              <p class="activity-text">
                <strong>{{ activity.user }}</strong> {{ activity.action }}
              </p>
              <p class="activity-time">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快捷操作和系统信息 -->
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

      <!-- 系统信息 -->
      <el-card class="system-info" shadow="hover">
        <template #header>
          <h3>系统信息</h3>
        </template>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">服务器状态:</span>
            <el-tag type="success" size="small">运行正常</el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">数据库状态:</span>
            <el-tag type="success" size="small">连接正常</el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">缓存状态:</span>
            <el-tag type="success" size="small">运行正常</el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">磁盘使用:</span>
            <span class="info-value">{{ systemInfo.diskUsage }}%</span>
          </div>
          <div class="info-item">
            <span class="info-label">内存使用:</span>
            <span class="info-value">{{ systemInfo.memoryUsage }}%</span>
          </div>
        </div>
      </el-card>
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

// 设置页面布局
definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// 统计数据（假数据）
const stats = reactive({
  totalUsers: 1248,
  totalArticles: 356,
  totalViews: 89542,
  totalComments: 2847,
});

// 图表时间周期
const chartPeriod = ref("7d");

// 最新活动（假数据）
const recentActivities = ref([
  {
    id: 1,
    user: "张三",
    action: "发布了新文章《Vue 3 最佳实践》",
    time: "2分钟前",
    avatar: "",
  },
  {
    id: 2,
    user: "李四",
    action: "更新了用户资料",
    time: "5分钟前",
    avatar: "",
  },
  {
    id: 3,
    user: "王五",
    action: "删除了一条评论",
    time: "10分钟前",
    avatar: "",
  },
  {
    id: 4,
    user: "赵六",
    action: "上传了新的媒体文件",
    time: "15分钟前",
    avatar: "",
  },
  {
    id: 5,
    user: "钱七",
    action: "修改了系统设置",
    time: "20分钟前",
    avatar: "",
  },
]);

// 系统信息（假数据）
const systemInfo = reactive({
  diskUsage: 45,
  memoryUsage: 68,
});

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

// 模拟数据更新
onMounted(() => {
  const interval = setInterval(() => {
    // 随机更新统计数据
    stats.totalViews += Math.floor(Math.random() * 10);
    stats.totalComments += Math.floor(Math.random() * 3);

    // 随机更新系统信息
    systemInfo.diskUsage = Math.floor(Math.random() * 20) + 40;
    systemInfo.memoryUsage = Math.floor(Math.random() * 30) + 50;
  }, 10000);

  onUnmounted(() => {
    clearInterval(interval);
  });
});

// 页面标题
useHead({
  title: "仪表盘 - ALCMS 管理后台",
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
</style>
