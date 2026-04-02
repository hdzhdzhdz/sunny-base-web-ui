import { ref, onMounted, getCurrentInstance, type Ref } from 'vue';
import { permissionOptionsManager } from './permission-options-manager';
import type { SelectOption, SelectFieldMapping } from '@sunny-base-web/ui';

/**
 * Hook 参数
 * Hook parameters
 */
export interface UsePermissionOptionsParams {
  /**
   * 权限编码列表
   * Permission code list
   * @description 需要批量加载的权限编码
   * @description Permission codes to be batch loaded
   */
  numbList: (string | number)[];

  /**
   * 字段映射配置
   * Field mapping configuration
   * @description 自定义 label 和 value 对应的后端字段名
   * @description Customize backend field names for label and value
   */
  fieldMapping?: SelectFieldMapping;

  /**
   * 是否立即加载
   * Whether to load immediately
   * @default true
   * @description 设置为 false 时，需要手动调用 load() 方法
   * @description When set to false, need to manually call load() method
   */
  immediate?: boolean;

  /**
   * 是否强制刷新
   * Whether to force reload
   * @default false
   * @description 设置为 true 时，忽略缓存重新加载
   * @description When set to true, ignore cache and reload
   */
  forceReload?: boolean;
}

/**
 * Hook 返回值
 * Hook return value
 */
export interface UsePermissionOptionsReturn {
  /**
   * 选项映射表
   * Options map
   * @description 响应式的选项数据，按权限编码分组
   * @description Reactive option data, grouped by permission code
   * @example
   * ```ts
   * optionsMap.value['FACTORY'] // 获取 FACTORY 权限的选项
   * ```
   */
  optionsMap: Ref<Record<string, SelectOption[]>>;

  /**
   * 加载状态
   * Loading state
   */
  loading: Ref<boolean>;

  /**
   * 手动加载
   * Manual load
   * @description 手动触发加载选项
   * @description Manually trigger loading options
   */
  load: () => Promise<void>;

  /**
   * 获取单个权限的选项
   * Get single permission options
   * @param code - 权限编码
   * @returns 选项数组
   */
  getOptions: (code: string | number) => SelectOption[];

  /**
   * 刷新指定权限的选项
   * Reload specific permission options
   * @param code - 权限编码
   */
  reload: (code: string | number) => Promise<void>;

  /**
   * 清除指定权限的缓存
   * Clear cache for specific permission
   * @param code - 权限编码（可选）
   */
  clearCache: (code?: string | number) => void;
}

/**
 * 权限选项加载 Hook
 * Permission options loading Hook
 * @description 批量加载多个权限选项，自动缓存和去重
 * @description Batch load multiple permission options with automatic caching and deduplication
 *
 * @param params - Hook 参数
 * @returns 选项数据和加载方法
 *
 * @example
 * ```ts
 * // 基础用法
 * const { optionsMap } = usePermissionOptions({
 *   numbList: ['FACTORY', 'COMPANY']
 * });
 *
 * // 在模板中使用
 * <Select :options="optionsMap.value['FACTORY']" />
 *
 * // 自定义字段映射
 * const { optionsMap } = usePermissionOptions({
 *   numbList: ['FACTORY'],
 *   fieldMapping: {
 *     label: 'cName',
 *     value: 'cXuhao'
 *   }
 * });
 *
 * // 手动加载
 * const { optionsMap, load } = usePermissionOptions({
 *   numbList: ['FACTORY'],
 *   immediate: false
 * });
 *
 * // 在需要时调用
 * await load();
 * ```
 */
export function usePermissionOptions(
  params: UsePermissionOptionsParams
): UsePermissionOptionsReturn {
  const { numbList, fieldMapping, immediate = true, forceReload = false } = params;

  // 响应式状态
  const optionsMap = ref<Record<string, SelectOption[]>>({});
  const loading = ref(false);

  /**
   * 加载选项
   * Load options
   */
  const load = async () => {
    if (!numbList || numbList.length === 0) {
      return;
    }

    loading.value = true;
    try {
      const result = await permissionOptionsManager.loadOptions(
        numbList,
        fieldMapping,
        forceReload
      );
      optionsMap.value = result;
    } catch (error) {
      console.error('[usePermissionOptions] Failed to load options:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取单个权限的选项
   * Get single permission options
   */
  const getOptions = (code: string | number): SelectOption[] => {
    return optionsMap.value[String(code)] || [];
  };

  /**
   * 刷新指定权限的选项
   * Reload specific permission options
   */
  const reload = async (code: string | number) => {
    // 清除指定权限的缓存
    permissionOptionsManager.clearCache(code);

    // 重新加载
    const result = await permissionOptionsManager.loadOptions(
      [code],
      fieldMapping,
      true
    );

    // 更新对应的选项
    optionsMap.value = {
      ...optionsMap.value,
      ...result,
    };
  };

  /**
   * 清除指定权限的缓存
   * Clear cache for specific permission
   */
  const clearCache = (code?: string | number) => {
    permissionOptionsManager.clearCache(code);

    if (code) {
      // 从 optionsMap 中移除
      const newMap = { ...optionsMap.value };
      delete newMap[String(code)];
      optionsMap.value = newMap;
    } else {
      // 清空所有
      optionsMap.value = {};
    }
  };

  // 立即加载
  if (immediate && numbList && numbList.length > 0) {
    // 检查是否在组件上下文中（通过 getCurrentInstance 检测）
    // Check if in component context (via getCurrentInstance)
    const instance = getCurrentInstance();

    if (instance) {
      // 在组件上下文中，使用 onMounted
      onMounted(() => {
        load();
      });
    } else {
      // 不在组件上下文中，立即加载
      load();
    }
  }

  return {
    optionsMap,
    loading,
    load,
    getOptions,
    reload,
    clearCache,
  };
}
