/**
 * 查询方案API接口
 */
export interface SearchPlanApi {
  /**
   * 根据资源id获取查询方案
   */
  findAllByResourceid: (data: any) => Promise<any>;
  
  /**
   * 获取查询方案数据
   */
  findSearchPlanColsByPlanId: (data: any) => Promise<any>;
  
  /**
   * 新增查询方案
   */
  insert: (data: any) => Promise<any>;
  
  /**
   * 修改查询方案
   */
  update: (data: any) => Promise<any>;
  
  /**
   * 删除查询方案
   */
  del: (data: any) => Promise<any>;
  
  /**
   * 根据资源id获取默认方案的值
   */
  findDefSearchPlan: (data: any) => Promise<any>;
}

/**
 * 默认的API实现（需要用户提供具体实现）
 */
export const defaultSearchPlanApi: SearchPlanApi = {
  findAllByResourceid: async () => ({ data: [] }),
  findSearchPlanColsByPlanId: async () => ({ data: {} }),
  insert: async () => ({}),
  update: async () => ({}),
  del: async () => ({}),
  findDefSearchPlan: async () => ({ data: {} })
};