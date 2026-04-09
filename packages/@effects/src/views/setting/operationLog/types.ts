/**
 * 操作日志查询参数
 */
export interface OperationLogQueryParams {
  pageNo: number;
  pageSize: number;
  assUserOperationLog: {
    cModname?: string;      // 模块名称
    cSystem?: string;       // 所属系统
    cDanju?: string;        // 单据号
    cUser?: string;         // 用户工号
    dCreatelist?: string[]; // 操作日期范围
  };
}

/**
 * 操作日志VO
 */
export interface OperationLogVO {
  id: number;
  cModname: string;      // 模块名称
  cDanju: string;        // 单据号
  cDongzuo: string;      // 描述
  cUser: string;         // 用户工号
  cUsername: string;     // 用户名称
  dCreate: string;       // 操作时间
  cSystem: string;       // 所属系统
  cUrl: string;          // 接口地址
  cMethod: string;       // 接口服务方法
  nSecond: number;       // 执行时间(秒)
}
