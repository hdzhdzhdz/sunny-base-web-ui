import { DEFAULT_FORM_COMMON_CONFIG } from '@sunny-base-web/ui';
import type { SelectOption, PermissionFieldMapping } from '@sunny-base-web/ui';

/**
 * 权限选项缓存管理器
 * Permission options cache manager
 * @description 统一管理所有权限选项的加载和缓存，支持请求去重
 * @description Unified management of all permission option loading and caching with request deduplication
 */
class PermissionOptionsManager {
  /**
   * 选项缓存
   * Options cache
   * @description 缓存已加载的权限选项数据
   * @description Cache loaded permission option data
   */
  private readonly cache: Map<string, SelectOption[]> = new Map();

  /**
   * 加载中的 Promise（避免重复请求）
   * Loading Promises (avoid duplicate requests)
   * @description 当多个组件同时加载相同权限时，共享同一个 Promise
   * @description When multiple components load the same permission simultaneously, share the same Promise
   */
  private readonly loadingPromises: Map<
    string,
    Promise<Record<string, SelectOption[]>>
  > = new Map();

  /**
   * 批量加载权限选项（带缓存和去重）
   * Batch load permission options (with cache and deduplication)
   * @param numbList - 权限编码列表
   * @param fieldMapping - 字段映射配置
   * @param forceReload - 是否强制刷新（忽略缓存）
   * @returns 选项映射表 { code: options }
   */
  async loadOptions(
    numbList: (string | number)[],
    fieldMapping?: PermissionFieldMapping,
    forceReload = false
  ): Promise<Record<string, SelectOption[]>> {
    const adapter = DEFAULT_FORM_COMMON_CONFIG.permissionOptionsAdapter;

    if (!adapter?.loadOptions) {
      console.warn('[PermissionOptionsManager] Adapter not configured');
      return {};
    }

    if (!numbList || numbList.length === 0) {
      return {};
    }

    // 筛选出需要加载的权限（未缓存或强制刷新）
    // Filter permissions that need to be loaded (uncached or force reload)
    const toLoad = forceReload
      ? numbList
      : numbList.filter((key) => !this.cache.has(String(key)));

    if (toLoad.length === 0) {
      // 所有选项都已缓存，直接返回
      // All options are cached, return directly
      const result: Record<string, SelectOption[]> = {};
      numbList.forEach((key) => {
        result[String(key)] = this.cache.get(String(key)) || [];
      });
      return result;
    }

    // 检查是否已有相同的批量请求正在进行
    // Check if the same batch request is already in progress
    const cacheKey = toLoad
      .map(String)
      .sort((a, b) => a.localeCompare(b))
      .join(',');
    let loadingPromise = this.loadingPromises.get(cacheKey);

    if (!loadingPromise) {
      // 发起新的批量请求
      // Initiate new batch request
      loadingPromise = adapter.loadOptions(toLoad, fieldMapping);
      this.loadingPromises.set(cacheKey, loadingPromise);
    }

    try {
      const optionsMap = await loadingPromise;

      // 更新缓存
      // Update cache
      if (optionsMap && typeof optionsMap === 'object') {
        Object.keys(optionsMap).forEach((key: string) => {
          this.cache.set(key, optionsMap[key]);
        });
      }

      // 返回请求的选项（包含从缓存获取的）
      // Return requested options (including from cache)
      const result: Record<string, SelectOption[]> = {};
      numbList.forEach((key) => {
        result[String(key)] = this.cache.get(String(key)) || [];
      });

      return result;
    } finally {
      // 清除 loading Promise
      // Clear loading Promise
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * 获取单个权限的选项（从缓存）
   * Get single permission options (from cache)
   * @param code - 权限编码
   * @returns 选项数组
   */
  getOptions(code: string | number): SelectOption[] {
    return this.cache.get(String(code)) || [];
  }

  /**
   * 清除指定权限的缓存
   * Clear cache for specified permission
   * @param code - 权限编码（可选，不传则清除所有）
   */
  clearCache(code?: string | number) {
    if (code) {
      this.cache.delete(String(code));
    } else {
      this.cache.clear();
    }
  }

  /**
   * 检查权限是否已缓存
   * Check if permission is cached
   * @param code - 权限编码
   * @returns 是否已缓存
   */
  hasCache(code: string | number): boolean {
    return this.cache.has(String(code));
  }

  /**
   * 获取缓存大小
   * Get cache size
   * @returns 缓存的权限数量
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// 单例实例
// Singleton instance
export const permissionOptionsManager = new PermissionOptionsManager();
