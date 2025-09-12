<template>
  <div class="user-filter">
    <el-card shadow="never" class="filter-card">
      <div class="filter-header">
        <div class="filter-title">
          <el-icon><Search /></el-icon>
          <span>搜索和筛选</span>
        </div>
        <div class="filter-actions">
          <el-button
            v-if="hasActiveFilters"
            type="info"
            size="small"
            :icon="RefreshLeft"
            @click="resetFilters"
          >
            重置
          </el-button>
          <el-button
            type="text"
            size="small"
            :icon="expanded ? 'ArrowUp' : 'ArrowDown'"
            @click="toggleExpanded"
          >
            {{ expanded ? '收起' : '展开' }}
          </el-button>
        </div>
      </div>
      
      <!-- 基础搜索 -->
      <div class="basic-search">
        <el-input
          v-model="localFilters.keyword"
          placeholder="搜索用户名、昵称、邮箱..."
          :prefix-icon="Search"
          clearable
          size="large"
          class="search-input"
          @input="handleSearch"
          @clear="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>
      
      <!-- 高级筛选 -->
      <el-collapse-transition>
        <div v-show="expanded" class="advanced-filters">
          <el-row :gutter="16">
            <!-- 用户角色 -->
            <el-col :xs="24" :sm="12" :md="6">
              <div class="filter-group">
                <label class="filter-label">用户角色</label>
                <el-select
                  v-model="localFilters.role"
                  placeholder="选择角色"
                  clearable
                  class="filter-select"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="role in roleOptions"
                    :key="role.value"
                    :label="role.label"
                    :value="role.value"
                  >
                    <div class="option-item">
                      <el-tag :type="getRoleTagType(role.value)" size="small">
                        {{ role.label }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </el-col>
            
            <!-- 账户状态 -->
            <el-col :xs="24" :sm="12" :md="6">
              <div class="filter-group">
                <label class="filter-label">账户状态</label>
                <el-select
                  v-model="localFilters.status"
                  placeholder="选择状态"
                  clearable
                  class="filter-select"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="status in statusOptions"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                  >
                    <div class="option-item">
                      <el-tag :type="getStatusTagType(status.value)" size="small">
                        {{ status.label }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </el-col>
            
            <!-- 注册时间范围 -->
            <el-col :xs="24" :sm="12" :md="6">
              <div class="filter-group">
                <label class="filter-label">注册时间</label>
                <el-date-picker
                  v-model="localFilters.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  class="filter-date"
                  @change="handleFilterChange"
                />
              </div>
            </el-col>
            
            <!-- 最后登录 -->
            <el-col :xs="24" :sm="12" :md="6">
              <div class="filter-group">
                <label class="filter-label">最后登录</label>
                <el-select
                  v-model="localFilters.lastLogin"
                  placeholder="选择时间范围"
                  clearable
                  class="filter-select"
                  @change="handleFilterChange"
                >
                  <el-option
                    v-for="option in lastLoginOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </div>
            </el-col>
          </el-row>
          
          <!-- 快速筛选标签 -->
          <div class="quick-filters">
            <div class="quick-filter-label">快速筛选：</div>
            <div class="quick-filter-tags">
              <el-tag
                v-for="tag in quickFilterTags"
                :key="tag.key"
                :type="isQuickFilterActive(tag) ? 'primary' : 'info'"
                :effect="isQuickFilterActive(tag) ? 'dark' : 'plain'"
                class="quick-tag"
                @click="toggleQuickFilter(tag)"
              >
                {{ tag.label }}
              </el-tag>
            </div>
          </div>
          
          <!-- 排序选项 -->
          <div class="sort-options">
            <div class="sort-label">排序方式：</div>
            <el-radio-group
              v-model="localFilters.sortBy"
              class="sort-radios"
              @change="handleFilterChange"
            >
              <el-radio-button
                v-for="sort in sortOptions"
                :key="sort.value"
                :value="sort.value"
              >
                {{ sort.label }}
              </el-radio-button>
            </el-radio-group>
            <el-radio-group
              v-model="localFilters.sortOrder"
              class="order-radios"
              @change="handleFilterChange"
            >
              <el-radio-button value="desc">降序</el-radio-button>
              <el-radio-button value="asc">升序</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </el-collapse-transition>
      
      <!-- 活跃筛选条件显示 -->
      <div v-if="activeFilterTags.length > 0" class="active-filters">
        <div class="active-filter-label">当前筛选：</div>
        <div class="active-filter-tags">
          <el-tag
            v-for="tag in activeFilterTags"
            :key="tag.key"
            type="primary"
            closable
            class="active-tag"
            @close="removeFilter(tag.key)"
          >
            {{ tag.label }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash-es'
import {
  Search, RefreshLeft
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:filters', 'search', 'filter-change'])

// 响应式数据
const expanded = ref(false)
const localFilters = ref({
  keyword: '',
  role: '',
  status: '',
  dateRange: null,
  lastLogin: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  ...props.filters
})

// 选项数据
const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '版主', value: 'moderator' },
  { label: 'VIP', value: 'vip' },
  { label: '普通用户', value: 'user' }
]

const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '禁用', value: 'inactive' },
  { label: '待验证', value: 'pending' }
]

const lastLoginOptions = [
  { label: '今天', value: 'today' },
  { label: '最近7天', value: 'week' },
  { label: '最近30天', value: 'month' },
  { label: '最近90天', value: 'quarter' },
  { label: '从未登录', value: 'never' }
]

const sortOptions = [
  { label: '注册时间', value: 'created_at' },
  { label: '最后登录', value: 'last_login_at' },
  { label: '用户名', value: 'username' },
  { label: '邮箱', value: 'email' }
]

const quickFilterTags = [
  { label: '新用户', key: 'new_users', filters: { dateRange: getDateRange(7) } },
  { label: '活跃用户', key: 'active_users', filters: { status: 'active', lastLogin: 'week' } },
  { label: '管理员', key: 'admins', filters: { role: 'admin' } },
  { label: '待验证', key: 'pending_users', filters: { status: 'pending' } },
  { label: '从未登录', key: 'never_login', filters: { lastLogin: 'never' } }
]

// 计算属性
const hasActiveFilters = computed(() => {
  return localFilters.value.keyword ||
         localFilters.value.role ||
         localFilters.value.status ||
         localFilters.value.dateRange ||
         localFilters.value.lastLogin ||
         localFilters.value.sortBy !== 'created_at' ||
         localFilters.value.sortOrder !== 'desc'
})

const activeFilterTags = computed(() => {
  const tags = []
  
  if (localFilters.value.keyword) {
    tags.push({ key: 'keyword', label: `关键词: ${localFilters.value.keyword}` })
  }
  
  if (localFilters.value.role) {
    const role = roleOptions.find(r => r.value === localFilters.value.role)
    tags.push({ key: 'role', label: `角色: ${role?.label}` })
  }
  
  if (localFilters.value.status) {
    const status = statusOptions.find(s => s.value === localFilters.value.status)
    tags.push({ key: 'status', label: `状态: ${status?.label}` })
  }
  
  if (localFilters.value.dateRange) {
    tags.push({ 
      key: 'dateRange', 
      label: `注册时间: ${localFilters.value.dateRange[0]} 至 ${localFilters.value.dateRange[1]}` 
    })
  }
  
  if (localFilters.value.lastLogin) {
    const lastLogin = lastLoginOptions.find(l => l.value === localFilters.value.lastLogin)
    tags.push({ key: 'lastLogin', label: `最后登录: ${lastLogin?.label}` })
  }
  
  return tags
})

// 防抖搜索
const debouncedSearch = debounce(() => {
  emit('search', localFilters.value)
}, 300)

// 事件处理
const handleSearch = () => {
  debouncedSearch()
}

const handleFilterChange = () => {
  emit('filter-change', localFilters.value)
}

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const resetFilters = () => {
  localFilters.value = {
    keyword: '',
    role: '',
    status: '',
    dateRange: null,
    lastLogin: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  }
  handleFilterChange()
}

const removeFilter = (key) => {
  switch (key) {
    case 'keyword':
      localFilters.value.keyword = ''
      break
    case 'role':
      localFilters.value.role = ''
      break
    case 'status':
      localFilters.value.status = ''
      break
    case 'dateRange':
      localFilters.value.dateRange = null
      break
    case 'lastLogin':
      localFilters.value.lastLogin = ''
      break
  }
  handleFilterChange()
}

const isQuickFilterActive = (tag) => {
  return Object.keys(tag.filters).every(key => {
    return JSON.stringify(localFilters.value[key]) === JSON.stringify(tag.filters[key])
  })
}

const toggleQuickFilter = (tag) => {
  if (isQuickFilterActive(tag)) {
    // 取消快速筛选
    Object.keys(tag.filters).forEach(key => {
      if (key === 'dateRange') {
        localFilters.value[key] = null
      } else {
        localFilters.value[key] = ''
      }
    })
  } else {
    // 应用快速筛选
    Object.assign(localFilters.value, tag.filters)
  }
  handleFilterChange()
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

const getStatusTagType = (status) => {
  const statusTypes = {
    active: 'success',
    inactive: 'danger',
    pending: 'warning'
  }
  return statusTypes[status] || 'info'
}

function getDateRange(days) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ]
}

// 监听外部筛选条件变化
watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters.value, newFilters)
}, { deep: true })

// 监听本地筛选条件变化
watch(localFilters, (newFilters) => {
  emit('update:filters', newFilters)
}, { deep: true })
</script>

<style scoped>
.user-filter {
  margin-bottom: 24px;
}

.filter-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.basic-search {
  margin-bottom: 16px;
}

.search-input {
  max-width: 500px;
}

.advanced-filters {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.filter-select,
.filter-date {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
}

.quick-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  flex-wrap: wrap;
}

.quick-filter-label {
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.quick-filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-tag:hover {
  transform: translateY(-1px);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.sort-label {
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.sort-radios,
.order-radios {
  display: flex;
  gap: 0;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.active-filter-label {
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.active-filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.active-tag {
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .filter-actions {
    justify-content: center;
  }
  
  .quick-filters,
  .sort-options,
  .active-filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .quick-filter-tags,
  .active-filter-tags {
    width: 100%;
  }
  
  .sort-radios,
  .order-radios {
    width: 100%;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-input-group__append) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

:deep(.el-input-group__append:hover) {
  background-color: var(--el-color-primary-dark-2);
  border-color: var(--el-color-primary-dark-2);
}

:deep(.el-radio-button__inner) {
  border-radius: 6px;
  margin-right: 8px;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 6px;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 6px;
}
</style>