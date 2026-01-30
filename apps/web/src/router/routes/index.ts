import type { RouteRecordRaw } from 'vue-router';

import { mergeRouteModules, traverseTreeValues } from '@sunny-base-web/utils';

// 基本路由 404 不允许删除
import { coreRoutes, fallbackNotFoundRoute } from './core';

/** 动态路由 */
const dynamicRouteFiles = import.meta.glob('./dynamic/**/*.ts', { eager: true });
const dynamicRoutes: RouteRecordRaw[] = mergeRouteModules(dynamicRouteFiles);
/** 额外路由 */
const externalRouteFiles = import.meta.glob('./external/**/*.ts', { eager: true });
/** 静态路由 */
const staticRouteFiles = import.meta.glob('./static/**/*.ts', { eager: true });


const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles);
const staticRoutes: RouteRecordRaw[] = mergeRouteModules(staticRouteFiles);

/** 路由列表，由基本路由、外部路由和404兜底路由组成
 *  无需走权限验证（会一直显示在菜单中） */
const routes: RouteRecordRaw[] = [
  ...coreRoutes,
  ...externalRoutes,
  fallbackNotFoundRoute,
];

/** 基本路由列表，这些路由不需要进入权限拦截 */
const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name);

/** 有权限校验的路由列表，包含动态路由和静态路由 */
const accessRoutes = [...dynamicRoutes, ...staticRoutes];
export { accessRoutes, coreRouteNames, routes };