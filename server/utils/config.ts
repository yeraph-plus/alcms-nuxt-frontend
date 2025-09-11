/**
 *
 * http://127.0.0.1:3000/api/
 * http://127.0.0.1:3000/api-docs/
 */

// 后端位置
export const API_BASE_URL = "http://127.0.0.1:3000"; // 移除末尾斜杠
export const API_TIMEOUT = 10000;

//用户角色
export const ALL_USER_ROLES = ["user", "vip", "moderator", "admin"];

//角色可用操作表
export const ALL_USER_OPERATIONS = {
  user: [],
  vip: [],
  moderator: [],
  admin: [],
};

// 接口端点配置和参数定义
export const API_ENDPOINTS = {
  // 用户认证相关接口
  auth: {
    // 用户注册
    register: {
      method: "POST",
      url: "/api/auth/register",
      roles: ALL_USER_ROLES,
      header: { Auth: false },
      body: {
        email: {
          required: true,
          type: "string",
          example: "test@example.com",
          desc: "用户邮箱",
        },
        password: {
          required: true,
          type: "string",
          example: "TestPass123!",
          desc: "用户密码",
        },
        username: {
          required: true,
          type: "string",
          example: "testuser",
          desc: "用户名",
        },
        nickname: {
          required: false,
          type: "string",
          example: "测试用户",
          desc: "用户昵称",
        },
      },
    },
    // 用户登录
    login: {
      method: "POST",
      url: "/api/auth/login",
      roles: ALL_USER_ROLES,
      header: { Auth: false },
      body: {
        email: {
          required: true,
          type: "string",
          example: "test@example.com",
          desc: "用户邮箱",
        },
        password: {
          required: true,
          type: "string",
          example: "TestPass123!",
          desc: "用户密码",
        },
      },
    },
    // 刷新访问令牌
    refresh: {
      method: "POST",
      url: "/api/auth/refresh",
      roles: ALL_USER_ROLES,
      header: { Auth: false },
      body: {
        refreshToken: {
          required: true,
          type: "string",
          example: "{{refreshToken}}",
          desc: "刷新令牌",
        },
      },
    },
    // 用户登出
    logout: {
      method: "POST",
      url: "/api/auth/logout",
      roles: ALL_USER_ROLES,
      header: { Auth: false },
      body: {
        refreshToken: {
          required: true,
          type: "string",
          example: "{{refreshToken}}",
          desc: "刷新令牌",
        },
      },
    },
  },
  // 用户管理接口
  users: {
    // 获取当前用户信息
    profile: {
      method: "GET",
      url: "/api/auth/profile",
      roles: ALL_USER_ROLES,
      header: { Auth: true },
      body: {},
    },
    // 更新用户资料
    updateProfile: {
      method: "PUT",
      url: "/api/users/profile",
      roles: ALL_USER_ROLES,
      header: { Auth: true },
      body: {
        nickname: {
          required: false,
          type: "string",
          example: "测试用户",
          desc: "用户昵称",
        },
        avatar_url: {
          required: false,
          type: "string",
          example: "https://example.com/avatar.jpg",
          desc: "用户头像URL",
        },
        bio: {
          required: false,
          type: "string",
          example: "这是一个测试用户",
          desc: "用户简介",
        },
      },
    },
    // 创建用户（管理员）
    create: {
      method: "POST",
      url: "/api/users",
      roles: ["admin"],
      header: { Auth: true },
      body: {
        email: {
          required: true,
          type: "string",
          example: "test@example.com",
          desc: "用户邮箱",
        },
      },
    },
    list: {
      method: "GET",
      url: "/api/users",
      roles: ["admin"],
      header: { Auth: true },
      params: {
        page: {
          type: "number",
          example: 1,
          desc: "页码",
        },
        limit: {
          type: "number",
          example: 20,
          desc: "每页数量",
        },
        status: {
          type: "string",
          example: "normal", //normal, frozen
          desc: "用户状态",
        },
        search: {
          type: "string",
          example: "test",
          desc: "搜索关键词",
        },
      },
    },
    stats: {
      method: "GET",
      url: "/api/users/stats",
      roles: ["admin"],
      header: { Auth: true },
      params: {},
    },
    getById: {
      method: "GET",
      url: "/api/users/:userId",
      roles: ALL_USER_ROLES,
      header: { Auth: true },
      params: {},
    },
    delete: {
      method: "DELETE",
      url: "/api/users/:userId",
      roles: ["admin"],
      header: { Auth: true },
      params: {},
    },
    updateStatus: {
      method: "PUT",
      url: "/api/users/:userId/status",
      roles: ["admin"],
      header: { Auth: true },
      body: {},
    },
    freeze: {
      method: "PATCH",
      url: "/api/users/:userId/freeze",
      roles: ["admin"],
      header: { Auth: true },
      body: {},
    },
    assignRoles: {
      method: "POST",
      url: "/api/users/:userId/roles",
      roles: ["admin"],
      header: { Auth: true },
      body: {},
    },
    removeRoles: {
      method: "DELETE",
      url: "/api/users/:userId/roles",
      roles: ["admin"],
      header: { Auth: true },
      body: {},
    },
  },
  // 内容管理接口
  resources: {
    list: { method: "GET", url: "/api/resources" }, // 获取资源列表
    detail: { method: "GET", url: "/api/resources/:id" }, // 获取资源详情
    create: { method: "POST", url: "/api/resources" }, // 创建资源
    update: { method: "PUT", url: "/api/resources/:id" }, // 更新资源
    delete: { method: "DELETE", url: "/api/resources/:id" }, // 删除资源
    download: { method: "POST", url: "/api/resources/:id/download" }, // 下载资源
    search: { method: "GET", url: "/api/resources/search/query" }, // 搜索资源
    stats: { method: "GET", url: "/api/resources/stats/overview" }, // 资源统计
  },
  // 分类管理接口
  categories: {
    list: { method: "GET", url: "/api/categories" }, // 获取分类列表
    detail: { method: "GET", url: "/api/categories/:id" }, // 获取分类详情
    create: { method: "POST", url: "/api/categories" }, // 创建分类
    update: { method: "PUT", url: "/api/categories/:id" }, // 更新分类
    delete: { method: "DELETE", url: "/api/categories/:id" }, // 删除分类
    popular: { method: "GET", url: "/api/categories/popular/list" }, // 热门分类
  },
  // 标签管理接口
  tags: {
    list: { method: "GET", url: "/api/tags" }, // 获取标签列表
    detail: { method: "GET", url: "/api/tags/:id" }, // 获取标签详情
    create: { method: "POST", url: "/api/tags" }, // 创建标签
    update: { method: "PUT", url: "/api/tags/:id" }, // 更新标签
    delete: { method: "DELETE", url: "/api/tags/:id" }, // 删除标签
    search: { method: "GET", url: "/api/tags/search/query" }, // 搜索标签
    popular: { method: "GET", url: "/api/tags/popular/list" }, // 热门标签
  },
  // 社区板块接口
  community: {
    // 板块管理
    boards: {
      list: { method: "GET", url: "/api/community/boards" }, // 获取板块列表
      create: { method: "POST", url: "/api/community/boards" }, // 创建板块
      detail: { method: "GET", url: "/api/community/boards/:id" }, // 获取板块详情
      update: { method: "PUT", url: "/api/community/boards/:id" }, // 更新板块
      delete: { method: "DELETE", url: "/api/community/boards/:id" }, // 删除板块
    },
    // 帖子管理
    posts: {
      list: { method: "GET", url: "/api/community/posts" }, // 获取帖子列表
      create: { method: "POST", url: "/api/community/posts" }, // 创建帖子
      detail: { method: "GET", url: "/api/community/posts/:id" }, // 获取帖子详情
      update: { method: "PUT", url: "/api/community/posts/:id" }, // 更新帖子
      delete: { method: "DELETE", url: "/api/community/posts/:id" }, // 删除帖子
      pin: { method: "PATCH", url: "/api/community/posts/:id/pin" }, // 置顶帖子
      feature: { method: "PATCH", url: "/api/community/posts/:id/feature" }, // 设置精华帖
      lock: { method: "PATCH", url: "/api/community/posts/:id/lock" }, // 锁定帖子
    },
    // 评论管理
    comments: {
      list: { method: "GET", url: "/api/community/posts/:postId/comments" }, // 获取帖子评论
      create: { method: "POST", url: "/api/community/comments" }, // 创建评论
      detail: { method: "GET", url: "/api/community/comments/:id" }, // 获取评论详情
      update: { method: "PUT", url: "/api/community/comments/:id" }, // 更新评论
      delete: { method: "DELETE", url: "/api/community/comments/:id" }, // 删除评论
    },
    // 互动功能
    interactions: {
      like: { method: "POST", url: "/api/community/interactions/like" }, // 点赞/取消点赞
      favorite: { method: "POST", url: "/api/community/interactions/favorite" }, // 收藏/取消收藏
      share: { method: "POST", url: "/api/community/interactions/share" }, // 分享帖子
      report: { method: "POST", url: "/api/community/interactions/report" }, // 举报内容
      checkLike: {
        method: "GET",
        url: "/api/community/interactions/like/check",
      }, // 检查点赞状态
      checkFavorite: {
        method: "GET",
        url: "/api/community/interactions/favorite/check",
      }, // 检查收藏状态
    },
  },
  // VIP会员接口
  vip: {
    // VIP等级管理
    levels: {
      list: { method: "GET", url: "/api/vip/levels" }, // 获取VIP等级配置
      detail: { method: "GET", url: "/api/vip/levels/:level" }, // 获取指定VIP等级
      create: { method: "POST", url: "/api/vip/levels" }, // 创建VIP等级（管理员）
      update: { method: "PUT", url: "/api/vip/levels/:level" }, // 更新VIP等级（管理员）
      delete: { method: "DELETE", url: "/api/vip/levels/:level" }, // 删除VIP等级（管理员）
    },
    // VIP用户管理
    user: {
      info: { method: "GET", url: "/api/vip/my-info" }, // 获取我的VIP信息
      orders: { method: "GET", url: "/api/vip/my-orders" }, // 获取我的订单历史
      orderDetail: { method: "GET", url: "/api/vip/orders/:orderId" }, // 获取订单详情
      userInfo: { method: "GET", url: "/api/vip/users/:userId/info" }, // 获取用户VIP信息（管理员）
      setVip: { method: "POST", url: "/api/vip/users/:userId/set" }, // 设置用户VIP（管理员）
      extendVip: { method: "POST", url: "/api/vip/users/:userId/extend" }, // 延长用户VIP（管理员）
      cancelVip: { method: "DELETE", url: "/api/vip/users/:userId/cancel" }, // 取消用户VIP（管理员）
    },
  },
  // 卡密系统接口
  cardKeys: {
    redeem: { method: "POST", url: "/api/card-keys/redeem" }, // 兑换卡密
    info: { method: "GET", url: "/api/card-keys/info/:code" }, // 查询卡密信息
    generate: { method: "POST", url: "/api/card-keys/generate/single" }, // 生成单个卡密（管理员）
    batchGenerate: { method: "POST", url: "/api/card-keys/generate/batch" }, // 批量生成卡密（管理员）
    list: { method: "GET", url: "/api/card-keys/list" }, // 获取卡密列表（管理员）
    stats: { method: "GET", url: "/api/card-keys/statistics" }, // 获取卡密统计（管理员）
    batches: { method: "GET", url: "/api/card-keys/batches" }, // 获取批次列表（管理员）
    batchDetail: { method: "GET", url: "/api/card-keys/batches/:batchId" }, // 获取批次详情（管理员）
    updateStatus: { method: "PUT", url: "/api/card-keys/:cardId/status" }, // 更新卡密状态（管理员）
    delete: { method: "DELETE", url: "/api/card-keys/:cardId" }, // 删除卡密（超级管理员）
    deleteBatch: { method: "DELETE", url: "/api/card-keys/batches/:batchId" }, // 删除批次（超级管理员）
  },
  // 积分系统接口
  points: {
    myInfo: { method: "GET", url: "/api/points/my-info" }, // 获取我的积分信息
    myRecords: { method: "GET", url: "/api/points/my-records" }, // 获取我的积分记录
    myRank: { method: "GET", url: "/api/points/my-rank" }, // 获取我的积分排名
    transfer: { method: "POST", url: "/api/points/transfer" }, // 积分转账
    leaderboard: { method: "GET", url: "/api/points/leaderboard" }, // 获取积分排行榜
    userInfo: { method: "GET", url: "/api/points/users/:userId/info" }, // 获取用户积分信息（管理员）
    userRecords: { method: "GET", url: "/api/points/users/:userId/records" }, // 获取用户积分记录（管理员）
    adjust: { method: "POST", url: "/api/points/users/:userId/adjust" }, // 调整用户积分（管理员）
    batchGrant: { method: "POST", url: "/api/points/batch/grant" }, // 批量发放积分（管理员）
    stats: { method: "GET", url: "/api/points/statistics" }, // 获取积分统计（管理员）
  },
  // 签到系统接口
  checkin: {
    check: { method: "POST", url: "/api/checkin/check" }, // 执行签到
    myStatus: { method: "GET", url: "/api/checkin/my-status" }, // 获取我的签到状态
    myHistory: { method: "GET", url: "/api/checkin/my-history" }, // 获取我的签到历史
    leaderboard: { method: "GET", url: "/api/checkin/leaderboard" }, // 获取签到排行榜
    configs: { method: "GET", url: "/api/checkin/configs" }, // 获取签到配置（管理员）
    createConfig: { method: "POST", url: "/api/checkin/configs" }, // 创建签到配置（管理员）
    updateConfig: { method: "PUT", url: "/api/checkin/configs/:configId" }, // 更新签到配置（管理员）
    userInfo: { method: "GET", url: "/api/checkin/users/:userId/info" }, // 获取用户签到信息（管理员）
    userHistory: { method: "GET", url: "/api/checkin/users/:userId/history" }, // 获取用户签到历史（管理员）
    makeup: { method: "POST", url: "/api/checkin/users/:userId/makeup" }, // 补签功能（管理员）
    reset: { method: "DELETE", url: "/api/checkin/users/:userId/reset" }, // 重置用户签到数据（超级管理员）
    stats: { method: "GET", url: "/api/checkin/statistics" }, // 获取签到统计（管理员）
  },
};
