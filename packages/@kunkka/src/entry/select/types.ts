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
}
