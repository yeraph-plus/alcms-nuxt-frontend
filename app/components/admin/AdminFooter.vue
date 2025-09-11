<template>
  <footer class="admin-footer">
    <div class="footer-content">
      <!-- 左侧版权信息 -->
      <div class="footer-left">
        <p class="copyright">
          &copy; {{ currentYear }} ALCMS. All rights reserved.
        </p>
        <p class="version">
          版本 {{ version }} | 构建时间: {{ buildTime }}
        </p>
      </div>

      <!-- 右侧系统信息 -->
      <div class="footer-right">
        <div class="system-info">
          <el-tag size="small" type="success" class="info-tag">
            <el-icon><Monitor /></el-icon>
            系统运行正常
          </el-tag>
          <el-tag size="small" type="info" class="info-tag">
            <el-icon><Timer /></el-icon>
            运行时间: {{ uptime }}
          </el-tag>
          <el-tag size="small" type="warning" class="info-tag">
            <el-icon><Connection /></el-icon>
            在线: {{ onlineUsers }} 人
          </el-tag>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Monitor, Timer, Connection } from '@element-plus/icons-vue'

// 当前年份
const currentYear = new Date().getFullYear()

// 版本信息
const version = ref('1.0.0')

// 构建时间
const buildTime = ref('2024-01-15 14:30:25')

// 系统运行时间
const uptime = ref('0天0小时0分钟')

// 在线用户数
const onlineUsers = ref(128)

// 计算运行时间
const calculateUptime = () => {
  // 模拟系统启动时间（假设系统在1小时前启动）
  const startTime = new Date(Date.now() - 3600000) // 1小时前
  const now = new Date()
  const diff = now - startTime
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  uptime.value = `${days}天${hours}小时${minutes}分钟`
}

// 更新在线用户数
const updateOnlineUsers = () => {
  onlineUsers.value = Math.floor(Math.random() * 200) + 50
}

// 组件挂载时启动定时器
onMounted(() => {
  // 立即计算一次
  calculateUptime()
  updateOnlineUsers()
  
  // 每分钟更新运行时间
  const uptimeInterval = setInterval(calculateUptime, 60000)
  
  // 每30秒更新在线用户数
  const usersInterval = setInterval(updateOnlineUsers, 30000)
  
  // 组件卸载时清理定时器
  onUnmounted(() => {
    clearInterval(uptimeInterval)
    clearInterval(usersInterval)
  })
})
</script>

<style scoped>
.admin-footer {
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 15px 20px;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.copyright {
  margin: 0;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.version {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.footer-right {
  display: flex;
  align-items: center;
}

.system-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.info-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}

.info-tag .el-icon {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .footer-left {
    align-items: center;
  }
  
  .system-info {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .info-tag {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .admin-footer {
    padding: 10px 15px;
  }
  
  .system-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .copyright {
    font-size: 12px;
  }
  
  .version {
    font-size: 11px;
  }
}
</style>