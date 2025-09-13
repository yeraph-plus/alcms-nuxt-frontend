<template>
  <div class="users-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-title">
        <h2>用户管理</h2>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreateUser">
          新增用户
        </el-button>
        <el-button
          :icon="Refresh"
          @click="refreshData"
          :loading="adminStore.loading"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 简化的筛选区域 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="16" class="filter-row">
        <!-- 搜索框 -->
        <el-col :xs="24" :sm="12" :md="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户名、昵称、邮箱..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </el-col>

        <!-- 角色筛选 -->
        <el-col :xs="24" :sm="6" :md="4">
          <el-select
            v-model="selectedRole"
            placeholder="选择角色"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="版主" value="moderator" />
            <el-option label="VIP" value="vip" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-col>

        <!-- 状态筛选 -->
        <el-col :xs="24" :sm="6" :md="4">
          <el-select
            v-model="selectedStatus"
            placeholder="选择状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="待验证" value="pending" />
          </el-select>
        </el-col>

        <!-- 重置按钮 -->
        <el-col :xs="24" :sm="24" :md="8">
          <div class="filter-actions">
            <el-button
              v-if="hasActiveFilters"
              type="info"
              :icon="RefreshLeft"
              @click="resetFilters"
            >
              重置筛选
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户表格 -->
    <div class="user-table">
      <el-table
        :data="adminStore.users"
        v-loading="adminStore.loading"
        stripe
        border
        class="users-table"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <!-- 多选列 -->
        <el-table-column type="selection" width="55" align="center" />

        <!-- 用户头像和基本信息 -->
        <el-table-column
          label="用户信息"
          min-width="200"
          prop="username"
          sortable="custom"
        >
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.avatar_url" :size="40" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-details">
                <div class="user-name">
                  <el-link
                    :href="`/admin/users/${row.id}`"
                    type="primary"
                    class="username-link"
                  >
                    {{ row.nickname || row.username }}
                  </el-link>
                </div>
                <div class="user-meta">
                  <span class="user-id">#{{ row.id }}</span>
                  <span class="separator">•</span>
                  <span class="username">{{ row.username }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 邮箱 -->
        <el-table-column
          label="邮箱"
          prop="email"
          min-width="180"
          sortable="custom"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-text class="email-text">
              {{ row.email }}
            </el-text>
          </template>
        </el-table-column>

        <!-- 角色 -->
        <el-table-column
          label="角色"
          prop="role"
          width="100"
          align="center"
          sortable="custom"
        >
          <template #default="{ row }">
            <el-tag
              :type="getRoleTagType(row.role)"
              size="small"
              class="role-tag"
            >
              {{ getRoleDisplayName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column
          label="状态"
          prop="status"
          width="100"
          align="center"
          sortable="custom"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
              class="status-tag"
            >
              {{ getStatusDisplayName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 最后登录 -->
        <el-table-column
          label="最后登录"
          prop="last_login_at"
          width="160"
          align="center"
          sortable="custom"
        >
          <template #default="{ row }">
            <div class="time-info">
              <el-text v-if="row.last_login_at" size="small">
                {{ formatTime(row.last_login_at) }}
              </el-text>
              <el-text v-else type="info" size="small"> 从未登录 </el-text>
            </div>
          </template>
        </el-table-column>

        <!-- 注册时间 -->
        <el-table-column
          label="注册时间"
          prop="created_at"
          width="160"
          align="center"
          sortable="custom"
        >
          <template #default="{ row }">
            <div class="time-info">
              <el-text size="small">
                {{ formatTime(row.created_at) }}
              </el-text>
            </div>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                :icon="View"
                @click="handleViewUser(row)"
                link
              >
                查看
              </el-button>
              <el-button
                type="warning"
                size="small"
                :icon="Edit"
                @click="handleEditUser(row)"
                link
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                @click="handleDeleteUser(row)"
                link
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作栏 -->
      <div v-if="selectedUsers.length > 0" class="batch-actions">
        <div class="batch-info">
          <el-text>
            已选择 <strong>{{ selectedUsers.length }}</strong> 个用户
          </el-text>
        </div>
        <div class="batch-buttons">
          <el-button
            type="warning"
            size="small"
            :icon="Edit"
            @click="handleBatchEdit"
          >
            批量编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button size="small" @click="clearSelection"> 取消选择 </el-button>
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="paginationData.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增用户 -->
    <CreateUserDialog
      v-model:visible="createUserDialogVisible"
      @success="handleCreateUserSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  User,
  Plus,
  Search,
  Refresh,
  RefreshLeft,
  View,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import { useAdminManagerStore } from "~/stores/admin_manager";
import { debounce } from "lodash-es";
import CreateUserDialog from "~/components/admin/user/CreateUserDialog.vue";

// 页面元信息
useHead({
  title: "ALCMS - 仪表盘 - 用户管理",
});

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// 状态管理
const adminStore = useAdminManagerStore();
const createUserDialogVisible = ref(false);

// 响应式数据
const selectedUsers = ref([]);
const searchKeyword = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");
const currentPage = ref(1);
const pageSize = ref(20);

// 计算属性
const hasActiveFilters = computed(() => {
  return searchKeyword.value || selectedRole.value || selectedStatus.value;
});

const paginationData = computed(() => {
  return (
    adminStore.pagination || {
      total: 0,
      current_page: 1,
      per_page: 20,
      last_page: 1,
    }
  );
});

// 防抖搜索
const debouncedSearch = debounce(() => {
  applyFilters();
}, 300);

// 应用筛选条件
const applyFilters = async () => {
  adminStore.setFilters({
    search: searchKeyword.value,
    role: selectedRole.value,
    status: selectedStatus.value,
    page: currentPage.value,
    limit: pageSize.value,
  });
  await fetchUsers();
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    await adminStore.getUserList();
  } catch (error) {
    console.error("获取用户列表错误:", error);
    ElMessage.error("获取用户列表失败");
  }
};

// 事件处理
const handleSearch = () => {
  currentPage.value = 1;
  debouncedSearch();
};

const handleFilterChange = () => {
  currentPage.value = 1;
  applyFilters();
};

const resetFilters = () => {
  searchKeyword.value = "";
  selectedRole.value = "";
  selectedStatus.value = "";
  currentPage.value = 1;
  adminStore.resetFilters();
  fetchUsers();
};

const refreshData = () => {
  fetchUsers();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  applyFilters();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  applyFilters();
};

const handleSortChange = ({ prop, order }) => {
  // 如果需要排序功能，可以在这里实现
  console.log("排序变化:", { prop, order });
};

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

// 清除选择
const clearSelection = () => {
  selectedUsers.value = [];
};

// 创建新用户的组件
const handleCreateUser = () => {
  createUserDialogVisible.value = true;
};

const handleViewUser = (user) => {
  navigateTo(`/admin/users/${user.id}`);
};

const handleEditUser = (user) => {
  ElMessage.info("编辑功能开发中");
};

const handleDeleteUser = async (user) => {
  try {
    // 添加调试日志
    console.log("删除用户 - 原始user对象:", user);
    console.log("删除用户 - user.id值:", user.id);
    console.log("删除用户 - user.id类型:", typeof user.id);
    console.log("删除用户 - 是否为NaN:", Number.isNaN(user.id));

    // 验证id是否有效
    if (!user.id || Number.isNaN(Number(user.id))) {
      ElMessage.error("用户ID无效，无法删除");
      return;
    }

    await ElMessageBox.confirm(
      `确定要删除用户 "${user.nickname || user.username}" 吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    // 确保传递的是数字类型的ID
    const userId = Number(user.id);
    await adminStore.deleteUser(userId);
    ElMessage.success("删除成功");
    await fetchUsers();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除用户错误:", error);
      ElMessage.error("删除失败");
    }
  }
};

const handleBatchEdit = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning("请先选择要编辑的用户");
    return;
  }
  ElMessage.info("批量编辑功能开发中");
};

const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning("请先选择要删除的用户");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复。`,
      "批量删除确认",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger",
      }
    );
    ElMessage.info("批量删除功能开发中");
  } catch {
    // 用户取消删除
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
    normal: "success",
    banned: "arning",
    frozen: "wdanger",
  };
  return statusTypes[status] || "info";
};

const getStatusDisplayName = (status) => {
  const statusNames = {
    normal: "活跃",
    banned: "禁用",
    frozen: "待验证",
  };
  return statusNames[status] || status;
};

const formatTime = (timeString) => {
  if (!timeString) return "-";
  const date = new Date(timeString);
  const now = new Date();
  const diff = now - date;

  // 小于1分钟
  if (diff < 60000) {
    return "刚刚";
  }

  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }

  // 小于1天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }

  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }

  // 超过7天显示具体日期
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 监听筛选条件变化
watch([searchKeyword, selectedRole, selectedStatus], () => {
  // 这里可以添加额外的逻辑
});

// 页面加载时获取数据
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-radius: 8px;
}

.header-title h2 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-row {
  align-items: flex-end;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  height: 32px;
  align-items: center;
}

.user-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-table {
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin-bottom: 4px;
}

.username-link {
  font-weight: 600;
  text-decoration: none;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.user-id {
  font-weight: 500;
}

.separator {
  color: #cbd5e1;
}

.username {
  color: #64748b;
}

.email-text {
  color: #374151;
}

.role-tag,
.status-tag {
  font-weight: 500;
}

.time-info {
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.batch-info {
  color: #374151;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .users-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .batch-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .batch-buttons {
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }

  .user-info {
    gap: 8px;
  }

  .user-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-table) {
  border-radius: 0;
}

:deep(.el-table__header) {
  background-color: #f8fafc;
}

:deep(.el-table th) {
  background-color: #f8fafc !important;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f1f5f9;
}

:deep(.el-table__row:hover > td) {
  background-color: #f8fafc !important;
}

:deep(.el-table__row.el-table__row--striped > td) {
  background-color: #fafbfc;
}

:deep(.el-table__row.el-table__row--striped:hover > td) {
  background-color: #f8fafc !important;
}
</style>
