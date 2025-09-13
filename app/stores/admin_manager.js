import { defineStore } from "pinia";
import { ref } from "vue";
import { useApi } from "~/composables/useApi";

export const useAdminManagerStore = defineStore("admin_manager", () => {
  const { callEndpoint } = useApi();

  // 状态管理
  const users = ref([]);
  const currentUser = ref(null);
  const userStats = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // 筛选和分页状态
  const filters = ref({
    search: "",
    role: "",
    status: "",
    page: 1,
    limit: 20,
  });

  const pagination = ref({
    total: 0,
    current_page: 1,
    per_page: 20,
    last_page: 1,
  });

  // 获取用户列表
  const getUserList = async (params = {}) => {
    try {
      loading.value = true;
      error.value = null;

      // 构建查询参数
      const queryParams = {
        search: filters.value?.search || params.search || "",
        role: filters.value?.role || params.role || "",
        status: filters.value?.status || params.status || "",
        page: filters.value?.page || params.page || 1,
        limit: filters.value?.limit || params.limit || 20,
      };

      // 移除空值参数
      Object.keys(queryParams).forEach((key) => {
        if (!queryParams[key] && queryParams[key] !== 0) {
          delete queryParams[key];
        }
      });

      const result = await callEndpoint("users.list", {
        method: "GET",
        data: queryParams,
      });

      if (result.success) {
        users.value = result.data.items;
        pagination.value = result.data.pagination;
        return result.data;
      } else {
        error.value = result.message;
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 设置筛选条件
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
    // 重置到第一页
    if (
      newFilters.search !== undefined ||
      newFilters.role !== undefined ||
      newFilters.status !== undefined
    ) {
      filters.value.page = 1;
    }
  };

  // 重置筛选条件
  const resetFilters = () => {
    filters.value = {
      search: "",
      role: "",
      status: "",
      page: 1,
      limit: 20,
    };
  };

  // 分页设置
  const setPage = (page) => {
    filters.value.page = page;
  };

  // 用户统计方法
  const getUserStats = async () => {
    try {
      loading.value = true;
      error.value = null;
      const result = await callEndpoint("users.stats", {
        method: "GET",
      });
      if (result.success) {
        userStats.value = result.data;
        return result.data;
      } else {
        error.value = result.message;
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 用户创建方法
  const createUser = async (userData) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await callEndpoint("users.create", {
        method: "POST",
        data: userData,
      });
      if (result.success) {
        // 添加新用户到列表
        const newUser = result.data;
        users.value.unshift(newUser);
        pagination.value.total += 1;

        return newUser;
      } else {
        error.value = result.message;
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 删除指定用户
  const deleteUser = async (userId) => {
    try {
      // 添加参数验证
      console.log("deleteUser - 接收到的userId:", userId);
      console.log("deleteUser - userId类型:", typeof userId);

      if (!userId || Number.isNaN(Number(userId))) {
        throw new Error("用户ID无效");
      }

      // 确保userId是数字类型
      const numericUserId = Number(userId);

      loading.value = true;
      error.value = null;
      const result = await callEndpoint("users.deleteById", {
        params: { id: numericUserId },
      });
      if (result.success) {
        // 从本地列表中移除用户
        users.value = users.value.filter(
          (user) => Number(user.id) !== numericUserId
        );
        return result.data;
      } else {
        error.value = result.message;
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 更新指定用户状态
  const updateUserStatus = async (userId, statusData) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await callEndpoint("users.updateStatusById", {
        method: "PUT",
        data: { ...statusData, id: userId },
      });
      if (result.success) {
        // 更新本地用户列表中的用户状态
        const userIndex = users.value.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          users.value[userIndex] = {
            ...users.value[userIndex],
            ...result.data,
          };
        }
        return result.data;
      } else {
        error.value = result.message;
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 获取指定用户资料
  const getUserById = async (userId) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await callEndpoint("users.profileById", {
        method: "GET",
        data: { id: userId },
      });
      if (result.success) {
        return result.data;
      } else {
        error.value = result.message;
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 为指定用户分配角色
  const assignUserRole = async (userId, roleData) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await callEndpoint("users.rolesById", {
        method: "POST",
        data: { ...roleData, id: userId },
      });
      if (result.success) {
        // 更新本地用户列表中的用户角色
        const userIndex = users.value.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          users.value[userIndex] = {
            ...users.value[userIndex],
            ...result.data,
          };
        }
        return result.data;
      } else {
        error.value = result.message;
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 为指定用户移除角色
  const removeUserRole = async (userId, roleData) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await callEndpoint("users.rolesById", {
        method: "DELETE",
        data: { ...roleData, id: userId },
      });
      if (result.success) {
        // 更新本地用户列表中的用户角色
        const userIndex = users.value.findIndex((user) => user.id === userId);
        if (userIndex !== -1) {
          users.value[userIndex] = {
            ...users.value[userIndex],
            ...result.data,
          };
        }
        return result.data;
      } else {
        error.value = result.message;
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 清除错误状态
  const clearError = () => {
    error.value = null;
  };

  // 重置状态
  const resetState = () => {
    users.value = [];
    currentUser.value = null;
    userStats.value = null;
    error.value = null;
    loading.value = false;
  };

  return {
    users,
    currentUser,
    userStats,
    loading,
    error,
    filters,
    pagination,

    getUserStats,

    getUserList,
    createUser,
    updateUserStatus,
    getUserById,
    deleteUser,
    assignUserRole,
    removeUserRole,

    setFilters,
    setPage,
    resetFilters,

    clearError,
    resetState,
  };
});
