<template>
  <el-card 
    :class="['user-card', { 'user-card--selected': selected }]"
    shadow="hover"
    @click="handleCardClick"
  >
    <div class="user-card__header">
      <div class="user-avatar-section">
        <el-avatar
          :src="user.avatar_url"
          :size="size === 'large' ? 80 : size === 'medium' ? 60 : 40"
          class="user-avatar"
        >
          <el-icon :size="size === 'large' ? 40 : size === 'medium' ? 30 : 20">
            <User />
          </el-icon>
        </el-avatar>
        
        <!-- 在线状态指示器 -->
        <div v-if="showOnlineStatus" class="online-indicator">
          <el-badge
            :type="isOnline ? 'success' : 'info'"
            is-dot
            class="online-badge"
          />
        </div>
      </div>
      
      <div class="user-info">
        <div class="user-name">
          <h3 class="name-text">{{ user.nickname || user.username }}</h3>
          <div class="user-badges">
            <el-tag
              :type="getRoleTagType(user.role)"
              size="small"
              class="role-badge"
            >
              {{ getRoleDisplayName(user.role) }}
            </el-tag>
            <el-tag
              :type="getStatusTagType(user.status)"
              size="small"
              class="status-badge"
            >
              {{ getStatusDisplayName(user.status) }}
            </el-tag>
          </div>
        </div>
        
        <div class="user-meta">
          <div class="meta-item">
            <el-icon class="meta-icon"><Message /></el-icon>
            <span class="meta-text">{{ user.email }}</span>
          </div>
          <div class="meta-item">
            <el-icon class="meta-icon"><Calendar /></el-icon>
            <span class="meta-text">{{ formatJoinDate(user.created_at) }}</span>
          </div>
          <div v-if="user.last_login_at" class="meta-item">
            <el-icon class="meta-icon"><Clock /></el-icon>
            <span class="meta-text">{{ formatLastLogin(user.last_login_at) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="showActions" class="user-actions">
        <el-dropdown trigger="click" @command="handleActionCommand">
          <el-button
            type="text"
            :icon="MoreFilled"
            class="action-trigger"
            @click.stop
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="view" :icon="View">
                查看详情
              </el-dropdown-item>
              <el-dropdown-item command="edit" :icon="Edit">
                编辑用户
              </el-dropdown-item>
              <el-dropdown-item 
                command="toggle-status" 
                :icon="user.status === 'active' ? 'Lock' : 'Unlock'"
              >
                {{ user.status === 'active' ? '禁用用户' : '启用用户' }}
              </el-dropdown-item>
              <el-dropdown-item 
                command="delete" 
                :icon="Delete"
                class="danger-item"
                divided
              >
                删除用户
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 用户简介 -->
    <div v-if="user.bio && showBio" class="user-bio">
      <el-text class="bio-text" :line-clamp="2">
        {{ user.bio }}
      </el-text>
    </div>
    
    <!-- 统计信息 -->
    <div v-if="showStats" class="user-stats">
      <div class="stat-item">
        <div class="stat-value">{{ user.posts_count || 0 }}</div>
        <div class="stat-label">文章</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ user.comments_count || 0 }}</div>
        <div class="stat-label">评论</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ user.likes_count || 0 }}</div>
        <div class="stat-label">点赞</div>
      </div>
    </div>
    
    <!-- 快速操作按钮 -->
    <div v-if="showQuickActions" class="quick-actions">
      <el-button
        type="primary"
        size="small"
        :icon="View"
        @click.stop="handleView"
      >
        查看
      </el-button>
      <el-button
        type="warning"
        size="small"
        :icon="Edit"
        @click.stop="handleEdit"
      >
        编辑
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, Message, Calendar, Clock, MoreFilled,
  View, Edit, Delete
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  selected: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showQuickActions: {
    type: Boolean,
    default: false
  },
  showBio: {
    type: Boolean,
    default: true
  },
  showStats: {
    type: Boolean,
    default: false
  },
  showOnlineStatus: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'click',
  'view',
  'edit',
  'delete',
  'toggle-status'
])

// 计算属性
const isOnline = computed(() => {
  // 这里可以根据实际业务逻辑判断用户是否在线
  // 比如根据最后活动时间
  if (!props.user.last_login_at) return false
  const lastLogin = new Date(props.user.last_login_at)
  const now = new Date()
  const diffMinutes = (now - lastLogin) / (1000 * 60)
  return diffMinutes < 30 // 30分钟内活动视为在线
})

// 事件处理
const handleCardClick = () => {
  if (props.clickable) {
    emit('click', props.user)
  }
}

const handleActionCommand = (command) => {
  switch (command) {
    case 'view':
      handleView()
      break
    case 'edit':
      handleEdit()
      break
    case 'toggle-status':
      handleToggleStatus()
      break
    case 'delete':
      handleDelete()
      break
  }
}

const handleView = () => {
  emit('view', props.user)
}

const handleEdit = () => {
  emit('edit', props.user)
}

const handleToggleStatus = async () => {
  const action = props.user.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${props.user.nickname || props.user.username}" 吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    emit('toggle-status', props.user)
  } catch {
    // 用户取消操作
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${props.user.nickname || props.user.username}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    emit('delete', props.user)
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

const formatJoinDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `加入于 ${date.toLocaleDateString('zh-CN')}`
}

const formatLastLogin = (dateString) => {
  if (!dateString) return '从未登录'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚活跃'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前活跃`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前活跃`
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前活跃`
  } else {
    return `最后登录 ${date.toLocaleDateString('zh-CN')}`
  }
}
</script>

<style scoped>
.user-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.user-card--selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
}

.user-card__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.user-avatar-section {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  border: 3px solid #f1f5f9;
  transition: border-color 0.3s ease;
}

.user-card:hover .user-avatar {
  border-color: var(--el-color-primary-light-5);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
}

.online-badge {
  transform: scale(1.2);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin-bottom: 8px;
}

.name-text {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.user-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.role-badge,
.status-badge {
  font-weight: 500;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.meta-icon {
  font-size: 14px;
  color: #94a3b8;
}

.meta-text {
  line-height: 1;
}

.user-actions {
  flex-shrink: 0;
}

.action-trigger {
  padding: 8px;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s ease;
}

.action-trigger:hover {
  background-color: #f1f5f9;
  color: #374151;
}

.user-bio {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid var(--el-color-primary-light-5);
}

.bio-text {
  color: #4b5563;
  line-height: 1.5;
  font-size: 14px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 尺寸变体 */
.user-card--small .user-card__header {
  gap: 12px;
  margin-bottom: 12px;
}

.user-card--small .name-text {
  font-size: 16px;
}

.user-card--small .meta-item {
  font-size: 12px;
}

.user-card--large .user-card__header {
  gap: 20px;
  margin-bottom: 20px;
}

.user-card--large .name-text {
  font-size: 20px;
}

.user-card--large .meta-item {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-card__header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .user-actions {
    align-self: flex-end;
  }
  
  .user-badges {
    justify-content: center;
  }
  
  .quick-actions {
    flex-direction: column;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-dropdown-menu__item.danger-item) {
  color: var(--el-color-danger);
}

:deep(.el-dropdown-menu__item.danger-item:hover) {
  background-color: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
</style>