import { requestClient } from '@sunny-base-web/effects';
import type { ResponseResult } from '@sunny-base-web/effects';

/**
 * 用户信息接口响应
 */
interface UserInfoResult {
  /** 用户信息 */
  user: {
    id: number;
    cUsernumb: string;
    cUsername: string;
    cWork: string;
    [key: string]: any;
  };
  /** 资源/菜单列表 */
  resource: any[];
  /** 应用设置 */
  setting: Record<string, any>;
}

/**
 * 获取当前用户信息和资源菜单
 */
export function fetchUserInfo(data?: any) {
  return requestClient.post<ResponseResult<UserInfoResult>>('/core/contact/getCurrentUserAndResources', data);
}