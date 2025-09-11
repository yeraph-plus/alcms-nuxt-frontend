import { ElNotification } from "element-plus";

/**
 * Element Plus Notification Object
 * doc: https://element-plus.org/zh-CN/component/notification.html
 */
export const useElpNotify = () => {
  // 默认配置
  const defaultOptions = {
    duration: 4500,
    position: "top-right",
    showClose: true,
    dangerouslyUseHTMLString: false,
  };

  // 成功通知
  const notifySuccess = (title, message = "", options = {}) => {
    return ElNotification({
      ...defaultOptions,
      title,
      message,
      type: "success",
      iconClass: "el-icon-success",
      ...options,
    });
  };

  // 警告通知
  const notifyWarning = (title, message = "", options = {}) => {
    return ElNotification({
      ...defaultOptions,
      title,
      message,
      type: "warning",
      iconClass: "el-icon-warning",
      ...options,
    });
  };

  // 信息通知
  const notifyInfo = (title, message = "", options = {}) => {
    return ElNotification({
      ...defaultOptions,
      title,
      message,
      type: "info",
      iconClass: "el-icon-info",
      ...options,
    });
  };

  // 错误通知
  const notifyError = (title, message = "", options = {}) => {
    return ElNotification({
      ...defaultOptions,
      title,
      message,
      type: "error",
      duration: 6000, // 错误通知显示时间更长
      iconClass: "el-icon-error",
      ...options,
    });
  };

  // 自定义通知
  const notifyCustom = (options) => {
    return ElNotification({
      ...defaultOptions,
      ...options,
    });
  };

  // 关闭所有通知
  const closeAllNotifications = () => {
    ElNotification.closeAll();
  };

  // 快捷方法
  const notify = {
    success: notifySuccess,
    warning: notifyWarning,
    info: notifyInfo,
    error: notifyError,
    custom: notifyCustom,
    closeAll: closeAllNotifications,
  };

  return {
    notify,
    notifySuccess,
    notifyWarning,
    notifyInfo,
    notifyError,
    notifyCustom,
    closeAllNotifications,
  };
};

export default useElpNotify;
