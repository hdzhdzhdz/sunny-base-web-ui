import { DEFAULT_FORM_COMMON_CONFIG } from '@sunny-base-web/ui';
import type { SelectOption, SelectFieldMapping } from '@sunny-base-web/ui';

/**
 * Select 选项缓存管理器
 * Select options cache manager
 * @description 统一管理所有 Select 的选项加载和缓存，支持请求去重
 * @description Unified management of all Select option loading and caching with request deduplication
 */
class SelectOptionsManager {
  /**
   * 选项缓存
   * Options cache
   * @description 缓存已加载的选项数据
   * @description Cache loaded option data
   */
  private readonly cache: Map<string, SelectOption[]> = new Map();

  /**
   * 加载中的 Promise（避免重复请求）
   * Loading Promises (avoid duplicate requests)
   * @description 当多个组件同时加载相同字典时，共享同一个 Promise
   * @description When multiple components load the same dictionary simultaneously, share the same Promise
   */
  private readonly loadingPromises: Map<string, Promise<Record<string, SelectOption[]>>> = new Map();

  /**
   * 批量加载选项（带缓存和去重）
   * Batch load options (with cache and deduplication)
   * @param numbList - 字典编码列表
   * @param fieldMapping - 字段映射配置
   * @param forceReload - 是否强制刷新（忽略缓存）
   * @returns 选项映射表 { dictCode: options }
   */
  async loadOptions(
    numbList: (string | number)[],
    fieldMapping?: SelectFieldMapping,
    forceReload = false
  ): Promise<Record<string, SelectOption[]>> {
    const adapter = DEFAULT_FORM_COMMON_CONFIG.selectOptionsAdapter;

    if (!adapter?.loadOptions) {
      console.warn('[SelectOptionsManager] Adapter not configured');
      return {};
    }

    if (!numbList || numbList.length === 0) {
      return {};
    }

    // 筛选出需要加载的字典（未缓存或强制刷新）
    // Filter dictionaries that need to be loaded (uncached or force reload)
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
    const cacheKey = toLoad.map(String).sort((a, b) => a.localeCompare(b)).join(',');
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
   * 获取单个字典的选项（从缓存）
   * Get single dictionary options (from cache)
   * @param dictCode - 字典编码
   * @returns 选项数组
   */
  getOptions(dictCode: string | number): SelectOption[] {
    return this.cache.get(String(dictCode)) || [];
  }

  /**
   * 清除指定字典的缓存
   * Clear cache for specified dictionary
   * @param dictCode - 字典编码（可选，不传则清除所有）
   */
  clearCache(dictCode?: string | number) {
    if (dictCode) {
      this.cache.delete(String(dictCode));
    } else {
      this.cache.clear();
    }
  }

  /**
   * 检查字典是否已缓存
   * Check if dictionary is cached
   * @param dictCode - 字典编码
   * @returns 是否已缓存
   */
  hasCache(dictCode: string | number): boolean {
    return this.cache.has(String(dictCode));
  }

  /**
   * 获取缓存大小
   * Get cache size
   * @returns 缓存的字典数量
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// 单例实例
// Singleton instance
export const selectOptionsManager = new SelectOptionsManager();
