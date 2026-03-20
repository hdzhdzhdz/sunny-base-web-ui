/**
 * 调度日志信息VO
 */
export interface JobLogVO {
  /**
   * 任务ID
   */
  jobld: string | number;
  /**
   * 任务描述
   */
  jobDesc: string;
  /**
   * 调度结果
   */
  triggerCode: string;
  /**
   * 调度时间
   */
  triggerTime: string;
  /**
   * 本次执行地址
   */
  executorAddress: string;
  /**
   * 执行任务
   */
  executorHandler: string;
  /**
   * 执行参数
   */
  executorParam: string;
  /**
   * 调度备注
   */
  handleDdbz: string;
  /**
   * 执行时间
   */
  handleTime: string;
  /**
   * 执行结果
   */
  handleCode: string;
  /**
   * 执行备注
   */
  handleMsg: string;
  /**
   * 执行日志
   */
  handleZxrz: string;
}