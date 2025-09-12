<template>
  <div class="users-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><UserFilled /></el-icon>
          用户管理
        </h1>
        <p class="page-description">管理系统用户，查看用户信息和权限</p>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleCreateUser"
        >
          新增用户
        </el-button>
        <el-button
          :icon="Refresh"
          @click="refreshData"
          :loading="usersStore.loading"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选组件 -->
    <UserFilter
      v-model:filters="usersStore.filters"
      :loading="usersStore.loading"
      @search="handleSearch"
      @filter-change="handleFilterChange"
    />

    <!-- 用户表格组件 -->
    <UserTable
      :users="usersStore.users"
      :loading="usersStore.loading"
      @view-user="handleViewUser"
      @edit-user="handleEditUser"
      @delete-user="handleDeleteUser"
      @batch-edit="handleBatchEdit"
      @batch-delete="handleBatchDelete"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Plus,
  Search,
  Refresh,
  View,
  Edit,
  Delete,
  Clock,
  Calendar,
  Filter
} from '@element-plus/icons-vue'
import { useUsersStore } from '~/stores/users'
import UserFilter from '~/components/admin/UserFilter.vue'
import UserTable from '~/components/admin/UserTable.vue'

// 页面元信息
definePageMeta({
  title: '用户管理',
  layout: 'admin'
})

// 状态管理
const usersStore = useUsersStore()

// 响应式数据
const selectedUsers = ref([])

// 计算属性
const hasSelectedUsers = computed(() => selectedUsers.value.length > 0)

// 获取用户列表
const fetchUsers = async () => {
  await usersStore.fetchUsers()
}

// 事件处理
const handleSearch = () => {
  fetchUsers()
}

const refreshData = () => {
  fetchUsers()
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleCreateUser = () => {
  // TODO: 实现创建用户功能
  ElMessage.info('创建用户功能开发中')
}

const handleViewUser = (user) => {
  navigateTo(`/admin/users/${user.id}`)
}

const handleEditUser = (user) => {
  // TODO: 实现编辑用户功能
  ElMessage.info('编辑功能开发中')
}

const handleDeleteUser = async (user) => {
  await usersStore.deleteUser(user.id)
}

const handleBatchEdit = () => {
  // TODO: 实现批量编辑功能
  ElMessage.info('批量编辑功能开发中')
}

const handleBatchDelete = async () => {
  const userIds = selectedUsers.value.map(user => user.id)
  await usersStore.batchDeleteUsers(userIds)
  selectedUsers.value = []
}

const handleSortChange = ({ prop, order }) => {
  usersStore.setSortBy(prop, order)
  fetchUsers()
}

const handleFilterChange = (filters) => {
  usersStore.setFilters(filters)
  fetchUsers()
}



// 组件挂载时获取数据
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .users-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>