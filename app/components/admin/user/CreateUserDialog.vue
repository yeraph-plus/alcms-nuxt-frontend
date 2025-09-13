<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增用户"
    width="600px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          clearable
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input
          v-model="formData.nickname"
          placeholder="请输入昵称"
          clearable
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱地址"
          clearable
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
          clearable
        />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="角色" prop="roleName">
            <el-select
              v-model="formData.roleName"
              placeholder="请选择角色"
              style="width: 100%"
            >
              <el-option label="管理员" value="admin" />
              <el-option label="版主" value="moderator" />
              <el-option label="VIP" value="vip" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="formData.status"
              placeholder="请选择状态"
              style="width: 100%"
            >
              <el-option label="正常" value="normal" />
              <el-option label="禁用" value="disabled" />
              <el-option label="待验证" value="pending" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { useAdminManagerStore } from "~/stores/admin_manager";

// Store
const adminStore = useAdminManagerStore();

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  onSuccess: {
    type: Function,
    default: null,
  },
});

// 事件
const emit = defineEmits(["update:visible", "success"]);

const formRef = ref();
const loading = ref(false);

// 弹窗状态
const dialogVisible = ref(false);

// 表单
const formData = reactive({
  username: "",
  email: "",
  password: "",
  nickname: "",
  roleName: "user",
  status: "normal",
});

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "用户名只能包含字母、数字和下划线",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
  ],
  nickname: [
    { required: false, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度在 2 到 20 个字符", trigger: "blur" },
  ],
  roleName: [{ required: true, message: "请选择角色", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 监听 visible prop 变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
    if (newVal) {
      resetForm();
    }
  }
);

// 监听 dialogVisible 变化
watch(dialogVisible, (newVal) => {
  emit("update:visible", newVal);
});

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(formData, {
    username: "",
    email: "",
    password: "",
    nickname: "",
    roleName: "user",
    status: "normal",
  });
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    // 验证表单
    await formRef.value.validate();

    loading.value = true;

    // 调用 store 方法创建用户
    const result = await adminStore.createUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      nickname: formData.nickname,
      roleName: formData.roleName,
      status: formData.status,
    });

    // 集成成功回调处理
    ElMessage.success(`用户 "${result.nickname || result.username}" 创建成功`);

    // 触发成功事件
    emit("success", result);

    // 如果传入了成功回调函数，也调用它
    if (props.onSuccess && typeof props.onSuccess === "function") {
      props.onSuccess(result);
    }

    handleClose();
  } catch (error) {
    console.error("创建用户失败:", error);
    ElMessage.error(error.message || "创建用户失败");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
