import { requestClient } from '../request';
import type { ResponseResult } from '../core';


export function fetchUserInfo(data?: any) {
  return requestClient.post<ResponseResult<LoginResult>>('/core/contact/getCurrentUserAndResources', data);
}