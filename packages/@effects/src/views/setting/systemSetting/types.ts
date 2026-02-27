/**
 * 系统设置类型定义
 */

/**
 * 系统设置表单数据
 */
export interface SystemSettingForm {
  /** 初始密码 */
  initialPassword: string
  /** 弱密码列表 */
  weakPasswords: string[]
  /** 子级菜单图标显示 */
  showSubMenuIcon: boolean
  /** 智能体是否显示 */
  showAgent: boolean
  /** 智能体地址 */
  agentUrl: string
  /** 智能体 Token */
  agentToken: string
}

/**
 * 弱密码项
 */
export interface WeakPasswordItem {
  id: string
  password: string
}
