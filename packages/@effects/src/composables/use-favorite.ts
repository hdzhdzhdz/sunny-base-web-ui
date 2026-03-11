import { useFavoriteStore, useUserStore } from '@sunny-base-web/stores';
import { queryFavorites, addFavorite, removeFavorite } from '../api/favorite';
import type { FavoriteItem } from '@sunny-base-web/stores';

/**
 * 收藏功能 Composable
 * 封装收藏相关的 API 调用和 Store 更新逻辑
 */
export function useFavorite() {
  const favoriteStore = useFavoriteStore();
  const userStore = useUserStore();

  /**
   * 通过路径在用户资源中查找资源ID
   */
  const findResourceIdByPath = (path: string): number | null => {
    const resources = userStore.resources || [];

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
  };

  /**
   * 获取收藏菜单列表
   */
  const fetchFavorites = async () => {
    const userCode = userStore.code;

    if (!userCode) {
      console.warn('[useFavorite] 用户工号为空，无法获取收藏列表');
      return;
    }

    favoriteStore.setLoading(true);
    try {
      const res = await queryFavorites({ cCreateuser: userCode });
      if (res.code === 200 && res.result) {
        favoriteStore.setFavorites(res.result);
      }
    } catch (error) {
      console.error('[useFavorite] 获取收藏列表失败:', error);
    } finally {
      favoriteStore.setLoading(false);
    }
  };

  /**
   * 添加当前页面到收藏
   * @param currentPath 当前路由路径
   */
  const addCurrentPage = async (currentPath: string): Promise<{ success: boolean; message: string }> => {
    const userCode = userStore.code;

    if (!userCode) {
      return { success: false, message: '用户信息异常' };
    }

    const nResourceid = findResourceIdByPath(currentPath);

    if (!nResourceid) {
      return { success: false, message: '未找到当前页面的菜单资源' };
    }

    if (favoriteStore.isFavorited(nResourceid)) {
      return { success: false, message: '当前页面已在收藏列表中' };
    }

    favoriteStore.setAdding(true);
    try {
      const res = await addFavorite({
        assQuickentry: {
          nResourceid,
          cCreateuser: userCode,
        },
      });
      if (res.code === 200) {
        await fetchFavorites();
        return { success: true, message: '添加收藏成功' };
      }
      return { success: false, message: res.message || '添加失败' };
    } catch (error) {
      console.error('[useFavorite] 添加收藏失败:', error);
      return { success: false, message: '添加收藏失败' };
    } finally {
      favoriteStore.setAdding(false);
    }
  };

  /**
   * 删除收藏
   */
  const removeFavoriteItem = async (nResourceid: number): Promise<{ success: boolean; message: string }> => {
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
        favoriteStore.removeFavoriteFromList(nResourceid);
        return { success: true, message: '移除成功' };
      }
      return { success: false, message: res.message || '移除失败' };
    } catch (error) {
      console.error('[useFavorite] 删除收藏失败:', error);
      return { success: false, message: '移除失败' };
    }
  };

  return {
    favoriteStore,
    findResourceIdByPath,
    fetchFavorites,
    addCurrentPage,
    removeFavoriteItem,
  };
}
