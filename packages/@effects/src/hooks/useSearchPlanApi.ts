import { requestClient } from '@sunny-base-web/effects';

/**
 * 查询方案 API 实现
 * 所有模块通用的查询方案 API 配置
 */
export const useSearchPlanApi = () => {
  return {
    findAllByResourceid: (data: any) => requestClient.post('/core/assSearchplan/findAllByResourceid', data),
    findSearchPlanColsByPlanId: (data: any) => requestClient.post('/core/assSearchplan/findSearchPlanColsByPlanId', data),
    insert: (data: any) => requestClient.post('/core/assSearchplan/insert', data),
    update: (data: any) => requestClient.post('/core/assSearchplan/update', data),
    del: (data: any) => requestClient.post('/core/assSearchplan/delete', data),
    findDefSearchPlan: (data: any) => requestClient.post('/core/assSearchplan/findDefSearchPlan', data)
  };
};

/**
 * 导出查询方案 API 实例
 */
export const searchPlanApi = useSearchPlanApi();
