<template>
  <div class="dashboard-layout">
    <!-- 左侧边栏 -->
    <AdminSidebar :collapsed="sidebarCollapsed" />

    <!-- 主要内容区域 -->
    <div
      class="main-container"
      :style="{ marginLeft: currentSidebarWidth + 'px' }"
    >
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
// 侧边栏配置
const sidebarCollapsed = ref(false);

// 计算当前侧边栏宽度
const currentSidebarWidth = computed(() => {
  return sidebarCollapsed.value ? 64 : 250;
});

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// 响应式处理
const { width } = useWindowSize();
watch(width, (newWidth) => {
  if (newWidth < 768) {
    sidebarCollapsed.value = true;
  }
});

// 页面元数据
useHead({
  title: "ALCMS Admin",
  meta: [{ name: "description", content: "后台页面" }],
});
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-container {
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-container {
    margin-left: 0 !important;
    width: 100%;
  }
}
</style>
