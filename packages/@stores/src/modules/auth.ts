import { defineStore } from 'pinia';
import { useUserStore } from './user';
import { useAccessStore } from './access';

export const useAuthStore = defineStore('core-auth', {
  actions: {
    /**
     * 注销
     */
    async logout() {
      const accessStore = useAccessStore();
      const userStore = useUserStore();
      
      // 清除 token
      accessStore.setAccessToken(null);
      // 清除用户信息
      userStore.setUserInfo(null);
      // 清除权限检查状态
      accessStore.setIsAccessChecked(false);
    },

    /**
     * 登录逻辑通常涉及加密和API调用，由于 @stores 不能反向依赖 @effects (UI层)，
     * 建议在 Vue 组件或 @effects 的业务逻辑中调用 API，成功后调用 accessStore.setAccessToken(token)
     */
  },
});
