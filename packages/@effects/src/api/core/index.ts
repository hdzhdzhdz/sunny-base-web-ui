import { requestClient } from '../request';

export interface ResponseResult<T = any> {
  success: boolean;
  message: string;
  code: number;
  result: T;
  timestamp: number;
}

export interface LoginStrategyResult {
  loginStrategy: string;
}

/**
 * 获取登录类型
 */
export function getEnterStrategy(data?: any) {
  return requestClient.post<ResponseResult<LoginStrategyResult>>('/getEnterStrategy', data);
}

export function refreshTokenApi() {
  return requestClient.post<any>('/refreshToken');
}
