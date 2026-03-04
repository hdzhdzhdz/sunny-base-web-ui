import { ref, computed, watch, type WritableComputedRef, type Ref } from 'vue';
import type { SetupContext } from 'vue';
import type { SunnyBusinessSearchProps, BusinessSearchConfig } from './types';
import { getBusinessConfig } from './configs';
import { DEFAULT_FORM_COMMON_CONFIG } from '../../entry/form/config';
import type { BusinessSearchAdapter } from '../../entry/form/types';

export interface UseSunnyBusinessSearchReturn {
  visible: Ref<boolean>;
  loading: Ref<boolean>;
  currentConfig: Ref<Partial<BusinessSearchConfig>>;
  selectedValues: WritableComputedRef<any[]>;
  handleOpen: () => Promise<void>;
  handleConfirm: (rows: any[]) => void;
}

/**
 * BusinessSearch Hook
 *
 * 组件只负责 UI 组合，所有数据获取和格式转换都由 businessSearchAdapter 负责
 * The component only handles UI composition, all data fetching and transformation is handled by businessSearchAdapter
 */
export function useSunnyBusinessSearch(
  props: SunnyBusinessSearchProps,
  emit: SetupContext['emit']
): UseSunnyBusinessSearchReturn {
  const visible = ref(false);
  const loading = ref(false);
  const currentConfig = ref<Partial<BusinessSearchConfig>>({});

  // 内部维护的选中值，用于回显
  const selectedValues = computed({
    get: () => props.modelValue || [],
    set: (val) => {
      emit('update:modelValue', val);
      emit('change', val);
    },
  });

  /**
   * 获取全局配置的 adapter
   * Get the globally configured adapter
   */
  const getAdapter = (): BusinessSearchAdapter | undefined => {
    return DEFAULT_FORM_COMMON_CONFIG.businessSearchAdapter;
  };

  /**
   * 创建搜索代理函数
   * 这个函数会被注入到 currentConfig.searchApi 中，供 SunnySearchModal 调用
   */
  const createSearchProxy = (adapter: BusinessSearchAdapter) => {
    return async (params: any) => {
      if (!adapter?.search) {
        console.warn('[SunnyBusinessSearch] No search adapter configured.');
        return { records: [], total: 0 };
      }

      try {
        // 调用 adapter.search，它负责：
        // 1. 参数格式转换
        // 2. 调用后端接口
        // 3. 结果格式转换
        // 4. 返回 { records, total } 格式
        return await adapter.search({
          ...params,
          cNum: props.cNum,
        });
      } catch (error) {
        console.error('[SunnyBusinessSearch] Search failed:', error);
        throw error;
      }
    };
  };

  /**
   * 加载动态配置
   * Load dynamic configuration
   */
  const loadDynamicConfig = async () => {
    if (!props.cNum) return;

    const adapter = getAdapter();
    if (!adapter?.loadConfig) {
      console.warn(
        '[SunnyBusinessSearch] No loadConfig adapter configured. Please call setupBusinessForm() in your app entry.',
      );
      return;
    }

    loading.value = true;
    try {
      // 调用 adapter.loadConfig，它负责：
      // 1. 调用后端接口
      // 2. 格式转换
      // 3. 返回 BusinessSearchConfig 格式
      const config = await adapter.loadConfig(props.cNum);

      // 注入搜索代理函数
      config.searchApi = createSearchProxy(adapter);

      currentConfig.value = config;
    } catch (error) {
      console.error('[SunnyBusinessSearch] Failed to load dynamic config:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载静态配置
   * Load static configuration
   */
  const loadStaticConfig = async () => {
    if (!props.type) return;

    loading.value = true;
    try {
      const config = await getBusinessConfig(props.type);
      if (config) {
        currentConfig.value = config;
      }
    } catch (error) {
      console.error('[SunnyBusinessSearch] Failed to load static config:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 打开弹窗
   * Open modal
   */
  const handleOpen = async () => {
    visible.value = true;

    // 优先动态配置
    if (props.cNum) {
      if (!currentConfig.value.title) {
        await loadDynamicConfig();
      }
    } else if (props.type) {
      if (!currentConfig.value.title) {
        await loadStaticConfig();
      }
    }
  };

  /**
   * 确认选择
   * Confirm selection
   */
  const handleConfirm = (rows: any[]) => {
    selectedValues.value = rows;
    visible.value = false;
  };

  /**
   * 监听 cNum 或 type 变化，重置配置
   * Reset config when cNum or type changes
   */
  watch(
    () => [props.cNum, props.type],
    () => {
      currentConfig.value = {};
    },
  );

  return {
    visible,
    loading,
    currentConfig,
    selectedValues,
    handleOpen,
    handleConfirm,
  };
}
