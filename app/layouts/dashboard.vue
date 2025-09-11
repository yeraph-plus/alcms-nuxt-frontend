<template>
  <div class="dashboard-layout">
    <!-- 左侧边栏 -->
    <AdminSidebar :collapsed="sidebarCollapsed" />
    
    <!-- 主要内容区域 -->
    <div class="main-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 顶部导航 -->
      <AdminHeader @toggle-sidebar="toggleSidebar" />
      
      <!-- 页面内容 -->
      <main class="content-wrapper">
        <div class="content-container">
          <slot />
        </div>
      </main>
      
      <!-- 页脚 -->
      <AdminFooter />
    </div>
  </div>
</template>

<script setup>
// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 页面元数据
useHead({
  title: 'ALCMS Admin',
  meta: [
    { name: 'description', content: '后台页面' }
  ]
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.main-container.sidebar-collapsed {
  margin-left: 64px;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    margin-left: 0;
  }
  
  .main-container.sidebar-collapsed {
    margin-left: 0;
  }
}
</style>