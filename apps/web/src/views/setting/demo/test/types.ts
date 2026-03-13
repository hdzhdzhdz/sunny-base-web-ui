/**
 * 测试查询页面类型定义
 */

/**
 * 测试查询参数
 */
export interface TestQueryParams {
  pageNo: number;
  pageSize: number;
  testEntity: {
    cName?: string;      // 姓名
    cCrenumb?: string;   // 创建人工号
    nZt?: number | null; // 状态
    dCredate?: string[]; // 创建日期范围
  };
}

/**
 * 测试数据VO
 */
export interface TestVO {
  id: number;                // ID
  cName: string;             // 姓名
  dCredate: string | null;   // 创建日期
  cCrenumb: string | null;   // 创建人工号
  cName1: string | null;
  cName2: string | null;
  nZt: number | null;        // 状态
  nDict: number | null;      // 字典
  cName3: string | null;
  nNum: number | null;
  langSuffix: string | null;
}
