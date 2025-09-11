<template>
  <header class="admin-header">
    <!-- 左侧操作区 -->
    <div class="header-left">
      <!-- 侧边栏切换按钮 -->
      <el-button
        type="text"
        @click="$emit('toggle-sidebar')"
        class="sidebar-toggle"
      >
        <el-icon size="20"><Expand /></el-icon>
      </el-button>
      
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
        <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path" :to="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧操作区 -->
    <div class="header-right">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索功能..."
          :prefix-icon="Search"
          size="small"
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- 通知铃铛 -->
      <el-badge :value="notificationCount" class="notification-badge">
        <el-button type="text" @click="showNotifications">
          <el-icon size="18"><Bell /></el-icon>
        </el-button>
      </el-badge>

      <!-- 全屏切换 -->
      <el-button type="text" @click="toggleFullscreen" class="fullscreen-btn">
        <el-icon size="18"><FullScreen /></el-icon>
      </el-button>

      <!-- 用户下拉菜单 -->
      <el-dropdown @command="handleUserCommand" class="user-dropdown">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo.avatar" class="user-avatar">
            {{ userInfo.name.charAt(0) }}
          </el-avatar>
          <span class="username">{{ userInfo.name }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import {
  Expand,
  Search,
  Bell,
  FullScreen,
  ArrowDown,
  User,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 定义事件
const emit = defineEmits(['toggle-sidebar'])

// 当前路由
const route = useRoute()
const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 通知数量（假数据）
const notificationCount = ref(5)

// 用户信息（假数据）
const userInfo = reactive({
  name: '管理员',
  avatar: '',
  role: 'Administrator',
  email: 'admin@alcms.com',
  lastLogin: '2024-01-15 10:30:00'
})

// 面包屑导航
const breadcrumbItems = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const items = []
  
  // 根据路径生成面包屑
  if (pathSegments.length > 1) {
    const routeMap = {
      'articles': '文章管理',
      'categories': '分类管理',
      'tags': '标签管理',
      'media': '媒体库',
      'users': '用户管理',
      'roles': '角色权限',
      'permissions': '权限管理',
      'settings': '系统设置',
      'themes': '主题配置',
      'plugins': '插件管理',
      'backup': '数据备份',
      'analytics': '统计分析',
      'logs': '日志管理'
    }
    
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      const title = routeMap[segment] || segment
      items.push({
        path: '/' + pathSegments.slice(0, i + 1).join('/'),
        title
      })
    }
  }
  
  return items
})

// 搜索处理
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    ElMessage.info(`搜索: ${searchKeyword.value}`)
    // 这里可以实现实际的搜索逻辑
  }
}

// 显示通知
const showNotifications = () => {
  ElMessage.info('暂无新通知')
  // 这里可以打开通知面板
}

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 用户菜单命令处理
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('跳转到个人资料页面')
      break
    case 'settings':
      ElMessage.info('跳转到账户设置页面')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里可以调用实际的登出API
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

// 模拟通知数量变化
onMounted(() => {
  const interval = setInterval(() => {
    notificationCount.value = Math.floor(Math.random() * 10)
  }, 10000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.admin-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sidebar-toggle {
  padding: 8px;
  color: #606266;
}

.sidebar-toggle:hover {
  color: #409eff;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-box {
  margin-right: 10px;
}

.notification-badge {
  cursor: pointer;
}

.fullscreen-btn {
  padding: 8px;
  color: #606266;
}

.fullscreen-btn:hover {
  color: #409eff;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  background-color: #409eff;
}

.username {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
  transition: transform 0.3s;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-header {
    padding: 0 15px;
  }
  
  .search-box {
    display: none;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .username {
    display: none;
  }
}
</style>