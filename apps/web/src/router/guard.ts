import type { Router } from 'vue-router';


import { preferences } from '../preferences';
import { useAccessStore, useUserStore, useAuthStore } from '@sunny-base-web/stores';
import { startProgress, stopProgress } from '@sunny-base-web/ui';

import { accessRoutes, coreRouteNames } from './routes';
import { generateAccess } from './access';
import { fetchUserInfo } from '../api/user';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);
    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === preferences.app.loginPath && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
          userStore.userInfo?.homePath ||
          preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== preferences.app.loginPath) {
        return {
          path: preferences.app.loginPath,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 当前工号不存在，说明是刷新进入或者登录之后进入，需要获取用户信息
    // 否则，直接使用当前用户信息
    // 注意：这里获取用户信息和菜单，好像必须得耦合在业务代码中，因为store只能在组件中使用，不能在守卫中使用
    // effect 组件，也进不到路由守卫中
    let userInfo = userStore.userInfo;
    if (!userInfo || !userInfo.code) {
      const res = await fetchUserInfo({ 'types': [0, 1, 4] });
      const { user, resource } = res.result || {};
      userInfo = { ...user, resources: resource, code: user.cWork, name: user.cUsername };
      userStore.setUserInfo(userInfo);
    }
    const userRoles = userInfo.roles ?? [];
    const resources = userInfo.resources || [];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      resources,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });

    // 保存菜单信息和路由信息
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
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
