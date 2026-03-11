import { requestClient } from '../request';
import type { ResponseResult } from '../core';
import type { FavoriteItem } from '@sunny-base-web/stores';

// 重新导出类型以保持向后兼容
export type { FavoriteItem } from '@sunny-base-web/stores';

/**
 * 查询收藏菜单参数
 */
export interface QueryFavoritesParams {
  cCreateuser: string;
}

/**
 * 添加收藏菜单参数
 */
export interface AddFavoriteParams {
  assQuickentry: {
    nResourceid: number;
    cCreateuser: string;
  };
}

/**
 * 删除收藏菜单参数
 */
export interface RemoveFavoriteParams {
  nResourceid: number;
  cCreateuser: string;
}

/**
 * 查询当前用户收藏的菜单
 */
export function queryFavorites(params: QueryFavoritesParams) {
  return requestClient.post<ResponseResult<FavoriteItem[]>>('/core/assQuickentry/query', params);
}

/**
 * 添加收藏菜单
 */
export function addFavorite(params: AddFavoriteParams) {
  return requestClient.post<ResponseResult<void>>('/core/assQuickentry/save_favorite', params);
}

/**
 * 删除收藏菜单
 */
export function removeFavorite(params: RemoveFavoriteParams) {
  return requestClient.post<ResponseResult<void>>('/core/assQuickentry/del_mod', params);
}
