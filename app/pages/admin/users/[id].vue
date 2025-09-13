<template>
  <div class="user-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-button :icon="ArrowLeft" @click="router.back()" class="back-button">
          返回
        </el-button>
        <div class="title-section">
          <h1 class="page-title">
            <el-icon><User /></el-icon>
            用户详情
          </h1>
          <p class="page-description">查看和管理用户信息</p>
        </div>
      </div>
      <div class="header-actions" v-if="user">
        <el-button type="warning" :icon="Edit" @click="handleEditUser">
          编辑用户
        </el-button>
        <el-button type="danger" :icon="Delete" @click="handleDeleteUser">
          删除用户
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 用户信息 -->
    <div v-else-if="user" class="user-content">
      <!-- 基本信息卡片 -->
      <el-row :gutter="24">
        <el-col :xs="24" :lg="8">
          <el-card shadow="never" class="profile-card">
            <div class="profile-header">
              <el-avatar
                :src="user.avatar_url"
                :size="120"
                class="profile-avatar"
              >
                <el-icon :size="60"><User /></el-icon>
              </el-avatar>
              <div class="profile-info">
                <h2 class="profile-name">
                  {{ user.nickname || user.username }}
                </h2>
                <p class="profile-email">{{ user.email }}</p>
                <div class="profile-badges">
                  <el-tag
                    :type="getRoleTagType(user.role)"
                    size="large"
                    class="role-badge"
                  >
                    {{ getRoleDisplayName(user.role) }}
                  </el-tag>
                  <el-tag
                    :type="getStatusTagType(user.status)"
                    size="large"
                    class="status-badge"
                  >
                    {{ getStatusDisplayName(user.status) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="profile-stats">
              <div class="stat-item">
                <div class="stat-label">用户ID</div>
                <div class="stat-value">#{{ user.id }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">注册时间</div>
                <div class="stat-value">{{ formatTime(user.created_at) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">最后登录</div>
                <div class="stat-value">
                  {{ formatTime(user.last_login_at) }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">最后更新</div>
                <div class="stat-value">{{ formatTime(user.updated_at) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="16">
          <!-- 详细信息 -->
          <el-card shadow="never" class="detail-card">
            <template #header>
              <div class="card-header">
                <el-icon><InfoFilled /></el-icon>
                <span>详细信息</span>
              </div>
            </template>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户名">
                <el-text>{{ user.username }}</el-text>
              </el-descriptions-item>
              <el-descriptions-item label="昵称">
                <el-text>{{ user.nickname || "-" }}</el-text>
              </el-descriptions-item>
              <el-descriptions-item label="邮箱地址">
                <el-text>{{ user.email }}</el-text>
              </el-descriptions-item>
              <el-descriptions-item label="用户角色">
                <el-tag :type="getRoleTagType(user.role)">
                  {{ getRoleDisplayName(user.role) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="账户状态">
                <el-tag :type="getStatusTagType(user.status)">
                  {{ getStatusDisplayName(user.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="头像链接">
                <el-text v-if="user.avatar_url" class="avatar-link">
                  <el-link
                    :href="user.avatar_url"
                    target="_blank"
                    type="primary"
                  >
                    查看头像
                  </el-link>
                </el-text>
                <el-text v-else type="info">未设置</el-text>
              </el-descriptions-item>
              <el-descriptions-item label="个人简介" :span="2">
                <el-text v-if="user.bio" class="bio-text">
                  {{ user.bio }}
                </el-text>
                <el-text v-else type="info">未填写个人简介</el-text>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 时间信息 -->
          <el-card shadow="never" class="time-card">
            <template #header>
              <div class="card-header">
                <el-icon><Clock /></el-icon>
                <span>时间信息</span>
              </div>
            </template>

            <el-timeline>
              <el-timeline-item
                :timestamp="formatTime(user.created_at)"
                type="primary"
                :icon="User"
              >
                <div class="timeline-content">
                  <h4>用户注册</h4>
                  <p>用户在此时间注册账户</p>
                </div>
              </el-timeline-item>

              <el-timeline-item
                v-if="user.last_login_at"
                :timestamp="formatTime(user.last_login_at)"
                type="success"
                :icon="Key"
              >
                <div class="timeline-content">
                  <h4>最后登录</h4>
                  <p>用户最近一次登录系统的时间</p>
                </div>
              </el-timeline-item>

              <el-timeline-item
                :timestamp="formatTime(user.updated_at)"
                type="warning"
                :icon="Edit"
              >
                <div class="timeline-content">
                  <h4>信息更新</h4>
                  <p>用户信息最后一次更新的时间</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-result
        icon="error"
        title="用户不存在"
        sub-title="请检查用户ID是否正确"
      >
        <template #extra>
          <el-button type="primary" @click="router.push('/admin/users')">
            返回用户列表
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  User,
  Edit,
  Delete,
  InfoFilled,
  Clock,
  Key,
} from "@element-plus/icons-vue";
import { useAdminManagerStore } from "~/stores/admin_manager";

// 设置页面元信息
definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();

// 状态管理
const adminStore = useAdminManagerStore();

// 响应式数据
const user = ref(null);
const loading = computed(() => adminStore.loading);
const userId = computed(() => route.params.id);

// 设置页面标题
useHead({
  title: computed(() => {
    if (user.value) {
      return `${user.value.nickname || user.value.username} - 用户详情 - ALCMS`;
    }
    return "用户详情 - ALCMS";
  }),
  meta: [{ name: "description", content: "ALCMS 用户详情页面" }],
});

// 获取用户详情
const fetchUserDetail = async () => {
  if (!userId.value) {
    return;
  }

  try {
    const userData = await adminStore.getUserById(userId.value);
    user.value = userData;
  } catch (error) {
    console.error("获取用户详情错误:", error);
    ElMessage.error("获取用户详情失败");
  }
};

// 编辑用户
const handleEditUser = () => {
  // TODO: 实现编辑用户功能
  ElMessage.info("编辑功能开发中");
};

// 删除用户
const handleDeleteUser = async () => {
  if (!user.value) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.value.nickname || user.value.username}" 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await adminStore.deleteUser(user.value.id);
    ElMessage.success("用户删除成功");
    router.push("/admin/users");
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除用户错误:", error);
      ElMessage.error("删除用户失败");
    }
  }
};

// 工具函数
const getRoleTagType = (role) => {
  const roleTypes = {
    admin: "danger",
    moderator: "warning",
    vip: "success",
    user: "info",
  };
  return roleTypes[role] || "info";
};

const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: "管理员",
    moderator: "版主",
    vip: "VIP",
    user: "普通用户",
  };
  return roleNames[role] || role;
};

const getStatusTagType = (status) => {
  const statusTypes = {
    active: "success",
    inactive: "danger",
    pending: "warning",
  };
  return statusTypes[status] || "info";
};

const getStatusDisplayName = (status) => {
  const statusNames = {
    active: "活跃",
    inactive: "禁用",
    pending: "待验证",
  };
  return statusNames[status] || status;
};

const formatTime = (timeString) => {
  if (!timeString) return "-";
  const date = new Date(timeString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUserDetail();
});

// 组件卸载时清理数据
onUnmounted(() => {
  adminStore.resetState();
});
</script>

<style scoped>
.user-detail-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  padding: 8px 16px;
}

.title-section {
  display: flex;
  flex-direction: column;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.page-description {
  font-size: 14px;
  color: #909399;
  margin: 4px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.loading-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.user-content {
  margin-top: 0;
}

.profile-card {
  margin-bottom: 24px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.profile-avatar {
  margin-bottom: 16px;
  border: 4px solid #f0f2f5;
}

.profile-info {
  width: 100%;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.profile-email {
  font-size: 14px;
  color: #909399;
  margin: 0 0 16px 0;
}

.profile-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.role-badge,
.status-badge {
  font-weight: 500;
}

.profile-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 0 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.detail-card,
.time-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.avatar-link {
  word-break: break-all;
}

.bio-text {
  line-height: 1.6;
  white-space: pre-wrap;
}

.timeline-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.timeline-content p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.error-container {
  background: white;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-detail-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-content {
    justify-content: flex-start;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .profile-stats {
    grid-template-columns: 1fr;
  }
}
</style>
