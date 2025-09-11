<template>
  <aside class="admin-sidebar" :class="{ collapsed: collapsed }">
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <div class="logo">
        <el-icon v-if="collapsed" size="24"><Setting /></el-icon>
        <span v-else class="logo-text">ALCMS Admin</span>
      </div>
    </div>

    <!-- 导航菜单 -->
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="collapsed"
      :collapse-transition="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      router
    >
      <template v-for="item in menuItems" :key="item.index">
        <!-- 普通菜单项 -->
        <el-menu-item v-if="item.type === 'item'" :index="item.index">
          <el-icon><component :is="iconComponents[item.icon]" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
        
        <!-- 子菜单 -->
        <el-sub-menu v-else-if="item.type === 'submenu'" :index="item.index">
          <template #title>
            <el-icon><component :is="iconComponents[item.icon]" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item 
            v-for="child in item.children" 
            :key="child.index" 
            :index="child.index"
          >
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>

    <!-- 底部信息 -->
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="version-info">
        <p>版本: v1.0.0</p>
        <p>在线用户: {{ onlineUsers }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import {
  Setting,
  Document,
  User,
  Odometer,
  TrendCharts
} from '@element-plus/icons-vue'

// 当前路由
const route = useRoute()

// 定义props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

// 图标组件映射
const iconComponents = {
  Setting,
  Document,
  User,
  Odometer,
  TrendCharts
}

// 当前激活的菜单项
const activeMenu = computed(() => {
  return route.path
})

// 导航菜单数组
const menuItems = ref([
  {
    index: '/admin',
    title: '仪表盘',
    icon: 'Odometer',
    type: 'item'
  },
  {
    index: 'users',
    title: '用户管理',
    icon: 'User',
    type: 'submenu',
    children: [
      { index: '/admin/users', title: '用户列表' },
      { index: '/admin/roles', title: '角色权限' },
      { index: '/admin/permissions', title: '权限管理' }
    ]
  },
  /*
  {
    index: 'content',
    title: '内容管理',
    icon: 'Document',
    type: 'submenu',
    children: [
      { index: '/admin/articles', title: '文章管理' },
      { index: '/admin/categories', title: '分类管理' },
      { index: '/admin/tags', title: '标签管理' },
      { index: '/admin/media', title: '媒体库' }
    ]
  },
  {
    index: 'system',
    title: '系统设置',
    icon: 'Setting',
    type: 'submenu',
    children: [
      { index: '/admin/settings', title: '基本设置' },
      { index: '/admin/themes', title: '主题配置' },
      { index: '/admin/plugins', title: '插件管理' },
      { index: '/admin/backup', title: '数据备份' }
    ]
  },
  {
    index: '/admin/analytics',
    title: '统计分析',
    icon: 'TrendCharts',
    type: 'item'
  },
  */
  {
    index: '/admin/rearend',
    title: '接口文档',
    icon: 'Document',
    type: 'item'
  }
])

// 假数据 - 在线用户数
const onlineUsers = ref(128)

// 模拟实时更新在线用户数
onMounted(() => {
  const interval = setInterval(() => {
    onlineUsers.value = Math.floor(Math.random() * 200) + 50
  }, 5000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.admin-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 250px;
  background-color: #304156;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #434a50;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  color: #fff;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
}

.sidebar-menu {
  flex: 1;
  border: none;
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 250px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #434a50;
  background-color: #263445;
}

.version-info {
  color: #bfcbd9;
  font-size: 12px;
  text-align: center;
}

.version-info p {
  margin: 5px 0;
}

/* 自定义滚动条 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: #2c3e50;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #34495e;
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #4a6741;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }
  
  .admin-sidebar.mobile-show {
    transform: translateX(0);
  }
}
</style>