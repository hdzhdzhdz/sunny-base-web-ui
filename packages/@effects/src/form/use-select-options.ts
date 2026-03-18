import { ref, onMounted, getCurrentInstance, type Ref } from 'vue';
import { selectOptionsManager } from './select-options-manager';
import type { SelectOption, SelectFieldMapping } from '@sunny-base-web/ui';

/**
 * Hook 参数
 * Hook parameters
 */
export interface UseSelectOptionsParams {
  /**
   * 字典编码列表
   * Dictionary code list
   * @description 需要批量加载的字典编码
   * @description Dictionary codes to be batch loaded
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
export interface UseSelectOptionsReturn {
  /**
   * 选项映射表
   * Options map
   * @description 响应式的选项数据，按字典编码分组
   * @description Reactive option data, grouped by dictionary code
   * @example
   * ```ts
   * optionsMap.value['SFQY'] // 获取 SFQY 字典的选项
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
   * 获取单个字典的选项
   * Get single dictionary options
   * @param dictCode - 字典编码
   * @returns 选项数组
   */
  getOptions: (dictCode: string | number) => SelectOption[];

  /**
   * 刷新指定字典的选项
   * Reload specific dictionary options
   * @param dictCode - 字典编码
   */
  reload: (dictCode: string | number) => Promise<void>;

  /**
   * 清除指定字典的缓存
   * Clear cache for specific dictionary
   * @param dictCode - 字典编码（可选）
   */
  clearCache: (dictCode?: string | number) => void;
}

/**
 * Select 选项加载 Hook
 * Select options loading Hook
 * @description 批量加载多个字典选项，自动缓存和去重
 * @description Batch load multiple dictionary options with automatic caching and deduplication
 *
 * @param params - Hook 参数
 * @returns 选项数据和加载方法
 *
 * @example
 * ```ts
 * // 基础用法
 * const { optionsMap } = useSelectOptions({
 *   numbList: ['SFQY', 'LANG']
 * });
 *
 * // 在 Schema 中使用
 * componentProps: {
 *   options: optionsMap.value['SFQY']
 * }
 *
 * // 自定义字段映射
 * const { optionsMap } = useSelectOptions({
 *   numbList: ['USER_STATUS'],
 *   fieldMapping: {
 *     label: 'statusName',
 *     value: 'statusCode'
 *   }
 * });
 *
 * // 手动加载
 * const { optionsMap, load } = useSelectOptions({
 *   numbList: ['USER_LIST'],
 *   immediate: false
 * });
 *
 * // 在需要时调用
 * await load();
 * ```
 */
export function useSelectOptions(
  params: UseSelectOptionsParams
): UseSelectOptionsReturn {
  const {
    numbList,
    fieldMapping,
    immediate = true,
    forceReload = false
  } = params;

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
      const result = await selectOptionsManager.loadOptions(
        numbList,
        fieldMapping,
        forceReload
      );
      optionsMap.value = result;
    } catch (error) {
      console.error('[useSelectOptions] Failed to load options:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取单个字典的选项
   * Get single dictionary options
   */
  const getOptions = (dictCode: string | number): SelectOption[] => {
    return optionsMap.value[String(dictCode)] || [];
  };

  /**
   * 刷新指定字典的选项
   * Reload specific dictionary options
   */
  const reload = async (dictCode: string | number) => {
    // 清除指定字典的缓存
    selectOptionsManager.clearCache(dictCode);

    // 重新加载
    const result = await selectOptionsManager.loadOptions(
      [dictCode],
      fieldMapping,
      true
    );

    // 更新对应的选项
    optionsMap.value = {
      ...optionsMap.value,
      ...result
    };
  };

  /**
   * 清除指定字典的缓存
   * Clear cache for specific dictionary
   */
  const clearCache = (dictCode?: string | number) => {
    selectOptionsManager.clearCache(dictCode);

    if (dictCode) {
      // 从 optionsMap 中移除
      const newMap = { ...optionsMap.value };
      delete newMap[String(dictCode)];
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
