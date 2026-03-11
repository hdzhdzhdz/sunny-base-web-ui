import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { useAccessStore } from './access';

/**
 * 认证管理 Store
 * 处理用户登录/登出相关的业务逻辑
 */
export const useAuthStore = defineStore('core-auth', {
  actions: {
    /**
     * 用户注销
     * 清除所有登录状态和用户信息
     */
    async logout(): Promise<void> {
      const accessStore = useAccessStore();
      const userStore = useUserStore();

      // 重置权限状态（包括 token、权限检查状态等）
      accessStore.resetState();
      // 重置用户信息
      userStore.$reset();
    },
  },
});
