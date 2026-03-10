import { h } from 'vue';
import { type Router, type RouteRecordRaw, RouterView, type RouteMeta } from 'vue-router';
import { cloneDeep } from 'lodash-es';
import { mapTree, sortTree, filterTree } from '@sunny-base-web/utils';
import { accessRoutes } from './routes';
import { getTreeRoutes, flattenRoutes } from './routes/utils';

interface MenuRecordRaw {
  name: string;
  path: string;
  icon?: string;
  children?: MenuRecordRaw[];
  show?: boolean;
  order?: number;
  parents?: string[];
  parent?: string;
  activeIcon?: string;
  badge?: string | number;
  badgeType?: string;
  badgeVariants?: string;
  [key: string]: any;
}

interface ExRouteRecordRaw extends RouteRecordRaw {
  parents?: string[];
  parent?: string;
  order?: number;
}

/**
 * 处理单个子菜单提升
 * 如果菜单只有一个子项且没有设置 alwaysShow，则直接展示子项
 */
function hoistSingleChild(menus: MenuRecordRaw[]): MenuRecordRaw[] {
  return menus.map((menu) => {
    if (menu.children && menu.children.length > 0) {
      menu.children = hoistSingleChild(menu.children);
    }
    if (menu.children && menu.children.length === 1 && !menu.alwaysShow) {
      return menu.children[0];
    }
    return menu;
  });
}

/** 
 * 根据 routes 生成菜单列表 
 * @param routes - 路由配置列表 
 * @param router - Vue Router 实例 
 * @returns 生成的菜单列表 
 */ 
function generateMenus( 
  routes: RouteRecordRaw[], 
  router: Router, 
): MenuRecordRaw[] { 
  // 将路由列表转换为一个以 name 为键的对象映射 
  const finalRoutesMap: { [key: string]: string } = Object.fromEntries( 
    router.getRoutes().map(({ name, path }) => [name, path]), 
  ); 

  let menus = mapTree<ExRouteRecordRaw, MenuRecordRaw>(routes as ExRouteRecordRaw[], (route) => { 
    // 获取最终的路由路径 
    const path = finalRoutesMap[route.name as string] ?? route.path ?? ''; 

    const { 
      meta = {} as RouteMeta, 
      name: routeName, 
      redirect, 
      children = [], 
    } = route; 
    const { 
      activeIcon, 
      alwaysShow,
      badge, 
      badgeType, 
      badgeVariants, 
      hideChildrenInMenu = false, 
      icon, 
      link, 
      order, 
      title = '', 
    } = meta; 

    // 确保菜单名称不为空 
    const name = (title || routeName || '') as string; 

    // 处理子菜单 
    const resultChildren = hideChildrenInMenu 
      ? [] 
      : ((children as unknown as MenuRecordRaw[]) ?? []); 

    // 设置子菜单的父子关系 
    if (resultChildren.length > 0) { 
      resultChildren.forEach((child) => { 
        child.parents = [...(route.parents ?? []), path]; 
        child.parent = path; 
      }); 
    } 

    // 确定最终路径 
    const resultPath = hideChildrenInMenu ? redirect || path : link || path; 

    // ----------------------------------------------------------------------
    // [临时逻辑] 给没有图标的菜单随机分配一个图标
    // 原因：目前后端返回的路由数据中缺少 icon 字段，导致菜单显示空白。
    // 方案：为了界面展示效果，这里根据菜单名称生成固定的随机图标。
    // TODO: 待后端完善接口返回 icon 数据后，请删除此段逻辑，使用真实的 icon 数据。
    // ----------------------------------------------------------------------
    let finalIcon = icon;
    if (!finalIcon) {
      const tempIcons = [
        'lucide:layout-grid',
        'lucide:box',
        'lucide:layers',
        'lucide:file-text',
        'lucide:settings',
        'lucide:users',
        'lucide:bar-chart-3',
        'lucide:calendar',
        'lucide:bell',
        'lucide:folder',
        'lucide:shield',
        'lucide:database'
      ];
      // 使用名称计算 hash，确保同一个菜单每次生成的图标一致
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      finalIcon = tempIcons[hash % tempIcons.length];
    }

    return { 
      activeIcon, 
      alwaysShow,
      badge, 
      badgeType, 
      badgeVariants, 
      icon: finalIcon, 
      name, 
      order, 
      parent: route.parent, 
      parents: route.parents, 
      path: resultPath as string, 
      show: !meta.hideInMenu, 
      children: resultChildren, 
    }; 
  }); 

  // 对菜单进行排序，避免order=0时被替换成999的问题 
  menus = sortTree(menus, (a, b) => (a?.order ?? 999) - (b?.order ?? 999)); 

  // 过滤掉隐藏的菜单项 
  const visibleMenus = filterTree(menus, (menu) => !!menu.show);

  // 处理单个子菜单提升
  return hoistSingleChild(visibleMenus);
}

export async function generateAccess(params: { roles: string[], resources?: any[], router: Router }) {
  const { resources = [], router } = params;
  
  // Generate dynamic routes from resources
  const dynamicRoutes = getTreeRoutes(resources);
  
  // Combine with existing access routes
  // cloneDeep to avoid modifying original objects
  const accessibleRoutes = cloneDeep([...accessRoutes, ...dynamicRoutes]);

  // 路由扁平化处理。解决嵌套路由keepalive失效问题
  const flatAccessibleRoutes = flattenRoutes(accessibleRoutes);

  const root = router.getRoutes().find((item) => item.path === '/');
  
  const names = root?.children?.map((item) => item.name) ?? [];

  flatAccessibleRoutes.forEach((route) => {
    if (root && !route.meta?.noBasicLayout) {
      // Avoid multi-layer BasicLayout
      // If the route has children, remove the component (assumed to be BasicLayout)
      // so it renders inside the Root's BasicLayout.
      // However, we must provide a component that renders <RouterView> for the children to show up.
      if (route.children && route.children.length > 0) {
        // delete route.component; // Original user snippet removed component, which breaks nested routing
        // Replace with a simple component that renders the children
        route.component = { render: () => h(RouterView) };
      }

      // Check for duplicates
      if (route.name && names.includes(route.name)) {
         const index = root.children?.findIndex(item => item.name === route.name);
         if (index !== undefined && index !== -1 && root.children) {
           root.children[index] = route;
         }
      } else {
        root.children?.push(route);
      }
    } else {
      router.addRoute(route);
    }
  });

  // Re-add root to apply changes
  if (root && root.name) {
    router.removeRoute(root.name);
    router.addRoute(root);
  }

  const accessibleMenus = generateMenus(accessibleRoutes, router);

  return {
    accessibleMenus, 
    accessibleRoutes,
  };
}
