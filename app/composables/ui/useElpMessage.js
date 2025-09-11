import { ElMessage } from "element-plus";

/**
 * Element Plus Message Object
 * doc: https://element-plus.org/zh-CN/component/message.html
 */
export const useElpMessage = () => {
  // 默认配置
  const defaultOptions = {
    duration: 3000,
    showClose: false,
    center: false,
    dangerouslyUseHTMLString: false,
  };

  // 成功消息
  const messageSuccess = (message, options = {}) => {
    return ElMessage({
      ...defaultOptions,
      message,
      type: "success",
      ...options,
    });
  };

  // 警告消息
  const messageWarning = (message, options = {}) => {
    return ElMessage({
      ...defaultOptions,
      message,
      type: "warning",
      ...options,
    });
  };

  // 信息消息
  const messageInfo = (message, options = {}) => {
    return ElMessage({
      ...defaultOptions,
      message,
      type: "info",
      ...options,
    });
  };

  // 错误消息
  const messageError = (message, options = {}) => {
    return ElMessage({
      ...defaultOptions,
      message,
      type: "error",
      duration: 4000, // 错误消息显示时间更长
      ...options,
    });
  };

  // 自定义消息
  const messageCustom = (options) => {
    return ElMessage({
      ...defaultOptions,
      ...options,
    });
  };

  // 关闭所有消息
  const closeAllMessages = () => {
    ElMessage.closeAll();
  };

  // 快捷方法
  const message = {
    success: messageSuccess,
    warning: messageWarning,
    info: messageInfo,
    error: messageError,
    custom: messageCustom,
    closeAll: closeAllMessages,
  };

  return {
    message,
    messageSuccess,
    messageWarning,
    messageInfo,
    messageError,
    messageCustom,
    closeAllMessages,
  };
};

export default useElpMessage;