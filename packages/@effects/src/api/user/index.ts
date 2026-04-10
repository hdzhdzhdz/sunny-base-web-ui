import { requestClient } from '../request';
import type { ResponseResult } from '../core';

export interface LoginParams {
  username: string;
  password: string; // RSA Encrypted
  macAddress?: string;
  cVerificationCode?: string;
  systemSign?: string; // RSA Encrypted
}

export interface LoginResult {
  token: string;
}

export function login(data: LoginParams) {
  return requestClient.post<ResponseResult<LoginResult>>('/base-auth/login', {}, { params: data });
}

export function fetchUserInfo(data?: any) {
  return requestClient.post<ResponseResult<any>>('/core/contact/getCurrentUserAndResources', data);
}

export function logout() {
  return requestClient.post<ResponseResult<any>>('/base-auth/logout', {});
}
