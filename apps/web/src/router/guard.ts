import type { Router, RouteLocationNormalizedGeneric } from 'vue-router';


import { preferences } from '../preferences';
import { useAccessStore, useUserStore, useAuthStore } from '@sunny-base-web/stores';
import { startProgress, stopProgress } from '@sunny-base-web/ui';
import { loadingManager } from '@sunny-base-web/effects';
import { getCookie } from '@sunny-base-web/utils';

import { coreRouteNames } from './routes';
import { generateAccess } from './access';
import { fetchUserInfo } from '../api/user';

/**
 * 构建登录页跳转路由
 */
function buildLoginRedirect(to: RouteLocationNormalizedGeneric) {
  const query = to.fullPath === preferences.app.defaultHomePath
    ? {}
    : { redirect: encodeURIComponent(to.fullPath) };
  return { path: preferences.app.loginPath, query, replace: true };
}

/**
 * 获取用户信息并写入 store，失败返回 null
 */
async function fetchAndSetUserInfo(userStore: ReturnType<typeof useUserStore>) {
  const res = await fetchUserInfo({ 'types': [0, 1, 4] });
  const { user, resource } = res.result || {};
  const userInfo = {
    ...user,
    resources: resource,
    code: user.cWork,
    name: user.cUsername,
    roles: user.roles || [],
    superAdmin: user.superAdmin ?? false,
    bWeakPwd: user.bWeakPwd ?? false,
    agent: user.agent || {},
  };
  userStore.setUserInfo(userInfo);
  return userInfo;
}

/**
 * 处理核心路由（登录页等）
 */
function resolveCoreRoute(to: RouteLocationNormalizedGeneric) {
  if (!coreRouteNames.includes(to.name as string)) return undefined;
  const userStore = useUserStore();
  const accessStore = useAccessStore();

  if (to.path === preferences.app.loginPath && accessStore.accessToken) {
    return decodeURIComponent(
      (to.query?.redirect as string) ||
      userStore.userInfo?.homePath ||
      preferences.app.defaultHomePath,
    );
  }
  return true;
}

/**
 * 处理无 token 时的路由跳转
 */
function resolveNoToken(to: RouteLocationNormalizedGeneric) {
  if (to.meta.ignoreAccess) return true;
  if (to.fullPath === preferences.app.loginPath) return to;
  return buildLoginRedirect(to);
}

/**
 * 通用守卫配置
 */
function setupCommonGuard(router: Router) {
  const loadedPaths = new Set<string>();
  let stopTimer: ReturnType<typeof setTimeout> | null = null;

  router.beforeEach((to, _from) => {
    to.meta.loaded = loadedPaths.has(to.path);

    const { loading } = preferences.transition;

    if (!to.meta.loaded && loading.enableRouteLoading) {
      if (loading.type === 'nprogress') {
        startProgress();
      } else {
        console.log('[Router Guard] beforeEach - calling startLoading() for:', to.path);
        loadingManager.startLoading();

        if (stopTimer) {
          console.log('[Router Guard] Clearing previous stop timer');
          clearTimeout(stopTimer);
          stopTimer = null;
        }
      }
    }

    return true;
  });

  router.afterEach((to, _from) => {
    loadedPaths.add(to.path);

    const { loading } = preferences.transition;

    if (loading.enableRouteLoading) {
      if (loading.type === 'nprogress') {
        stopProgress();
      } else {
        console.log('[Router Guard] afterEach - calling stopLoading() for:', to.path);
        loadingManager.stopLoading();

        if (stopTimer) {
          clearTimeout(stopTimer);
        }

        stopTimer = setTimeout(() => {
          console.log('[Router Guard] All navigations complete - force stopping loading');
          loadingManager.forceStop();
          stopTimer = null;
        }, 50);
      }
    }
  });
}

/**
 * 权限访问守卫配置
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    const coreResult = resolveCoreRoute(to);
    if (coreResult !== undefined) return coreResult;

    // Store 无 token 时，尝试从 Cookie 恢复
    if (!accessStore.accessToken && preferences.app.cookieTokenKey) {
      const cookieToken = getCookie(preferences.app.cookieTokenKey);
      if (cookieToken) {
        accessStore.setAccessToken(cookieToken);
      }
    }

    if (!accessStore.accessToken) return resolveNoToken(to);

    if (accessStore.isAccessChecked) return true;

    // 获取用户信息
    let userInfo = userStore.userInfo;
    if (!userInfo?.code) {
      console.log('[Router Guard] setupAccessGuard - fetching user info...');
      try {
        userInfo = await fetchAndSetUserInfo(userStore);
        console.log('[Router Guard] setupAccessGuard - user info fetched successfully');
      } catch (error) {
        console.error('[Router Guard] setupAccessGuard - fetch user info failed:', error);
        accessStore.setAccessToken(null);
        authStore.$reset();
        return buildLoginRedirect(to);
      }
    }

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userInfo.roles ?? [],
      resources: userInfo.resources || [],
      router,
    });

    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);

    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? userInfo.homePath || preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 项目守卫配置
 */
function createRouterGuard(router: Router) {
  setupCommonGuard(router);
  setupAccessGuard(router);

  router.onError((error, _to) => {
    console.error('[Router Guard] Navigation error:', error);
    const { loading } = preferences.transition;

    if (loading.enableRouteLoading && loading.type !== 'nprogress') {
      console.log('[Router Guard] onError - calling forceStop() due to error');
      loadingManager.forceStop();
    }
  });
}

export { createRouterGuard };
