import type {
  RouteLocationNormalized,
  Router,
  RouteRecordNormalized,
} from 'vue-router';

import type { TabDefinition } from '../types';

import { toRaw } from 'vue';

import { TABBAR_MAX_COUNT } from '@sunny-base-web/constants';
import { startProgress, stopProgress } from '@kunkka/ui';

import { acceptHMRUpdate, defineStore } from 'pinia';

interface TabbarState {
  /**
   * @zh_CN 当前打开的标签页列表缓存
   */
  cachedTabs: Set<string>;
  /**
   * @zh_CN 需要排除缓存的标签页
   */
  excludeCachedTabs: Set<string>;
  /**
   * @zh_CN 是否渲染路由视图（用于刷新）
   */
  renderRouteView?: boolean;
  /**
   * @zh_CN 当前打开的标签页列表
   */
  tabs: TabDefinition[];
  /**
   * @zh_CN 是否内容区域全屏
   */
  contentFullScreen: boolean;
}

/**
 * @zh_CN Tabbar标签页状态管理
 */
export const useTabbarStore = defineStore('core-tabbar', {
  state: (): TabbarState => ({
    cachedTabs: new Set(),
    excludeCachedTabs: new Set(),
    renderRouteView: true,
    tabs: [],
    contentFullScreen: false,
  }),
  getters: {
    /**
     * @zh_CN 获取固定标签页
     */
    affixTabs(): TabDefinition[] {
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab));

      return affixTabs.toSorted((a, b) => {
        const orderA = (a.meta?.affixTabOrder ?? 0) as number;
        const orderB = (b.meta?.affixTabOrder ?? 0) as number;
        return orderA - orderB;
      });
    },
    /**
     * @zh_CN 获取缓存的标签页名称列表
     */
    getCachedTabs(): string[] {
      return [...this.cachedTabs];
    },
    /**
     * @zh_CN 获取排除缓存的标签页名称列表
     */
    getExcludeCachedTabs(): string[] {
      return [...this.excludeCachedTabs];
    },
    /**
     * @zh_CN 获取所有显示的标签页（固定+普通）
     */
    getTabs(): TabDefinition[] {
      const normalTabs = this.tabs.filter((tab) => !isAffixTab(tab));
      return [...this.affixTabs, ...normalTabs].filter(Boolean);
    },
  },
  actions: {
    /**
     * @zh_CN 切换内容区域全屏状态
     * @param isFullScreen 是否全屏，不传则取反
     */
    toggleContentFullScreen(isFullScreen?: boolean) {
      if (typeof isFullScreen === 'boolean') {
        this.contentFullScreen = isFullScreen;
      } else {
        this.contentFullScreen = !this.contentFullScreen;
      }
    },

    /**
     * @zh_CN 添加标签页
     * @param routeTab 路由对象
     */
    addTab(routeTab: TabDefinition): TabDefinition {
      let tab = cloneTab(routeTab);
      if (!tab.key) {
        tab.key = getTabKey(routeTab);
      }
      if (!isTabShown(tab)) {
        return tab;
      }

      const tabIndex = this.tabs.findIndex((item) => {
        return equalTab(item, tab);
      });

      if (tabIndex === -1) {
        const maxCount = TABBAR_MAX_COUNT;
        // 获取动态路由打开数，超过 0 即代表需要控制打开数
        const maxNumOfOpenTab = (routeTab?.meta?.maxNumOfOpenTab ?? -1) as number;
        
        // 处理动态路由打开数量限制
        if (
          maxNumOfOpenTab > 0 &&
          this.tabs.filter((tab) => tab.name === routeTab.name).length >= maxNumOfOpenTab
        ) {
          const index = this.tabs.findIndex((item) => item.name === routeTab.name);
          index !== -1 && this.tabs.splice(index, 1);
        } 
        // 处理总标签页数量限制
        else if (maxCount > 0 && this.tabs.length >= maxCount) {
          const index = this.tabs.findIndex(
            (item) => !Reflect.has(item.meta, 'affixTab') || !item.meta.affixTab,
          );
          index !== -1 && this.tabs.splice(index, 1);
        }
        this.tabs.push(tab);
      } else {
        // 更新已有标签页
        const currentTab = toRaw(this.tabs)[tabIndex];
        const mergedTab = {
          ...currentTab,
          ...tab,
          meta: { ...currentTab?.meta, ...tab.meta },
        };
        if (currentTab) {
          const curMeta = currentTab.meta;
          if (Reflect.has(curMeta, 'affixTab')) {
            mergedTab.meta.affixTab = curMeta.affixTab;
          }
          if (Reflect.has(curMeta, 'newTabTitle')) {
            mergedTab.meta.newTabTitle = curMeta.newTabTitle;
          }
        }
        tab = mergedTab;
        this.tabs.splice(tabIndex, 1, mergedTab);
      }
      this.updateCacheTabs();
      return tab;
    },

    /**
     * @zh_CN 关闭标签页
     * @param tab 目标标签
     * @param router 路由实例
     */
    async closeTab(tab: TabDefinition, router: Router) {
      const { currentRoute } = router;
      // 如果关闭的不是当前激活的标签，直接关闭
      if (getTabKey(currentRoute.value) !== getTabKeyFromTab(tab)) {
        this._close(tab);
        this.updateCacheTabs();
        return;
      }
      
      // 关闭的是当前激活标签，需要跳转到相邻标签
      const index = this.getTabs.findIndex(
        (item) => getTabKeyFromTab(item) === getTabKey(currentRoute.value),
      );

      const before = this.getTabs[index - 1];
      const after = this.getTabs[index + 1];

      if (after) {
        this._close(tab);
        await this._goToTab(after, router);
      } else if (before) {
        this._close(tab);
        await this._goToTab(before, router);
      } else {
        console.error('Failed to close the tab; only one tab remains open.');
      }
    },

    /**
     * @zh_CN 关闭所有标签页
     * @param router 路由实例
     */
    async closeAllTabs(router: Router) {
      const newTabs = this.tabs.filter((tab) => isAffixTab(tab));
      this.tabs = newTabs.length > 0 ? newTabs : [...this.tabs].splice(0, 1);
      await this._goToDefaultTab(router);
      this.updateCacheTabs();
    },

    /**
     * @zh_CN 关闭其他标签页
     * @param tab 保留的标签
     */
    async closeOtherTabs(tab: TabDefinition) {
      const closeKeys = this.tabs.map((item) => getTabKeyFromTab(item));
      const keys: string[] = [];

      for (const key of closeKeys) {
        if (key !== getTabKeyFromTab(tab)) {
          const closeTab = this.tabs.find(
            (item) => getTabKeyFromTab(item) === key,
          );
          if (!closeTab) continue;
          
          if (!isAffixTab(closeTab)) {
            keys.push(closeTab.key as string);
          }
        }
      }
      await this._bulkCloseByKeys(keys);
    },

    /**
     * @zh_CN 刷新标签页
     * @param router 路由实例或路由名称
     */
    async refresh(router: Router | string) {
      if (typeof router === 'string') {
        return await this.refreshByName(router);
      }

      const { currentRoute } = router;
      const { name } = currentRoute.value;

      this.excludeCachedTabs.add(name as string);
      this.renderRouteView = false;
      startProgress();

      await new Promise((resolve) => setTimeout(resolve, 200));

      this.excludeCachedTabs.delete(name as string);
      this.renderRouteView = true;
      stopProgress();
    },

    /**
     * @zh_CN 切换标签页固定状态
     * @param tab 目标标签
     */
    async toggleTabPin(tab: TabDefinition) {
      const affixTab = tab?.meta?.affixTab ?? false;
      await (affixTab ? this.unpinTab(tab) : this.pinTab(tab));
    },

    /**
     * @zh_CN 新窗口打开标签页
     * @param tab 目标标签
     */
    async openTabInNewWindow(tab: TabDefinition) {
      window.open(tab.fullPath || tab.path, '_blank');
    },

    /**
     * @zh_CN 设置固定标签页
     * @param tabs 路由记录列表
     */
    setAffixTabs(tabs: RouteRecordNormalized[]) {
      for (const tab of tabs) {
        tab.meta.affixTab = true;
        this.addTab(routeToTab(tab));
      }
    },

    /**
     * @zh_CN 固定标签页（内部使用）
     */
    async pinTab(tab: TabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab));
      if (index === -1) return;

      const oldTab = this.tabs[index];
      tab.meta.affixTab = true;
      tab.meta.title = oldTab?.meta?.title as string;
      
      this.tabs.splice(index, 1, tab);
      
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab));
      const newIndex = affixTabs.findIndex((item) => equalTab(item, tab));
      
      await this.sortTabs(index, newIndex);
    },

    /**
     * @zh_CN 取消固定标签页（内部使用）
     */
    async unpinTab(tab: TabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab));
      if (index === -1) return;

      const oldTab = this.tabs[index];
      tab.meta.affixTab = false;
      tab.meta.title = oldTab?.meta?.title as string;
      
      this.tabs.splice(index, 1, tab);
      
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab));
      const newIndex = affixTabs.length;
      
      await this.sortTabs(index, newIndex);
    },

    /**
     * @zh_CN 批量关闭标签页（内部使用）
     */
    async _bulkCloseByKeys(keys: string[]) {
      const keySet = new Set(keys);
      this.tabs = this.tabs.filter(
        (item) => !keySet.has(getTabKeyFromTab(item)),
      );
      await this.updateCacheTabs();
    },

    /**
     * @zh_CN 内部关闭单个标签页（不处理跳转）
     */
    _close(tab: TabDefinition) {
      if (isAffixTab(tab)) return;
      const index = this.tabs.findIndex((item) => equalTab(item, tab));
      index !== -1 && this.tabs.splice(index, 1);
    },

    /**
     * @zh_CN 跳转到默认标签页（内部使用）
     */
    async _goToDefaultTab(router: Router) {
      if (this.getTabs.length <= 0) return;
      const firstTab = this.getTabs[0];
      if (firstTab) {
        await this._goToTab(firstTab, router);
      }
    },

    /**
     * @zh_CN 跳转到指定标签页（内部使用）
     */
    async _goToTab(tab: TabDefinition, router: Router) {
      const { params, path, query } = tab;
      const toParams = {
        params: params || {},
        path,
        query: query || {},
      };
      await router.replace(toParams);
    },

    /**
     * @zh_CN 根据名称刷新（内部使用）
     */
    async refreshByName(name: string) {
      this.excludeCachedTabs.add(name);
      await new Promise((resolve) => setTimeout(resolve, 200));
      this.excludeCachedTabs.delete(name);
    },

    /**
     * @zh_CN 排序标签页（内部使用）
     */
    async sortTabs(oldIndex: number, newIndex: number) {
      const currentTab = this.tabs[oldIndex];
      if (!currentTab) return;
      this.tabs.splice(oldIndex, 1);
      this.tabs.splice(newIndex, 0, currentTab);
    },

    /**
     * @zh_CN 更新缓存状态（内部使用）
     */
    async updateCacheTabs() {
      const cacheMap = new Set<string>();

      for (const tab of this.tabs) {
        const keepAlive = tab.meta?.keepAlive;
        if (!keepAlive) continue;

        (tab.matched || []).forEach((t, i) => {
          if (i > 0) {
            cacheMap.add(t.name as string);
          }
        });

        const name = tab.name as string;
        cacheMap.add(name);
      }
      this.cachedTabs = cacheMap;
    },
  },
  persist: [
    {
      pick: ['tabs'],
      storage: sessionStorage,
    },
  ],
});

// 解决热更新问题
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useTabbarStore, hot));
}

// --- 内部辅助函数 ---

/**
 * @zh_CN 克隆路由对象
 */
function cloneTab(route: TabDefinition): TabDefinition {
  if (!route) return route;
  const { matched, meta, ...opt } = route;
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path,
        }))
      : undefined) as RouteRecordNormalized[],
    meta: {
      ...meta,
      newTabTitle: meta.newTabTitle,
    },
  };
}

/**
 * @zh_CN 判断是否为固定标签
 */
function isAffixTab(tab: TabDefinition) {
  return tab?.meta?.affixTab ?? false;
}

/**
 * @zh_CN 判断是否显示标签
 */
function isTabShown(tab: TabDefinition) {
  const matched = tab?.matched ?? [];
  return !tab.meta.hideInTab && matched.every((item) => !item.meta.hideInTab);
}

/**
 * @zh_CN 获取路由的唯一键
 */
function getTabKey(tab: RouteLocationNormalized | RouteRecordNormalized) {
  const {
    fullPath,
    path,
    meta: { fullPathKey } = {},
    query = {},
  } = tab as RouteLocationNormalized;
  
  const pageKey = Array.isArray(query.pageKey)
    ? query.pageKey[0]
    : query.pageKey;
    
  let rawKey;
  if (pageKey) {
    rawKey = pageKey;
  } else {
    rawKey = fullPathKey === false ? path : (fullPath ?? path);
  }
  try {
    return decodeURIComponent(rawKey);
  } catch {
    return rawKey;
  }
}

/**
 * @zh_CN 从标签对象获取唯一键
 */
function getTabKeyFromTab(tab: TabDefinition): string {
  return tab.key ?? getTabKey(tab);
}

/**
 * @zh_CN 比较两个标签是否相同
 */
function equalTab(a: TabDefinition, b: TabDefinition) {
  return getTabKeyFromTab(a) === getTabKeyFromTab(b);
}

/**
 * @zh_CN 路由对象转标签对象
 */
function routeToTab(route: RouteRecordNormalized) {
  return {
    meta: route.meta,
    name: route.name,
    path: route.path,
    key: getTabKey(route),
  } as TabDefinition;
}
