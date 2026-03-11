import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

/**
 * 菜单记录
 */
export interface MenuRecord {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children?: MenuRecord[];
  [key: string]: any;
}

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
  accessMenus: MenuRecord[];
  /**
   * 可访问的路由列表
   */
  accessRoutes: RouteRecordRaw[];
}

/**
 * 权限管理 Store
 * 管理用户访问权限、 菜单和路由信息
 */
export const useAccessStore = defineStore('core-access', {
  state: (): AccessState => ({
    accessToken: null,
    isAccessChecked: false,
    accessMenus: [],
    accessRoutes: []
  }),
  actions: {
    /**
     * 设置访问令牌
     * @param token - 访问令牌
     */
    setAccessToken(token: string | null): void {
      this.accessToken = token;
    },
    /**
     * 设置是否已检查权限
     * @param isChecked - 是否已检查
     */
    setIsAccessChecked(isChecked: boolean): void {
      this.isAccessChecked = isChecked;
    },
    /**
     * 设置访问菜单
     * @param menus - 菜单列表
     */
    setAccessMenus(menus: MenuRecord[]): void {
      this.accessMenus = menus;
    },
    /**
     * 设置访问路由
     * @param routes - 路由列表
     */
    setAccessRoutes(routes: RouteRecordRaw[]): void {
      this.accessRoutes = routes;
    },
    /**
     * 重置状态（用于登出）
     */
    resetState(): void {
      this.accessToken = null;
      this.isAccessChecked = false;
      this.accessMenus = [];
      this.accessRoutes = [];
    },
  },
  persist: {
    // 持久化
    pick: [
      'accessToken',
    ],
  },
});
