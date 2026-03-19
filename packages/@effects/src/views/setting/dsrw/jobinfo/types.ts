/**
 * 定时任务信息VO
 */
export interface JobInfoVO {
  /**
   * 任务id
   */
  id: string | number;
  /**
   * 任务描述
   */
  jobDesc: string;
  /**
   * 执行器
   */
  jobGroupTitle: string;
  /**
   * 调度类型
   */
  scheduleType: string;
  /**
   * 运行模式
   */
  glueType: string;
  /**
   * 负责人
   */
  author: string;
  /**
   * 状态
   */
  triggerStatus: string;
}