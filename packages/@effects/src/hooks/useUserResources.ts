/**
 * 通用资源获取 Hook
 * 根据 cModnumb 获取资源按钮列表
 */
import { ref, onMounted } from 'vue';
import { requestClient } from '../api/request';

interface ResourceResult {
  code: number;
  result: {
    resButtonList: {
      [key: string]: any[];
    };
  };
  message?: string;
}

interface UseUserResourcesOptions {
  cModnumb: string;
}

/**
 * 获取用户资源
 * @param cModnumb - 模块编号
 * @returns 资源按钮列表
 */
export function useUserResources(cModnumb: string) {
  const loading = ref(false);
  const resourceButtons = ref<ResourceResult['result']['resButtonList']>({});

  const fetchResources = async () => {
    loading.value = true;
    try {
      const res = await requestClient.post<ResourceResult>('/core/contact/getCurrentUserResourcesByParId', {
        modnumb: cModnumb
      });

      if (res.code === 200 && res.result) {
        // 返回完整的按钮列表
        resourceButtons.value = res.result.resButtonList || {};
      }
    } catch (error) {
      console.error('[useUserResources] 获取资源配置失败:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (cModnumb) {
      fetchResources();
    }
  });

  return {
    loading,
    resourceButtons,
    fetchResources
  };
}

/**
 * 默认导出
 */
export default useUserResources;