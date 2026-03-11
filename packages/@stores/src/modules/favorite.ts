import { defineStore } from 'pinia';

/**
 * 收藏菜单项
 */
export interface FavoriteItem {
  /**
   * 资源ID（用于删除）
   */
  nResourceid: number;
  /**
   * 模块名称
   */
  cModname: string;
  /**
   * 图标
   */
  cIcon?: string;
  /**
   * 路由路径
   */
  cUrl?: string;
  /**
   * 创建人（工号）
   */
  cCreateuser?: string;
}

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
     * 设置收藏列表
     */
    setFavorites(favorites: FavoriteItem[]) {
      this.favorites = favorites;
    },

    /**
     * 添加收藏到列表
     */
    addFavoriteToList(item: FavoriteItem) {
      if (!this.favorites.some(f => f.nResourceid === item.nResourceid)) {
        this.favorites.push(item);
      }
    },

    /**
     * 从列表中移除收藏
     */
    removeFavoriteFromList(nResourceid: number) {
      this.favorites = this.favorites.filter((item) => item.nResourceid !== nResourceid);
    },

    /**
     * 设置加载状态
     */
    setLoading(loading: boolean) {
      this.loading = loading;
    },

    /**
     * 设置添加中状态
     */
    setAdding(adding: boolean) {
      this.adding = adding;
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
