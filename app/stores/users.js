import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export const useUsersStore = defineStore('users', () => {
  // 状态
  const users = ref([])
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  
  const filters = ref({
    keyword: '',
    role: '',
    status: '',
    dateRange: null,
    lastLogin: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  const selectedUsers = ref([])
  const currentUser = ref(null)
  const userDetailLoading = ref(false)
  
  // 计算属性
  const hasUsers = computed(() => users.value.length > 0)
  const hasSelectedUsers = computed(() => selectedUsers.value.length > 0)
  const selectedUserIds = computed(() => selectedUsers.value.map(user => user.id))
  
  const paginationInfo = computed(() => {
    const { page, limit, total, totalPages } = pagination.value
    const start = (page - 1) * limit + 1
    const end = Math.min(page * limit, total)
    return {
      start,
      end,
      total,
      page,
      totalPages
    }
  })
  
  // Actions
  const { callEndpoint } = useApi()
  
  // 获取用户列表
  const fetchUsers = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters.value,
        ...params
      }
      
      // 处理日期范围
      if (queryParams.dateRange && Array.isArray(queryParams.dateRange)) {
        queryParams.start_date = queryParams.dateRange[0]
        queryParams.end_date = queryParams.dateRange[1]
        delete queryParams.dateRange
      }
      
      // 移除空值
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key]
        }
      })
      
      const response = await callEndpoint('users.list', {
        method: 'GET',
        data: queryParams
      })
      
      if (response.success && response.data) {
        users.value = response.data.items || []
        
        // 更新分页信息
        if (response.data.pagination) {
          pagination.value = {
            ...pagination.value,
            ...response.data.pagination
          }
        }
        
        return response
      } else {
        ElMessage.error(response.message || '获取用户列表失败')
        return response
      }
    } catch (error) {
      console.error('获取用户列表错误:', error)
      ElMessage.error('获取用户列表失败')
      return { success: false, message: '获取用户列表失败' }
    } finally {
      loading.value = false
    }
  }
  
  // 获取用户详情
  const fetchUserDetail = async (userId) => {
    if (!userId) {
      ElMessage.error('用户ID无效')
      return { success: false, message: '用户ID无效' }
    }
    
    userDetailLoading.value = true
    try {
      const response = await callEndpoint('users.detail', {
        method: 'GET',
        data: { id: userId }
      })
      
      if (response.success && response.data) {
        currentUser.value = response.data
        return response
      } else {
        ElMessage.error(response.message || '获取用户详情失败')
        return response
      }
    } catch (error) {
      console.error('获取用户详情错误:', error)
      ElMessage.error('获取用户详情失败')
      return { success: false, message: '获取用户详情失败' }
    } finally {
      userDetailLoading.value = false
    }
  }
  
  // 创建用户
  const createUser = async (userData) => {
    loading.value = true
    try {
      const response = await callEndpoint('users.create', {
        method: 'POST',
        data: userData
      })
      
      if (response.success) {
        ElMessage.success(response.message || '用户创建成功')
        // 刷新用户列表
        await fetchUsers()
        return response
      } else {
        ElMessage.error(response.message || '用户创建失败')
        return response
      }
    } catch (error) {
      console.error('创建用户错误:', error)
      ElMessage.error('用户创建失败')
      return { success: false, message: '用户创建失败' }
    } finally {
      loading.value = false
    }
  }
  
  // 更新用户
  const updateUser = async (userId, userData) => {
    loading.value = true
    try {
      const response = await callEndpoint('users.update', {
        method: 'PUT',
        data: { id: userId, ...userData }
      })
      
      if (response.success) {
        ElMessage.success(response.message || '用户更新成功')
        
        // 更新本地用户数据
        const userIndex = users.value.findIndex(user => user.id === userId)
        if (userIndex !== -1) {
          users.value[userIndex] = { ...users.value[userIndex], ...userData }
        }
        
        // 如果是当前查看的用户，也更新详情
        if (currentUser.value && currentUser.value.id === userId) {
          currentUser.value = { ...currentUser.value, ...userData }
        }
        
        return response
      } else {
        ElMessage.error(response.message || '用户更新失败')
        return response
      }
    } catch (error) {
      console.error('更新用户错误:', error)
      ElMessage.error('用户更新失败')
      return { success: false, message: '用户更新失败' }
    } finally {
      loading.value = false
    }
  }
  
  // 删除用户
  const deleteUser = async (userId) => {
    loading.value = true
    try {
      const response = await callEndpoint('users.delete', {
        method: 'DELETE',
        data: { id: userId }
      })
      
      if (response.success) {
        ElMessage.success(response.message || '用户删除成功')
        
        // 从本地列表中移除
        users.value = users.value.filter(user => user.id !== userId)
        
        // 如果删除的是当前查看的用户，清空详情
        if (currentUser.value && currentUser.value.id === userId) {
          currentUser.value = null
        }
        
        // 从选中列表中移除
        selectedUsers.value = selectedUsers.value.filter(user => user.id !== userId)
        
        return response
      } else {
        ElMessage.error(response.message || '用户删除失败')
        return response
      }
    } catch (error) {
      console.error('删除用户错误:', error)
      ElMessage.error('用户删除失败')
      return { success: false, message: '用户删除失败' }
    } finally {
      loading.value = false
    }
  }
  
  // 批量删除用户
  const batchDeleteUsers = async (userIds) => {
    if (!userIds || userIds.length === 0) {
      ElMessage.warning('请选择要删除的用户')
      return { success: false, message: '请选择要删除的用户' }
    }
    
    loading.value = true
    try {
      const response = await callEndpoint('users.batchDelete', {
        method: 'DELETE',
        data: { ids: userIds }
      })
      
      if (response.success) {
        ElMessage.success(response.message || `成功删除 ${userIds.length} 个用户`)
        
        // 从本地列表中移除
        users.value = users.value.filter(user => !userIds.includes(user.id))
        
        // 清空选中列表
        selectedUsers.value = []
        
        // 如果删除的包含当前查看的用户，清空详情
        if (currentUser.value && userIds.includes(currentUser.value.id)) {
          currentUser.value = null
        }
        
        return response
      } else {
        ElMessage.error(response.message || '批量删除用户失败')
        return response
      }
    } catch (error) {
      console.error('批量删除用户错误:', error)
      ElMessage.error('批量删除用户失败')
      return { success: false, message: '批量删除用户失败' }
    } finally {
      loading.value = false
    }
  }
  
  // 切换用户状态
  const toggleUserStatus = async (userId, newStatus) => {
    try {
      const response = await callEndpoint('users.updateStatus', {
        method: 'PATCH',
        data: { id: userId, status: newStatus }
      })
      
      if (response.success) {
        const statusText = newStatus === 'active' ? '启用' : '禁用'
        ElMessage.success(response.message || `用户${statusText}成功`)
        
        // 更新本地用户状态
        const userIndex = users.value.findIndex(user => user.id === userId)
        if (userIndex !== -1) {
          users.value[userIndex].status = newStatus
        }
        
        // 如果是当前查看的用户，也更新详情
        if (currentUser.value && currentUser.value.id === userId) {
          currentUser.value.status = newStatus
        }
        
        return response
      } else {
        ElMessage.error(response.message || '用户状态更新失败')
        return response
      }
    } catch (error) {
      console.error('切换用户状态错误:', error)
      ElMessage.error('用户状态更新失败')
      return { success: false, message: '用户状态更新失败' }
    }
  }
  
  // 搜索用户
  const searchUsers = async (searchFilters) => {
    // 更新筛选条件
    Object.assign(filters.value, searchFilters)
    
    // 重置到第一页
    pagination.value.page = 1
    
    // 获取用户列表
    return await fetchUsers()
  }
  
  // 设置分页
  const setPagination = async (page, limit) => {
    pagination.value.page = page
    if (limit) {
      pagination.value.limit = limit
    }
    return await fetchUsers()
  }
  
  // 设置筛选条件
  const setFilters = async (newFilters) => {
    Object.assign(filters.value, newFilters)
    pagination.value.page = 1 // 重置到第一页
    return await fetchUsers()
  }
  
  // 设置选中用户
  const setSelectedUsers = (users) => {
    selectedUsers.value = users
  }
  
  // 清空选中用户
  const clearSelectedUsers = () => {
    selectedUsers.value = []
  }
  
  // 重置筛选条件
  const resetFilters = async () => {
    filters.value = {
      keyword: '',
      role: '',
      status: '',
      dateRange: null,
      lastLogin: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    }
    pagination.value.page = 1
    return await fetchUsers()
  }
  
  // 刷新用户列表
  const refreshUsers = async () => {
    return await fetchUsers()
  }
  
  // 清空当前用户详情
  const clearCurrentUser = () => {
    currentUser.value = null
  }
  
  return {
    // 状态
    users,
    loading,
    pagination,
    filters,
    selectedUsers,
    currentUser,
    userDetailLoading,
    
    // 计算属性
    hasUsers,
    hasSelectedUsers,
    selectedUserIds,
    paginationInfo,
    
    // 方法
    fetchUsers,
    fetchUserDetail,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    toggleUserStatus,
    searchUsers,
    setPagination,
    setFilters,
    setSelectedUsers,
    clearSelectedUsers,
    resetFilters,
    refreshUsers,
    clearCurrentUser
  }
})