import { ref, computed, watch, type WritableComputedRef, type Ref } from 'vue';
import axios from 'axios';
import type { SetupContext } from 'vue';
import type { SunnyBusinessSearchProps, BusinessSearchConfig, DynamicConfigResponse } from './types';
import { mapDynamicConfig, mapSearchRequest } from './utils/mapper';
import { getBusinessConfig } from './configs';

export interface UseSunnyBusinessSearchReturn {
  visible: Ref<boolean>;
  loading: Ref<boolean>;
  currentConfig: Ref<Partial<BusinessSearchConfig>>;
  selectedValues: WritableComputedRef<any[]>;
  handleOpen: () => Promise<void>;
  handleConfirm: (rows: any[]) => void;
}

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
    }
  });

  // 动态搜索代理函数
  const dynamicSearchProxy = async (params: any) => {
    if (!props.cNum) return { records: [], total: 0 };
    
    const payload = mapSearchRequest(params, props.cNum);
    try {
      const res = await axios.post('/core/assDialog/selectForPageCommon', payload);
      // 直接返回 result，因为 mapSearchRequest 已经处理了参数，
      // 而后端返回结构 (records, total) 与组件期望一致 (或由 SunnySearchModal 处理)
      return res.data?.result || { records: [], total: 0 };
    } catch (error) {
      console.error('[SunnyBusinessSearch] Dynamic search failed:', error);
      throw error;
    }
  };

  /**
   * 加载动态配置
   */
  const loadDynamicConfig = async () => {
    if (!props.cNum) return;
    
    loading.value = true;
    try {
      const res = await axios.post('/core/assDialog/openInit', { cNum: props.cNum });
      if (res.data?.result) {
        const mappedConfig = mapDynamicConfig(res.data.result as DynamicConfigResponse);
        
        // 注入动态搜索函数
        mappedConfig.searchApi = dynamicSearchProxy;
        
        currentConfig.value = mappedConfig;
      }
    } catch (error) {
      console.error('[SunnyBusinessSearch] Failed to load dynamic config:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 加载静态配置
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
   */
  const handleOpen = async () => {
    visible.value = true;
    
    // 如果已有配置且不是强制刷新，可考虑缓存。这里简化为每次打开检查
    // 优先动态配置
    if (props.cNum) {
      // 简单缓存：如果已经加载过且 cNum 没变，可以不重新加载
      // 这里为了保证数据实时性，每次打开都重新加载配置，或者可以加一个 loaded 标志
      if (!currentConfig.value.title) { // 简单判断是否已加载
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
   */
  const handleConfirm = (rows: any[]) => {
    selectedValues.value = rows;
    visible.value = false;
  };

  /**
   * 监听 cNum 或 type 变化，重置配置
   */
  watch(() => [props.cNum, props.type], () => {
    currentConfig.value = {};
  });

  return {
    visible,
    loading,
    currentConfig,
    selectedValues,
    handleOpen,
    handleConfirm
  };
}
