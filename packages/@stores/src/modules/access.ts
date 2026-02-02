import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';
interface AccessState {
  /**
   * 登录 accessToken
   */
  accessToken: string | null;
  /**
   * 是否已经检查过权限
   */
  isAccessChecked: boolean;
  /**
   * 可访问的菜单列表
   */
  accessMenus: [];  // MenuRecordRaw 后期再加
  /**
   * 可访问的路由列表
   */
  accessRoutes: RouteRecordRaw[];
}

export const useAccessStore = defineStore('core-access', {
  state: (): AccessState => ({
    accessToken: null,
    isAccessChecked: false,
    accessMenus: [],
    accessRoutes: []
  }),
  actions: {
    setAccessToken(token: string | null) {
      this.accessToken = token;
    },
    setIsAccessChecked(isChecked: boolean) {
      this.isAccessChecked = isChecked;
    },
    setAccessMenus(menus: MenuRecordRaw[]) {
      this.accessMenus = menus;
    },
    setAccessRoutes(routes: RouteRecordRaw[]) {
      this.accessRoutes = routes;
    },
  },
  persist: {
    // 持久化
    pick: [
      'accessToken',
    ],
  },
});
