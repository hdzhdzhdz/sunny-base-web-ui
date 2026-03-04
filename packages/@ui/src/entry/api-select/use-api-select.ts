import { ref, computed, watch, onMounted } from 'vue';
import { useFormValues } from 'vee-validate';
import type { ApiSelectProps, SelectOption } from './types';

export interface UseApiSelectReturn {
  options: ReturnType<typeof ref<SelectOption[]>>;
  loading: ReturnType<typeof ref<boolean>>;
  error: ReturnType<typeof ref<string | null>>;
  depValues: ReturnType<typeof computed<Record<string, any>>>;
  isReady: ReturnType<typeof computed<boolean>>;
  fetchOptions: () => Promise<void>;
  clearOptions: () => void;
  handleSearch: (value: string) => void;
  searchKeyword: ReturnType<typeof ref<string>>;
}

export function useApiSelect(props: ApiSelectProps, emit: any): UseApiSelectReturn {
  const formValues = useFormValues();

  const options = ref<SelectOption[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchKeyword = ref('');

  // 防抖定时器
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // 解析 API 配置
  const apiConfig = computed(() => {
    if (typeof props.api === 'function') {
      return { api: props.api, paramsMapper: undefined, resultMapper: undefined };
    }
    return props.api;
  });

  // 获取依赖值
  const depValues = computed(() => {
    const values = formValues.value || {};
    return props.deps.reduce((acc, key) => {
      acc[key] = values[key];
      return acc;
    }, {} as Record<string, any>);
  });

  // 搜索参数字段名
  const searchField = computed(() => props.searchField || 'keyword');

  // 是否就绪
  const isReady = computed(() => {
    // 如果支持搜索，只要有搜索关键字就认为就绪
    if (props.allowSearch && searchKeyword.value) {
      return true;
    }
    // 否则检查 deps 是否都有值
    return props.deps.every(key => {
      const val = depValues.value[key];
      return val !== undefined && val !== null && val !== '';
    });
  });

  // 清空
  const clearOptions = () => {
    options.value = [];
    emit('update:modelValue', props.multiple ? [] : undefined);
  };

  // 请求数据
  const fetchOptions = async () => {
    // 检查是否需要清空选项
    if (!isReady.value) {
      if (props.clearOptionsWhenEmpty !== false) {
        clearOptions();
      }
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const { api, paramsMapper, resultMapper } = apiConfig.value;

      // 构建搜索参数
      const searchParams = searchKeyword.value
        ? { [searchField.value]: searchKeyword.value }
        : {};

      // 构建参数
      let params: Record<string, any>;
      if (paramsMapper) {
        // 如果 paramsMapper 是3个参数，传入搜索参数
        params = paramsMapper(formValues.value, depValues.value, searchParams);
      } else {
        params = { ...depValues.value, ...searchParams };
      }

      // 合并额外参数
      if (props.extraParams) {
        params = { ...props.extraParams, ...params };
      }

      const result = await api(params);
      const mapped = resultMapper ? resultMapper(result) : result;

      options.value = Array.isArray(mapped) ? mapped : [];
      emit('optionsLoaded', options.value);
    } catch (err: any) {
      error.value = err.message || '请求失败';
      options.value = [];
      emit('error', err);
      console.error('[SunnyApiSelect] Request failed:', err);
    } finally {
      loading.value = false;
    }
  };

  // 处理搜索输入（带防抖）
  const handleSearch = (value: string) => {
    // 清除之前的定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 设置新的定时器
    const debounceMs = props.searchDebounce ?? 300;
    debounceTimer = setTimeout(() => {
      searchKeyword.value = value;
      fetchOptions();
    }, debounceMs);
  };

  // 监听依赖变化
  watch(
    depValues,
    (newVal, oldVal) => {
      if (oldVal && props.deps.some(k => newVal[k] !== oldVal[k])) {
        // 依赖变化时自动清空当前选中值和搜索关键字，然后重新请求
        searchKeyword.value = '';
        emit('update:modelValue', props.multiple ? [] : undefined);
        fetchOptions();
      }
    },
    { deep: true, immediate: false }
  );

  // 组件挂载时
  onMounted(() => {
    if (props.immediate !== false && isReady.value) {
      fetchOptions();
    }
  });

  // 组件卸载时清除定时器
  onMounted(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  });

  return {
    options,
    loading,
    error,
    depValues,
    isReady,
    fetchOptions,
    clearOptions,
    handleSearch,
    searchKeyword,
  };
}
