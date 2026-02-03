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


/**
 * 查询数据字典
 */
export function queryByXuhao(data: any) {
  return requestClient.post('/core/authDict/queryByXuhao', data);
}

/**
 * 获取滑动验证码
 */
export function getSlideVerificationCode(data: any) {
  return requestClient.post('/getSlideVerificationCode', data);
}

/**
 * 查询所有静态前端国际化配置
 */
export function findAllStaticFrontI18n(data: any) {
  return requestClient.post('/core/contact/findAllStaticFrontI18n', data);
}
