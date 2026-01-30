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
