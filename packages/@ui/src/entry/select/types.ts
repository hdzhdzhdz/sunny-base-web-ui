export interface SelectOption {
  /**
   * 选项值
   * @en Option value
   */
  value: string | number;
  /**
   * 选项标签
   * @en Option label
   */
  label: string;
  /**
   * 是否禁用
   * @en Whether to disable
   */
  disabled?: boolean;
  /**
   * 选项元数据，用于过滤显示条件
   * 例如：{ company: 1400 } 表示只有在 filterModel.company == 1400 时才显示该选项
   */
  cMeta?: Record<string, any>;
  [key: string]: any;
}

export type MatchStrategy = 'label' | 'value' | 'both';

export interface BatchSelectProps {
  /**
   * 绑定值
   * @en Selected values
   */
  modelValue?: (string | number)[];
  /**
   * 选项列表
   * @en Options list
   */
  options?: SelectOption[];
  /**
   * 粘贴匹配策略
   * - 'label': 仅匹配标签
   * - 'value': 仅匹配值
   * - 'both': 同时匹配标签和值，优先匹配值
   * @en Paste matching strategy
   * @default 'both'
   */
  matchStrategy?: MatchStrategy;
  /**
   * 过滤上下文模型（环境上下文）
   */
  filterModel?: Record<string, any>;
}

export interface SunnySelectProps {
  /**
   * 绑定值
   */
  modelValue?: string | number | boolean | Record<string, any> | (string | number | boolean | Record<string, any>)[];
  /**
   * 选项列表
   */
  options?: SelectOption[];
  /**
   * 过滤上下文模型（环境上下文）
   * 这是一个对象，包含了当前的上下文信息，例如 { company: 1400, role: 'admin' }。
   * 组件会将选项的 cMeta 与此对象进行比对。
   */
  filterModel?: Record<string, any>;
}
