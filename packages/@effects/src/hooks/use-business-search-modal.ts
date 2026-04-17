import { ref, computed } from 'vue';
import { DEFAULT_FORM_COMMON_CONFIG } from '@sunny-base-web/ui';
import type { BusinessSearchConfig, BusinessSearchAdapter } from '@sunny-base-web/ui';

export interface UseBusinessSearchModalOptions {
  /** 业务编码，必填 */
  cNum: string;
  /** 字段映射 */
  fieldNames?: { label?: string; value?: string; desc?: string };
  /** 是否多选 */
  multiple?: boolean;
  /** 确认选择回调 */
  onConfirm?: (rows: any[]) => void;
}

export interface UseBusinessSearchModalReturn {
  visible: ReturnType<typeof ref<boolean>>;
  loading: ReturnType<typeof ref<boolean>>;
  modalProps: ReturnType<typeof computed<Record<string, any>>>;
  open: () => Promise<void>;
  selectedValues: ReturnType<typeof computed<any[]>>;
  setSelectedValues: (val: any[]) => void;
}

/**
 * BusinessSearchModal Composable
 *
 * 复用 BusinessSearch 的 cNum 逻辑，直接驱动 SunnySearchModal。
 * 通过全局配置的 businessSearchAdapter 加载后端配置并执行搜索。
 */
export function useBusinessSearchModal(options: UseBusinessSearchModalOptions): UseBusinessSearchModalReturn {
  const visible = ref(false);
  const loading = ref(false);
  const loadedConfig = ref<Partial<BusinessSearchConfig>>({});
  const innerSelectedValues = ref<any[]>([]);

  const selectedValues = computed({
    get: () => innerSelectedValues.value,
    set: (val) => {
      innerSelectedValues.value = val;
    },
  });

  const setSelectedValues = (val: any[]) => {
    innerSelectedValues.value = val;
  };

  const getAdapter = (): BusinessSearchAdapter | undefined => {
    return DEFAULT_FORM_COMMON_CONFIG.businessSearchAdapter;
  };

  const createSearchProxy = (adapter: BusinessSearchAdapter) => {
    return async (params: any) => {
      if (!adapter?.search) {
        console.warn('[useBusinessSearchModal] No search adapter configured.');
        return { records: [], total: 0 };
      }
      return await adapter.search({
        ...params,
        cNum: options.cNum,
      });
    };
  };

  const loadConfig = async () => {
    const adapter = getAdapter();
    if (!adapter?.loadConfig) {
      console.warn('[useBusinessSearchModal] No loadConfig adapter configured.');
      return;
    }

    loading.value = true;
    try {
      const config = await adapter.loadConfig(options.cNum);
      config.searchApi = createSearchProxy(adapter);
      loadedConfig.value = config;
    } catch (error) {
      console.error('[useBusinessSearchModal] Failed to load config:', error);
    } finally {
      loading.value = false;
    }
  };

  const open = async () => {
    if (!loadedConfig.value.title) {
      await loadConfig();
    }
    visible.value = true;
  };

  const handleConfirm = (rows: any[]) => {
    innerSelectedValues.value = rows;
    visible.value = false;
    options.onConfirm?.(rows);
  };

  const modalProps = computed(() => {
    const mergedMultiple = options.multiple ?? loadedConfig.value.multiple ?? true;
    const mergedFieldNames = options.fieldNames
      || loadedConfig.value.fieldNames
      || { label: 'label', value: 'value' };

    // 处理表格列，自动注入选择列
    const rawColumns = loadedConfig.value.tableColumns || [];
    const tableColumns = [...rawColumns];
    const hasSelectionCol = tableColumns.some((col: any) => col.type === 'checkbox' || col.type === 'radio');

    if (!hasSelectionCol && tableColumns.length > 0) {
      if (mergedMultiple) {
        tableColumns.unshift({ type: 'checkbox', width: 50, fixed: 'left', align: 'center' });
      } else {
        tableColumns.unshift({ type: 'radio', width: 50, fixed: 'left', align: 'center' });
      }
    }

    return {
      ...loadedConfig.value,
      multiple: mergedMultiple,
      fieldNames: mergedFieldNames,
      tableColumns,
    };
  });

  return {
    visible,
    loading,
    modalProps,
    open,
    handleConfirm,
    selectedValues,
    setSelectedValues,
  };
}
