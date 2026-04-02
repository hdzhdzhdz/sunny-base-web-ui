/**
 * 其他权限查询参数
 */
export interface OtherPermissionsQueryParams {
  pageNo: number;
  pageSize: number;
  authExres: {
    cExresnum?: string;   // 权限编号
    cExresname?: string;  // 权限名称
    nParent: number;      // 父级ID，写死为0
  };
}

/**
 * 其他权限VO
 */
export interface OtherPermissionsVO {
  id: string;          // 权限id
  cExresnum: string;   // 权限编号
  cExresname: string;  // 权限名称
  cOrg: string;        // 所属组织
  dCredate: string;    // 创建日期
  cCreateName: string; // 创建人
  nOrder: number;      // 排序
}

/**
 * 其他权限表单VO
 */
export interface OtherPermissionsFormVO {
  cExresnum: string;   // 权限编号
  cExresname: string;  // 权限名称
  cOrg: string;        // 所属组织
  nOrder?: number;     // 排序
}