import { acceptHMRUpdate, defineStore } from 'pinia';
import { queryFavorites, addFavorite, removeFavorite } from '@sunny-base-web/effects';
import type { FavoriteItem } from '@sunny-base-web/effects';
import { useUserStore } from './user';

interface FavoriteState {
  /**
   * 收藏菜单列表
   */
  favorites: FavoriteItem[];
  /**
   * 加载状态
   */
  loading: boolean;
  /**
   * 添加中状态
   */
  adding: boolean;
}

/**
 * 收藏菜单 Store
 */
export const useFavoriteStore = defineStore('core-favorite', {
  state: (): FavoriteState => ({
    favorites: [],
    loading: false,
    adding: false,
  }),

  getters: {
    /**
     * 是否有收藏
     */
    hasFavorites: (state) => state.favorites.length > 0,

    /**
     * 检查某个资源是否已收藏
     */
    isFavorited: (state) => (nResourceid: number) => {
      return state.favorites.some((item) => item.nResourceid === nResourceid);
    },
  },

  actions: {
    /**
     * 通过路径在用户资源中查找资源ID
     */
    _findResourceIdByPath(path: string): number | null {
      const userStore = useUserStore();
      const resources = userStore.resources || [];

      // 递归查找
      const findInTree = (items: any[], targetPath: string): number | null => {
        for (const item of items) {
          if (item.cUrl === targetPath) {
            return item.id;
          }
          if (item.children?.length > 0) {
            const found = findInTree(item.children, targetPath);
            if (found) return found;
          }
        }
        return null;
      };

      return findInTree(resources, path);
    },

    /**
     * 获取收藏菜单列表
     */
    async fetchFavorites() {
      const userStore = useUserStore();
      const userCode = userStore.code;

      if (!userCode) {
        console.warn('[FavoriteStore] 用户工号为空，无法获取收藏列表');
        return;
      }

      this.loading = true;
      try {
        const res = await queryFavorites({ cCreateuser: userCode });
        if (res.code === 200 && res.result) {
          this.favorites = res.result;
        }
      } catch (error) {
        console.error('[FavoriteStore] 获取收藏列表失败:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 添加当前页面到收藏
     * @param currentPath 当前路由路径
     */
    async addCurrentPage(currentPath: string): Promise<{ success: boolean; message: string }> {
      const userStore = useUserStore();
      const userCode = userStore.code;

      if (!userCode) {
        return { success: false, message: '用户信息异常' };
      }

      // 通过路径查找资源ID
      const nResourceid = this._findResourceIdByPath(currentPath);

      if (!nResourceid) {
        return { success: false, message: '未找到当前页面的菜单资源' };
      }

      // 检查是否已收藏
      if (this.isFavorited(nResourceid)) {
        return { success: false, message: '当前页面已在收藏列表中' };
      }

      this.adding = true;
      try {
        const res = await addFavorite({
          assQuickentry: {
            nResourceid,
            cCreateuser: userCode,
          },
        });
        if (res.code === 200) {
          // 刷新收藏列表
          await this.fetchFavorites();
          return { success: true, message: '添加收藏成功' };
        }
        return { success: false, message: res.message || '添加失败' };
      } catch (error) {
        console.error('[FavoriteStore] 添加收藏失败:', error);
        return { success: false, message: '添加收藏失败' };
      } finally {
        this.adding = false;
      }
    },

    /**
     * 删除收藏
     */
    async removeFavorite(nResourceid: number): Promise<{ success: boolean; message: string }> {
      const userStore = useUserStore();
      const userCode = userStore.code;

      if (!userCode) {
        return { success: false, message: '用户信息异常' };
      }

      try {
        const res = await removeFavorite({
          nResourceid,
          cCreateuser: userCode,
        });
        if (res.code === 200) {
          // 从列表中移除
          this.favorites = this.favorites.filter((item) => item.nResourceid !== nResourceid);
          return { success: true, message: '移除成功' };
        }
        return { success: false, message: res.message || '移除失败' };
      } catch (error) {
        console.error('[FavoriteStore] 删除收藏失败:', error);
        return { success: false, message: '移除失败' };
      }
    },

    /**
     * 重置状态
     */
    resetState() {
      this.favorites = [];
      this.loading = false;
      this.adding = false;
    },
  },
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useFavoriteStore, hot));
}
