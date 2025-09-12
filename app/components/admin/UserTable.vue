<template>
  <div class="user-table">
    <el-table
      :data="users"
      v-loading="loading"
      stripe
      border
      class="users-table"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 多选列 -->
      <el-table-column
        type="selection"
        width="55"
        align="center"
      />
      
      <!-- 用户头像和基本信息 -->
      <el-table-column
        label="用户信息"
        min-width="200"
        prop="username"
        sortable="custom"
      >
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar
              :src="row.avatar_url"
              :size="40"
              class="user-avatar"
            >
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
            <el-text v-else type="info" size="small">
              从未登录
            </el-text>
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
      <el-table-column
        label="操作"
        width="180"
        align="center"
        fixed="right"
      >
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
        <el-button
          size="small"
          @click="clearSelection"
        >
          取消选择
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, View, Edit, Delete
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'view-user',
  'edit-user', 
  'delete-user',
  'batch-edit',
  'batch-delete',
  'sort-change',
  'selection-change'
])

// 响应式数据
const selectedUsers = ref([])

// 选择变化处理
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
  emit('selection-change', selection)
}

// 排序变化处理
const handleSortChange = ({ column, prop, order }) => {
  emit('sort-change', { column, prop, order })
}

// 清除选择
const clearSelection = () => {
  selectedUsers.value = []
  emit('selection-change', [])
}

// 单个用户操作
const handleViewUser = (user) => {
  emit('view-user', user)
}

const handleEditUser = (user) => {
  emit('edit-user', user)
}

const handleDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.nickname || user.username}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('delete-user', user)
  } catch {
    // 用户取消删除
  }
}

// 批量操作
const handleBatchEdit = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要编辑的用户')
    return
  }
  emit('batch-edit', selectedUsers.value)
}

const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    emit('batch-delete', selectedUsers.value)
  } catch {
    // 用户取消删除
  }
}

// 工具函数
const getRoleTagType = (role) => {
  const roleTypes = {
    admin: 'danger',
    moderator: 'warning', 
    vip: 'success',
    user: 'info'
  }
  return roleTypes[role] || 'info'
}

const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: '管理员',
    moderator: '版主',
    vip: 'VIP',
    user: '普通用户'
  }
  return roleNames[role] || role
}

const getStatusTagType = (status) => {
  const statusTypes = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning'
  }
  return statusTypes[status] || 'info'
}

const getStatusDisplayName = (status) => {
  const statusNames = {
    active: '活跃',
    inactive: '禁用', 
    pending: '待验证'
  }
  return statusNames[status] || status
}

const formatTime = (timeString) => {
  if (!timeString) return '-'
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  
  // 小于1天
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  
  // 超过7天显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

<style scoped>
.user-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
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

/* 响应式设计 */
@media (max-width: 768px) {
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