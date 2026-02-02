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
     * 获取用户信息
     */
    async fetchUserInfo() {
      const userStore = useUserStore();
      const response = await authApi.fetchUserInfo();
      userStore.setUserInfo(response.data);
      return response.data;
    }
  },
});
