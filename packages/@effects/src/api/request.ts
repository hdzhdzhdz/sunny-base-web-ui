/**
 * @file request.ts
 * @description API 请求客户端封装
 * 
 * 该文件基于 axios 和自定义的 RequestClient 类封装了通用的 HTTP 请求功能。
 * 包含了以下核心特性：
 * 1. 统一的请求拦截：自动注入 Token、语言环境、动态 BaseURL。
 * 2. 统一的响应拦截：数据解包、全局错误处理、Token 过期自动刷新、登录失效自动登出。
 * 3. 与 Pinia Store (@stores) 集成，实现 Token 的读写。
 * 4. 与全局配置 (globalConfig) 集成，支持外部配置 API 前缀等。
 */

import type { RequestClientOptions } from '../request/src';

import {
  authenticateResponseInterceptor, // 认证相关的响应拦截器（处理 401 等）
  businessCodeResponseInterceptor, // 业务码响应拦截器（处理 530 等）
  defaultResponseInterceptor,      // 默认响应拦截器（解包数据）
  errorMessageResponseInterceptor, // 错误消息响应拦截器（全局提示）
  RequestClient,                   // 核心请求类
} from '../request/src';

// 引入 Store 用于获取和设置 Token，以及执行登出操作
import { useAccessStore, useAuthStore, useTabbarStore } from '@sunny-base-web/stores';

// 引入全局配置，用于获取 API 前缀、语言设置等
import { globalConfig } from '../config';

// 引入 Cookie 工具，用于从 Cookie 读取 Token
import { getCookie } from '@sunny-base-web/utils';

// 引入刷新 Token 的 API 接口
import { refreshTokenApi } from './core';

// 引入 Arco Design 的全局消息提示组件
import { Message } from '@arco-design/web-vue';

/**
 * 创建并配置请求客户端工厂函数
 * 
 * @param baseURL - 基础 URL
 * @param options - 其他请求配置选项
 * @returns 配置好的 RequestClient 实例
 */
function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  // 实例化 RequestClient
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑
   * 当 Token 失效且无法刷新（或刷新失败）时触发
   *
   * 行为：
   * 1. 打印警告
   * 2. 清空 Access Token
   * 3. 调用 Auth Store 的 logout 方法（清理用户信息、权限等，并跳转登录页）
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    await authStore.logout();
  }

  /**
   * 业务错误码处理（如 530 登录超时）
   * 当后端返回特定业务码时触发
   *
   * 行为：
   * 1. 显示提示消息
   * 2. 清空所有相关 Store 数据
   * 3. 跳转到登录页（携带 redirect 参数）
   */
  async function doLogoutOnBusinessError(code: number, message: string) {
    console.warn(`Business error code ${code}: ${message}`);

    // 1. 显示提示消息
    Message.warning(message || '登录已过期，请重新登录');

    // 2. 清空所有相关 Store
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    const tabbarStore = useTabbarStore();

    // 清空 Token
    accessStore.setAccessToken(null);
    // 执行 logout 清理用户信息和权限
    await authStore.logout();
    // 清空标签页
    tabbarStore.tabs = [];
    tabbarStore.cachedTabs = new Set();

    // 3. 跳转到登录页，携带 redirect 参数
    // 使用 hash 路由获取当前路径（去掉 # 前缀）
    const currentPath = window.location.hash.slice(1) || '/';
    const loginRoute = globalConfig.app?.loginPath || '/auth/login';
    const redirectPath = currentPath !== loginRoute
      ? `${loginRoute}?redirect=${encodeURIComponent(currentPath)}`
      : loginRoute;

    // ✅ 使用 hash 路由模式，修改 hash 而不是 href
    window.location.hash = redirectPath;
  }

  /**
   * 刷新 Token 逻辑
   * 当接口返回特定错误码（如 Token 过期）且启用了 enableRefreshToken 时触发
   * 
   * 行为：
   * 1. 调用刷新 Token 接口
   * 2. 更新 Store 中的 Access Token
   * 3. 返回新的 Token 给拦截器，拦截器会自动重试原请求
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  /**
   * 格式化 Token
   * 将 Token 转换为 Bearer 格式
   */
  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // =========================================================================
  // 请求拦截器配置
  // =========================================================================
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      // 1. 优先从 Cookie 获取 Token，否则从 Store 获取
      let token: string | null = null;
      if (globalConfig.cookieTokenKey) {
        token = getCookie(globalConfig.cookieTokenKey);
      }
      if (!token) {
        const accessStore = useAccessStore();
        token = accessStore.accessToken;
      }
      config.headers.Authorization = formatToken(token);

      // 2. 注入当前语言环境，用于后端国际化处理
      config.headers['Accept-Language'] = globalConfig.locale;

      // 3. 动态设置 BaseURL
      // 如果全局配置中有 apiPrefix (如 '/api')，则覆盖默认的 baseURL
      // 这允许在运行时根据环境配置不同的 API 地址
      if (globalConfig.apiPrefix) {
        config.baseURL = globalConfig.apiPrefix;
      }

      return config;
    },
  });

  // =========================================================================
  // 响应拦截器配置
  // =========================================================================

  // 1. 处理业务错误码（如 530 登录超时）
  // 必须在 defaultResponseInterceptor 之前注册，以便先处理业务码
  client.addResponseInterceptor(
    businessCodeResponseInterceptor({
      businessCodes: [530], // 登录超时的业务码
      onBusinessError: doLogoutOnBusinessError,
    }),
  );

  // 2. 处理标准响应数据结构
  // 假设后端返回格式为 { code: 200, result: {...}, message: '...' }
  // 该拦截器会解包 response.data，如果 code === successCode，则返回 dataField 指定的数据
  // 这里 dataField 传入函数 (res) => res，表示返回整个响应对象，以便前端可以访问 message 和 result
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: (res: any) => res,
      successCode: 200,
    }),
  );

  // 3. 处理 Token 过期和自动刷新
  // 监听 401 或特定的业务错误码
  // 如果 Token 过期：尝试调用 doRefreshToken -> 成功则重试原请求 -> 失败则调用 doReAuthenticate
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: globalConfig.enableRefreshToken ?? false, // 是否启用自动刷新 Token
      formatToken,
    }),
  );

  // 4. 全局通用错误处理
  // 捕获上述拦截器抛出的错误或网络错误
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制
      // error 是 axios 的错误对象或自定义错误对象

      // 尝试解析后端返回的详细错误信息
      // 假设错误响应体结构为 { error: '...', message: '...' }
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';

      // 使用 Arco Design Message 组件显示错误提示
      // 如果后端没有返回具体错误信息，则显示通用的 msg (如 "Network Error")
      Message.error(errorMessage || msg);
    }),
  );

  return client;
}

/**
 * 导出的默认请求客户端实例
 * 
 * 配置：
 * - responseReturn: 'data' (直接返回 response.data.data，即业务数据部分)
 * - baseURL: 默认为空，由请求拦截器中的 globalConfig.apiPrefix 动态决定
 */
export const requestClient = createRequestClient('', {
  responseReturn: 'data',
});

/**
 * 基础请求客户端
 * 未配置拦截器等复杂逻辑，用于特殊场景
 */
export const baseRequestClient = new RequestClient({ baseURL: '' });
