/**
 * 执行器信息VO
 */
export interface JobGroupVO {
  /**
   * Appname
   */
  appname: string;
  /**
   * 名称
   */
  title: string;
  /**
   * 注册方式
   */
  addressType: string;
  /**
   * OnLine地址列表
   */
  addressList: string;
}