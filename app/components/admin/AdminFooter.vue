<template>
  <footer class="admin-footer">
    <div class="footer-content">
      <!-- 左侧版权信息 -->
      <div class="footer-left">
        <p class="version">ALCMS Dashboard</p>
      </div>

      <!-- 右侧系统信息 -->
      <div class="footer-right">
        <p class="copyright">&copy; {{ currentYear }} All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
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
