import type { RouteRecordRaw } from 'vue-router';
import BasicLayout from '#/layouts/basic-layout/index.vue';

// Load all view components
const viewModules = import.meta.glob('../../views/**/*.vue');

/**
 * Convert flat route list to tree structure
 * @param routes Flat list of routes
 * @param Pid Parent ID to start from
 * @param isSuperAdmin Whether user is super admin
 */
export function getTreeRoutes(routes: any[], Pid: number = 0, isSuperAdmin: boolean = false): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = [];
  const itemMap: Record<string, any> = {};

  // First pass: create all items in map to handle out-of-order children
  routes.forEach(item => {
    if (!itemMap[item.id]) {
      itemMap[item.id] = { children: [] };
    }
  });

  for (const item of routes) {
    const { id, nParkeyid, cIcon, cModname, cModnumb, cUrl, cViewname, cViewpath, cShow, cType } = item;

    const routerItem: any = {
      path: cUrl,
      name: cViewname,
      meta: {
        title: cModname,
        icon: cIcon,
        id: id,
        type: cType,
        hideInMenu: cShow === '1',
        keepAlive: true
      },
      component: undefined,
    };

    if (cViewpath === 'Layout') {
      routerItem.component = BasicLayout;
    } else if (cViewpath === 'Second') {
      // Use BasicLayout for Second as well for now, or a specific SecondLayout if available
      routerItem.component = BasicLayout; 
    } else if (cViewpath) {
      // Normalize path to match glob keys
      // glob keys are relative to this file: ../../views/dashboard/index.vue
      const viewKey = `../../views${cViewpath}.vue`;
      if (viewModules[viewKey]) {
        routerItem.component = viewModules[viewKey];
      } else {
        console.warn(`[Route] Component not found: ${viewKey} for path ${cUrl}`);
      }
    }

    // Merge router item into map
    // We preserve existing children array
    itemMap[id] = {
      ...itemMap[id],
      ...routerItem,
    };

    const treeItem = itemMap[id];

    if (nParkeyid === Pid) {
      result.push(treeItem);
      // Handle XTGL for SuperAdmin if needed (logic from user snippet)
      // if (cModnumb === 'XTGL' && isSuperAdmin === true) { ... }
    } else {
      // Ensure parent exists in map
      if (!itemMap[nParkeyid]) {
        itemMap[nParkeyid] = { children: [] };
      }
      itemMap[nParkeyid].children.push(treeItem);
    }
  }

  return result;
}

/**
 * Resolve path
 * @param parentPath Parent path
 * @param path Current path
 */
function resolvePath(parentPath: string, path: string): string {
  if (path.startsWith('/')) return path;
  if (!parentPath.endsWith('/')) parentPath += '/';
  return parentPath + path;
}

/**
 * Flatten routes
 * @param routes Route list
 * @param parentPath Parent path
 * @description 递归扁平化路由，将所有深层嵌套的路由提升为 BasicLayout 的直接子路由（在路由层面拉平，菜单层级保持不变）。这样 BasicLayout 就能直接渲染 DashboardPage ， keep-alive 也能正确匹配到组件名称。
 */
export function flattenRoutes(routes: RouteRecordRaw[], parentPath = ''): RouteRecordRaw[] {
  let res: RouteRecordRaw[] = [];
  
  routes.forEach(route => {
    const fullPath = resolvePath(parentPath, route.path);
    const { children, ...rest } = route;
    
    // Create a copy of the route with the full path
    const routeCopy = { ...rest, path: fullPath };
    
    if (children && children.length > 0) {
      // Add the parent route itself (useful for redirects)
      res.push({ ...routeCopy, children: [] });
      
      // Flatten children
      const flatChildren = flattenRoutes(children, fullPath);
      res.push(...flatChildren);
    } else {
      res.push(routeCopy);
    }
  });
  
  return res;
}
