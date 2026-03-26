/**
 * 角色信息VO
 */
export interface RoleVO {
  /**
   * ID
   */
  id: string;
  /**
   * 角色编号
   */
  cRolenumb: string;
  /**
   * 角色名称
   */
  cRolename: string;
  /**
   * 所属系统
   */
  CSystem: string;
  /**
   * 所属组织
   */
  corg: string;
  /**
   * 所属类型
   */
  сType: string;
  /**
   * 敏感角色
   */
  nSensitive: string;
  /**
   * 创建人
   */
  cCrename: string;
  /**
   * 创建时间
   */
  dCredate: string;
}

/**
 * 角色查询参数
 */
export interface RoleQueryParams {
  /**
   * 页码
   */
  pageNo: number;
  /**
   * 每页大小
   */
  pageSize: number;
  /**
   * 角色信息
   */
  authRole: {
    /**
     * 角色编号
     */
    cRolenumb?: string;
    /**
     * 角色名称
     */
    cRolename?: string;
    /**
     * 所属系统
     */
    CSystem?: string;
    /**
     * 所属组织
     */
    corg?: string;
    /**
     * 所属类型
     */
    сType?: string;
  };
}